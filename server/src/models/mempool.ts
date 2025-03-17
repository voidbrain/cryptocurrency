import { TransactionInterface } from "../interfaces/transaction.ts";
import DatabaseService from "../services/db/db"; // Ensure correct path
import crypto from "crypto";

export class Mempool {
  private db: DatabaseService;

  constructor(
    db: DatabaseService
  ) {
    this.db = db;
  }

  // Add a new transaction to the database
  async addTransaction(transaction: TransactionInterface): Promise<void> {
    try {
      await this.db.runQuery(
        `INSERT INTO mempool (transactionId, senderPublicKey, receiverPublicKey, amount, fee, signature, data)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          transaction.transactionId,
          transaction.senderPublicKey,
          transaction.receiverPublicKey,
          transaction.amount,
          transaction.fee,
          transaction.signature,
          transaction.data,
        ]
      );
    } catch (err) {
      throw new Error(`Failed to add transaction: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // Validate the transaction (e.g., checking the signature)
  isValid(): boolean {
    // Add your signature validation logic here
    return true;
  }

  // Add a transaction to the mempool
  async addToMempool(transaction: TransactionInterface): Promise<void> {
    await this.addTransaction(transaction);
  }

  // Retrieve all transactions currently in the mempool
  async getMempoolTransactions(): Promise<any[]> {
    try {
      return await this.db.runQuery(`SELECT * FROM mempool`);
    } catch (err) {
      throw new Error(`Failed to retrieve mempool transactions: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // Remove a transaction from the mempool after it's been added to a block
  async removeFromMempool(transactionId: string): Promise<void> {
    try {
      await this.db.runQuery(`DELETE FROM mempool WHERE transactionId = ?`, [transactionId]);
    } catch (err) {
      throw new Error(`Failed to remove transaction: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // Check if a transaction is currently in the mempool
  async isTransactionInMempool(transactionId: string): Promise<boolean> {
    try {
      const row = await this.db.runQuery(`SELECT 1 FROM mempool WHERE transactionId = ?`, [transactionId]);
      return row.length > 0;
    } catch (err) {
      throw new Error(`Failed to check transaction: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // Get the number of transactions currently in the mempool
  async getMempoolSize(): Promise<number> {
    try {
      const row = await this.db.runQuery(`SELECT COUNT(*) as count FROM mempool`);
      return row?.[0]?.count || 0;
    } catch (err) {
      throw new Error(`Failed to get mempool size: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // Clear the mempool
  async clearMempool(): Promise<void> {
    try {
      await this.db.runQuery(`DELETE FROM mempool`);
    } catch (err) {
      throw new Error(`Failed to clear mempool: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}

export default Mempool;
