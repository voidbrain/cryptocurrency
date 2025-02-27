You can run multiple instances of the node server on different ports to simulate a decentralized network:

```shell
node src/index.js --port=3000
node src/index.js --port=3001
```

Register Peers
Each node should register its peers to communicate and share blocks. You can use the /register-peer endpoint to register peers:

```shell
curl -X POST http://localhost:3000/register-peer -H "Content-Type: application/json" -d '{"peer": "http://localhost:3001"}'
curl -X POST http://localhost:3001/register-peer -H "Content-Type: application/json" -d '{"peer": "http://localhost:3000"}'
```

Test the Consensus
You can test the consensus mechanism by mining new blocks on one node and ensuring they are propagated to other nodes:

```shell
curl -X POST http://localhost:3000/mine -H "Content-Type: application/json" -d '{"transaction": "Block data"}'
```

Check the blockchain on both nodes to ensure they are synchronized:

```shell
curl http://localhost:3000/blockchain
curl http://localhost:3001/blockchain
```
