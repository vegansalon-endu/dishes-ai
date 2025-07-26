# Duplicate Dish Analysis Report
## integrated-dishes-ranking.json

### Executive Summary
The analysis found **5 major duplicate issues** requiring consolidation to create a clean TOP100 ranking. Currently, the ranking has 99 entries instead of 100 due to ranking inconsistencies.

---

## 1. EXACT DUPLICATES (Critical Issues)

### 1.1 かぼちゃの煮物 (Pumpkin Simmered Dish)
**Status: EXACT DUPLICATE - MUST CONSOLIDATE**

- **Rank 62**: かぼちゃの煮物 (score: -360, 1 AI)
- **Rank 78**: かぼちゃの煮物 (score: -550, 4 AIs)

**Recommendation**: Keep Rank 78 entry (4 AIs, more comprehensive data) and remove Rank 62.

### 1.2 Ranking Inconsistency - Rank 9
**Status: DUPLICATE RANK - MUST FIX**

- **Rank 9**: とんかつ (score: 360, 4 AIs)
- **Rank 9**: 餃子 (score: 353.3, 3 AIs)

**Recommendation**: 
- とんかつ stays at Rank 9 (higher score: 360)
- 餃子 moves to Rank 10 (score: 353.3)
- All subsequent ranks shift down by 1

---

## 2. SIMILAR DISHES REQUIRING CONSOLIDATION

### 2.1 照り焼き (Teriyaki) Variations
**Status: SIMILAR DISHES - CONSIDER CONSOLIDATION**

- **Rank 32**: 鶏の照り焼き (score: -126.7, 2 AIs)
- **Rank 41**: 照り焼きチキン (score: -220, 1 AI)
- **Rank 61**: ぶり照り焼き (score: -360, 1 AI)

**Analysis**: 
- 鶏の照り焼き and 照り焼きチキン are the SAME DISH (chicken teriyaki)
- ぶり照り焼き is different (yellowtail teriyaki)

**Recommendation**: 
- Consolidate 鶏の照り焼き + 照り焼きチキン → Keep "鶏の照り焼き" (better score, more AIs)
- Keep ぶり照り焼き as separate dish

### 2.2 パスタ/スパゲッティ (Pasta/Spaghetti) Variations
**Status: SIMILAR DISHES - CONSIDER CONSOLIDATION**

- **Rank 31**: トマトスパゲティ (score: -120, 1 AI)
- **Rank 66**: パスタ (score: -440, 1 AI)  
- **Rank 74**: スパゲッティ (score: -520, 1 AI)
- **Rank 95**: ミートソーススパゲティ (score: -720, 1 AI)

**Analysis**:
- パスタ and スパゲッティ are generic terms (same category)
- トマトスパゲティ and ミートソーススパゲティ are specific dishes

**Recommendation**: 
- Consolidate パスタ + スパゲッティ → Keep "スパゲッティ" (more specific)
- Keep トマトスパゲティ and ミートソーススパゲティ as distinct dishes

### 2.3 そば (Soba) Variations
**Status: DIFFERENT DISHES - NO CONSOLIDATION NEEDED**

- **Rank 40**: 焼きそば (score: -215, 3 AIs) - Fried noodles
- **Rank 85**: そば (score: -620, 3 AIs) - Traditional soba

**Analysis**: These are completely different dishes despite sharing "そば" in the name.
**Recommendation**: Keep both as separate entries.

---

## 3. DISHES TO REVIEW (Lower Priority)

### 3.1 カツ (Katsu) Related Dishes
**Status: RELATED BUT DISTINCT - NO CONSOLIDATION**

- **Rank 9**: とんかつ (score: 360, 4 AIs) - Pork cutlet
- **Rank 39**: カツ丼 (score: -213.3, 3 AIs) - Cutlet rice bowl
- **Rank 79**: カツカレー (score: -560, 1 AI) - Cutlet curry

**Analysis**: These are distinct dishes using katsu as an ingredient.
**Recommendation**: Keep all as separate entries.

---

## 4. CONSOLIDATION ACTION PLAN

### Phase 1: Critical Fixes (Must Do)
1. **Remove duplicate かぼちゃの煮物 at Rank 62**
2. **Fix Rank 9 duplication**:
   - とんかつ → Rank 9
   - 餃子 → Rank 10
   - Shift all ranks 10+ down by 1

### Phase 2: Dish Consolidations (Recommended)
3. **Consolidate Chicken Teriyaki**:
   - Remove 照り焼きチキン (Rank 41)
   - Keep 鶏の照り焼き (Rank 32)
   
4. **Consolidate Generic Pasta**:
   - Remove パスタ (Rank 66)
   - Keep スパゲッティ (Rank 74)

### Expected Results After Consolidation
- **Current**: 99 entries with duplicates
- **After Phase 1**: 99 entries, no duplicates, proper ranking
- **After Phase 2**: 97 entries, need 3 more dishes for TOP100

---

## 5. RECOMMENDATIONS FOR CLEAN TOP100

### Option A: Add New Dishes
Add 3 dishes from the original dataset that were not included in TOP100.

### Option B: Expand Integration
Review the integration rules and consider including more dishes that were previously filtered out.

### Option C: Regional Variations
Include regional variations of popular dishes that were consolidated.

---

## 6. TECHNICAL NOTES

### Data Integrity Issues Found:
1. Exact duplicate dish names with different scores
2. Ranking system allowing duplicate rank numbers
3. Total count mismatch (99 vs 100 expected)

### Quality Assurance Needed:
1. Implement duplicate name detection in ranking system
2. Add unique rank validation
3. Ensure exact count requirements are met

---

## 7. FINAL RECOMMENDATION

**Priority Order for Clean TOP100:**
1. Fix かぼちゃの煮物 duplication (CRITICAL)
2. Fix Rank 9 duplication (CRITICAL)
3. Consolidate 鶏の照り焼き variants (HIGH)
4. Consolidate generic pasta entries (MEDIUM)
5. Add 3 new dishes to reach exactly 100 entries (LOW)

This will result in a clean, non-duplicate TOP100 ranking with proper sequential numbering and no content overlaps.