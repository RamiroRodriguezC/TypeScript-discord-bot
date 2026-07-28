import { Events, type Message } from 'discord.js';
import { type BotEvent } from '../types.js';
import { buildChannelsList } from '../commands/miscellaneous/channels.js';

const PREFIX = 'dark!';

const messageCreate: BotEvent = {
	name: Events.MessageCreate,
	async execute(message: Message) {
		if (message.author.bot) return;
		if (!message.content.startsWith(PREFIX)) return;
		if (!message.guild) return;

		const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
		const commandName = args.shift()?.toLowerCase();

		if (commandName === 'channels') {
			const channel = message.channel;
			if (!('send' in channel)) return;
			const chunks = buildChannelsList(message.guild);
			if (chunks.length === 0) {
				await channel.send('No se encontraron canales.');
				return;
			}
			await channel.send(chunks[0]!);
			for (let i = 1; i < chunks.length; i++) {
				await channel.send(chunks[i]!);
			}
		}
	},
};

export default messageCreate;
