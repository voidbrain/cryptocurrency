import { ref, onMounted } from 'vue';
import axios from 'axios';

export function useChartData() {
  const chartData = ref({
    labels: [],
    datasets: [
      {
        label: 'NodeCoin Cap',
        backgroundColor: 'rgba(75,192,192,0.2)',
        borderColor: 'rgba(75,192,192,1)',
        data: [],
      },
      {
        label: 'Total Tokens',
        backgroundColor: 'rgba(153,102,255,0.2)',
        borderColor: 'rgba(153,102,255,1)',
        data: [],
      },
      {
        label: 'Available Tokens',
        backgroundColor: 'rgba(255,159,64,0.2)',
        borderColor: 'rgba(255,159,64,1)',
        data: [],
      },
    ],
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'minute',
          displayFormats: {
            minute: 'HH:mm',
          },
        },
      },
    },
  };

  const fetchChartData = async () => {
    try {
      const [nodeCoinCapResponse, totalTokensResponse, availableTokensResponse] = await Promise.all([
        axios.get('/api/history/nodeCoinCap'),
        axios.get('/api/history/totalTokens'),
        axios.get('/api/history/availableTokens'),
      ]);

      const nodeCoinCapData = nodeCoinCapResponse.data;
      const totalTokensData = totalTokensResponse.data;
      const availableTokensData = availableTokensResponse.data;

      chartData.value.labels = nodeCoinCapData.labels; // Assuming all APIs return the same labels
      chartData.value.datasets[0].data = nodeCoinCapData.data;
      chartData.value.datasets[1].data = totalTokensData.data;
      chartData.value.datasets[2].data = availableTokensData.data;
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  };

  onMounted(() => {
    fetchChartData();
  });

  return {
    chartData,
    chartOptions,
  };
}
