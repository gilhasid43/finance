import type { BudgetsMap } from "@/store/expenses";

function tokenize(text: string): string[] {
  return (text || "")
    .toLowerCase()
    .replace(/["'`.,!?()\[\]-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function jaccard(aTokens: string[], bTokens: string[]): number {
  const a = new Set(aTokens);
  const b = new Set(bTokens);
  const intersection = new Set([...a].filter(x => b.has(x))).size;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : intersection / union;
}

export function chooseBestCategory(note: string, parsedCategory: string | null, budgets: BudgetsMap): string {
  const categories = Object.keys(budgets);
  if (categories.length === 0) {
    return parsedCategory ?? "כללי";
  }

  // If parsed category exactly matches one of budgets (case-insensitive), use it
  if (parsedCategory) {
    const exact = categories.find(c => c.toLowerCase() === parsedCategory.toLowerCase());
    if (exact) return exact;
  }

  // Score categories by similarity between note/category tokens
  const noteTokens = tokenize(note + " " + (parsedCategory ?? ""));
  let best = categories[0];
  let bestScore = -1;

  for (const cat of categories) {
    const catTokens = tokenize(cat);
    let score = jaccard(noteTokens, catTokens);
    // Boost for substring includes
    if (note.toLowerCase().includes(cat.toLowerCase())) score += 0.5;
    if (parsedCategory && cat.toLowerCase().startsWith(parsedCategory.toLowerCase())) score += 0.25;
    if (score > bestScore) {
      bestScore = score;
      best = cat;
    }
  }

  return best;
}


