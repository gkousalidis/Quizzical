import { useEffect, useRef, useState } from "react";
import Question from "./Question";
import { calculateScore, isBetterScore } from "../utils/quiz";

export default function Quiz({
  questions,
  bestScore,
  onComplete,
  onPlayAgain,
  onChangeSettings,
}) {
  const [selections, setSelections] = useState({}); // { [questionId]: answerText }
  const [checked, setChecked] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [isNewBest, setIsNewBest] = useState(false);
  const headingRef = useRef(null);

  // Move focus to the page heading when the quiz screen appears
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const total = questions.length;
  const allAnswered = questions.every((q) => selections[q.id] !== undefined);
  const score = calculateScore(questions, selections);

  function handleSelect(questionId, answer) {
    if (checked) return;
    setSelections((prev) => ({ ...prev, [questionId]: answer }));
    setShowWarning(false);
  }

  function handleCheck() {
    if (!allAnswered) {
      setShowWarning(true);
      return;
    }
    const result = { score, total };
    // bestScore is still the previous best here, so we can detect a new record
    setIsNewBest(score > 0 && isBetterScore(result, bestScore));
    onComplete(result);
    setChecked(true);
  }

  return (
    <section className="quiz">
      <h1 className="sr-only" tabIndex={-1} ref={headingRef}>
        Quizzical – answer the {total} questions
      </h1>

      <form onSubmit={(e) => e.preventDefault()}>
        {questions.map((q) => (
          <Question
            key={q.id}
            data={q}
            selected={selections[q.id]}
            checked={checked}
            onSelect={handleSelect}
          />
        ))}
      </form>

      <div className="quiz__footer">
        <div role="status" className="result__status">
          {checked && (
            <>
              <p className="result__score">
                You scored {score}/{total} correct answers
              </p>
              {isNewBest && <p className="result__badge">🏆 New best score!</p>}
            </>
          )}
        </div>

        {!checked && showWarning && (
          <p className="warning" role="alert">
            Please answer all questions before checking.
          </p>
        )}

        <div className="quiz__actions">
          {!checked ? (
            <button type="button" className="btn" onClick={handleCheck}>
              Check answers
            </button>
          ) : (
            <>
              <button type="button" className="btn" onClick={onPlayAgain}>
                Play again
              </button>
              <button
                type="button"
                className="btn btn--secondary"
                onClick={onChangeSettings}
              >
                Change settings
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
