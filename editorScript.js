const editor = document.getElementById('promptEditor');
const lineNumbers = document.getElementById('lineNumbers');
const charCount = document.getElementById('charCount');
const copyBtn = document.getElementById('copyBtn');
const quickChipsContainer = document.getElementById('quickChipsContainer');
const tooltip = document.getElementById('selectionTooltip');

let currentMode = 'image';

window.addEventListener('DOMContentLoaded', () => {
  setMode('image');
  updateLinesAndStats();
});

// モード切替
function setMode(mode) {
  currentMode = mode;
  document.getElementById('modeImage').classList.toggle('active', mode === 'image');
  document.getElementById('modeRoleplay').classList.toggle('active', mode === 'roleplay');

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

function renderChips(chips) {
  chips.forEach(c => {
    const chip = document.createElement('div');
    chip.className = 'chip';
    chip.textContent = c.label;
    chip.onclick = () => insertText(c.text);
    quickChipsContainer.appendChild(chip);
  });
}

// エディタの同期（文字数・行数・行番号更新）
function syncEditor() {
  updateLinesAndStats();
}

function syncScroll() {
  lineNumbers.scrollTop = editor.scrollTop;
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

// 選択文字数ポップアップの追従
document.addEventListener('selectionchange', () => {
  const selection = window.getSelection();
  const selectedText = selection.toString();

  if (selectedText.length > 0 && editor.contains(selection.anchorNode)) {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const containerRect = document.querySelector('.editor-container').getBoundingClientRect();

    tooltip.textContent = `${selectedText.length}文字`;
    tooltip.style.display = 'block';

    const left = (rect.left + rect.right) / 2 - containerRect.left;
    const top = rect.top - containerRect.top;

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  } else {
    tooltip.style.display = 'none';
  }
});

// テキスト挿入・ラップ
function insertText(str) {
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const text = editor.value;
  editor.value = text.substring(0, start) + str + text.substring(end);
  editor.selectionStart = editor.selectionEnd = start + str.length;
  editor.focus();
  updateLinesAndStats();
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
  updateLinesAndStats();
}

function clearEditor() {
  if (confirm('エディタの内容をクリアしますか？')) {
    editor.value = '';
    updateLinesAndStats();
  }
}

// コピー機能
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

// ファイルダウンロード機能 (.txt / .md)
function downloadFile(extension) {
  const text = editor.value;
  if (!text.trim()) {
    alert('保存するテキストがありません。');
    return;
  }
  const now = new Date();
  const dateStr = now.toISOString().slice(0,10).replace(/-/g,'');
  const filename = `prompt_${dateStr}.${extension}`;

  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// APIキーモーダル制御
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

// 検索モーダル制御 (Ctrl+F)
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
  if (index === -1) {
    index = text.indexOf(query, 0);
  }

  if (index !== -1) {
    editor.focus();
    editor.setSelectionRange(index, index + query.length);
    const linesBefore = text.substring(0, index).split('\n').length;
    editor.scrollTop = (linesBefore - 3) * 22;
  } else {
    alert('見つかりませんでした。');
  }
}

// モーダルの外側をクリックしたら閉じる
window.addEventListener('click', (e) => {
  const apiModal = document.getElementById('apiModal');
  const searchModal = document.getElementById('searchModal');
  if (e.target === apiModal) closeApiModal();
  if (e.target === searchModal) closeSearchModal();
});

// Gemini API 連携によるブラッシュアップ機能
async function enhancePrompt() {
  const apiKey = localStorage.getItem('gemini_api_key');
  if (!apiKey) {
    alert('右上の「⚙️ API設定」からGemini API Keyを設定してください。');
    openApiModal();
    return;
  }
  const promptText = editor.value.trim();
  if (!promptText) {
    alert('ブラッシュアップするプロンプトを入力してください。');
    return;
  }

  aiBtnState(true);

  let systemInstruction = "";
  if (currentMode === 'image') {
    systemInstruction = "あなたは優秀な画像生成AIプロンプトエンジニアです。入力されたプロンプトを分析し、クオリティ向上、タグの最適化、ディテールの追加を行って、洗練されたプロンプト（カンマ区切りのタグ群など）にブラッシュアップしてください。解説は不要で、結果のプロンプトテキストのみを出力してください。";
  } else {
    systemInstruction = "あなたは優秀なLLMロールプレイプロンプト・システムプロンプトの設計者です。入力された設定をブラッシュアップし、ペルソナの解像度、世界観、出力制約が明確で効果的なプロンプトにリッチ化してください。解説は不要で、結果のテキストのみを出力してください。";
  }

  try {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] }
      })
    });

    const data = await response.json();
    if (data.candidates && data.candidates[0].content) {
      const refinedText = data.candidates[0].content.parts[0].text;
      editor.value = refinedText.trim();
      updateLinesAndStats();
    } else {
      alert('AIからの応答に失敗しました。APIキーを確認してください。');
    }
  } catch (err) {
    console.error(err);
    alert('通信エラーが発生しました。');
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

// キーボードショートカット・Tabキー対応
editor.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    e.preventDefault();
    insertText('  ');
    return;
  }

  if (e.ctrlKey || e.metaKey) {
    switch (e.key.toLowerCase()) {
      case 'f':
        e.preventDefault();
        openSearchModal();
        break;
      case 's':
        e.preventDefault();
        downloadFile('txt');
        break;
    }
  }
});
