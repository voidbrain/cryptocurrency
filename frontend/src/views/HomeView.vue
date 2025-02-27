<script setup lang="ts">
import { onMounted, ref } from 'vue';
import axios from 'axios';

const fromUser = ref('');
const toUser = ref('');
const value = ref('');
const amount = ref(0);
const balance = ref(0);
const publicKey = ref('');
const privateKey = ref('');
const marketPrice = ref(0);

const createWallet = async () => {
  try {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: 'RSA-PSS',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256',
      },
      true,
      ['sign', 'verify']
    );

    const privateKeyValue = await window.crypto.subtle.exportKey(
      "pkcs8",
      keyPair.privateKey
    );

    const privateKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(privateKeyValue)));
    privateKey.value = privateKeyBase64;

    const exportedPublicKey = await window.crypto.subtle.exportKey(
      "spki",
      keyPair.publicKey
    );

    const publicKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(exportedPublicKey)));
    publicKey.value = publicKeyBase64;

    const response = await axios.post('/api/wallet/create', {
      username: fromUser.value,
      publicKey: publicKey.value,
    });

    // Store the private key securely on the client side
    localStorage.setItem('privateKey', privateKey.value);

    console.log('Wallet created:', response.data);
  } catch (error) {
    console.error('Error creating wallet:', error);
  }
};

const addFunds = async () => {
  try {
    const response = await axios.post('/api/wallet/add-funds', {
      username: fromUser.value,
      amount: amount.value,
    });
    console.log('Funds added:', response.data);
  } catch (error) {
    console.error('Error adding funds:', error);
  }
};

const getWallet = async () => {
  try {
    const response = await axios.get(`/api/wallet/${fromUser.value}`);
    console.log('Wallet:', response.data);
  } catch (error) {
    console.error('Error getting wallet:', error);
  }
};

const getBalance = async () => {
  try {
    const response = await axios.get(`/api/wallet/${fromUser.value}/balance`);
    balance.value = response.data.balance;
    console.log('Balance:', response.data);
  } catch (error) {
    console.error('Error getting balance:', error);
  }
};

const getChainInstance = async () => {
  try {
    const response = await axios.get('/api/chain-instance');
    console.log('Chain instance:', response.data);
  } catch (error) {
    console.error('Error getting chain instance:', error);
  }
};

const sendTransaction = async () => {
  try {
    const response = await axios.post('/api/transaction/send', {
      from: fromUser.value,
      to: toUser.value,
      value: value.value,
    });
    console.log('Transaction sent:', response.data);
  } catch (error) {
    console.error('Error sending transaction:', error);
  }
};

onMounted(async () => {
  try {
    const response = await axios.get('/api/order/price');
    marketPrice.value = response.data.marketPrice;
  } catch (error) {
    console.error('Error fetching market price:', error);
  }
});
</script>

<template>
  <div>
    <h1>NodeCoin Dashboard</h1>
    <p>Current Market Price: €{{ marketPrice?.toFixed(2) }}</p>

    <div>
      <label for="fromUser">From:</label>
      <input id="fromUser" v-model="fromUser" type="text" />
    </div>
    <div>
      <label for="toUser">To:</label>
      <input id="toUser" v-model="toUser" type="text" />
    </div>
    <div>
      <label for="value">Value:</label>
      <input id="value" v-model="value" type="number" />
    </div>
    <div>
      <label for="amount">Amount:</label>
      <input id="amount" v-model="amount" type="number" />
    </div>
    <div>
      <button @click="createWallet">Create Wallet</button>
      <button @click="addFunds">Add Funds</button>
      <button @click="sendTransaction">Send Transaction</button>
      <button @click="getBalance">Check Balance</button>
    </div>
    <div>
      <p>Balance: {{ balance }}</p>
    </div>
    <div>
      <p>Public Key: {{ publicKey }}</p>
    </div>
    <div>
      <p>Private Key: {{ privateKey }}</p>
    </div>
  </div>
</template>

<style scoped>
h1 {
  text-align: center;
}

</style>
