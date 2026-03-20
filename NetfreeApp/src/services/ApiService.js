import axios from 'axios';

// Emulateur Android → 10.0.2.2 = localhost du PC
// Vrai téléphone → remplace par l'IP locale de ton PC ex: 192.168.1.5
const BASE_URL = 'http://10.0.2.2:8000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

const ApiService = {
  async getUserStatus(userId) {
    const res = await api.get(`/users/${userId}/status`);
    return res.data;
  },

  async register(email, phone) {
    const res = await api.post('/users/register', { email, phone });
    return res.data;
  },

  async reportAdWatched(userId, mbGranted) {
    const res = await api.post('/ads/watched', { user_id: userId, mb_granted: mbGranted });
    return res.data;
  },

  async activateEsim(userId) {
    const res = await api.post('/esim/activate', { user_id: userId });
    return res.data;
  },
};

export default ApiService;
