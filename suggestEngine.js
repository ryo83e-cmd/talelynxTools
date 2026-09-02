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

    // エディタ枠の overflow:hidden や重なり順に邪魔されないよう最前面(body直下)に追加
    document.body.appendChild(this.container);
  }

  bindEvents() {
    // 入力キーの監視
    this.editor.addEventListener('keydown', (e) => {
      // Ctrl + Space (または Cmd + Space) でトリガー
      if ((e.ctrlKey || e.metaKey) && (e.code === 'Space' || e.key === ' ')) {
        e.preventDefault();
        this.triggerSuggest();
        return;
      }

      // ドロップダウン開いている時のキー操作
      if (this.isOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          this.navigate(1);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          this.navigate(-1);
        } else if (e.key === 'Enter' || e.key === 'Tab') {
          e.preventDefault();
          this.applySelected();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          this.close();
        }
      }
    });

    // 画面外クリックで閉じる処理（mousedownではなくclickで判定し、即時クローズ事故を防止）
    document.addEventListener('click', (e) => {
      if (!this.isOpen) return;
      const testBtn = document.getElementById('testSuggestBtn');
      
      // ポップアップ本体、エディタ本体、または起動ボタン内のクリック時は閉じない
      if (this.container.contains(e.target) || e.target === this.editor || (testBtn && testBtn.contains(e.target))) {
        return;
      }
      this.close();
    });
  }

  // 文脈（シンタックス）解析を行い、候補リストを構築
  triggerSuggest() {
    const text = this.editor.value;
    const pos = this.editor.selectionStart || 0;
    const textBefore = text.slice(0, pos);
    const textAfter = text.slice(pos);
    const mode = this.getCurrentMode ? this.getCurrentMode() : 'image';

    const items = [];

    // --- 文脈判定1: 強調構文 '**' が開いたままか判定 ---
    const boldOpenMatches = (textBefore.match(/\*\*/g) || []).length;
    const isInsideBold = boldOpenMatches % 2 !== 0;
    if (isInsideBold) {
      items.push({
        label: '** (太字を閉じる)',
        insert: '**',
        desc: '構文補完: 太字の終了'
      });
    }

    // --- 文脈判定2: 重み付け括弧 '(' の閉じ判定 ---
    const lastParenOpen = textBefore.lastIndexOf('(');
    const lastParenClose = textBefore.lastIndexOf(')');
    if (lastParenOpen > lastParenClose) {
      items.push(
        { label: ':1.2) (重み強化して閉じる)', insert: ':1.2)', desc: '強調構文' },
        { label: ':0.8) (重み弱化して閉じる)', insert: ':0.8)', desc: '弱化構文' },
        { label: ') (括弧を閉じる)', insert: ')', desc: '構文補完' }
      );
    }

    // --- 文脈判定3: 行頭の '#'（見出し入力中） ---
    const lastLineBreak = textBefore.lastIndexOf('\n');
    const currentLineBefore = lastLineBreak === -1 ? textBefore : textBefore.slice(lastLineBreak + 1);
    if (/^#{1,3}\s*$/.test(currentLineBefore)) {
      items.push(
        { label: '【基本情報】', insert: '【基本情報】\n名前: \n年齢: ', desc: '見出し展開' },
        { label: '【外見】', insert: '【外見】\n身長: \n服装: ', desc: '見出し展開' },
        { label: '【口調】', insert: '【口調】\n一人称: \n特徴: ', desc: '見出し展開' }
      );
    }

    // --- 文脈判定4: 入力途中の単語または辞書マッチング ---
    const wordMatch = textBefore.match(/([a-zA-Z0-9_\u3040-\u30ff\u4e00-\u9fa5]+)$/);
    const query = wordMatch ? wordMatch[1].toLowerCase() : '';

    const dictionary = (typeof SUGGEST_DATA !== 'undefined' && SUGGEST_DATA[mode]) ? SUGGEST_DATA[mode] : [];

    if (query) {
      const filtered = dictionary.filter(item => 
        item.label.toLowerCase().includes(query) || (item.desc && item.desc.toLowerCase().includes(query))
      );
      items.push(...filtered);
    } else {
      // 単語入力がない場合は辞書リストを全件提示
      items.push(...dictionary);
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

    // 単語入力時の被り文字置換
    const wordMatch = textBefore.match(/([a-zA-Z0-9_\u3040-\u30ff\u4e00-\u9fa5]+)$/);
    if (wordMatch && !insertText.startsWith(':') && !insertText.startsWith(')') && !insertText.startsWith('**')) {
      removeLength = wordMatch[1].length;
    }

    const startPos = pos - removeLength;
    this.editor.value = text.slice(0, startPos) + insertText + textAfter;
    this.editor.selectionStart = this.editor.selectionEnd = startPos + insertText.length;
    this.editor.focus();

    // エディタに変更イベントを発火させてハイライト等を再計算
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
