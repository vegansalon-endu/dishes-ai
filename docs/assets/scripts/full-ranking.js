// 完全版ランキングページのメインスクリプト

class FullRankingApp {
    constructor() {
        this.rankingData = null;
        this.currentTier = '1-10';
        this.init();
    }

    async init() {
        console.log('🚀 完全版ランキングアプリケーション初期化開始');
        try {
            await this.loadData();
            this.setupEventListeners();
            this.renderStatistics();
            this.renderCurrentTier();
            console.log('✅ アプリケーション初期化完了');
        } catch (error) {
            console.error('❌ 初期化エラー:', error);
            this.showError('データの読み込みに失敗しました。');
        }
    }

    async loadData() {
        console.log('📄 データ読み込み開始');
        try {
            const response = await fetch('./data/integrated-dishes-ranking.json');
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }
            this.rankingData = await response.json();
            console.log('✅ データ読み込み完了:', {
                総料理数: this.rankingData.full_analysis.top100_ranking.length,
                統合処理数: this.rankingData.metadata.integrationsPerformed,
                データバージョン: this.rankingData.metadata.version
            });
        } catch (error) {
            console.error('❌ データ読み込み失敗:', error);
            throw error;
        }
    }

    setupEventListeners() {
        console.log('🎮 イベントリスナー設定開始');
        const tierButtons = document.querySelectorAll('.tier-btn');
        
        tierButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const tier = e.target.dataset.tier;
                console.log(`🔄 ティア切り替え: ${this.currentTier} → ${tier}`);
                this.switchTier(tier);
            });
        });
        
        console.log('✅ イベントリスナー設定完了');
    }

    switchTier(tier) {
        console.log(`📊 ティア "${tier}" に切り替え中...`);
        
        // ボタンの状態更新
        document.querySelectorAll('.tier-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tier="${tier}"]`).classList.add('active');
        
        // コンテンツの表示切り替え
        document.querySelectorAll('.tier-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`tier-${tier}`).classList.add('active');
        
        // 現在のティアを更新
        this.currentTier = tier;
        
        // ティアのデータをレンダリング
        this.renderTierData(tier);
        
        console.log(`✅ ティア "${tier}" の表示完了`);
    }

    renderTierData(tier) {
        const [start, end] = tier.split('-').map(num => parseInt(num));
        const tierData = this.rankingData.full_analysis.top100_ranking.slice(start - 1, end);
        
        console.log(`🎨 ティア ${tier} のデータレンダリング:`, {
            範囲: `${start}-${end}位`,
            件数: tierData.length,
            データ確認: tierData.length > 0 ? '✅' : '❌'
        });
        
        const container = document.getElementById(`ranking-${tier}`);
        if (!container) {
            console.error(`❌ コンテナが見つかりません: ranking-${tier}`);
            return;
        }
        
        if (tierData.length === 0) {
            container.innerHTML = '<p>データが見つかりません。</p>';
            return;
        }
        
        container.innerHTML = tierData.map(dish => this.createRankItem(dish)).join('');
    }

    createRankItem(dish) {
        const isTop3 = dish.rank <= 3;
        const isTop10 = dish.rank <= 10;
        const rankClass = isTop3 ? 'top-3' : (isTop10 ? 'top-10' : '');
        
        const aiAppearances = dish.appearances.map(app => 
            `<span class="ai-appearance">${app.ai.toUpperCase()}: ${app.rank}位</span>`
        ).join('');
        
        // スコアの色付け
        let scoreClass = '';
        if (dish.score >= 400) scoreClass = 'score-excellent';
        else if (dish.score >= 200) scoreClass = 'score-good';
        else if (dish.score >= 0) scoreClass = 'score-fair';
        else scoreClass = 'score-low';
        
        // ヴィーガン代替案があるかチェック
        const hasVeganAlternative = this.hasVeganAlternative(dish.name);
        const veganButton = hasVeganAlternative ? `
            <a href="../rice-alternatives.html" class="vegan-alternative-btn" title="ヴィーガン・糖質制限代替案">
                <i class="fas fa-seedling"></i> 代替案
            </a>
        ` : '';
        
        return `
            <div class="rank-item ${rankClass}">
                <div class="rank-header">
                    <div class="rank-number">${dish.rank}</div>
                    <div class="ai-count">
                        <span class="ai-badge">${dish.aiCount}AI</span>
                    </div>
                </div>
                
                <div class="dish-name">${dish.name}</div>
                ${veganButton}
                
                <div class="score-info">
                    <div class="score-item">
                        <div class="score-value ${scoreClass}">${dish.score}</div>
                        <div class="score-label">総スコア</div>
                    </div>
                    <div class="score-item">
                        <div class="score-value">${dish.averageRank}</div>
                        <div class="score-label">平均順位</div>
                    </div>
                </div>
                
                <div class="appearances">
                    <div class="appearances-title">AI別順位:</div>
                    <div class="ai-appearances">
                        ${aiAppearances}
                    </div>
                </div>
            </div>
        `;
    }

    renderStatistics() {
        console.log('📊 統計情報レンダリング開始');
        
        if (!this.rankingData?.full_analysis?.scoring_distribution) {
            console.error('❌ 統計データが見つかりません');
            return;
        }
        
        const stats = this.rankingData.full_analysis.scoring_distribution;
        
        // 統計値をDOMに反映
        this.updateStatElement('ai4-count', stats.ai4_dishes);
        this.updateStatElement('ai3-count', stats.ai3_dishes);
        this.updateStatElement('ai2-count', stats.ai2_dishes);
        this.updateStatElement('ai1-count', stats.ai1_dishes);
        
        console.log('✅ 統計情報レンダリング完了:', stats);
    }

    updateStatElement(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
            // アニメーション効果
            element.style.transform = 'scale(1.1)';
            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 200);
        } else {
            console.warn(`⚠️ 統計要素が見つかりません: ${elementId}`);
        }
    }

    renderCurrentTier() {
        console.log(`🎨 現在のティア ${this.currentTier} をレンダリング`);
        this.renderTierData(this.currentTier);
    }

    showError(message) {
        console.error('❌ エラー表示:', message);
        const main = document.querySelector('.main');
        if (main) {
            main.innerHTML = `
                <div class="container">
                    <div class="error-message" style="
                        background: #ffebee;
                        border: 1px solid #f44336;
                        border-radius: 8px;
                        padding: 2rem;
                        text-align: center;
                        color: #c62828;
                        margin: 2rem 0;
                    ">
                        <h2>⚠️ エラーが発生しました</h2>
                        <p>${message}</p>
                        <button onclick="location.reload()" style="
                            background: #f44336;
                            color: white;
                            border: none;
                            padding: 0.5rem 1rem;
                            border-radius: 4px;
                            cursor: pointer;
                            margin-top: 1rem;
                        ">再読み込み</button>
                    </div>
                </div>
            `;
        }
    }

    hasVeganAlternative(dishName) {
        // 現在は白ご飯のみ対応
        const veganAlternativesDishes = [
            '白ご飯',
            '白米',
            'ご飯',
            'ライス'
        ];
        
        return veganAlternativesDishes.some(targetDish => 
            dishName.includes(targetDish) || targetDish.includes(dishName)
        );
    }
}

// DOM読み込み完了後にアプリケーションを初期化
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌟 DOM読み込み完了 - 完全版ランキングアプリ起動');
    new FullRankingApp();
});

// デバッグ用グローバル関数
window.debugRanking = function() {
    console.log('🔍 デバッグ情報:');
    console.log('- 現在のティア:', window.rankingApp?.currentTier);
    console.log('- データ状態:', window.rankingApp?.rankingData ? '✅ 読み込み済み' : '❌ 未読み込み');
    console.log('- TOP10データ:', window.rankingApp?.rankingData?.full_analysis?.top100_ranking?.slice(0, 10));
};