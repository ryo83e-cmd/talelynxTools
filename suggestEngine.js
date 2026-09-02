// ========================================================
// サジェスト制御エンジン (suggestEngine.js) - 構文拡張版
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

    // --- 構文判定1: アスタリスクの閉じ判定 (1個と2個を厳密に分離) ---
    // まず ** を除去した上で単一 * の残数をチェック
    const cleanedDouble = lineBeforeCursor.replace(/\*\*/g, '');
    const singleAsteriskCount = (cleanedDouble.match(/\*/g) || []).length;
    const doubleAsteriskCount = (lineBeforeCursor.match(/\*\*/g) || []).length;

    // 太字 (**) の未閉じ
    if (doubleAsteriskCount % 2 !== 0 && !lineAfterCursor.startsWith('**')) {
      items.push({ label: '** (太字を閉じる)', insert: '**', desc: 'Markdown太字' });
    }
    // 斜体 (*) の未閉じ
    if (singleAsteriskCount % 2 !== 0 && !lineAfterCursor.startsWith('*')) {
      items.push({ label: '* (イタリックを閉じる)', insert: '*', desc: 'Markdown斜体' });
    }

    // --- 構文判定2: 波括弧 { } および変数構文 {user} / {{user}} ---
    const braceMatch = lineBeforeCursor.match(/(\{+)$/);
    const openBracesTotal = (lineBeforeCursor.match(/\{/g) || []).length;
    const closeBracesTotal = (lineBeforeCursor.match(/\}/g) || []).length;

    if (braceMatch || openBracesTotal > closeBracesTotal) {
      const braceCount = braceMatch ? braceMatch[1].length : 0;

      if (braceCount === 1) {
        // { が1つ打たれている場合
        items.push(
          { label: '{user} (単一波括弧)', insert: 'user}', desc: 'ユーザー変数' },
          { label: '{char} (単一波括弧)', insert: 'char}', desc: 'キャラ変数' },
          { label: '{{user}} (二重波括弧に拡張)', insert: '{user}}', desc: 'ユーザー変数' },
          { label: '{{char}} (二重波括弧に拡張)', insert: '{char}}', desc: 'キャラ変数' },
          { label: '} (波括弧を閉じる)', insert: '}', desc: '構文補完' }
        );
      } else if (braceCount >= 2) {
        // {{ が打たれている場合
        items.push(
          { label: '{{user}}', insert: 'user}}', desc: '二重波括弧変数' },
          { label: '{{char}}', insert: 'char}}', desc: '二重波括弧変数' },
          { label: '}} (二重波括弧を閉じる)', insert: '}}', desc: '構文補完' }
        );
      } else {
        // 開き波括弧が文章の前に残っている場合
        items.push(
          { label: '{{user}}', insert: '{{user}}', desc: '二重波括弧' },
          { label: '{user}', insert: '{user}', desc: '単一波括弧' },
          { label: '{{char}}', insert: '{{char}}', desc: '二重波括弧' },
          { label: '{char}', insert: '{char}', desc: '単一波括弧' },
          { label: '}} (二重閉じ)', insert: '}}', desc: '構文補完' },
          { label: '} (単一閉じ)', insert: '}', desc: '構文補完' }
        );
      }
    }

    // --- 構文判定3: 丸括弧 '(' の閉じ判定 ---
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

    // --- 構文判定4: 鉤括弧「 の閉じ判定 ---
    const lastQuoteOpen = lineBeforeCursor.lastIndexOf('「');
    const lastQuoteClose = lineBeforeCursor.lastIndexOf('」');
    if (lastQuoteOpen !== -1 && (lastQuoteClose === -1 || lastQuoteOpen > lastQuoteClose) && !lineAfterCursor.startsWith('」')) {
      items.push({ label: '」 (鍵括弧を閉じる)', insert: '」', desc: '台詞補完' });
    }

    // --- 構文判定5: 入力中単語の辞書マッチ ---
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

    // 単語マッチ時の補完文字重複削除
    const wordMatch = textBefore.match(/([a-zA-Z0-9_\u3040-\u30ff\u4e00-\u9fa5]+)$/);
    const isSpecialSyntax = /^[*:)}」]/.test(insertText) || insertText.startsWith('user}}') || insertText.startsWith('char}}');
    if (wordMatch && !isSpecialSyntax) {
      removeLength = wordMatch[1].length;
    }

    const startPos = pos - removeLength;
    this.editor.value = text.slice(0, startPos) + insertText + textAfter;
    this.editor.selectionStart = this.editor.selectionEnd = startPos + insertText.length;
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
