import axios from 'axios';

const API = axios.create({
  baseURL: 'https://remedial-task.onrender.com/api',
});

export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
