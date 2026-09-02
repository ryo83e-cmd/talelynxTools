// ========================================================
// サジェスト制御エンジン (suggestEngine.js)
// ========================================================
class SuggestEngine {
  constructor(editor, getCurrentModeCallback) {
    this.editor = editor;
    this.getCurrentMode = getCurrentModeCallback;
    this.container = null;
    this.listElement = null;
    this.selectedIndex = 0;
    this.currentItems = [];
    this.isOpen = false;

    this.initUI();
    this.bindEvents();
  }

  initUI() {
    this.container = document.createElement('div');
    this.container.className = 'suggest-dropdown';
    this.container.style.display = 'none';

    this.listElement = document.createElement('ul');
    this.listElement.className = 'suggest-list';
    this.container.appendChild(this.listElement);

    document.body.appendChild(this.container);
  }

  bindEvents() {
    this.editor.addEventListener('keydown', (e) => {
      // Ctrl + Space (Cmd + Space)
      if ((e.ctrlKey || e.metaKey) && (e.code === 'Space' || e.key === ' ')) {
        e.preventDefault();
        this.triggerSuggest();
        return;
      }

      if (this.isOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          this.navigate(1);
          return;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          this.navigate(-1);
          return;
        }
        if (e.key === 'Enter' || e.key === 'Tab') {
          e.preventDefault();
          this.applySelected();
          return;
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          this.close();
          return;
        }

        if (['ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'].includes(e.key)) {
          this.close();
        }
      }
    });

    document.addEventListener('mousedown', (e) => {
      if (!this.isOpen) return;
      const testBtn = document.getElementById('testSuggestBtn');
      if (this.container.contains(e.target) || (testBtn && testBtn.contains(e.target))) {
        return;
      }
      this.close();
    });
  }

  triggerSuggest() {
    const text = this.editor.value;
    const pos = this.editor.selectionStart || 0;
    const mode = this.getCurrentMode ? this.getCurrentMode() : 'image';

    const lastLineBreak = text.lastIndexOf('\n', pos - 1);
    const nextLineBreak = text.indexOf('\n', pos);
    const lineStart = lastLineBreak === -1 ? 0 : lastLineBreak + 1;
    const lineEnd = nextLineBreak === -1 ? text.length : nextLineBreak;

    const lineBeforeCursor = text.slice(lineStart, pos);
    const lineAfterCursor = text.slice(pos, lineEnd);

    const items = [];

    // ========================================================
    // 判定A: 何もない行・行頭のとき（箇条書き・見出しのスマート提示）
    // ========================================================
    if (lineBeforeCursor.trim() === '') {
      // 直前の非空行を1行探す
      const prevLines = text.slice(0, lineStart).split('\n');
      let prevLine = '';
      for (let i = prevLines.length - 1; i >= 0; i--) {
        if (prevLines[i].trim() !== '') {
          prevLine = prevLines[i];
          break;
        }
      }

      // 直前が箇条書き行かチェック
      const boldListMatch = prevLine.match(/^(\s*[-*]\s+)\*\*[^*]+:\*\*/);
      const plainListMatch = prevLine.match(/^(\s*[-*]\s+)/);

      if (boldListMatch) {
        // パターン1: 直前が「-   **名前:**」のような定義リスト
        const prefix = boldListMatch[1];
        items.push(
          { label: `${prefix}**項目:** (定義リスト継続)`, insert: `${prefix}**項目:** `, selectRange: [prefix.length + 2, prefix.length + 4], desc: '直前スタイル継承' },
          { label: `${prefix} (シンプルな箇条書き)`, insert: `${prefix}`, desc: 'リスト記号のみ' },
          { label: '### (小見出し)', insert: '### ', desc: 'セクション区切り' }
        );
      } else if (plainListMatch) {
        // パターン2: 直前が通常の「- 」や「* 」箇条書き
        const prefix = plainListMatch[1];
        items.push(
          { label: `${prefix} (箇条書き継続)`, insert: `${prefix}`, desc: '直前スタイル継承' },
          { label: `${prefix}**項目:** (定義リスト開始)`, insert: `${prefix}**項目:** `, selectRange: [prefix.length + 2, prefix.length + 4], desc: '太字見出し付き' },
          { label: '### (小見出し)', insert: '### ', desc: 'セクション区切り' }
        );
      } else {
        // パターン3: 直前が本文、見出し、または文書の先頭
        items.push(
          { label: '### (小見出し)', insert: '### ', desc: '主要セクション' },
          { label: '## (中見出し)', insert: '## ', desc: '大枠カテゴリ' },
          { label: '-   **項目:** (定義リスト開始)', insert: '-   **項目:** ', selectRange: [6, 8], desc: 'プロンプト定型' },
          { label: '- (箇条書き開始)', insert: '- ', desc: 'リスト作成' }
        );
      }

      this.currentItems = items;
      this.render();
      this.open();
      return;
    }

    // ========================================================
    // 判定B: インライン入力中（閉じ構文・マクロ変数・辞書検索）
    // ========================================================

    // 1. アスタリスクの閉じ判定
    const cleanedDouble = lineBeforeCursor.replace(/\*\*/g, '');
    const singleAsteriskCount = (cleanedDouble.match(/\*/g) || []).length;
    const doubleAsteriskCount = (lineBeforeCursor.match(/\*\*/g) || []).length;

    if (doubleAsteriskCount % 2 !== 0 && !lineAfterCursor.startsWith('**')) {
      items.push({ label: '** (太字を閉じる)', insert: '**', desc: 'Markdown太字' });
    }
    if (singleAsteriskCount % 2 !== 0 && !lineAfterCursor.startsWith('*')) {
      items.push({ label: '* (イタリックを閉じる)', insert: '*', desc: 'Markdown斜体' });
    }

    // 2. 波括弧 { } および変数構文 {user} / {{user}}
    const braceMatch = lineBeforeCursor.match(/(\{+)$/);
    const openBracesTotal = (lineBeforeCursor.match(/\{/g) || []).length;
    const closeBracesTotal = (lineBeforeCursor.match(/\}/g) || []).length;

    if (braceMatch || openBracesTotal > closeBracesTotal) {
      const braceCount = braceMatch ? braceMatch[1].length : 0;
      if (braceCount === 1) {
        items.push(
          { label: '{user} (単一波括弧)', insert: 'user}', desc: 'ユーザー変数' },
          { label: '{char} (単一波括弧)', insert: 'char}', desc: 'キャラ変数' },
          { label: '{{user}} (二重波括弧)', insert: '{user}}', desc: 'ユーザー変数' },
          { label: '{{char}} (二重波括弧)', insert: '{char}}', desc: 'キャラ変数' },
          { label: '} (波括弧を閉じる)', insert: '}', desc: '構文補完' }
        );
      } else if (braceCount >= 2) {
        items.push(
          { label: '{{user}}', insert: 'user}}', desc: '二重波括弧変数' },
          { label: '{{char}}', insert: 'char}}', desc: '二重波括弧変数' },
          { label: '}} (二重波括弧を閉じる)', insert: '}}', desc: '構文補完' }
        );
      } else {
        items.push(
          { label: '{{user}}', insert: '{{user}}', desc: '二重波括弧' },
          { label: '{user}', insert: '{user}', desc: '単一波括弧' },
          { label: '}} (二重閉じ)', insert: '}}', desc: '構文補完' },
          { label: '} (単一閉じ)', insert: '}', desc: '構文補完' }
        );
      }
    }

    // 3. 丸括弧 '(' の閉じ判定
    const lastParenOpen = lineBeforeCursor.lastIndexOf('(');
    const lastParenClose = lineBeforeCursor.lastIndexOf(')');
    if (lastParenOpen !== -1 && (lastParenClose === -1 || lastParenOpen > lastParenClose) && !lineAfterCursor.startsWith(')')) {
      if (mode === 'image') {
        items.push(
          { label: ':1.2) (重み強化して閉じる)', insert: ':1.2)', desc: '強調補完' },
          { label: ':0.8) (重み弱化して閉じる)', insert: ':0.8)', desc: '弱化補完' },
          { label: ') (括弧を閉じる)', insert: ')', desc: '構文補完' }
        );
      } else {
        items.push({ label: ') (括弧を閉じる)', insert: ')', desc: '構文補完' });
      }
    }

    // 4. 鉤括弧「 の閉じ判定
    const lastQuoteOpen = lineBeforeCursor.lastIndexOf('「');
    const lastQuoteClose = lineBeforeCursor.lastIndexOf('」');
    if (lastQuoteOpen !== -1 && (lastQuoteClose === -1 || lastQuoteOpen > lastQuoteClose) && !lineAfterCursor.startsWith('」')) {
      items.push({ label: '」 (鍵括弧を閉じる)', insert: '」', desc: '台詞補完' });
    }

    // 5. 単語の辞書マッチング
    const wordMatch = lineBeforeCursor.match(/([a-zA-Z0-9_\u3040-\u30ff\u4e00-\u9fa5]+)$/);
    const query = wordMatch ? wordMatch[1].toLowerCase() : '';

    if (query) {
      const dictionary = (typeof SUGGEST_DATA !== 'undefined' && SUGGEST_DATA[mode]) ? SUGGEST_DATA[mode] : [];
      const matched = dictionary.filter(item => 
        item.label.toLowerCase().includes(query) || (item.desc && item.desc.toLowerCase().includes(query))
      );
      items.push(...matched);
    }

    if (items.length === 0) {
      this.close();
      return;
    }

    this.currentItems = items;
    this.render();
    this.open();
  }

  render() {
    this.listElement.innerHTML = '';
    this.currentItems.forEach((item, index) => {
      const li = document.createElement('li');
      li.className = `suggest-item ${index === this.selectedIndex ? 'active' : ''}`;
      li.innerHTML = `
        <span class="suggest-label">${this.escapeHtml(item.label)}</span>
        ${item.desc ? `<span class="suggest-desc">${this.escapeHtml(item.desc)}</span>` : ''}
      `;
      li.addEventListener('mousedown', (e) => {
        e.preventDefault();
        this.selectedIndex = index;
        this.applySelected();
      });
      this.listElement.appendChild(li);
    });
  }

  navigate(dir) {
    this.selectedIndex = (this.selectedIndex + dir + this.currentItems.length) % this.currentItems.length;
    const items = this.listElement.querySelectorAll('.suggest-item');
    items.forEach((el, idx) => el.classList.toggle('active', idx === this.selectedIndex));
    
    const activeEl = items[this.selectedIndex];
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }

  applySelected() {
    const selected = this.currentItems[this.selectedIndex];
    if (!selected) return;

    const text = this.editor.value;
    const pos = this.editor.selectionStart;
    const textBefore = text.slice(0, pos);
    const textAfter = text.slice(pos);

    let insertText = selected.insert;
    let removeLength = 0;

    const wordMatch = textBefore.match(/([a-zA-Z0-9_\u3040-\u30ff\u4e00-\u9fa5]+)$/);
    const isSpecialSyntax = /^[*:)}」#\-]/.test(insertText) || insertText.startsWith('user') || insertText.startsWith('{user');
    if (wordMatch && !isSpecialSyntax) {
      removeLength = wordMatch[1].length;
    }

    const startPos = pos - removeLength;
    this.editor.value = text.slice(0, startPos) + insertText + textAfter;

    // 項目名があらかじめ選択される範囲指定がある場合、そこを選択状態にする
    if (selected.selectRange) {
      this.editor.selectionStart = startPos + selected.selectRange[0];
      this.editor.selectionEnd = startPos + selected.selectRange[1];
    } else {
      this.editor.selectionStart = this.editor.selectionEnd = startPos + insertText.length;
    }

    this.editor.focus();
    this.editor.dispatchEvent(new Event('input'));
    this.close();
  }

  open() {
    this.isOpen = true;
    this.selectedIndex = 0;
    this.container.style.display = 'block';
  }

  close() {
    this.isOpen = false;
    this.container.style.display = 'none';
  }

  escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
