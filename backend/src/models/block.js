const crypto = require('crypto');

class Block {
  constructor(previousHash, transaction, timestamp = Date.now(), nonce = 0) {
    this.previousHash = previousHash;
    this.timestamp = timestamp;
    this.transaction = transaction;
    this.nonce = nonce;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(this.previousHash + this.timestamp + JSON.stringify(this.transaction) + this.nonce)
      .digest('hex');
  }

  mineBlock(difficulty) {
    while (!this.hash.startsWith('0'.repeat(difficulty))) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
  }

  getHash() {
    return this.hash;
  }

  getHash() {
    return this.hash;
  }
}

module.exports = Block;
