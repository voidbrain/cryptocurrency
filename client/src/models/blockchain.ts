import type { BlockchainInterface } from "../interfaces/blockchain.ts";
import type { BlockInterface } from "../interfaces/block.ts";
// import { Wallet } from "./wallet";
// import { Block } from "./block";


export class Blockchain {
  // block: Block;

  constructor() {
    
    // this.block = new Block(db);
  }

  // Get the latest block from the chain
  getLatestBlock(chain: BlockInterface[]): BlockInterface {
    return chain[chain.length - 1];
  }

  // Add a new block to the chain
  async addBlock(blockchain: BlockchainInterface, block: BlockInterface): Promise<void> {
    
  }

  // // Validate the chain (check if the hashes are correct and match)
  // isChainValid(chain:BlockInterface[]): boolean {
  //   for (let i = 1; i < chain.length; i++) {
  //     const currentBlock = chain[i];
  //     const previousBlock = chain[i - 1];

  //     if (
  //       currentBlock.hash !== this.block.calculateHash() ||
  //       currentBlock.previousHash !== previousBlock.hash
  //     ) {
  //       return false;
  //     }
  //   }
  //   return true;
  // }

  // Get blockchain parameters
  // getBlockchainParams(): object {
  //   return {
  //     difficulty: this.difficulty,
  //     miningReward: this.miningReward,
  //     maxSupply: this.maxSupply,
  //     currentSupply: this.currentSupply,
  //   };
  // }


  // Get the current length of the blockchain
  getChainLength(blockchain:BlockchainInterface): number {
    return blockchain.chain.length;
  }

  // Get a block by its hash
  getBlockByHash(blockchain: BlockchainInterface, hash: string): BlockInterface | null {
    return blockchain.chain.find((block) => block.blockHash === hash) || null;
  }

  async getBlockchain() {
    const blockchain: BlockchainInterface =  {
      chain: [],
      maxSupply: 0,
      currentSupply: 0,
      mempool: []
    
    }
    return blockchain;
  }
}
