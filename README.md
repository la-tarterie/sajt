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

## Lokalno

Nema build koraka. Otvori folder sa bilo kojim statičkim serverom, npr. `npx serve .`
(slanje porudžbine radi samo na Netlify-u).
