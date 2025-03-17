import crypto from "crypto";
import type { BlockInterface } from "../interfaces/block.ts";
import type { TransactionInterface } from "../interfaces/transaction.ts";
import DatabaseService from "../services/db/db.ts"; // assuming db is an instance of your DB connector

export class Block {
  private db: DatabaseService;

  constructor(
    db: DatabaseService
  ) {
    this.db = db;
  }

   // Create the Genesis Block (the first block)
    createGenesisBlock(): BlockInterface {
      const block = {
        previousHash: "0",
        transactions: [],
        timestamp: Date.now(),
        nonce: 0,
        hash: "",
        difficulty: 0,
        miningReward: 0,
      }
      return block;
    }

  // Calculate the block's hash
  public calculateBlockHash(block:BlockInterface): string {
    return crypto
      .createHash("sha256")
      .update(block.previousHash + block.timestamp + JSON.stringify(block.transactions) + block.nonce)
      .digest("hex");
  }

  // Create a new block with a set of transactions
  async createBlock(transactions: TransactionInterface[], previousHash: string): Promise<BlockInterface> {
    const timestamp = Date.now();
    const block:BlockInterface = {previousHash, transactions, timestamp, nonce: 0, hash: "", difficulty: 0, miningReward: 0};
    
    // Store block in DB (example, you may want to store more data)
    await this.db.runQuery("INSERT INTO blocks (previousHash, timestamp, hash, nonce, transactions) VALUES (?, ?, ?, ?, ?)", [
      previousHash, timestamp, block.hash, block.nonce, JSON.stringify(transactions)
    ]);

    // For each transaction, store it in the transactions table
    for (const transaction of transactions) {
      await this.db.runQuery("INSERT INTO transactions (transactionId, senderPublicKey, receiverPublicKey, amount, fee, signature, blockHash) VALUES (?, ?, ?, ?, ?, ?, ?)", [
        transaction.transactionId,
        transaction.senderPublicKey,
        transaction.receiverPublicKey,
        transaction.amount,
        transaction.fee,
        transaction.signature,
        block.hash
      ]);
    }

    return block;
  }

  // Add a transaction to the block (to be stored in DB)
  addTransactionToBlock(transactions: TransactionInterface[], transaction: TransactionInterface): void {
    transactions.push(transaction);
  }

  // Verify the block (e.g., check the hash integrity)
  verifyBlock(hash:string, block:BlockInterface): boolean {
    return hash === this.calculateBlockHash(block);
  }

  // Retrieve transactions related to this block from the DB
  async getBlockTransactions(block:BlockInterface): Promise<TransactionInterface[]> {
    const result = await this.db.runQuery("SELECT * FROM transactions WHERE blockHash = ?", [block.hash]);
    return result.map((row: any) => ({
      transactionId: row.transactionId,
      senderPublicKey: row.senderPublicKey,
      receiverPublicKey: row.receiverPublicKey,
      amount: row.amount,
      fee: row.fee,
      signature: row.signature,
      data: row.data,
    }));
  }

  // Get the block's hash
  getBlockHash(block:BlockInterface): string {
    return block.hash;
  }
}

export default Block;
