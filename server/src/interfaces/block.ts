import type { TransactionInterface } from './transaction.ts';
// export interface BlockInterface {
//   previousHash: string;
//   timestamp: number;
//   transaction: any;  // You can define a more specific type for transaction, if needed
//   nonce: number;
//   hash: string;

//   calculateHash(): string;
//   mineBlock(difficulty: number): void;
//   getHash(): string;
// }

export interface BlockInterface {
  previousHash: string;
  timestamp: number;
  transactions: TransactionInterface[];
  nonce: number;
  hash: string;
  difficulty: number;
  miningReward: number;
}
