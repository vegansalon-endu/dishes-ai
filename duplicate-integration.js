const fs = require('fs');

// 分析結果を読み込み
const analysisData = JSON.parse(fs.readFileSync('./analysis-result.json', 'utf8'));

console.log('=== Phase 1: 完全重複調査と統合ルール策定 ===');

// 統合ルール定義
const integrationRules = [
  // 既知の重複
  {
    canonical: 'とんかつ',
    duplicates: ['豚カツ'],
    reason: '同一料理の表記揺れ（カタカナ/漢字）'
  },
  {
    canonical: '焼き魚',
    duplicates: ['焼き鮭'],
    reason: '一般名と具体名の統合（焼き魚に統合）'
  },
  {
    canonical: '生姜焼き',
    duplicates: ['豚の生姜焼き'],
    reason: '略称と正式名の統合（略称に統合）'
  },
  {
    canonical: 'チャーハン',
    duplicates: ['チャーハン（焼き飯）'],
    reason: '同一料理の表記揺れ（カッコ付き説明を削除）'
  },
  
  // 類似料理の統合ルール
  {
    canonical: '味噌汁',
    duplicates: ['豆腐とわかめの味噌汁', '小松菜と豆腐の味噌汁', '豆腐と卵の味噌汁', '白菜としめじの味噌汁'],
    reason: '基本料理と具体的バリエーションの統合'
  },
  {
    canonical: 'だし巻き卵',
    duplicates: ['卵焼き・だし巻き卵', '卵焼き'],
    reason: '類似料理の統合（より具体的な名称に統合）'
  },
  {
    canonical: 'いなり寿司',
    duplicates: [],
    reason: '寿司の具体的な種類として独立維持'
  },
  {
    canonical: 'ちらし寿司',
    duplicates: [],
    reason: '寿司の具体的な種類として独立維持'
  },
  {
    canonical: '手巻き寿司',
    duplicates: [],
    reason: '寿司の具体的な種類として独立維持'
  },
  {
    canonical: 'ハンバーグ',
    duplicates: ['豆腐ハンバーグ'],
    reason: '基本料理とバリエーションの統合'
  },
  {
    canonical: 'うどん',
    duplicates: ['味噌煮込みうどん', '焼きうどん', '肉うどん'],
    reason: '基本料理と調理法バリエーションの統合'
  },
  {
    canonical: 'ラーメン',
    duplicates: ['味噌ラーメン（袋麺）'],
    reason: '基本料理と具体的バリエーションの統合'
  },
  {
    canonical: 'おにぎり',
    duplicates: ['焼きおにぎり'],
    reason: '基本料理と調理法バリエーションの統合'
  },
  {
    canonical: 'コロッケ',
    duplicates: ['カニクリームコロッケ'],
    reason: '基本料理と具体的バリエーションの統合'
  },
  {
    canonical: 'そば',
    duplicates: ['ざるそば'],
    reason: '基本料理と調理法バリエーションの統合'
  },
  {
    canonical: '焼きそば',
    duplicates: ['あんかけ焼きそば'],
    reason: '基本料理と調理法バリエーションの統合'
  },
  {
    canonical: 'シチュー',
    duplicates: ['クリームシチュー'],
    reason: '基本料理と具体的バリエーションの統合'
  },
  {
    canonical: 'きんぴらごぼう',
    duplicates: ['キンピラごぼう'],
    reason: '同一料理の表記揺れ（ひらがな/カタカナ）'
  },
  {
    canonical: 'ホイコーロー',
    duplicates: ['回鍋肉（ホイコーロー）', '回鍋肉'],
    reason: '同一料理の表記揺れ（カタカナ/漢字）'
  },
  {
    canonical: '鶏の照り焼き',
    duplicates: ['鶏の照り焼き丼'],
    reason: '基本料理と丼バリエーションの統合'
  },
  {
    canonical: '青椒肉絲',
    duplicates: ['青椒肉絲（チンジャオロース）'],
    reason: '同一料理の表記揺れ（読み仮名削除）'
  },
  {
    canonical: '春巻き',
    duplicates: ['生春巻き'],
    reason: '基本料理と調理法バリエーションの統合'
  },
  {
    canonical: '炊き込みご飯',
    duplicates: ['きのこ炊き込みご飯'],
    reason: '基本料理と具体的バリエーションの統合'
  },
  {
    canonical: '切り干し大根',
    duplicates: ['切り干し大根の煮物'],
    reason: '基本食材と調理法バリエーションの統合'
  },
  {
    canonical: '棒棒鶏',
    duplicates: ['棒棒鶏（バンバンジー）'],
    reason: '同一料理の表記揺れ（読み仮名削除）'
  },
  {
    canonical: '納豆ご飯',
    duplicates: ['納豆'],
    reason: 'より具体的な食べ方に統合'
  },
  {
    canonical: '豚キムチ',
    duplicates: ['豚キムチ炒め'],
    reason: '略称と正式名の統合'
  },
  {
    canonical: 'コーヒー',
    duplicates: ['アイスコーヒー'],
    reason: '基本飲料と温度バリエーションの統合'
  },
  {
    canonical: 'もやし炒め',
    duplicates: ['明太もやし炒め'],
    reason: '基本料理と具体的バリエーションの統合'
  }
];

// 統合処理を実行
function integrateDishesByRules(allDishes, rules) {
  const integratedDishes = [...allDishes];
  const integrationLog = [];
  
  rules.forEach(rule => {
    rule.duplicates.forEach(duplicate => {
      // duplicateをcanonicalに統合
      const duplicateIndices = [];
      integratedDishes.forEach((dish, index) => {
        if (dish.name === duplicate) {
          duplicateIndices.push(index);
        }
      });
      
      if (duplicateIndices.length > 0) {
        // duplicateをcanonicalに変更
        duplicateIndices.forEach(index => {
          const oldName = integratedDishes[index].name;
          integratedDishes[index].name = rule.canonical;
          integrationLog.push({
            from: oldName,
            to: rule.canonical,
            reason: rule.reason,
            ai: integratedDishes[index].ai,
            rank: integratedDishes[index].rank
          });
        });
      }
    });
  });
  
  return { integratedDishes, integrationLog };
}

// 統合実行
const result = integrateDishesByRules(analysisData.allDishes, integrationRules);
const { integratedDishes, integrationLog } = result;

console.log('\n=== 統合結果 ===');
console.log('統合処理数:', integrationLog.length);
integrationLog.forEach((log, index) => {
  console.log(`${index + 1}. "${log.from}" → "${log.to}" (${log.ai}, ${log.rank}位) [${log.reason}]`);
});

// 統合後の料理数計算
const integratedDishCounts = {};
integratedDishes.forEach(dish => {
  integratedDishCounts[dish.name] = (integratedDishCounts[dish.name] || 0) + 1;
});

const uniqueIntegratedNames = Object.keys(integratedDishCounts);
console.log('\n=== 統合後統計 ===');
console.log('統合前ユニーク料理数:', analysisData.uniqueDishNames.length);
console.log('統合後ユニーク料理数:', uniqueIntegratedNames.length);
console.log('削減された料理数:', analysisData.uniqueDishNames.length - uniqueIntegratedNames.length);

// スコア計算関数
function calculateScore(dishName, dishes) {
  const dishEntries = dishes.filter(d => d.name === dishName);
  const aiCount = [...new Set(dishEntries.map(d => d.ai))].length;
  const avgRank = dishEntries.reduce((sum, d) => sum + d.rank, 0) / dishEntries.length;
  
  const commonBonus = aiCount * 100;
  const rankBonus = (11 - avgRank) * 20;
  const totalScore = commonBonus + rankBonus;
  
  return {
    dishName,
    aiCount,
    avgRank: Math.round(avgRank * 10) / 10,
    commonBonus,
    rankBonus: Math.round(rankBonus * 10) / 10,
    totalScore: Math.round(totalScore * 10) / 10,
    appearances: dishEntries.map(d => ({ ai: d.ai, rank: d.rank }))
  };
}

// 全料理のスコア計算
const scoredDishes = uniqueIntegratedNames.map(name => 
  calculateScore(name, integratedDishes)
).sort((a, b) => b.totalScore - a.totalScore);

console.log('\n=== TOP20 スコアランキング ===');
scoredDishes.slice(0, 20).forEach((dish, index) => {
  console.log(`${index + 1}. ${dish.dishName} (スコア: ${dish.totalScore}, AI数: ${dish.aiCount}, 平均順位: ${dish.avgRank})`);
});

// 結果をエクスポート
const finalResult = {
  metadata: {
    ...analysisData.metadata,
    integrationDate: new Date().toISOString().split('T')[0],
    totalDishesBeforeIntegration: analysisData.uniqueDishNames.length,
    totalDishesAfterIntegration: uniqueIntegratedNames.length,
    integrationsPerformed: integrationLog.length
  },
  integrationRules,
  integrationLog,
  integratedDishes,
  scoredDishes,
  top100: scoredDishes.slice(0, 100)
};

fs.writeFileSync('./integration-result.json', JSON.stringify(finalResult, null, 2));
console.log('\n統合結果をintegration-result.jsonに保存しました。');