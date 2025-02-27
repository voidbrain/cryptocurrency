<template>
  <div>
    <h1>NodeCoin Dashboard</h1>
    <p>Current Market Price: {{ marketPrice }}</p>
    <LineChart :chartData="chartData" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import LineChart from '@/components/LineChart.vue';
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

const marketPrice = ref(0);
const chartData = ref<ChartData>({
  labels: [],
  datasets: [
    {
      label: 'NodeCoin Price',
      backgroundColor: '#f87979',
      data: [],
    },
  ],
});

const fetchMarketPrice = async () => {
  try {
    const response = await axios.get('/api/order/price');
    marketPrice.value = response.data.marketPrice;
    updateChartData(response.data.marketPrice);
  } catch (error) {
    console.error('Error fetching market price:', error);
  }
};

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    backgroundColor: string;
    data: number[];
  }[];
}

const updateChartData = (price: number): void => {
  const now: string = new Date().toLocaleTimeString();
  chartData.value.labels.push(now);
  chartData.value.datasets[0].data.push(price);

  if (chartData.value.labels.length > 10) {
    chartData.value.labels.shift();
    chartData.value.datasets[0].data.shift();
  }
};

onMounted(() => {
  fetchMarketPrice();
  setInterval(fetchMarketPrice, 5000); // Fetch market price every 5 seconds
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
