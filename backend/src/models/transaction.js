class Transaction {
  constructor(amount, fee, senderPublicKey, receiverPublicKey) {
    if (amount <= 0) {
      throw new Error('Transaction amount must be positive');
    }
    if (fee < 0) {
      throw new Error('Transaction fee must be non-negative');
    }
    if (!senderPublicKey || !receiverPublicKey) {
      throw new Error('Transaction must have valid sender and receiver public keys');
    }

    this.amount = amount;
    this.fee = fee;
    this.senderPublicKey = senderPublicKey;
    this.receiverPublicKey = receiverPublicKey;
  }

  toString() {
    return JSON.stringify(this);
  }
}

module.exports = Transaction;
