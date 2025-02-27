<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';

const fromUser = ref('');
const toUser = ref('');
const value = ref('');
const amount = ref(0);
const balance = ref(0);
const publicKey = ref('');

const createWallet = async () => {
  try {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: "ECDSA",
        namedCurve: "P-256",
      },
      true,
      ["sign", "verify"]
    );

    const exportedPublicKey = await window.crypto.subtle.exportKey(
      "spki",
      keyPair.publicKey
    );

    const privateKey = await window.crypto.subtle.exportKey(
      "pkcs8",
      keyPair.privateKey
    );

    publicKey.value = btoa(String.fromCharCode(...new Uint8Array(exportedPublicKey)));

    const response = await axios.post('/api/create-wallet', {
      username: fromUser.value,
      publicKey: publicKey.value,
    });

    // Store the private key securely on the client side
    localStorage.setItem('privateKey', btoa(String.fromCharCode(...new Uint8Array(privateKey))));

    console.log('Wallet created:', response.data);
  } catch (error) {
    console.error('Error creating wallet:', error);
  }
};

const addFunds = async () => {
  try {
    const response = await axios.post('/api/add-funds', {
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
    const response = await axios.post('/api/send', {
      from: fromUser.value,
      to: toUser.value,
      value: value.value,
    });
    console.log('Transaction sent:', response.data);
  } catch (error) {
    console.error('Error sending transaction:', error);
  }
};
</script>

<template>
  <main>
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
      <button @click="getChainInstance">Get Chain Instance</button>
    </div>
    <div>
      <p>Balance: {{ balance }}</p>
    </div>
    <div>
      <p>Public Key: {{ publicKey }}</p>
    </div>
  </main>
</template>
