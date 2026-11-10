import { buildUrl, formatQuestions } from "./quiz";

const MESSAGES = {
  1: "There aren't enough questions for these settings. Try another category or difficulty, or fewer questions.",
  2: "The selected settings were not valid. Please change them and try again.",
  5: "Too many requests. Please wait a few seconds and try again.",
};

export async function fetchQuestions(settings) {
  const response = await fetch(buildUrl(settings));

  if (response.status === 429) throw new Error(MESSAGES[5]);
  if (!response.ok) {
    throw new Error(`Request failed (status ${response.status}).`);
  }

  const data = await response.json();
  if (data.response_code !== 0) {
    throw new Error(
      MESSAGES[data.response_code] ??
        "The trivia service could not provide questions. Please try again.",
    );
  }

  return formatQuestions(data.results);
}
