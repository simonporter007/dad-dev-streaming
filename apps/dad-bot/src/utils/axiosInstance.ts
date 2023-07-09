import axios from 'axios';

const axiosClient = axios.create();

// axiosClient.defaults.baseURL = 'https://api.spotify.com/v1/';
axiosClient.defaults.headers.common = {
  'Content-Type': 'application/x-www-form-urlencoded',
  Accept: 'application/json',
};

export { axiosClient };
