import { QuestionAnswerKey } from '../types';

/**
 * Parses a raw string input into a QuestionAnswerKey array.
 * Supports:
 * 1. Simple continuous letters string like "ABCDACBD" or "ABACD"
 * 2. Delimited list like "A, B, C, D" or "1. A\n2. B\n3. C"
 * 3. Key-Value text like "1:A 2:B 3:C"
 * 4. JSON array format like '[{"q":1,"ans":"A"}]'
 */
export function parseAnswerKeyInput(input: string, totalQuestions: number): QuestionAnswerKey[] {
  const trimmed = input.trim();
  if (!trimmed) return [];

  // Attempt JSON parsing first
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      const result: QuestionAnswerKey[] = [];
      arr.forEach((item: any, idx: number) => {
        const qNum = typeof item.q === 'number' ? item.q : idx + 1;
        const ansVal = String(item.ans || item.answer || item.opt || item.option || '').trim().toUpperCase();
        if (ansVal) {
          result.push({ q: qNum, ans: ansVal });
        }
      });
      if (result.length > 0) return result;
    } catch (e) {
      // Fallback to text parser if JSON fails
    }
  }

  // Key-value pair matching (e.g. "1:A 2:B 3:C" or "1.A, 2.B")
  const kvRegex = /(?:Q?(\d+)[\.\s:\-\=]+([A-D0-9\.\-]+))/gi;
  let match;
  const kvResult: QuestionAnswerKey[] = [];
  while ((match = kvRegex.exec(trimmed)) !== null) {
    const qNum = parseInt(match[1], 10);
    const ansVal = match[2].trim().toUpperCase();
    if (qNum > 0 && ansVal) {
      kvResult.push({ q: qNum, ans: ansVal });
    }
  }

  if (kvResult.length > 0) {
    // Sort by question number
    return kvResult.sort((a, b) => a.q - b.q);
  }

  // Check if it's a raw sequence of options like "ABCDA BCD" or "A B C D" or "ABCDACBD..."
  // Clean all numbers, spaces, punctuation except A, B, C, D or numbers
  const cleanedSeq = trimmed.replace(/[^A-D0-9]/gi, '').toUpperCase();
  if (cleanedSeq.length > 0) {
    const seqResult: QuestionAnswerKey[] = [];
    const limit = Math.min(cleanedSeq.length, totalQuestions || 300);
    for (let i = 0; i < limit; i++) {
      seqResult.push({ q: i + 1, ans: cleanedSeq[i] });
    }
    return seqResult;
  }

  return [];
}

/**
 * Returns a standardized prompt that the user can copy & paste to Gemini or ChatGPT app along with a screenshot of the answer key.
 */
export function getAIAnswerKeyPrompt(subject: string, questionCount: number): string {
  return `Act as an expert OCR & Answer Key Extractor for JEE/NEET entrance test.
Attached is a screenshot/photo of an answer key page for ${subject || 'JEE/NEET Test'}.

Task:
Extract all question numbers (from 1 to ${questionCount || 'N'}) and their correct answers (Options A, B, C, D or numerical integer/decimal values).

Output Requirement:
Return ONLY a valid, raw JSON array of objects without markdown wrappers or code block quotes.
Each object must strictly follow this JSON format:
[
  { "q": 1, "ans": "A" },
  { "q": 2, "ans": "C" },
  { "q": 3, "ans": "25" }
]

Ensure all answers are uppercase and accurately matched with the question numbers in sequence. Do not include any explanations.`;
}

/**
 * Validates whether an answer key matches the total questions count
 */
export function getAnswerKeyStats(answerKey: QuestionAnswerKey[], totalQuestions: number) {
  const answeredCount = answerKey.length;
  const isComplete = answeredCount >= totalQuestions;
  return {
    answeredCount,
    totalQuestions,
    isComplete,
    missingCount: Math.max(0, totalQuestions - answeredCount)
  };
}
