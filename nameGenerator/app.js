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

// 1. 全体設定（registry.json）の読み込み
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

// 2. 文化圏の切り替えと動的入力フォームの生成
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

// 3. 必要な文化圏データの並列フェッチとキャッシュ
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

  if (!manifestRes.ok || !patternsRes.ok) {
    throw new Error(`設定ファイルの取得に失敗しました: ${basePath}`);
  }

  const manifest = await manifestRes.json();
  const patterns = await patternsRes.json();

  const slotKeys = Object.keys(manifest.slots);
  const slotPromises = slotKeys.map(async key => {
    const res = await fetch(`${basePath}/${manifest.slots[key]}`);
    if (!res.ok) throw new Error(`スロットファイルの取得に失敗しました: ${manifest.slots[key]}`);
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

// 4. スロット充填・名前生成エンジン（パターンA：同化名・母国名の自然混在対応版）
function generateNames(cultureData, query, count = 10) {
  const { era, gender, tags } = query;

  // 年代条件に合致する命名パターンの抽出
  const validPatterns = cultureData.patterns.filter(p =>
    !p.era_range || (era >= p.era_range[0] && era <= p.era_range[1])
  );

  if (validPatterns.length === 0) return [];

  const results = new Map(); // 重複防止（key: 原語表記, value: 表示文字列）
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

      // スロット内パーツの選定とフィルタリング
      const candidates = pool.filter(item => {
        // 1. 性別判定
        if (gender !== 'any' && item.gender && item.gender !== gender) {
          return false;
        }

        // 2. 年代判定
        if (item.era && (era < item.era[0] || era > item.era[1])) {
          return false;
        }

        // 3. 動的タグ判定
        if (tags.length > 0) {
          const itemTags = item.tags || [];

          for (const filterTag of tags) {
            const [key, val] = filterTag.split(':');

            // 【名字スロットの場合】
            if (slotName === 'surname') {
              // 名字に関係のない格式（style等）はスキップ
              if (key === 'style') continue;

              // 地域偏在（都道府県・米国内地域）の判定
              if (key === 'region') {
                const itemRegions = itemTags
                  .filter(t => t.startsWith('region:'))
                  .map(t => t.split(':')[1]);

                if (itemRegions.length > 0 && !itemRegions.includes(val)) {
                  return false;
                }
                continue;
              }

              // ルーツ（origin）など、姓の固有属性は厳格に一致を要求
              if (!itemTags.includes(filterTag)) {
                return false;
              }
            } 
            // 【名前・部品スロットの場合】
            else {
              // 名前には地域偏在（region）は関係ないのでスキップ
              if (key === 'region') continue;

              // 日本の武家・通称等の格式指定（style）がある場合
              if (key === 'style') {
                const itemStyles = itemTags.filter(t => t.startsWith('style:'));
                if (itemStyles.length > 0 && !itemTags.includes(filterTag)) {
                  return false;
                }
                continue;
              }

              // アメリカ等の文化的ルーツ（origin）の判定（パターンA実装部）
              if (key === 'origin') {
                // そのルーツ固有の名前（例: origin:german）か、
                // あるいは社会汎用・同化名（origin:anglo または origin指定なし）なら通過
                const isTargetOrigin = itemTags.includes(filterTag);
                // アメリカ等の文化的ルーツ（origin）の判定（パターンA実装部）
if (key === 'origin') {
  const isTargetOrigin = itemTags.includes(filterTag);
  // anglo に加え、native（欧州共通の現地標準名）も共通枠として通過させる
  const isGeneralName = 
    itemTags.includes('origin:anglo') || 
    itemTags.includes('origin:native') || 
    !itemTags.some(t => t.startsWith('origin:'));

  if (!isTargetOrigin && !isGeneralName) {
    return false;
  }
}

                if (!isTargetOrigin && !isGeneralName) {
                  return false;
                }
              }
            }
          }
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
      // 日本人名（jp_japan等）以外はカタカナ読みを併記
      const isJapanese = cultureData.cultureId.startsWith('jp_');
      const displayText = isJapanese ? outputRaw : `${outputRaw}（${outputKana}）`;
      results.set(outputRaw, displayText);
    }
  }

  return Array.from(results.values());
}

// 重み付き抽選ユーティリティ
function pickByWeight(items) {
  const total = items.reduce((sum, i) => sum + (i.weight || 1), 0);
  let random = Math.random() * total;
  for (const item of items) {
    random -= (item.weight || 1);
    if (random <= 0) return item;
  }
  return items[0];
}

// 5. UIイベントハンドラ
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

      // 動的フィルタの値を取得（all 以外のものを key:val 形式で配列化）
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
        list.innerHTML = '<li>条件に合致する名前が見つかりませんでした。条件を変更して再試行してください。</li>';
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
