export interface BlockchainInterface {
  transactionId: string;
  senderPublicKey: string;
  receiverPublicKey: string;
  amount: number;
  fee: number;
  signature: string;
  timestamp: number;
  data: string;
  status: number; // 0 = unconfirmed, 1 = confirmed
  createdAt: number;
  updatedAt: number;
}
