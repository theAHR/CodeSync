export const DEFAULT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CodeSync Demo</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <h1>Hello, CodeSync!</h1>
  <p>Edit these files — everyone in the room sees changes instantly.</p>
  <script src="script.js"></script>
</body>
</html>`;

export const DEFAULT_CSS = `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, sans-serif;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  gap: 1rem;
}

h1 {
  font-size: 3rem;
  animation: pulse 2s ease-in-out infinite;
}

p {
  opacity: 0.85;
  font-size: 1.1rem;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}`;

export const DEFAULT_JS = `console.log('CodeSync is live!');

document.querySelector('h1')?.addEventListener('click', () => {
  console.log('Clicked heading!');
});`;

export const DEFAULT_FILES: Record<string, string> = {
  "index.html": DEFAULT_HTML,
  "styles.css": DEFAULT_CSS,
  "script.js": DEFAULT_JS,
};

export const DEFAULT_ACTIVE_FILE = "index.html";

export const USER_COLORS = [
  "#f87171",
  "#fb923c",
  "#fbbf24",
  "#a3e635",
  "#34d399",
  "#22d3ee",
  "#60a5fa",
  "#a78bfa",
  "#f472b6",
  "#e879f9",
];

export const ADJECTIVES = [
  "Swift",
  "Calm",
  "Bold",
  "Bright",
  "Clever",
  "Cosmic",
  "Daring",
  "Eager",
  "Fuzzy",
  "Happy",
  "Jolly",
  "Keen",
  "Lucky",
  "Merry",
  "Noble",
  "Quick",
  "Radiant",
  "Silent",
  "Vivid",
  "Wild",
];

export const ANIMALS = [
  "Fox",
  "Owl",
  "Bear",
  "Wolf",
  "Hawk",
  "Lynx",
  "Panda",
  "Tiger",
  "Eagle",
  "Falcon",
  "Otter",
  "Raven",
  "Whale",
  "Koala",
  "Badger",
  "Heron",
  "Cobra",
  "Gecko",
  "Moose",
  "Finch",
];

export const IDENTITY_STORAGE_KEY = "codesync-identity";

export function getLanguageForFile(filename: string): string {
  if (filename.endsWith(".html")) return "html";
  if (filename.endsWith(".css")) return "css";
  if (filename.endsWith(".js") || filename.endsWith(".mjs")) return "javascript";
  if (filename.endsWith(".ts")) return "typescript";
  if (filename.endsWith(".tsx")) return "typescript";
  if (filename.endsWith(".json")) return "json";
  return "plaintext";
}
