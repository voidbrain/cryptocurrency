import { TransactionInterface } from "../interfaces/transaction.ts";
import DatabaseService from "../services/db/db"; // Ensure correct path
import crypto from "crypto";

export class Order {
  private db: DatabaseService

  constructor(
    db: DatabaseService
  ) {
    this.db = db
  }

  // Add a new transaction to the database
  async addTransaction(transaction: TransactionInterface): Promise<void> {
    try {
      await this.db.runQuery(
        `INSERT INTO transactions (transactionId, senderPublicKey, receiverPublicKey, amount, fee, signature, data)
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

  // Create an order for a transaction
  async createOrder(sender: string, receiver: string, amount: number, price: number): Promise<void> {
    try {
      await this.db.runQuery(
        `INSERT INTO orders (orderId, sender, receiver, amount, price, status) VALUES (?, ?, ?, ?, ?, ?)`,
        [crypto.randomUUID(), sender, receiver, amount, price, "active"]
      );
    } catch (err) {
      throw new Error(`Failed to create order: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // Match compatible buy/sell orders and initiate transactions
  async matchOrders(orderId: string): Promise<void> {
    try {
      // Implement logic for order matching
    } catch (err) {
      throw new Error(`Failed to match order: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // Cancel a previously created order
  async cancelOrder(orderId: string): Promise<void> {
    try {
      await this.db.runQuery(`UPDATE orders SET status = ? WHERE orderId = ?`, ["canceled", orderId]);
    } catch (err) {
      throw new Error(`Failed to cancel order: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // Retrieve the status of an order
  async getOrderStatus(orderId: string): Promise<string> {
    try {
      const row = await this.db.runQuery(`SELECT status FROM orders WHERE orderId = ?`, [orderId]);
      return row?.[0]?.status || "unknown";
    } catch (err) {
      throw new Error(`Failed to get order status: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // Retrieve all active orders
  async getActiveOrders(): Promise<any[]> {
    try {
      return await this.db.runQuery(`SELECT * FROM orders WHERE status = ?`, ["active"]);
    } catch (err) {
      throw new Error(`Failed to get active orders: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // Retrieve a user's order history
  async getOrderHistory(userId: string): Promise<any[]> {
    try {
      return await this.db.runQuery(`SELECT * FROM orders WHERE sender = ? OR receiver = ?`, [userId, userId]);
    } catch (err) {
      throw new Error(`Failed to get order history: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}

export default Order;
