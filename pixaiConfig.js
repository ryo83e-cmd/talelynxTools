// pixaiConfig.js
 
window.pixaiConfig = {
  promptGroups: [
    {
      title: "性別・ベース",
      group: "gender",
      type: "single",
      options: [
        { label: "女性 (1girl)", tag: "1girl", selected: true },
        { label: "男性 (1boy)", tag: "1boy" },
        { label: "猫耳娘", tag: "1girl, cat ears" },
        { label: "エルフ", tag: "1girl, elf" }
      ]
    },
    {
      title: "身長・体型",
      group: "proportion",
      type: "single",
      options: [
        { label: "標準・スレンダー", tag: "average height, slender", selected: true },
        { label: "高身長・モデル", tag: "tall, model physique" },
        { label: "小柄・低身長", tag: "petite, short" },
        { label: "グラマー", tag: "curvy" }
      ]
    },
    {
      title: "胸のサイズ",
      group: "bust",
      type: "single",
      options: [
        { label: "標準", tag: "medium breasts", selected: true },
        { label: "控えめ・小胸", tag: "flat chest" },
        { label: "巨乳 (large)", tag: "large breasts" },
        { label: "爆乳 (huge)", tag: "huge breasts" }
      ]
    },
    {
      title: "髪型・髪色",
      group: "hair",
      type: "multi",
      options: [
        { label: "ロングヘア", tag: "long hair", selected: true },
        { label: "ボブ", tag: "bob cut" },
        { label: "ツインテール", tag: "twintails" },
        { label: "ポニーテール", tag: "ponytail" },
        { label: "ぱっつん前髪", tag: "blunt bangs" },
        { label: "シルバー髪", tag: "silver hair", selected: true },
        { label: "金髪", tag: "blonde hair" },
        { label: "黒髪", tag: "black hair" },
        { label: "インナーカラー", tag: "streaked hair" }
      ]
    },
    {
      title: "ポージング・視線",
      group: "pose",
      type: "multi",
      options: [
        { label: "立ち姿", tag: "standing", selected: true },
        { label: "座り", tag: "sitting" },
        { label: "こちらを見る", tag: "looking at viewer", selected: true },
        { label: "ピース", tag: "peace sign" },
        { label: "両手上げ", tag: "hands up" }
      ]
    },
    {
      title: "服装",
      group: "clothes",
      type: "multi",
      options: [
        { label: "普段着", tag: "casual wear", selected: true },
        { label: "制服", tag: "school uniform" },
        { label: "パーカー", tag: "hoodie" },
        { label: "Tシャツ・ジーンズ", tag: "t-shirt, jeans" },
        { label: "メイド服", tag: "maid outfit" },
        { label: "ニーハイソックス", tag: "thigh highs" }
      ]
    },
    {
      title: "背景・シチュエーション",
      group: "bg",
      type: "single",
      options: [
        { label: "シンプル・白背景", tag: "simple background, white background", selected: true },
        { label: "室内・ベッドルーム", tag: "indoors, bedroom" },
        { label: "教室", tag: "classroom" },
        { label: "街並み・ストリート", tag: "cityscape, street" },
        { label: "自然・森", tag: "nature, forest" }
      ]
    }
  ],

  updatePreviewAppearance(prompt, svgHair, svgClothes) {
    if (prompt.includes('silver hair')) svgHair.setAttribute('fill', '#94a3b8');
    else if (prompt.includes('blonde hair')) svgHair.setAttribute('fill', '#eab308');
    else if (prompt.includes('black hair')) svgHair.setAttribute('fill', '#1e293b');
    else svgHair.setAttribute('fill', '#64748b');

    if (prompt.includes('school uniform')) svgClothes.setAttribute('fill', '#0284c7');
    else if (prompt.includes('maid outfit')) svgClothes.setAttribute('fill', '#334155');
    else if (prompt.includes('hoodie')) svgClothes.setAttribute('fill', '#a855f7');
    else svgClothes.setAttribute('fill', '#3b82f6');
  }
};
