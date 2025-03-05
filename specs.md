# SPECS

Si ipotizza lo sviluppo di una crypto valuta (per comodità da ora nominata NodeCoin) basata su blockchain, il sistema comprende tutti gli elementi necessari per generare e validare operazioni e transazioni.

Il sistema è composto da:

- (almeno uno) Central Registry Server: si occupa di tener aggiornato l'elenco di Server di mining.
- (almeno uno) Mining Server: accetta transazioni e blocchi, effettua una validazione sui blocchi, mette a disposizione di miner, frontend e di altri Mining Server. Conserva in database la blockchain, pool, transazioni.
- (almeno uno) Client Miner: Associato ad un wallet, si occupa di minare nuovi blocchi e li sottopone ad un server per la validazione. Viene ricompensato in base alla fee delle transazioni presenti nel blocco + ricompensa coinbase.
- frontend utente: permette di generare un nuovo wallet, caricare (acquistare), vendere (tbd) NodeCoin ed inviarli ad un altro utente.
- frontend dashboard: admin, mostra stato e statistiche della blockchain.

## Flusso operativo
Le transazioni permettono di inviare NodeCoin fra utenti.
Vengono firmate dal mittente e il server effettua una prima validazione (esistenza dei wallet, disponibilità di NodeCoin, validità della firma)
Ogni transazione comprende importo in NodeCoin e una fee da destinare al miner (+ fee per il sistema)
Una volta accettata dal server, la transazione viene parcheggiata nel suo mempool.

Quando un miner inizia ad estrarre un nuovo blocco, richiede al server l'ultimo blocco validato per continuità + un certo numero di transazioni da mempool. Una volta calcolato, alle transazioni incluse viene aggiunta la transazione di ricompensa per il miner (coinbase). Il blocco viene inviato al server per validazione dell'hash calcolato ed il miner inizia con un nuovo blocco.
I blocchi calcolati vengono validati da un server (full node), le transazioni associate ad un blocco validato vengono quindi rimosse dalla mempool e salvate nella blockchain.
In caso di concorrenza vince il principio di longest chain, le transazioni del blocco non valida tornano in mempool.
Ogni blocco prevede un parametro Difficulty e Nonce, necessari per il Proof-of-Work puzzle.
Difficulty target – The required difficulty level for mining.
Nonce – A variable miners adjust to find a valid hash.

I nodi utilizzano un protocollo di broadcast P2P per inviare blocchi e transazioni a tutti gli altri nodi interessati.

## Market share

Il numero di NodeCoin disponibili equivale al numero di NodeCoin minati.
Un utente può inviare NodeCoin ad un altro utente oppure vendere o acquistare dal mercato.
NodeCoin prevede un sistema centralizzato di marketshare, dove il proprietario del sistema rappresenta il mercato.

NodeCoin value / € calcolato in base a ...
Fee coinbase: fee in NodeCoin per nuovo blocco minato (miner wallet)
Fee transaction: fee in NodeCoin assiciata ad ogni transazione (miner wallet)

## Structures

### blocks

| Field                     | Description                                                                 |
|---------------------------|-----------------------------------------------------------------------------|
| Version                   | Indicates the block format and protocol rules used.                         |
| Previous Block Hash       | Hash of the previous block, linking it to the chain.                        |
| Merkle Root               | A single hash representing all transactions in the block.                  |
| Timestamp                 | The time when the block was created.                                        |
| Nonce                     | A number miners adjust to find a valid block hash.                          |
| Difficulty Target         | The mining difficulty for the block.                                        |
| Block Size                | Total size of the block in bytes.                                           |
| Transaction Count         | Number of transactions included in the block.                               |
| Transactions              | List of all transactions in the block.                                      |
| Coinbase Transaction      | The first transaction, which creates new coins as a reward for the miner.    |

...

### Validation Steps

| Validation Step                                | Transaction Level | Block Level |
|------------------------------------------------|-------------------|-------------|
| Check digital signature                        | ✅                 | ✅           |
| Verify UTXO (double spending prevention)       | ✅                 | ✅           |
| Check transaction format                       | ✅                 | ✅           |
| Validate fees & balance                        | ✅                 | ✅           |
| Verify previous block hash                     | ❌                 | ✅           |
| Check Proof-of-Work (difficulty & nonce)       | ❌                 | ✅           |
| Validate coinbase transaction                  | ❌                 | ✅           |
| Ensure block follows longest chain             | ❌                 | ✅           |

