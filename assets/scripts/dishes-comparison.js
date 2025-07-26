// 日本料理AI比較システム - メインJavaScript

let dishesData = null;
let filteredData = null;

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', function() {
    console.log('🍱 日本料理AI比較システムを初期化中...');
    initializeApp();
});

// アプリ初期化
async function initializeApp() {
    try {
        // データ読み込み
        await loadDishesData();
        
        // UI初期化
        initializeEventListeners();
        renderDishesLists();
        updateStatistics();
        
        console.log('✅ 初期化完了');
    } catch (error) {
        console.error('❌ 初期化エラー:', error);
        showError('データの初期化に失敗しました。ページを再読み込みしてください。');
    }
}

// データ読み込み
async function loadDishesData() {
    try {
        const response = await fetch('../data/dishes-data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        dishesData = await response.json();
        filteredData = JSON.parse(JSON.stringify(dishesData)); // ディープコピー
        console.log('📊 料理データ読み込み完了:', dishesData);
    } catch (error) {
        console.error('❌ データ読み込みエラー:', error);
        throw error;
    }
}

// イベントリスナー設定
function initializeEventListeners() {
    // 検索機能
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    searchBtn.addEventListener('click', handleSearch);
    
    // フィルター機能
    const categoryFilter = document.getElementById('categoryFilter');
    const typeFilter = document.getElementById('typeFilter');
    const resetBtn = document.getElementById('resetFilters');
    
    categoryFilter.addEventListener('change', handleFilter);
    typeFilter.addEventListener('change', handleFilter);
    resetBtn.addEventListener('click', resetFilters);
    
    // Enterキーでの検索
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
}

// 検索処理
function handleSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    
    if (!searchTerm) {
        filteredData = JSON.parse(JSON.stringify(dishesData));
    } else {
        filteredData = JSON.parse(JSON.stringify(dishesData));
        
        // 各AIのデータをフィルタリング
        Object.keys(filteredData.aiResults).forEach(aiKey => {
            const aiData = filteredData.aiResults[aiKey];
            if (aiData.dishes && aiData.dishes.length > 0) {
                aiData.dishes = aiData.dishes.filter(dish => 
                    dish.name.toLowerCase().includes(searchTerm) ||
                    dish.description.toLowerCase().includes(searchTerm)
                );
            }
        });
    }
    
    applyCurrentFilters();
    renderDishesLists();
    updateStatistics();
}

// フィルター処理
function handleFilter() {
    const categoryValue = document.getElementById('categoryFilter').value;
    const typeValue = document.getElementById('typeFilter').value;
    
    // 現在の検索結果をベースにフィルタリング
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    if (searchTerm) {
        handleSearch(); // 検索を再実行
        return;
    }
    
    filteredData = JSON.parse(JSON.stringify(dishesData));
    applyCurrentFilters();
    renderDishesLists();
    updateStatistics();
}

// 現在のフィルターを適用
function applyCurrentFilters() {
    const categoryValue = document.getElementById('categoryFilter').value;
    const typeValue = document.getElementById('typeFilter').value;
    
    if (!categoryValue && !typeValue) return;
    
    Object.keys(filteredData.aiResults).forEach(aiKey => {
        const aiData = filteredData.aiResults[aiKey];
        if (aiData.dishes && aiData.dishes.length > 0) {
            aiData.dishes = aiData.dishes.filter(dish => {
                let matches = true;
                
                if (categoryValue && dish.category !== categoryValue) {
                    matches = false;
                }
                
                if (typeValue && dish.type !== typeValue) {
                    matches = false;
                }
                
                return matches;
            });
        }
    });
}

// フィルターリセット
function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('typeFilter').value = '';
    
    filteredData = JSON.parse(JSON.stringify(dishesData));
    renderDishesLists();
    updateStatistics();
}

// 料理リスト表示
function renderDishesLists() {
    const aiKeys = ['gemini', 'chatgpt', 'claude', 'qwen3'];
    
    aiKeys.forEach(aiKey => {
        const listElement = document.getElementById(`${aiKey}-list`);
        const aiData = filteredData.aiResults[aiKey];
        
        if (!aiData.dishes || aiData.dishes.length === 0) {
            // プレースホルダー表示
            listElement.innerHTML = `
                <div class="placeholder">
                    <p>📝 データ収集中...</p>
                    <p class="placeholder-note">${getAIDisplayName(aiKey)}からの料理リストを待っています</p>
                </div>
            `;
            return;
        }
        
        // 料理リスト生成
        const dishesHTML = aiData.dishes.map(dish => `
            <div class="dish-item" data-rank="${dish.rank}">
                <div class="dish-rank">${dish.rank}</div>
                <div class="dish-content">
                    <div class="dish-name">${dish.name}</div>
                    <div class="dish-description">${dish.description}</div>
                    <div class="dish-tags">
                        <span class="dish-tag category">${dish.category}</span>
                        <span class="dish-tag type">${dish.type}</span>
                    </div>
                </div>
            </div>
        `).join('');
        
        listElement.innerHTML = dishesHTML;
    });
    
    // 共通料理のハイライト
    highlightCommonDishes();
}

// 共通料理のハイライト
function highlightCommonDishes() {
    const commonDishes = findCommonDishes();
    
    commonDishes.forEach(dishName => {
        const dishElements = document.querySelectorAll('.dish-item');
        dishElements.forEach(element => {
            const nameElement = element.querySelector('.dish-name');
            if (nameElement && nameElement.textContent === dishName) {
                element.style.backgroundColor = '#e8f5e8';
                element.style.borderLeft = '4px solid var(--light-green)';
            }
        });
    });
}

// 共通料理を見つける
function findCommonDishes() {
    const aiKeys = ['gemini', 'chatgpt', 'claude', 'qwen3'];
    const dishCounts = {};
    
    aiKeys.forEach(aiKey => {
        const aiData = filteredData.aiResults[aiKey];
        if (aiData.dishes && aiData.dishes.length > 0) {
            aiData.dishes.forEach(dish => {
                dishCounts[dish.name] = (dishCounts[dish.name] || 0) + 1;
            });
        }
    });
    
    // 2つ以上のAIで共通する料理
    return Object.keys(dishCounts).filter(dish => dishCounts[dish] >= 2);
}

// 統計情報更新
function updateStatistics() {
    const completedAI = Object.keys(filteredData.aiResults).filter(aiKey => {
        const aiData = filteredData.aiResults[aiKey];
        return aiData.dishes && aiData.dishes.length > 0;
    }).length;
    
    const totalDisplayedDishes = Object.values(filteredData.aiResults).reduce((total, aiData) => {
        return total + (aiData.dishes ? aiData.dishes.length : 0);
    }, 0);
    
    document.getElementById('activeAI').textContent = completedAI;
    document.getElementById('displayedDishes').textContent = totalDisplayedDishes;
    
    // インサイト更新
    updateInsights();
}

// インサイト更新
function updateInsights() {
    const commonDishes = findCommonDishes();
    const completedAI = Object.keys(filteredData.aiResults).filter(aiKey => {
        const aiData = filteredData.aiResults[aiKey];
        return aiData.dishes && aiData.dishes.length > 0;
    });
    
    // 共通料理の表示
    document.getElementById('commonDishes').textContent = 
        completedAI.length > 1 
            ? `${commonDishes.length}種類の料理が複数のAIで共通してランクインしています（例: ${commonDishes.slice(0, 3).join('、')}など）`
            : '複数のAIデータが揃ったら、共通料理を分析します';
    
    // AI別特徴の表示
    document.getElementById('aiCharacteristics').textContent = 
        completedAI.length > 0
            ? `現在${completedAI.length}つのAIデータを分析中。Geminiは${filteredData.aiResults.gemini.dishes?.length || 0}種類の料理を選択しました。`
            : '各AIの選択傾向を分析中...';
    
    // ヴィーガン対応可能性
    const veganFriendlyCount = countVeganFriendlyDishes();
    document.getElementById('veganPotential').textContent = 
        veganFriendlyCount > 0
            ? `約${veganFriendlyCount}種類の料理がヴィーガン対応可能と推定されます`
            : '植物性食材での再現可能な料理を特定中...';
}

// ヴィーガン対応可能料理のカウント
function countVeganFriendlyDishes() {
    const veganFriendlyKeywords = [
        '野菜', 'サラダ', '漬物', '酢の物', 'ひじき', 'きんぴら', 'おひたし',
        '白和え', 'うどん', 'そば', 'そうめん', 'パスタ', 'ピザ', 'ガパオライス'
    ];
    
    let count = 0;
    Object.values(filteredData.aiResults).forEach(aiData => {
        if (aiData.dishes) {
            aiData.dishes.forEach(dish => {
                if (veganFriendlyKeywords.some(keyword => dish.name.includes(keyword))) {
                    count++;
                }
            });
        }
    });
    
    return count;
}

// AI表示名の取得
function getAIDisplayName(aiKey) {
    const displayNames = {
        'gemini': 'Gemini',
        'chatgpt': 'ChatGPT',
        'claude': 'Claude',
        'qwen3': 'Qwen3'
    };
    return displayNames[aiKey] || aiKey;
}

// デバウンス関数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// エラー表示
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #f44336;
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 1000;
        max-width: 400px;
    `;
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// 成功表示
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--light-green);
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 1000;
        max-width: 400px;
    `;
    successDiv.textContent = message;
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

// エクスポート（将来のモジュール化用）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        loadDishesData, 
        handleSearch, 
        handleFilter, 
        findCommonDishes 
    };
}