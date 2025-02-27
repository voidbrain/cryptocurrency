<template>
  <div>
    <line :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import { Line } from 'vue-chartjs';

const props = defineProps({
  chartData: {
    type: Object,
    required: true,
  },
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
};
</script>

<style scoped>
div {
  height: 400px;
}
</style>
