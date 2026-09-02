// ========================================================
// サジェスト辞書データ (suggestData.js)
// ========================================================
const SUGGEST_DATA = {
  // 画像生成モード用
  image: [
    { label: 'masterpiece', insert: '(masterpiece, best quality:1.2)', desc: '品質強化タグ' },
    { label: 'ultra detailed', insert: 'ultra detailed, highly detailed', desc: '詳細度アップ' },
    { label: 'cinematic lighting', insert: 'cinematic lighting, dynamic angle, dramatic shadows', desc: 'ライティング・構図' },
    { label: 'solo', insert: '1girl, solo', desc: '構図基本' },
    { label: 'negative standard', insert: 'lowres, bad anatomy, bad hands, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality', desc: '定番ネガティブ' },
    { label: 'anime style', insert: 'anime style, vibrant colors, detailed line art', desc: 'アニメ調画風' },
    { label: 'photorealistic', insert: 'photorealistic, 8k resolution, raw photo', desc: '実写調' }
  ],

  // ロールプレイ・キャラクター設計用
  roleplay: [
    { label: '### 【基本情報】', insert: '### 【基本情報】\n名前: \n年齢: \n性別: \n職業: \n性格: ', desc: 'キャラ骨格テンプレート' },
    { label: '### 【外見特徴】', insert: '### 【外見】\n身長: \n体型: \n髪型・髪色: \n服装: \n特徴: ', desc: '容姿テンプレート' },
    { label: '### 【口調・台詞】', insert: '### 【口調・セリフ例】\n一人称: \n二人称: \n口調特徴: \nサンプル台詞:\n「」', desc: '会話トーン定義' },
    { label: '### 【行動規範・制約】', insert: '### 【制約・行動指針】\n・ユーザーに対して親身に応答する\n・設定された世界観を崩さない\n・3行以内で簡潔に話す', desc: '制約・行動ルール' },
    { label: '### 【シチュエーション】', insert: '### 【状況・背景】\n場所: \n時間帯: \n二人の関係性: ', desc: '場面設定' }
  ]
};