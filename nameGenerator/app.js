const DATA_ROOT = './data';

const cache = {
  registry: null,
  cultures: {}
};

let currentRegistry = null;

window.addEventListener('DOMContentLoaded', async () => {
  await loadRegistry();
  setupUI();
});

async function loadRegistry() {
  try {
    const res = await fetch(`${DATA_ROOT}/registry.json`);
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    currentRegistry = await res.json();
    cache.registry = currentRegistry;

    const select = document.getElementById('cultureSelect');
    select.innerHTML = '';
    currentRegistry.cultures.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.name;
      select.appendChild(opt);
    });

    onCultureChange(currentRegistry.cultures[0].id);
  } catch (err) {
    console.error('registry.jsonの読み込みに失敗しました:', err);
  }
}

function onCultureChange(cultureId) {
  const cultureMeta = currentRegistry.cultures.find(c => c.id === cultureId);
  const container = document.getElementById('dynamicFilters');
  container.innerHTML = '';

  if (!cultureMeta || !cultureMeta.custom_filters || cultureMeta.custom_filters.length === 0) {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'block';
  cultureMeta.custom_filters.forEach(filter => {
    const group = document.createElement('div');
    group.className = 'form-group';

    const label = document.createElement('label');
    label.textContent = filter.label;
    label.setAttribute('for', `filter_${filter.key}`);

    const select = document.createElement('select');
    select.id = `filter_${filter.key}`;
    select.dataset.filterKey = filter.key;

    filter.options.forEach(opt => {
      const optElem = document.createElement('option');
      optElem.value = opt.val;
      optElem.textContent = opt.label;
      select.appendChild(optElem);
    });

    group.appendChild(label);
    group.appendChild(select);
    container.appendChild(group);
  });
}

async function loadCultureData(cultureId) {
  if (cache.cultures[cultureId]) {
    return cache.cultures[cultureId];
  }

  const meta = currentRegistry.cultures.find(c => c.id === cultureId);
  if (!meta) throw new Error(`未定義の文化圏ID: ${cultureId}`);

  const basePath = `${DATA_ROOT}/${meta.dir}`;
  const [manifestRes, patternsRes] = await Promise.all([
    fetch(`${basePath}/manifest.json`),
    fetch(`${basePath}/patterns.json`)
  ]);

  const manifest = await manifestRes.json();
  const patterns = await patternsRes.json();

  const slotKeys = Object.keys(manifest.slots);
  const slotPromises = slotKeys.map(async key => {
    const res = await fetch(`${basePath}/${manifest.slots[key]}`);
    return res.json();
  });

  const slotDataList = await Promise.all(slotPromises);
  const slots = {};
  slotKeys.forEach((key, idx) => {
    slots[key] = slotDataList[idx];
  });

  const cultureBundle = { cultureId, patterns, slots };
  cache.cultures[cultureId] = cultureBundle;
  return cultureBundle;
}

function generateNames(cultureData, query, count = 10) {
  const { era, gender, tags } = query;

  const validPatterns = cultureData.patterns.filter(p => 
    !p.era_range || (era >= p.era_range[0] && era <= p.era_range[1])
  );

  if (validPatterns.length === 0) return [];

  const results = new Map(); // 重複防止用（key: 原語表記, value: 表示文字列）
  let attempts = 0;

  while (results.size < count && attempts < 400) {
    attempts++;
    const pattern = pickByWeight(validPatterns);
    let outputRaw = pattern.format;
    let outputKana = pattern.format_kana || pattern.format;

    const matches = pattern.format.match(/\{([^}]+)\}/g) || [];
    let isPatternValid = true;

    for (const match of matches) {
      const slotName = match.replace(/[{}]/g, '');
      const pool = cultureData.slots[slotName] || [];

      const candidates = pool.filter(item => {
        if (gender !== 'any' && item.gender && item.gender !== gender) return false;
        if (item.era && (era < item.era[0] || era > item.era[1])) return false;
        if (tags.length > 0 && item.tags) {
          const hasRequiredTags = tags.every(t => item.tags.includes(t));
          if (!hasRequiredTags) return false;
        }
        return true;
      });

      if (candidates.length === 0) {
        isPatternValid = false;
        break;
      }

      const picked = pickByWeight(candidates);
      outputRaw = outputRaw.replace(match, picked.val);
      outputKana = outputKana.replace(match, picked.kana || picked.val);
    }

    if (isPatternValid) {
      // 日本人名（jp_等）以外は カタカナ表記を併記
      const isJapanese = cultureData.cultureId.startsWith('jp_');
      const displayText = isJapanese ? outputRaw : `${outputRaw}（${outputKana}）`;
      results.set(outputRaw, displayText);
    }
  }

  return Array.from(results.values());
}

function pickByWeight(items) {
  const total = items.reduce((sum, i) => sum + (i.weight || 1), 0);
  let random = Math.random() * total;
  for (const item of items) {
    random -= (item.weight || 1);
    if (random <= 0) return item;
  }
  return items[0];
}

function setupUI() {
  document.getElementById('cultureSelect').addEventListener('change', (e) => {
    onCultureChange(e.target.value);
  });

  const btn = document.getElementById('generateBtn');
  btn.addEventListener('click', async () => {
    btn.disabled = true;
    btn.textContent = '生成中...';

    try {
      const cultureId = document.getElementById('cultureSelect').value;
      const gender = document.getElementById('genderSelect').value;
      const era = parseInt(document.getElementById('eraInput').value, 10);

      const tags = [];
      const dynamicSelects = document.querySelectorAll('#dynamicFilters select');
      dynamicSelects.forEach(sel => {
        if (sel.value && sel.value !== 'all') {
          tags.push(`${sel.dataset.filterKey}:${sel.value}`);
        }
      });

      const cultureData = await loadCultureData(cultureId);
      const results = generateNames(cultureData, { era, gender, tags }, 10);

      const list = document.getElementById('resultsList');
      list.innerHTML = '';
      if (results.length === 0) {
        list.innerHTML = '<li>条件に合致する名前が見つかりませんでした。年代やルーツを変更してください。</li>';
      } else {
        results.forEach(item => {
          const li = document.createElement('li');
          li.textContent = item;
          list.appendChild(li);
        });
      }
    } catch (err) {
      console.error(err);
      alert('エラーが発生しました。コンソールログを確認してください。');
    } finally {
      btn.disabled = false;
      btn.textContent = 'メジャーな名前を10件生成';
    }
  });
}