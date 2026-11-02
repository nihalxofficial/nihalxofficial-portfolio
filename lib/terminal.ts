/**
 * Terminal / shell highlighter.
 *
 * The code and terminal windows share the theme's `.tk-*` syntax palette. These
 * helpers read a shell line the way an editor would and give each run the right
 * colour: the command verb, well-known tools and technologies, ALL-CAPS
 * acronyms, quoted strings, numbers, flags and paths all get their own hue,
 * while ordinary words stay muted. That contrast is what makes a console line
 * read as highlighted instead of one flat colour — and it stays legible in the
 * light theme, where the earlier single-colour approach was invisible.
 */

export type TermToken = { text: string; cls?: string };

/** Things that render as a "type" (cyan): frameworks, runtimes, protocols. */
const TOOLS = new Set([
  "react", "next", "next.js", "nextjs", "node", "node.js", "nodejs", "express",
  "mongodb", "mongoose", "postgres", "postgresql", "prisma", "tailwind",
  "tailwindcss", "heroui", "typescript", "javascript", "html", "css", "sass",
  "socket.io", "go", "golang", "rust", "redis", "docker", "kubernetes", "git",
  "github", "gitlab", "linux", "bash", "zsh", "python", "django", "flask",
  "fastapi", "api", "rest", "graphql", "grpc", "mern", "ai", "ml", "llm",
  "vercel", "netlify", "firebase", "supabase", "aws", "gcp", "azure", "jwt",
  "oauth", "json", "yaml", "toml", "vite", "webpack", "babel", "jest",
  "framer", "framer-motion", "mongodb atlas",
]);

/** Things that render as a "keyword" (blue): shell verbs and code keywords. */
const KEYWORDS = new Set([
  "whoami", "cd", "ls", "pwd", "cat", "echo", "grep", "find", "touch", "mkdir",
  "npm", "npx", "pnpm", "yarn", "run", "dev", "build", "start", "deploy",
  "install", "add", "remove", "create", "delete", "update", "learn", "make",
  "ping", "ssh", "curl", "wget", "git", "commit", "push", "pull", "merge",
  "docker", "export", "import", "const", "let", "var", "function", "return",
  "if", "else", "for", "while", "await", "async", "def", "class", "sudo", "apt",
]);

/** Colour for a bare word (may be undefined → muted, inheriting the line). */
function classify(word: string): string | undefined {
  const bare = word.replace(/[.,;:!?)\]}]+$/, "");
  if (!bare) return undefined;
  const lower = bare.toLowerCase();

  if (/^https?:\/\//i.test(word) || /^\.{1,2}\/[\w.-]/.test(word)) return "tk-str"; // url / path
  if (/^\d[\d.,_]*%?$/.test(bare)) return "tk-num"; // number / percentage
  if (/^[A-Z][A-Z0-9]{1,}$/.test(bare)) return "tk-type"; // acronym (MERN, AI, REST)
  if (TOOLS.has(lower)) return "tk-type"; // known tool / technology
  if (KEYWORDS.has(lower)) return "tk-key"; // shell verb / code keyword
  if (/^[A-Z]/.test(bare)) return "tk-key"; // capitalised proper noun
  return undefined; // ordinary word — muted
}

/**
 * Split a line into syntax-coloured runs. Whitespace and lone punctuation keep
 * their own spans so spacing is preserved verbatim.
 */
function scan(line: string): TermToken[] {
  if (!line) return [];
  if (/^\s*#/.test(line)) return [{ text: line, cls: "tk-com" }]; // full comment

  const tokens: TermToken[] = [];
  let i = 0;

  while (i < line.length) {
    const rest = line.slice(i);
    let match = rest.match(/^\s+/);
    if (match) {
      tokens.push({ text: match[0] });
      i += match[0].length;
      continue;
    }

    match = rest.match(/^"[^"]*"|^'[^']*'/); // quoted run
    if (match) {
      tokens.push({ text: match[0], cls: "tk-str" });
      i += match[0].length;
      continue;
    }

    match = rest.match(/-{1,2}[A-Za-z][\w-]*/); // --flag / -f
    if (match && match.index === 0) {
      tokens.push({ text: match[0], cls: "tk-prop" });
      i += match[0].length;
      continue;
    }

    match = rest.match(/[A-Za-z0-9_.@+/][\w.+\-/]*/); // a word-ish run
    if (match && match.index === 0) {
      tokens.push({ text: match[0], cls: classify(match[0]) });
      i += match[0].length;
      continue;
    }

    // Anything else (punctuation, arrows, brackets) is one character at a time.
    tokens.push({ text: rest[0], cls: "tk-punc" });
    i += 1;
  }

  return tokens;
}

/**
 * A shell command: the first token is the verb (or a script path), the rest is
 * scanned for flags, arguments and quoted values.
 */
export function tokenizeCommand(line: string): TermToken[] {
  const trimmed = line.trim();
  if (!trimmed) return [];

  const parts = trimmed.split(/\s+/);
  const head = parts[0];
  const tokens: TermToken[] = [
    { text: head, cls: /^\.{1,2}\/|^\/[\w.-]/.test(head) ? "tk-prop" : "tk-key" },
  ];

  if (parts.length > 1) {
    tokens.push({ text: " " });
    tokens.push(...scan(parts.slice(1).join(" ")));
  }

  return tokens;
}

/** Command output / a plain console line, highlighted keyword by keyword. */
export function tokenizeOutput(line: string): TermToken[] {
  return scan(line);
}
