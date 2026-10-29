import axios from 'axios'

const api = axios.create({
  baseURL: 'https://padam-traders.onrender.com',
  withCredentials: true,
})

export default api