<template>
  <div>
    <h1>NodeCoin Dashboard</h1>
    <p>Current Market Price: €{{ marketPrice?.toFixed(2) }}</p>
    <LineChart :chartData="chartData" :chartOptions="chartOptions" />
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

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import LineChart from '@/components/LineChart.vue';
import { useChartData } from '@/composables/useChartData';
import { getPeer } from '@/composables/peer';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

const fromUser = ref('');
const toUser = ref('');
const value = ref('');
const amount = ref(0);
const balance = ref(0);
const publicKey = ref('');
const privateKey = ref('');
const marketPrice = ref(0);
const peer = ref('');

const { chartData, chartOptions } = useChartData();

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

    const privateKeyValue = await window.crypto.subtle.exportKey(
      "pkcs8",
      keyPair.privateKey
    );

    const privateKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(privateKeyValue)));
    privateKey.value = privateKeyBase64;

    const publicKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(exportedPublicKey)));
    publicKey.value = publicKeyBase64;

    const balance = 0;

    const response = await axios.post(`${peer.value}/api/wallet/create`, {
      publicKey: publicKey.value,
      balance
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
    const response = await axios.post(`${peer.value}/api/wallet/add-funds`, {
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
    const response = await axios.get(`/api/wallet/get/${fromUser.value}`);
    console.log('Wallet:', response.data);
  } catch (error) {
    console.error('Error getting wallet:', error);
  }
};

const getBalance = async () => {
  try {
    const response = await axios.get(`/api/get/${fromUser.value}/balance`);
    balance.value = response.data.balance;
    console.log('Balance:', response.data);
  } catch (error) {
    console.error('Error getting balance:', error);
  }
};

const getChainInstance = async () => {
  try {
    const response = await axios.get(`${peer.value}/api/chain-instance`);
    console.log('Chain instance:', response.data);
  } catch (error) {
    console.error('Error getting chain instance:', error);
  }
};

const sendTransaction = async () => {
  try {
    const response = await axios.post(`${peer.value}/api/send`, {
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
    peer.value = await getPeer();

    const response = await axios.get(`${peer.value}/api/order/market-price`);
    marketPrice.value = response.data.marketPrice;
    // fetchChartData(marketPrice.value);
  } catch (error) {
    console.error('Error fetching market price:', error);
  }
});
</script>

<style scoped>
h1 {
  text-align: center;
}

div {
  height: 400px;
}
</style>
