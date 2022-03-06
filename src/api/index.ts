import axios, { AxiosInstance } from 'axios';

const axiosCatetin: AxiosInstance = axios.create({
  baseURL: process.env.CATETIN_BASEURL,
});

export { axiosCatetin };
