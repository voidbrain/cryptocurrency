import sqlite3 from 'sqlite3';

import type { BlockInterface } from "../../interfaces/block.ts";
import type { BlockchainInterface } from "../../interfaces/blockchain.ts";
import type { WalletInterface } from "../../interfaces/wallet.ts";
import type { UTXOInterface } from "../../interfaces/utxo.ts";
import type { TransactionInterface } from "../../interfaces/transaction.ts";

export class DatabaseService {
  private db: sqlite3.Database;

  constructor() {
    // Open a database connection
    const dbPath: string = 'server.db';
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
      } else {
        console.log('Connected to the database.');

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
        CREATE TABLE IF NOT EXISTS wallets (
          publicKey TEXT PRIMARY KEY,
          balance INTEGER DEFAULT 0
        );
      `);

      // Create a table for UTXOs (Unspent Transaction Outputs)
      this.db.run(`
        CREATE TABLE IF NOT EXISTS utxo (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          transactionId TEXT,
          address TEXT,
          amount INTEGER,
          spent INTEGER DEFAULT 0
        );
      `);

      // Create a table for transactions
      this.db.run(`
        CREATE TABLE IF NOT EXISTS transactions (
          transactionId TEXT PRIMARY KEY,
          senderPublicKey TEXT,
          receiverPublicKey TEXT,
          amount INTEGER,
          fee INTEGER,
          signature TEXT,
          data TEXT,
          timestamp INTEGER
        );
      `);
    });
  }

  // Function to run a query
  async runQuery(query: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.all(query, params, (err: ErrorCallback, rows: (BlockchainInterface[] | BlockInterface[] | WalletInterface[] | UTXOInterface[] | TransactionInterface[]) | undefined) => {
        if (err) {
          reject(err); // Reject the promise if there's an error
        } else {
          resolve(rows); // Resolve with the rows if query is successful
        }
      });
    });
  }

  // Close the database connection
  close() {
    this.db.close((err) => {
      if (err) {
        console.error('Error closing the database:', err.message);
      } else {
        console.log('Database connection closed.');
      }
    });
  }
  
}

export default DatabaseService;
