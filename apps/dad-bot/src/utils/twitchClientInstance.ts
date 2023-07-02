import tmi from 'tmi.js';
import dotenv from 'dotenv';

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
const channelName = process.env.TWITCH_CHANNEL_NAME || '';
const userName = process.env.TWITCH_BOT_USERNAME || '';
const pomodoroTimers: Record<string, PomodoroTimerType> = {};
let client: tmi.Client;

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
    console.log({ args, command, subCommand });

    if (command === 'pomo') {
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
          `⏰ [@${tags.username}]: \`!pomo\` lets you create your own pomodoro timer. Commands are "start", "clear", "pause", and "resume".`
        );
        await client.say(
          channel,
          `⏰ [@${tags.username}]: For example, \`!pomo start 25 5\` will create a 25 minute timer with a 5 minute break. \`!pomo start 50 10 3\` will create a 50/10 timer and will run for 3 rounds.`
        );
      } else if (subCommand === 'clear') {
        /* !pomo clear */
        if (!pomodoroTimers[username]) {
          await client.say(
            channel,
            `⏰ [@${tags.username}]: You don't have a timer running. Use \`!pomo\ start <minutes of focus> <minutes of break> <optional: number of rounds>\` to start one.`
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
            `⏰ [@${tags.username}]: You don't have a timer running. Use \`!pomo\ start <minutes of focus> <minutes of break> <optional: number of rounds>\` to start one.`
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
            `⏰ [@${tags.username}]: You don't have a timer running. Use \`!pomo\ start <minutes of focus> <minutes of break> <optional: number of rounds>\` to start one.`
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
            `⏰ [@${tags.username}]: Did you forget an option? Try again, e.g. \`!pomo start 50 10 3\``
          );
        } else if (pomodoroTimers[username]) {
          await client.say(
            channel,
            `⏰ [@${tags.username}]: You already have a timer running. Use \`!pomo clear\` to remove it before starting a new one.`
          );
        } else {
          const [focusMinutes, breakMinutes, rounds = '0'] = args;
          const parsedFocusMinutes = parseInt(focusMinutes);
          const parsedBreakMinutes = parseInt(breakMinutes);
          const parsedRounds = parseInt(rounds);

          if (!parsedFocusMinutes) {
            await client.say(
              channel,
              `⏰ [@${tags.username}]: The focus and break times must be numbers. Try again with e.g. \`!pomo start 50 10\``
            );
            return;
          } else if (!parsedBreakMinutes) {
            await client.say(
              channel,
              `⏰ [@${tags.username}]: The focus and break times must be numbers. Try again with e.g. \`!pomo start 50 10\``
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
    }
  } catch (err) {
    console.log(err);
  }
}

function onConnectedHandler(addr: string, port: number) {
  console.log(`* Connected to ${addr}:${port}`);
}

async function connectTwitch({
  twitchAccessToken,
}: {
  twitchAccessToken: string;
}) {
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

  await client.connect();
  await client.join(channelName);

  return client.readyState();
}

//onMessageHandler('#dad_dev', { username: 'dad_dev' }, '!pomo start 1 1', false);

export { connectTwitch };
