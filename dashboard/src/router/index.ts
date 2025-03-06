import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import axios from 'axios';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },

];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

const fetchPeers = async () => {
  try {
    // TODO - Fetch peers from the backend
    const response = <any>[];
    const peers = response.data.peers;

  } catch (error) {
    console.error('Failed to get peers from central registry:', error);
    return [];
  }
};

// Fetch peers when the application initializes
fetchPeers().then(peers => {
  console.log('Peers:', peers);
  // You can store the peers in a global state or use them as needed
});

export default router;
