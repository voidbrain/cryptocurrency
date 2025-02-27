import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import axios from 'axios';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (About.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import('../views/AboutView.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

const fetchPeers = async () => {
  try {
    const response = await axios.get('http://central-registry:4000/peers');
    return response.data.peers;
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
