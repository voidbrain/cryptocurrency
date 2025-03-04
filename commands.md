your backend server is running on http://localhost:3000.

- 1 Get the Blockchain

```sh
curl -X GET http://localhost:3000/blockchain
```

- 2 Mine a New Block
Assuming you have a block object with the necessary data:

```sh
curl -X POST http://localhost:3000/mine \
  -H "Content-Type: application/json" \
  -d '{
    "block": {
      "previousHash": "previousBlockHash",
      "timestamp": 1633024800000,
      "transactions": [
        {
          "amount": 50,
          "senderPublicKey": null,
          "receiverPublicKey": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAztroh5/CC1u39w4xzgVMW6JNMUXshRUgQYCmBqUlx2FDiY3dtQXgWzeaoTYRXY2zTveXwDVogWgAGhDYjQRXj8oqEs1zpAUp4Xr1FqnpWjLQkdxW++MqALk4A/9MELRkqJlSjcnSKBuoomOhfDIgUyLy97X2VsWf2W+Xr1sCrPvl7lMEcFaBqYFotXfWK4IEjNMYNRtdFPbtQPJEkSCEblu6fen9iikmW+Tpu9znpNnaJa0LWbyY4xsRxFKfUjEY24eq+nTqVkyjPSLJrPuQpLfjql5luZfFbg+2qeAPj/jHWCRskTFyqwJdBIsmXqm6PBrW+CAX0JiwhynBG9Jq0QIDAQAB"
        }
      ],
      "nonce": 12345,
      "hash": "currentBlockHash"
    }
  }'
```

- 3 Receive a Block from a Peer

```sh
curl -X POST http://localhost:3000/receive-block \
  -H "Content-Type: application/json" \
  -d '{
    "block": {
      "previousHash": "previousBlockHash",
      "timestamp": 1633024800000,
      "transactions": [
        {
          "amount": 50,
          "senderPublicKey": null,
          "receiverPublicKey": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAztroh5/CC1u39w4xzgVMW6JNMUXshRUgQYCmBqUlx2FDiY3dtQXgWzeaoTYRXY2zTveXwDVogWgAGhDYjQRXj8oqEs1zpAUp4Xr1FqnpWjLQkdxW++MqALk4A/9MELRkqJlSjcnSKBuoomOhfDIgUyLy97X2VsWf2W+Xr1sCrPvl7lMEcFaBqYFotXfWK4IEjNMYNRtdFPbtQPJEkSCEblu6fen9iikmW+Tpu9znpNnaJa0LWbyY4xsRxFKfUjEY24eq+nTqVkyjPSLJrPuQpLfjql5luZfFbg+2qeAPj/jHWCRskTFyqwJdBIsmXqm6PBrW+CAX0JiwhynBG9Jq0QIDAQAB"
        }
      ],
      "nonce": 12345,
      "hash": "currentBlockHash"
    }
  }'
```

- 4 Register a New Peer

```sh
curl -X POST http://localhost:3000/register-peer \
  -H "Content-Type: application/json" \
  -d '{
    "peer": "http://new-peer-address:3000"
  }'
```

- 5 Check if a Wallet Exists

```sh
curl -X GET http://localhost:3000/wallet-exists/MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAztroh5/CC1u39w4xzgVMW6JNMUXshRUgQYCmBqUlx2FDiY3dtQXgWzeaoTYRXY2zTveXwDVogWgAGhDYjQRXj8oqEs1zpAUp4Xr1FqnpWjLQkdxW++MqALk4A/9MELRkqJlSjcnSKBuoomOhfDIgUyLy97X2VsWf2W+Xr1sCrPvl7lMEcFaBqYFotXfWK4IEjNMYNRtdFPbtQPJEkSCEblu6fen9iikmW+Tpu9znpNnaJa0LWbyY4xsRxFKfUjEY24eq+nTqVkyjPSLJrPuQpLfjql5luZfFbg+2qeAPj/jHWCRskTFyqwJdBIsmXqm6PBrW+CAX0JiwhynBG9Jq0QIDAQAB
```

- 6 Get the List of Peers from the Central Registry

```sh
curl -X GET http://central-registry:4000/peers
```

- 7 Register a New Peer with the Central Registry

```sh
curl -X POST http://central-registry:4000/register-peer \
  -H "Content-Type: application/json" \
  -d '{
    "peer": "http://new-peer-address:3000"
  }'
```

- 8 Get Blockchain Parameters from the Central Registry

```sh
curl -X GET http://central-registry:4000/blockchain-params
```


WALLET

- 1 Create a Wallet

```sh
curl -X POST http://localhost:3000/wallet/create \
  -H "Content-Type: application/json" \
  -d '{
    "publicKey": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAztroh5/CC1u39w4xzgVMW6JNMUXshRUgQYCmBqUlx2FDiY3dtQXgWzeaoTYRXY2zTveXwDVogWgAGhDYjQRXj8oqEs1zpAUp4Xr1FqnpWjLQkdxW++MqALk4A/9MELRkqJlSjcnSKBuoomOhfDIgUyLy97X2VsWf2W+Xr1sCrPvl7lMEcFaBqYFotXfWK4IEjNMYNRtdFPbtQPJEkSCEblu6fen9iikmW+Tpu9znpNnaJa0LWbyY4xsRxFKfUjEY24eq+nTqVkyjPSLJrPuQpLfjql5luZfFbg+2qeAPj/jHWCRskTFyqwJdBIsmXqm6PBrW+CAX0JiwhynBG9Jq0QIDAQAB",
    "balance": 100
  }'
```

- 2 . Add Funds to a Wallet

```sh
curl -X POST http://localhost:3000/wallet/add-funds \
  -H "Content-Type: application/json" \
  -d '{
    "publicKey": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAztroh5/CC1u39w4xzgVMW6JNMUXshRUgQYCmBqUlx2FDiY3dtQXgWzeaoTYRXY2zTveXwDVogWgAGhDYjQRXj8oqEs1zpAUp4Xr1FqnpWjLQkdxW++MqALk4A/9MELRkqJlSjcnSKBuoomOhfDIgUyLy97X2VsWf2W+Xr1sCrPvl7lMEcFaBqYFotXfWK4IEjNMYNRtdFPbtQPJEkSCEblu6fen9iikmW+Tpu9znpNnaJa0LWbyY4xsRxFKfUjEY24eq+nTqVkyjPSLJrPuQpLfjql5luZfFbg+2qeAPj/jHWCRskTFyqwJdBIsmXqm6PBrW+CAX0JiwhynBG9Jq0QIDAQAB",
    "amount": 50
  }'
```

- 3 Get Wallet Information by Username

```sh
curl -X GET http://localhost:3000/wallet/get/username
```

- 4  Get Wallet Balance by Username

```sh
curl -X GET http://localhost:3000/wallet/get/username/balance
```

TRANSACTION
- 1 Send a Transaction

```sh
curl -X POST http://localhost:3000/transaction/send \
  -H "Content-Type: application/json" \
  -d '{
    "from": "senderUsername",
    "to": "receiverUsername",
    "value": 10,
    "signature": "transactionSignature",
    "data": "transactionData"
  }'
```

ORDERS

- 1 Create an order

```sh
curl -X POST http://localhost:3000/order/create \
  -H "Content-Type: application/json" \
  -d '{
    "type": "buy",
    "item": "NodeCoin",
    "amount": 100,
    "price": 50
  }'
```

- 2  Get All Orders

```sh
curl -X GET http://localhost:3000/order/all
```

- 3 Update Market Price

```sh
curl -X POST http://localhost:3000/order/update-market-price
```
