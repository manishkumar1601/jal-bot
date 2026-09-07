import express from 'express';
import { Client, GatewayIntentBits } from 'discord.js';

const GIF = 'gif/jal.gif';

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

client.login(process.env.DISCORD_TOKEN).catch(console.error);

const app = express();

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'API is working' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', bot: client.isReady() ? 'online' : 'offline' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API is working on port ${port}`));

export default app;
