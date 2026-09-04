// ========================================================
// AIモデル・エンドポイント設定定数（ここを編集してモデルを変更）
// ========================================================
const AI_CONFIG = {
  gemini: {
    model: 'gemini-3.6-flash',
    endpoint: (key, model) => `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`
  },
  openai: {
    model: 'gpt-4o-mini',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    temperature: 0.7
  }
};

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

  const geminiApiKeyInput = document.getElementById('geminiApiKeyInput');
  const openaiApiKeyInput = document.getElementById('openaiApiKeyInput');
  const geminiModelLabel = document.getElementById('geminiModelLabel');
  const openaiModelLabel = document.getElementById('openaiModelLabel');

  const boldBtn = document.getElementById('boldBtn');
  const weightBtn = document.getElementById('weightBtn');
  const clearBtn = document.getElementById('clearBtn');
  const aiGeminiBtn = document.getElementById('aiGeminiBtn');
  const aiOpenaiBtn = document.getElementById('aiOpenaiBtn');
  const saveTxtBtn = document.getElementById('saveTxtBtn');
  const saveMdBtn = document.getElementById('saveMdBtn');

  const helpModal = document.getElementById('helpModal');
  const openHelpBtn = document.getElementById('openHelpBtn');
  const closeHelpBtn = document.getElementById('closeHelpBtn');
  const closeHelpBottomBtn = document.getElementById('closeHelpBottomBtn');

  const searchModal = document.getElementById('searchModal');
  const searchInput = document.getElementById('searchInput');
  const closeSearchBtn = document.getElementById('closeSearchBtn');
  const executeSearchBtn = document.getElementById('executeSearchBtn');

  let currentMode = 'image';
  // 履歴スタック（カーソル位置追従対応）
  let undoStack = [{ text: '', cursor: 0 }];
  let redoStack = [];
  const MAX_HISTORY = 100;
  let saveDebounceTimer = null;
  let historyDebounceTimer = null;
  let isComposing = false; // 日本語IME変換中フラグ

  const STORAGE_KEYS = {
    image: 'editor_content_image',
    roleplay: 'editor_content_roleplay',
    mode: 'editor_saved_mode',
    geminiKey: 'gemini_api_key',
    openaiKey: 'openai_api_key'
  };

  // モーダル内のモデル名ラベルを定数から自動反映
  if (geminiModelLabel) geminiModelLabel.textContent = `モデル: ${AI_CONFIG.gemini.model}`;
  if (openaiModelLabel) openaiModelLabel.textContent = `モデル: ${AI_CONFIG.openai.model}`;

  // ========================================================
  // ハイライト ＆ 折り返し行番号の安全同期処理
  // ========================================================
  const lineMeasurer = document.createElement('div');
  lineMeasurer.style.cssText = 'position: absolute; visibility: hidden; height: auto; width: 100%; white-space: pre-wrap; word-break: break-all; overflow-wrap: break-word; font-family: Consolas, Monaco, "Courier New", monospace; font-size: 13px; line-height: 20px; box-sizing: border-box; pointer-events: none; top: -9999px;';
  document.body.appendChild(lineMeasurer);

  function sanitizeZeroWidth(str) {
    if (!str) return '';
    return str
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/&(?:ZeroWidthSpace|#8203|#x200B);?/gi, '');
  }

  function updateHighlightAndLineNumbers() {
    if (!editor || !highlightCode || !lineNumbers) return;

    const text = editor.value;
    const cleanText = sanitizeZeroWidth(text);

    highlightCode.textContent = text.endsWith('\n') ? text + ' ' : text;
    if (window.Prism) {
      Prism.highlightElement(highlightCode);
    }

    const computedStyle = window.getComputedStyle(editor);
    const contentWidth = editor.clientWidth - parseFloat(computedStyle.paddingLeft) - parseFloat(computedStyle.paddingRight);
    lineMeasurer.style.width = contentWidth + 'px';

    const lines = text.split('\n');
    let lineNumHtml = '';

    for (let i = 0; i < lines.length; i++) {
      const lineText = lines[i];
      lineMeasurer.textContent = lineText === '' ? ' ' : lineText;
      const h = lineMeasurer.offsetHeight || 20;
      lineNumHtml += `<div class="line-num-item" style="height: ${h}px; line-height: 20px;">${i + 1}</div>`;
    }

    lineNumbers.innerHTML = lineNumHtml;

    if (charCount) {
      charCount.textContent = `文字数: ${text.length} | 行数: ${lines.length}`;
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
    if (editor) {
      editor.value = loadedContent;
      editor.setSelectionRange(0, 0);
    }

    undoStack = [{ text: loadedContent, cursor: 0 }];
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

    updateHighlightAndLineNumbers();
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

  // ==========================================
  // 履歴管理 (Undo / Redo) - ズレ防止・IME対応版
  // ==========================================
  function pushHistory(newText, cursor = null) {
    const targetCursor = cursor !== null ? cursor : (editor ? editor.selectionStart : 0);
    const last = undoStack[undoStack.length - 1];

    if (last && last.text === newText) {
      last.cursor = targetCursor;
      return;
    }

    undoStack.push({ text: newText, cursor: targetCursor });
    if (undoStack.length > MAX_HISTORY) undoStack.shift();
    redoStack = [];
    updateUndoRedoUI();
  }

  function undo() {
    if (undoStack.length <= 1 || !editor) return;

    const current = {
      text: editor.value,
      cursor: editor.selectionStart
    };
    redoStack.push(current);

    undoStack.pop();
    const prev = undoStack[undoStack.length - 1];

    editor.value = prev.text;
    editor.setSelectionRange(prev.cursor, prev.cursor);
    editor.focus();

    persistContent();
    updateHighlightAndLineNumbers();
    updateUndoRedoUI();
    updateSelection();
  }

  function redo() {
    if (redoStack.length === 0 || !editor) return;

    const next = redoStack.pop();
    undoStack.push({
      text: editor.value,
      cursor: editor.selectionStart
    });

    editor.value = next.text;
    editor.setSelectionRange(next.cursor, next.cursor);
    editor.focus();

    persistContent();
    updateHighlightAndLineNumbers();
    updateUndoRedoUI();
    updateSelection();
  }

  function updateUndoRedoUI() {
    if (undoBtn) undoBtn.disabled = undoStack.length <= 1;
    if (redoBtn) redoBtn.disabled = redoStack.length === 0;
  }

  const INVISIBLE_CHARS_REGEX = /[\u200B-\u200D\uFEFF\u00AD\u2060\u180E]|^[\uFEFF\u200B]+/g;

  function cleanString(str) {
    if (!str) return '';
    return str
      .replace(INVISIBLE_CHARS_REGEX, '')
      .replace(/&(?:ZeroWidthSpace|#8203|#x200b);?/gi, '');
  }

  function handleInput() {
    if (isComposing) return; // IME確定前の途中打鍵は保存しない

    const cleaned = cleanString(editor.value);
    if (editor.value !== cleaned) {
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      editor.value = cleaned;
      editor.setSelectionRange(start, end);
    }

    const currentCursor = editor.selectionStart;

    // 入力停止後300msで履歴とローカルストレージを確定
    clearTimeout(historyDebounceTimer);
    historyDebounceTimer = setTimeout(() => {
      pushHistory(editor.value, currentCursor);
    }, 300);

    clearTimeout(saveDebounceTimer);
    saveDebounceTimer = setTimeout(() => {
      persistContent();
    }, 300);

    updateHighlightAndLineNumbers();
  }

  function persistContent() {
    if (editor) localStorage.setItem(STORAGE_KEYS[currentMode], editor.value);
  }

  function syncScroll() {
    if (!editor) return;
    if (lineNumbers) lineNumbers.scrollTop = editor.scrollTop;
    if (highlightLayer) {
      highlightLayer.scrollTop = editor.scrollTop;
      highlightLayer.scrollLeft = editor.scrollLeft;
    }
  }

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
    const nextCursor = start + str.length;
    editor.selectionStart = editor.selectionEnd = nextCursor;
    editor.focus();

    pushHistory(editor.value, nextCursor);
    persistContent();
    updateHighlightAndLineNumbers();
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

    pushHistory(editor.value, editor.selectionEnd);
    persistContent();
    updateHighlightAndLineNumbers();
  }

  function clearEditor() {
    if (!editor) return;
    if (confirm('エディタの内容をクリアしますか？')) {
      editor.value = '';
      pushHistory('', 0);
      persistContent();
      updateHighlightAndLineNumbers();
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
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
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

  // --- API設定モーダル制御 ---
  function openApiModal() {
    if (!apiModal) return;
    if (geminiApiKeyInput) {
      geminiApiKeyInput.value = localStorage.getItem(STORAGE_KEYS.geminiKey) || '';
    }
    if (openaiApiKeyInput) {
      openaiApiKeyInput.value = localStorage.getItem(STORAGE_KEYS.openaiKey) || '';
    }
    apiModal.style.display = 'flex';
  }

  function closeApiModal() {
    if (apiModal) apiModal.style.display = 'none';
  }

  function saveApiKey() {
    const geminiVal = geminiApiKeyInput ? geminiApiKeyInput.value.trim() : '';
    const openaiVal = openaiApiKeyInput ? openaiApiKeyInput.value.trim() : '';

    if (geminiVal) {
      localStorage.setItem(STORAGE_KEYS.geminiKey, geminiVal);
    } else {
      localStorage.removeItem(STORAGE_KEYS.geminiKey);
    }

    if (openaiVal) {
      localStorage.setItem(STORAGE_KEYS.openaiKey, openaiVal);
    } else {
      localStorage.removeItem(STORAGE_KEYS.openaiKey);
    }

    alert('AI連携設定を更新しました！');
    closeApiModal();
  }

  // --- 検索モーダル制御 ---
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

  function openHelpModal() {
    if (helpModal) helpModal.style.display = 'flex';
  }

  function closeHelpModal() {
    if (helpModal) helpModal.style.display = 'none';
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

  // --- AI実行処理 ---
  async function runAiEnhance(provider) {
    const isGemini = provider === 'gemini';
    const apiKey = isGemini 
      ? localStorage.getItem(STORAGE_KEYS.geminiKey) 
      : localStorage.getItem(STORAGE_KEYS.openaiKey);

    const targetBtn = isGemini ? aiGeminiBtn : aiOpenaiBtn;
    const providerName = isGemini ? 'Gemini' : 'ChatGPT';

    if (!apiKey) {
      alert(`「⚙️ API設定」から ${providerName} の API Key を設定してください。`);
      openApiModal();
      return;
    }

    const rawOriginalText = editor.value;
    const originalCursor = editor.selectionStart;
    const promptTextForApi = rawOriginalText.trim();

    if (!promptTextForApi) {
      alert('ブラッシュアップするプロンプトを入力してください。');
      return;
    }

    if (aiGeminiBtn) aiGeminiBtn.disabled = true;
    if (aiOpenaiBtn) aiOpenaiBtn.disabled = true;
    targetBtn.textContent = '✨ 思考中...';

    let systemInstruction = "";
    if (currentMode === 'image') {
      systemInstruction = "あなたはプロンプト最適化エンジニアです。入力された画像生成プロンプトの品質向上とタグ最適化を行ってください。\n\n【厳守事項】\n1. ユーザーが明示した固有条件（色、服装、髪型、構図、数値、固有名詞、特定のタグ等）を絶対に削除・改変・抽象化しないでください。\n2. 既存の意図を完全に保護した上で、品質タグの追加や表現の洗練を行ってください。\n3. 解説や挨拶は一切出力せず、最適化されたプロンプトのみを出力してください。";
    } else {
      systemInstruction = "あなたはシステムプロンプト設計者です。入力されたロールプレイやキャラクター設定を洗練させてください。\n\n【厳守事項】\n1. ユーザーが指定した固有名詞、年齢、口調ルール、世界観設定、制約条件を絶対に削除・一般化・矛盾化しないでください。\n2. 既存の設定意図を最優先で維持し、解像度向上と構造整理のみを行ってください。\n3. 解説や挨拶は一切出力せず、洗練されたプロンプト本文のみを出力してください。";
    }

    try {
      let refinedText = "";

      if (isGemini) {
        const url = AI_CONFIG.gemini.endpoint(apiKey, AI_CONFIG.gemini.model);
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptTextForApi }] }],
            systemInstruction: { parts: [{ text: systemInstruction }] }
          })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(`Gemini: ${errData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        refinedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
      } else {
        const response = await fetch(AI_CONFIG.openai.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: AI_CONFIG.openai.model,
            messages: [
              { role: 'system', content: systemInstruction },
              { role: 'user', content: promptTextForApi }
            ],
            temperature: AI_CONFIG.openai.temperature
          })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(`OpenAI: ${errData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        refinedText = data.choices?.[0]?.message?.content?.trim() || "";
      }

      if (!refinedText) {
        throw new Error('AIからの応答が空でした。');
      }

      pushHistory(rawOriginalText, originalCursor);
      editor.value = refinedText;
      pushHistory(refinedText, refinedText.length);
      persistContent();
      updateHighlightAndLineNumbers();

    } catch (err) {
      console.error(err);
      alert(`ブラッシュアップに失敗しました。\n詳細: ${err.message}`);
    } finally {
      if (aiGeminiBtn) {
        aiGeminiBtn.disabled = false;
        aiGeminiBtn.textContent = '✨ Gemini';
      }
      if (aiOpenaiBtn) {
        aiOpenaiBtn.disabled = false;
        aiOpenaiBtn.textContent = '✨ ChatGPT';
      }
    }
  }

  // イベントリスナー登録
  if (editor) {
    // IME（日本語入力）の開始・確定ハンドリング
    editor.addEventListener('compositionstart', () => {
      isComposing = true;
    });

    editor.addEventListener('compositionend', () => {
      isComposing = false;
      pushHistory(editor.value, editor.selectionStart);
    });

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

  window.addEventListener('resize', updateHighlightAndLineNumbers);

  if (modeImageBtn) modeImageBtn.addEventListener('click', () => setMode('image'));
  if (modeRoleplayBtn) modeRoleplayBtn.addEventListener('click', () => setMode('roleplay'));
  if (boldBtn) boldBtn.addEventListener('click', () => wrapText('**', '**'));
  if (weightBtn) weightBtn.addEventListener('click', () => wrapText('(', ':1.2)'));

  const userTagBtn = document.getElementById('userTagBtn');
  if (userTagBtn) {
    userTagBtn.title = "クリック: {{user}} / Shift+クリック・右クリック: {user}";

    userTagBtn.addEventListener('click', (e) => {
      if (!editor) return;
      const isSingle = e.shiftKey;
      const openTag = isSingle ? '{' : '{{';
      const closeTag = isSingle ? '}' : '}}';
      const defaultText = isSingle ? '{user}' : '{{user}}';

      if (editor.selectionStart !== editor.selectionEnd) {
        wrapText(openTag, closeTag);
      } else {
        insertText(defaultText);
      }
    });

    userTagBtn.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      if (!editor) return;
      if (editor.selectionStart !== editor.selectionEnd) {
        wrapText('{', '}');
      } else {
        insertText('{user}');
      }
    });
  }

  if (openHelpBtn) openHelpBtn.addEventListener('click', openHelpModal);
  if (closeHelpBtn) closeHelpBtn.addEventListener('click', closeHelpModal);
  if (closeHelpBottomBtn) closeHelpBottomBtn.addEventListener('click', closeHelpModal);

  if (undoBtn) undoBtn.addEventListener('click', undo);
  if (redoBtn) redoBtn.addEventListener('click', redo);
  if (clearBtn) clearBtn.addEventListener('click', clearEditor);
  if (copyBtn) copyBtn.addEventListener('click', copyText);
  if (saveTxtBtn) saveTxtBtn.addEventListener('click', () => downloadFile('txt'));
  if (saveMdBtn) saveMdBtn.addEventListener('click', () => downloadFile('md'));

  if (aiGeminiBtn) aiGeminiBtn.addEventListener('click', () => runAiEnhance('gemini'));
  if (aiOpenaiBtn) aiOpenaiBtn.addEventListener('click', () => runAiEnhance('openai'));

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

  // モーダル背景クリック & Escキー制御
  window.addEventListener('click', (e) => {
    if (e.target === apiModal) closeApiModal();
    if (e.target === searchModal) closeSearchModal();
    if (e.target === helpModal) closeHelpModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeSearchModal();
      closeApiModal();
      closeHelpModal();
    }
  });

  // サジェストエンジンの初期化
  const suggest = new SuggestEngine(editor, () => currentMode);

  const testSuggestBtn = document.getElementById('testSuggestBtn');
  if (testSuggestBtn) {
    testSuggestBtn.addEventListener('click', () => {
      editor.focus();
      suggest.triggerSuggest();
    });
  }

  // 保存されていたモードまたはデフォルト（image）で初期ロードを実行
  const initialMode = localStorage.getItem(STORAGE_KEYS.mode) || 'image';
  setMode(initialMode, false, true);

});
