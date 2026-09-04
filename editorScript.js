// =========================================================================
// MYTHEOGONICA // SECTOR & MECHA MASTER DATABASE (DATA-DRIVEN THEME SUPPORT)
// =========================================================================
const SECTORS_DATA = [
  {
    id: "sector-greek",
    mythBadge: "GREEK MYTH",
    btnLabel: "ギリシャ",
    sectorTag: "SECTOR 01 // MEDITERRANEAN",
    sectorName: "ギリシャ",
    lat: 38.0,
    lon: 23.7,
    theme: {
      accent: "#3fa8b8",
      pattern: "pattern-meander",
      symbol: "☵",
      code: "MEANDER_GRID"
    },
    subFactions: [
      {
        factionName: "オリュンポス系",
        factionCode: "DIV-01 // OLYMPOS",
        mechaList: [
          {
            name: "アテナ [PALLAS ATHENA]",
            image: "athena.png",
            specs: [
              { label: "全高 / 重量", value: "14.2m / 23.6t" },
              { label: "動力", value: "精神波インターフェース型神経炉" },
              { label: "装甲材", value: "オリュンポス合金（潤愛甲）" },
              { label: "主兵装", value: "超長槍【ドーリュス】/ アイギス・シールド" }
            ],
            doctrineTitle: "運用ドクトリン: ファランクス陣形",
            doctrineText: "単騎での格闘戦を主とせず、盾を連結した多層精神波フィールドによる集団防壁を形成。水上ホバー機動と長槍斉射による圧倒的制圧を行う。",
            relicStory: {
              tag: "INDIVIDUAL LOG // ATHENA-01",
              title: "純白のアイギスと海溝の鏡面",
              text: "エーゲ海溝最深部、泥土に直立した姿勢で発見された。数千年の高圧と塩害に晒されながらも、オリュンポス合金の装甲は鏡面のような白銀を維持。アイギス・シールド内部から微弱な精神波の脈動が継続的に検出されている。"
            }
          },
          {
            name: "アレス [ARES]",
            image: "ares.png",
            specs: [
              { label: "所属 / 主神", value: "ギリシャ神話体系 / 軍神アレス" },
              { label: "全高 / 重量", value: "13.9m / 26.8t" },
              { label: "操者", value: "狂神官・軍神同調適性者（スパルタ系操者）" },
              { label: "主兵装", value: "マケドニック・グラディウス（高出力振動波発生装置内蔵）" },
              { label: "副兵装", value: "バリィディスク（前腕装甲型小型防御装置）" },
              { label: "その他装備", value: "背部ブースターユニット / 戦装マント" }
            ],
            doctrineTitle: "運用ドクトリン: 単騎乱戦特化",
            doctrineText: "「戦場を壊す」機体。秩序よりも混沌、隊列よりも個の武勇を重視し、高出力推進機構による短距離急加速・跳躍で敵陣へ単独突入、陣列を攪乱・崩壊させる圧倒的突破力を誇る。",
            relicStory: {
              tag: "INDIVIDUAL LOG // ARES-03",
              title: "焦土に遺された赤銅のマント",
              text: "ペロポネソス半島の地下溶岩洞窟にて発掘。機体周囲の岩盤は超高熱でガラス化しており、背部推進機関の稼働痕跡が生々しく残されていた。搭乗試験時、操者の闘争本能を極限まで励起させる神格同期パルスが観測されている。"
            }
          }
        ]
      },
      {
        factionName: "ティターン神族",
        factionCode: "DIV-01-B // TITANS",
        mechaList: [
          {
            name: "ヘリオス [HELIOS]",
            image: "helios.png",
            specs: [
              { label: "全高 / 分類", value: "15.8m / 単騎戦闘特化型機体（ティターン神族）" },
              { label: "重量", value: "不明（推定：中量級）" },
              { label: "主武装", value: "槍：フォトス・ランス / 剣：ヘリオス・ブレード" },
              { label: "特殊装備", value: "ヘリオス・ディリュウス（太陽の戦車システム・四輪ユニット）" }
            ],
            doctrineTitle: "名乗り・決戦・突破戦",
            doctrineText: "集団の中での役割よりも、一機的の絶対的な戦闘力を重視する。戦場を駆け、敵陣を突破し、名を轟かせることがを足とする先代の神々の戦士。",
            relicStory: {
              tag: "INDIVIDUAL LOG // HELIOS-01",
              title: "太陽の戦車を駆る日の御者",
              text: "「我こそが日の御者。その光は道を照らし、誰にも止められぬ。」神々の時代より伝わる戦闘用戦車。ヘリオス専用に調整され、高速機動と強力な火力を兼ね備える。四頭の神馬に見えたものは、四輪の独立駆動ユニットである。"
            }
          }
        ]
      }
    ],
    story: {
      tag: "REGION SURVEY // SECTOR-01 OVERVIEW",
      title: "地中海域 ギリシャ地層調査総括",
      text: "エーゲ海およびバルカン半島全域の古代地層から出土する機体群は、共通して「精神波フィールドの連結・集団戦」を前提とした工学設計が施されている。個の暴威を誇る他地域の遺物と異なり、都市国家（ポリス）を防衛・統制するための高度な組織戦術思想が色濃く残る。"
    }
  },
  {
    id: "sector-norse",
    mythBadge: "NORSE MYTH",
    btnLabel: "スウェーデン",
    sectorTag: "SECTOR 02 // SCANDINAVIA",
    sectorName: "スウェーデン",
    lat: 60.0,
    lon: 15.0,
    theme: {
      accent: "#60a5fa",
      pattern: "pattern-fiber-hatch",
      symbol: "ᛏ",
      code: "FIBER_RUNE"
    },
    subFactions: [
      {
        factionName: "アース神族 (AESIR)",
        factionCode: "DIV-02-A // AESIR CORPS",
        mechaList: [
          {
            name: "テュール [TÝR]",
            image: "tyr.png",
            specs: [
              { label: "分類 / 神格", value: "アース神族 基準機・万能型 / 正義・契約・勇気・勝利の神" },
              { label: "全高 / 重量", value: "14.2m / 38.7t" },
              { label: "動力", value: "精神波・生体エネルギー増幅炉（北欧系標準）" },
              { label: "構造特徴", value: "高剛性フレーム / 人工筋肉 / 左腕封止装甲" },
              { label: "武装構成", value: "戦術剣 / ダークシールド / 投擲ナイフ（複数）" },
              { label: "特殊機構", value: "バーサーカーモード（装甲分割展開・人工筋肉膨張）" }
            ],
            doctrineTitle: "運用ドクトリン: 隻腕攻防一体・臨界戦技",
            doctrineText: "かつてフェンリル拘束の代償として左腕を肘より先で失うも、強化された下半身と再配線された胴体制御により極めて高い機動性とバランスを維持。ダークシールドによる受け流しと戦術剣の一撃必殺、危機時のバーサーカー化で戦況を打開する。",
            relicStory: {
              tag: "INDIVIDUAL LOG // TYR-01",
              title: "永久凍土の誓約装甲",
              text: "スカンディナヴィア北部の巨大氷河深層より発掘。切断された左腕断面は耐衝撃装甲で完全に密閉・再配線されており、神話における誓約の代償が機体構造そのものに刻み込まれていることが裏付けられた。"
            }
          }
        ]
      },
      {
        factionName: "ヴァン神族 (VANIR)",
        factionCode: "DIV-02-B // VANIR CORPS",
        mechaList: [
          {
            name: "フレイ [FREYR]",
            image: "freyr.png",
            specs: [
              { label: "全高 / 重量", value: "14.3m / 41.7t" },
              { label: "動力", value: "北欧系人工筋肉弾性素子" },
              { label: "主兵装", value: "自律戦闘剣《スキーズブラズニル》" },
              { label: "特殊機構", value: "バーサーカーモード（出力420%解放）" }
            ],
            doctrineTitle: "運用ドクトリン: 突進・強襲",
            doctrineText: "「豊穣は力により守られる。力は生命に戻る。」装甲展開シーケンスにより過熱を強制排熱し、精神波同調で機動・加速力を極限まで高める。",
            relicStory: {
              tag: "INDIVIDUAL LOG // FREYR-02",
              title: "自律飛翔する光の宝剣",
              text: "フィヨルド沿岸の地層から発見。機体周囲に浮遊していた長剣は、機体本体からの遠隔精神波パルスを受信して完全自律稼働する未知の遠隔誘導兵装であることが判明した。"
            }
          }
        ]
      }
    ],
    story: {
      tag: "REGION SURVEY // SECTOR-02 OVERVIEW",
      title: "極北氷床 スカンディナヴィア生体金属層調査総括",
      text: "スカンディナヴィア半島の氷層深部に眠る機体群は、油圧シリンダーを排し、高密度な人工筋肉弾性素子とルーン刻印による神経伝達系を全身に張り巡らせている。極寒環境に最適化された生体金属フレームと、高負荷格闘戦に耐えうる柔軟な骨格構造が共通する特徴である。"
    }
  },
  {
    id: "sector-china",
    mythBadge: "TAOISM MYTH",
    btnLabel: "中国",
    sectorTag: "SECTOR 03 // EAST ASIA",
    sectorName: "中国",
    lat: 36.1,  // 中原・殷墟（河南省安陽付近）
    lon: 114.3,
    theme: {
      accent: "#d97724",
      pattern: "pattern-meander",
      symbol: "☰",
      code: "BAGUA_SEAL"
    },
    subFactions: [
      {
        factionName: "闡教・崑崙系",
        factionCode: "DIV-03-A // CHANJIAO KUNLUN",
        mechaList: [
          {
            name: "広成子 [GUANGCHENGZI]",
            image: "kouseishi.png",
            specs: [
              { label: "全高 / 重量", value: "14.1m / 18.4t" },
              { label: "動力", value: "霊気炉「乾元」" },
              { label: "主要法宝", value: "番天印（推定重量480t以上 / 質量制御）" },
              { label: "運用思想", value: "最小の動きで最大の効果を生む盤面制圧" }
            ],
            doctrineTitle: "運用ドクトリン: 道教法宝制圧",
            doctrineText: "「印は天の意を刻み、道は無形にして万象を制す。」機体装甲は最小限に留め、霊気隔壁と補助法宝ユニットによる空間固定・質量圧壊を行う。",
            relicStory: {
              tag: "INDIVIDUAL LOG // GUANGCHENGZI-01",
              title: "崑崙山鍾乳洞の天印浮遊核",
              text: "崑崙山地下鍾乳洞にて、局所的な重力異常を放つ状態で発見。手掌サイズの金印型法宝から展開される質量固定フィールドは、周囲数十メートルの岩盤を完全に圧壊させていた。"
            }
          },
          {
            name: "玉鼎真人 [GYOKUTEI SHINJIN]",
            image: "gyokuteishinjin.png",
            specs: [
              { label: "全高 / 重量", value: "14.1m / 17.9t" },
              { label: "動力", value: "霊気炉「護衡心」改" },
              { label: "主素材", value: "崑崙神鉄・星辰玉髄" },
              { label: "所属", value: "玉虚宮・崑崙山金光洞" },
              { label: "主要法宝", value: "斬仙剣（レーザー切断ファンネル）" }
            ],
            doctrineTitle: "運用ドクトリン: 切断・精密制圧",
            doctrineText: "広成子の春天印が「圧塊・質量制圧」を主とするのに対し、玉鼎真人は「切断・精密制圧」を主眼とする。多数の斬仙剣を同時制御する術式回路を全身に内蔵し、闘域を刃線で支配する。",
            relicStory: {
              tag: "INDIVIDUAL LOG // GYOKUTEI-01",
              title: "崑崙十二仙・玉鼎門弟子",
              text: "「玉虚宮の高弟にして、斬仙剣の使い手。斬仙剣を数多く翳起し、自在に操りて敵を切断する遠距離戦闘を得意とする。広成子と同じく、崑崙十二仙の一人として数多の戦いに参した。」"
            }
          }
        ]
      },
      {
        factionName: "截教・金鰲島系",
        factionCode: "DIV-03-B // JIEJIAO JIN'AO",
        mechaList: [
          {
            name: "金光仙 [JIN GUANG XIAN]",
            image: "jinguangxian.png",
            specs: [
              { label: "分類 / 所属", value: "截教 基本機 / 金鰲島・截教" },
              { label: "全高 / 重量", value: "14.2m / 28.6t" },
              { label: "動力コア", value: "仙人骨コア・システム（正体: 金毛犼の仙骨）" },
              { label: "操縦方式", value: "疑似仙骨回路経由 精神波感応（無仙骨者/人間操縦）" },
              { label: "主要法宝", value: "金光咆哮 / 金光輪（浮遊多用途光輪） / 縛雷鎖 / 浮遊符装甲" },
              { label: "可動機構", value: "術式展開状態 ➔ 高速突進状態" }
            ],
            doctrineTitle: "運用ドクトリン: 仙人骨駆動・術式咆哮強襲",
            doctrineText: "有仙骨者に頼らず、金鰲島の技術により霊獣「金毛犼」の仙人骨を精製・結晶化して中枢コアに搭載。無仙骨者（一般兵）が疑似仙骨回路を介して操縦する。コアと共鳴させた「金光咆哮」による広域精神波干渉と、多用途「金光輪」、符装甲展開による高速突進で敵陣を両断する。",
            relicStory: {
              tag: "INDIVIDUAL LOG // JINGUANGXIAN-03",
              title: "咆哮する金毛の生体核",
              text: "東シナ海海床の沈没建造物より出土。胸部装甲内部に精製・結晶化された霊獣金毛犼の仙人骨が直接埋め込まれており、起動試験時には生体の叫びのような超高周波パルスを放出して観測機器を麻痺させた。"
            }
          },
          {
            name: "王貴人 [WÁNG GUÌRÉN]",
            image: "wangguiren.png",
            specs: [
              { label: "所属 / 操者", value: "金鰲島・截教 / 無仙骨者（人間）" },
              { label: "正体 / 全高", value: "玉石琵琶精 / 13.8m" },
              { label: "重量", value: "26.2t" },
              { label: "動力コア", value: "玉石琵琶の仙骨（下腹部露出搭載・器物由来コア）" },
              { label: "構造特徴", value: "細身胴体構造 / 前凸胸部装甲 / 張出腰部フレーム" },
              { label: "武装 / 能力", value: "武装無し / 精神波干渉・幻惑・魅了" }
            ],
            doctrineTitle: "運用ドクトリン: 器物仙骨共鳴・精神波干渉",
            doctrineText: "金鰲島の仙骨コア技術における「器物由来コア」を用いた女性形機体。玉石琵琶そのものが仙骨コアであるため外部武装を一切持たず、下腹部コアの純粋な霊気・精神波を機体能力の源とする。華麗な外観の裏に、未知の能力と目的を秘めた謎多き存在。",
            relicStory: {
              tag: "INDIVIDUAL LOG // WANGGUIREN-03",
              title: "沈黙する玉石の音叉",
              text: "下腹部に露出した淡い紫の結晶コアは、長年の通霊によって仙骨化した器物そのもの。外部火器を一切持たないにもかかわらず、周囲のパイロットの精神同調率を狂わせる強力な共鳴波を発生させ続けている。"
            }
          }
        ]
      }
    ],
    story: {
      tag: "REGION SURVEY // SECTOR-03 OVERVIEW",
      title: "中国大陸 仙界法宝・生体工学調査総括",
      text: "中国大陸地域では、自らの修練と法宝による空間制御を極めた「闡教（崑崙系）」と、霊獣や器物の仙骨をコアとして抽出し一般兵の操縦を可能にした「截教（金鰲島系）」という、対照的な二大技術体系が発掘されている。"
    }
  },
  {
    id: "sector-iraq",
    mythBadge: "MESOPOTAMIA MYTH",
    btnLabel: "イラク",
    sectorTag: "SECTOR 04 // MESOPOTAMIA",
    sectorName: "イラク",
    lat: 33.3,
    lon: 44.3,
    theme: {
      accent: "#b45309",
      pattern: "pattern-stepped",
      symbol: "▼",
      code: "ZIGGURAT_LAYER"
    },
    subFactions: [
      {
        factionName: "アヌンナキ神権序列",
        factionCode: "DIV-04 // ANUNNAKI",
        mechaList: [
          {
            name: "エンリル [ENLIL]",
            image: "enlil.png",
            specs: [
              { label: "全高 / 重量", value: "14.0m / 不明（重戦闘型）" },
              { label: "装甲構造", value: "積層装甲構造（大判蛇腹状装甲）" },
              { label: "主武装", value: "シックルソード（鎌剣） / 肩部風圧兵装" },
              { label: "脚部機構", value: "踵部大型単輪タイヤ ＋ くるぶし鎌" }
            ],
            doctrineTitle: "運用ドクトリン: 歩く要塞・戦艦型ドクトリン",
            doctrineText: "鈍重ながら圧倒的な装甲厚と肩部風圧砲で正面を維持・粉砕。接近を試みた敵をシックルソードと踵の鎌で引き裂く。",
            relicStory: {
              tag: "INDIVIDUAL LOG // ENLIL-01",
              title: "泥土の巨神と単輪の轍",
              text: "チグリス川下流域のジグラット最深部より出土。蛇腹状の重装甲ブロックは現代の冶金技術でも再現不可能な積層密度を誇り、踵の単輪タイヤには太古の砂漠を踏破した摩耗痕が残る。"
            }
          },
          {
            name: "ヌスク [NUSKU / NUSKA]",
            image: "nusku.png",
            specs: [
              { label: "全高 / 分類", value: "13.2m / メソポタミア神格機・神使機（sukkal）" },
              { label: "重量", value: "不明（推定：中重量級）" },
              { label: "所属", value: "メソポタミア神群" },
              { label: "主武装", value: "主武装：シックルブレード" },
              { label: "灯火システム", value: "右肩：投光ライトユニット / 左肩：神火炉ユニット / 左前腕：火炎投射機構" }
            ],
            doctrineTitle: "灯火・索敵・制圧支援ドクトリン",
            doctrineText: "夜間索敵、戦場場の照明、敵陣の焼却、主神エンリルへの情報伝達を主目的とする。単独でも高い制圧力を持つが、エンリル機の先導・支援として運用される。",
            relicStory: {
              tag: "INDIVIDUAL LOG // NUSKU-01",
              title: "闇を焼き払う神使の機体",
              text: "火と光の神、エンリルの神聖なる従者。夜を照らし、敵を焼き払い、主の意志を伝える神使の機体。口は存在せず、一文字のsensor-slitにより周囲を観測する。胴部の艦装甲はエンリルより短く、密に配列される。"
            }
          }
        ]
      }
    ],
    story: {
      tag: "REGION SURVEY // SECTOR-04 OVERVIEW",
      title: "イラク メソポタミア楔形重装甲群調査総括",
      text: "チグリス・ユーフラテス川流域の古代地層から発掘される遺物は、機動性を度外視した圧倒的な装甲厚を備えている。要塞や神殿の守護を目的とした「動く防壁」としての設計思想が顕著である。"
    }
  },
  {
    id: "sector-egypt",
    mythBadge: "EGYPT MYTH",
    btnLabel: "エジプト",
    sectorTag: "SECTOR 05 // NILE BASIN",
    sectorName: "エジプト",
    lat: 26.8,
    lon: 30.8,
    theme: {
      accent: "#f59e0b",
      pattern: "pattern-cartouche",
      symbol: "☥",
      code: "SOLAR_DISC"
    },
    subFactions: [
      {
        factionName: "ヘリオポリス",
        factionCode: "DIV-05 // ENNEAD",
        mechaList: [
          {
            name: "ホルス [HORUS]",
            image: "horus.png",
            specs: [
              { label: "全高 / 分類", value: "14.0m / 天空戦・高機動型" },
              { label: "主武装", value: "ホルスの槍 / 羽型ハンド（エネルギー刃）" },
              { label: "特殊形態", value: "飛行形態（ホルス・フライト）" },
              { label: "脚部", value: "逆関節脚（跳躍・高把持力爪）" }
            ],
            doctrineTitle: "運用ドクトリン: 王権の守護者・制空支配",
            doctrineText: "ウラエウス（聖蛇）による精神波増幅と超高感度センサーを用い、上空からの精密急降下攻撃で敵の指揮中枢を壊滅させる。",
            relicStory: {
              tag: "INDIVIDUAL LOG // HORUS-01",
              title: "黄金の天翔ける隼",
              text: "王家の谷地下、反り上がった姿勢のまま密閉棺に収められていた。額のウラエウス（聖蛇）センサーが光を捉えた瞬間、全身のラピスラズリ装甲が励起し、即時飛行可能な状態へ復元した。"
            }
          }
        ]
      },
      {
        factionName: "エジプト神系・セト派閥",
        factionCode: "DIV-05-B // SETH",
        mechaList: [
          {
            id: "seth-03",
            name: "セト（セト獣神機） [SETH / THIRD GEN]",
            image: "seth.png",
            specs: [
              { label: "全高 / 分類", value: "14.0m / 乱戦・攪乱・暗殺・混沌戦" },
              { label: "重量", value: "29.6t" },
              { label: "主動力", value: "神力機関・外部補助動力パイプ" },
              { label: "武装", value: "短槍 / マニピュレーター・クロー" }
            ],
            doctrineTitle: "砂塵支配・近接破壊ドクトリン",
            doctrineText: "セト獣の身体特性を継承した人型機体。ホルス機と同一の基本骨格を持ち、S字逆反り姿勢と逆関節脚により俊敏な突進と跳躍を可能とする。肩甲骨部のサンドストーム・ジェネレーターで戦域を砂塵で支配し、混乱の中で敵を狩る。",
            relicStory: {
              tag: "INDIVIDUAL LOG // SETH-01",
              title: "砂漠の深層に潜む混沌の爪",
              text: "「砂漠の深層地下遺跡より出土。肩甲骨の排出ダクトから高圧で局所的な砂塵の嵐を発生させ、前腕部から大型クローを展開して装甲を裂き、フレームを握り潰す。」"
            }
          }
        ]
      }
    ],
    story: {
      tag: "REGION SURVEY // SECTOR-05 OVERVIEW",
      title: "ナイル流域 エジプト王権守護航空機体調査総括",
      text: "ピラミッドや神殿地下から発見される機体群は、金箔とラピスラズリでコーティングされた極めて高精度な空力・光学制御構造を持つ。王権の象徴としての威容と、砂漠の上空から戦局を俯瞰・急襲する制空思想が一体化している。"
    }
  },
  {
    id: "sector-india",
    mythBadge: "VEDIC MYTH",
    btnLabel: "インド",
    sectorTag: "SECTOR 06 // INDUS VALLEY",
    sectorName: "インド",
    lat: 30.1,  // ヴェーダ発祥の地（パンジャーブ・サラスヴァティー流域付近）
    lon: 76.8,
    theme: {
      accent: "#a855f7",
      pattern: "pattern-mandala",
      symbol: "☸",
      code: "PRANA_CHAKRA"
    },
    subFactions: [
      {
        factionName: "ヴェーダ",
        factionCode: "DIV-06 // LOKAPALA",
        mechaList: [
          {
            name: "ヴァーユ [VAYU]",
            image: "vayu.png",
            specs: [
              { label: "全高 / 分類", value: "14.0m / 天空神・風神・気神" },
              { label: "主能力", value: "風の運用・気流操作・バリア展開" },
              { label: "共通機構", value: "丸型ショルダーバリア（高出力エネルギー障壁）" },
              { label: "固有装備", value: "風袋（ふうたい / 圧縮気流タンク）" }
            ],
            doctrineTitle: "運用ドクトリン: プラーナ循環・三次元噴射",
            doctrineText: "装甲を持たない腹部からプラーナを循環・放出し、風袋による三次元噴射と高圧衝撃波で戦場全域の気流を支配する。",
            relicStory: {
              tag: "INDIVIDUAL LOG // VAYU-01",
              title: "白亜の循環炉と風の球体",
              text: "インダス渓谷の地下回廊で発見。腹部装甲が存在せず、露出したプラーナ導管が常に微弱な吸排気を繰り返している。背部の球体タンクからは未知の圧縮ガスが今なお微量に漏出し続けている。"
            }
          }
        ]
      },
      {
        factionName: "ドゥルガー系機体",
        factionCode: "DIV-06-B // DURGA",
        mechaList: [
          {
            name: "カーリー [KÄLĪ]",
            image: "kali.png",
            specs: [
              { label: "全高 / 重量", value: "14.0m / 33.6t" },
              { label: "所属", value: "ドゥルガー系・アスラ派閥 異端朧讃機体フレーム" },
              { label: "主な役割 / 動力", value: "白兵戦・殲滅戦 / 情動感応炉（感情共振型炉心）" },
              { label: "操縦方式", value: "情動感応型・自律駆動" },
              { label: "搭乗者", value: "適性を持つ者（パイロットの恐怖・パニック・激昂が暴走のトリガーとなる）" }
            ],
            doctrineTitle: "運用ドクトリン: 全方位斬撃・六臂連撃",
            doctrineText: "ヴェーダ系の共通技術基盤を持ちつつ、ドゥルガー系の思想により再構築された異端機体。装甲は岩を削り出したような大質の質感で構成され、無骨さと信仰の恐怖を体現する。肩のバリア発生装置は共通機構を継承している。",
            relicStory: {
              tag: "INDIVIDUAL LOG // KALI-01",
              title: "破壊と時の女神の狂気",
              text: "「戦場で沸点に達した恐怖と憤怒を引き金に、機体が自律的に暴走する呪われた兵器。」パイロットの恐怖が臨界を超えた瞬間、機体が意識を奪い、自律暴走を開始。人間としての理性ではなく、狂気と破壊の衝動のみで全方位を制圧する。"
            }
          }
        ]
      }
    ],
    story: {
      tag: "REGION SURVEY // SECTOR-06 OVERVIEW",
      title: "インダス水系 インド・プラーナ循環遺物調査総括",
      text: "インド亜大陸の超古代層から出土する機体は、外部からのエネルギー補給を必要とせず、大気中の霊気（プラーナ）を吸排・循環させる自己完結型の熱流体システムを備えている。"
    }
  },
  {
    id: "sector-mexico",
    mythBadge: "MESOAMERICA",
    btnLabel: "メキシコ",
    sectorTag: "SECTOR 07 // MESOAMERICA",
    sectorName: "メキシコ",
    lat: 19.4,
    lon: -99.1,
    theme: {
      accent: "#10b981",
      pattern: "pattern-stepped",
      symbol: "❖",
      code: "SOLAR_CALENDAR"
    },
    subFactions: [
      {
        factionName: "創造神格系",
        factionCode: "DIV-07 // CREATOR CLASS",
        mechaList: [
          {
            name: "ケツァルコアルト [QUETZALCOATL]",
            image: "quetzalcoatl.png",
            specs: [
              { label: "全高 (頭頂部)", value: "14.0m / 重量: 不明" },
              { label: "機体方式", value: "精神波同期式コアドライブ" },
              { label: "群体ユニット", value: "ユーマ（羽の子 / スカイフィッシュ型小型群体）" },
              { label: "主能力", value: "風圧カッター / 気流竜巻 / 再生フィールド" }
            ],
            doctrineTitle: "運用ドクトリン: 循環・群体攪乱・再生",
            doctrineText: "破壊よりも秩序の再構築を重視。自らの羽根から数十機の小型群体「ユーマ」を生成・放出し、風の循環で包み込んで敵を削り制圧する。",
            relicStory: {
              tag: "INDIVIDUAL LOG // QUETZALCOATL-01",
              title: "緑青の羽毛と自律群体ユニット",
              text: "ユカタン半島の密林に沈むピラミッド内部にて出土。蛇状のフレームに結合された無数の羽毛状パーツは、分離して自律飛行するナノマシン群体（ユーマ）であることが確認された。"
            }
          },
          {
            name: "トラロック [TLALOC]",
            image: "tlaloc.png",
            specs: [
              { label: "全高 / 分類", value: "14.0m / 雨神・雷神機" },
              { label: "所属", value: "メソアメリカ神話圏 / 第三の太陽の雨神" },
              { label: "主な役割", value: "気象掌握・雨の支配・生贄の儀式・吸魂の保護" },
              { label: "動力 / 操縦", value: "信仰コア / 祭祀動力炉 / 神官による降神儀式" },
              { label: "主武装", value: "蛇杖（電撃発生器） / 黒曜石刃（祭祀の刃）" }
            ],
            doctrineTitle: "運用ドクトリン: 電撃解放・生贄儀式・獣の歩法",
            doctrineText: "第三の太陽時代の機体は、まだ神を機械として完全に理解していない。そのため、防御を頭部に集中させ、他の部位は最小限の装甲のみ。神の霊力を受ける器としての機能が優先されている。洗練される前の、始呪的で呪術的な神機の姿である。",
            relicStory: {
              tag: "INDIVIDUAL LOG // TLALOC-01",
              title: "第三の太陽の雨神",
              text: "「第三の太陽時代に顕現した雨の支配者。巨大な仮面が盾となり、雷を呼ぶ蛇杖を振るう。生贄の血と共に大地を潤し、山と雲を従える。」"
            }
          }
        ]
      }
    ],
    story: {
      tag: "REGION SURVEY // SECTOR-07 OVERVIEW",
      title: "メキシコ熱帯雨林 太陽暦・群体生体兵器調査総括",
      text: "熱帯雨林地帯の遺跡群から発掘された機体は、単騎の打撃力ではなく、自律群体ユニットの展開による空間掌握と自己修復フィールドの形成に特化している。"
    }
  },
  {
    id: "sector-japan",
    mythBadge: "SHINTO MYTH",
    btnLabel: "日本",
    sectorTag: "SECTOR 08 // FAR EAST ARCHIPELAGO",
    sectorName: "日本",
    lat: 35.0,
    lon: 135.7,
    theme: {
      accent: "#c9a063",
      pattern: "pattern-spiral",
      symbol: "◎",
      code: "SHIMENAWA_SPIRAL"
    },
    subFactions: [
      {
        factionName: "天津神系",
        factionCode: "DIV-08 // KOTOAMATSUKAMI",
        mechaList: [
          {
            name: "イザナギ [IZANAGI]",
            image: "izanagi.png",
            specs: [
              { label: "分類 / 全高", value: "日本系 基準機 / 18.2m" },
              { label: "重量", value: "63.8t" },
              { label: "動力 / 操縦", value: "タマノオロチ式 可変精神波炉 / ヤオヨロズ式 精神感応操縦" },
              { label: "構造特徴", value: "貫頭衣型 前面一枚装甲 ＋ 背面素体露出 / 注連縄状閉ループ動力パイプ" },
              { label: "主兵装", value: "直刀【アメノムラクモノツルギ】/ 結界展開" }
            ],
            doctrineTitle: "運用ドクトリン: 創世結界・直刀制圧",
            doctrineText: "日本の創世神の名を冠する最初の基準機。胸部の勾玉コアから注連縄状の閉ループ多層パイプを通じて全身へ精神波動を循環。反りを持たない完全直刀による精密斬撃と、広域結界展開による空間掌握を得意とする。",
            relicStory: {
              tag: "INDIVIDUAL LOG // IZANAGI-01",
              title: "淡路岩戸の白磁一枚甲",
              text: "淡路島深層の巨石岩戸より出土。貫頭衣を模した白磁の装甲下から伸びる注連縄状のパイプ群は、発掘から数十年を経た現在もなお微弱な神気を放出し続けている。"
            }
          },
          {
            name: "天手力男 [AMENOTAJIKARAO]",
            image: "tajikarao.png",
            specs: [
              { label: "世代 / 所属", value: "天津神系譜 第二世代機 / 天津神軍・機動神兵群" },
              { label: "全高 / 重量", value: "14.0m / 32.6t" },
              { label: "主な役割", value: "突破・投擲・組み付き戦闘（怪力特化型重装フレーム）" },
              { label: "動力", value: "神力増幅機構 ＋ 外部動力源パイプ" },
              { label: "操者", value: "力自慢の者（高出力適性必須）" },
              { label: "機体思想", value: "武器を持たず、全身の質量を推進力・衝撃力に変換する素手格闘特化" }
            ],
            doctrineTitle: "運用ドクトリン: 重装格闘・質量粉砕",
            doctrineText: "イザナギの第二〜三世代機として開発された怪力特化型重装フレーム。前世代の思想を継承しつつ駆動系を大幅に強化。武器を持たないことにより両腕と全身の自由度と出力を最大化し、組み付き・掴み・投擲・押し込み・叩き潰すなどの白兵戦において圧倒的な怪力を発揮する。",
            relicStory: {
              tag: "INDIVIDUAL LOG // TAJIKARAO-02",
              title: "岩戸を抉る巨甲の剛腕",
              text: "高千穂峡深部の崩落岩盤下より発掘。武器を保持するマニピュレータを持たず、岩塊をそのまま握り潰したかのような掌部装甲の圧壊痕が確認された。背部の太い動力源パイプは、稼働時に周囲の空間圧力を急上昇させる。"
            }
          }
        ]
      },
      {
        factionName: "国津神系",
        factionCode: "DIV-08-B // KUNITSUKAMI",
        mechaList: [
          {
            name: "猿田彦 [SARUTAHIKO]",
            image: "sarutahiko.png",
            specs: [
              { label: "分類 / 世代", value: "国津神系譜 第一世代機 / 日本系 基準機" },
              { label: "全高 / 重量", value: "16.8m / 58.7t" },
              { label: "所属", value: "国津神陣営" },
              { label: "主な役割", value: "先導・開関・道案内" },
              { label: "動力 / 操者", value: "タマノオロチ式可変精神波炉 / 力自慢の者（高出力適性必須）" },
              { label: "主兵装 / 副兵装", value: "ヒラクサノ剣（道開の太刀） / トオリミチノ矛" }
            ],
            doctrineTitle: "運用ドクトリン: 先導突破・開関・道案内",
            doctrineText: "道を開き、邪を敵い、神々を導く者。古代の武装を纏い、先頭に立って戦場を切り拓く。先の時代に備えた鍛装備と、日本独自の動力技術を融合した国津神系の第一号機体。天狗の鼻を思わせる前方突頭部を持ち、外部動力パイプによる装甲接続構造を持つ。",
            relicStory: {
              tag: "INDIVIDUAL LOG // SARUTAHIKO-01",
              title: "道を開く天狗の鼻を持つ先導機",
              text: "「猿田彦は国津神系の先導機体であり、古代日本の鎧装思想と天津神系の共通扶枢を融合したモデル。頭部の天狗的造形は、導き手としての威厳と鋭い先見性を象徴する。外部動力パイプによる装甲接続構造は、日本系機体の共通技術である。」"
            }
          }
        ]
      }
    ],
    story: {
      tag: "REGION SURVEY // SECTOR-08 OVERVIEW",
      title: "日本列島 日ノ本神代素体調査総括",
      text: "日本列島の深層岩戸から発掘された機体群は、他国の重装甲機と異なり、前面一枚の貫頭衣装甲と背面の剥き出し素体という特異な構造を持つ。閉ループパイプが特徴である。"
    }
  },
  {
    id: "sector-nigeria",
    mythBadge: "YORUBA MYTH",
    btnLabel: "ナイジェリア",
    sectorTag: "SECTOR 09 // WEST AFRICA",
    sectorName: "ナイジェリア",
    lat: 9.0,
    lon: 7.5,
    theme: {
      accent: "#ea580c",
      pattern: "pattern-dot-concentric",
      symbol: "⚙",
      code: "NOK_FORGE"
    },
    subFactions: [
      {
        factionName: "オリシャ系 (ヨルバ)",
        factionCode: "DIV-09-A // ORISHA YORUBA",
        mechaList: [
          {
            name: "オグン [OGUN]",
            image: "ogun.png",
            specs: [
              { label: "所属 / 主神", value: "西アフリカ神話体系（ヨルバ） / 鉄と鍛冶・戦争と開拓の主神" },
              { label: "全高 / 重量", value: "14.0m / 23.8t" },
              { label: "主動力", value: "術者の精神波・生体エネルギー" },
              { label: "出力補助", value: "機体内蔵導増幅炉（非可視）" },
              { label: "操者", value: "鍛冶神官（オグンの選定者）" },
              { label: "主兵装", value: "開拓複合兵装（マチェーテ・モード ➔ アックス・モード）" },
              { label: "特殊機能", value: "電磁誘導赤熱エッジ / 打撃自己鍛造 / 背面鉄床（アンビル）" }
            ],
            doctrineTitle: "運用ドクトリン: 開拓と破壊・自己鍛造近接戦",
            doctrineText: "紀元前1000〜500年頃、石器から鉄器へと一気に飛躍した西アフリカ製鉄文化の始祖の力を体現。「鍛えることそのものを戦いとする」思想を持ち、打撃の衝撃熱と圧力で金属組織が密に鍛え直され、硬度と切れ味が持続的に向上する自己鍛造機構を備える。原生林を切り拓き、戦場に新たな道を穿つ。",
            relicStory: {
              tag: "INDIVIDUAL LOG // OGUN-01",
              title: "ノク土層の黒皮鋼と赤熱の刃",
              text: "ナイジェリア・ノク文化圏の古代製鉄炉跡深層より発掘。円筒形の頭部バイザーとテラコッタ幾何学レリーフを纏った黒皮鋼の巨躯は、発掘時の通電テストにおいて刃先を自発的に赤熱させ、周囲の鉄鉱石を瞬時に融解・再結晶化させた。"
            }
          }
        ]
      }
    ],
    story: {
      tag: "REGION SURVEY // SECTOR-09 OVERVIEW",
      title: "ナイジェリア ノク・ヨルバ製鉄文明調査総括",
      text: "ナイジェリア周辺のサバナ・熱帯雨林帯から出土する機体群は、超古代における製鉄技術の飛躍的特異点を象徴している。粘土装甲（テラコッタ）と黒皮鋼フレームの複合構造を持ち、戦闘の摩擦や衝撃熱を吸収して装甲と刃を自ら鍛え直す「自己鍛造炉」が最大の特徴である。"
    }
  },
  {
    id: "sector-persia",
    mythBadge: "PERSIAN MYTH",
    btnLabel: "ペルシャ",
    sectorTag: "SECTOR 10 // PERSIA",
    sectorName: "ペルシャ",
    lat: 32.4279,
    lon: 53.688,
    theme: {
      accent: "#e11d48",
      pattern: "pattern-mandala",
      symbol: "🔥",
      code: "AHURA_MAINYU"
    },
    subFactions: [
      {
        factionName: "ゾロアスター",
        factionCode: "DIV-10 // ZOROASTER",
        mechaList: [
          {
            name: "アフラ・マズダ [AHURA MAZDA]",
            image: "ahura_mazda.png",
            specs: [
              { label: "分類", value: "神機兵器 / 秩序型" },
              { label: "全高 / 重量", value: "14.0m / 不明" },
              { label: "動力源", value: "不明（超越的）" },
              { label: "乗員", value: "1名（胸部コックピット）" },
              { label: "外装 / 装飾", value: "パールホワイト / ゴールド" }
            ],
            doctrineTitle: "運用ドクトリン: 自己不変の理・絶対的秩序",
            doctrineText: "完全なる秩序を体現する神機。自己にのみ秩序を適用し、その身と武器を決して損なわせない。アフラ・マズダは、自らを「あるべき状態」から逸脱させない。装甲は傷つかず、武器は折れず、構造は常に完全な状態を保つ。",
            relicStory: {
              tag: "INDIVIDUAL LOG // AHURA-01",
              title: "秩序の神機",
              text: "「『秩序』の概念 —— 自己不変の理 —— アフラ・マズダの秩序により、絶対に折れず、曲がらず、欠けることもない。滑らかな曲面から、人体には存在し得ない鋭角的な装甲が自然に突出す。"
            }
          },
          {
            name: "アンラ・マンユ [ANRA MAINYU]",
            image: "anra_mainyu.png",
            specs: [
              { label: "分類", value: "対神兵器 / 侵食型" },
              { label: "全高 / 重量", value: "14.0m / 不明" },
              { label: "動力源", value: "不明（超越的）" },
              { label: "乗員", value: "1名（胸部コックピット）" },
              { label: "装甲表面", value: "黒真珠塗層（微細なパール粒子による干渉色）" }
            ],
            doctrineTitle: "運用ドクトリン: 侵食同化・静かな支配",
            doctrineText: "アンラ・マンユは、完成された秩序を象徴する漆黒の巨人。その存在は悪そのものではない。あらゆるものに「浸食」し、同化し、本来の姿を塗り替えていく。触れた者の構造・機能・意志にまで干渉し、自身の性質へと変質させる。それは破壊ではなく、静かな支配。",
            relicStory: {
              tag: "INDIVIDUAL LOG // ANRA-01",
              title: "破壊の精神・侵食の意志",
              text: "「アンラ・マンユの技術は『書き換え』の技術である。それは物質だけでなく、情報、機能、場合によっては彼の目的は破壊ではなく、世界を静かに“自分の形”へ浸食し、再構成することにある。」"
            }
          }
        ]
      }
    ],
    story: {
      tag: "REGION SURVEY // SECTOR-10 OVERVIEW",
      title: "ペルシャ高原 二元神格機調査総括",
      text: "ペルシャ高原の深層から発掘された対極的な二機の神機。完全な秩序と不変を貫くアフラ・マズダと、万物に浸食し書き換えるアンラ・マンユの存在は、古代ペルシャにおける宇宙観の根底をなす二元論的闘争が、そのまま超古代兵器の設計思想に反映されていたことを示している。"
    }
  },
  {
    id: "sector-hawaii",
    mythBadge: "POLYNESIAN MYTH",
    btnLabel: "ハワイ",
    sectorTag: "SECTOR 11 // POLYNESIAN",
    sectorName: "ハワイ",
    lat: 19.8968,
    lon: -155.5828,
    theme: {
      accent: "#d97724",
      pattern: "pattern-mandala",
      symbol: "🗿",
      code: "TIKI_MANA"
    },
    subFactions: [
      {
        factionName: "ポリネシア",
        factionCode: "DIV-11 // POLYNESIAN ALLIANCE",
        mechaList: [
          {
            name: "クー [KŪ]",
            image: "ku.png",
            specs: [
              { label: "分類 / 神格", value: "ハワイセクター 基準機 / ハワイ神話 戦神・政治神" },
              { label: "全高 / 重量", value: "19.2m / 78.4t" },
              { label: "所属", value: "ハワイセクター（ポリネシアン同盟）" },
              { label: "主な役割", value: "戦争・開拓・指揮弾・政治・守護" },
              { label: "動力", value: "マナ / 神力増幅炉・可変出力システム" },
              { label: "操者", value: "カフナ相当の資格者（心身の試練を経た戦士）" }
            ],
            doctrineTitle: "運用ドクトリン: 戦神突撃・マナ出力解放",
            doctrineText: "ハワイの男の力強さ、戦いの神の威厳を象徴する戦神の基準機。ハワイアンタトゥー調の文様を深く刻んだ装甲は、神の力の増幅と精神の具現。その巨躯と話は、海と大地を支配するクーの権威を示す。",
            relicStory: {
              tag: "INDIVIDUAL LOG // KU-01",
              title: "ハワイの男の力強さと戦いの神の威厳",
              text: "「クーの機体は、ハワイの男の力強さ、戦いの神の威厳を象徴する。装甲の文様は単なる美飾ではなく、神の系譜とマナの流動を刻んだ聖印である。頭部の仮面構造を最も強固にすることで、防御の中心を一点に集中させ、戦神としての突撃と捕縛能力を増大させる。この機体はハワイセクターの標準フレームであり、他の神々の機体設計の基礎となる。」"
            }
          }
        ]
      }
    ],
    story: {
      tag: "REGION SURVEY // SECTOR-11 OVERVIEW",
      title: "ハワイ諸島 マナ循環・タトゥー装甲調査総括",
      text: "ハワイおよびポリネシア全域の海底・火山層から発掘された機体群は、巨体と圧倒的な重量級フレームを特徴とする。全身に刻まれた幾何学的なタトゥーモールドは、マナ（生命エネルギー）の流動を制御する高度な導電路として機能する。"
    }
  }
];
