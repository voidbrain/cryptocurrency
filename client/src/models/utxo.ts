import type { UTXOInterface } from "../interfaces/utxo.ts";

export class UTXO {

  constructor(
  ) {
  }

    // Add a UTXO (Unspent Transaction Output) to the wallet
  async addUTXO(address: string, transactionId: string, amount: number): Promise<void> {
    // try {
    //   await this.db.runQuery(
    //     "INSERT INTO utxo (address, transactionId, amount, spent) VALUES (?, ?, ?, 0)",
    //     [address, transactionId, amount]
    //   );
    // } catch (err) {
    //   throw new Error(`Error adding UTXO: ${err instanceof Error ? err.message : err}`);
    // }
  }

  // Spend a UTXO (mark it as spent)
  async spendUTXO(transactionId: string): Promise<void> {
    // try {
    //   await this.db.runQuery(
    //     "UPDATE utxo SET spent = 1 WHERE transactionId = ?",
    //     [transactionId]
    //   );
    // } catch (err) {
    //   throw new Error(`Error spending UTXO: ${err instanceof Error ? err.message : err}`);
    // }
  }

  // Validate the transaction (for example, checking the signature)
  isValid(): boolean {
    // TODO: Add signature validation logic
    return true;
  }

  // Create a new UTXO for a transaction
  async createUTXO(transactionId: string, address: string, amount: number): Promise<void> {
  //   try {
  //     await this.db.runQuery(
  //       `INSERT INTO utxos (transactionId, address, amount, spent) VALUES (?, ?, ?, ?)`,
  //       [transactionId, address, amount, 0] // 0 means unspent
  //     );
  //   } catch (err) {
  //     if (err instanceof Error) {
  //         throw new Error(`Failed to create UTXO: ${err.message}`);
  //     } else {
  //         throw new Error(`Failed to create UTXO: ${String(err)}`);
  //     }
  // }
  }

  // Retrieve all UTXOs for a given address
  async getUTXOs(address: string): Promise<UTXOInterface[]> {
  //   try {
  //     return await this.db.runQuery(
  //       `SELECT * FROM utxos WHERE address = ? AND spent = 0`, // Select only unspent UTXOs
  //       [address]
  //     );
  //   } catch (err) {
  //     if (err instanceof Error) {
  //         throw new Error(`Failed to get UTXO: ${err.message}`);
  //     } else {
  //         throw new Error(`Failed to get UTXO: ${String(err)}`);
  //     }
  // }
    return []
  }

  // Mark a UTXO as spent
  async markUTXOAsSpent(transactionId: string): Promise<void> {
  //   try {
  //     await this.db.runQuery(
  //       `UPDATE utxos SET spent = 1 WHERE transactionId = ?`,
  //       [transactionId]
  //     );
  //   } catch (err) {
  //     if (err instanceof Error) {
  //         throw new Error(`Failed to mark UTXO ss spent: ${err.message}`);
  //     } else {
  //         throw new Error(`Failed to mark UTXO ss spent: ${String(err)}`);
  //     }
  // }
  }

  // Retrieve all UTXOs associated with a transaction
  async getUTXOsForTransaction(transactionId: string): Promise<UTXOInterface[]> {
  //   try {
  //     return await this.db.runQuery(
  //       `SELECT * FROM utxos WHERE transactionId = ?`,
  //       [transactionId]
  //     );
  //   } catch (err) {
  //     if (err instanceof Error) {
  //         throw new Error(`Failed to get UTXOs for transaction: ${err.message}`);
  //     } else {
  //         throw new Error(`Failed to get UTXOs for transaction: ${String(err)}`);
  //     }
  // }
    return []
  }

  // Get the total sum of UTXOs for an address
  async getUTXOTotal(address: string): Promise<number> {
  //   try {
  //     const result = await this.db.runQuery(
  //       `SELECT SUM(amount) AS total FROM utxos WHERE address = ? AND spent = 0`,
  //       [address]
  //     );
  //     return result[0]?.total || 0;
  //   } catch (err) {
  //     if (err instanceof Error) {
  //         throw new Error(`Failed to get UTXO total: ${err.message}`);
  //     } else {
  //         throw new Error(`Failed to get UTXO total: ${String(err)}`);
  //     }
  // }
    return 0
  }
}

export default UTXO;
