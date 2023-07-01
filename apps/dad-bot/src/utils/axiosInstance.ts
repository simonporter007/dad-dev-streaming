import axios from 'axios';

const axiosClient = axios.create();
const tokens = {
  accessToken: '',
};

axiosClient.defaults.baseURL = 'https://api.spotify.com/v1/';
axiosClient.defaults.headers.common = {
  'Content-Type': 'application/x-www-form-urlencoded',
  Accept: 'application/json',
};

axiosClient.interceptors.response.use(
  (res) => {
    if (
      res.config.url === 'https://accounts.spotify.com/api/token' &&
      res.data.access_token
    ) {
      tokens.accessToken = res.data.access_token;
    }
    return res;
  },
  async (err) => {
    const originalConfig = err.config;
    if (originalConfig.url !== '/auth/refresh' && err.response) {
      // token expired
      if (
        err.response.status === 401 &&
        !originalConfig._retry &&
        err.response.message !== 'No token provided'
      ) {
        originalConfig._retry = true;
        try {
          const resp = await axiosClient.post('/auth/refresh');
          tokens.accessToken = resp?.data?.accessToken;
          return axiosClient(originalConfig);
        } catch (_error) {
          tokens.accessToken = '';
          return Promise.reject(_error);
        }
      }
      return Promise.reject(err);
    }
  }
);

export { axiosClient };
