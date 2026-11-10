export default function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className="btn btn--secondary btn--small theme-toggle"
      onClick={onToggle}
    >
      {/* \uFE0E forces the plain text glyph instead of a coloured emoji */}
      <span aria-hidden="true">
        {isDark ? "\u2600\uFE0E" : "\u263E\uFE0E"}
      </span>{" "}
      {isDark ? "Light mode" : "Dark mode"}
    </button>
  );
}
