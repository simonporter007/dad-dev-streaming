import express from 'express';
import dotenv from 'dotenv';
import { v4 } from 'uuid';
import { axiosClient } from './utils/axiosInstance';
import { AxiosError } from 'axios';

dotenv.config();

export type SpotifyTokensType = typeof tokens;

const spotifyClientId = process.env.SPOTIFY_CLIENT_ID || 'not-found';
const spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET || 'not-found';
const port = 5000;
const tokens = {
  accessToken: '',
  refreshToken: '',
  authToken: Buffer.from(`${spotifyClientId}:${spotifyClientSecret}`).toString(
    'base64'
  ),
};

const app = express();

app.get('/auth/login', (req, res) => {
  const scope = 'user-read-currently-playing';
  const state = v4();

  const authQueryParameters = new URLSearchParams();
  authQueryParameters.append('response_type', 'code');
  authQueryParameters.append('client_id', spotifyClientId);
  authQueryParameters.append('scope', scope);
  authQueryParameters.append(
    'redirect_uri',
    'http://192.168.0.159:5000/auth/callback'
  );
  authQueryParameters.append('state', state);

  res.redirect(
    `https://accounts.spotify.com/authorize/?${authQueryParameters.toString()}`
  );
});

app.get('/auth/callback', async (req, res) => {
  const code = req?.query?.code as string;
  const params = {
    code,
    redirect_uri: 'http://192.168.0.159:5000/auth/callback',
    grant_type: 'authorization_code',
  };

  const resp = await axiosClient.post(
    'https://accounts.spotify.com/api/token',
    new URLSearchParams(params),
    {
      headers: {
        Authorization: `Basic ${tokens.authToken}`,
      },
    }
  );

  if (resp.status === 200) {
    tokens.accessToken = resp.data.access_token;
    tokens.refreshToken = resp.data.refresh_token;
    res.redirect('http://192.168.0.159:5173');
  }
});

app.get('/auth/refresh', async (req, res) => {
  const params = {
    refresh_token: tokens.refreshToken,
    grant_type: 'refresh_token',
  };

  const resp = await axiosClient.post(
    'https://accounts.spotify.com/api/token',
    new URLSearchParams(params),
    {
      headers: {
        Authorization: `Basic ${tokens.authToken}`,
      },
    }
  );

  if (resp.status === 200) {
    tokens.accessToken = resp.data.access_token;
    res.send({
      access_token: resp.data.access_token,
    });
  }
});

app.get('/auth/token', (req, res) => {
  res.json(tokens);
});

app.get('/api/player/currently-playing', async (req, res) => {
  try {
    const resp = await axiosClient.get(
      'https://api.spotify.com/v1/me/player/currently-playing',
      {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      }
    );
    res.send(resp?.data);
  } catch (err) {
    if ((err as AxiosError)?.response?.status === 401) {
      res.redirect('/auth/refresh');
    }
  }
});

app.listen(port, () => {
  console.log(`Listening at http://192.168.0.159:${port}`);
});
