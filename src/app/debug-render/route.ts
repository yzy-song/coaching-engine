const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Render Probe</title>
<style>
  html, body { margin: 0; }
  section { margin: 14px; padding: 18px; border: 2px solid #222; font: 16px/1.5 sans-serif; }
  .dark { color-scheme: dark; background-color: oklch(0.155 0.004 240); color: oklch(0.945 0.012 85); border-color: #fff; }
  .grad {
    background-color: oklch(0.155 0.004 240);
    background-image:
      radial-gradient(60rem 30rem at 85% -5%, oklch(0.7 0.13 50 / 10%), transparent 65%),
      radial-gradient(50rem 28rem at -15% 15%, oklch(0.63 0.11 45 / 7%), transparent 60%),
      radial-gradient(44rem 26rem at 110% 105%, oklch(0.79 0.12 80 / 6%), transparent 60%);
    color: oklch(0.945 0.012 85); border-color: #fff;
  }
  .anim { animation: fade 1s ease-out both; }
  @keyframes fade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
  .blur { backdrop-filter: blur(8px); background-color: oklch(0.2 0.004 240 / 80%); color: oklch(0.945 0.012 85); border-color: #fff; }
  @property --conic-angle { syntax: "<angle>"; inherits: false; initial-value: 0deg; }
  .conic {
    background: conic-gradient(from var(--conic-angle), oklch(0.7 0.13 50), oklch(0.155 0.004 240));
    color: #fff; border-color: #fff;
    animation: spin 5s linear infinite;
  }
  @keyframes spin { to { --conic-angle: 360deg; } }
</style>
</head>
<body>
  <section id="s1">S1 plain light — inline styles only, no CSS features</section>
  <section id="s2" class="dark">S2 dark + oklch colors + color-scheme dark</section>
  <section id="s3" class="grad">S3 dark + three radial-gradient background layers</section>
  <section id="s4" class="dark anim">S4 dark + CSS entrance animation (opacity/transform)</section>
  <section id="s5" class="dark blur">S5 dark + backdrop-filter blur</section>
  <section id="s6" class="conic">S6 @property + conic-gradient spin animation</section>
</body>
</html>`;

export function GET() {
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
