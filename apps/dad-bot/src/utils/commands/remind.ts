import tmi from 'tmi.js';
import { MINUTE } from '../twitchClientInstance';
import crypto from 'crypto';

type ReminderTimerType = {
  id: string;
  minutes: number;
  reminder: string;
  interval?: NodeJS.Timer;
};
const reminderTimers: Record<string, ReminderTimerType[]> = {};

export async function remindCommand({
  client,
  args,
  command,
  subCommand,
  channel,
  username,
}: {
  client: tmi.Client;
  args: string[];
  command: string;
  subCommand?: string;
  channel: string;
  username: string;
}) {
  if (command === 'remind') {
    /* !remind */
    if (!subCommand || subCommand === 'help') {
      await client.say(
        channel,
        `⏲️ [@${username}]: Current subCommands: me, remove, list, clear. Set a reminder for yourself in minutes. !remind me in <minutes> to <reminder>. e.g. !remind me in 10 to drink water!`
      );
    } else if (subCommand === 'me') {
      const [inWord, minutes, toWord, ...reminder] = args;
      const parsedMinutes = parseInt(minutes);
      const parsedReminder = reminder.join(' ');
      if (inWord !== 'in' || toWord !== 'to' || !parsedMinutes) {
        await client.say(
          channel,
          `⏲️ [@${username}]: The bot only supports minutes at the moment. To set a reminder use the command: !remind me in <minutes> to <reminder>. e.g. !remind me in 10 to drink water!`
        );
      } else if (reminderTimers[username]?.length >= 5) {
        await client.say(
          channel,
          `⏲️ [@${username}]: You've reached the maximum reminder limit. Please remove or wait for an existing reminder to finish before adding another.`
        );
      } else if (!parsedReminder) {
        await client.say(
          channel,
          `⏲️ [@${username}]: I don't think we need any reminders to do nothing :D what do you want reminding to do? !remind me in <minutes> to <reminder>`
        );
      }
      const id = crypto.randomBytes(3).toString('hex');
      const newTimer = {
        id,
        minutes: parsedMinutes,
        reminder: parsedReminder,
        interval: setTimeout(async () => {
          await client.say(
            channel,
            `⏲️ [@${username}]: Your timer to "${parsedReminder}" is up!`
          );
          const newTimers = reminderTimers[username].filter(
            (reminder) => reminder?.id !== id
          );
          reminderTimers[username] = newTimers;
        }, parsedMinutes * MINUTE),
      };
      reminderTimers[username] = [
        ...(reminderTimers[username] || []),
        newTimer,
      ];
      await client.say(
        channel,
        `    [@${username}]: Got it! I'll remind you in ${parsedMinutes}min(s) to "${parsedReminder}" (id: ${id})`
      );
    } else if (subCommand === 'list') {
      if ((reminderTimers[username] || [])?.length === 0) {
        await client.say(
          channel,
          `⏲️ [@${username}]: You currently have no reminders.`
        );
        return;
      }
      await client.say(
        channel,
        `⏲️ [@${username}]: Your current reminders are:`
      );
      reminderTimers[username]?.forEach(async (reminder) => {
        await client.say(
          channel,
          `    [${reminder?.id}]: to "${reminder?.reminder}"`
        );
      });
    } else if (subCommand === 'remove') {
      const [reminderId] = args;
      const matchedReminder = reminderTimers[username].find(
        (reminder) => reminder?.id === reminderId
      );
      if (!reminderId || !matchedReminder) {
        await client.say(
          channel,
          `⏲️ [@${username}]: please provide a valid reminder ID to remove. You can see your ids with !remind list`
        );
      } else if (matchedReminder) {
        clearTimeout(matchedReminder.interval);
        const newTimers = reminderTimers[username].filter(
          (reminder) => reminder?.id !== reminderId
        );
        reminderTimers[username] = newTimers;
        await client.say(
          channel,
          `⏲️ [@${username}]: timer ${reminderId} has been removed.`
        );
      }
    } else if (subCommand === 'clear') {
      reminderTimers[username].forEach((reminder) =>
        clearTimeout(reminder.interval)
      );
      reminderTimers[username] = [];
      await client.say(
        channel,
        `⏲️ [@${username}]: all timers have been removed.`
      );
    }
  }
}
