// ========================================================
// サジェスト制御エンジン (suggestEngine.js) - UX改善版
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
      // Ctrl + Space (Cmd + Space) でサジェスト起動
      if ((e.ctrlKey || e.metaKey) && (e.code === 'Space' || e.key === ' ')) {
        e.preventDefault();
        this.triggerSuggest();
        return;
      }

      // ドロップダウン表示中のキー操作
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

        // 左右キー等でカーソルが移動した場合は閉じる
        if (['ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'].includes(e.key)) {
          this.close();
        }
      }
    });

    // エディタ内を含め、どこをクリックしても（別の場所にカーソルを置いたら）閉じる
    document.addEventListener('mousedown', (e) => {
      if (!this.isOpen) return;
      const testBtn = document.getElementById('testSuggestBtn');
      // ポップアップ本体、または起動ボタン自体のクリック時は閉じない
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

    // 1. カーソルがある「現在の行」のみを抽出して解析
    const lastLineBreak = text.lastIndexOf('\n', pos - 1);
    const nextLineBreak = text.indexOf('\n', pos);
    const lineStart = lastLineBreak === -1 ? 0 : lastLineBreak + 1;
    const lineEnd = nextLineBreak === -1 ? text.length : nextLineBreak;

    const lineBeforeCursor = text.slice(lineStart, pos);
    const lineAfterCursor = text.slice(pos, lineEnd);

    const items = [];

    // --- 構文判定1: 現在行で太字 '**' が閉じられていないか ---
    // カーソル前にある ** の数、カーソル後にある ** の数
    const boldBefore = (lineBeforeCursor.match(/\*\*/g) || []).length;
    const boldAfter = (lineAfterCursor.match(/\*\*/g) || []).length;
    // カーソル前で奇数回開かれていて、直後に閉じる ** がない場合
    if (boldBefore % 2 !== 0 && !lineAfterCursor.startsWith('**')) {
      items.push({
        label: '** (太字を閉じる)',
        insert: '**',
        desc: '構文補完'
      });
    }

    // --- 構文判定2: 丸括弧 '(' が閉じられていないか（画像重み等） ---
    const lastParenOpen = lineBeforeCursor.lastIndexOf('(');
    const lastParenClose = lineBeforeCursor.lastIndexOf(')');
    if (lastParenOpen !== -1 && (lastParenClose === -1 || lastParenOpen > lastParenClose) && !lineAfterCursor.startsWith(')')) {
      if (mode === 'image') {
        items.push(
          { label: ':1.2) (重みを強化して閉じる)', insert: ':1.2)', desc: '強調補完' },
          { label: ':0.8) (重みを弱化して閉じる)', insert: ':0.8)', desc: '弱化補完' },
          { label: ') (括弧を閉じる)', insert: ')', desc: '構文補完' }
        );
      } else {
        items.push({ label: ') (括弧を閉じる)', insert: ')', desc: '構文補完' });
      }
    }

    // --- 構文判定3: 鉤括弧「 が閉じられていないか（ロールプレイ用） ---
    const lastQuoteOpen = lineBeforeCursor.lastIndexOf('「');
    const lastQuoteClose = lineBeforeCursor.lastIndexOf('」');
    if (lastQuoteOpen !== -1 && (lastQuoteClose === -1 || lastQuoteOpen > lastQuoteClose) && !lineAfterCursor.startsWith('」')) {
      items.push({
        label: '」 (鍵括弧を閉じる)',
        insert: '」',
        desc: '台詞補完'
      });
    }

    // --- 構文判定4: 直前に入力中の英数字/単語があるか ---
    const wordMatch = lineBeforeCursor.match(/([a-zA-Z0-9_\u3040-\u30ff\u4e00-\u9fa5]+)$/);
    const query = wordMatch ? wordMatch[1].toLowerCase() : '';

    if (query) {
      const dictionary = (typeof SUGGEST_DATA !== 'undefined' && SUGGEST_DATA[mode]) ? SUGGEST_DATA[mode] : [];
      const matched = dictionary.filter(item => 
        item.label.toLowerCase().includes(query) || (item.desc && item.desc.toLowerCase().includes(query))
      );
      items.push(...matched);
    }

    // 補完すべき対象（閉じタグや単語マッチ）が1件もなければ、勝手にテンプレートを出さずに終了
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

    // 辞書マッチ（単語補完）のときは入力途中の文字を置き換え
    const wordMatch = textBefore.match(/([a-zA-Z0-9_\u3040-\u30ff\u4e00-\u9fa5]+)$/);
    const isSyntaxClose = insertText.startsWith(':') || insertText.startsWith(')') || insertText.startsWith('**') || insertText.startsWith('」');
    if (wordMatch && !isSyntaxClose) {
      removeLength = wordMatch[1].length;
    }

    const startPos = pos - removeLength;
    this.editor.value = text.slice(0, startPos) + insertText + textAfter;
    this.editor.selectionStart = this.editor.selectionEnd = startPos + insertText.length;
    this.editor.focus();

    // ハイライト更新
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
