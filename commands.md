BLOCKCHAIN

- 1 Get the Blockchain (OK)

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
          "receiverPublicKey": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyWf3wNQXa+gSl7RCrMJ1+C5jECQgR8Zn/vV7Uj6J8mJEo78/kTiNezgg9cLSAS4U3Iq9OoKPxJuxF9w5ddBIopsabMd+O7F2Dsl2togc1HsnaQg3gqXQZMMe6O5MbNlXaPKkCVThLH8hffTgoiauGILalrxoJPU56ocBX1JX0DI39Ixp1Whg1m3xzZ8vr5Pz56N649nX8/pob+JnDC3lVK7SVhsQ0zCIwOIlCSii9vzGWcmJpEK6GxJKdVeRwaue/Tivd+CdjO5BCSH70a2cczz1S6CgOr+CXLhkBDbN0HuVWGOvlfL3qS9pkETodDlynXzEmyibmf8t2JPK+pfwUwIDAQAB"
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
          "receiverPublicKey": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyWf3wNQXa+gSl7RCrMJ1+C5jECQgR8Zn/vV7Uj6J8mJEo78/kTiNezgg9cLSAS4U3Iq9OoKPxJuxF9w5ddBIopsabMd+O7F2Dsl2togc1HsnaQg3gqXQZMMe6O5MbNlXaPKkCVThLH8hffTgoiauGILalrxoJPU56ocBX1JX0DI39Ixp1Whg1m3xzZ8vr5Pz56N649nX8/pob+JnDC3lVK7SVhsQ0zCIwOIlCSii9vzGWcmJpEK6GxJKdVeRwaue/Tivd+CdjO5BCSH70a2cczz1S6CgOr+CXLhkBDbN0HuVWGOvlfL3qS9pkETodDlynXzEmyibmf8t2JPK+pfwUwIDAQAB"
        }
      ],
      "nonce": 12345,
      "hash": "currentBlockHash"
    }
  }'
```

- 4 Register a New Peer (OK)

```sh
curl -X POST http://localhost:3000/register-peer \
  -H "Content-Type: application/json" \
  -d '{
    "peer": "http://new-peer-address:3000"
  }'
```

- 5 Check if a Wallet Exists (OK)

```sh
curl -X GET http://localhost:3000/api/wallet/exists/MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyWf3wNQXa+gSl7RCrMJ1+C5jECQgR8Zn%2FvV7Uj6J8mJEo78%2FkTiNezgg9cLSAS4U3Iq9OoKPxJuxF9w5ddBIopsabMd+O7F2Dsl2togc1HsnaQg3gqXQZMMe6O5MbNlXaPKkCVThLH8hffTgoiauGILalrxoJPU56ocBX1JX0DI39Ixp1Whg1m3xzZ8vr5Pz56N649nX8%2Fpob+JnDC3lVK7SVhsQ0zCIwOIlCSii9vzGWcmJpEK6GxJKdVeRwaue%2FTivd+CdjO5BCSH70a2cczz1S6CgOr+CXLhkBDbN0HuVWGOvlfL3qS9pkETodDlynXzEmyibmf8t2JPK+pfwUwIDAQAB
```

- 6 Get the List of Peers from the Central Registry (OK)

```sh
curl -X GET http://central-registry:4000/peers
```

- 7 Register a New Peer with the Central Registry (OK)

```sh
curl -X POST http://central-registry:4000/register-peer \
  -H "Content-Type: application/json" \
  -d '{
    "peer": "http://new-peer-address:3000"
  }'
```

- 8 Get Blockchain Parameters (OK)

```sh
curl -X GET http://localhost:3000/blockchain-params
```


WALLET

- 1 Create a Wallet (OK)

```sh
curl -X POST http://localhost:3000/api/wallet/create \
  -H "Content-Type: application/json" \
  -d '{
    "publicKey": "777IIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyWf3wNQXa+gSl7RCrMJ1+C5jECQgR8Zn/vV7Uj6J8mJEo78/kTiNezgg9cLSAS4U3Iq9OoKPxJuxF9w5ddBIopsabMd+O7F2Dsl2togc1HsnaQg3gqXQZMMe6O5MbNlXaPKkCVThLH8hffTgoiauGILalrxoJPU56ocBX1JX0DI39Ixp1Whg1m3xzZ8vr5Pz56N649nX8/pob+JnDC3lVK7SVhsQ0zCIwOIlCSii9vzGWcmJpEK6GxJKdVeRwaue/Tivd+CdjO5BCSH70a2cczz1S6CgOr+CXLhkBDbN0HuVWGOvlfL3qS9pkETodDlynXzEmyibmf8t2JPK+pfwUwIDAQAB",
    "balance": 100
  }'
```

- 2 . Add Funds to a Wallet (OK)

```sh
curl -X POST http://localhost:3000/api/wallet/add-funds \
  -H "Content-Type: application/json" \
  -d '{
    "publicKey": "777IIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyWf3wNQXa+gSl7RCrMJ1+C5jECQgR8Zn/vV7Uj6J8mJEo78/kTiNezgg9cLSAS4U3Iq9OoKPxJuxF9w5ddBIopsabMd+O7F2Dsl2togc1HsnaQg3gqXQZMMe6O5MbNlXaPKkCVThLH8hffTgoiauGILalrxoJPU56ocBX1JX0DI39Ixp1Whg1m3xzZ8vr5Pz56N649nX8/pob+JnDC3lVK7SVhsQ0zCIwOIlCSii9vzGWcmJpEK6GxJKdVeRwaue/Tivd+CdjO5BCSH70a2cczz1S6CgOr+CXLhkBDbN0HuVWGOvlfL3qS9pkETodDlynXzEmyibmf8t2JPK+pfwUwIDAQAB",
    "amount": 50
  }'
```

TRANSACTION
- 1 Send a Transaction

```sh
curl -X POST http://localhost:3000/api/transaction/send \
  -H "Content-Type: application/json" \
  -d '{
    "from": "ZIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyWf3wNQXa+gSl7RCrMJ1+C5jECQgR8Zn/vV7Uj6J8mJEo78/kTiNezgg9cLSAS4U3Iq9OoKPxJuxF9w5ddBIopsabMd+O7F2Dsl2togc1HsnaQg3gqXQZMMe6O5MbNlXaPKkCVThLH8hffTgoiauGILalrxoJPU56ocBX1JX0DI39Ixp1Whg1m3xzZ8vr5Pz56N649nX8/pob+JnDC3lVK7SVhsQ0zCIwOIlCSii9vzGWcmJpEK6GxJKdVeRwaue/Tivd+CdjO5BCSH70a2cczz1S6CgOr+CXLhkBDbN0HuVWGOvlfL3qS9pkETodDlynXzEmyibmf8t2JPK+pfwUwIDAQAB",
    "to": "777IIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyWf3wNQXa+gSl7RCrMJ1+C5jECQgR8Zn/vV7Uj6J8mJEo78/kTiNezgg9cLSAS4U3Iq9OoKPxJuxF9w5ddBIopsabMd+O7F2Dsl2togc1HsnaQg3gqXQZMMe6O5MbNlXaPKkCVThLH8hffTgoiauGILalrxoJPU56ocBX1JX0DI39Ixp1Whg1m3xzZ8vr5Pz56N649nX8/pob+JnDC3lVK7SVhsQ0zCIwOIlCSii9vzGWcmJpEK6GxJKdVeRwaue/Tivd+CdjO5BCSH70a2cczz1S6CgOr+CXLhkBDbN0HuVWGOvlfL3qS9pkETodDlynXzEmyibmf8t2JPK+pfwUwIDAQAB",
    "value": 10,
    "signature": "transactionSignature",
    "data": "transactionData"
  }'
```

ORDERS

- 1 Create an order

```sh
curl -X POST http://localhost:3000/api/order/create \
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
curl -X GET http://localhost:3000/api/order/all (KO)
```

- 3 Update Market Price

```sh
curl -X POST http://localhost:3000/api/order/update-market-price
```

- 4 Get Market Price (OK)

```sh
curl -X GET http://localhost:3000/api/order/price
```
