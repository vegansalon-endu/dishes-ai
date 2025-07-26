const fs = require('fs');
const path = require('path');

// dishes-data.jsonを読み込み
const dishesDataPath = path.join(__dirname, 'data', 'dishes-data.json');
const dishesData = JSON.parse(fs.readFileSync(dishesDataPath, 'utf8'));

console.log('4つのAIによる日本料理ランキング統合分析');
console.log('=========================================');

// 各AIの1-10位データを抽出
const aiNames = ['gemini', 'chatgpt', 'claude', 'qwen3'];
const top10Data = {};

console.log('\n1. 各AIの1-10位データ抽出:');
aiNames.forEach(aiName => {
    const aiData = dishesData.aiResults[aiName];
    if (aiData && aiData.dishes) {
        top10Data[aiName] = aiData.dishes.slice(0, 10);
        console.log(`${aiName.toUpperCase()}: ${aiData.dishes.length}件中、TOP10を抽出`);
    }
});

// 料理名の統一と正規化
function normalizeDishName(name) {
    return name.trim()
        .replace(/[\s　]+/g, '') // 全角・半角スペースを削除
        .toLowerCase();
}

// 全料理のリストを作成
const allDishes = new Map();

Object.keys(top10Data).forEach(aiName => {
    top10Data[aiName].forEach(dish => {
        const normalizedName = normalizeDishName(dish.name);
        const originalName = dish.name;
        
        if (!allDishes.has(normalizedName)) {
            allDishes.set(normalizedName, {
                originalName: originalName,
                appearances: [],
                totalRank: 0,
                averageRank: 0,
                aiCount: 0
            });
        }
        
        const dishInfo = allDishes.get(normalizedName);
        dishInfo.appearances.push({
            ai: aiName,
            rank: dish.rank,
            description: dish.description,
            category: dish.category,
            type: dish.type
        });
        dishInfo.totalRank += dish.rank;
        dishInfo.aiCount++;
        dishInfo.averageRank = dishInfo.totalRank / dishInfo.aiCount;
    });
});

console.log(`\n2. 料理の共通度分析:`);
console.log(`総料理数: ${allDishes.size}品目`);

// 共通度別の分析
const commonalityStats = {};
allDishes.forEach((dishInfo, dishName) => {
    const count = dishInfo.aiCount;
    if (!commonalityStats[count]) {
        commonalityStats[count] = [];
    }
    commonalityStats[count].push({ name: dishInfo.originalName, info: dishInfo });
});

Object.keys(commonalityStats).sort((a, b) => b - a).forEach(count => {
    console.log(`${count}つのAIで選出: ${commonalityStats[count].length}品目`);
    if (count >= 3) {
        commonalityStats[count].forEach(dish => {
            console.log(`  - ${dish.name} (平均順位: ${dish.info.averageRank.toFixed(1)})`);
        });
    }
});

// 統合スコア計算（共通度と平均順位を考慮）
console.log('\n3. 統合スコア計算:');
const scoredDishes = [];

allDishes.forEach((dishInfo, dishName) => {
    // スコア計算式:
    // - 共通度ボーナス: AIの数が多いほど高スコア
    // - 順位ボーナス: 平均順位が高いほど高スコア（11 - averageRank）
    // - 重み付け: 共通度を重視（共通度 × 重み係数 + 順位ボーナス）
    
    const commonalityBonus = dishInfo.aiCount * 100; // AI数 × 100
    const rankBonus = (11 - dishInfo.averageRank) * 20; // (11 - 平均順位) × 20
    const totalScore = commonalityBonus + rankBonus;
    
    scoredDishes.push({
        name: dishInfo.originalName,
        score: totalScore,
        aiCount: dishInfo.aiCount,
        averageRank: dishInfo.averageRank,
        appearances: dishInfo.appearances,
        commonalityBonus: commonalityBonus,
        rankBonus: rankBonus
    });
});

// スコア順でソート
scoredDishes.sort((a, b) => b.score - a.score);

console.log('スコア計算方式: 共通度ボーナス(AI数×100) + 順位ボーナス((11-平均順位)×20)');

// TOP10を表示
console.log('\n4. 統合TOP10ランキング:');
console.log('=========================');

const top10 = scoredDishes.slice(0, 10);
top10.forEach((dish, index) => {
    console.log(`\n${index + 1}位: ${dish.name}`);
    console.log(`  スコア: ${dish.score.toFixed(1)} (共通度: ${dish.commonalityBonus}, 順位: ${dish.rankBonus.toFixed(1)})`);
    console.log(`  AI登場数: ${dish.aiCount}/4, 平均順位: ${dish.averageRank.toFixed(1)}`);
    console.log(`  各AIでの順位:`);
    
    aiNames.forEach(aiName => {
        const appearance = dish.appearances.find(app => app.ai === aiName);
        if (appearance) {
            console.log(`    ${aiName.toUpperCase()}: ${appearance.rank}位`);
        } else {
            console.log(`    ${aiName.toUpperCase()}: 圏外`);
        }
    });
});

// 詳細レポート用のJSONデータを作成
const detailedReport = {
    metadata: {
        analysis_date: new Date().toISOString().split('T')[0],
        total_dishes_analyzed: allDishes.size,
        ai_sources: aiNames,
        scoring_method: "共通度ボーナス(AI数×100) + 順位ボーナス((11-平均順位)×20)"
    },
    commonality_analysis: {},
    integrated_top10: top10.map((dish, index) => ({
        integrated_rank: index + 1,
        dish_name: dish.name,
        total_score: dish.score,
        ai_count: dish.aiCount,
        average_rank: parseFloat(dish.averageRank.toFixed(1)),
        commonality_bonus: dish.commonalityBonus,
        rank_bonus: parseFloat(dish.rankBonus.toFixed(1)),
        ai_rankings: aiNames.reduce((acc, aiName) => {
            const appearance = dish.appearances.find(app => app.ai === aiName);
            acc[aiName] = appearance ? {
                rank: appearance.rank,
                description: appearance.description,
                category: appearance.category,
                type: appearance.type
            } : null;
            return acc;
        }, {}),
        analysis_reason: `${dish.aiCount}つのAIで選出され、平均順位${dish.averageRank.toFixed(1)}位の高評価を獲得`
    })),
    full_analysis: scoredDishes.map((dish, index) => ({
        overall_rank: index + 1,
        dish_name: dish.name,
        total_score: dish.score,
        ai_count: dish.aiCount,
        average_rank: parseFloat(dish.averageRank.toFixed(1))
    }))
};

// 共通度分析をレポートに追加
Object.keys(commonalityStats).forEach(count => {
    detailedReport.commonality_analysis[`${count}_ai_selection`] = {
        count: parseInt(count),
        dishes: commonalityStats[count].length,
        examples: commonalityStats[count].slice(0, 5).map(dish => ({
            name: dish.name,
            average_rank: parseFloat(dish.info.averageRank.toFixed(1))
        }))
    };
});

// 結果をJSONファイルに保存
const outputPath = path.join(__dirname, 'integrated-dishes-ranking.json');
fs.writeFileSync(outputPath, JSON.stringify(detailedReport, null, 2), 'utf8');

console.log('\n=========================');
console.log('分析完了！');
console.log(`詳細レポート: ${outputPath}`);
console.log('=========================');