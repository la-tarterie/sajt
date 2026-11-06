/* Logika sajta. Ponuda (opcije, pravila, gotovi tartovi) je u ponuda.js. */


const K = Object.fromEntries(KORACI.map(k=>[k.id,k]));
const opc = (kid,id)=> K[kid]?.opcije?.find(o=>o.id===id);
const esc = s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const kopija = o=>JSON.parse(JSON.stringify(o));
function prazanIzbor(){ return { velicina:null, podloga:null, srednji:"bez", fil:null, zavrsni:"bez", voce:[], ukrasi:[], natpis:"" }; }

/* ---------- pravila ---------- */
function odgovara(pravilo, iz){
  return Object.entries(pravilo).some(([kid,vals])=>{
    const v = iz[kid];
    if(Array.isArray(v)) return vals.includes("*") ? v.length>0 : v.some(x=>vals.includes(x));
    return vals.includes("*") ? !!v : vals.includes(v);
  });
}
function svaZadovoljena(pravilo, iz){
  return Object.entries(pravilo).every(([kid,vals])=>odgovara({[kid]:vals},iz));
}
function razlog(kid, o, iz){
  if(o.zahteva && !svaZadovoljena(o.zahteva,iz)) return o.porukaZahteva || o.poruka || "Ne ide uz trenutni izbor";
  if(o.iskljucuje && odgovara(o.iskljucuje,iz)) return o.porukaIskljucuje || o.poruka || "Ne ide uz trenutni izbor";
  return null;
}
function maxZa(k, iz){ return (k.maxPoVelicini && k.maxPoVelicini[iz.velicina]) || k.max || 99; }

/* posle svake promene: skini ono što više ne važi i javi šta je skinuto */
function uskladi(iz){
  const skinuto=[];
  for(let krug=0;krug<3;krug++){
    for(const k of KORACI){
      if(k.tip==="jedan" && iz[k.id]){
        const o=opc(k.id,iz[k.id]);
        if(o && razlog(k.id,o,iz)){ skinuto.push(o.naziv); iz[k.id]=k.podrazumevano ?? null; }
      }
      if(k.tip==="vise"){
        const pre=iz[k.id];
        iz[k.id]=pre.filter(id=>!razlog(k.id,opc(k.id,id),iz));
        const m=maxZa(k,iz);
        if(iz[k.id].length>m){ iz[k.id].slice(m).forEach(id=>skinuto.push(opc(k.id,id).naziv)); iz[k.id]=iz[k.id].slice(0,m); }
        pre.filter(id=>!iz[k.id].includes(id) && !skinuto.includes(opc(k.id,id).naziv)).forEach(id=>skinuto.push(opc(k.id,id).naziv));
      }
    }
  }
  return [...new Set(skinuto)];
}
function nedostaje(iz){ return KORACI.filter(k=>k.obavezno && !iz[k.id]).map(k=>k.naslov.toLowerCase()); }
function alergeniZa(iz){
  const s=new Set();
  for(const k of KORACI){
    const ids = k.tip==="jedan" ? [iz[k.id]] : k.tip==="vise" ? iz[k.id] : [];
    ids.forEach(id=>{ const o=opc(k.id,id); (o?.alergeni||[]).forEach(a=>s.add(a)); });
  }
  if(iz.natpis) s.add("mleko");
  return [...s].map(a=>ALERGENI[a]);
}

/* ---------- crteži ---------- */
function rng(seed){ let h=2166136261>>>0; for(const c of seed){ h=Math.imul(h^c.charCodeAt(0),16777619)>>>0; } return ()=>{ h^=h<<13; h>>>=0; h^=h>>>17; h^=h<<5; h>>>=0; return (h%100000)/100000; }; }
function nijansa(hex, amt){ const n=parseInt(hex.slice(1),16); let r=n>>16,g=n>>8&255,b=n&255; const f=v=>Math.max(0,Math.min(255,Math.round(amt<0? v*(1+amt) : v+(255-v)*amt))); return "#"+[f(r),f(g),f(b)].map(x=>x.toString(16).padStart(2,"0")).join(""); }
function rozeta(x,y,r,boja){
  let p=""; const n=8;
  for(let i=0;i<n*2;i++){ const a=i*Math.PI/n, rr=i%2? r*.55 : r; p+=(i?"L":"M")+(x+rr*Math.cos(a)).toFixed(1)+" "+(y+rr*Math.sin(a)).toFixed(1); }
  return `<path d="${p}Z" fill="${boja}" stroke="${nijansa(boja,-.18)}" stroke-width=".6"/><circle cx="${x}" cy="${y}" r="${(r*.28).toFixed(1)}" fill="${nijansa(boja,-.12)}"/>`;
}
function cvet(x,y,s,boje){
  const [a,b]=boje; let g="";
  [[0,-1],[.95,-.31],[.59,.81],[-.59,.81],[-.95,-.31]].forEach(([dx,dy],i)=>{ g+=`<ellipse cx="${(x+dx*s*.55).toFixed(1)}" cy="${(y+dy*s*.55).toFixed(1)}" rx="${(s*.5).toFixed(1)}" ry="${(s*.42).toFixed(1)}" fill="${i<2?a:b}" transform="rotate(${i*72} ${(x+dx*s*.55).toFixed(1)} ${(y+dy*s*.55).toFixed(1)})"/>`; });
  return g+`<circle cx="${x}" cy="${y}" r="${(s*.22).toFixed(1)}" fill="#f4cf3e"/><circle cx="${x}" cy="${y}" r="${(s*.1).toFixed(1)}" fill="#3b2a6e"/>`;
}
function vocka(t,x,y,s,r){
  const X=x.toFixed(1),Y=y.toFixed(1);
  switch(t){
    case "jagode": return `<ellipse cx="${X}" cy="${Y}" rx="${s*.85}" ry="${s}" fill="#d8324a" transform="rotate(${r*360} ${X} ${Y})"/><ellipse cx="${X}" cy="${Y}" rx="${s*.45}" ry="${s*.6}" fill="#f07b88" transform="rotate(${r*360} ${X} ${Y})"/>`;
    case "maline": { let g=`<circle cx="${X}" cy="${Y}" r="${s*.85}" fill="#c4294f"/>`; for(let i=0;i<6;i++){const a=i*Math.PI/3; g+=`<circle cx="${(x+Math.cos(a)*s*.5).toFixed(1)}" cy="${(y+Math.sin(a)*s*.5).toFixed(1)}" r="${s*.3}" fill="#dc4a6e"/>`;} return g+`<circle cx="${X}" cy="${Y}" r="${s*.22}" fill="#8f1c3a"/>`; }
    case "borovnice": return `<circle cx="${X}" cy="${Y}" r="${s*.68}" fill="#363a72"/><circle cx="${X}" cy="${Y}" r="${s*.18}" fill="#7c80b8"/><circle cx="${(x-s*.25).toFixed(1)}" cy="${(y-s*.28).toFixed(1)}" r="${s*.12}" fill="#9aa0d6" opacity=".7"/>`;
    case "kupine": { let g=`<circle cx="${X}" cy="${Y}" r="${s*.85}" fill="#2b1e37"/>`; for(let i=0;i<7;i++){const a=i*Math.PI*2/7; g+=`<circle cx="${(x+Math.cos(a)*s*.48).toFixed(1)}" cy="${(y+Math.sin(a)*s*.48).toFixed(1)}" r="${s*.28}" fill="#47335a"/>`;} return g; }
    case "smokve": return `<circle cx="${X}" cy="${Y}" r="${s}" fill="#6e2a4e"/><circle cx="${X}" cy="${Y}" r="${s*.74}" fill="#f2e2c0"/><circle cx="${X}" cy="${Y}" r="${s*.56}" fill="#d4566c"/>`;
    case "kivi": { let g=`<circle cx="${X}" cy="${Y}" r="${s}" fill="#7a6036"/><circle cx="${X}" cy="${Y}" r="${s*.9}" fill="#9fc14d"/><circle cx="${X}" cy="${Y}" r="${s*.32}" fill="#eef2c8"/>`; for(let i=0;i<9;i++){const a=i*Math.PI*2/9; g+=`<circle cx="${(x+Math.cos(a)*s*.45).toFixed(1)}" cy="${(y+Math.sin(a)*s*.45).toFixed(1)}" r="${s*.07}" fill="#1e1a12"/>`;} return g; }
    case "mango": return `<rect x="${(x-s*.75).toFixed(1)}" y="${(y-s*.75).toFixed(1)}" width="${s*1.5}" height="${s*1.5}" rx="${s*.35}" fill="#f2a93b" stroke="#d98a22" stroke-width=".6" transform="rotate(${r*90} ${X} ${Y})"/>`;
    case "sumsko": return vocka(r<.34?"borovnice":r<.67?"kupine":"maline",x,y,s,r);
    case "limun": { let g=`<circle cx="${X}" cy="${Y}" r="${s}" fill="#e8c02a"/><circle cx="${X}" cy="${Y}" r="${s*.86}" fill="#fbf0b0"/><circle cx="${X}" cy="${Y}" r="${s*.78}" fill="#f4dc5c"/>`; for(let i=0;i<8;i++){const a=i*Math.PI/4; g+=`<line x1="${X}" y1="${Y}" x2="${(x+Math.cos(a)*s*.78).toFixed(1)}" y2="${(y+Math.sin(a)*s*.78).toFixed(1)}" stroke="#fbf0b0" stroke-width=".9"/>`;} return g; }
    case "kruska": return `<ellipse cx="${X}" cy="${Y}" rx="${s*.55}" ry="${s*1.05}" fill="#ecdca6" stroke="#cdb46a" stroke-width=".8" transform="rotate(${r*180} ${X} ${Y})"/>`;
  }
  return "";
}
function crtezOdozgo(iz, idPref="t"){
  const R=rng(JSON.stringify(iz)+idPref);
  const pod=opc("podloga",iz.podloga), fil=opc("fil",iz.fil), zav=iz.zavrsni;
  const P=pod?.boja || "#e9dfcc", F=fil?.boja || "#f1ebe0";
  const imaMasnice = iz.ukrasi.some(u=>["masslag","masnice"].includes(u));
  let povrs = F;
  if(zav==="glazura") povrs=nijansa(F,-.1);
  if(zav==="slag") povrs="#fbf7ee";
  if(zav==="mering") povrs="#f4e3c4";
  const clip=`${idPref}-clip`;
  let s=`<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><clipPath id="${clip}"><circle cx="100" cy="100" r="77"/></clipPath></defs>`;
  s+=`<ellipse cx="100" cy="104" rx="95" ry="92" fill="rgba(30,40,70,.10)"/>`;
  for(let i=0;i<44;i++){ const a=i/44*Math.PI*2; s+=`<circle cx="${(100+89*Math.cos(a)).toFixed(1)}" cy="${(100+89*Math.sin(a)).toFixed(1)}" r="6.5" fill="${P}"/>`; }
  s+=`<circle cx="100" cy="100" r="89" fill="${P}"/>`;
  s+=`<circle cx="100" cy="100" r="80" fill="${nijansa(P,-.16)}"/>`;
  s+=`<circle cx="100" cy="100" r="77" fill="${povrs}"/>`;
  if(!fil){ s+=`<circle cx="100" cy="100" r="60" fill="none" stroke="#cdbfa6" stroke-width="1.2" stroke-dasharray="4 5"/>`; }
  s+=`<g clip-path="url(#${clip})">`;
  if(zav==="secer"){ for(let i=0;i<220;i++){ const a=R()*6.283,r=Math.sqrt(R())*77; s+=`<circle cx="${(100+r*Math.cos(a)).toFixed(1)}" cy="${(100+r*Math.sin(a)).toFixed(1)}" r="${(0.6+R()*1.1).toFixed(1)}" fill="#ffffff" opacity=".9"/>`; } }
  if(iz.ukrasi.includes("karamel")){
    for(let d=-160;d<=160;d+=17){
      s+=`<path d="M${100+d-90} 10 Q ${100+d-45} ${55+R()*6} ${100+d} 100 T ${100+d+90} 190" fill="none" stroke="#c4873e" stroke-width="2.4" stroke-linecap="round"/>`;
      s+=`<path d="M${100+d+90} 10 Q ${100+d+45} ${55+R()*6} ${100+d} 100 T ${100+d-90} 190" fill="none" stroke="#c4873e" stroke-width="2.4" stroke-linecap="round"/>`;
    }
  }
  if(zav==="mering"){
    for(const [rr,n] of [[68,26],[52,20],[36,14],[20,8],[0,1]]){
      for(let i=0;i<n;i++){ const a=i/n*6.283+rr*.05, x=100+rr*Math.cos(a), y=100+rr*Math.sin(a);
        s+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="8" fill="#f8ecd6"/><path d="M${(x-3).toFixed(1)} ${(y+1).toFixed(1)} q3 -6 6 0" fill="none" stroke="#d9a866" stroke-width="1.6" stroke-linecap="round"/><circle cx="${(x+1).toFixed(1)}" cy="${(y-2.5).toFixed(1)}" r="1.6" fill="#c98b4a"/>`; }
    }
  }
  if(zav==="glazura" || (zav==="bez" && iz.fil==="mlecna")) s+=`<ellipse cx="78" cy="70" rx="34" ry="16" fill="#ffffff" opacity=".14" transform="rotate(-28 78 70)"/>`;
  if(iz.ukrasi.includes("oreo")){ for(let i=0;i<240;i++){ const a=R()*6.283, r=58+R()*20; s+=`<circle cx="${(100+r*Math.cos(a)).toFixed(1)}" cy="${(100+r*Math.sin(a)).toFixed(1)}" r="${(0.8+R()*1.6).toFixed(1)}" fill="${R()>.5?"#2a2427":"#3d3539"}"/>`; } }
  if(iz.ukrasi.includes("lotus")){ for(let i=0;i<260;i++){ const a=R()*6.283, r=58+R()*20; s+=`<circle cx="${(100+r*Math.cos(a)).toFixed(1)}" cy="${(100+r*Math.sin(a)).toFixed(1)}" r="${(0.8+R()*1.6).toFixed(1)}" fill="${R()>.5?"#b0743c":"#c98a4c"}"/>`; } }
  // voće
  if(iz.voce.length){
    const prst = imaMasnice ? [[50,14],[34,10],[18,6],[0,1]] : [[64,20],[47,15],[30,10],[13,4]];
    let n=0;
    for(const [rr,c] of prst){ for(let i=0;i<c;i++){ const a=i/c*6.283+rr*.07; s+=vocka(iz.voce[n++%iz.voce.length],100+rr*Math.cos(a),100+rr*Math.sin(a),7.2,R()); } }
  }
  if(zav==="sjaj" && iz.voce.length) s+=`<circle cx="100" cy="100" r="77" fill="#ffffff" opacity=".07"/><ellipse cx="80" cy="72" rx="30" ry="12" fill="#ffffff" opacity=".18" transform="rotate(-28 80 72)"/>`;
  if(iz.ukrasi.includes("pistaci")){ for(let i=0;i<70;i++){ const a=R()*6.283, r=imaMasnice? 56+R()*8 : 40+R()*34; s+=`<rect x="${(100+r*Math.cos(a)).toFixed(1)}" y="${(100+r*Math.sin(a)).toFixed(1)}" width="2.2" height="1.6" fill="${R()>.4?"#8faa4a":"#b9cf6a"}" transform="rotate(${R()*90} ${(100+r*Math.cos(a)).toFixed(1)} ${(100+r*Math.sin(a)).toFixed(1)})"/>`; } }
  if(iz.ukrasi.includes("bademi")){ for(let i=0;i<22;i++){ const a=R()*6.283, r=30+R()*40, x=100+r*Math.cos(a), y=100+r*Math.sin(a); s+=`<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="5" ry="2.2" fill="#ecd5a6" stroke="#c9a874" stroke-width=".5" transform="rotate(${R()*180} ${x.toFixed(1)} ${y.toFixed(1)})"/>`; } }
  if(iz.ukrasi.includes("coklist")){ for(let i=0;i<10;i++){ const a=R()*6.283, r=20+R()*40, x=100+r*Math.cos(a), y=100+r*Math.sin(a); s+=`<path d="M${x.toFixed(1)} ${y.toFixed(1)} l7 -3 l3 6 l-8 3z" fill="#4a2c1e" stroke="#6b4433" stroke-width=".5" transform="rotate(${R()*360} ${x.toFixed(1)} ${y.toFixed(1)})"/>`; } }
  s+=`</g>`;
  // venčić mašnica
  const mas=iz.ukrasi.filter(u=>["masslag","masnice"].includes(u));
  if(mas.length){
    const n=26;
    for(let i=0;i<n;i++){ const a=i/n*6.283; const r = 68 + (i%2? -3:2); s+=rozeta(100+r*Math.cos(a),100+r*Math.sin(a),6.4,opc("ukrasi",mas[i%mas.length]).boja); }
  }
  if(iz.ukrasi.includes("lesnici")){ for(let i=0;i<9;i++){ const a=i/9*6.283+.2, r=mas.length?70:64, x=100+r*Math.cos(a), y=100+r*Math.sin(a); s+=`<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="4.2" ry="3.8" fill="#b9874f"/><ellipse cx="${(x-1).toFixed(1)}" cy="${(y-1).toFixed(1)}" rx="2" ry="1.6" fill="#d9ad73"/>`; } }
  if(iz.ukrasi.includes("zlato")){ for(let i=0;i<12;i++){ const a=R()*6.283, r=24+R()*44, x=100+r*Math.cos(a), y=100+r*Math.sin(a); s+=`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(2+R()*3).toFixed(1)}" height="${(2+R()*2).toFixed(1)}" fill="#d9b23e" transform="rotate(${R()*90} ${x.toFixed(1)} ${y.toFixed(1)})"/>`; } }
  if(iz.ukrasi.includes("cvece")){
    const mesta = mas.length ? [[-2.3,68],[-.3,68],[1.9,68]] : [[-2.3,58],[-.3,58],[1.9,58]];
    const palete=[["#4b2a8a","#f1c93a"],["#7e66d1","#efe7f7"],["#5a3fae","#f2d14a"]];
    mesta.forEach(([a,r],i)=>{ s+=cvet(100+r*Math.cos(a),100+r*Math.sin(a),11,palete[i]); });
  }
  if(iz.ukrasi.includes("oreo")){ [[100,100],[74,86],[126,86]].forEach(([x,y])=>{ s+=`<circle cx="${x}" cy="${y}" r="12" fill="#2a2427"/><circle cx="${x}" cy="${y}" r="9.5" fill="none" stroke="#4a4145" stroke-width="1" stroke-dasharray="1.5 1.5"/><circle cx="${x}" cy="${y}" r="5" fill="none" stroke="#3b3337" stroke-width="1"/>`; }); }
  if(iz.ukrasi.includes("lotus")){ s+=`<g transform="rotate(-16 100 100)"><rect x="82" y="88" width="36" height="24" rx="5" fill="#a8693a" stroke="#c88b55" stroke-width="2" stroke-dasharray="2 2.4"/><rect x="88" y="94" width="24" height="12" rx="3" fill="none" stroke="#8a522a" stroke-width="1"/></g>`; }
  if(iz.natpis){
    const t=iz.natpis.length>18 ? iz.natpis.slice(0,17)+"…" : iz.natpis;
    const y= iz.ukrasi.some(u=>["lotus","oreo"].includes(u)) ? 132 : 100;
    s+=`<g><rect x="58" y="${y-10}" width="84" height="20" rx="5" fill="#fbf3e3" stroke="#e1d0ad" stroke-width="1"/><text x="100" y="${y+3.5}" text-anchor="middle" font-family="Lora, Georgia, serif" font-style="italic" font-size="9" fill="#6a4a2e">${esc(t)}</text></g>`;
  }
  return s+`</svg>`;
}
function crtezPresek(iz){
  const pod=opc("podloga",iz.podloga), sr=opc("srednji",iz.srednji), fil=opc("fil",iz.fil), zv=opc("zavrsni",iz.zavrsni);
  const P=pod?.boja||"#e9dfcc";
  let s=`<svg viewBox="0 30 300 82" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">`;
  s+=`<ellipse cx="150" cy="106" rx="140" ry="5" fill="rgba(30,40,70,.10)"/>`;
  let y=94;
  s+=`<path d="M24 46 h10 v48 h232 v-48 h10 v56 q0 4 -4 4 h-244 q-4 0 -4 -4z" fill="${P}" stroke="${nijansa(P,-.2)}" stroke-width="1"/>`;
  if(sr && sr.id!=="bez"){ s+=`<rect x="34" y="${y-9}" width="232" height="9" fill="${sr.boja}"/>`; y-=9; }
  const fh = 28 - (sr && sr.id!=="bez" ? 4:0);
  if(fil){ s+=`<rect x="34" y="${y-fh}" width="232" height="${fh}" fill="${fil.boja}"/>`; }
  else { s+=`<rect x="34.5" y="${y-fh}" width="231" height="${fh}" fill="none" stroke="#cdbfa6" stroke-dasharray="4 4"/>`; }
  y-=fh;
  const id=iz.zavrsni;
  if(id==="glazura"){ s+=`<rect x="34" y="${y-4}" width="232" height="4" fill="${zv.boja}"/>`; y-=4; }
  if(id==="cokglaz"||id==="slag"){ s+=`<rect x="34" y="${y-(id==="slag"?7:4)}" width="232" height="${id==="slag"?7:4}" fill="${zv.boja}" stroke="${nijansa(zv.boja,-.12)}" stroke-width=".5"/>`; y-= id==="slag"?7:4; }
  if(id==="sjaj"){ s+=`<rect x="34" y="${y-2}" width="232" height="2" fill="#f4d9b0" opacity=".8"/>`; }
  if(id==="secer"){ for(let x=38;x<264;x+=5) s+=`<circle cx="${x}" cy="${y-1}" r="1.3" fill="#ffffff" stroke="#e6e0d6" stroke-width=".3"/>`; }
  if(id==="karamel"){ for(let x=44;x<260;x+=14) s+=`<ellipse cx="${x}" cy="${y-1}" rx="4" ry="1.5" fill="#c4873e"/>`; }
  if(id==="mering"){ let p=`M34 ${y}`; for(let x=34;x<266;x+=14){ p+=` Q ${x+7} ${y-22} ${x+14} ${y}`; } s+=`<path d="${p}Z" fill="#f6e6c8" stroke="#d9a866" stroke-width="1"/>`; for(let x=41;x<266;x+=14) s+=`<circle cx="${x}" cy="${y-10}" r="1.8" fill="#c98b4a"/>`; }
  // voće i ukrasi na vrhu
  const R=rng("p"+JSON.stringify(iz));
  const boje={jagode:"#d8324a",maline:"#c4294f",sumsko:"#3a2f5e",limun:"#f1d457",borovnice:"#363a72",kupine:"#2b1e37",smokve:"#7a2f55",kivi:"#9fc14d",mango:"#f2a93b",kruska:"#e6d39a"};
  if(iz.voce.length && id!=="mering"){ const levo=iz.ukrasi.some(u=>["masslag","masnice"].includes(u))?70:44, desno=300-levo; let i=0; for(let x=levo;x<=desno;x+=13){ const t=iz.voce[i++%iz.voce.length]; s+=`<ellipse cx="${x}" cy="${y-4}" rx="6" ry="5" fill="${boje[t]}"/>`; } }
  const mas=iz.ukrasi.filter(u=>["masslag","masnice"].includes(u));
  if(mas.length){ [44,56,244,256].forEach((x,i)=>{ const b=opc("ukrasi",mas[i%mas.length]).boja; s+=`<path d="M${x-6} ${y} q6 -16 12 0z" fill="${b}" stroke="${nijansa(b,-.2)}" stroke-width=".6"/>`; }); }
  if(iz.ukrasi.includes("cvece")) s+=`<circle cx="66" cy="${y-6}" r="5" fill="#5a3fae"/><circle cx="232" cy="${y-6}" r="5" fill="#7e66d1"/>`;
  if(iz.ukrasi.includes("lotus")||iz.ukrasi.includes("oreo")) s+=`<rect x="136" y="${y-7}" width="28" height="6" rx="2" fill="${iz.ukrasi.includes("oreo")?"#2a2427":"#a8693a"}"/>`;
  if(iz.natpis) s+=`<rect x="120" y="${y-13}" width="60" height="5" rx="2" fill="#fbf3e3" stroke="#e1d0ad" stroke-width=".6"/>`;
  return s+`</svg>`;
}

/* ---------- stanje ---------- */
const LS="la-tarterie-korpa-v2";
let korpa=[]; try{ korpa=JSON.parse(localStorage.getItem(LS)||"[]"); }catch(e){ korpa=[]; }
function sacuvaj(){ try{ localStorage.setItem(LS,JSON.stringify(korpa)); }catch(e){} osveziBadge(); }
const graditelj={
  svoj:{ iz:kopija(PRIMER_SVOJ), osnova:null },
  prilagodi:{ iz:kopija(GOTOVI[0].recept), osnova:GOTOVI[0].id },
};
const velicinaGotovog={}; GOTOVI.forEach(g=>velicinaGotovog[g.id]=g.recept.velicina);
let poslednjaPotvrda=null;

/* ---------- pomoćno ---------- */
let toastT;
function toast(t){ const el=document.getElementById("toast"); el.textContent=t; el.classList.add("on"); clearTimeout(toastT); toastT=setTimeout(()=>el.classList.remove("on"),3200); }
function osveziBadge(){ const n=korpa.reduce((a,s)=>a+s.kolicina,0); const b=document.getElementById("badge"); b.textContent=n; if(n) b.removeAttribute("data-zero"); else b.setAttribute("data-zero",""); }
function sastavTekst(iz){
  const delovi=[];
  const v=opc("velicina",iz.velicina); if(v) delovi.push(v.naziv);
  ["podloga","srednji","fil","zavrsni"].forEach(k=>{ const o=opc(k,iz[k]); if(o && o.id!=="bez") delovi.push(o.naziv); });
  if(iz.voce.length) delovi.push(iz.voce.map(id=>opc("voce",id).naziv).join(", "));
  if(iz.ukrasi.length) delovi.push(iz.ukrasi.map(id=>opc("ukrasi",id).naziv.toLowerCase()).join(", "));
  if(iz.natpis) delovi.push(`natpis „${iz.natpis}“`);
  return delovi.join(" · ");
}
const ikonaKatanac=`<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="7" width="10" height="7" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`;

/* ---------- prikazi ---------- */
function prikaziPonudu(){
  const kartice=GOTOVI.map(g=>{
    const r=g.recept;
    const chips=[opc("podloga",r.podloga), opc("fil",r.fil), opc("zavrsni",r.zavrsni)].filter(o=>o && o.id!=="bez").map(o=>`<span class="chip">${esc(o.naziv)}</span>`).join("");
    const seg=g.velicine.map(v=>{ const o=opc("velicina",v); return `<button type="button" data-akcija="gotov-vel" data-g="${g.id}" data-v="${v}" aria-pressed="${velicinaGotovog[g.id]===v}" title="${esc(o.opis)}">${esc(o.opis)}</button>`; }).join("");
    return `<article class="tart-card">
      <div class="foto">${g.slika ? `<img src="${g.slika}" alt="${esc(g.naziv)}" loading="lazy">` : `<div class="crtez-foto" role="img" aria-label="${esc(g.naziv)}, crtež">${crtezOdozgo(g.recept,"g"+g.id)}</div>`}</div>
      <div class="body">
        <h2>${esc(g.naziv)}</h2>
        <p class="opis">${esc(g.opis)}</p>
        <div class="sastav">${chips}</div>
        <div class="seg" role="group" aria-label="Veličina">${seg}</div>
        <div class="card-actions">
          <button class="btn" type="button" data-akcija="gotov-korpa" data-g="${g.id}">Dodaj u korpu</button>
          <button class="btn ghost" type="button" data-akcija="gotov-prilagodi" data-g="${g.id}">Prilagodi</button>
        </div>
      </div></article>`;
  }).join("");
  return `<div class="view-head"><span class="eyebrow">Ponuda</span><h1>Naši tartovi</h1><p>Tartovi koje pravimo svakog dana. Izaberi veličinu i dodaj u korpu, ili ga prilagodi po svom ukusu.</p></div>
    <div class="grid3">${kartice}</div>
    <section class="cta">
      <div><span class="eyebrow">Po tvom ukusu</span><h2>Napravi svoj tart</h2>
        <p>Biraš sloj po sloj: podlogu, fil, završni sloj, voće i ukrase. Crtež se menja dok biraš, a kombinacije koje ne idu zajedno su označene.</p>
        <div class="actions"><a class="btn" href="#napravi">Počni</a><a class="btn ghost" href="#prilagodi">Prilagodi postojeći</a></div></div>
      ${crtezOdozgo(PRIMER_SVOJ,"cta")}
    </section>`;
}

function prikaziGraditelja(rezim){
  const g=graditelj[rezim];
  const osnovaObj = g.osnova ? GOTOVI.find(x=>x.id===g.osnova) : null;
  let glava;
  if(rezim==="prilagodi"){
    glava=`<div class="view-head"><span class="eyebrow">Prilagodi</span><h1>Prilagodi naš tart</h1><p>Izaberi tart koji ti se dopada. Osnova ostaje ista, a ti menjaš veličinu, voće, ukrase i natpis.</p></div>
      <div class="osnove" role="group" aria-label="Osnova">${GOTOVI.map(x=>`<button type="button" class="osnova" data-akcija="osnova" data-g="${x.id}" aria-pressed="${g.osnova===x.id}">${x.slika ? `<img src="${x.slika}" alt="">` : `<span class="osnova-crtez">${crtezOdozgo(x.recept,"o"+x.id)}</span>`}${esc(x.naziv)}</button>`).join("")}</div>`;
  } else {
    glava=`<div class="view-head"><span class="eyebrow">Napravi svoj</span><h1>Tvoj tart, sloj po sloj</h1><p>Koraci idu odozdo nagore, onako kako se tart i pravi. Otvorili smo primer da vidiš kako izgleda; menjaj šta god hoćeš ili <button type="button" class="linkbtn" data-akcija="ispocetka" data-r="${rezim}">počni od nule</button>.</p></div>`;
  }
  return glava+`<div class="builder" data-rezim="${rezim}">
    <aside class="preview" id="pv-${rezim}">${htmlPregleda(rezim)}</aside>
    <div class="koraci" id="kr-${rezim}">${htmlKoraka(rezim)}</div>
  </div>`;
}
function nazivZa(rezim){ const g=graditelj[rezim]; if(rezim==="prilagodi"){ const o=GOTOVI.find(x=>x.id===g.osnova); return o? o.naziv+" po tvom" : "Tart"; } return "Tvoj tart"; }

function htmlPregleda(rezim){
  const iz=graditelj[rezim].iz;
  const fali=nedostaje(iz);
  const red=(k,boja,v)=>`<li><span class="dot" style="background:${boja||"transparent"}"></span><span class="k">${k}</span><span class="v">${v}</span></li>`;
  const ime=(kid)=>{ const o=opc(kid,iz[kid]); return o ? esc(o.naziv) : `<span class="prazno">nije izabrano</span>`; };
  const lista=[...iz.ukrasi.map(u=>opc("ukrasi",u).naziv), ...(iz.natpis?[`natpis „${iz.natpis}“`]:[])];
  const sloj = [
    red("Ukrasi", iz.ukrasi.length? opc("ukrasi",iz.ukrasi[0]).boja:"", lista.length? esc(lista.join(", ")) : `<span class="prazno">bez</span>`),
    red("Voće", iz.voce.length? opc("voce",iz.voce[0]).boja:"", iz.voce.length? esc(iz.voce.map(v=>opc("voce",v).naziv).join(", ")) : `<span class="prazno">bez</span>`),
    red("Završni sloj", opc("zavrsni",iz.zavrsni)?.boja, ime("zavrsni")),
    red("Fil", opc("fil",iz.fil)?.boja, ime("fil")),
    red("Srednji sloj", opc("srednji",iz.srednji)?.boja, ime("srednji")),
    red("Podloga", opc("podloga",iz.podloga)?.boja, ime("podloga")),
  ].join("");
  const v=opc("velicina",iz.velicina);
  const al=alergeniZa(iz);
  return `<div class="crtez">${crtezOdozgo(iz,"pv"+rezim)}</div>
    <div class="naziv">${esc(nazivZa(rezim))}<div class="eyebrow" style="margin-top:2px">${v? esc(v.opis):"veličina nije izabrana"}</div></div>
    <div class="presek" aria-label="Presek tarta">${crtezPresek(iz)}</div>
    <ul class="slojevi" aria-label="Sastav, odozgo nadole">${sloj}</ul>
    <p class="alergeni"><b>Sadrži:</b> ${al.length? esc(al.join(", ")) : "—"}</p>
    <div class="dodaj">
      <button class="btn" type="button" data-akcija="graditelj-korpa" data-r="${rezim}" ${fali.length?"disabled":""}>Dodaj u korpu</button>
      ${fali.length? `<span class="nedostaje">Još izaberi: ${esc(fali.join(", "))}</span>`:""}
    </div>`;
}

function htmlKoraka(rezim){
  const g=graditelj[rezim], iz=g.iz;
  const zak = rezim==="prilagodi" ? ZAKLJUCANO_KOD_PRILAGODI : [];
  return KORACI.map((k,i)=>{
    const br=`<span class="br">${i+1}.</span>`;
    if(zak.includes(k.id)){
      const o=opc(k.id,iz[k.id]);
      return `<section class="korak"><div class="korak-head">${br}<h3>${esc(k.naslov)}</h3></div>
        <div class="zakljucan">${ikonaKatanac}<span><b>${esc(o?.naziv||"—")}</b> · ostaje kao u originalu</span></div></section>`;
    }
    if(k.tip==="tekst"){
      return `<section class="korak"><div class="korak-head">${br}<h3>${esc(k.naslov)}</h3><span class="pomoc">${esc(k.pomoc)}</span></div>
        <div class="polje"><label for="natpis-${rezim}">Tekst na pločici</label>
        <input id="natpis-${rezim}" maxlength="${k.max}" placeholder="npr. Srećan rođendan, Ana" value="${esc(iz.natpis)}" data-akcija="natpis" data-r="${rezim}">
        <span class="hint" id="natpis-br-${rezim}">${iz.natpis.length}/${k.max} znakova</span></div></section>`;
    }
    const vise=k.tip==="vise", m=vise?maxZa(k,iz):1;
    const brojac= vise ? `<span class="brojac">${iz[k.id].length} od ${m}</span>` : "";
    const ops=k.opcije.map(o=>{
      const izab= vise ? iz[k.id].includes(o.id) : iz[k.id]===o.id;
      let zab = razlog(k.id,o,iz);
      if(!zab && vise && !izab && iz[k.id].length>=m) zab = `Najviše ${m}` + (k.maxPoVelicini?.[iz.velicina] ? " za mini tart" : "");
      const sw = o.boja ? `<span class="sw" style="background:${o.boja}"></span>` : `<span class="sw prazan"></span>`;
      return `<button type="button" class="opc" data-akcija="izbor" data-r="${rezim}" data-k="${k.id}" data-o="${o.id}" aria-pressed="${izab}" ${zab&&!izab?'aria-disabled="true"':""}>
        ${sw}<span class="n">${esc(o.naziv)}</span>${o.opis?`<span class="d">${esc(o.opis)}</span>`:""}${zab&&!izab?`<span class="zab">${esc(zab.trim())}</span>`:""}</button>`;
    }).join("");
    return `<section class="korak"><div class="korak-head">${br}<h3>${esc(k.naslov)}</h3>${brojac}<span class="pomoc">${esc(k.pomoc)}</span></div><div class="opcije">${ops}</div></section>`;
  }).join("") + `<div class="builder-foot mobile-only"><p class="alergeni" id="alm-${rezim}"></p><button class="btn" type="button" data-akcija="graditelj-korpa" data-r="${rezim}" ${nedostaje(iz).length?"disabled":""}>Dodaj u korpu</button></div>`;
}

function prikaziKorpu(){
  if(poslednjaPotvrda){
    const p=poslednjaPotvrda;
    return `<div class="potvrda"><span class="eyebrow">Porudžbina primljena</span><h2>Hvala, ${esc(p.ime)}!</h2>
      <p>Tvoja porudžbina od ${p.komada} ${p.komada===1?"tarta":"tartova"} je zabeležena${p.datum? " za "+esc(new Date(p.datum).toLocaleDateString("sr-Latn-RS",{weekday:"long",day:"numeric",month:"long"})) : ""}. Javićemo se na ${esc(p.telefon)} da potvrdimo.</p>
      <div><a class="btn" href="#ponuda" data-akcija="nova">Nazad na ponudu</a></div></div>`;
  }
  if(!korpa.length){
    return `<div class="view-head"><span class="eyebrow">Korpa</span><h1>Korpa</h1></div>
      <div class="prazna"><h2>Korpa je prazna</h2><p>Dodaj neki od naših tartova ili napravi svoj, pa se vrati ovde da pošalješ porudžbinu.</p>
      <div class="card-actions"><a class="btn" href="#ponuda">Naši tartovi</a><a class="btn ghost" href="#napravi">Napravi svoj</a></div></div>`;
  }
  const tipovi={gotov:"Naš tart",prilagodjen:"Prilagođen",svoj:"Tvoj tart"};
  const stavke=korpa.map((s,i)=>{
    const g=GOTOVI.find(x=>x.id===s.gotovId);
    const thumb = s.tip==="gotov" && g && g.slika ? `<img src="${g.slika}" alt="">` : crtezOdozgo(s.izbor,"k"+i);
    return `<article class="stavka"><div class="thumb">${thumb}</div>
      <div style="min-width:0"><div class="tip">${tipovi[s.tip]}</div><h3>${esc(s.naziv)}</h3><p class="det">${esc(sastavTekst(s.izbor))}</p></div>
      <div class="desno"><div class="kol" role="group" aria-label="Količina"><button type="button" data-akcija="kol" data-i="${i}" data-d="-1" aria-label="Manje">−</button><span>${s.kolicina}</span><button type="button" data-akcija="kol" data-i="${i}" data-d="1" aria-label="Više">+</button></div>
      <button type="button" class="linkbtn" data-akcija="ukloni" data-i="${i}">Ukloni</button></div></article>`;
  }).join("");
  const sutra=new Date(Date.now()+86400000).toISOString().slice(0,10);
  return `<div class="view-head"><span class="eyebrow">Korpa</span><h1>Korpa</h1><p>Proveri tartove i ostavi kontakt da bismo potvrdili porudžbinu.</p></div>
    <div class="korpa"><div class="stavke">${stavke}</div>
    <form class="forma" id="forma" novalidate>
      <h2>Podaci za porudžbinu</h2>
      <div class="polje"><label for="f-ime">Ime i prezime</label><input id="f-ime" name="ime" autocomplete="name" required placeholder="Ana Petrović"></div>
      <div class="polje"><label for="f-tel">Telefon</label><input id="f-tel" name="telefon" type="tel" autocomplete="tel" required placeholder="06x xxx xxxx"></div>
      <div class="polje"><label for="f-dat">Za kada</label><input id="f-dat" name="datum" type="date" min="${sutra}"></div>
      <div class="polje"><label for="f-nap">Napomena</label><textarea id="f-nap" name="napomena" placeholder="Alergije, posebne želje…"></textarea></div>
      <p hidden><label>Ne popunjavaj: <input name="bot-polje" tabindex="-1" autocomplete="off"></label></p>
      <p class="nedostaje" id="f-greska" hidden></p>
      <button class="btn" type="submit" id="f-posalji">Pošalji porudžbinu</button>
    </form></div>`;
}

/* ---------- ruter ---------- */
const RUTE=["ponuda","prilagodi","napravi","korpa"];
function ruta(){ const h=location.hash.replace("#",""); return RUTE.includes(h)?h:"ponuda"; }
function prikazi(){
  const r=ruta(), m=document.getElementById("main");
  if(r!=="korpa") poslednjaPotvrda=null;
  document.getElementById("toast").classList.remove("on");
  m.innerHTML = r==="ponuda"? prikaziPonudu() : r==="prilagodi"? prikaziGraditelja("prilagodi") : r==="napravi"? prikaziGraditelja("svoj") : prikaziKorpu();
  if(r==="prilagodi"||r==="napravi") osveziGraditelja(r==="napravi"?"svoj":"prilagodi",true);
  document.querySelectorAll("nav.tabs a").forEach(a=>a.toggleAttribute("aria-current",false)||a.dataset.route===r&&a.setAttribute("aria-current","page"));
  osveziBadge();
}
function osveziGraditelja(rezim, samoPregled){
  const pv=document.getElementById("pv-"+rezim); if(pv) pv.innerHTML=htmlPregleda(rezim);
  if(!samoPregled){ const kr=document.getElementById("kr-"+rezim); if(kr) kr.innerHTML=htmlKoraka(rezim); }
  const al=document.getElementById("alm-"+rezim);
  if(al){ const a=alergeniZa(graditelj[rezim].iz); al.innerHTML=`<b>Sadrži:</b> ${a.length? esc(a.join(", ")) : "—"}`; }
}
window.addEventListener("hashchange",()=>{ prikazi(); window.scrollTo({top:0}); });

/* ---------- događaji ---------- */
document.addEventListener("click",e=>{
  const el=e.target.closest("[data-akcija]"); if(!el) return;
  const a=el.dataset.akcija;
  if(a==="gotov-vel"){ velicinaGotovog[el.dataset.g]=el.dataset.v; el.parentElement.querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",b===el)); }
  else if(a==="gotov-korpa"){
    const g=GOTOVI.find(x=>x.id===el.dataset.g); const iz=kopija(g.recept); iz.velicina=velicinaGotovog[g.id];
    dodaj({tip:"gotov",gotovId:g.id,naziv:g.naziv,izbor:iz}); toast(`${g.naziv} (${opc("velicina",iz.velicina).naziv.toLowerCase()}) je u korpi.`);
  }
  else if(a==="gotov-prilagodi"){ postaviOsnovu(el.dataset.g); location.hash="prilagodi"; }
  else if(a==="osnova"){ postaviOsnovu(el.dataset.g); document.querySelectorAll(".osnova").forEach(b=>b.setAttribute("aria-pressed",b.dataset.g===el.dataset.g)); osveziGraditelja("prilagodi"); }
  else if(a==="ispocetka"){ const r=el.dataset.r; graditelj[r].iz=prazanIzbor(); osveziGraditelja(r); toast("Sve je očišćeno. Kreni od veličine."); }
  else if(a==="izbor"){
    const r=el.dataset.r, kid=el.dataset.k, oid=el.dataset.o, iz=graditelj[r].iz, k=K[kid];
    if(el.getAttribute("aria-disabled")==="true"){ const z=el.querySelector(".zab"); if(z) toast(z.textContent); return; }
    if(k.tip==="vise"){ iz[kid]= iz[kid].includes(oid) ? iz[kid].filter(x=>x!==oid) : [...iz[kid],oid]; }
    else { iz[kid]= (iz[kid]===oid && !k.obavezno && k.podrazumevano) ? k.podrazumevano : oid; }
    const skinuto=uskladi(iz);
    if(skinuto.length) toast(`Uklonjeno jer više ne ide uz izbor: ${skinuto.join(", ")}.`);
    const y=el.getBoundingClientRect().top;
    osveziGraditelja(r);
    const novi=document.querySelector(`[data-akcija="izbor"][data-r="${r}"][data-k="${kid}"][data-o="${oid}"]`);
    if(novi){ window.scrollBy(0, novi.getBoundingClientRect().top - y); novi.focus({preventScroll:true}); }
  }
  else if(a==="graditelj-korpa"){
    const r=el.dataset.r, g=graditelj[r];
    if(nedostaje(g.iz).length) return;
    dodaj({ tip: r==="prilagodi"?"prilagodjen":"svoj", gotovId:g.osnova, naziv:nazivZa(r), izbor:kopija(g.iz) });
    toast(`${nazivZa(r)} je u korpi.`);
  }
  else if(a==="kol"){ const s=korpa[+el.dataset.i]; s.kolicina=Math.max(1,s.kolicina+ +el.dataset.d); sacuvaj(); prikazi(); }
  else if(a==="ukloni"){ korpa.splice(+el.dataset.i,1); sacuvaj(); prikazi(); }
  else if(a==="nova"){ poslednjaPotvrda=null; }
});
document.addEventListener("input",e=>{
  const el=e.target; if(el.dataset.akcija!=="natpis") return;
  const r=el.dataset.r; graditelj[r].iz.natpis=el.value;
  const b=document.getElementById("natpis-br-"+r); if(b) b.textContent=`${el.value.length}/${K.natpis.max} znakova`;
  osveziGraditelja(r,true);
});
document.addEventListener("submit",async e=>{
  if(e.target.id!=="forma") return; e.preventDefault();
  const f=new FormData(e.target), ime=(f.get("ime")||"").trim(), tel=(f.get("telefon")||"").trim();
  const gr=document.getElementById("f-greska"), dugme=document.getElementById("f-posalji");
  if(!ime || tel.replace(/\D/g,"").length<8){ gr.textContent= !ime ? "Upiši ime da bismo znali na koga glasi porudžbina." : "Upiši broj telefona da bismo mogli da potvrdimo porudžbinu."; gr.hidden=false; return; }
  const stavke=korpa.map(s=>`${s.kolicina} × ${s.naziv}: ${sastavTekst(s.izbor)}`).join("\n");
  const podaci={ "form-name":"porudzbina", ime, telefon:tel, datum:f.get("datum")||"", napomena:f.get("napomena")||"", stavke, "bot-polje":f.get("bot-polje")||"" };
  dugme.disabled=true; dugme.textContent="Šaljem…"; gr.hidden=true;
  try{
    const odg=await fetch("/",{ method:"POST", headers:{"Content-Type":"application/x-www-form-urlencoded"}, body:new URLSearchParams(podaci).toString() });
    if(!odg.ok) throw new Error(odg.status);
  }catch(err){
    gr.textContent="Porudžbina nije poslata. Proveri internet vezu i pokušaj ponovo.";
    gr.hidden=false; dugme.disabled=false; dugme.textContent="Pošalji porudžbinu"; return;
  }
  poslednjaPotvrda={ ime, telefon:tel, datum:f.get("datum"), komada:korpa.reduce((a,s)=>a+s.kolicina,0) };
  korpa=[]; sacuvaj(); prikazi(); window.scrollTo({top:0});
});
function postaviOsnovu(gid){ const g=GOTOVI.find(x=>x.id===gid); graditelj.prilagodi={ iz:kopija(g.recept), osnova:gid }; graditelj.prilagodi.iz.velicina=velicinaGotovog[gid]; }
function dodaj(st){
  const kljuc=JSON.stringify([st.tip,st.gotovId,st.izbor]);
  const postoji=korpa.find(s=>JSON.stringify([s.tip,s.gotovId,s.izbor])===kljuc);
  if(postoji) postoji.kolicina++; else korpa.push({...st,kolicina:1});
  sacuvaj();
}

prikazi();
