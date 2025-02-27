const crypto = require('crypto');

class Wallet {
  constructor(username) {
    if (!username) {
      throw new Error('Wallet must have a valid username');
    }

    this.username = username;
    const keys = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });

    this.publicKey = keys.publicKey;
    this.privateKey = keys.privateKey;
    this.balance = 0;
  }

  addFunds(amount) {
    if (amount <= 0) {
      throw new Error('Amount to add must be positive');
    }
    this.balance += amount;
  }

  toString() {
    return JSON.stringify(this);
  }
}

module.exports = Wallet;
