import { wss } from '../wsInstance';

const channelName = process.env.TWITCH_CHANNEL_NAME || '';

export async function adminCommands({
  args,
  command,
  subCommand,
  username,
}: {
  args: string[];
  command: string;
  subCommand?: string;
  username: string;
}) {
  if (
    ['say', 'pause', 'resume', 'effect'].includes(command) &&
    username === channelName
  ) {
    wss.clients.forEach((client) => {
      if (client.readyState === client.OPEN) {
        client.send(
          JSON.stringify({
            command: command,
            message: `${subCommand}${
              args?.length ? ` ${args?.join(' ')}` : ''
            }`,
          })
        );
      }
    });
  }
}
