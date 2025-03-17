import { announce, DHT_PORT } from './services/dht.ts';
import { startTcpServer, TCP_PORT } from './services/tcpServer.ts';
import DatabaseService from './services/db/db.ts';
import { Block } from './models/block.ts';

const db = new DatabaseService();

// Start the DHT server and announce the TCP port
announce(TCP_PORT);

// Start the TCP server for DHT messages
startTcpServer(TCP_PORT);

const block = new Block(db);

// Create the genesis block
const genesisBlock = block.createGenesisBlock();
console.log('Genesis Block:', genesisBlock);
