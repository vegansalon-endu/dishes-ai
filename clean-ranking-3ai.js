const fs = require('fs');

console.log('=== 改善版3AIランキングシステム構築 ===');

// 元データを読み込み
const originalData = JSON.parse(fs.readFileSync('./data/dishes-data.json', 'utf8'));

console.log('📄 元データ読み込み完了');

// 3AI（Gemini, ChatGPT, Claude）のみのデータを抽出
const threeAIData = {
    gemini: originalData.aiResults.gemini.dishes,
    chatgpt: originalData.aiResults.chatgpt.dishes,
    claude: originalData.aiResults.claude.dishes
};

console.log('✅ 3AIデータ抽出完了');
console.log('- Gemini:', threeAIData.gemini.length, '品目');
console.log('- ChatGPT:', threeAIData.chatgpt.length, '品目');
console.log('- Claude:', threeAIData.claude.length, '品目');

// 曖昧な料理名のブラックリスト
const ambiguousDishes = [
    'サラダ', 'パスタ', 'スパゲッティ', '煮物', '酢の物', 
    '鍋料理', 'コーヒー', '刺身', '寿司'  // 汎用的すぎる名称
];

console.log('\n🚫 除外対象の曖昧料理名:', ambiguousDishes.length, '種類');

// 全料理を統合してユニークな料理リストを作成
const allDishes = [];

// 各AIのデータを統合
Object.keys(threeAIData).forEach(aiName => {
    threeAIData[aiName].forEach(dish => {
        // 曖昧な料理名をスキップ
        if (ambiguousDishes.includes(dish.name)) {
            console.log(`⚠️ 除外: ${dish.name} (${aiName})`);
            return;
        }
        
        allDishes.push({
            name: dish.name,
            ai: aiName,
            rank: dish.rank,
            description: dish.description || '',
            category: dish.category || '',
            type: dish.type || ''
        });
    });
});

console.log('\n📊 統合後データ:', allDishes.length, 'エントリ');

// 重複エントリのチェックと除去
const dishGroups = {};
allDishes.forEach(dish => {
    if (!dishGroups[dish.name]) {
        dishGroups[dish.name] = [];
    }
    dishGroups[dish.name].push(dish);
});

console.log('\n🔍 ユニーク料理数:', Object.keys(dishGroups).length);

// 重複エントリの分析
const duplicateReport = [];
Object.keys(dishGroups).forEach(dishName => {
    const group = dishGroups[dishName];
    
    // 同じAIが複数回同じ料理を評価している場合をチェック
    const aiCounts = {};
    group.forEach(dish => {
        aiCounts[dish.ai] = (aiCounts[dish.ai] || 0) + 1;
    });
    
    // 重複がある場合
    const hasDuplicates = Object.values(aiCounts).some(count => count > 1);
    if (hasDuplicates) {
        duplicateReport.push({
            dishName,
            totalEntries: group.length,
            aiCounts,
            entries: group
        });
    }
});

console.log('\n⚠️ 重複エントリが見つかった料理:', duplicateReport.length, '種類');
duplicateReport.forEach(report => {
    console.log(`- ${report.dishName}: ${report.totalEntries}エントリ`, report.aiCounts);
});

// 重複を解決（各AIから最良の順位のみを採用）
const cleanDishes = [];
Object.keys(dishGroups).forEach(dishName => {
    const group = dishGroups[dishName];
    
    // AIごとに最良順位を選択
    const aiEntries = {};
    group.forEach(dish => {
        if (!aiEntries[dish.ai] || dish.rank < aiEntries[dish.ai].rank) {
            aiEntries[dish.ai] = dish;
        }
    });
    
    // 最良エントリをクリーンリストに追加
    Object.values(aiEntries).forEach(dish => {
        cleanDishes.push(dish);
    });
});

console.log('\n✅ クリーニング後:', cleanDishes.length, 'エントリ');

// 料理ごとの統計を計算
const dishStats = {};
cleanDishes.forEach(dish => {
    if (!dishStats[dish.name]) {
        dishStats[dish.name] = {
            name: dish.name,
            ais: [],
            ranks: [],
            descriptions: [],
            category: dish.category,
            type: dish.type
        };
    }
    
    dishStats[dish.name].ais.push(dish.ai);
    dishStats[dish.name].ranks.push(dish.rank);
    if (dish.description && !dishStats[dish.name].descriptions.includes(dish.description)) {
        dishStats[dish.name].descriptions.push(dish.description);
    }
});

// スコア計算（改良版アルゴリズム）
const scoredDishes = Object.keys(dishStats).map(dishName => {
    const stats = dishStats[dishName];
    const aiCount = stats.ais.length;
    const avgRank = stats.ranks.reduce((sum, rank) => sum + rank, 0) / stats.ranks.length;
    
    // 新しいスコア計算式
    const commonBonus = aiCount * 100;  // 3AI=300, 2AI=200, 1AI=100
    const rankBonus = (21 - avgRank) * 10;  // 上位ほど高得点、係数を20→10に調整
    const totalScore = commonBonus + rankBonus;
    
    return {
        rank: 0, // 後で設定
        name: dishName,
        score: Math.round(totalScore * 10) / 10,
        aiCount,
        averageRank: Math.round(avgRank * 10) / 10,
        commonBonus,
        rankBonus: Math.round(rankBonus * 10) / 10,
        appearances: stats.ais.map(ai => ({
            ai,
            rank: stats.ranks[stats.ais.indexOf(ai)]
        })),
        description: stats.descriptions[0] || '人気の日本料理',
        category: stats.category,
        type: stats.type
    };
}).sort((a, b) => b.score - a.score);

// ランキングを設定
scoredDishes.forEach((dish, index) => {
    dish.rank = index + 1;
});

console.log('\n🏆 TOP100ランキング生成完了');
console.log('- 3AI共通:', scoredDishes.filter(d => d.aiCount === 3).length, '品目');
console.log('- 2AI共通:', scoredDishes.filter(d => d.aiCount === 2).length, '品目');
console.log('- 1AI独占:', scoredDishes.filter(d => d.aiCount === 1).length, '品目');

// TOP100を表示
console.log('\n=== TOP100 日本料理ランキング（3AI版） ===');
const top100 = scoredDishes.slice(0, 100);

top100.forEach((dish, index) => {
    const aiList = dish.appearances.map(app => `${app.ai.toUpperCase()}:${app.rank}`).join(', ');
    console.log(`${dish.rank}位: ${dish.name} (スコア:${dish.score}, ${dish.aiCount}AI, 平均:${dish.averageRank}) [${aiList}]`);
});

// 統計サマリー
const top100Stats = {
    ai3_dishes: top100.filter(d => d.aiCount === 3).length,
    ai2_dishes: top100.filter(d => d.aiCount === 2).length,
    ai1_dishes: top100.filter(d => d.aiCount === 1).length,
    excluded_ambiguous: ambiguousDishes.length,
    duplicate_resolutions: duplicateReport.length
};

console.log('\n📈 TOP100統計:');
console.log('- 3AI共通料理:', top100Stats.ai3_dishes, '品目');
console.log('- 2AI共通料理:', top100Stats.ai2_dishes, '品目');
console.log('- 1AI独占料理:', top100Stats.ai1_dishes, '品目');
console.log('- 除外された曖昧料理:', top100Stats.excluded_ambiguous, '品目');
console.log('- 解決された重複:', top100Stats.duplicate_resolutions, '件');

// 結果をJSONファイルに保存
const finalResult = {
    metadata: {
        project: "日本料理AI比較システム - 改良3AI版",
        purpose: "3つのAI（Gemini, ChatGPT, Claude）による信頼性の高い日本料理ランキング",
        version: "3.0",
        created: new Date().toISOString().split('T')[0],
        totalDishes: top100.length,
        originalEntries: allDishes.length,
        cleanedEntries: cleanDishes.length,
        aiSources: ["Gemini", "ChatGPT", "Claude"],
        excludedAI: ["Qwen3"],
        scoringMethod: "共通度ボーナス(AI数×100) + 順位ボーナス((21-平均順位)×10)"
    },
    
    qualityImprovements: {
        excludedAmbiguousDishes: ambiguousDishes,
        duplicateResolutions: duplicateReport.length,
        dataCleaningSteps: [
            "QWEN3データの除外",
            "曖昧な料理名の除外", 
            "重複エントリの解決",
            "改良されたスコアリングアルゴリズムの適用"
        ]
    },
    
    statistics: top100Stats,
    
    top100_ranking: top100,
    
    excluded_dishes: {
        ambiguous: ambiguousDishes,
        duplicates: duplicateReport
    }
};

fs.writeFileSync('./clean-ranking-3ai-result.json', JSON.stringify(finalResult, null, 2));
console.log('\n💾 結果をclean-ranking-3ai-result.jsonに保存しました');

console.log('\n🎉 改良版3AIランキングシステム構築完了！');