import { decode } from "html-entities";

const API_BASE = "https://opentdb.com/api.php";

// Fisher–Yates shuffle (unbiased), returns a new array
export function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Empty category/difficulty means "any", so they're left out of the URL
export function buildUrl({ amount = 5, category = "", difficulty = "" } = {}) {
  const params = new URLSearchParams({
    amount: String(amount),
    type: "multiple",
  });
  if (category) params.set("category", category);
  if (difficulty) params.set("difficulty", difficulty);
  return `${API_BASE}?${params}`;
}

// Decode the HTML entities and build one shuffled answers array per question
export function formatQuestions(results) {
  return results.map((item, index) => {
    const correct = decode(item.correct_answer);
    // arrow fn on purpose: passing decode directly to map would pass the index as "options"
    const incorrect = item.incorrect_answers.map((answer) => decode(answer));

    return {
      id: index,
      question: decode(item.question),
      correct,
      answers: shuffle([...incorrect, correct]),
    };
  });
}

export function calculateScore(questions, selections) {
  return questions.filter((q) => selections[q.id] === q.correct).length;
}

// Compare by percentage so 4/5 and 8/10 are equal; on a tie the longer quiz wins.
export function isBetterScore(candidate, current) {
  if (!current) return true;
  const candidateRatio = candidate.score / candidate.total;
  const currentRatio = current.score / current.total;
  if (candidateRatio !== currentRatio) return candidateRatio > currentRatio;
  return candidate.total > current.total;
}
