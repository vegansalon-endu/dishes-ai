// 白ご飯代替案ページのJavaScript

class RiceAlternativesApp {
    constructor() {
        this.data = null;
        this.currentFilters = {
            carbLimit: 25,
            difficulty: 'all',
            cuisineType: 'all',
            activeTab: 'all'
        };
        this.init();
    }

    async init() {
        await this.loadData();
        this.setupEventListeners();
        this.renderAlternatives();
        this.renderComparisonTable();
        this.updateCarbRangeDisplay();
    }

    async loadData() {
        try {
            const response = await fetch('data/vegan-alternatives.json');
            this.data = await response.json();
        } catch (error) {
            console.error('データの読み込みに失敗しました:', error);
        }
    }

    setupEventListeners() {
        // 糖質量スライダー
        const carbRange = document.getElementById('carb-range');
        carbRange.addEventListener('input', (e) => {
            this.currentFilters.carbLimit = parseInt(e.target.value);
            this.updateCarbRangeDisplay();
            this.renderAlternatives();
        });

        // 難易度フィルター
        const difficulty = document.getElementById('difficulty');
        difficulty.addEventListener('change', (e) => {
            this.currentFilters.difficulty = e.target.value;
            this.renderAlternatives();
        });

        // 料理用途フィルター
        const cuisineType = document.getElementById('cuisine-type');
        cuisineType.addEventListener('change', (e) => {
            this.currentFilters.cuisineType = e.target.value;
            this.renderAlternatives();
        });

        // タブボタン
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.getAttribute('data-tab');
                this.setActiveTab(tab);
                this.currentFilters.activeTab = tab;
                this.renderAlternatives();
            });
        });

        // モーダル
        this.setupModal();
    }

    setupModal() {
        const modal = document.getElementById('recipe-modal');
        const closeBtn = document.querySelector('.close');

        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    updateCarbRangeDisplay() {
        const carbValue = document.getElementById('carb-value');
        carbValue.textContent = `${this.currentFilters.carbLimit}g以下`;
    }

    setActiveTab(tab) {
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-tab') === tab) {
                btn.classList.add('active');
            }
        });
    }

    getAllAlternatives() {
        if (!this.data || !this.data.dishes[0]) return [];
        
        const dish = this.data.dishes[0];
        const alternatives = [];
        
        // 各カテゴリーから代替案を収集
        if (dish.alternatives.ultra_low_carb) {
            alternatives.push(...dish.alternatives.ultra_low_carb.map(alt => ({...alt, category: 'ultra-low-carb'})));
        }
        if (dish.alternatives.low_carb) {
            alternatives.push(...dish.alternatives.low_carb.map(alt => ({...alt, category: 'low-carb'})));
        }
        if (dish.alternatives.moderate_carb) {
            alternatives.push(...dish.alternatives.moderate_carb.map(alt => ({...alt, category: 'moderate-carb'})));
        }
        if (dish.alternatives.specialty_blends) {
            alternatives.push(...dish.alternatives.specialty_blends.map(alt => ({...alt, category: 'specialty'})));
        }

        return alternatives;
    }

    filterAlternatives(alternatives) {
        return alternatives.filter(alt => {
            // 糖質量フィルター
            if (alt.carbs_per_100g > this.currentFilters.carbLimit) return false;
            
            // 難易度フィルター
            if (this.currentFilters.difficulty !== 'all' && alt.difficulty !== this.currentFilters.difficulty) return false;
            
            // 料理用途フィルター（タブとフィルターの両方に対応）
            const targetCuisine = this.currentFilters.activeTab !== 'all' ? this.currentFilters.activeTab : this.currentFilters.cuisineType;
            if (targetCuisine !== 'all') {
                if (!alt.best_for || !alt.best_for.some(cuisine => 
                    this.cuisineMapping[targetCuisine] && this.cuisineMapping[targetCuisine].includes(cuisine)
                )) return false;
            }
            
            return true;
        });
    }

    get cuisineMapping() {
        return {
            'curry': ['カレー'],
            'sushi': ['寿司'],
            'fried_rice': ['チャーハン'],
            'rice_bowl': ['丼ぶり', '丼物', '汁だく丼'],
            'furikake': ['ふりかけご飯']
        };
    }

    renderAlternatives() {
        const container = document.getElementById('alternatives-container');
        const alternatives = this.getAllAlternatives();
        const filteredAlternatives = this.filterAlternatives(alternatives);

        if (filteredAlternatives.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
                    <i class="fas fa-search" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                    <p style="color: #666; font-size: 1.2rem;">条件に合う代替案が見つかりませんでした。</p>
                    <p style="color: #888;">フィルター条件を変更してお試しください。</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredAlternatives.map(alt => this.createAlternativeCard(alt)).join('');
        
        // レシピボタンのイベントリスナーを設定
        this.setupRecipeButtons();
    }

    createAlternativeCard(alternative) {
        const difficultyIcons = {
            easy: 'fas fa-star',
            medium: 'fas fa-star-half-alt',
            hard: 'fas fa-exclamation-triangle'
        };

        const difficultyColors = {
            easy: 'difficulty-easy',
            medium: 'difficulty-medium',
            hard: 'difficulty-hard'
        };

        const difficultyLabels = {
            easy: '簡単',
            medium: '普通',
            hard: '難しい'
        };

        return `
            <div class="alternative-card ${alternative.category}" data-name="${alternative.name}">
                <div class="card-header">
                    <h3 class="card-title">${alternative.name}</h3>
                    <span class="carb-badge">${alternative.carbs_per_100g}g</span>
                </div>
                
                <div class="nutrition-info">
                    <div class="nutrition-item">
                        <div class="nutrition-value">${alternative.carbs_per_100g}g</div>
                        <div class="nutrition-label">糖質</div>
                    </div>
                    <div class="nutrition-item">
                        <div class="nutrition-value">${alternative.protein_per_100g}g</div>
                        <div class="nutrition-label">たんぱく質</div>
                    </div>
                    <div class="nutrition-item">
                        <div class="nutrition-value">${alternative.calories_per_100g}</div>
                        <div class="nutrition-label">カロリー</div>
                    </div>
                    ${alternative.fiber_per_100g ? `
                    <div class="nutrition-item">
                        <div class="nutrition-value">${alternative.fiber_per_100g}g</div>
                        <div class="nutrition-label">食物繊維</div>
                    </div>
                    ` : ''}
                </div>

                <div class="reduction-highlight">
                    <div class="reduction-percent">${alternative.carb_reduction_vs_white_rice}%削減</div>
                    <div class="reduction-text">白米と比較</div>
                </div>

                <div class="card-content">
                    <p><strong>食感:</strong> ${alternative.texture}</p>
                    ${alternative.tips ? `<p><strong>コツ:</strong> ${alternative.tips}</p>` : ''}
                </div>

                <div class="best-for">
                    <div class="best-for-title">おすすめ用途:</div>
                    <div class="cuisine-tags">
                        ${alternative.best_for.map(cuisine => `<span class="cuisine-tag">${cuisine}</span>`).join('')}
                    </div>
                </div>

                <div class="card-footer">
                    <div class="difficulty-badge ${difficultyColors[alternative.difficulty]}">
                        <i class="${difficultyIcons[alternative.difficulty]}"></i>
                        <span>${difficultyLabels[alternative.difficulty]}</span>
                    </div>
                    <button class="recipe-btn" data-recipe='${JSON.stringify(alternative)}'>
                        <i class="fas fa-utensils"></i> 作り方
                    </button>
                </div>
            </div>
        `;
    }

    setupRecipeButtons() {
        const recipeButtons = document.querySelectorAll('.recipe-btn');
        recipeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const recipeData = JSON.parse(e.target.getAttribute('data-recipe') || e.target.closest('.recipe-btn').getAttribute('data-recipe'));
                this.showRecipeModal(recipeData);
            });
        });
    }

    showRecipeModal(recipe) {
        const modal = document.getElementById('recipe-modal');
        const modalBody = document.getElementById('modal-body');

        modalBody.innerHTML = `
            <h2 style="color: #4CAF50; margin-bottom: 1.5rem;">
                <i class="fas fa-utensils"></i> ${recipe.name}の作り方
            </h2>
            
            <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
                <h3 style="margin-bottom: 1rem; color: #333;">栄養情報（100gあたり）</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem;">
                    <div style="text-align: center;">
                        <div style="font-size: 1.5rem; font-weight: bold; color: #4CAF50;">${recipe.carbs_per_100g}g</div>
                        <div>糖質</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 1.5rem; font-weight: bold; color: #4CAF50;">${recipe.protein_per_100g}g</div>
                        <div>たんぱく質</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 1.5rem; font-weight: bold; color: #4CAF50;">${recipe.calories_per_100g}</div>
                        <div>カロリー</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 1.5rem; font-weight: bold; color: #4CAF50;">${recipe.carb_reduction_vs_white_rice}%</div>
                        <div>糖質削減率</div>
                    </div>
                </div>
            </div>

            <div style="margin-bottom: 2rem;">
                <h3 style="color: #333; margin-bottom: 1rem;"><i class="fas fa-list-ol"></i> 調理手順</h3>
                <div style="background: white; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #4CAF50;">
                    ${recipe.preparation}
                </div>
            </div>

            <div style="margin-bottom: 2rem;">
                <h3 style="color: #333; margin-bottom: 1rem;"><i class="fas fa-lightbulb"></i> 特徴・食感</h3>
                <p style="background: #e8f5e8; padding: 1rem; border-radius: 8px; margin: 0;">
                    ${recipe.texture}
                </p>
            </div>

            ${recipe.tips ? `
            <div style="margin-bottom: 2rem;">
                <h3 style="color: #333; margin-bottom: 1rem;"><i class="fas fa-magic"></i> 成功のコツ</h3>
                <p style="background: #fff3e0; padding: 1rem; border-radius: 8px; margin: 0;">
                    ${recipe.tips}
                </p>
            </div>
            ` : ''}

            <div>
                <h3 style="color: #333; margin-bottom: 1rem;"><i class="fas fa-heart"></i> おすすめ料理</h3>
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                    ${recipe.best_for.map(cuisine => `
                        <span style="background: #e3f2fd; color: #1976d2; padding: 0.5rem 1rem; border-radius: 15px; font-size: 0.9rem;">
                            ${cuisine}
                        </span>
                    `).join('')}
                </div>
            </div>
        `;

        modal.style.display = 'block';
    }

    renderComparisonTable() {
        const tableBody = document.getElementById('comparison-table-body');
        if (!this.data) return;

        const standards = this.data.comparison_standards;
        const alternatives = this.getAllAlternatives();
        
        // 一般的な主食のデータを準備
        const comparisonData = [];
        
        // 主食類を追加
        Object.values(standards.rice_types).forEach(item => {
            comparisonData.push({...item, category: 'baseline'});
        });
        Object.values(standards.bread_types).forEach(item => {
            comparisonData.push({...item, category: 'baseline'});
        });
        Object.values(standards.noodle_types).forEach(item => {
            comparisonData.push({...item, category: 'baseline'});
        });

        // 代替案を追加（上位3つ）
        const topAlternatives = alternatives
            .sort((a, b) => a.carbs_per_100g - b.carbs_per_100g)
            .slice(0, 3);
        
        topAlternatives.forEach(alt => {
            comparisonData.push({
                carbs_per_100g: alt.carbs_per_100g,
                name: alt.name,
                category: 'alternative'
            });
        });

        // 糖質量でソート
        comparisonData.sort((a, b) => b.carbs_per_100g - a.carbs_per_100g);

        const maxCarbs = Math.max(...comparisonData.map(item => item.carbs_per_100g));

        tableBody.innerHTML = comparisonData.map(item => {
            const reductionPercent = item.category === 'alternative' 
                ? ((36.8 - item.carbs_per_100g) / 36.8 * 100).toFixed(1)
                : '-';
            
            const reductionClass = item.category === 'alternative'
                ? (parseFloat(reductionPercent) > 90 ? 'reduction-excellent' : 'reduction-good')
                : '';

            const barWidth = (item.carbs_per_100g / maxCarbs) * 100;
            const barClass = item.category === 'baseline' ? 'carb-baseline' : 'carb-alternative';

            return `
                <tr>
                    <td><strong>${item.name}</strong></td>
                    <td>${item.carbs_per_100g}g</td>
                    <td>
                        <div class="carb-bar">
                            <div class="carb-fill ${barClass}" style="width: ${barWidth}%"></div>
                        </div>
                    </td>
                    <td class="${reductionClass}">
                        ${reductionPercent !== '-' ? `${reductionPercent}%削減` : '-'}
                    </td>
                </tr>
            `;
        }).join('');
    }
}

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', () => {
    new RiceAlternativesApp();
});