import { AMOUNTS, CATEGORIES, DIFFICULTIES } from "../utils/options";

export default function StartScreen({
  settings,
  bestScore,
  onChangeSettings,
  onStart,
}) {
  function handleChange(event) {
    const { name, value } = event.target;
    onChangeSettings({ ...settings, [name]: value });
  }

  function handleSubmit(event) {
    event.preventDefault();
    onStart();
  }

  return (
    <section className="start">
      <h1 className="start__title">Quizzical</h1>
      <p className="start__description">
        Test your general knowledge with random trivia questions.
      </p>

      {bestScore && (
        <p className="best">
          Best score:{" "}
          <strong>
            {bestScore.score}/{bestScore.total}
          </strong>
        </p>
      )}

      <form className="settings" onSubmit={handleSubmit}>
        <fieldset className="settings__fieldset">
          <legend className="sr-only">Quiz settings</legend>

          <div className="field">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={settings.category}
              onChange={handleChange}
            >
              <option value="">Any category</option>
              {CATEGORIES.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="difficulty">Difficulty</label>
            <select
              id="difficulty"
              name="difficulty"
              value={settings.difficulty}
              onChange={handleChange}
            >
              <option value="">Any difficulty</option>
              {DIFFICULTIES.map((difficulty) => (
                <option key={difficulty.value} value={difficulty.value}>
                  {difficulty.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="amount">Number of questions</label>
            <select
              id="amount"
              name="amount"
              value={settings.amount}
              onChange={handleChange}
            >
              {AMOUNTS.map((amount) => (
                <option key={amount} value={amount}>
                  {amount}
                </option>
              ))}
            </select>
          </div>
        </fieldset>

        <button type="submit" className="btn btn--large start__submit">
          Start quiz
        </button>
      </form>
    </section>
  );
}
