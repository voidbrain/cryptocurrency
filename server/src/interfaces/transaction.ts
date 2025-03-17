import type { UTXOInterface } from './utxo.ts';

export interface TransactionInterface {
  transactionId: string;
  senderPublicKey: string | null;
  receiverPublicKey: string;
  amount: number;
  fee: number;
  inputs: UTXOInterface[];
  outputs: { publicKey: string; amount: number }[];
  timestamp: number;
  signature: string;
  data?: string;
}
