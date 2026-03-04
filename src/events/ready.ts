import { Events, type Client } from 'discord.js';
import { type BotEvent } from '../types.js';

const ready: BotEvent = {
	name: Events.ClientReady,
	once: true,
	execute(client: Client<true>) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};

export default ready;