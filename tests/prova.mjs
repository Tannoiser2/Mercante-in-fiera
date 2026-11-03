// Prova automatica: TV + 2 telefoni (rete locale nello stesso browser) + giocatori finti, partita completa.
// Uso: python3 -m http.server 8765 &  poi  node tests/prova.mjs [cartella_screenshot]
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8765/';
const OUT = process.argv[2] || 'screenshot';
const VEL = process.env.VELOCE || '6';
const errori = [];
const browser = await chromium.launch();
const ctx = await browser.newContext();
const tv = await ctx.newPage();
await tv.setViewportSize({ width: 1920, height: 1080 });
for (const p of [tv]) p.on('pageerror', (e) => errori.push('TV: ' + e.message));
tv.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('404')) errori.push('TV console: ' + m.text()); });
await tv.goto(BASE + `?tv&rete=locale&bot=2&veloce=${VEL}`);
await tv.click('#nuova');
await tv.waitForSelector('.sala.vis');
const codice = await tv.evaluate(() => window.banditore.codice);
console.log('codice', codice, await tv.evaluate(() => window.banditore.S.codice));
const tel = [];
for (const nome of ['Stefano', 'Giulia']) {
  const t = await ctx.newPage();
  await t.setViewportSize({ width: 390, height: 844 });
  t.on('pageerror', (e) => errori.push(nome + ': ' + e.message));
  await t.goto(BASE + `?s=${codice}&rete=locale`);
  await t.fill('#nome', nome);
  await t.click('#entra');
  tel.push(t);
}
await tv.waitForTimeout(1500);
await tv.screenshot({ path: `${OUT}/01_tv_sala.png` });
await tel[0].screenshot({ path: `${OUT}/02_tel_attesa.png` });
await tv.click('#apri');
const fatte = new Set();
const t0 = Date.now();
let ultimaFase = '';
let vendita = false;
while (Date.now() - t0 < 14 * 60 * 1000) {
  const S = await tv.evaluate(() => window.banditore.S);
  if (S.fase !== ultimaFase) { console.log('fase', S.fase, Math.round((Date.now() - t0) / 1000) + 's'); ultimaFase = S.fase; }
  // i telefoni fanno offerte ogni tanto
  for (const [i, t] of tel.entries()) {
    const b = await t.$$('.offri button');
    const Sx = S.lotto; if (b.length && Math.random() < 0.1 && (!Sx?.migliore || Sx.migliore.v < 250)) await b[Math.floor(Math.random() * Math.min(b.length, 2))].click().catch(() => {});
    const si = await t.$('#si');
    if (si) await (Math.random() < 0.7 ? si : await t.$('#no')).click().catch(() => {});
  }
  // le carte in regalo sono coperte agli altri: sulla TV si vede il dorso
  if (S.fase === 'asta' && !fatte.has('coperte')) {
    fatte.add('coperte');
    await tv.waitForTimeout(1500);
    const dorsi = await tv.$$eval('#giocatori img', (l) => l.filter((i) => i.src.includes('dorso_nero')).length);
    const altri = await tel[1].$$eval('#tavolo img', (l) => l.filter((i) => i.src.includes('dorso_nero')).length);
    console.log('regali coperti: TV', dorsi, '- telefono di Giulia', altri);
    if (dorsi < 4) errori.push('le carte in regalo non sono coperte sulla TV');
    // Stefano mostra le sue carte e poi le ricopre
    await tel[0].click('[data-tutte="0"]').catch(() => errori.push('manca il pulsante mostra tutte'));
    await tv.waitForTimeout(800);
    const dopo = await tv.$$eval('#giocatori img', (l) => l.filter((i) => i.src.includes('dorso_nero')).length);
    console.log('dopo "mostra tutte": dorsi sulla TV', dopo);
    if (dopo !== dorsi - 1) errori.push('mostra tutte non ha scoperto la carta');
    await tel[0].screenshot({ path: `${OUT}/04b_tel_coperte.png` });
    await tel[0].click('[data-tutte="1"]').catch(() => errori.push('manca il pulsante copri tutte'));
  }
  if (S.fase === 'asta' && S.lotto && !fatte.has('asta') && S.lotto.migliore && S.nLotti > 3) {
    fatte.add('asta');
    await tv.screenshot({ path: `${OUT}/03_tv_asta.png` });
    await tel[0].screenshot({ path: `${OUT}/04_tel_asta.png` });
  }
  if (S.fase === 'asta' && S.lotto?.tipo === 'buio' && S.lotto.stato === 'aperto' && !fatte.has('buio')) {
    fatte.add('buio'); await tv.screenshot({ path: `${OUT}/05_tv_buio.png` });
  }
  // durante il mercato il primo telefono vende una carta al secondo
  if (S.mercato && !vendita) {
    const mia = await tel[0].$('#mie .carta');
    if (mia) {
      vendita = true;
      await tv.screenshot({ path: `${OUT}/06_tv_mercato.png` });
      await mia.click();
      await tel[0].waitForTimeout(300);
      const altri = await tel[0].$$('.scegli button');
      for (const a of altri) if ((await a.textContent()).includes('Giulia')) await a.click();
      await tel[0].click('[data-d="50"]');
      await tel[0].screenshot({ path: `${OUT}/07_tel_vendi.png` });
      await tel[0].click('#proponi');
      await tel[1].waitForSelector('#si', { timeout: 5000 }).catch(() => {});
      await tel[1].screenshot({ path: `${OUT}/08_tel_proposta.png` });
      await tel[1].click('#si').catch(() => {});
      await tel[1].waitForTimeout(700);
      await tel[1].screenshot({ path: `${OUT}/09_tel_arrivo.png` });
    }
  }
  if (S.fase === 'svela' && S.rosse?.svelate.length > 8 && !fatte.has('svela')) {
    fatte.add('svela');
    await tv.screenshot({ path: `${OUT}/10_tv_svela.png` });
    await tel[1].screenshot({ path: `${OUT}/11_tel_svela.png`, fullPage: true });
  }
  if (S.ev.some((e) => e.tipo === 'eliminata' && e.n === S.evn) && !fatte.has('elim')) {
    fatte.add('elim'); await tv.screenshot({ path: `${OUT}/12_tv_eliminata.png` });
  }
  if (S.fase === 'finale' && S.vincite.length && !fatte.has('vince')) {
    fatte.add('vince'); await tv.waitForTimeout(400); await tv.screenshot({ path: `${OUT}/13_tv_vittoria.png` });
  }
  for (const [i, t] of tel.entries()) {
    if (await t.$('.vittoria') && !fatte.has('vt' + i)) { fatte.add('vt' + i); await t.screenshot({ path: `${OUT}/14_tel_vittoria_${i}.png` }); await t.click('.vittoria button'); }
  }
  if (S.fase === 'fine') break;
  await tv.waitForTimeout(250);
}
await tv.waitForTimeout(1500);
await tv.screenshot({ path: `${OUT}/15_tv_fine.png` });
await tel[0].screenshot({ path: `${OUT}/16_tel_fine.png`, fullPage: true });
const S = await tv.evaluate(() => window.banditore.S);
// controlli di coerenza
const tot = Object.values(S.conti).reduce((a, c) => a + c.posta + c.aste, 0);
const premi = Object.values(S.conti).reduce((a, c) => a + c.premi, 0);
const scambi = Object.values(S.conti).reduce((a, c) => a + c.scambi, 0);
console.log('codice finale', S.codice, 'fase finale', S.fase, 'montepremi', S.montepremi, 'raccolto', tot, 'premi pagati', premi, 'riporto', S.rosse?.riporto, 'somma scambi', scambi);
console.log('vincite', JSON.stringify(S.vincite));
if (S.montepremi !== tot) errori.push('montepremi diverso dal raccolto');
if (premi + (S.rosse?.riporto || 0) !== tot) errori.push('premi + riporto diverso dal montepremi');
if (scambi !== 0) errori.push('gli scambi non si compensano');
const tutte = Object.keys(S.nere).length + S.mazzo.length;
console.log('carte assegnate/ritirate', Object.keys(S.nere).length);
console.log(errori.length ? 'ERRORI:\n' + errori.join('\n') : 'nessun errore');
await browser.close();
process.exit(errori.length ? 1 : 0);
