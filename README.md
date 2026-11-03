# Mercante in Fiera - la grande fiera di Natale

Versione digitale del classico gioco d'asta, pensata per giocare in famiglia:

- **la TV** (un iPad o un computer collegato al televisore) è il banco del **banditore virtuale**: mostra le carte,
  parla con la voce del browser, scandisce "e uno... e due... e tre! Aggiudicato!";
- **ogni ospite** inquadra il QR code con il telefono, scrive il nome ed è subito al banco: fa le offerte in euro,
  vede le sue carte, vende e compra dagli altri giocatori.

Si gioca qui: **https://tannoiser2.github.io/Mercante-in-fiera/** (sulla TV: *Apri il banco della TV*).

## Come si gioca

1. **Sala d'attesa** - la TV mostra il QR code e il codice di 4 lettere. Il banditore saluta chi arriva.
   Si possono cambiare le regole della casa: posta a testa, base d'asta, rilancio minimo, carte in regalo,
   numero di carte vincenti (automatico: 3-6 secondo i giocatori) e ritmo (calmo, normale, svelto).
2. **Regali** - ognuno versa la posta e riceve una carta in regalo dal mazzo nero.
3. **Asta** - il banditore mette all'asta le carte del mazzo nero:
   - **scoperte** (una o più carte che si vedono),
   - **coperte** (si sa quante sono ma non quali),
   - **al buio** (il sacco a sorpresa: non si sa né quali né quante).
   Dal telefono si offre con i pulsanti; ogni rilancio fa ripartire il conto. Al "tre!" le carte volano dalla TV
   verso il giocatore e atterrano sul suo telefono. Se nessuno offre, il banditore abbassa il prezzo; se proprio
   nessuno la vuole torna nel mazzo (alla seconda volta la tiene lui).
4. **Premi** - tutto quello che è entrato nel salvadanaio (poste + aste) diventa il montepremi, diviso sulle carte
   vincenti scelte a caso dal mazzo rosso e lasciate coperte.
5. **Svelamento** - il banditore scopre le carte rosse non vincenti una, due o tre alla volta: chi ha la carta uguale
   la perde (sul telefono la carta viene timbrata e cade via). Ogni tanto dà un **indizio** ("sto per scoprire un
   animale", "un posto famoso", "una carta col numero pari"...) e apre il **mercato**: per qualche secondo i giocatori
   si vendono e si comprano le carte dal telefono (tocca una tua carta per venderla, una carta degli altri per
   fare un'offerta). Si può trattare in qualunque momento, il mercato è il momento giusto.
6. **Finale** - restano le carte vincenti: si scoprono dal premio più piccolo al primo premio (con un ultimo mercato
   prima degli ultimi due). Sul telefono del vincitore esplode la schermata "HAI VINTO!". Un premio che non ha
   nessuno passa alla carta successiva.
7. **Conti** - la TV mostra per ciascuno posta, aste, scambi, premi e il **saldo** (quanto mettere o ritirare dal
   salvadanaio vero). Con "Un'altra partita!" si riparte con gli stessi giocatori.

Comandi sulla TV (in alto a sinistra, si vedono avvicinando il mouse/dito): **Pausa**, **Avanti** (salta l'attesa
in corso), **Voce** sì/no, **Schermo intero**. Se la TV si ricarica, *Riprendi la fiera* continua dal punto in cui era.

## Consigli per la serata

- iPad: Safari → Condividi → *Aggiungi alla schermata Home* (si apre a tutto schermo), poi AirPlay o cavo HDMI sulla TV
  con il volume alto. Il primo tocco su *Apri una nuova fiera* attiva la voce.
- **Voce del banditore**: è quella del dispositivo. Sull'iPad scarica una voce italiana di qualità (Impostazioni →
  Accessibilità → Contenuti letti ad alta voce → Voci → Italiano → una voce *Premium* o *Avanzata*, es. Luca),
  poi riapri il gioco: nella sala d'attesa, in "Regole della casa", si sceglie la voce, si prova e si regolano
  velocità e tono. Su un PC con Edge le voci *Online (Natural)* di Microsoft sono le più naturali.
- Tutti i telefoni devono essere online (Wi-Fi di casa o dati). Il gioco tiene lo schermo acceso.
- I soldi sono veri solo alla fine: il gioco tiene i conti e il saldo dice chi deve mettere e chi ritirare.

## Il banditore

Le 18 pose dell'avatar (saluta, indica, martello, sussurra, festeggia...) sono in `avatar/<posa>.webp`; `avatar/base.webp`
è lo sticker originale usato se una posa manca: l'elenco completo, con le descrizioni da passare a ChatGPT, è in [AVATAR_POSE.md](AVATAR_POSE.md).
Le battute sono in `js/frasi.js` (si possono aggiungere liberamente: `{nome}`, `{carta}`, `{cifra}`, `{k}`, `{indizio}`).

## Struttura

- `index.html`, `css/stile.css` - pagina unica: TV (`?tv`), telefono (`?s=CODICE`), pagina iniziale.
- `js/banditore.js` - il banditore: regole, asta, svelamento, premi, trattative (è l'unico che scrive lo stato).
- `js/tv.js` - lo schermo della TV e le animazioni; `js/giocatore.js` - il telefono.
- `js/dati.js` - le 40 carte (con le caratteristiche per gli indizi), soldi, ripartizione dei premi.
- `js/frasi.js` - le battute; `js/suoni.js` - suoni sintetizzati e voce.
- `js/rete.js` - Firebase Realtime Database (progetto condiviso della ludoteca, radice `mercante`) oppure,
  per le prove, schede dello stesso browser (`?rete=locale`).
- `carte/` - le carte scansionate (40 figure, dorso nero e dorso rosso), `carte/mini/` le miniature.
- `firebase/database.rules.json` - regole della radice `mercante`, da unire a quelle del progetto condiviso.
- `tools/controlla_glifi.py` - controlla che ogni carattere dei testi esista nei font.
- `tests/prova.mjs` - partita completa automatica: TV + 2 telefoni + 2 giocatori finti, con screenshot e controllo dei conti.

## Prove

```
python3 -m http.server 8765 &
node tests/prova.mjs screenshot          # serve playwright
python3 tools/controlla_glifi.py
```

Senza telefoni si può provare tutto da un solo computer: `?tv&rete=locale&bot=3` (tre giocatori finti) e, in altre
schede dello stesso browser, `?s=CODICE&rete=locale`.

## Pubblicazione

Il workflow `Pubblica` parte a mano (Actions → Pubblica → Run workflow) oppure con un commit che contiene `[pubblica]`.
Questo gioco resta su GitHub Pages pubblico (e non sulla ludoteca privata Cloudflare) perché gli ospiti devono poter
entrare dal telefono senza login.
