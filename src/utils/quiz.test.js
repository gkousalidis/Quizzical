import { describe, expect, it, vi } from "vitest";
import {
  buildUrl,
  calculateScore,
  formatQuestions,
  isBetterScore,
  shuffle,
} from "./quiz";

describe("shuffle", () => {
  it("returns a new array with the same items", () => {
    const input = [1, 2, 3, 4];
    const output = shuffle(input);

    expect(output).not.toBe(input);
    expect([...output].sort()).toEqual([1, 2, 3, 4]);
  });

  it("does not mutate the original array", () => {
    const input = [1, 2, 3, 4];
    shuffle(input);
    expect(input).toEqual([1, 2, 3, 4]);
  });

  it("produces a predictable order when Math.random is mocked", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    expect(shuffle([1, 2, 3, 4])).toEqual([2, 3, 4, 1]);
  });
});

describe("buildUrl", () => {
  it("uses sensible defaults", () => {
    expect(buildUrl()).toBe(
      "https://opentdb.com/api.php?amount=5&type=multiple",
    );
  });

  it("adds category, difficulty and amount", () => {
    const url = new URL(
      buildUrl({ amount: "10", category: "9", difficulty: "hard" }),
    );
    expect(url.searchParams.get("amount")).toBe("10");
    expect(url.searchParams.get("category")).toBe("9");
    expect(url.searchParams.get("difficulty")).toBe("hard");
  });

  it("leaves out empty category and difficulty ('any')", () => {
    const url = new URL(
      buildUrl({ amount: "5", category: "", difficulty: "" }),
    );
    expect(url.searchParams.has("category")).toBe(false);
    expect(url.searchParams.has("difficulty")).toBe(false);
  });
});

describe("formatQuestions", () => {
  const raw = [
    {
      question: "Who wrote &quot;Hamlet&quot;?",
      correct_answer: "Shakespeare",
      incorrect_answers: ["Marlowe &amp; Co", "Jonson", "Bacon"],
    },
  ];

  it("decodes HTML entities", () => {
    const [q] = formatQuestions(raw);
    expect(q.question).toBe('Who wrote "Hamlet"?');
    expect(q.answers).toContain("Marlowe & Co");
  });

  it("includes the correct answer among 4 shuffled answers", () => {
    const [q] = formatQuestions(raw);
    expect(q.correct).toBe("Shakespeare");
    expect(q.answers).toHaveLength(4);
    expect(q.answers).toContain("Shakespeare");
  });

  it("assigns sequential ids", () => {
    const questions = formatQuestions([...raw, ...raw]);
    expect(questions.map((q) => q.id)).toEqual([0, 1]);
  });
});

describe("calculateScore", () => {
  const questions = [
    { id: 0, correct: "a" },
    { id: 1, correct: "b" },
  ];

  it("counts only the correct selections", () => {
    expect(calculateScore(questions, { 0: "a", 1: "x" })).toBe(1);
  });

  it("returns 0 when nothing is selected", () => {
    expect(calculateScore(questions, {})).toBe(0);
  });
});

describe("isBetterScore", () => {
  it("accepts any score when there is no previous best", () => {
    expect(isBetterScore({ score: 1, total: 5 }, null)).toBe(true);
  });

  it("compares by percentage", () => {
    expect(isBetterScore({ score: 4, total: 5 }, { score: 3, total: 5 })).toBe(
      true,
    );
    expect(isBetterScore({ score: 3, total: 5 }, { score: 4, total: 5 })).toBe(
      false,
    );
    expect(isBetterScore({ score: 5, total: 10 }, { score: 4, total: 5 })).toBe(
      false,
    );
  });

  it("prefers the longer quiz on equal percentage", () => {
    expect(isBetterScore({ score: 8, total: 10 }, { score: 4, total: 5 })).toBe(
      true,
    );
  });

  it("does not replace an identical score", () => {
    expect(isBetterScore({ score: 4, total: 5 }, { score: 4, total: 5 })).toBe(
      false,
    );
  });
});
