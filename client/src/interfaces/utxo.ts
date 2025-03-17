export interface UTXOInterface {
  id: string; // Unique identifier for the UTXO (e.g., transactionId + outputIndex)
  transactionId: string; // The transaction that created this UTXO
  outputIndex: number; // The index of this output in the transaction
  publicKey: string; // The owner of this UTXO
  amount: number; // The value of this UTXO
  spent: boolean; // Whether this UTXO has been spent or not
}
