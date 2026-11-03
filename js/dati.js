// Le 40 figure del mazzo (stesse figure nel mazzo nero, messo all'asta, e nel mazzo rosso, dei premi).
// orizz: la figura è disegnata in orizzontale (sulla TV la mostriamo girata).
// t: caratteristiche usate dal banditore per gli indizi.

// ?veloce=N accelera tutti i tempi (solo per le prove automatiche)
export const ACCEL = Math.max(1, Number(new URLSearchParams(location.search).get('veloce') || 1));

export const CARTE = [
  { id: 'falco', n: 1, nome: 'Falco', t: ['animale', 'uccello', 'vola', 'piccolo', 'dispari'] },
  { id: 'struzzo', n: 1, nome: 'Struzzo', t: ['animale', 'uccello', 'africa', 'grosso', 'piccolo', 'dispari'] },
  { id: 'orso', n: 2, nome: 'Orso bianco', t: ['animale', 'quattrozampe', 'grosso', 'freddo', 'piccolo', 'pari'] },
  { id: 'rondini', n: 3, nome: 'Rondini', t: ['animale', 'uccello', 'vola', 'piccolo', 'dispari'] },
  { id: 'martin', n: 4, nome: 'Martin pescatore', t: ['animale', 'uccello', 'vola', 'acqua', 'piccolo', 'pari'] },
  { id: 'usignolo', n: 5, nome: 'Usignolo', t: ['animale', 'uccello', 'vola', 'fiore', 'piccolo', 'dispari'] },
  { id: 'pappagallo', n: 7, nome: 'Pappagallo', t: ['animale', 'uccello', 'vola', 'lontano', 'piccolo', 'dispari'] },
  { id: 'farfalla', n: 8, nome: 'Farfalla', t: ['animale', 'vola', 'fiore', 'piccolo', 'pari'] },
  { id: 'colombi', n: 9, nome: 'Colombi', t: ['animale', 'uccello', 'vola', 'piccolo', 'dispari'] },
  { id: 'gatto', n: 10, nome: 'Gatto selvatico', orizz: true, t: ['animale', 'quattrozampe', 'piccolo', 'pari'] },
  { id: 'leone', n: 11, nome: 'Leone', orizz: true, t: ['animale', 'quattrozampe', 'africa', 'dispari'] },
  { id: 'cavallo', n: 12, nome: 'Cavallo', orizz: true, t: ['animale', 'quattrozampe', 'pari'] },
  { id: 'giraffa', n: 13, nome: 'Giraffa', t: ['animale', 'quattrozampe', 'africa', 'grosso', 'dispari'] },
  { id: 'cervo', n: 14, nome: 'Cervo', orizz: true, t: ['animale', 'quattrozampe', 'pari'] },
  { id: 'gazzelle', n: 15, nome: 'Gazzelle', orizz: true, t: ['animale', 'quattrozampe', 'africa', 'dispari'] },
  { id: 'rinoceronte', n: 16, nome: 'Rinoceronte', t: ['animale', 'quattrozampe', 'africa', 'grosso', 'pari'] },
  { id: 'elefante', n: 17, nome: 'Elefante', t: ['animale', 'quattrozampe', 'africa', 'grosso', 'dispari'] },
  { id: 'balena', n: 18, nome: 'Balena', orizz: true, t: ['animale', 'acqua', 'grosso', 'freddo', 'pari'] },
  { id: 'canguro', n: 19, nome: 'Canguro', orizz: true, t: ['animale', 'lontano', 'dispari'] },
  { id: 'flora', n: 20, nome: 'Flora', t: ['fiore', 'pari'] },
  { id: 'primole', n: 21, nome: 'Primole', t: ['fiore', 'dispari'] },
  { id: 'funghi', n: 22, nome: 'Funghi', t: ['fiore', 'mangiare', 'pari'] },
  { id: 'pesciuva', n: 23, nome: 'Pesci e uva', t: ['mangiare', 'acqua', 'dispari'] },
  { id: 'pesca', n: 24, nome: 'Pesca', t: ['mangiare', 'fiore', 'pari'] },
  { id: 'faro', n: 25, nome: 'Faro', t: ['luogo', 'acqua', 'dispari'] },
  { id: 'dama', n: 26, nome: 'Dama', t: ['persona', 'signora', 'pari'] },
  { id: 'giapponesina', n: 27, nome: 'Giapponesina', t: ['persona', 'signora', 'lontano', 'dispari'] },
  { id: 'mietitrice', n: 28, nome: 'Mietitrice', t: ['persona', 'signora', 'pari'] },
  { id: 'spagnola', n: 29, nome: 'Spagnola', t: ['persona', 'signora', 'fiore', 'dispari'] },
  { id: 'poesia', n: 30, nome: 'Poesia', t: ['persona', 'signora', 'pari'] },
  { id: 'maresciallo', n: 31, nome: 'Maresciallo', t: ['persona', 'divisa', 'grande', 'dispari'] },
  { id: 'arabo', n: 32, nome: 'Arabo', t: ['persona', 'lontano', 'grande', 'pari'] },
  { id: 'bersagliere', n: 33, nome: 'Bersagliere', t: ['persona', 'divisa', 'grande', 'dispari'] },
  { id: 'giocatrici', n: 34, nome: 'Giocatrici', t: ['persona', 'signora', 'grande', 'pari'] },
  { id: 'lattante', n: 35, nome: 'Lattante', orizz: true, t: ['persona', 'grande', 'dispari'] },
  { id: 'sfinge', n: 36, nome: 'Sfinge', t: ['luogo', 'africa', 'lontano', 'grande', 'pari'] },
  { id: 'pagoda', n: 37, nome: 'Pagoda', t: ['luogo', 'lontano', 'grande', 'dispari'] },
  { id: 'castello', n: 38, nome: 'Castello', orizz: true, t: ['luogo', 'acqua', 'grande', 'pari'] },
  { id: 'venezia', n: 39, nome: 'Venezia', orizz: true, t: ['luogo', 'acqua', 'grande', 'dispari'] },
  { id: 'nave', n: 40, nome: 'Nave', orizz: true, t: ['acqua', 'grande', 'pari'] },
];
export const CARTA = Object.fromEntries(CARTE.map((c) => [c.id, c]));

// articolo per dire il nome della figura ("il Faro", "lo Struzzo", "le Rondini")
const ART = {
  falco: 'il', struzzo: 'lo', orso: "l'", rondini: 'le', martin: 'il', usignolo: "l'", pappagallo: 'il', farfalla: 'la',
  colombi: 'i', gatto: 'il', leone: 'il', cavallo: 'il', giraffa: 'la', cervo: 'il', gazzelle: 'le', rinoceronte: 'il',
  elefante: "l'", balena: 'la', canguro: 'il', flora: 'la', primole: 'le', funghi: 'i', pesciuva: 'i', pesca: 'la',
  faro: 'il', dama: 'la', giapponesina: 'la', mietitrice: 'la', spagnola: 'la', poesia: 'la', maresciallo: 'il',
  arabo: "l'", bersagliere: 'il', giocatrici: 'le', lattante: 'il', sfinge: 'la', pagoda: 'la', castello: 'il',
  venezia: '', nave: 'la',
};
export function conArticolo(id) {
  const a = ART[id] ?? '', n = CARTA[id].nome;
  return a ? (a.endsWith("'") ? a + n : a + ' ' + n) : n;
}

// Indizi: come li annuncia il banditore
export const INDIZI = {
  animale: 'un animale',
  quattrozampe: 'un animale a quattro zampe',
  uccello: 'un uccello',
  vola: 'qualcosa che vola',
  persona: 'una persona',
  signora: 'una signora',
  divisa: 'un signore in divisa',
  luogo: 'un posto famoso',
  fiore: 'qualcosa con fiori o foglie',
  mangiare: 'qualcosa di buono da mangiare',
  acqua: "qualcosa che ha a che fare con l'acqua",
  africa: "qualcosa che viene dall'Africa",
  grosso: 'un animale bello grosso',
  lontano: 'qualcosa che viene da molto lontano',
  freddo: 'qualcosa che non soffre il freddo',
  piccolo: 'una carta con un numero piccolo, da 1 a 10',
  grande: 'una carta con un numero alto, dal 31 in su',
  pari: 'una carta con il numero pari',
  dispari: 'una carta con il numero dispari',
};

export const COLORI = ['#e63946', '#2a9d8f', '#f4a261', '#457b9d', '#9b5de5', '#43aa8b', '#f15bb5', '#e9c46a',
  '#4361ee', '#bc6c25', '#06aed5', '#8ac926', '#ff7f51', '#6d597a', '#00b4d8', '#c9184a'];

export function img(id, mini = false) { return `carte/${mini ? 'mini/' : ''}${id}.webp`; }

// ----------------------------------------------------------- soldi (sempre in centesimi)
export function euro(c) {
  const s = (Math.abs(c) / 100).toFixed(2).replace('.', ',');
  return (c < 0 ? '-' : '') + s + ' €';
}
const UNITA = ['zero', 'un', 'due', 'tre', 'quattro', 'cinque', 'sei', 'sette', 'otto', 'nove', 'dieci', 'undici', 'dodici',
  'tredici', 'quattordici', 'quindici', 'sedici', 'diciassette', 'diciotto', 'diciannove'];
const DECINE = ['', '', 'venti', 'trenta', 'quaranta', 'cinquanta', 'sessanta', 'settanta', 'ottanta', 'novanta'];
function numero(n) {
  if (n < 20) return UNITA[n];
  if (n < 100) {
    const d = Math.floor(n / 10), u = n % 10;
    let s = DECINE[d];
    if (u === 1 || u === 8) s = s.slice(0, -1);
    return s + (u ? (u === 1 ? 'uno' : UNITA[u]) : '');
  }
  if (n < 1000) {
    const c = Math.floor(n / 100), r = n % 100;
    return (c === 1 ? 'cento' : UNITA[c] + 'cento') + (r ? numero(r) : '');
  }
  return String(n);
}
// "1,50 €" detto a voce: "un euro e cinquanta"
export function euroParlato(c) {
  const e = Math.floor(c / 100), ct = c % 100;
  if (e === 0) return numero(ct) + ' centesimi';
  const se = e === 1 ? 'un euro' : numero(e) + ' euro';
  return ct ? se + ' e ' + numero(ct) : se;
}

export function mescola(a) {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
  return b;
}
export const caso = (a) => a[Math.floor(Math.random() * a.length)];
export const dormi = (ms) => new Promise((r) => setTimeout(r, ms));

// Ripartizione del montepremi tra le carte vincenti (dalla più piccola alla più grande)
export const RIPARTIZIONE = {
  2: [35, 65],
  3: [20, 30, 50],
  4: [13, 20, 27, 40],
  5: [10, 12, 18, 25, 35],
  6: [9, 10, 13, 16, 22, 30],
};
export function vincentiPerGiocatori(n) {
  if (n <= 3) return 3;
  if (n <= 6) return 4;
  if (n <= 9) return 5;
  return 6;
}
