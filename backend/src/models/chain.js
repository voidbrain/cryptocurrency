const Block = require('./block');
const Transaction = require('./transaction');

class Chain {
  static instance = new Chain();

  constructor() {
    this.chain = [new Block('', new Transaction(100, 'temp', 'temp'))];
  }

  getPreviousBlockHash() {
    console.log(this.chain);
    if (!this.chain || this.chain.length === 0) {
      throw new Error('Chain is empty');
    }

    const lastBlock = this.chain[this.chain.length - 1];
    if (!(lastBlock instanceof Block)) {
      throw new Error('Last block is not an instance of Block');
    }

    return lastBlock.getHash();
  }

  insertBlock(transaction) {
    if (!this.isValidTransaction(transaction)) {
      throw new Error('Invalid transaction');
    }

    const newBlock = new Block(this.getPreviousBlockHash(), transaction);

    if (this.isDuplicateBlock(newBlock)) {
      throw new Error('Duplicate block');
    }

    this.chain.push(newBlock);
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }

  isValidTransaction(transaction) {
    // Add your transaction validation logic here
    // For example, check if the transaction amount is positive
    return transaction.amount > 0;
  }

  isDuplicateBlock(newBlock) {
    // Check if the block already exists in the chain
    return this.chain.some(block => block.hash === newBlock.hash);
  }
}

module.exports = Chain;
