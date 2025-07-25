// ヴィーガン栄養専門サイト - メインJavaScript

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// アプリ初期化
function initializeApp() {
    console.log('🌱 ヴィーガン栄養専門サイトを初期化中...');
    
    // イベントリスナー設定
    setupEventListeners();
    
    // 栄養データベース初期化
    initializeNutritionDatabase();
    
    console.log('✅ 初期化完了');
}

// イベントリスナー設定
function setupEventListeners() {
    // CTAボタンのクリック
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', function() {
            // 栄養計算ツールに移動（将来実装）
            alert('栄養計算ツールは近日公開予定です！');
        });
    }
    
    // ナビゲーションのスムーススクロール
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// 栄養データベース初期化
function initializeNutritionDatabase() {
    // ヴィーガン高たんぱく質食材データ（サンプル）
    const veganProteinFoods = [
        {
            name: 'テンペ',
            protein: 19.0, // g/100g
            carbs: 9.0,
            fat: 11.0,
            calories: 190,
            category: '大豆製品'
        },
        {
            name: '豆腐（木綿）',
            protein: 6.6,
            carbs: 1.6,
            fat: 4.2,
            calories: 72,
            category: '大豆製品'
        },
        {
            name: 'セイタン',
            protein: 25.0,
            carbs: 14.0,
            fat: 1.9,
            calories: 171,
            category: '小麦グルテン'
        },
        {
            name: 'アーモンド',
            protein: 21.2,
            carbs: 9.3,
            fat: 51.8,
            calories: 598,
            category: 'ナッツ'
        },
        {
            name: 'ヘンプシード',
            protein: 31.0,
            carbs: 4.7,
            fat: 49.0,
            calories: 553,
            category: 'シード'
        }
    ];
    
    // ローカルストレージに保存
    localStorage.setItem('veganNutritionDB', JSON.stringify(veganProteinFoods));
    
    console.log('📊 栄養データベース初期化完了:', veganProteinFoods.length + '件の食材データ');
}

// 栄養計算関数（将来実装用）
function calculateNutrition(foods, amounts) {
    // 食材リストと量から栄養素を計算
    // 実装予定
}

// レシピ検索関数（将来実装用）
function searchRecipes(filters) {
    // フィルター条件でレシピを検索
    // 実装予定
}

// 食事プラン生成関数（将来実装用）
function generateMealPlan(userProfile) {
    // ユーザープロフィールに基づいて食事プランを生成
    // 実装予定
}

// ユーティリティ関数
const utils = {
    // 栄養素の推奨摂取量計算
    calculateDRI: function(age, gender, weight, height, activityLevel) {
        // DRI (Dietary Reference Intakes) 計算
        // 実装予定
    },
    
    // 糖質制限レベル判定
    getCarbLevel: function(dailyCarbs) {
        if (dailyCarbs < 50) return 'ケトジェニック';
        if (dailyCarbs < 100) return '低糖質';
        if (dailyCarbs < 150) return '中糖質';
        return '高糖質';
    },
    
    // たんぱく質充足度計算
    getProteinAdequacy: function(currentProtein, targetProtein) {
        const ratio = (currentProtein / targetProtein) * 100;
        if (ratio >= 100) return '充足';
        if (ratio >= 80) return 'やや不足';
        return '不足';
    }
};

// エクスポート（将来のモジュール化用）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { utils, calculateNutrition, searchRecipes, generateMealPlan };
}