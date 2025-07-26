const fs = require('fs');
const data = JSON.parse(fs.readFileSync('data/integrated-dishes-ranking.json', 'utf8'));

console.log('=== DUPLICATE ANALYSIS ===\n');

// Extract all dish names from the ranking
const dishes = data.full_analysis.top100_ranking.map(dish => ({
  rank: dish.rank,
  name: dish.name,
  score: dish.score,
  aiCount: dish.aiCount
}));

// Check for exact duplicates
console.log('1. EXACT DUPLICATE NAMES:');
const nameCount = {};
dishes.forEach(dish => {
  nameCount[dish.name] = (nameCount[dish.name] || []).concat(dish);
});

const exactDuplicates = Object.entries(nameCount).filter(([name, occurrences]) => occurrences.length > 1);
if (exactDuplicates.length > 0) {
  exactDuplicates.forEach(([name, occurrences]) => {
    console.log(`- ${name}: appears ${occurrences.length} times`);
    occurrences.forEach(dish => {
      console.log(`  Rank ${dish.rank}: score ${dish.score}, ${dish.aiCount} AIs`);
    });
  });
} else {
  console.log('No exact duplicate names found.');
}

console.log('\n2. SIMILAR DISH ANALYSIS:');

// Define similarity patterns
const similarityPatterns = [
  {pattern: /^.*煮物.*$/, category: '煮物系'},
  {pattern: /^.*炒め.*$/, category: '炒め物系'},
  {pattern: /^.*焼き.*$/, category: '焼き物系'},
  {pattern: /^.*の.*煮.*$/, category: '煮込み系'},
  {pattern: /^.*うどん.*$/, category: 'うどん系'},
  {pattern: /^.*そば.*$/, category: 'そば系'},
  {pattern: /^.*ご飯.*$/, category: 'ご飯系'},
  {pattern: /^.*丼.*$/, category: '丼系'},
  {pattern: /^.*味噌.*$/, category: '味噌系'},
  {pattern: /^.*豆腐.*$/, category: '豆腐系'},
  {pattern: /^.*鶏.*$/, category: '鶏肉系'},
  {pattern: /^.*豚.*$/, category: '豚肉系'},
  {pattern: /^.*ラーメン.*$/, category: 'ラーメン系'},
  {pattern: /^.*スパゲ.*$/, category: 'パスタ系'},
  {pattern: /^.*カツ.*$/, category: 'カツ系'},
  {pattern: /^.*から.*揚げ.*$/, category: '唐揚げ系'},
  {pattern: /^.*コロッケ.*$/, category: 'コロッケ系'},
  {pattern: /^.*おにぎり.*$/, category: 'おにぎり系'},
  {pattern: /^.*かぼちゃ.*$/, category: 'かぼちゃ系'},
  {pattern: /^.*ナス.*$/, category: 'ナス系'},
  {pattern: /^.*春巻き.*$/, category: '春巻き系'},
  {pattern: /^.*シチュー.*$/, category: 'シチュー系'},
  {pattern: /^.*ハンバーグ.*$/, category: 'ハンバーグ系'},
  {pattern: /^.*照り焼き.*$/, category: '照り焼き系'},
  {pattern: /^.*スパゲッティ.*$/, category: 'スパゲッティ系'},
  {pattern: /^.*パスタ.*$/, category: 'パスタ系全般'}
];

const categorizedDishes = {};
dishes.forEach(dish => {
  similarityPatterns.forEach(({pattern, category}) => {
    if (pattern.test(dish.name)) {
      if (!categorizedDishes[category]) categorizedDishes[category] = [];
      categorizedDishes[category].push(dish);
    }
  });
});

Object.entries(categorizedDishes).forEach(([category, dishList]) => {
  if (dishList.length > 1) {
    console.log(`\n${category} (${dishList.length} dishes):`);
    dishList.forEach(dish => {
      console.log(`  Rank ${dish.rank}: ${dish.name} (score: ${dish.score})`);
    });
  }
});

console.log('\n3. POTENTIAL CONSOLIDATION CANDIDATES:');

// Check for specific patterns that might be duplicates
const consolidationCandidates = [
  {
    name: 'かぼちゃの煮物 duplicates',
    dishes: dishes.filter(d => /^.*かぼちゃ.*煮物.*$/.test(d.name)),
    reason: 'Same dish - pumpkin simmered dish variations'
  },
  {
    name: '照り焼き variations',
    dishes: dishes.filter(d => /^.*照り焼き.*$/.test(d.name)),
    reason: 'Different teriyaki dishes that might be consolidated'
  },
  {
    name: 'Pasta variations',
    dishes: dishes.filter(d => /^.*(スパゲ|パスタ).*$/.test(d.name)),
    reason: 'Spaghetti/Pasta variations'
  },
  {
    name: 'ハンバーグ variations',
    dishes: dishes.filter(d => /^.*ハンバーグ.*$/.test(d.name)),
    reason: 'Hamburger steak variations'
  }
];

consolidationCandidates.forEach(({name, dishes: candidateDishes, reason}) => {
  if (candidateDishes.length > 1) {
    console.log(`\n${name}:`);
    console.log(`Reason: ${reason}`);
    candidateDishes.forEach(dish => {
      console.log(`  Rank ${dish.rank}: ${dish.name} (score: ${dish.score}, ${dish.aiCount} AIs)`);
    });
  }
});

console.log('\n4. MANUAL DUPLICATE CHECK:');
// Manual check for dishes that look similar but may have different names
const manualChecks = [
  {pattern: 'かぼちゃの煮物', matches: dishes.filter(d => d.name.includes('かぼちゃ') && d.name.includes('煮'))},
  {pattern: 'とんかつ/カツ', matches: dishes.filter(d => d.name.includes('カツ') || d.name.includes('とんかつ'))},
  {pattern: 'ハンバーグ', matches: dishes.filter(d => d.name.includes('ハンバーグ'))},
  {pattern: '照り焼き', matches: dishes.filter(d => d.name.includes('照り焼き'))},
  {pattern: 'パスタ/スパゲッティ', matches: dishes.filter(d => d.name.includes('パスタ') || d.name.includes('スパゲ'))},
  {pattern: 'コロッケ', matches: dishes.filter(d => d.name.includes('コロッケ'))},
  {pattern: 'うどん', matches: dishes.filter(d => d.name.includes('うどん'))},
  {pattern: 'そば', matches: dishes.filter(d => d.name.includes('そば'))},
  {pattern: '豚キムチ', matches: dishes.filter(d => d.name.includes('豚') && d.name.includes('キムチ'))},
  {pattern: '春巻き', matches: dishes.filter(d => d.name.includes('春巻き'))},
  {pattern: 'もやし炒め', matches: dishes.filter(d => d.name.includes('もやし') && d.name.includes('炒め'))},
  {pattern: '納豆', matches: dishes.filter(d => d.name.includes('納豆'))},
  {pattern: 'おにぎり', matches: dishes.filter(d => d.name.includes('おにぎり'))},
  {pattern: 'シチュー', matches: dishes.filter(d => d.name.includes('シチュー'))},
  {pattern: 'ラーメン', matches: dishes.filter(d => d.name.includes('ラーメン'))},
  {pattern: 'チャーハン', matches: dishes.filter(d => d.name.includes('チャーハン') || d.name.includes('焼き飯'))},
  {pattern: '焼きそば', matches: dishes.filter(d => d.name.includes('焼きそば'))},
  {pattern: 'きんぴらごぼう', matches: dishes.filter(d => d.name.includes('きんぴら') || d.name.includes('キンピラ'))},
  {pattern: 'ホイコーロー', matches: dishes.filter(d => d.name.includes('ホイコーロー') || d.name.includes('回鍋肉'))},
  {pattern: '青椒肉絲', matches: dishes.filter(d => d.name.includes('青椒肉絲'))},
  {pattern: '棒棒鶏', matches: dishes.filter(d => d.name.includes('棒棒鶏'))},
  {pattern: '炊き込みご飯', matches: dishes.filter(d => d.name.includes('炊き込み'))},
  {pattern: '切り干し大根', matches: dishes.filter(d => d.name.includes('切り干し大根'))}
];

manualChecks.forEach(({pattern, matches}) => {
  if (matches.length > 1) {
    console.log(`\n${pattern} matches (${matches.length}):`);
    matches.forEach(dish => {
      console.log(`  Rank ${dish.rank}: ${dish.name} (score: ${dish.score}, ${dish.aiCount} AIs)`);
    });
  }
});

console.log('\n5. FINAL SUMMARY OF ISSUES FOUND:');
const allIssues = [];

// Add exact duplicates
exactDuplicates.forEach(([name, occurrences]) => {
  allIssues.push({
    type: 'EXACT_DUPLICATE',
    name: name,
    count: occurrences.length,
    items: occurrences
  });
});

// Add manual check results with multiple matches
manualChecks.forEach(({pattern, matches}) => {
  if (matches.length > 1) {
    allIssues.push({
      type: 'SIMILAR_DISHES',
      name: pattern,
      count: matches.length,
      items: matches
    });
  }
});

if (allIssues.length === 0) {
  console.log('No major duplicate issues found. The ranking appears to be well-integrated.');
} else {
  allIssues.forEach(issue => {
    console.log(`\n${issue.type}: ${issue.name} (${issue.count} items)`);
    issue.items.forEach(item => {
      console.log(`  Rank ${item.rank}: ${item.name} (score: ${item.score})`);
    });
  });
}