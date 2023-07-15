import tmi from 'tmi.js';
import dotenv from 'dotenv';

import { getAllMessages, getMessageByName } from './dbinstance';
import { Message } from '../db/schema';
import { helpCommand } from './commands/help';
import { pomoCommand } from './commands/pomo';
import { lurkCommand } from './commands/lurk';
import { musicCommand } from './commands/music';
import { remindCommand } from './commands/remind';
import { adminCommands } from './commands/admin';
import { taskCommand } from './commands/task';

dotenv.config();

export const SECOND = 1 * 1000;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;
const channelName = process.env.TWITCH_CHANNEL_NAME || '';
const userName = process.env.TWITCH_BOT_USERNAME || '';
let client: tmi.Client;

function sayMessage({ name }: { name: Message['name'] }) {
  if (!name) return;

  const messageSettings = getMessageByName(name);
  if (!messageSettings.message) return;

  const { message: msg, interval, enabled } = messageSettings;
  setTimeout(async () => {
    if (enabled) {
      await client.say(channelName, msg);
    }
    sayMessage({ name });
  }, interval || 2 * HOUR);
}

async function setupTimers() {
  const messages = getAllMessages();
  messages?.forEach((message) => {
    sayMessage({ name: message?.name });
  });
}

async function onMessageHandler(
  channel: string,
  tags: Record<string, any>,
  message: string,
  self: boolean
) {
  if (self || !message.startsWith('!') || !tags?.username) return;

  try {
    const args = message.slice(1).split(' ');
    const command = args?.shift()?.toLowerCase();
    const subCommand = args?.shift()?.toLowerCase();
    const username = tags?.username;
    // console.log({ args, channelName, command, subCommand, self, tags });
    if (!command) return;

    helpCommand({ client, command, channel, username });
    pomoCommand({ client, args, command, subCommand, channel, username });
    lurkCommand({ client, command, subCommand, channel, username });
    musicCommand({ client, command, channel, username });
    remindCommand({ client, args, command, subCommand, channel, username });
    taskCommand({ client, args, command, subCommand, channel, username });
    adminCommands({ args, command, subCommand, username });
  } catch (err) {
    console.log(err);
  }
}

async function onConnectedHandler(addr: string, port: number) {
  console.log(`* Connected to ${addr}:${port}`);
  await setupTimers();
}

async function onDisconnectedHandler() {
  console.log(`* Disconnected!`);
}

async function connectTwitch({
  twitchAccessToken,
}: {
  twitchAccessToken: string;
}) {
  if (client && client.readyState() === 'OPEN') {
    return;
  }

  const opts = {
    identity: {
      username: userName,
      password: twitchAccessToken,
    },
    channels: [channelName],
  };

  client = new tmi.client(opts);
  client.on('message', onMessageHandler);
  client.on('connected', onConnectedHandler);
  client.on('disconnected', onDisconnectedHandler);

  await client.connect();
  await client.join(channelName);

  return client.readyState();
}

//onMessageHandler('#dad_dev', { username: 'dad_dev' }, '!pomo start 1 1', false);

export { connectTwitch };
