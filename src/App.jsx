import { useState } from "react";
import Blobs from "./components/Blobs";
import StartScreen from "./components/StartScreen";
import Quiz from "./components/Quiz";
import ThemeToggle from "./components/ThemeToggle";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useTheme } from "./hooks/useTheme";
import { fetchQuestions } from "./utils/api";
import { DEFAULT_SETTINGS } from "./utils/options";
import { isBetterScore } from "./utils/quiz";

export default function App() {
  const [status, setStatus] = useState("start"); // start | loading | quiz | error
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState("");

  const [storedSettings, setSettings] = useLocalStorage(
    "quizzical-settings",
    DEFAULT_SETTINGS,
  );
  const [bestScore, setBestScore] = useLocalStorage("quizzical-best", null);
  const { theme, toggleTheme } = useTheme();

  // Merge with defaults so old/partial saved data can never break the form
  const settings = { ...DEFAULT_SETTINGS, ...storedSettings };

  // Called from click handlers (not useEffect) so StrictMode never double-fetches.
  async function startQuiz() {
    setStatus("loading");
    setError("");

    try {
      setQuestions(await fetchQuestions(settings));
      setStatus("quiz");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  function handleComplete(result) {
    setBestScore((prev) => (isBetterScore(result, prev) ? result : prev));
  }

  return (
    <div className="app">
      <Blobs />

      <header className="topbar">
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </header>

      <main className="content">
        {status === "start" && (
          <StartScreen
            settings={settings}
            bestScore={bestScore}
            onChangeSettings={setSettings}
            onStart={startQuiz}
          />
        )}

        {status === "loading" && (
          <p className="message" role="status">
            Loading questions…
          </p>
        )}

        {status === "error" && (
          <div className="message-box">
            <p className="message" role="alert">
              {error}
            </p>
            <div className="quiz__actions">
              <button type="button" className="btn" onClick={startQuiz}>
                Try again
              </button>
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => setStatus("start")}
              >
                Change settings
              </button>
            </div>
          </div>
        )}

        {status === "quiz" && (
          <Quiz
            questions={questions}
            bestScore={bestScore}
            onComplete={handleComplete}
            onPlayAgain={startQuiz}
            onChangeSettings={() => setStatus("start")}
          />
        )}
      </main>
    </div>
  );
}
