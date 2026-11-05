# La Tarterie

Sajt za poručivanje tartova: gotovi tartovi, prilagođavanje postojećih i „Napravi svoj" sloj po sloj.

## Struktura

| Fajl | Šta je u njemu |
|---|---|
| `js/ponuda.js` | **Sve što se menja u ponudi**: veličine, podloge, filovi, završni slojevi, voće, ukrasi, pravila (šta ide sa čim) i gotovi tartovi |
| `js/app.js` | Logika sajta (crteži, korpa, porudžbina) |
| `css/stil.css` | Izgled |
| `slike/` | Logo i fotografije tartova |
| `index.html` | Stranica i skrivena forma za Netlify |
| `netlify.toml` | Podešavanja za Netlify |
| `netlify/edge-functions/ulaz.ts` | Ulaz sa lozinkom dok sajt nije javno otvoren |

## Kako se menja ponuda

U `js/ponuda.js` svaka opcija ima `id`, `naziv`, `opis`, `boja` (za crtež) i `alergeni`.
Pravila se pišu ovako:

```js
zahteva:    { fil: ["limun", "marakuja"] }   // dozvoljeno samo uz ove filove
iskljucuje: { voce: ["*"] }                  // nije dozvoljeno ako je izabrano bilo koje voće
poruka: "Objašnjenje koje kupac vidi"
```

Novi gotov tart: dodaj fotografiju u `slike/` i novi unos u `GOTOVI`.

## Porudžbine

Forma se šalje preko Netlify Forms. Porudžbine se vide u Netlify panelu (Forms → porudzbina),
a obaveštenje na mejl se uključuje u Site configuration → Notifications → Form submission notifications.

## Lozinka za ulaz

Dok sajt nije javno otvoren, ceo sajt je iza lozinke.

- Netlify → Project configuration → Environment variables → dodaj `SITE_PASSWORD` sa lozinkom, pa ponovo objavi sajt.
- Bez lozinke posetilac vidi samo stranicu „Uskoro otvaramo".
- Posle ispravne lozinke pregledač pamti ulaz 30 dana. Promena lozinke izbacuje sve.
- Za otvaranje sajta svima: obriši `SITE_PASSWORD` i ponovo objavi.

## Lokalno

Nema build koraka. Otvori folder sa bilo kojim statičkim serverom, npr. `npx serve .`
(slanje porudžbine radi samo na Netlify-u).
