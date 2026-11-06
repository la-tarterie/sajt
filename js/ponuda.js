/* =====================================================================
   PONUDA — sve što se menja nalazi se ovde (ovaj fajl).
   Svaka opcija: id, naziv, opis, boja (za crtež), alergeni.
   Pravila: zahteva / iskljucuje = { korak: [id-jevi] }, '*' = bilo šta izabrano.
   Poruka: poruka (zajednička) ili porukaZahteva / porukaIskljucuje.
   ===================================================================== */
const ALERGENI = { gluten:"gluten", mleko:"mleko", jaja:"jaja", orasasti:"orašasti plodovi", soja:"soja" };

const ZELEI = ["malina","jagoda","sumsko"];

const KORACI = [
  { id:"velicina", naslov:"Veličina", pomoc:"Prečnik tarta i za koliko osoba je.", tip:"jedan", obavezno:true, opcije:[
    { id:"22", naziv:"22 cm", opis:"22 cm · 8–10 osoba" },
    { id:"28", naziv:"28 cm", opis:"28 cm · 14–16 osoba" },
  ]},
  { id:"podloga", naslov:"Podloga", pomoc:"Korpa na kojoj sve stoji.", tip:"jedan", obavezno:true, opcije:[
    { id:"prhko",  naziv:"Prhko testo",       opis:"Klasično, hrskavo kao keks", boja:"#d9a560", alergeni:["gluten","mleko","jaja"] },
    { id:"kakao",  naziv:"Kakao prhko testo", opis:"Prhko testo sa kakaom", boja:"#6e4632", alergeni:["gluten","mleko","jaja"] },
    { id:"plazma", naziv:"Plazma keks",       opis:"Mrvljena Plazma i puter", boja:"#c9965c", alergeni:["gluten","mleko"] },
    { id:"lotus",  naziv:"Lotus keks",        opis:"Karamelizovani keks sa cimetom", boja:"#a96a3b", alergeni:["gluten","soja"] },
    { id:"oreo",   naziv:"Oreo keks",         opis:"Mrvljeni Oreo i puter", boja:"#2f2a2e", alergeni:["gluten","mleko","soja"] },
  ]},
  { id:"srednji", naslov:"Srednji sloj", pomoc:"Tanak sloj želea ispod fila. Nije obavezan.", tip:"jedan", podrazumevano:"bez", opcije:[
    { id:"bez",    naziv:"Bez srednjeg sloja", opis:"Fil ide direktno na podlogu" },
    { id:"malina", naziv:"Žele od malina",        boja:"#c43a5a", iskljucuje:{ fil:["limun"] }, poruka:"Ne ide uz limun" },
    { id:"jagoda", naziv:"Žele od jagoda",        boja:"#d8445a", iskljucuje:{ fil:["limun"] }, poruka:"Ne ide uz limun" },
    { id:"sumsko", naziv:"Žele od šumskog voća",  boja:"#6b2a4e", iskljucuje:{ fil:["limun"] }, poruka:"Ne ide uz limun" },
  ]},
  { id:"fil", naslov:"Fil", pomoc:"Glavni ukus tarta.", tip:"jedan", obavezno:true, opcije:[
    { id:"mlecna",  naziv:"Mlečna čokolada",         opis:"Svilenkast, pun ukus čokolade", boja:"#7a4a35", alergeni:["mleko","soja"] },
    { id:"bela",    naziv:"Bela čokolada",           opis:"Blag i kremast", boja:"#f3e8d3", alergeni:["mleko","soja"] },
    { id:"pistac",  naziv:"Bela čokolada i pistać",  opis:"Bela čokolada sa kremom od pistaća", boja:"#a39d47", alergeni:["mleko","soja","orasasti"] },
    { id:"limun",   naziv:"Limun",                   opis:"Kiselkast i osvežavajući", boja:"#f1d457", alergeni:["mleko","jaja"],
      iskljucuje:{ srednji:ZELEI }, poruka:"Ne ide uz žele od voća" },
  ]},
  { id:"zavrsni", naslov:"Završni sloj", pomoc:"Ono što prekriva fil.", tip:"jedan", podrazumevano:"bez", opcije:[
    { id:"bez",     naziv:"Bez završnog sloja", opis:"Fil ostaje vidljiv" },
    { id:"glazura", naziv:"Glazura od pistaća", opis:"Tanak sjajni sloj", boja:"#8f9a3e", alergeni:["mleko","orasasti"],
      zahteva:{ fil:["pistac"] }, poruka:"Ide samo uz fil od pistaća" },
    { id:"mering",  naziv:"Mering", opis:"Mekan beze, zapečen plamenom", boja:"#f6e6c8", alergeni:["jaja"],
      zahteva:{ fil:["limun"] }, poruka:"Ide samo uz limun" },
  ]},
  { id:"voce", naslov:"Voće", pomoc:"Do tri vrste.", tip:"vise", max:3, opcije:[
    { id:"maline", naziv:"Maline",       boja:"#c4294f" },
    { id:"jagode", naziv:"Jagode",       boja:"#d8324a" },
    { id:"sumsko", naziv:"Šumsko voće",  opis:"Borovnice, kupine, maline", boja:"#3a2f5e" },
    { id:"limun",  naziv:"Limun",        opis:"Kriške i korica", boja:"#f1d457" },
  ]},
  { id:"ukrasi", naslov:"Ukrasi", pomoc:"Do četiri ukrasa.", tip:"vise", max:4, opcije:[
    { id:"masslag", naziv:"Mašnice od šlaga", boja:"#fbf7ee", alergeni:["mleko"] },
    { id:"masnice", naziv:"Mašnice od čokoladnog šlaga", boja:"#8c5c45", alergeni:["mleko"] },
    { id:"lesnici", naziv:"Pečeni lešnici", boja:"#b07a46", alergeni:["orasasti"] },
    { id:"pistaci", naziv:"Seckani pistaći", boja:"#8faa4a", alergeni:["orasasti"] },
    { id:"cvece",   naziv:"Jestivo cveće", opis:"Ljubičice i maćuhice", boja:"#7259c4" },
    { id:"karamel", naziv:"Karamel mreža", boja:"#c4873e", alergeni:["mleko"] },
    { id:"lotus",   naziv:"Lotus keks i mrvice", boja:"#b0743c", alergeni:["gluten","soja"] },
    { id:"oreo",    naziv:"Oreo keks i mrvice", boja:"#2f2a2e", alergeni:["gluten","soja"] },
  ]},
  { id:"natpis", naslov:"Natpis", pomoc:"Na pločici od bele čokolade. Nije obavezan.", tip:"tekst", max:30 },
];

/* slika: putanja do fotografije; null = prikazuje se crtež dok ne stigne fotografija */
const GOTOVI = [
  { id:"pistac", naziv:"Tart od pistaća", slika:"slike/tart-pistaci.jpg",
    opis:"Podloga od Plazme, fil od bele čokolade i pistaća, glazura, venčić od mašnica i jestivo cveće.",
    velicine:["22","28"],
    recept:{ velicina:"22", podloga:"plazma", srednji:"bez", fil:"pistac", zavrsni:"glazura", voce:[], ukrasi:["masslag","masnice","cvece"], natpis:"" } },
  { id:"cokoladni", naziv:"Čokoladni tart", slika:"slike/tart-cokoladni.jpg",
    opis:"Podloga od Plazme i svilenkast fil od mlečne čokolade, sa pečenim lešnicima i cvećem.",
    velicine:["22","28"],
    recept:{ velicina:"22", podloga:"plazma", srednji:"bez", fil:"mlecna", zavrsni:"bez", voce:[], ukrasi:["masslag","masnice","lesnici","cvece"], natpis:"" } },
  { id:"lotus", naziv:"Lotus tart", slika:"slike/tart-lotus.jpg",
    opis:"Podloga od Lotus keksa, fil od bele čokolade, karamel mreža i mrvice Lotusa.",
    velicine:["22","28"],
    recept:{ velicina:"22", podloga:"lotus", srednji:"bez", fil:"bela", zavrsni:"bez", voce:[], ukrasi:["karamel","lotus"], natpis:"" } },
  { id:"limun", naziv:"Limun tart", slika:null,
    opis:"Prhko testo, kiselkast fil od limuna i zapečen mering.",
    velicine:["22","28"],
    recept:{ velicina:"22", podloga:"prhko", srednji:"bez", fil:"limun", zavrsni:"mering", voce:[], ukrasi:[], natpis:"" } },
  { id:"oreo", naziv:"Oreo tart", slika:null,
    opis:"Podloga od Oreo keksa, fil od bele čokolade, šlag i Oreo keks.",
    velicine:["22","28"],
    recept:{ velicina:"22", podloga:"oreo", srednji:"bez", fil:"bela", zavrsni:"bez", voce:[], ukrasi:["masslag","oreo"], natpis:"" } },
  { id:"pistac-malina", naziv:"Pistać i malina", slika:null,
    opis:"Prhko testo, žele od malina, fil od bele čokolade i pistaća, sveže maline i seckani pistaći.",
    velicine:["22","28"],
    recept:{ velicina:"22", podloga:"prhko", srednji:"malina", fil:"pistac", zavrsni:"bez", voce:["maline"], ukrasi:["pistaci"], natpis:"" } },
];

/* Kod "Prilagodi" ovi koraci ostaju kao u originalu. */
const ZAKLJUCANO_KOD_PRILAGODI = ["podloga","srednji","fil","zavrsni"];

/* Primer sa kojim se otvara "Napravi svoj". */
const PRIMER_SVOJ = { velicina:"22", podloga:"prhko", srednji:"malina", fil:"bela", zavrsni:"bez", voce:["maline","jagode"], ukrasi:["masslag"], natpis:"" };

