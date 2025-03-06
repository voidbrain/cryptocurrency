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
  // TODO: Fetch peers from the backend
};

// Fetch peers when the application initializes
fetchPeers().then(peers => {
  console.log('Peers:', peers);
  // You can store the peers in a global state or use them as needed
});

export default router;
