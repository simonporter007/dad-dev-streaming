import tmi from 'tmi.js';
import dotenv from 'dotenv';
import { wss } from './wsInstance';
import { getAllMessages, getMessageByName } from './dbinstance';
import { Message } from '../db/schema';

dotenv.config();

type PomodoroTimerType = {
  focusMinutes: number;
  breakMinutes: number;
  maxRounds?: number;
  currentRound?: number;
  seconds?: number;
  onBreak?: boolean;
  running: boolean;
  interval?: NodeJS.Timer;
};

const SECOND = 1 * 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const channelName = process.env.TWITCH_CHANNEL_NAME || '';
const userName = process.env.TWITCH_BOT_USERNAME || '';
const supportedCommands = ['pomo', 'lurk', 'music'] as const;
const pomodoroTimers: Record<string, PomodoroTimerType> = {};
const messageTimers: Record<string, NodeJS.Timer> = {};
let client: tmi.Client;

function sayMessage({name}: {name: Message['name']}) {
  if (!name) return

  const messageSettings = getMessageByName(name)
  if (!messageSettings.message) return

  const { message: msg, interval } = messageSettings
  setTimeout(async () => {
        await client.say(
          channelName,
          msg
        );
        sayMessage({name})
      }, interval || 2 * HOUR)
}

async function setupTimers() {
  const messages = getAllMessages()
  messages?.forEach((message) => {
    sayMessage({name: message?.name})
  })
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
    if (!command) return

    if (command === 'commands' || command === 'help') {
      /* !commands or !help */
      await client.say(
        channel,
        `❔ [@${tags.username}]: Current commands: ${supportedCommands
          .map((cmd) => `!${cmd}`)
          .join(', ')}. Try !<command> help, to see subcommands list.`
      );
    } else if (command === 'pomo') {
      /* !pomo */
      if (!subCommand && !args?.length) {
        if (pomodoroTimers[username]) {
          await client.say(
            channel,
            `⏰ [@${tags.username}]: You have a ${
              pomodoroTimers[username].focusMinutes / MINUTE
            }/${pomodoroTimers[username].breakMinutes / MINUTE} timer running.`
          );
          return;
        }
        await client.say(
          channel,
          `⏰ [@${tags.username}]: !pomo lets you create your own pomodoro timer. Commands are "start", "clear", "pause", and "resume".`
        );
        await client.say(
          channel,
          `⏰ [@${tags.username}]: For example, !pomo start 25 5 will create a 25 minute timer with a 5 minute break. !pomo start 50 10 3 will create a 50/10 timer and will run for 3 rounds.`
        );
      } else if (subCommand === 'help') {
        /* !pomo help */
        await client.say(
          channel,
          `❔ [@${tags.username}]: Current subCommands: start, pause, resume, pause.`
        );
      } else if (subCommand === 'clear') {
        /* !pomo clear */
        if (!pomodoroTimers[username]) {
          await client.say(
            channel,
            `⏰ [@${tags.username}]: You don't have a timer running. Use !pomo start <minutes of focus> <minutes of break> <optional: number of rounds> to start one.`
          );
        } else {
          clearInterval(pomodoroTimers[username].interval);
          delete pomodoroTimers[username];
          await client.say(
            channel,
            `⏰ [@${tags.username}]: Your timer has been cleared.`
          );
        }
        return;
      } else if (subCommand === 'pause') {
        /* !pomo pause */
        if (!pomodoroTimers[username]) {
          await client.say(
            channel,
            `⏰ [@${tags.username}]: You don't have a timer running. Use !pomo start <minutes of focus> <minutes of break> <optional: number of rounds> to start one.`
          );
        } else {
          pomodoroTimers[username].running = false;
          await client.say(
            channel,
            `⏰ [@${tags.username}]: Your timer has been paused.`
          );
        }
        return;
      } else if (subCommand === 'resume') {
        /* !pomo resume */
        if (!pomodoroTimers[username]) {
          await client.say(
            channel,
            `⏰ [@${tags.username}]: You don't have a timer running. Use !pomo start <minutes of focus> <minutes of break> <optional: number of rounds> to start one.`
          );
        } else {
          pomodoroTimers[username].running = true;
          await client.say(
            channel,
            `⏰ [@${tags.username}]: Your timer has been resumed.`
          );
        }
        return;
      } else {
        /* !pomo start */
        if (args?.length < 2) {
          await client.say(
            channel,
            `⏰ [@${tags.username}]: Did you forget an option? Try again, e.g. !pomo start 50 10 3`
          );
        } else if (pomodoroTimers[username]) {
          await client.say(
            channel,
            `⏰ [@${tags.username}]: You already have a timer running. Use !pomo clear to remove it before starting a new one.`
          );
        } else {
          const [focusMinutes, breakMinutes, rounds = '0'] = args;
          const parsedFocusMinutes = parseInt(focusMinutes);
          const parsedBreakMinutes = parseInt(breakMinutes);
          const parsedRounds = parseInt(rounds);

          if (!parsedFocusMinutes) {
            await client.say(
              channel,
              `⏰ [@${tags.username}]: The focus and break times must be numbers. Try again with e.g. !pomo start 50 10`
            );
            return;
          } else if (!parsedBreakMinutes) {
            await client.say(
              channel,
              `⏰ [@${tags.username}]: The focus and break times must be numbers. Try again with e.g. !pomo start 50 10`
            );
            return;
          } else if (parsedFocusMinutes > 180) {
            await client.say(
              channel,
              `⏰ [@${tags.username}]: The maximum focus time is 180 minutes. Please try again.`
            );
            return;
          } else if (parsedBreakMinutes > 60) {
            await client.say(
              channel,
              `⏰ [@${tags.username}]: The maximum break time is 60 minutes. Please try again.`
            );
            return;
          }

          const newPomo = {
            focusMinutes: parsedFocusMinutes * MINUTE,
            breakMinutes: parsedBreakMinutes * MINUTE,
            maxRounds: parsedRounds,
            currentRound: 1,
            seconds: parsedFocusMinutes * MINUTE,
            onBreak: false,
            running: true,
            interval: setInterval(async () => {
              if (newPomo.running) {
                if (newPomo.seconds === 0) {
                  if (newPomo.onBreak) {
                    newPomo.seconds = newPomo.focusMinutes;
                    if (newPomo.currentRound + 1 > newPomo.maxRounds) {
                      clearInterval(newPomo.interval);
                      delete pomodoroTimers[username];
                      await client.say(
                        channel,
                        `⏰ [@${tags.username}]: 🏁 pomodoro timer finished. Great work today!`
                      );
                      return;
                    }
                    newPomo.currentRound += 1;
                  } else {
                    newPomo.seconds = newPomo.breakMinutes;
                  }
                  await client.say(
                    channel,
                    `⏰ [@${tags.username}]: ${
                      newPomo.onBreak ? '🛋️  break' : '📖 focus'
                    } finished. Now starting a ${
                      newPomo.onBreak
                        ? newPomo.focusMinutes / MINUTE
                        : newPomo.breakMinutes / MINUTE
                    } minute ${
                      newPomo.onBreak
                        ? `focus${
                            newPomo.maxRounds > 0
                              ? ` (${newPomo.currentRound} of ${newPomo.maxRounds})`
                              : ''
                          }`
                        : 'break'
                    }...`
                  );
                  newPomo.onBreak = !newPomo.onBreak;
                  return;
                } else {
                  newPomo.seconds -= SECOND;
                }
              }
            }, SECOND),
          };
          pomodoroTimers[username] = newPomo;

          await client.say(
            channel,
            `⏰ [@${
              tags.username
            }]: 🏃 ${focusMinutes}/${breakMinutes} pomodoro timer started. ${
              parsedRounds > 1 ? `Running for ${parsedRounds} rounds. ` : ''
            }Time to focus!`
          );
        }
      }
    } else if (command === 'lurk') {
      /* !lurk */
      if (!subCommand || subCommand === 'on') {
        await client.say(
          channel,
          `👀 [@${tags.username}]: is getting their head down and going into deep focus mode.`
        );
      } else if (subCommand === 'off') {
        await client.say(
          channel,
          `👀 [@${tags.username}]: is back in the room.`
        );
      } else if (subCommand === 'help') {
        /* !lurk help */
        await client.say(
          channel,
          `❔ [@${tags.username}]: Current subCommands: on, off.`
        );
      }
    } else if (command === 'music') {
      /* !music */
      await client.say(
        channel,
        `🎶 [@${tags.username}]: Currently streaming Lo-Fi Girl from Spotify. Find out more: https://lofigirl.com/`
      );
    } else if (['say', 'pause', 'resume'].includes(command) && tags.username === channelName) {
      wss.clients.forEach((client) => {
        if (client.readyState === client.OPEN) {
            client.send(JSON.stringify({command: command, message: `${subCommand}${args?.length? ` ${args?.join(' ')}` : ''}`}));
        }
      });
    }
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
  Object.values(messageTimers).forEach((timer) => {
    clearInterval(timer);
  });
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
