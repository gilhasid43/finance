// Simple Hebrew-oriented natural language parser for expenses
// Accepts inputs like:
// - "30 שקל קפה"
// - "קניתי קפה ב-15 ש"ח במזומן"
// - "אוכל 50"
// Extracts: amount (ILS), category, method (optional), and note (remaining text)

import type { PaymentMethod } from "@/store/expenses";

export interface ParsedExpense {
  amount: number | null;
  category: string | null;
  method: PaymentMethod | null;
  note: string;
}

const PAYMENT_KEYWORDS: Array<[RegExp, PaymentMethod]> = [
  [/מזומן/, "מזומן"],
  [/אשראי|כרטיס/, "כרטיס אשראי"],
  [/העברה|בנק/, "העברה"],
  [/אחר/, "אחר"],
];

const CATEGORY_HINTS: string[] = [
  // Hebrew common categories
  "קפה",
  "אוכל",
  "תחבורה",
  "בילויים",
  "קניות",
  "תרופות",
  // English common categories
  "coffee",
  "food",
  "groceries",
  "dining",
  "dining out",
  "transport",
  "shopping",
  "medications",
];

export function parseExpenseInput(raw: string): ParsedExpense {
  let text = (raw || "").trim();
  if (!text) {
    return { amount: null, category: null, method: null, note: "" };
  }

  // Normalize quotes and separators
  text = text.replace(/ש"ח|₪/g, "שח");
  // Normalize common English currency words to a single token
  text = text.replace(/\b(shekel|shekels|nis|ils)\b/gi, "שח");

  // Extract amount: numbers possibly with decimal, before/after currency words
  const amountMatch = text.match(/(\d+(?:[\.,]\d+)?)\s*(?:שח|שקל|שקלים)?/);
  const amount = amountMatch ? Number(String(amountMatch[1]).replace(",", ".")) : null;

  // Extract method
  let method: PaymentMethod | null = null;
  for (const [re, val] of PAYMENT_KEYWORDS) {
    if (re.test(text)) {
      method = val;
      break;
    }
  }

  // Guess category by hint word, otherwise first non-number token
  let category: string | null = null;
  for (const hint of CATEGORY_HINTS) {
    if (text.includes(hint)) {
      category = hint;
      break;
    }
  }
  if (!category) {
    const tokens = text.split(/\s+/).filter(Boolean);
    // remove any token that is clearly a number or currency marker (Heb/Eng)
    const candidate = tokens.find(t => !/^(\d+|שח|שקל|שקלים|shekel|shekels|nis|ils|ב-?)$/i.test(t));
    if (candidate) category = candidate;
  }

  // Note: keep original text sans trivial currency markers
  const note = text
    .replace(/\s*שח\s*/g, " ")
    .replace(/\b(shekel|shekels|nis|ils)\b/gi, " ")
    .trim();

  return { amount, category, method, note };
}


