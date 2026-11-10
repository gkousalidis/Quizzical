import { describe, expect, it, vi } from "vitest";
import { fetchQuestions } from "./api";

const okResponse = (body) => ({
  ok: true,
  status: 200,
  json: async () => body,
});

function mockFetch(response) {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("fetchQuestions", () => {
  it("returns formatted, decoded questions", async () => {
    mockFetch(
      okResponse({
        response_code: 0,
        results: [
          {
            question: "Is 1 &lt; 2?",
            correct_answer: "Yes",
            incorrect_answers: ["No", "Maybe", "Never"],
          },
        ],
      }),
    );

    const questions = await fetchQuestions({ amount: "1" });
    expect(questions).toHaveLength(1);
    expect(questions[0].question).toBe("Is 1 < 2?");
  });

  it("sends the chosen settings to the API", async () => {
    const fetchMock = mockFetch(okResponse({ response_code: 0, results: [] }));

    await fetchQuestions({ amount: "10", category: "9", difficulty: "easy" });

    const url = fetchMock.mock.calls[0][0];
    expect(url).toContain("amount=10");
    expect(url).toContain("category=9");
    expect(url).toContain("difficulty=easy");
  });

  it("throws a friendly message on HTTP 429", async () => {
    mockFetch({ ok: false, status: 429 });
    await expect(fetchQuestions({})).rejects.toThrow(/too many requests/i);
  });

  it("throws when the API has not enough questions (code 1)", async () => {
    mockFetch(okResponse({ response_code: 1, results: [] }));
    await expect(fetchQuestions({})).rejects.toThrow(/enough questions/i);
  });

  it("throws on other HTTP errors", async () => {
    mockFetch({ ok: false, status: 500 });
    await expect(fetchQuestions({})).rejects.toThrow(/status 500/);
  });
});
