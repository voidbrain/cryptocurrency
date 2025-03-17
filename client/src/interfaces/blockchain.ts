import type { BlockInterface } from "./block.ts";
import type { TransactionInterface } from "./transaction.ts";

export interface BlockchainInterface {
  chain: BlockInterface[];
  maxSupply: number;
  currentSupply: number;
  mempool: TransactionInterface[];

}
