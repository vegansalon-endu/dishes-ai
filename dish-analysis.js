const fs = require('fs');

// dishes-data.jsonを読み込み
const data = JSON.parse(fs.readFileSync('./data/dishes-data.json', 'utf8'));

console.log('=== データ構造分析 ===');
console.log('AIの種類:', Object.keys(data.aiResults));

// 各AIの料理数を確認
Object.keys(data.aiResults).forEach(ai => {
  const dishes = data.aiResults[ai].dishes;
  console.log(`${ai}: ${dishes.length}件の料理`);
});

// 全料理を収集
const allDishes = [];
Object.keys(data.aiResults).forEach(ai => {
  const dishes = data.aiResults[ai].dishes;
  dishes.forEach(dish => {
    allDishes.push({
      ai: ai,
      rank: dish.rank,
      name: dish.name,
      description: dish.description || '',
      category: dish.category || '',
      type: dish.type || ''
    });
  });
});

console.log('\n=== 全料理統計 ===');
console.log('総料理数:', allDishes.length);

// 料理名の一意リストを作成
const uniqueDishNames = [...new Set(allDishes.map(dish => dish.name))];
console.log('ユニーク料理名数:', uniqueDishNames.length);

// 既知の重複を確認
const knownDuplicates = [
  ['豚カツ', 'とんかつ'],
  ['焼き魚', '焼き鮭'],
  ['豚の生姜焼き', '生姜焼き'],
  ['チャーハン', 'チャーハン（焼き飯）']
];

console.log('\n=== 既知重複確認 ===');
knownDuplicates.forEach((pair, index) => {
  const [name1, name2] = pair;
  const count1 = allDishes.filter(dish => dish.name === name1).length;
  const count2 = allDishes.filter(dish => dish.name === name2).length;
  console.log(`${index + 1}. "${name1}" (${count1}件) ⇔ "${name2}" (${count2}件)`);
});

// 類似料理名を検索（部分一致）
console.log('\n=== 類似料理名検索 ===');
const similarities = [];
uniqueDishNames.forEach((name1, i) => {
  uniqueDishNames.forEach((name2, j) => {
    if (i < j) {
      // 片方が他方を含む場合
      if (name1.includes(name2) || name2.includes(name1)) {
        similarities.push([name1, name2]);
      }
      // カタカナ・ひらがな・漢字の変換チェック（簡易版）
      const kana1 = name1.replace(/[あ-ん]/g, match => String.fromCharCode(match.charCodeAt(0) + 0x60));
      const kana2 = name2.replace(/[あ-ん]/g, match => String.fromCharCode(match.charCodeAt(0) + 0x60));
      if (kana1 === kana2 && name1 !== name2) {
        similarities.push([name1, name2]);
      }
    }
  });
});

console.log('発見された類似料理:', similarities.length, '組');
similarities.forEach((pair, index) => {
  const [name1, name2] = pair;
  const count1 = allDishes.filter(dish => dish.name === name1).length;
  const count2 = allDishes.filter(dish => dish.name === name2).length;
  console.log(`${index + 1}. "${name1}" (${count1}件) ⇔ "${name2}" (${count2}件)`);
});

// 料理名ソート（出現頻度順）
const dishCounts = {};
allDishes.forEach(dish => {
  dishCounts[dish.name] = (dishCounts[dish.name] || 0) + 1;
});

console.log('\n=== 出現頻度上位20 ===');
const sortedDishes = Object.entries(dishCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 20);

sortedDishes.forEach(([name, count], index) => {
  console.log(`${index + 1}. ${name}: ${count}回`);
});

// データを詳細解析用にエクスポート
const analysisData = {
  metadata: data.metadata,
  statistics: {
    totalDishes: allDishes.length,
    uniqueNames: uniqueDishNames.length,
    aiCount: Object.keys(data.aiResults).length
  },
  allDishes: allDishes,
  uniqueDishNames: uniqueDishNames,
  knownDuplicates: knownDuplicates,
  similarities: similarities,
  dishCounts: dishCounts
};

fs.writeFileSync('./analysis-result.json', JSON.stringify(analysisData, null, 2));
console.log('\n分析結果をanalysis-result.jsonに保存しました。');