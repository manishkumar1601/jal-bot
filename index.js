import 'dotenv/config';
import express from 'express';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Client, GatewayIntentBits } from 'discord.js';

const GIF = fileURLToPath(new URL('gif/jal.gif', import.meta.url));

const client = new Client({
  // ponytail: no MessageContent intent - mentions are populated without it
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.once('clientReady', () => console.log(`online as ${client.user.tag}`));

client.on('messageCreate', (message) => {
  if (message.author.bot) return;
  if (!message.mentions.has(client.user)) return;
  message.reply({ files: [GIF] }).catch(console.error);
});

// ponytail: strip stray quotes/whitespace - dashboards paste them in silently
const raw = process.env.DISCORD_TOKEN ?? '';
const token = raw.trim().replace(/^["']|["']$/g, '');

let loginError = null;

if (!token) {
  loginError = 'DISCORD_TOKEN is not set';
  console.error(loginError);
} else {
  client.login(token).catch((err) => {
    loginError = `${err.code ?? err.name}: ${err.message}`;
    console.error(err);
  });
}

const app = express();

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'API is working' });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    bot: client.isReady() ? 'online' : 'offline',
    tag: client.user?.tag ?? null,
    guilds: client.guilds.cache.size,
    tokenSet: Boolean(process.env.DISCORD_TOKEN),
    gifFound: existsSync(GIF),
    loginError,
    // token shape only - never the value
    tokenLength: token.length,
    tokenParts: token ? token.split('.').length : 0,
    tokenNeededCleanup: raw !== token,
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API is working on port ${port}`));

export default app;
