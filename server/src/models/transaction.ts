import crypto from "crypto";  // Assuming you want to use crypto for signing, etc.
import { TransactionInterface } from "../interfaces/transaction.ts";
import DatabaseService from "../services/db/db.ts"; // Assuming db is available here

export class Transaction {
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
      if (err instanceof Error) {
        throw new Error(`Failed to add transaction: ${err.message}`);
      } else {
        console.error('An unknown error occurred');
      }
      // throw new Error(`Failed to add transaction: ${err.message}`);
    }
  }

  // Validate the transaction (for example, checking the signature)
  isValid(transaction: TransactionInterface): boolean {
    // Add your signature validation logic here (e.g., verify with sender's public key)
    return true;  // You should implement the signature check or any other validation
  }

  // Create a new transaction
  createTransaction(
    senderPublicKey: string,
    receiverPublicKey: string,
    amount: number,
    fee: number,
    data: string 
  ): TransactionInterface {
    
    return {
      transactionId: crypto.randomUUID(), // Generate unique transaction ID
      senderPublicKey: senderPublicKey,
      receiverPublicKey: receiverPublicKey,
      amount: amount,
      fee: fee,
      signature: "",
      data: data || "", // Optional transaction metadata
      inputs: [],  // Include UTXO inputs
      outputs: [], // Include outputs
      timestamp: Date.now()
    };
  }

  // Sign the transaction with the sender's private key
  signTransaction(transaction: TransactionInterface, privateKey: string): void {
    // Use private key to sign the transaction (e.g., using crypto library)
    const sign = crypto.createSign('SHA256');
    sign.update(transaction.transactionId); // You can sign the entire transaction data
    sign.end();
    const signature = sign.sign(privateKey, 'hex');
    transaction.signature = signature;
  }

  // Verify the transaction (e.g., validate the signature)
  verifyTransaction(transaction: TransactionInterface): boolean {
    const verify = crypto.createVerify('SHA256');
    verify.update(transaction.transactionId);
    verify.end();
    const isValid = verify.verify(transaction.senderPublicKey as crypto.KeyLike | crypto.VerifyKeyObjectInput | crypto.VerifyPublicKeyInput | crypto.VerifyJsonWebKeyInput, transaction.signature, 'hex');
    return isValid;
  }

  // Add transaction to the mempool (for future mining)
  addTransactionToMempool(transaction: TransactionInterface): void {
    // You can implement a mempool by pushing to a global array or a database
    // For example, you can push it to an in-memory array like this:
    // mempool.push(transaction);
    console.log("Transaction added to mempool:", transaction.transactionId);
  }

  // Get transaction by its unique ID
  async getTransactionById(transactionId: string): Promise<TransactionInterface | null> {
    try {
      const row:TransactionInterface = await this.db.runQuery(
        `SELECT * FROM transactions WHERE transactionId = ?`,
        [transactionId]
      );
  
      if (row) {
        // Return the raw data that conforms to the TransactionInterface
        return {
          transactionId: row.transactionId,
          senderPublicKey: row.senderPublicKey,
          receiverPublicKey: row.receiverPublicKey,
          amount: row.amount,
          fee: row.fee,
          signature: row.signature,
          data: row.data,
          inputs: row.inputs || [],  // Assuming `inputs` and `outputs` are arrays
          outputs: row.outputs || [],
          timestamp: row.timestamp || Date.now(), // Default to current timestamp if not available
        };
      } else {
        return null; // No transaction found, return null
      }
    } catch (err) {
      // Handle any errors that may occur during the query
      throw new Error(`Failed to retrieve transaction: ${err instanceof Error ? err.message : err}`);
    }
  }
  

  // Calculate transaction fee (could be calculated differently depending on your structure)
  calculateTransactionFee(transaction: TransactionInterface): number {
    // For example, fee could be a fixed percentage of the amount
    return transaction.fee * 0.01;  // 1% fee (example)
  }

  // Check if the transaction is valid (check signature, inputs, and outputs)
  isTransactionValid(transaction: TransactionInterface): boolean {
    return this.isValid(transaction);  // Implement validation logic
  }
}

export default Transaction;
