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
    ['Un applauso per {nome}, cliente affezionato!', 'saluta'],
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
    ['Bravo {nome}! {cifra}!', 'occhiolino'],
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
    ['{carta}! Vince {nome}: {cifra}! Bravissimo!', 'festeggia'],
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
