import tmi from 'tmi.js';

export async function musicCommand({
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
  if (command === 'music') {
    /* !music */
    await client.say(
      channel,
      `🎶 [@${username}]: Currently streaming an eclectic mix of jazz, edm, house, and lo-fi throughout the week from Spotify.`
    );
  }
}
