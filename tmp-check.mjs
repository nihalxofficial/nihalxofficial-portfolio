const html = await (await fetch("http://localhost:3000/")).text();
const markers = [
  ["hero section", /id="hero"/],
  ["portrait src", /md-nihal-uddin/],
  ["tagline script", /class="script absolute/],
  ["terminal card", /session/],
  ["typewriter caret", /animate-blink/],
  ["mobile dock", /aria-label="Sections"/],
  ["motion transform", /translate3d|translateY\(18px\)/],
];
for (const [name, re] of markers) console.log(name.padEnd(18), re.test(html) ? "yes" : "NO");
console.log("html length", html.length);
