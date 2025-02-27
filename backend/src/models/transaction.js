class Transaction {
  constructor(amount, senderPublicKey, receiverPublicKey) {
    if (amount <= 0) {
      throw new Error('Transaction amount must be positive');
    }
    if (!senderPublicKey || !receiverPublicKey) {
      throw new Error('Transaction must have valid sender and receiver public keys');
    }

    this.amount = amount;
    this.senderPublicKey = senderPublicKey;
    this.receiverPublicKey = receiverPublicKey;
  }

  toString() {
    return JSON.stringify(this);
  }
}

module.exports = Transaction;
