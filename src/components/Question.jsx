export default function Question({ data, selected, checked, onSelect }) {
  const { id, question, answers, correct } = data;

  return (
    <fieldset className="question">
      <legend className="question__title">{question}</legend>

      <div className="answers">
        {answers.map((answer, index) => {
          const inputId = `q${id}-a${index}`;
          const isSelected = selected === answer;
          const isCorrect = answer === correct;

          let className = "answer__label";
          let statusIcon = null;
          let statusText = null;

          if (checked) {
            if (isCorrect) {
              className += " answer__label--correct";
              statusIcon = "✓";
              statusText = isSelected
                ? "Your answer, correct"
                : "Correct answer";
            } else if (isSelected) {
              className += " answer__label--incorrect";
              statusIcon = "✕";
              statusText = "Your answer, incorrect";
            }
          } else if (isSelected) {
            className += " answer__label--selected";
          }

          return (
            <div className="answer" key={inputId}>
              <input
                type="radio"
                id={inputId}
                name={`question-${id}`}
                value={answer}
                checked={isSelected}
                disabled={checked}
                onChange={() => onSelect(id, answer)}
                className="answer__input"
              />
              <label htmlFor={inputId} className={className}>
                {statusIcon && (
                  <span className="answer__icon" aria-hidden="true">
                    {statusIcon}
                  </span>
                )}
                {answer}
                {statusText && <span className="sr-only"> ({statusText})</span>}
              </label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
