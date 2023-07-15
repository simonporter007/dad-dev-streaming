import tmi from 'tmi.js';

const supportedCommands = ['pomo', 'lurk', 'music', 'remind'] as const;

export async function helpCommand({
  client,
  command,
  channel,
  username,
}: {
  client: tmi.Client;
  command: string;
  channel: string;
  username: string;
}) {
  if (command === 'commands' || command === 'help') {
    /* !commands or !help */
    await client.say(
      channel,
      `❔ [@${username}]: Current commands: ${supportedCommands
        .map((cmd) => `!${cmd}`)
        .join(', ')}. Try !<command> help, to see subcommands list.`
    );
  }
}
