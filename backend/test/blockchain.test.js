(async () => {
  const chai = await import('chai');
  const chaiHttp = await import('chai-http');
  const { expect } = chai.default;
  chai.default.use(chaiHttp.default);

  const Blockchain = require('../src/models/blockchain');
  const Block = require('../src/models/block');
  const app = require('../src/index'); // Assuming your Express app is exported from index.js

  describe('Blockchain', () => {
    let blockchain;

    beforeEach(() => {
      blockchain = new Blockchain();
    });

    it('should create a genesis block', () => {
      const genesisBlock = blockchain.chain[0];
      expect(genesisBlock).to.be.an.instanceof(Block);
      expect(genesisBlock.previousHash).to.equal('');
      expect(genesisBlock.transaction).to.deep.equal({ amount: 100, sender: 'genesis', receiver: 'genesis' });
    });

    it('should add a new block', () => {
      const transaction = { amount: 50, sender: 'Alice', receiver: 'Bob' };
      blockchain.addBlock(transaction);
      const latestBlock = blockchain.getLatestBlock();
      expect(latestBlock).to.be.an.instanceof(Block);
      expect(latestBlock.transaction).to.deep.equal(transaction);
    });

    it('should validate the blockchain', () => {
      const transaction1 = { amount: 50, sender: 'Alice', receiver: 'Bob' };
      const transaction2 = { amount: 30, sender: 'Bob', receiver: 'Charlie' };
      blockchain.addBlock(transaction1);
      blockchain.addBlock(transaction2);
      expect(blockchain.isChainValid(blockchain.chain)).to.be.true;
    });

    it('should invalidate a tampered blockchain', () => {
      const transaction1 = { amount: 50, sender: 'Alice', receiver: 'Bob' };
      const transaction2 = { amount: 30, sender: 'Bob', receiver: 'Charlie' };
      blockchain.addBlock(transaction1);
      blockchain.addBlock(transaction2);
      blockchain.chain[1].transaction = { amount: 100, sender: 'Alice', receiver: 'Bob' }; // Tamper with the blockchain
      expect(blockchain.isChainValid(blockchain.chain)).to.be.false;
    });
  });

  describe('Blockchain API', () => {
    it('should register a peer', (done) => {
      chai.default.request(app)
        .post('/register-peer')
        .send({ peer: 'http://localhost:3001' })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.peers).to.include('http://localhost:3001');
          done();
        });
    });

    it('should mine a new block', (done) => {
      chai.default.request(app)
        .post('/mine')
        .send({ transaction: { amount: 50, sender: 'Alice', receiver: 'Bob' } })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.transaction).to.deep.equal({ amount: 50, sender: 'Alice', receiver: 'Bob' });
          done();
        });
    });

    it('should get the blockchain', (done) => {
      chai.default.request(app)
        .get('/blockchain')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('array');
          done();
        });
    });
  });
})();
