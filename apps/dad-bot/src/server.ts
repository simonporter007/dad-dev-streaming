import express from 'express';
import dotenv from 'dotenv';
import { v4 } from 'uuid';
import { axiosClient } from './utils/axiosInstance';
import { AxiosError } from 'axios';
import { connectTwitch } from './utils/twitchClientInstance';

dotenv.config();

export type SpotifyTokensType = typeof tokens;

const spotifyClientId = process.env.SPOTIFY_CLIENT_ID || 'not-found';
const spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET || 'not-found';
const twitchClientId = process.env.TWITCH_CLIENT_ID || 'not-found';
const twitchClientSecret = process.env.TWITCH_CLIENT_SECRET || 'not-found';
const serverBaseUrl = process.env.BASE_URL || 'http://localhost:5000';
const serverPort = serverBaseUrl.split(':')[2] || 5000;
const frontendBaseUrl =
  process.env.FRONTEND_BASE_URL || 'http://localhost:5173';
const tokens = {
  spotifyAccessToken: '',
  spotifyRefreshToken: process.env.SPOTIFY_REFRESH_TOKEN || '',
  twitchAccessToken: '',
  twitchRefreshToken: process.env.TWITCH_REFRESH_TOKEN || '',
  authToken: Buffer.from(`${spotifyClientId}:${spotifyClientSecret}`).toString(
    'base64'
  ),
};

const app = express();

/* SPOTIFY */
app.get('/auth/spotify/login', (req, res) => {
  if (tokens.spotifyRefreshToken) {
    return res.redirect(`/auth/spotify/refresh`);
  }
  const scope = 'user-read-currently-playing';
  const state = v4();

  const authQueryParameters = new URLSearchParams();
  authQueryParameters.append('response_type', 'code');
  authQueryParameters.append('client_id', spotifyClientId);
  authQueryParameters.append('scope', scope);
  authQueryParameters.append(
    'redirect_uri',
    `${frontendBaseUrl}/auth/spotify/callback`
  );
  authQueryParameters.append('state', state);

  res.redirect(
    `https://accounts.spotify.com/authorize/?${authQueryParameters.toString()}`
  );
});

app.get('/auth/spotify/callback', async (req, res) => {
  const code = req?.query?.code as string;
  const params = {
    code,
    redirect_uri: `${frontendBaseUrl}/auth/spotify/callback`,
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
    tokens.spotifyAccessToken = resp.data.access_token;
    tokens.spotifyRefreshToken = resp.data.refresh_token;
    res.redirect(frontendBaseUrl);
  }
});

app.get('/auth/spotify/refresh', async (req, res) => {
  const params = {
    refresh_token: tokens.spotifyRefreshToken,
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
    tokens.spotifyAccessToken = resp.data.access_token;
    res.redirect('/');
  }
});

/* TWITCH */
app.get('/auth/twitch/login', (req, res) => {
  if (tokens.twitchRefreshToken) {
    return res.redirect(`/auth/twitch/refresh`);
  }
  const scope = 'chat:edit chat:read';
  const state = v4();

  const authQueryParameters = new URLSearchParams();
  authQueryParameters.append('response_type', 'code');
  authQueryParameters.append('client_id', twitchClientId);
  authQueryParameters.append('scope', scope);
  authQueryParameters.append(
    'redirect_uri',
    `${frontendBaseUrl}/auth/twitch/callback`
  );
  authQueryParameters.append('state', state);

  res.redirect(
    `https://id.twitch.tv/oauth2/authorize?${authQueryParameters.toString()}`
  );
});

app.get('/auth/twitch/callback', async (req, res) => {
  const code = req?.query?.code as string;
  const error = req?.query?.error as string;

  if (error) {
    console.debug('Received error...', error);
    res.send(500);
  }

  const params = {
    client_id: twitchClientId,
    client_secret: twitchClientSecret,
    code,
    redirect_uri: `${frontendBaseUrl}/auth/twitch/callback`,
    grant_type: 'authorization_code',
  };

  const resp = await axiosClient.post(
    'https://id.twitch.tv/oauth2/token',
    new URLSearchParams(params)
  );

  if (resp.status === 200) {
    tokens.twitchAccessToken = resp.data.access_token;
    tokens.twitchRefreshToken = resp.data.refresh_token;
    res.redirect(frontendBaseUrl);
  }
});

app.get('/auth/twitch/refresh', async (req, res) => {
  const params = {
    client_id: twitchClientId,
    client_secret: twitchClientSecret,
    refresh_token: tokens.twitchRefreshToken,
    grant_type: 'refresh_token',
  };

  const resp = await axiosClient.post(
    'https://id.twitch.tv/oauth2/token',
    new URLSearchParams(params)
  );

  if (resp.status === 200) {
    tokens.twitchAccessToken = resp.data.access_token;
    res.redirect('/auth/twitch/connect');
  }
});

app.get('/auth/twitch/connect', async (req, res) => {
  try {
    if (!tokens.twitchAccessToken) {
      res.send({ code: 500, message: 'No access token - login first' });
    }
    const status = await connectTwitch({
      twitchAccessToken: tokens.twitchAccessToken,
    });
    console.log({ status });
    res.redirect('/');
  } catch (err) {
    res.sendStatus(500);
  }
});

/* API CALLS */
app.get('/auth/token', (req, res) => {
  res.json(tokens);
});

app.get('/api/player/currently-playing', async (req, res) => {
  try {
    const resp = await axiosClient.get(
      'https://api.spotify.com/v1/me/player/currently-playing',
      {
        headers: {
          Authorization: `Bearer ${tokens.spotifyAccessToken}`,
        },
      }
    );
    res.send(resp?.data);
  } catch (err) {
    console.log({ err });
    if ((err as AxiosError)?.response?.status === 401) {
      res.redirect('/auth/spotify/refresh');
    }
  }
});

app.listen(serverPort, () => {
  console.log(`Listening at ${serverBaseUrl}`);
});
