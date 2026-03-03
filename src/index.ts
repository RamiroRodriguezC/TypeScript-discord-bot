import { 
	Client, 
	Events, 
	GatewayIntentBits, 
	Collection,
	MessageFlags  
} from 'discord.js';

import { type BotCommand } from './types.js';
import { CONFIG } from './config.js';

// ESM equivalents of __dirname
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { TOKEN, CLIENT_ID, GUILD_ID } = CONFIG;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection<string, BotCommand>();

const foldersPath = join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

	for (const file of commandFiles) {
		const filePath = join(commandsPath, file);
		// ESM equivalent of require()
		const commandModule = await import(filePath);

		// Commands can be exported as default or as named exports
		const commands: BotCommand[] = Object.values(commandModule);

		for (const command of commands) {
			if ('data' in command && 'execute' in command) {
				client.commands.set(command.data.name, command);
			} else {
				console.log(`[WARNING] A command at ${filePath} is missing "data" or "execute".`);
			}
		}
	}
}

client.once(Events.ClientReady, (readyClient) => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		}
	}
});

client.login(TOKEN);