// 日本料理統合TOP10 - JavaScript

let integratedData = null;

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏆 日本料理統合TOP10システムを初期化中...');
    initializeApp();
});

// アプリ初期化
async function initializeApp() {
    try {
        // 統合データ読み込み
        await loadIntegratedData();
        
        // UI初期化
        renderTop10Grid();
        renderDetailedRanking();
        initializeEventListeners();
        
        // デフォルトのTier表示を確認
        console.log('初期化後の要素確認:');
        console.log('- tier-top10:', document.getElementById('tier-top10'));
        console.log('- tier-tier11-20:', document.getElementById('tier-tier11-20'));
        console.log('- tier-tier21-30:', document.getElementById('tier-tier21-30'));
        
        console.log('✅ 初期化完了');
    } catch (error) {
        console.error('❌ 初期化エラー:', error);
        showError('データの初期化に失敗しました。ページを再読み込みしてください。');
    }
}

// 統合データ読み込み
async function loadIntegratedData() {
    try {
        const response = await fetch('./data/integrated-dishes-ranking.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        integratedData = await response.json();
        console.log('📊 統合データ読み込み完了:', integratedData);
    } catch (error) {
        console.error('❌ データ読み込みエラー:', error);
        throw error;
    }
}

// イベントリスナー設定
function initializeEventListeners() {
    // Tier切り替えボタン
    const tierBtns = document.querySelectorAll('.tier-btn');
    tierBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            switchTier(this.dataset.tier);
        });
    });
}

// TOP10グリッド表示
function renderTop10Grid() {
    const grid = document.getElementById('top10-grid');
    if (!grid || !integratedData) return;
    
    const top10 = integratedData.full_analysis.top100_ranking.slice(0, 10);
    
    const gridHTML = top10.map(dish => `
        <div class="ranking-item rank-${dish.integrated_rank}" data-rank="${dish.integrated_rank}">
            <div class="ranking-header">
                <div class="rank-badge">${dish.integrated_rank}</div>
                <div class="dish-name">${dish.dish_name}</div>
            </div>
            <div class="ranking-content">
                <div class="score-info">
                    <span>スコア: <span class="total-score">${Math.round(dish.total_score)}</span></span>
                    <span>AI選択数: ${dish.ai_count}/4</span>
                    <span>平均順位: ${dish.average_rank.toFixed(1)}位</span>
                </div>
                
                <div class="ai-rankings">
                    ${renderAIRankings(dish.ai_rankings)}
                </div>
                
                <div class="analysis-reason">
                    <small><strong>分析理由:</strong> ${dish.analysis_reason}</small>
                </div>
            </div>
        </div>
    `).join('');
    
    grid.innerHTML = gridHTML;
}

// AIランキング表示
function renderAIRankings(aiRankings) {
    const aiOrder = ['gemini', 'chatgpt', 'claude', 'qwen3'];
    const aiNames = {
        'gemini': 'Gemini',
        'chatgpt': 'ChatGPT', 
        'claude': 'Claude',
        'qwen3': 'Qwen3'
    };
    
    return aiOrder.map(aiKey => {
        const ranking = aiRankings[aiKey];
        if (!ranking) {
            return `
                <div class="ai-ranking-item">
                    <span class="ai-name">${aiNames[aiKey]}</span>
                    <span class="ai-rank" style="background: #ccc;">-</span>
                    <span class="ai-description">選出されず</span>
                </div>
            `;
        }
        
        return `
            <div class="ai-ranking-item">
                <span class="ai-name">${aiNames[aiKey]}</span>
                <span class="ai-rank">${ranking.rank}</span>
                <span class="ai-description">${ranking.description}</span>
            </div>
        `;
    }).join('');
}

// 詳細ランキング表示
function renderDetailedRanking() {
    if (!integratedData) {
        console.error('❌ integratedData is null or undefined');
        return;
    }
    
    console.log('🔍 詳細ランキング表示開始');
    console.log('integratedData structure:', Object.keys(integratedData));
    console.log('full_analysis structure:', Object.keys(integratedData.full_analysis || {}));
    console.log('top100_ranking length:', integratedData.full_analysis?.top100_ranking?.length);
    
    // TOP10の詳細表示
    const top10Data = integratedData.full_analysis.top100_ranking.slice(0, 10);
    console.log('📊 TOP10データ:', top10Data.length, '件');
    renderDetailedTier('detailed-top10', top10Data);
    
    // 11-20位の表示
    const tier11_20 = integratedData.full_analysis.top100_ranking.slice(10, 20);
    console.log('📊 11-20位データ:', tier11_20.length, '件', tier11_20);
    renderDetailedTier('detailed-tier11-20', tier11_20);
    
    // 21-30位の表示（存在する分だけ）
    const tier21_30 = integratedData.full_analysis.top100_ranking.slice(20, 30);
    console.log('📊 21-30位データ:', tier21_30.length, '件', tier21_30);
    if (tier21_30.length > 0) {
        renderDetailedTier('detailed-tier21-30', tier21_30);
    } else {
        console.warn('⚠️ 21-30位のデータが不足');
        // データが不足している場合のメッセージ
        const container = document.getElementById('detailed-tier21-30');
        if (container) {
            container.innerHTML = `
                <div class="no-data-message">
                    <p>🔍 21位以降のデータは現在準備中です</p>
                    <p>より多くの料理データを収集して拡充予定です</p>
                </div>
            `;
        }
    }
    
    console.log('✅ 詳細ランキング表示完了');
}

// 詳細Tier表示
function renderDetailedTier(containerId, data) {
    console.log(`🎯 renderDetailedTier called for: ${containerId}`);
    console.log(`🎯 Data received:`, data?.length, 'items');
    
    const container = document.getElementById(containerId);
    
    if (!container) {
        console.error(`❌ Container not found: ${containerId}`);
        console.log('🔍 Available containers:', 
            Array.from(document.querySelectorAll('[id*="detailed"]')).map(el => el.id)
        );
        return;
    }
    
    if (!data || data.length === 0) {
        console.warn(`⚠️ No data for container: ${containerId}`);
        container.innerHTML = '<div class="no-data-message"><p>データがありません</p></div>';
        return;
    }
    
    console.log(`✅ Container found: ${containerId}, rendering ${data.length} items`);
    
    const tierHTML = data.map((dish, index) => {
        const rankValue = dish.integrated_rank || dish.overall_rank;
        const dishName = dish.dish_name || '不明な料理';
        const totalScore = Math.round(dish.total_score || 0);
        const aiCount = dish.ai_count || 0;
        const avgRank = (dish.average_rank || 0).toFixed(1);
        
        return `
            <div class="detailed-ranking-item">
                <div class="detailed-rank">${rankValue}</div>
                <div class="detailed-info">
                    <div class="detailed-dish-name">${dishName}</div>
                    <div class="detailed-stats">
                        スコア: ${totalScore} | 
                        AI選択数: ${aiCount}/4 | 
                        平均順位: ${avgRank}位
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = tierHTML;
    console.log(`✅ Successfully rendered ${data.length} items in ${containerId}`);
    console.log(`📝 Generated HTML length: ${tierHTML.length} characters`);
}

// Tier切り替え
function switchTier(tierName) {
    console.log('🔄 switchTier called with:', tierName);
    
    // 全ての利用可能な要素をチェック
    console.log('🔍 Available tier-content elements:');
    document.querySelectorAll('.tier-content').forEach(el => {
        console.log(`  - ${el.id} (hidden: ${el.classList.contains('hidden')})`);
    });
    
    // ボタンのアクティブ状態切り替え
    document.querySelectorAll('.tier-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeBtn = document.querySelector(`[data-tier="${tierName}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
        console.log('✅ Button activated:', tierName);
    } else {
        console.error('❌ Button not found for tier:', tierName);
    }
    
    // コンテンツの表示切り替え
    document.querySelectorAll('.tier-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    // 正しいIDパターンで要素を取得
    let targetId;
    if (tierName === 'top10') {
        targetId = 'tier-top10';
    } else if (tierName === 'tier11-20') {
        targetId = 'tier-tier11-20';
    } else if (tierName === 'tier21-30') {
        targetId = 'tier-tier21-30';
    } else {
        targetId = `tier-${tierName}`;
    }
    
    console.log('🎯 Looking for target element:', targetId);
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
        targetElement.classList.remove('hidden');
        console.log('✅ Successfully switched to:', targetId);
        
        // 内容が表示されているかチェック
        const contentList = targetElement.querySelector('.detailed-ranking-list');
        if (contentList) {
            console.log('📝 Content inside:', contentList.children.length, 'items');
            if (contentList.children.length === 0) {
                console.warn('⚠️ Content list is empty!');
            }
        }
    } else {
        console.error('❌ Target element not found:', targetId);
        console.log('🔍 All elements with "tier" in ID:');
        document.querySelectorAll('[id*="tier"]').forEach(el => {
            console.log(`  - ${el.id}`);
        });
    }
}

// ヴィーガン対応可能性分析
function analyzeVeganPotential() {
    if (!integratedData) return;
    
    const top10 = integratedData.full_analysis.top100_ranking.slice(0, 10);
    const veganFriendly = [];
    const needsAdaptation = [];
    
    top10.forEach(dish => {
        // 簡単なキーワードベース分析
        const name = dish.dish_name;
        const isVeganFriendly = ['白ご飯', '味噌汁'].includes(name) || 
                               name.includes('野菜') || 
                               name.includes('サラダ');
        
        if (isVeganFriendly) {
            veganFriendly.push(dish);
        } else {
            needsAdaptation.push(dish);
        }
    });
    
    return {
        veganFriendly,
        needsAdaptation
    };
}

// スムーススクロール
function smoothScrollTo(targetId) {
    const target = document.getElementById(targetId);
    if (target) {
        target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
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

// 統計情報取得
function getStatistics() {
    if (!integratedData) return null;
    
    const top10 = integratedData.full_analysis.top100_ranking.slice(0, 10);
    
    return {
        totalDishes: integratedData.metadata.total_dishes_analyzed,
        aiSources: integratedData.metadata.ai_sources.length,
        maxScore: Math.max(...top10.map(d => d.total_score)),
        averageScore: top10.reduce((sum, d) => sum + d.total_score, 0) / top10.length,
        unanimousCount: top10.filter(d => d.ai_count === 4).length,
        majorityCount: top10.filter(d => d.ai_count >= 3).length
    };
}

// データエクスポート機能
function exportData(format = 'json') {
    if (!integratedData) return;
    
    let data, filename, mimeType;
    
    switch (format) {
        case 'json':
            data = JSON.stringify(integratedData, null, 2);
            filename = 'japanese-dishes-integrated-ranking.json';
            mimeType = 'application/json';
            break;
        
        case 'csv':
            data = convertToCSV(integratedData.full_analysis.top100_ranking.slice(0, 10));
            filename = 'japanese-dishes-top10.csv';
            mimeType = 'text/csv';
            break;
        
        default:
            console.error('Unsupported format:', format);
            return;
    }
    
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// CSV変換
function convertToCSV(data) {
    const headers = ['順位', '料理名', 'スコア', 'AI選択数', '平均順位'];
    const rows = data.map(dish => [
        dish.integrated_rank,
        dish.dish_name,
        Math.round(dish.total_score),
        dish.ai_count,
        dish.average_rank.toFixed(1)
    ]);
    
    const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
    
    return csvContent;
}

// 検索・フィルター機能（将来の拡張用）
function filterDishes(query, options = {}) {
    if (!integratedData) return [];
    
    let dishes = integratedData.full_analysis.top100_ranking.slice(0, 10);
    
    // テキスト検索
    if (query) {
        dishes = dishes.filter(dish => 
            dish.dish_name.toLowerCase().includes(query.toLowerCase())
        );
    }
    
    // AI数フィルター
    if (options.minAICount) {
        dishes = dishes.filter(dish => dish.ai_count >= options.minAICount);
    }
    
    // スコア範囲フィルター
    if (options.minScore) {
        dishes = dishes.filter(dish => dish.total_score >= options.minScore);
    }
    
    return dishes;
}

// パフォーマンス監視
function measurePerformance(operation, fn) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`${operation} took ${end - start} milliseconds`);
    return result;
}

// エクスポート（将来のモジュール化用）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadIntegratedData,
        renderTop10Grid,
        analyzeVeganPotential,
        getStatistics,
        exportData
    };
}