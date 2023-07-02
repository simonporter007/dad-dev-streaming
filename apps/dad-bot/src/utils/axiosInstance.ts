import axios from 'axios';

const axiosClient = axios.create();
const tokens = {
  spotifyAccessToken: '',
  twitchAccessToken: '',
};

// axiosClient.defaults.baseURL = 'https://api.spotify.com/v1/';
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
      tokens.spotifyAccessToken = res.data.access_token;
    }
    if (
      res.config.url === 'https://id.twitch.tv/oauth2/token' &&
      res.data.access_token
    ) {
      tokens.twitchAccessToken = res.data.access_token;
    }
    if (
      res.config.url === 'https://id.twitch.tv/oauth2/token' &&
      res.data.access_token
    ) {
      tokens.twitchAccessToken = res.data.access_token;
    }
    return res;
  },
  async (err) => {
    const originalConfig = err.config;
    if (
      originalConfig.url !== '/auth/spotify/refresh' &&
      !originalConfig.url.includes('twitch') &&
      err.response
    ) {
      // token expired
      if (
        err.response.status === 401 &&
        !originalConfig._retry &&
        err.response.message !== 'No token provided'
      ) {
        originalConfig._retry = true;
        try {
          const resp = await axiosClient.post('/auth/spotify/refresh');
          tokens.spotifyAccessToken = resp?.data?.accessToken;
          return axiosClient(originalConfig);
        } catch (_error) {
          tokens.spotifyAccessToken = '';
          return Promise.reject(_error);
        }
      }
      return Promise.reject(err);
    } else if (
      originalConfig.url !== '/auth/twitch/refresh' &&
      !originalConfig.url.includes('spotify') &&
      err.response
    ) {
      // token expired
      if (
        err.response.status === 401 &&
        !originalConfig._retry &&
        err.response.message !== 'No token provided'
      ) {
        originalConfig._retry = true;
        try {
          const resp = await axiosClient.post('/auth/twitch/refresh');
          tokens.twitchAccessToken = resp?.data?.accessToken;
          return axiosClient(originalConfig);
        } catch (_error) {
          tokens.twitchAccessToken = '';
          return Promise.reject(_error);
        }
      }
      return Promise.reject(err);
    } else if (
      originalConfig.url !== '/auth/twitch/refresh' &&
      !originalConfig.url.includes('spotify') &&
      err.response
    ) {
      // token expired
      if (
        err.response.status === 401 &&
        !originalConfig._retry &&
        err.response.message !== 'No token provided'
      ) {
        originalConfig._retry = true;
        try {
          const resp = await axiosClient.post('/auth/twitch/refresh');
          tokens.twitchAccessToken = resp?.data?.accessToken;
          return axiosClient(originalConfig);
        } catch (_error) {
          tokens.twitchAccessToken = '';
          return Promise.reject(_error);
        }
      }
      return Promise.reject(err);
    }
  }
);

export { axiosClient };
