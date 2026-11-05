/* =====================================================================
   PONUDA — sve što se menja nalazi se ovde (ovaj fajl).
   Svaka opcija: id, naziv, opis, boja (za crtež), alergeni.
   Pravila: zahteva / iskljucuje = { korak: [id-jevi] }, '*' = bilo šta izabrano.
   Poruka: poruka (zajednička) ili porukaZahteva / porukaIskljucuje.
   ===================================================================== */
const ALERGENI = { gluten:"gluten", mleko:"mleko", jaja:"jaja", orasasti:"orašasti plodovi" };

const KORACI = [
  { id:"velicina", naslov:"Veličina", pomoc:"Prečnik tarta i za koliko osoba je.", tip:"jedan", obavezno:true, opcije:[
    { id:"mini",      naziv:"Mini",      opis:"8 cm · 1 osoba" },
    { id:"mali",      naziv:"Mali",      opis:"14 cm · 2–4 osobe" },
    { id:"srednji",   naziv:"Srednji",   opis:"22 cm · 8–10 osoba" },
    { id:"veliki",    naziv:"Veliki",    opis:"26 cm · 12–14 osoba" },
    { id:"porodicni", naziv:"Porodični", opis:"30 cm · 16–18 osoba" },
  ]},
  { id:"podloga", naslov:"Podloga", pomoc:"Korpa na kojoj sve stoji.", tip:"jedan", obavezno:true, opcije:[
    { id:"prhko",    naziv:"Prhko testo",          opis:"Klasično, hrskavo kao keks", boja:"#d9a560", alergeni:["gluten","mleko","jaja"] },
    { id:"kakao",    naziv:"Kakao prhko testo",    opis:"Prhko testo sa kakaom", boja:"#6e4632", alergeni:["gluten","mleko","jaja"] },
    { id:"bademovo", naziv:"Bademovo prhko testo", opis:"Sa mlevenim bademom, mirisno", boja:"#d4aa6e", alergeni:["gluten","mleko","jaja","orasasti"] },
    { id:"keks",     naziv:"Podloga od keksa",     opis:"Mrvljeni keks i puter, ne peče se", boja:"#c9965c", alergeni:["gluten","mleko"] },
    { id:"lotus",    naziv:"Podloga od Lotus keksa", opis:"Karamelizovani keks sa cimetom", boja:"#a96a3b", alergeni:["gluten"] },
    { id:"bezglut",  naziv:"Bez glutena",          opis:"Bademovo brašno i puter", boja:"#dcb27c", alergeni:["mleko","jaja","orasasti"] },
  ]},
  { id:"srednji", naslov:"Srednji sloj", pomoc:"Tanak sloj između podloge i fila. Nije obavezan.", tip:"jedan", podrazumevano:"bez", opcije:[
    { id:"bez",      naziv:"Bez srednjeg sloja", opis:"Fil ide direktno na podlogu" },
    { id:"bademov",  naziv:"Bademov krem", opis:"Peče se u korpi, sočan i mekan", boja:"#e6c98c", alergeni:["orasasti","jaja","mleko"],
      iskljucuje:{ podloga:["keks","lotus"], velicina:["mini"] }, poruka:"Ne ide uz podlogu od keksa ni uz mini tart" },
    { id:"karamel",  naziv:"Slani karamel", opis:"Gust karamel sa malo soli", boja:"#c4813b", alergeni:["mleko"],
      iskljucuje:{ velicina:["mini"] }, poruka:"Mini tart je preplitak za srednji sloj" },
    { id:"malina",   naziv:"Žele od malina", opis:"Kiselkast voćni sloj", boja:"#c43a5a",
      iskljucuje:{ velicina:["mini"] }, poruka:"Mini tart je preplitak za srednji sloj" },
    { id:"krokant",  naziv:"Hrskavi lešnik", opis:"Krckav sloj od lešnika i čokolade", boja:"#93653a", alergeni:["orasasti","mleko"],
      iskljucuje:{ velicina:["mini"] }, poruka:"Mini tart je preplitak za srednji sloj" },
  ]},
  { id:"fil", naslov:"Fil", pomoc:"Glavni ukus tarta.", tip:"jedan", obavezno:true, opcije:[
    { id:"vanila",     naziv:"Vanila krem",          opis:"Gust poslastičarski krem", boja:"#f2df9e", alergeni:["mleko","jaja"] },
    { id:"vanilalak",  naziv:"Lagani vanila krem",   opis:"Vanila krem umešan sa šlagom", boja:"#f6ebc6", alergeni:["mleko","jaja"] },
    { id:"cokolada",   naziv:"Čokoladni krem",       opis:"Tamna čokolada i pavlaka, svilenkast", boja:"#5c3527", alergeni:["mleko"] },
    { id:"bela",       naziv:"Krem od bele čokolade", opis:"Blag i kremast", boja:"#f3e8d3", alergeni:["mleko"] },
    { id:"pistac",     naziv:"Krem od pistaća",      opis:"Pun ukus pečenog pistaća", boja:"#a39d47", alergeni:["mleko","orasasti"] },
    { id:"lesnik",     naziv:"Krem od lešnika",      opis:"Lešnik i mlečna čokolada", boja:"#a77a52", alergeni:["mleko","orasasti"] },
    { id:"limun",      naziv:"Limun krem",           opis:"Kiselkast i osvežavajući", boja:"#f1d457", alergeni:["mleko","jaja"] },
    { id:"marakuja",   naziv:"Krem od marakuje",     opis:"Tropski, kiselkasto sladak", boja:"#efb23b", alergeni:["mleko","jaja"] },
    { id:"mascarpone", naziv:"Mascarpone krem",      opis:"Lagan i blag", boja:"#f6f1e6", alergeni:["mleko"] },
    { id:"cizkejk",    naziv:"Čizkejk krem",         opis:"Krem sir, zapečen", boja:"#f1e5c8", alergeni:["mleko","jaja"] },
  ]},
  { id:"zavrsni", naslov:"Završni sloj", pomoc:"Ono što prekriva fil.", tip:"jedan", podrazumevano:"bez", opcije:[
    { id:"bez",      naziv:"Bez završnog sloja", opis:"Fil ostaje vidljiv" },
    { id:"sjaj",     naziv:"Voćni sjaj", opis:"Providan preliv koji čuva voće svežim", boja:"#f4d9b0",
      zahteva:{ voce:["*"] }, poruka:"Ide preko voća. Izaberi bar jedno voće." },
    { id:"cokglaz",  naziv:"Čokoladna glazura", opis:"Tanak sjajni sloj tamne čokolade", boja:"#3d2418", alergeni:["mleko"] },
    { id:"karamel",  naziv:"Karamel mreža", opis:"Tanke linije karamela preko fila", boja:"#c4873e", alergeni:["mleko"],
      iskljucuje:{ fil:["limun","marakuja"] }, poruka:"Ne slaže se sa kiselim filom" },
    { id:"beze",     naziv:"Zapečeni beze", opis:"Mekan beze, zapečen plamenom", boja:"#f6e6c8", alergeni:["jaja"],
      zahteva:{ fil:["limun","marakuja"] }, porukaZahteva:"Ide samo uz limun ili marakuju",
      iskljucuje:{ voce:["*"] }, porukaIskljucuje:"Beze prekriva ceo tart, pa ide bez voća" },
    { id:"slag",     naziv:"Šlag preko celog", opis:"Gladak sloj šlaga", boja:"#fbf7ee", alergeni:["mleko"] },
    { id:"secer",    naziv:"Šećer u prahu", opis:"Posip koji se ne topi", boja:"#ffffff" },
  ]},
  { id:"voce", naslov:"Voće", pomoc:"Do tri vrste. Smokve samo u sezoni.", tip:"vise", max:3, maxPoVelicini:{ mini:1 }, opcije:[
    { id:"jagode",   naziv:"Jagode",   boja:"#d8324a" },
    { id:"maline",   naziv:"Maline",   boja:"#c4294f" },
    { id:"borovnice",naziv:"Borovnice",boja:"#363a72" },
    { id:"kupine",   naziv:"Kupine",   boja:"#2b1e37" },
    { id:"smokve",   naziv:"Smokve",   opis:"Avgust–oktobar", boja:"#7a2f55" },
    { id:"kivi",     naziv:"Kivi",     boja:"#9fc14d" },
    { id:"mango",    naziv:"Mango",    boja:"#f2a93b" },
    { id:"kruska",   naziv:"Kruška",   boja:"#e6d39a" },
  ]},
  { id:"ukrasi", naslov:"Ukrasi", pomoc:"Do četiri ukrasa.", tip:"vise", max:4, maxPoVelicini:{ mini:2 }, opcije:[
    { id:"masslag",  naziv:"Mašnice od šlaga", boja:"#fbf7ee", alergeni:["mleko"] },
    { id:"masnice",  naziv:"Mašnice od čokoladnog krema", boja:"#8c5c45", alergeni:["mleko"] },
    { id:"cvece",    naziv:"Jestivo cveće", opis:"Ljubičice i maćuhice", boja:"#7259c4" },
    { id:"lesnici",  naziv:"Pečeni lešnici", boja:"#b07a46", alergeni:["orasasti"] },
    { id:"pistaci",  naziv:"Seckani pistaći", boja:"#8faa4a", alergeni:["orasasti"] },
    { id:"bademi",   naziv:"Bademovi listići", boja:"#e9d1a0", alergeni:["orasasti"] },
    { id:"lotusmrv", naziv:"Mrvice Lotus keksa", boja:"#b0743c", alergeni:["gluten"] },
    { id:"lotuskeks",naziv:"Ceo Lotus keks", boja:"#a8693a", alergeni:["gluten"] },
    { id:"coklist",  naziv:"Čokoladni listići", boja:"#4a2c1e", alergeni:["mleko"] },
    { id:"zlato",    naziv:"Zlatni listići", boja:"#d4af37" },
  ]},
  { id:"natpis", naslov:"Natpis", pomoc:"Na pločici od bele čokolade. Nije obavezan.", tip:"tekst", max:30 },
];

const GOTOVI = [
  { id:"pistac", naziv:"Tart od pistaća", slika:"slike/tart-pistaci.jpg",
    opis:"Podloga od keksa i gust krem od pistaća, sa venčićem od mašnica i jestivim cvećem.",
    velicine:["mali","srednji","veliki"],
    recept:{ velicina:"srednji", podloga:"keks", srednji:"bez", fil:"pistac", zavrsni:"bez", voce:[], ukrasi:["masslag","masnice","cvece"], natpis:"" } },
  { id:"cokoladni", naziv:"Čokoladni tart", slika:"slike/tart-cokoladni.jpg",
    opis:"Svilenkast krem od tamne čokolade na podlozi od keksa, sa pečenim lešnicima i cvećem.",
    velicine:["mali","srednji","veliki"],
    recept:{ velicina:"srednji", podloga:"keks", srednji:"bez", fil:"cokolada", zavrsni:"bez", voce:[], ukrasi:["masslag","masnice","lesnici","cvece"], natpis:"" } },
  { id:"lotus", naziv:"Lotus tart", slika:"slike/tart-lotus.jpg",
    opis:"Podloga od Lotus keksa, lagan mascarpone krem, karamel mreža i mrvice keksa.",
    velicine:["mali","srednji","veliki"],
    recept:{ velicina:"srednji", podloga:"lotus", srednji:"bez", fil:"mascarpone", zavrsni:"karamel", voce:[], ukrasi:["lotusmrv","lotuskeks"], natpis:"" } },
];

/* Kod "Prilagodi" ovi koraci ostaju kao u originalu. */
const ZAKLJUCANO_KOD_PRILAGODI = ["podloga","srednji","fil","zavrsni"];

/* Primer sa kojim se otvara "Napravi svoj". */
const PRIMER_SVOJ = { velicina:"srednji", podloga:"prhko", srednji:"bez", fil:"vanila", zavrsni:"sjaj", voce:["jagode","maline","borovnice"], ukrasi:["masslag"], natpis:"" };

