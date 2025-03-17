import sqlite3 from "sqlite3";
import { BlockInterface } from "../../interfaces/block.ts";
import { BlockchainInterface } from "../../interfaces/blockchain.ts";
import { WalletInterface } from "../../interfaces/wallet.ts";
import { UTXOInterface } from "../../interfaces/utxo.ts";
import { TransactionInterface } from "../../interfaces/transaction.ts";

class DatabaseService {
  private db: sqlite3.Database;

  constructor() {
    // Open a database connection
    const dbPath: string = "client.db";
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error("Error opening database:", err.message);
      } else {
        console.log("Connected to the database.");

        // Create tables if they don't exist
        this.createTables();
      }
    });
  }

  // Function to create tables if they don't exist
  private createTables() {
    this.db.serialize(() => {
      // Create a table for wallets
      this.db.run(`
        CREATE TABLE IF NOT EXISTS blocks (
  blockId INTEGER PRIMARY KEY AUTOINCREMENT,
  blockHash TEXT UNIQUE,
  previousBlockHash TEXT,
  merkleRoot TEXT,
  timestamp INTEGER,
  difficulty INTEGER,
  nonce INTEGER,
  minerPublicKey TEXT,
  transactionCount INTEGER,
  blockSize INTEGER,
  reward INTEGER,
  createdAt INTEGER,
  updatedAt INTEGER
);
      `);

      // Create a table for UTXOs (Unspent Transaction Outputs)
      this.db.run(`
        CREATE TABLE IF NOT EXISTS mempool_transactions (
  transactionId TEXT PRIMARY KEY,
  senderPublicKey TEXT,
  receiverPublicKey TEXT,
  amount INTEGER,
  fee INTEGER,
  signature TEXT,
  timestamp INTEGER,
  data TEXT,
  status INTEGER DEFAULT 0,  -- 0 = unconfirmed, 1 = confirmed
  createdAt INTEGER,
  updatedAt INTEGER
);
      `);

      this.db.run(`
        CREATE TABLE IF NOT EXISTS mining_rewards (
  rewardId INTEGER PRIMARY KEY AUTOINCREMENT,
  blockId INTEGER,
  minerPublicKey TEXT,
  rewardAmount INTEGER,
  timestamp INTEGER,
  createdAt INTEGER,
  updatedAt INTEGER,
  FOREIGN KEY (blockId) REFERENCES blocks(blockId)
);
      `);

      this.db.run(`
        REATE TABLE IF NOT EXISTS miner_config (
  configId INTEGER PRIMARY KEY AUTOINCREMENT,
  difficulty INTEGER,
  blockReward INTEGER,
  networkId TEXT,
  updatedAt INTEGER
);
      `);

      this.db.run(`
        CREATE TABLE IF NOT EXISTS block_verification (
  verificationId INTEGER PRIMARY KEY AUTOINCREMENT,
  blockId INTEGER,
  status INTEGER DEFAULT 0, -- 0 = not verified, 1 = verified
  verifiedAt INTEGER,
  createdAt INTEGER,
  updatedAt INTEGER,
  FOREIGN KEY (blockId) REFERENCES blocks(blockId)
);
      `);

      // Create a table for transactions
      this.db.run(`
        CREATE TABLE IF NOT EXISTS transaction_pool (
  transactionId TEXT PRIMARY KEY,
  senderPublicKey TEXT,
  receiverPublicKey TEXT,
  amount INTEGER,
  fee INTEGER,
  signature TEXT,
  timestamp INTEGER,
  status INTEGER DEFAULT 0,  -- 0 = pending, 1 = confirmed
  createdAt INTEGER,
  updatedAt INTEGER
);
      `);
    });
  }

  // Function to run a query
  async runQuery(query: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.all(
        query,
        params,
        (
          err: ErrorCallback,
          rows:
            | (
                | BlockchainInterface[]
                | BlockInterface[]
                | WalletInterface[]
                | UTXOInterface[]
                | TransactionInterface[]
              )
            | undefined
        ) => {
          if (err) {
            reject(err); // Reject the promise if there's an error
          } else {
            resolve(rows); // Resolve with the rows if query is successful
          }
        }
      );
    });
  }

  // Close the database connection
  close() {
    this.db.close((err) => {
      if (err) {
        console.error("Error closing the database:", err.message);
      } else {
        console.log("Database connection closed.");
      }
    });
  }
}

export default DatabaseService;
