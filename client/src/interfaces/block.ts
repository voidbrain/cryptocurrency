export interface BlockInterface {
  blockId: number;
  blockHash: string;
  previousBlockHash: string;
  merkleRoot: string;
  timestamp: number;
  difficulty: number;
  nonce: number;
  minerPublicKey: string;
  transactionCount: number;
  blockSize: number;
  reward: number;
  createdAt: number;
  updatedAt: number;
}
