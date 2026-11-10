import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";
import Question from "./Question";

const data = {
  id: 0,
  question: "Capital of France?",
  correct: "Paris",
  answers: ["Berlin", "Paris", "Rome", "Madrid"],
};

describe("Question", () => {
  it("renders a labelled group with one radio per answer", () => {
    render(<Question data={data} checked={false} onSelect={() => {}} />);

    const group = screen.getByRole("group", { name: "Capital of France?" });
    expect(within(group).getAllByRole("radio")).toHaveLength(4);
  });

  it("calls onSelect with the question id and the answer", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<Question data={data} checked={false} onSelect={onSelect} />);

    await user.click(screen.getByRole("radio", { name: "Paris" }));

    expect(onSelect).toHaveBeenCalledWith(0, "Paris");
  });

  it("shows results, not only with colour, once checked", () => {
    render(
      <Question
        data={data}
        selected="Rome"
        checked={true}
        onSelect={() => {}}
      />,
    );

    const correct = screen.getByRole("radio", {
      name: /paris.*correct answer/i,
    });
    const wrong = screen.getByRole("radio", {
      name: /rome.*your answer, incorrect/i,
    });

    expect(correct).toBeDisabled();
    expect(wrong).toBeChecked();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <Question data={data} checked={false} onSelect={() => {}} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
