import { 
	Client, 
	GatewayIntentBits, 
	Collection,
} from 'discord.js';

import { type BotCommand, type BotEvent } from './types.js';
import { CONFIG } from './config.js';

import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { TOKEN } = CONFIG;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection<string, BotCommand>();
const foldersPath = join(__dirname, 'commands');
// Solo procesa carpetas, ignora archivos sueltos
const commandFolders = fs.readdirSync(foldersPath).filter(folder =>
	fs.statSync(join(foldersPath, folder)).isDirectory()
);

for (const folder of commandFolders) {
	const commandsPath = join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));

	for (const file of commandFiles) {
		const filePath = join(commandsPath, file);
		const commandModule = await import(pathToFileURL(filePath).href);
		const commands: BotCommand[] = Object.values(commandModule);

		for (const command of commands) {
			if ('data' in command && 'execute' in command) {
				client.commands.set(command.data.name, command);
				console.log(`[OK] Comando cargado: ${command.data.name}`);
			} else {
				console.log(`[WARNING] Comando en ${filePath} sin "data" o "execute".`);
			}
		}
	}
}

// Loader de eventos
const eventsPath = join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.ts'));

for (const file of eventFiles) {
	const filePath = join(eventsPath, file);
	const eventModule = await import(pathToFileURL(filePath).href);
	const event: BotEvent = eventModule.default;

	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}

	console.log(`[OK] Evento cargado: ${event.name}`);
}

client.login(TOKEN);