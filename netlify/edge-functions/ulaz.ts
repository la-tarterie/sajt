// Ulaz sa lozinkom za ceo sajt, dok sajt nije javno otvoren.
// Lozinka je u Netlify → Project configuration → Environment variables kao SITE_PASSWORD.
// Ako SITE_PASSWORD nije podešen, sajt je otvoren za sve.
// Posle ispravne lozinke pregledač pamti ulaz 30 dana; promena lozinke izbacuje sve.

import type { Config, Context } from "https://edge.netlify.com";

const KOLACIC = "ulaz";
const TRAJANJE = 30 * 86_400; // sekundi

async function token(lozinka: string): Promise<string> {
  const data = new TextEncoder().encode(`la-tarterie-ulaz:${lozinka}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

function jednako(a: string, b: string): boolean {
  const x = new TextEncoder().encode(a), y = new TextEncoder().encode(b);
  let razlika = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) razlika |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return razlika === 0;
}

function bezbednaPutanja(p: string | null): string {
  return p && p.startsWith("/") && !p.startsWith("//") && !p.startsWith("/ulaz") ? p : "/";
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

function stranica(dalje: string, greska = ""): string {
  return `<!doctype html>
<html lang="sr-Latn">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>La Tarterie</title>
<link rel="icon" href="/slike/apple-touch-icon.png">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lora:wght@400;500&family=Mulish:wght@400;600;700&display=swap">
<style>
  :root{--paper:#fdf9f2;--surface:#fff;--ink:#24365f;--soft:#5f6b86;--blue:#3a68b8;--line:#ebe3d5;--warn:#a5452f}
  *{box-sizing:border-box}
  body{margin:0;min-height:100vh;display:grid;place-items:center;background:var(--paper);color:var(--ink);
    font-family:"Mulish","Segoe UI",system-ui,sans-serif;padding:24px max(16px,env(safe-area-inset-left,0px))}
  .karo{position:fixed;top:0;left:0;right:0;height:12px;
    background-image:linear-gradient(90deg,rgba(58,104,184,.38) 50%,transparent 50%),linear-gradient(0deg,rgba(58,104,184,.38) 50%,transparent 50%);
    background-size:12px 12px}
  main{width:100%;max-width:360px;display:grid;gap:18px;justify-items:center;text-align:center}
  img{width:170px;height:170px;border-radius:50%;box-shadow:0 8px 24px rgba(36,54,95,.08)}
  h1{font-family:"Lora",Georgia,serif;font-weight:500;font-size:1.5rem;margin:0}
  p{margin:0;color:var(--soft);line-height:1.5}
  form{width:100%;display:grid;gap:10px;text-align:left;background:var(--surface);padding:20px;border-radius:18px;
    box-shadow:0 1px 2px rgba(36,54,95,.06),0 8px 24px rgba(36,54,95,.07)}
  label{font-weight:700;font-size:.9rem}
  input{width:100%;font:inherit;font-size:16px;padding:11px 12px;border:1px solid var(--line);border-radius:10px;color:var(--ink)}
  input:focus{outline:2px solid var(--blue);outline-offset:1px}
  button{font:inherit;font-weight:700;border:0;border-radius:999px;padding:12px;background:var(--blue);color:#fff;cursor:pointer}
  .greska{color:var(--warn);font-size:.88rem}
</style>
</head>
<body>
<div class="karo" aria-hidden="true"></div>
<main>
  <img src="/slike/logo.jpg" alt="La Tarterie">
  <h1>Uskoro otvaramo</h1>
  <p>Sajt je još u pripremi. Ako imaš lozinku, upiši je ispod.</p>
  <form method="post" action="/ulaz">
    <input type="hidden" name="dalje" value="${esc(dalje)}">
    <label for="lozinka">Lozinka</label>
    <input id="lozinka" name="lozinka" type="password" autocomplete="current-password" autofocus required>
    ${greska ? `<p class="greska" role="alert">${esc(greska)}</p>` : ""}
    <button type="submit">Uđi</button>
  </form>
</main>
</body>
</html>`;
}

function html(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
}

export default async (request: Request, context: Context) => {
  const lozinka = Netlify.env.get("SITE_PASSWORD")?.trim();
  if (!lozinka) return context.next();

  const url = new URL(request.url);
  const ocekivano = await token(lozinka);

  if (url.pathname === "/ulaz") {
    if (request.method === "POST") {
      const podaci = await request.formData();
      const data = String(podaci.get("lozinka") ?? "").trim();
      const dalje = bezbednaPutanja(String(podaci.get("dalje") ?? "/"));
      if (!jednako(data, lozinka)) {
        await new Promise((r) => setTimeout(r, 600)); // usporava pogađanje
        return html(stranica(dalje, "Lozinka nije tačna."), 401);
      }
      const secure = url.protocol === "https:" ? "; Secure" : "";
      return new Response(null, {
        status: 303,
        headers: {
          location: dalje,
          "set-cookie": `${KOLACIC}=${ocekivano}; Path=/; Max-Age=${TRAJANJE}; HttpOnly; SameSite=Lax${secure}`,
          "cache-control": "no-store",
        },
      });
    }
    return html(stranica(bezbednaPutanja(url.searchParams.get("dalje"))));
  }

  if (context.cookies.get(KOLACIC) === ocekivano) return context.next();

  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Sajt je zaključan lozinkom.", { status: 401 });
  }
  const dalje = url.pathname === "/" ? "" : `?dalje=${encodeURIComponent(url.pathname + url.search)}`;
  return new Response(null, { status: 302, headers: { location: `/ulaz${dalje}`, "cache-control": "no-store" } });
};

export const config: Config = {
  path: "/*",
  excludedPath: ["/slike/logo.jpg", "/slike/apple-touch-icon.png"],
};
