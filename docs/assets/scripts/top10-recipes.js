// TOP10 ヴィーガンレシピページのJavaScript

class Top10RecipesApp {
    constructor() {
        this.data = null;
        this.filteredRecipes = [];
        this.currentFilters = {
            difficulty: 'all',
            protein: 'all',
            category: 'all',
            time: 'all'
        };
        this.init();
    }

    async init() {
        await this.loadData();
        this.setupEventListeners();
        this.renderRecipes();
        this.renderTips();
    }

    async loadData() {
        try {
            const response = await fetch('./data/top10-recipes.json');
            this.data = await response.json();
            this.filteredRecipes = [...this.data.recipes];
            console.log('レシピデータ読み込み完了:', this.data);
        } catch (error) {
            console.error('データの読み込みに失敗しました:', error);
        }
    }

    setupEventListeners() {
        // フィルターイベント
        const difficultyFilter = document.getElementById('difficulty-filter');
        const proteinFilter = document.getElementById('protein-filter');
        const categoryFilter = document.getElementById('category-filter');
        const timeFilter = document.getElementById('time-filter');

        difficultyFilter.addEventListener('change', (e) => {
            this.currentFilters.difficulty = e.target.value;
            this.applyFilters();
        });

        proteinFilter.addEventListener('change', (e) => {
            this.currentFilters.protein = e.target.value;
            this.applyFilters();
        });

        categoryFilter.addEventListener('change', (e) => {
            this.currentFilters.category = e.target.value;
            this.applyFilters();
        });

        timeFilter.addEventListener('change', (e) => {
            this.currentFilters.time = e.target.value;
            this.applyFilters();
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

    applyFilters() {
        this.filteredRecipes = this.data.recipes.filter(recipe => {
            // 難易度フィルター
            if (this.currentFilters.difficulty !== 'all') {
                const hasMatchingDifficulty = recipe.variations.some(variation => 
                    variation.difficulty === this.currentFilters.difficulty
                );
                if (!hasMatchingDifficulty) return false;
            }

            // たんぱく質フィルター
            if (this.currentFilters.protein !== 'all') {
                const hasMatchingProtein = recipe.variations.some(variation => {
                    const protein = parseInt(variation.nutrition.protein);
                    switch (this.currentFilters.protein) {
                        case 'high': return protein >= 20;
                        case 'medium': return protein >= 15 && protein < 20;
                        case 'low': return protein < 15;
                        default: return true;
                    }
                });
                if (!hasMatchingProtein) return false;
            }

            // カテゴリーフィルター
            if (this.currentFilters.category !== 'all') {
                if (recipe.category !== this.currentFilters.category) return false;
            }

            // 調理時間フィルター
            if (this.currentFilters.time !== 'all') {
                const hasMatchingTime = recipe.variations.some(variation => {
                    const prepTime = parseInt(variation.prep_time);
                    const cookTime = parseInt(variation.cooking_time);
                    const totalTime = prepTime + cookTime;
                    
                    switch (this.currentFilters.time) {
                        case 'quick': return totalTime <= 15;
                        case 'medium': return totalTime <= 30;
                        case 'long': return totalTime > 30;
                        default: return true;
                    }
                });
                if (!hasMatchingTime) return false;
            }

            return true;
        });

        this.renderRecipes();
    }

    renderRecipes() {
        const container = document.getElementById('recipes-container');
        
        if (this.filteredRecipes.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                    <i class="fas fa-search" style="font-size: 4rem; color: #ccc; margin-bottom: 1rem;"></i>
                    <h3 style="color: #666; margin-bottom: 1rem;">条件に合うレシピが見つかりません</h3>
                    <p style="color: #888;">フィルター条件を変更してお試しください。</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.filteredRecipes.map(recipe => this.createRecipeCard(recipe)).join('');
        
        // イベントリスナーを設定
        this.setupRecipeCardEvents();
    }

    createRecipeCard(recipe) {
        const bestVariation = recipe.variations[0]; // 最初のバリエーションを代表として表示
        const difficultyIcons = {
            easy: 'fas fa-star',
            medium: 'fas fa-star-half-alt',
            hard: 'fas fa-exclamation-triangle'
        };

        const difficultyLabels = {
            easy: '簡単',
            medium: '普通',
            hard: '上級'
        };

        return `
            <div class="recipe-card" data-recipe='${JSON.stringify(recipe)}'>
                <div class="recipe-header">
                    <div class="recipe-title">
                        <div class="recipe-rank">${recipe.rank}位</div>
                        <div class="recipe-name">
                            <h3>${recipe.alternative_name}</h3>
                            <div class="original">${recipe.original_dish} の代替</div>
                        </div>
                    </div>
                </div>
                
                <div class="recipe-body">
                    <div class="recipe-variations">
                        ${recipe.variations.map((variation, index) => `
                            <span class="variation-button" onclick="window.top10RecipesApp.showRecipeModal(${recipe.rank}, ${index})">
                                ${variation.name}
                            </span>
                        `).join('')}
                    </div>
                    
                    <div class="recipe-stats">
                        <div class="stat-item">
                            <div class="stat-value">${bestVariation.nutrition.protein}</div>
                            <div class="stat-label">たんぱく質</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${bestVariation.nutrition.carbs}</div>
                            <div class="stat-label">糖質</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${bestVariation.nutrition.calories}</div>
                            <div class="stat-label">カロリー</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${bestVariation.nutrition.carb_reduction}</div>
                            <div class="stat-label">糖質削減</div>
                        </div>
                    </div>
                    
                    <div class="recipe-meta">
                        <div class="difficulty-badge difficulty-${bestVariation.difficulty}">
                            <i class="${difficultyIcons[bestVariation.difficulty]}"></i>
                            <span>${difficultyLabels[bestVariation.difficulty]}</span>
                        </div>
                        <button class="recipe-details-btn" onclick="window.top10RecipesApp.showRecipeModal(${recipe.rank}, 0)">
                            <i class="fas fa-utensils"></i> 詳細レシピ
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    setupRecipeCardEvents() {
        // 必要に応じて追加のイベントリスナーを設定
    }

    showRecipeModal(rank, variationIndex) {
        const recipe = this.data.recipes.find(r => r.rank === rank);
        const variation = recipe.variations[variationIndex];
        
        const modal = document.getElementById('recipe-modal');
        const modalBody = document.getElementById('modal-body');

        modalBody.innerHTML = `
            <h2 class="modal-recipe-title">
                <i class="fas fa-utensils"></i> ${variation.name}
            </h2>
            
            <div class="modal-nutrition">
                <h3>栄養情報（${variation.servings}人分）</h3>
                <div class="nutrition-grid">
                    <div class="nutrition-item">
                        <div class="nutrition-value">${variation.nutrition.protein}</div>
                        <div class="nutrition-label">たんぱく質</div>
                    </div>
                    <div class="nutrition-item">
                        <div class="nutrition-value">${variation.nutrition.carbs}</div>
                        <div class="nutrition-label">糖質</div>
                    </div>
                    <div class="nutrition-item">
                        <div class="nutrition-value">${variation.nutrition.fat}</div>
                        <div class="nutrition-label">脂質</div>
                    </div>
                    <div class="nutrition-item">
                        <div class="nutrition-value">${variation.nutrition.calories}</div>
                        <div class="nutrition-label">カロリー</div>
                    </div>
                    <div class="nutrition-item">
                        <div class="nutrition-value">${variation.nutrition.carb_reduction}</div>
                        <div class="nutrition-label">糖質削減率</div>
                    </div>
                    <div class="nutrition-item">
                        <div class="nutrition-value">${variation.prep_time}</div>
                        <div class="nutrition-label">準備時間</div>
                    </div>
                    <div class="nutrition-item">
                        <div class="nutrition-value">${variation.cooking_time}</div>
                        <div class="nutrition-label">調理時間</div>
                    </div>
                    <div class="nutrition-item">
                        <div class="nutrition-value">${variation.servings}人分</div>
                        <div class="nutrition-label">分量</div>
                    </div>
                </div>
            </div>

            <div class="modal-section">
                <h3><i class="fas fa-shopping-cart"></i> 材料</h3>
                <div class="ingredients-list">
                    ${variation.ingredients.map(ingredient => `
                        <div class="ingredient-item">
                            <div>
                                <div class="ingredient-name">${ingredient.item}</div>
                                <div class="ingredient-role">${ingredient.role}</div>
                            </div>
                            <div class="ingredient-amount">${ingredient.amount}</div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="modal-section">
                <h3><i class="fas fa-list-ol"></i> 作り方</h3>
                <div class="instructions-list">
                    ${variation.instructions.map((instruction, index) => `
                        <div class="instruction-item">
                            <span class="step-number">${index + 1}</span>
                            ${instruction}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        modal.style.display = 'block';
    }

    renderTips() {
        this.renderSweeteners();
        this.renderProteinBoosters();
        this.renderCarbAlternatives();
    }

    renderSweeteners() {
        const container = document.getElementById('sweeteners-list');
        container.innerHTML = this.data.tips.natural_sweeteners.map(tip => `
            <div class="tip-item">
                <h4>${tip.name}</h4>
                <p>${tip.usage}</p>
                <div class="best-for">最適な用途: ${tip.best_for}</div>
            </div>
        `).join('');
    }

    renderProteinBoosters() {
        const container = document.getElementById('protein-boosters-list');
        container.innerHTML = this.data.tips.protein_boosters.map(tip => `
            <div class="tip-item">
                <h4>${tip.name}</h4>
                <p>${tip.usage}</p>
                <div class="best-for">たんぱく質: ${tip.protein}</div>
            </div>
        `).join('');
    }

    renderCarbAlternatives() {
        const container = document.getElementById('carb-alternatives-list');
        container.innerHTML = this.data.tips.carb_alternatives.map(tip => `
            <div class="tip-item">
                <h4>${tip.name}</h4>
                <p>${tip.usage}</p>
                <div class="best-for">糖質削減: ${tip.carb_reduction}</div>
            </div>
        `).join('');
    }
}

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', () => {
    window.top10RecipesApp = new Top10RecipesApp();
});