// Le battute del banditore. {nome} giocatore, {carta} figura, {cifra} soldi, {k} quante carte, {indizio}.
// Ogni frase ha la posa dell'avatar che la accompagna (vedi AVATAR_POSE.md).

export const FRASI = {
  benvenuto: [
    ['Benvenuti, benvenuti alla grande fiera di Natale! Inquadrate il codice e venite a sedervi al mio banco!', 'saluta'],
    ['Signore e signori, bambini e nonni: il Mercante in fiera apre i battenti! Prendete il telefono e inquadrate il codice!', 'saluta'],
  ],
  arrivo: [
    ['Benvenuto {nome}! Accomodati, che qui si fanno affari d\'oro!', 'saluta'],
    ['Ecco {nome}! Che bello vederti alla fiera!', 'occhiolino'],
    ['Arriva {nome}! Tenete d\'occhio il portafoglio!', 'ride'],
    ['Un applauso per {nome}, cliente di fiducia!', 'saluta'],
    ['Ciao {nome}! Ho già messo da parte qualcosa per te...', 'occhiolino'],
  ],
  inizio: [
    ['Si parte! La posta è di {cifra} a testa: mettetela nel salvadanaio e cominciamo!', 'soldi'],
    ['Pronti? La posta è {cifra} ciascuno. E adesso... che la fiera abbia inizio!', 'soldi'],
  ],
  regalo: [
    ['Per cominciare, un regalino a tutti, offerto dalla casa!', 'carta'],
  ],
  lottoScoperto1: [
    ['Ed ecco a voi... {carta}! Che meraviglia, signori!', 'carta'],
    ['Guardate che bellezza: {carta}! Si parte da {cifra}!', 'carta'],
    ['Metto all\'asta {carta}! Una carta così non capita tutti i giorni!', 'indica'],
    ['Signore e signori: {carta}! Base d\'asta {cifra}!', 'carta'],
    ['Chi si porta a casa {carta}? Partiamo da {cifra}!', 'indica'],
    ['Oh, oh, oh! Che regalo di Natale: {carta}!', 'ride'],
  ],
  lottoScopertoN: [
    ['Offerta speciale di Natale: {k} carte in un colpo solo! Base {cifra}!', 'carta'],
    ['Due piccioni con una fava... anzi, {k} carte con un\'offerta sola!', 'ride'],
  ],
  lottoCoperto: [
    ['Adesso facciamo i misteriosi: {k} carte coperte! Cosa ci sarà sotto?', 'busta'],
    ['{k} carte a faccia in giù! Le compri a scatola chiusa, come i regali sotto l\'albero!', 'occhiolino'],
    ['Attenzione: lotto coperto! Ci sono {k} carte, ma non vi dico quali!', 'sussurra'],
  ],
  lottoBuio: [
    ['E adesso... il sacco a sorpresa! Quante carte ci sono? Lo sa solo Babbo Natale!', 'busta'],
    ['Asta al buio! Non vi dico né quali né quante. Chi si fida del banditore?', 'sussurra'],
    ['Il sacco misterioso! Potrebbe esserci una carta, potrebbero essercene tante!', 'busta'],
  ],
  offerta: [
    ['{cifra} da {nome}!', 'indica'],
    ['{nome} offre {cifra}! Chi dice di più?', 'indica'],
    ['Ho {cifra} da {nome}! Si sale!', 'indica'],
    ['Grande {nome}! {cifra}!', 'occhiolino'],
    ['{cifra}! {nome} non si fa spaventare!', 'sorpreso'],
    ['{nome} rilancia: {cifra}!', 'indica'],
  ],
  conta1: [['{cifra} e uno...', 'conta1'], ['{cifra}, e uno!', 'conta1']],
  conta2: [['{cifra} e due...', 'conta2'], ['E due! Nessuno rilancia?', 'conta2'], ['{cifra} e due... ultima occasione!', 'conta2']],
  conta3: [['E tre! Aggiudicato!', 'martello']],
  aggiudicato: [
    ['Aggiudicato a {nome} per {cifra}!', 'martello'],
    ['Venduto a {nome}! Ottimo affare!', 'martello'],
    ['Va a {nome}! Che fiuto per gli affari!', 'occhiolino'],
    ['Complimenti {nome}, è tutto tuo!', 'martello'],
  ],
  scoperta: [
    ['Vediamo cosa si è portato a casa...', 'carta'],
    ['E nel sacco c\'era...', 'busta'],
  ],
  silenzio1: [
    ['Ma come, nessuno? Una carta così bella!', 'sorpreso'],
    ['Silenzio in sala... vi siete addormentati sul panettone?', 'ride'],
    ['Nessuno? Guardate che è un affare!', 'pensa'],
  ],
  ribasso: [
    ['Va bene, sono buono: la lascio a {cifra}!', 'triste'],
    ['Saldi di Natale: si parte da {cifra}!', 'soldi'],
  ],
  invenduto: [
    ['Niente da fare, torna nel mazzo. Ve la ripropongo più tardi!', 'triste'],
    ['Invenduta! La rimetto in fondo al mazzo.', 'triste'],
  ],
  ritirata: [
    ['Nessuno la vuole? Allora la tengo io per ricordo!', 'triste'],
  ],
  fineAsta: [
    ['L\'asta è chiusa! Nel salvadanaio ci sono {cifra}. Che bottino!', 'soldi'],
    ['Basta comprare! Il montepremi è di {cifra}!', 'soldi'],
  ],
  premi: [
    ['Ed ecco le {k} carte vincenti, coperte coperte! Sopra ci sono i premi.', 'carta'],
  ],
  svela: [
    ['Adesso si comincia a scoprire! Chi ha la carta uguale, la perde. Tenetevi forte!', 'indica'],
  ],
  annuncio1: [['Scopro una carta...', 'carta'], ['La prossima carta è...', 'carta']],
  annuncioN: [['Ne scopro {k} tutte insieme!', 'carta'], ['Questa volta {k} carte!', 'indica']],
  indizio: [
    ['Psst... sto per scoprire {indizio}!', 'sussurra'],
    ['Vi do un indizio: la prossima carta è {indizio}!', 'sussurra'],
    ['Occhio! Sta per uscire {indizio}... chi ce l\'ha trema!', 'sussurra'],
  ],
  mercato: [
    ['Mercato aperto! Avete {k} secondi per vendere, comprare e fare affari!', 'mercato'],
    ['Tempo di trattative! {k} secondi: chi vende? Chi compra?', 'mercato'],
    ['Si tratta! {k} secondi per scambiarvi le carte!', 'mercato'],
  ],
  mercatoChiuso: [['Mercato chiuso! Si torna a scoprire.', 'martello'], ['Basta trattare! Avanti!', 'martello']],
  eliminata: [
    ['Ahi ahi {nome}, {carta} se ne va!', 'triste'],
    ['Peccato {nome}! Saluta {carta}!', 'triste'],
    ['{carta}! Mi dispiace {nome}, sarà per la prossima!', 'triste'],
    ['{carta} ci lascia... coraggio {nome}!', 'triste'],
  ],
  nessuno: [
    ['{carta}! Non ce l\'ha nessuno, meno male!', 'ride'],
    ['{carta}: carta libera, nessun danno!', 'occhiolino'],
  ],
  finale: [
    ['Siamo rimasti con le carte vincenti! Adesso si fa sul serio...', 'pensa'],
    ['È il momento della verità: si scoprono le carte dei premi!', 'pensa'],
  ],
  ultimoMercato: [['Ultima occasione per trattare! {k} secondi!', 'mercato']],
  vince: [
    ['Il premio di {cifra} va a... {nome}! Con {carta}!', 'festeggia'],
    ['{carta}! Vince {nome}: {cifra}! Che fortuna!', 'festeggia'],
    ['Evviva {nome}! {carta} vale {cifra}!', 'festeggia'],
  ],
  vinceNessuno: [
    ['{carta}! Non ce l\'ha nessuno! Il premio passa alla prossima carta!', 'sorpreso'],
  ],
  vinceNessunoUltimo: [
    ['{carta}! Non ce l\'ha nessuno! Il premio resta nel salvadanaio per la prossima fiera!', 'sorpreso'],
  ],
  granPremio: [['E ora... il primo premio!', 'pensa']],
  fine: [
    ['Grazie a tutti e buon Natale dal vostro banditore!', 'saluta'],
    ['La fiera è finita! Buone feste a tutti!', 'saluta'],
  ],
  scambioProposto: [
    ['Trattativa in corso: {nome} vuole {carta}!', 'occhiolino'],
    ['Oh oh, si tratta! {nome} sta facendo un\'offerta!', 'indica'],
  ],
  scambioFatto: [
    ['Affare fatto! {carta} passa a {nome}!', 'martello'],
    ['Stretta di mano! {carta} cambia padrone: ora è di {nome}!', 'ride'],
  ],
  scambioNo: [['Niente da fare, trattativa saltata!', 'triste']],
};

// ------------------------------------------------------------------ battute in più
// (si aggiungono a quelle sopra; le categorie nuove le usa il banditore nei momenti giusti)
const ALTRE = {
  // vince due, tre, quattro lotti di fila
  doppietta: [
    ['Vai di doppietta, {nome}!', 'festeggia'],
    ['Doppietta per {nome}! Due lotti di fila, che appetito!', 'ride'],
    ['E sono due! {nome} fa doppietta!', 'indica'],
    ['{nome} non si ferma più: doppietta!', 'occhiolino'],
  ],
  tripletta: [
    ['Vai di tripletta, {nome}! Tre su tre!', 'festeggia'],
    ['Tripletta! {nome} si sta comprando tutta la fiera!', 'sorpreso'],
    ['Tre lotti di fila per {nome}! Chi ferma più {nome}?', 'ride'],
  ],
  poker: [
    ['Poker di {nome}! Quattro lotti di fila, che collezione!', 'sorpreso'],
    ['{nome} fa man bassa: {k} lotti di fila! Ma gli altri dormono?', 'ride'],
    ['Ancora {nome}! {k} di fila, preparo il carretto per portarle a casa!', 'festeggia'],
  ],
  // due giocatori che si rilanciano a vicenda
  duello: [
    ['È un duello tra {nome} e {altro}! {cifra}!', 'indica'],
    ['{nome} e {altro} non mollano! Siamo a {cifra}!', 'sorpreso'],
    ['Sfida all\'ultimo centesimo: {nome} rilancia a {cifra}!', 'indica'],
    ['{nome} contro {altro}, come a mezzogiorno di fuoco! {cifra}!', 'ride'],
  ],
  rilancioGrosso: [
    ['Rilancio da capogiro! {nome} offre {cifra}!', 'sorpreso'],
    ['Wow! {nome} spara {cifra} tutto in un colpo!', 'sorpreso'],
    ['{nome} non ha tempo da perdere: {cifra}!', 'indica'],
  ],
  prezzoAlto: [
    ['Si fa sul serio, signori: {cifra}!', 'soldi'],
    ['{cifra}! Questa carta vale più del panettone!', 'soldi'],
    ['A {cifra} questa carta entra nella storia della fiera!', 'sorpreso'],
  ],
  affare: [
    ['Affarone! {nome} la porta via a prezzo di partenza!', 'occhiolino'],
    ['Nessuno rilancia? {nome} fa l\'affare della serata!', 'ride'],
    ['A prezzo di saldo per {nome}!', 'soldi'],
  ],
  sfortunaDoppia: [
    ['Doppietta di sfortuna per {nome}! Mi dispiace tanto!', 'triste'],
    ['Peccato {nome}, un\'altra carta che se ne va!', 'triste'],
    ['{nome}, oggi la fortuna guarda dall\'altra parte... ma non è finita!', 'pensa'],
  ],
  sfortunaTripla: [
    ['Tripletta di sfortuna per {nome}! Una fetta di pandoro di consolazione, presto!', 'triste'],
    ['{nome} perde ancora! Coraggio, il vento gira!', 'triste'],
  ],
  maniVuote: [
    ['{nome} resta a mani vuote! Ma puoi sempre comprare dagli altri!', 'triste'],
    ['Niente più carte per {nome}... tratta, tratta, che non è finita!', 'mercato'],
  ],
  salvi: [
    ['Respirate: questa non era di nessuno!', 'ride'],
    ['Pericolo scampato per tutti!', 'occhiolino'],
  ],
  pochi: [
    ['Siamo rimasti in pochi con le carte in mano: {k} giocatori ancora in corsa!', 'pensa'],
    ['La tensione sale: solo {k} giocatori hanno ancora carte!', 'sussurra'],
  ],
};
for (const [k, l] of Object.entries(ALTRE)) FRASI[k] = (FRASI[k] || []).concat(l);

// più varietà nei momenti che si ripetono spesso
const VARIANTI = {
  offerta: [
    ['{nome} alza la mano: {cifra}!', 'indica'],
    ['Abbiamo {cifra}! Grazie {nome}!', 'occhiolino'],
    ['{cifra} da {nome}! Chi rilancia?', 'indica'],
    ['{nome} ci crede: {cifra}!', 'indica'],
    ['Ecco {nome} con {cifra}! Non è finita!', 'indica'],
    ['{cifra}! {nome} ha l\'occhio lungo!', 'occhiolino'],
  ],
  conta1: [['{cifra} uno...', 'conta1'], ['A {cifra}... e uno!', 'conta1'], ['E uno! Chi offre di più?', 'conta1']],
  conta2: [['E due! Ultima chiamata!', 'conta2'], ['{cifra} e due... chi tace acconsente!', 'conta2'], ['E due! Dopo non piangete!', 'conta2']],
  conta3: [['E tre! Aggiudicato!', 'martello'], ['E tre! Venduto!', 'martello'], ['E treee! Aggiudicato!', 'martello']],
  aggiudicato: [
    ['Aggiudicato a {nome} per {cifra}! Buon divertimento!', 'martello'],
    ['Il martello ha parlato: va a {nome}!', 'martello'],
    ['{nome} se la porta a casa per {cifra}!', 'occhiolino'],
    ['Venduto! {nome}, la carta vola sul tuo telefono!', 'indica'],
  ],
  lottoScoperto1: [
    ['Signori, guardate qui: {carta}! Base {cifra}!', 'carta'],
    ['Pezzo raro, pezzo bello: {carta}!', 'carta'],
    ['Ecco {carta}! La vorrei tenere io, ma ve la vendo!', 'occhiolino'],
    ['Arriva {carta}, fresca fresca di fiera!', 'carta'],
  ],
  silenzio1: [
    ['Tutto tace... come la notte di Natale!', 'sussurra'],
    ['Pronto? C\'è qualcuno? Ve la regalo quasi!', 'sorpreso'],
    ['Silenzio di tomba! Eppure è una bellezza!', 'pensa'],
  ],
  eliminata: [
    ['Oh no, {nome}! {carta} è stata scoperta!', 'triste'],
    ['{carta}! Ahimè {nome}, la devi lasciare!', 'triste'],
    ['Esce {carta}: un abbraccio a {nome}!', 'triste'],
  ],
  nessuno: [
    ['{carta}! Nessuno ce l\'ha, si va avanti!', 'occhiolino'],
    ['Ecco {carta}... non fa male a nessuno!', 'ride'],
  ],
  indizio: [
    ['Ve lo dico all\'orecchio: arriva {indizio}!', 'sussurra'],
    ['Indovinello: la prossima carta è {indizio}. Chi la teme?', 'sussurra'],
  ],
  vince: [
    ['Ed ecco {carta}! {nome} vince {cifra}! Applausi!', 'festeggia'],
    ['Fortuna sfacciata: {nome} si prende {cifra} con {carta}!', 'festeggia'],
  ],
  arrivo: [
    ['Avanti {nome}, c\'è posto per tutti!', 'saluta'],
    ['Oh, {nome}! Hai portato il portafoglio?', 'ride'],
  ],
  mercatoChiuso: [['Tempo scaduto! Chi ha venduto ha venduto!', 'martello']],
  scambioFatto: [['Bell\'affare! Ora {carta} è di {nome}!', 'occhiolino']],
};
for (const [k, l] of Object.entries(VARIANTI)) FRASI[k] = (FRASI[k] || []).concat(l);

export function frase(tipo, dati = {}) {
  const l = FRASI[tipo];
  const [t, posa] = l[Math.floor(Math.random() * l.length)];
  return { testo: riempi(t, dati), voce: riempiVoce(t, dati), posa };
}
export function riempi(t, d) {
  const s = t.replace(/\{(\w+)\}/g, (_, k) => (d[k] !== undefined ? d[k] : ''));
  // maiuscola a inizio frase e dopo ! ? .
  return s.replace(/(^|[.!?]\s+)([a-zàèéìòù])/g, (m, a, b) => a + b.toUpperCase());
}
// la stessa frase come va detta a voce (cifre in lettere)
export function riempiVoce(t, d) {
  return riempi(t, { ...d, cifra: d.cifraVoce ?? d.cifra, carta: d.cartaVoce ?? d.carta });
}
