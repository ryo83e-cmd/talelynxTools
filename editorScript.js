document.addEventListener('DOMContentLoaded', () => {
  const editor = document.getElementById('promptEditor');
  const highlightCode = document.getElementById('highlightCode');
  const highlightLayer = document.querySelector('.highlight-layer');
  const lineNumbers = document.getElementById('lineNumbers');
  const charCount = document.getElementById('charCount');
  const copyBtn = document.getElementById('copyBtn');
  const quickChipsContainer = document.getElementById('quickChipsContainer');
  const tooltip = document.getElementById('selectionTooltip');
  const undoBtn = document.getElementById('undoBtn');
  const redoBtn = document.getElementById('redoBtn');

  const modeImageBtn = document.getElementById('modeImage');
  const modeRoleplayBtn = document.getElementById('modeRoleplay');
  const openApiBtn = document.getElementById('openApiBtn');
  const closeApiBtn = document.getElementById('closeApiBtn');
  const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
  const apiModal = document.getElementById('apiModal');
  const apiKeyInput = document.getElementById('apiKeyInput');

  const boldBtn = document.getElementById('boldBtn');
  const weightBtn = document.getElementById('weightBtn');
  const clearBtn = document.getElementById('clearBtn');
  const aiBtn = document.getElementById('aiBtn');
  const saveTxtBtn = document.getElementById('saveTxtBtn');
  const saveMdBtn = document.getElementById('saveMdBtn');

  const searchModal = document.getElementById('searchModal');
  const searchInput = document.getElementById('searchInput');
  const closeSearchBtn = document.getElementById('closeSearchBtn');
  const executeSearchBtn = document.getElementById('executeSearchBtn');

  let currentMode = 'image';
  let undoStack = [];
  let redoStack = [];
  const MAX_HISTORY = 100;
  let saveDebounceTimer = null;

  const STORAGE_KEYS = {
    image: 'editor_content_image',
    roleplay: 'editor_content_roleplay',
    mode: 'editor_saved_mode'
  };

  // ハイライト描画の更新
  function updateHighlight() {
    if (!editor || !highlightCode) return;
    const text = editor.value;
    // 空行で末尾が消えないように調整
    highlightCode.textContent = text.endsWith('\n') ? text + ' ' : text;
    if (window.Prism) {
      Prism.highlightElement(highlightCode);
    }
  }

  // モード切替
  function setMode(mode, shouldPersist = true, isInitialLoad = false) {
    if (!isInitialLoad && currentMode && editor) {
      localStorage.setItem(STORAGE_KEYS[currentMode], editor.value);
    }

    currentMode = mode;
    if (shouldPersist) {
      localStorage.setItem(STORAGE_KEYS.mode, mode);
    }

    if (modeImageBtn) modeImageBtn.classList.toggle('active', mode === 'image');
    if (modeRoleplayBtn) modeRoleplayBtn.classList.toggle('active', mode === 'roleplay');

    const loadedContent = localStorage.getItem(STORAGE_KEYS[mode]) || '';
    if (editor) editor.value = loadedContent;

    undoStack = [loadedContent];
    redoStack = [];
    updateUndoRedoUI();

    if (quickChipsContainer) {
      quickChipsContainer.innerHTML = '';
      if (mode === 'image') {
        renderChips([
          { label: '高品質タグ', text: '(masterpiece, best quality, ultra detailed:1.2)' },
          { label: '基本構図', text: '1girl, solo, masterpiece' },
          { label: '背景・光', text: 'detailed background, cinematic lighting' },
          { label: 'ネガティブ定番', text: 'lowres, bad anatomy, bad hands, text' }
        ]);
      } else {
        renderChips([
          { label: '口調・性格指定', text: '【キャラクター設定】\n一人称: 私\n口調: 丁寧で知的なトーン' },
          { label: 'シチュエーション', text: '【状況】\nユーザーと静かなカフェで会話している。' },
          { label: '出力ルール', text: '【制約】\n・3行以内で簡潔に応答する\n・感情豊かな表現を入れる' }
        ]);
      }
    }

    updateHighlight();
    updateLinesAndStats();
    updateSelection();
  }

  function renderChips(chips) {
    chips.forEach(c => {
      const chip = document.createElement('div');
      chip.className = 'chip';
      chip.textContent = c.label;
      chip.onclick = () => insertText(c.text);
      quickChipsContainer.appendChild(chip);
    });
  }

  // 履歴スタック
  function pushHistory(newText) {
    if (undoStack.length > 0 && undoStack[undoStack.length - 1] === newText) return;
    undoStack.push(newText);
    if (undoStack.length > MAX_HISTORY) undoStack.shift();
    redoStack = [];
    updateUndoRedoUI();
  }

  function undo() {
    if (undoStack.length > 1) {
      const current = undoStack.pop();
      redoStack.push(current);
      const prev = undoStack[undoStack.length - 1];
      editor.value = prev;
      persistContent();
      updateHighlight();
      updateLinesAndStats();
      updateUndoRedoUI();
    }
  }

  function redo() {
    if (redoStack.length > 0) {
      const next = redoStack.pop();
      undoStack.push(next);
      editor.value = next;
      persistContent();
      updateHighlight();
      updateLinesAndStats();
      updateUndoRedoUI();
    }
  }

  function updateUndoRedoUI() {
    if (undoBtn) undoBtn.disabled = undoStack.length <= 1;
    if (redoBtn) redoBtn.disabled = redoStack.length === 0;
  }

  function handleInput() {
    pushHistory(editor.value);
    clearTimeout(saveDebounceTimer);
    saveDebounceTimer = setTimeout(() => {
      persistContent();
    }, 300);
    updateHighlight();
    updateLinesAndStats();
  }

  function persistContent() {
    if (editor) localStorage.setItem(STORAGE_KEYS[currentMode], editor.value);
  }

  // スクロール同期（行番号 ＆ ハイライト層 ＆ テキストエリア）
  function syncScroll() {
    if (!editor) return;
    if (lineNumbers) {
      lineNumbers.scrollTop = editor.scrollTop;
    }
    if (highlightLayer) {
      highlightLayer.scrollTop = editor.scrollTop;
      highlightLayer.scrollLeft = editor.scrollLeft;
    }
  }

  function updateLinesAndStats() {
    if (!editor) return;
    const text = editor.value;
    const chars = text.length;
    const lines = text.split('\n').length;

    if (lineNumbers) {
      let lineNumStr = '';
      for (let i = 1; i <= lines; i++) {
        lineNumStr += i + '\n';
      }
      lineNumbers.textContent = lineNumStr;
    }
    if (charCount) {
      charCount.textContent = `文字数: ${chars} | 行数: ${lines}`;
    }
  }

// 選択文字数表示（テキストエリア直上右端）
  function updateSelection() {
    if (!editor || !tooltip) return;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selectedLen = Math.abs(end - start);

    if (selectedLen > 0) {
      tooltip.textContent = `選択中: ${selectedLen}文字`;
      tooltip.style.display = 'inline-block';
    } else {
      tooltip.style.display = 'none';
    }
  }

  function insertText(str) {
    if (!editor) return;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const text = editor.value;
    
    editor.value = text.substring(0, start) + str + text.substring(end);
    editor.selectionStart = editor.selectionEnd = start + str.length;
    editor.focus();

    pushHistory(editor.value);
    persistContent();
    updateHighlight();
    updateLinesAndStats();
  }

  function wrapText(before, after) {
    if (!editor) return;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const text = editor.value;
    const selected = text.substring(start, end);
    const replacement = before + selected + after;
    
    editor.value = text.substring(0, start) + replacement + text.substring(end);
    editor.selectionStart = start + before.length;
    editor.selectionEnd = end + before.length;
    editor.focus();

    pushHistory(editor.value);
    persistContent();
    updateHighlight();
    updateLinesAndStats();
  }

  function clearEditor() {
    if (!editor) return;
    if (confirm('エディタの内容をクリアしますか？')) {
      editor.value = '';
      pushHistory('');
      persistContent();
      updateHighlight();
      updateLinesAndStats();
    }
  }

  function copyText() {
    if (!editor) return;
    editor.select();
    navigator.clipboard.writeText(editor.value).then(() => {
      if (copyBtn) {
        copyBtn.textContent = 'コピーしました！';
        copyBtn.classList.add('copied');
        setTimeout(() => {
          copyBtn.textContent = 'テキストをコピー';
          copyBtn.classList.remove('copied');
        }, 2000);
      }
    });
  }

  function downloadFile(extension) {
    if (!editor) return;
    const text = editor.value;
    if (!text.trim()) {
      alert('保存するテキストがありません。');
      return;
    }
    const now = new Date();
    const dateStr = now.toISOString().slice(0,10).replace(/-/g,'');
    const filename = `prompt_${currentMode}_${dateStr}.${extension}`;
    const mimeType = extension === 'md' ? 'text/markdown;charset=utf-8' : 'text/plain;charset=utf-8';

    const blob = new Blob([text], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function openApiModal() {
    if (apiModal && apiKeyInput) {
      apiKeyInput.value = localStorage.getItem('gemini_api_key') || '';
      apiModal.style.display = 'flex';
    }
  }

  function closeApiModal() {
    if (apiModal) apiModal.style.display = 'none';
  }

  function saveApiKey() {
    if (apiKeyInput) {
      const key = apiKeyInput.value.trim();
      localStorage.setItem('gemini_api_key', key);
      alert('APIキーを保存しました！');
      closeApiModal();
    }
  }

  function openSearchModal() {
    if (searchModal && searchInput) {
      searchModal.style.display = 'flex';
      searchInput.focus();
      searchInput.select();
    }
  }

  function closeSearchModal() {
    if (searchModal) searchModal.style.display = 'none';
    if (editor) editor.focus();
  }

  function executeSearch() {
    if (!editor || !searchInput) return;
    const query = searchInput.value;
    if (!query) return;

    const text = editor.value;
    const currentPos = editor.selectionEnd;
    
    let index = text.indexOf(query, currentPos);
    if (index === -1) index = text.indexOf(query, 0);

    if (index !== -1) {
      editor.focus();
      editor.setSelectionRange(index, index + query.length);
      const linesBefore = text.substring(0, index).split('\n').length;
      editor.scrollTop = (linesBefore - 3) * 20;
    } else {
      alert('見つかりませんでした。');
    }
  }

  async function enhancePrompt() {
    const apiKey = localStorage.getItem('gemini_api_key');
    if (!apiKey) {
      alert('右上の「⚙️ API設定」からGemini API Keyを設定してください。');
      openApiModal();
      return;
    }

    const rawOriginalText = editor.value;
    const promptTextForApi = rawOriginalText.trim();
    
    if (!promptTextForApi) {
      alert('ブラッシュアップするプロンプトを入力してください。');
      return;
    }

    if (aiBtn) {
      aiBtn.textContent = '✨ AI思考中...';
      aiBtn.disabled = true;
    }

    let systemInstruction = "";
    if (currentMode === 'image') {
      systemInstruction = "あなたはプロンプト最適化エンジニアです。入力された画像生成プロンプトの品質向上とタグ最適化を行ってください。\n\n【厳守事項】\n1. ユーザーが明示した固有条件（色、服装、髪型、構図、数値、固有名詞、特定のタグ等）を絶対に削除・改変・抽象化しないでください。\n2. 既存の意図を完全に保護した上で、品質タグの追加や表現の洗練を行ってください。\n3. 解説や挨拶は一切出力せず、最適化されたプロンプトのみを出力してください。";
    } else {
      systemInstruction = "あなたはシステムプロンプト設計者です。入力されたロールプレイやキャラクター設定を洗練させてください。\n\n【厳守事項】\n1. ユーザーが指定した固有名詞、年齢、口調ルール、世界観設定、制約条件を絶対に削除・一般化・矛盾化しないでください。\n2. 既存の設定意図を最優先で維持し、解像度向上と構造整理のみを行ってください。\n3. 解説や挨拶は一切出力せず、洗練されたプロンプト本文のみを出力してください。";
    }

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptTextForApi }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] }
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const errMsg = errData.error?.message || `HTTPエラー: ${response.status}`;
        throw new Error(errMsg);
      }

      const data = await response.json();
      if (data.candidates && data.candidates[0].content) {
        const refinedText = data.candidates[0].content.parts[0].text.trim();
        pushHistory(rawOriginalText);
        editor.value = refinedText;
        pushHistory(refinedText);
        persistContent();
        updateHighlight();
        updateLinesAndStats();
      } else {
        throw new Error('AIからの応答データ形式が正しくありません。');
      }
    } catch (err) {
      console.error(err);
      alert(`ブラッシュアップに失敗しました。\n詳細: ${err.message}`);
    } finally {
      if (aiBtn) {
        aiBtn.textContent = '✨ AIブラッシュアップ';
        aiBtn.disabled = false;
      }
    }
  }

  // イベントリスナー
  if (editor) {
    editor.addEventListener('input', handleInput);
    editor.addEventListener('scroll', syncScroll);
    editor.addEventListener('select', updateSelection);
    editor.addEventListener('mouseup', updateSelection);
    editor.addEventListener('keyup', updateSelection);

    editor.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        insertText('  ');
        return;
      }
      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();
        if (key === 'z') {
          e.preventDefault();
          if (e.shiftKey) redo();
          else undo();
        } else if (key === 'y') {
          e.preventDefault();
          redo();
        } else if (key === 'f') {
          e.preventDefault();
          openSearchModal();
        } else if (key === 's') {
          e.preventDefault();
          downloadFile('txt');
        }
      }
    });
  }

  if (modeImageBtn) modeImageBtn.addEventListener('click', () => setMode('image'));
  if (modeRoleplayBtn) modeRoleplayBtn.addEventListener('click', () => setMode('roleplay'));
  if (boldBtn) boldBtn.addEventListener('click', () => wrapText('**', '**'));
  if (weightBtn) weightBtn.addEventListener('click', () => wrapText('(', ':1.2)'));
  if (undoBtn) undoBtn.addEventListener('click', undo);
  if (redoBtn) redoBtn.addEventListener('click', redo);
  if (clearBtn) clearBtn.addEventListener('click', clearEditor);
  if (aiBtn) aiBtn.addEventListener('click', enhancePrompt);
  if (copyBtn) copyBtn.addEventListener('click', copyText);
  if (saveTxtBtn) saveTxtBtn.addEventListener('click', () => downloadFile('txt'));
  if (saveMdBtn) saveMdBtn.addEventListener('click', () => downloadFile('md'));

  if (openApiBtn) openApiBtn.addEventListener('click', openApiModal);
  if (closeApiBtn) closeApiBtn.addEventListener('click', closeApiModal);
  if (saveApiKeyBtn) saveApiKeyBtn.addEventListener('click', saveApiKey);

  if (closeSearchBtn) closeSearchBtn.addEventListener('click', closeSearchModal);
  if (executeSearchBtn) executeSearchBtn.addEventListener('click', executeSearch);
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        executeSearch();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeSearchModal();
      }
    });
  }

  window.addEventListener('click', (e) => {
    if (e.target === apiModal) closeApiModal();
    if (e.target === searchModal) closeSearchModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeSearchModal();
      closeApiModal();
    }
  });

  const savedMode = localStorage.getItem(STORAGE_KEYS.mode) || 'image';
  setMode(savedMode, false, true);
});
