const editor = document.getElementById('promptEditor');
const lineNumbers = document.getElementById('lineNumbers');
const charCount = document.getElementById('charCount');
const copyBtn = document.getElementById('copyBtn');
const quickChipsContainer = document.getElementById('quickChipsContainer');
const tooltip = document.getElementById('selectionTooltip');
const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');

let currentMode = 'image';

// 履歴スタック (Undo/Redo)
let undoStack = [];
let redoStack = [];
const MAX_HISTORY = 100;
let saveDebounceTimer = null;

// ストレージキー
const STORAGE_KEYS = {
  image: 'editor_content_image',
  roleplay: 'editor_content_roleplay',
  mode: 'editor_saved_mode'
};

window.addEventListener('DOMContentLoaded', () => {
  // 1. 初回ロード時は既存データの退避を行わずにモードと本文を復元
  const savedMode = localStorage.getItem(STORAGE_KEYS.mode) || 'image';
  setMode(savedMode, false, true);
});

// モード切替（isInitialLoad: 初回起動時の空データ上書きを防止）
function setMode(mode, shouldPersist = true, isInitialLoad = false) {
  // 初回ロード時以外のみ、切り替え前の本文を現行モードのストレージへ退避
  if (!isInitialLoad && currentMode) {
    localStorage.setItem(STORAGE_KEYS[currentMode], editor.value);
  }

  currentMode = mode;
  if (shouldPersist) {
    localStorage.setItem(STORAGE_KEYS.mode, mode);
  }

  document.getElementById('modeImage').classList.toggle('active', mode === 'image');
  document.getElementById('modeRoleplay').classList.toggle('active', mode === 'roleplay');

  // 切り替え先モードの本文をロード
  const loadedContent = localStorage.getItem(STORAGE_KEYS[mode]) || '';
  editor.value = loadedContent;

  // モード切替時に履歴スタックを初期化
  undoStack = [loadedContent];
  redoStack = [];
  updateUndoRedoUI();

  // チップス更新
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

  updateLinesAndStats();
  hideSelectionTooltip();
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

// Undo/Redo の一元記録ロジック
function pushHistory(newText) {
  if (undoStack.length > 0 && undoStack[undoStack.length - 1] === newText) {
    return;
  }
  undoStack.push(newText);
  if (undoStack.length > MAX_HISTORY) {
    undoStack.shift();
  }
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
    updateLinesAndStats();
    updateUndoRedoUI();
    hideSelectionTooltip();
  }
}

function redo() {
  if (redoStack.length > 0) {
    const next = redoStack.pop();
    undoStack.push(next);
    editor.value = next;
    persistContent();
    updateLinesAndStats();
    updateUndoRedoUI();
    hideSelectionTooltip();
  }
}

function updateUndoRedoUI() {
  undoBtn.disabled = undoStack.length <= 1;
  redoBtn.disabled = redoStack.length === 0;
}

// 入力ハンドラ
function handleInput() {
  pushHistory(editor.value);
  
  clearTimeout(saveDebounceTimer);
  saveDebounceTimer = setTimeout(() => {
    persistContent();
  }, 300);

  updateLinesAndStats();
  hideSelectionTooltip();
}

function persistContent() {
  localStorage.setItem(STORAGE_KEYS[currentMode], editor.value);
}

function syncScroll() {
  lineNumbers.scrollTop = editor.scrollTop;
  hideSelectionTooltip();
}

function updateLinesAndStats() {
  const text = editor.value;
  const chars = text.length;
  const lines = text.split('\n').length;

  let lineNumStr = '';
  for (let i = 1; i <= lines; i++) {
    lineNumStr += i + '\n';
  }
  lineNumbers.textContent = lineNumStr;
  charCount.textContent = `文字数: ${chars} | 行数: ${lines}`;
}

// textarea専用の選択文字数・座標計算ロジック
function updateSelectionTooltip() {
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const selectedLen = Math.abs(end - start);

  if (selectedLen === 0) {
    hideSelectionTooltip();
    return;
  }

  const caretPos = getCaretCoordinates(editor, end);
  const editorRect = editor.getBoundingClientRect();

  tooltip.textContent = `${selectedLen}文字選択`;
  tooltip.style.display = 'block';

  const topPos = editorRect.top + (caretPos.top - editor.scrollTop) + window.scrollY;
  const leftPos = editorRect.left + (caretPos.left - editor.scrollLeft) + window.scrollX;

  tooltip.style.top = `${topPos}px`;
  tooltip.style.left = `${leftPos}px`;
}

function hideSelectionTooltip() {
  tooltip.style.display = 'none';
}

function getCaretCoordinates(element, position) {
  const div = document.createElement('div');
  const style = window.getComputedStyle(element);

  for (const prop of style) {
    div.style[prop] = style.getPropertyValue(prop);
  }

  div.style.position = 'absolute';
  div.style.visibility = 'hidden';
  div.style.whiteSpace = 'pre-wrap';
  div.style.top = '0px';
  div.style.left = '0px';

  div.textContent = element.value.substring(0, position);
  const span = document.createElement('span');
  span.textContent = element.value.substring(position) || '.';
  div.appendChild(span);

  document.body.appendChild(div);
  const coordinates = {
    top: span.offsetTop + parseInt(style.borderTopWidth),
    left: span.offsetLeft + parseInt(style.borderLeftWidth)
  };
  document.body.removeChild(div);
  return coordinates;
}

function insertText(str) {
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const text = editor.value;
  
  editor.value = text.substring(0, start) + str + text.substring(end);
  editor.selectionStart = editor.selectionEnd = start + str.length;
  editor.focus();

  pushHistory(editor.value);
  persistContent();
  updateLinesAndStats();
  hideSelectionTooltip();
}

function wrapText(before, after) {
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
  updateLinesAndStats();
  hideSelectionTooltip();
}

function clearEditor() {
  if (confirm('エディタの内容をクリアしますか？')) {
    editor.value = '';
    pushHistory('');
    persistContent();
    updateLinesAndStats();
    hideSelectionTooltip();
  }
}

function copyText() {
  editor.select();
  navigator.clipboard.writeText(editor.value).then(() => {
    copyBtn.textContent = 'コピーしました！';
    copyBtn.classList.add('copied');
    setTimeout(() => {
      copyBtn.textContent = 'テキストをコピー';
      copyBtn.classList.remove('copied');
    }, 2000);
  });
}

function downloadFile(extension) {
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
  const modal = document.getElementById('apiModal');
  const savedKey = localStorage.getItem('gemini_api_key') || '';
  document.getElementById('apiKeyInput').value = savedKey;
  modal.style.display = 'flex';
}

function closeApiModal() {
  document.getElementById('apiModal').style.display = 'none';
}

function saveApiKey() {
  const key = document.getElementById('apiKeyInput').value.trim();
  localStorage.setItem('gemini_api_key', key);
  alert('APIキーを保存しました！');
  closeApiModal();
}

function openSearchModal() {
  const modal = document.getElementById('searchModal');
  modal.style.display = 'flex';
  const input = document.getElementById('searchInput');
  input.focus();
  input.select();
}

function closeSearchModal() {
  document.getElementById('searchModal').style.display = 'none';
  editor.focus();
}

function executeSearch() {
  const query = document.getElementById('searchInput').value;
  if (!query) return;

  const text = editor.value;
  const currentPos = editor.selectionEnd;
  
  let index = text.indexOf(query, currentPos);
  if (index === -1) index = text.indexOf(query, 0);

  if (index !== -1) {
    editor.focus();
    editor.setSelectionRange(index, index + query.length);
    const linesBefore = text.substring(0, index).split('\n').length;
    editor.scrollTop = (linesBefore - 3) * 22;
  } else {
    alert('見つかりませんでした。');
  }
}

window.addEventListener('click', (e) => {
  const apiModal = document.getElementById('apiModal');
  const searchModal = document.getElementById('searchModal');
  if (e.target === apiModal) closeApiModal();
  if (e.target === searchModal) closeSearchModal();
});

// AIブラッシュアップ
async function enhancePrompt() {
  const apiKey = localStorage.getItem('gemini_api_key');
  if (!apiKey) {
    alert('右上の「⚙️ API設定」からGemini API Keyを設定してください。');
    openApiModal();
    return;
  }

  // 2. 元のテキストを前後の空白・改行を含めて保持
  const rawOriginalText = editor.value;
  const promptTextForApi = rawOriginalText.trim();
  
  if (!promptTextForApi) {
    alert('ブラッシュアップするプロンプトを入力してください。');
    return;
  }

  aiBtnState(true);

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
      
      // 2. Undoスタックにはtrim前の完全な元テキストを記録
      pushHistory(rawOriginalText);
      editor.value = refinedText;
      pushHistory(refinedText);
      persistContent();
      updateLinesAndStats();
    } else {
      throw new Error('AIからの応答データ形式が正しくありません。');
    }
  } catch (err) {
    console.error(err);
    alert(`ブラッシュアップに失敗しました。\n詳細: ${err.message}`);
  } finally {
    aiBtnState(false);
  }
}

function aiBtnState(loading) {
  const btn = document.querySelector('.ai-btn');
  if (loading) {
    btn.textContent = '✨ AI思考中...';
    btn.disabled = true;
  } else {
    btn.textContent = '✨ AIブラッシュアップ';
    btn.disabled = false;
  }
}

// キーボードショートカット
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
      if (e.shiftKey) {
        redo();
      } else {
        undo();
      }
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

// 検索モーダル内操作
document.getElementById('searchInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    executeSearch();
  } else if (e.key === 'Escape') {
    e.preventDefault();
    closeSearchModal();
  }
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeSearchModal();
    closeApiModal();
  }
});
