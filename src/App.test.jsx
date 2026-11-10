import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";
import App from "./App";

const apiResponse = {
  response_code: 0,
  results: Array.from({ length: 5 }, (_, i) => ({
    question: `Question ${i + 1} &amp; more?`,
    correct_answer: "Right",
    incorrect_answers: ["Wrong A", "Wrong B", "Wrong C"],
  })),
};

function mockApi(body = apiResponse, overrides = {}) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => body,
    ...overrides,
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

async function startQuiz(user) {
  await user.click(screen.getByRole("button", { name: /start quiz/i }));
  await screen.findByText("Question 1 & more?");
}

async function answerAll(user, name) {
  for (const radio of screen.getAllByRole("radio", { name })) {
    await user.click(radio);
  }
}

describe("quiz flow", () => {
  it("loads questions, decodes entities and shows the score", async () => {
    mockApi();
    const user = userEvent.setup();
    render(<App />);

    await startQuiz(user);
    await answerAll(user, "Right");
    await user.click(screen.getByRole("button", { name: /check answers/i }));

    expect(screen.getByRole("status")).toHaveTextContent(
      "You scored 5/5 correct answers",
    );
    expect(screen.getByText(/new best score/i)).toBeInTheDocument();
  });

  it("asks the user to answer every question first", async () => {
    mockApi();
    const user = userEvent.setup();
    render(<App />);

    await startQuiz(user);
    await user.click(screen.getByRole("button", { name: /check answers/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      /answer all questions/i,
    );
  });

  it("does not celebrate a score of 0", async () => {
    mockApi();
    const user = userEvent.setup();
    render(<App />);

    await startQuiz(user);
    await answerAll(user, "Wrong A");
    await user.click(screen.getByRole("button", { name: /check answers/i }));

    expect(screen.getByRole("status")).toHaveTextContent("You scored 0/5");
    expect(screen.queryByText(/new best score/i)).not.toBeInTheDocument();
  });

  it("shows an error with retry options when the API is rate limited", async () => {
    mockApi(null, { ok: false, status: 429 });
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /start quiz/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /too many requests/i,
    );
    expect(
      screen.getByRole("button", { name: /try again/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /change settings/i }),
    ).toBeInTheDocument();
  });
});

describe("settings", () => {
  it("sends the selected category, difficulty and amount", async () => {
    const fetchMock = mockApi();
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(
      screen.getByLabelText("Category"),
      "Science: Computers",
    );
    await user.selectOptions(screen.getByLabelText("Difficulty"), "Hard");
    await user.selectOptions(
      screen.getByLabelText("Number of questions"),
      "10",
    );
    await startQuiz(user);

    const url = fetchMock.mock.calls[0][0];
    expect(url).toContain("category=18");
    expect(url).toContain("difficulty=hard");
    expect(url).toContain("amount=10");
  });
});

describe("best score", () => {
  it("shows a saved best score on the start screen", () => {
    localStorage.setItem(
      "quizzical-best",
      JSON.stringify({ score: 4, total: 5 }),
    );
    render(<App />);

    expect(screen.getByText(/best score/i)).toHaveTextContent(
      "Best score: 4/5",
    );
  });

  it("saves the best score after a round", async () => {
    mockApi();
    const user = userEvent.setup();
    render(<App />);

    await startQuiz(user);
    await answerAll(user, "Right");
    await user.click(screen.getByRole("button", { name: /check answers/i }));
    await user.click(screen.getByRole("button", { name: /change settings/i }));

    expect(screen.getByText(/best score/i)).toHaveTextContent(
      "Best score: 5/5",
    );
    expect(JSON.parse(localStorage.getItem("quizzical-best"))).toEqual({
      score: 5,
      total: 5,
    });
  });
});

describe("dark mode", () => {
  it("toggles the theme, updates the label and remembers the choice", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /dark mode/i }));

    expect(
      screen.getByRole("button", { name: /light mode/i }),
    ).toBeInTheDocument();
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem("quizzical-theme")).toBe('"dark"');

    await user.click(screen.getByRole("button", { name: /light mode/i }));

    expect(
      screen.getByRole("button", { name: /dark mode/i }),
    ).toBeInTheDocument();
    expect(document.documentElement.dataset.theme).toBe("light");
  });
});

describe("accessibility (axe)", () => {
  it("start screen has no violations", async () => {
    const { container } = render(<App />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("quiz and results screens have no violations", async () => {
    mockApi();
    const user = userEvent.setup();
    const { container } = render(<App />);

    await startQuiz(user);
    expect(await axe(container)).toHaveNoViolations();

    await answerAll(user, "Right");
    await user.click(screen.getByRole("button", { name: /check answers/i }));
    expect(await axe(container)).toHaveNoViolations();
  });
});
