const crypto = require('crypto');

class Block {
  constructor(previousHash, transaction, timestamp = Date.now()) {
    this.previousHash = previousHash;
    this.transaction = transaction;
    this.timestamp = timestamp;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(this.previousHash + this.timestamp + JSON.stringify(this.transaction))
      .digest('hex');
  }

  getHash() {
    return this.hash;
  }

  toString() {
    return JSON.stringify(this);
  }
}

module.exports = Block;
