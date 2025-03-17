import type { UTXOInterface } from "./utxo.ts";

export interface TransactionInterface {
  transactionId: string;
  senderPublicKey: string;
  receiverPublicKey: string;
  inputs: UTXOInterface[];
  outputs: { publicKey: string; amount: number }[];
  amount: number;
  fee: number;
  timestamp: number;
  signature: string;
  data?: string;
}
