<template>
  <div>
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { Line } from 'vue-chartjs';
import type { PropType } from 'vue';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, TimeScale, type ChartData, type Point } from 'chart.js';
import 'chartjs-adapter-date-fns';

// Register the necessary components with ChartJS
ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, TimeScale);

const props = defineProps({
  chartData: {
    type: Object as PropType<ChartData<'line', (number | Point | null)[], unknown>>,
    required: true,
  },
  chartOptions: {
    type: Object,
    required: true,
  },
});
</script>

<style scoped>
div {
  height: 400px;
}
</style>
