import type { UTXOInterface } from "../interfaces/utxo.ts";
import type { WalletInterface } from "../interfaces/wallet.ts"
import crypto from "crypto";
import { UTXO } from "./utxo.ts";

export class Wallet {
  utxo:UTXO;
  
  constructor(
    utxo:UTXO
  ) {
    this.utxo = utxo;
  }

  // Generate a new wallet with key pair
  static generate(): WalletInterface {
    const keyPair = crypto.generateKeyPairSync("ec", {
      namedCurve: "secp256k1",
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
      publicKeyEncoding: { type: "spki", format: "pem" },
    });

    return {publicKey: keyPair.publicKey, privateKey: keyPair.privateKey};
  }

  // Get wallet balance by summing the unspent transaction outputs (UTXOs)
  async getBalance(publicKey:string): Promise<number> {
    const utxos: UTXOInterface[] = await this.utxo.getUTXOs(publicKey);
    return utxos.reduce((sum, utxo) => sum + utxo.amount, 0);
  }

  async updateWalletBalance(publicKey: string, amount: number): Promise<void> {
    // try {
    //   await this.db.runQuery(
    //     "UPDATE wallets SET balance = balance + ? WHERE publicKey = ?",
    //     [amount, publicKey]
    //   );
    // } catch (err) {
    //   throw new Error(`Error updating wallet balance: ${err instanceof Error ? err.message : err}`);
    // }
  }

  // Check if a wallet exists in the database
  async walletExists(publicKey: string): Promise<boolean> {
    // try {
    //   const query = "SELECT COUNT(*) as count FROM wallets WHERE publicKey = ?";
    //   const rows = await this.db.runQuery(query, [publicKey]);
    //   return rows[0].count > 0; // If count > 0, wallet exists
    // } catch (err) {
    //   throw new Error(`Error checking if wallet exists: ${err instanceof Error ? err.message : err}`);
    // }
    return true
  }

  // Create a new wallet in the database
  async createWallet(publicKey: string, initialBalance: number): Promise<void> {
    // try {
    //   await this.db.runQuery(
    //     "INSERT INTO wallets (publicKey, balance) VALUES (?, ?)",
    //     [publicKey, initialBalance]
    //   );
    // } catch (err) {
    //   throw new Error(`Error creating wallet: ${err instanceof Error ? err.message : err}`);
    // }
  }

  // Calculate the total unspent balance from UTXOs for a given address
  async getUnspentBalance(address: string): Promise<number> {
    const utxos: UTXOInterface[] = await this.utxo.getUTXOs(address);
    return utxos.reduce((sum, utxo) => sum + utxo.amount, 0);
  }

  checkWallet(id: number){

  }
}

export default Wallet;
