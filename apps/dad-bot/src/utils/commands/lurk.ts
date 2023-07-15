import tmi from 'tmi.js';

export async function lurkCommand({
  client,
  command,
  subCommand,
  channel,
  username,
}: {
  client: tmi.Client;
  command: string;
  subCommand?: string;
  channel: string;
  username: string;
}) {
  if (command === 'lurk') {
    /* !lurk */
    if (!subCommand || subCommand === 'on') {
      await client.say(
        channel,
        `👀 [@${username}]: is getting their head down and going into deep focus mode.`
      );
    } else if (subCommand === 'off') {
      await client.say(channel, `👀 [@${username}]: is back in the room.`);
    } else if (subCommand === 'help') {
      /* !lurk help */
      await client.say(
        channel,
        `❔ [@${username}]: Current subCommands: on, off.`
      );
    }
  }
}
