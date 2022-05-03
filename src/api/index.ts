import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosInstance } from 'axios';
import { store } from '../store';
import { logout } from '../store/features/authSlice';

const axiosCatetin: AxiosInstance = axios.create({
  baseURL: process.env.CATETIN_BASEURL,
});

axiosCatetin.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

axiosCatetin.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response.status === 403 && originalRequest.url === `/auth/token`) {
      await axiosCatetin.post(`/auth/logout`, {
        refreshToken: await AsyncStorage.getItem('refreshToken'),
      });
      store.dispatch(logout());

      return Promise.reject(error);
    }

    if (error.response.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      return axiosCatetin
        .post(`/auth/token`, {
          refreshToken,
        })
        .then(async (res) => {
          await AsyncStorage.setItem('accessToken', res.data.data);
          axiosCatetin.defaults.headers.common['Authorization'] = `Bearer ${await AsyncStorage.getItem('accessToken')}`;
          return axiosCatetin(originalRequest);
        });
    }
    return Promise.reject(error);
  },
);

export { axiosCatetin };
