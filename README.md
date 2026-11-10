# Quizzical

A trivia quiz that pulls questions from the Open Trivia Database, shuffles the answers and scores you when you check them. Pick one answer per question, then see what you got right and wrong.

---

## Built with

- React (hooks)
- Vite
- Open Trivia Database API
- `html-entities`
- CSS custom properties (rem units, light and dark themes)
- Vitest, React Testing Library and `jest-axe`
- Netlify

---

## Features

- **Live questions:** fetches multiple-choice questions from the Open Trivia Database when you press Start
- **Quiz settings:** choose the category, difficulty and number of questions on the start screen
- **Shuffled answers:** each question gets a new answers array with the correct answer shuffled in among the incorrect ones (Fisher–Yates)
- **One answer per question:** answers are radio inputs in a `fieldset`, styled as buttons, so only one can be selected and arrow-key navigation works natively
- **Check answers:** the score is calculated from state only after you check, and a warning appears if any question is unanswered
- **Results you can read without colour:** correct and incorrect answers get ✓ and ✕ icons, wrong picks are struck through and screen readers hear "Your answer, correct"
- **Loading and error states:** a status state machine (`start`, `loading`, `quiz`, `error`) handles network failures, empty results and the API rate limit (HTTP 429)
- **Best score:** your highest score is saved in `localStorage`
- **Dark mode:** follows your OS setting by default, can be toggled by hand and the choice is remembered
- **Accessible by default:** built to WCAG 2.2 AAA, with 7:1 text contrast, 2.75rem minimum target sizes, visible 3px focus outlines, `role="alert"` warnings and motion gated by `prefers-reduced-motion`
- **Responsive:** sized in rem so it scales with the user's font size settings
- **Tested:** unit and component tests, plus automated accessibility checks with `jest-axe`

## What I learned

- Fetching data in an event handler instead of `useEffect` to avoid StrictMode double requests and API rate limits
- Modelling screens as a status state machine instead of several booleans
- Handling HTTP errors, rate limits and API response codes, not just the happy path
- Decoding HTML entities safely, and why passing `decode` straight into `map` breaks (the index becomes an options argument)
- Shuffling an array immutably and building a new answers array per question
- Storing selections as an object keyed by question id and deriving the score from state
- Building accessible radio groups with `fieldset`, `legend` and styled `label`s
- Making results understandable without colour alone, using icons, strikethrough and screen-reader text
- Choosing colours for AAA contrast and adjusting a mockup that didn't meet it
- Writing a custom `useLocalStorage` hook and theming with CSS custom properties
- Choosing between `aria-pressed` and a changing button label for toggles, and never using both
- Debugging a Vite dependency issue where a CommonJS package (`he`) had no default export
- Testing with Vitest and React Testing Library, and running accessibility checks with `jest-axe`
- Setting up a Git repo, fixing a `master`/`main` mismatch and pushing to GitHub

## Deployment notes

This is a static front-end app with no server or database, so deployment is simple:

- **Static hosting:** `npm run build` outputs a `dist/` folder, which any static host can serve
- **Third-party API:** questions come from the Open Trivia Database, which allows one request per 5 seconds per IP, so rapid restarts can return a rate-limit error
- **No accounts or backend:** the only saved data is your best score and theme, stored in your browser's `localStorage`
- **Single player:** all quiz state lives in each visitor's browser, so players never affect each other

  
---

# Live Demo

[Link](https://gkquizzical.netlify.app/)
