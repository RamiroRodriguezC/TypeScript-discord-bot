import { REST, Routes } from 'discord.js';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import fs from 'node:fs';

import { CONFIG } from './config.js';
import { type BotCommand } from './types.js';

const { TOKEN, CLIENT_ID, GUILD_ID } = CONFIG;

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Array para acumular los comandos a registrar
const commandsData: object[] = [];

const foldersPath = join(__dirname, 'src', 'commands');

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
				commandsData.push(command.data.toJSON());
				console.log(`[OK] Comando encontrado: ${command.data.name}`);
			} else {
				console.log(`[WARNING] Comando en ${filePath} sin "data" o "execute".`);
			}
		}
	}
}

const rest = new REST().setToken(TOKEN);

try {
	console.log(`Registrando ${commandsData.length} comandos...`);

	const data = await rest.put(
		GUILD_ID
			? Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID) // instantáneo, solo en tu server
			: Routes.applicationCommands(CLIENT_ID),               // global, tarda hasta 1 hora
		{ body: commandsData }
	) as object[];

	console.log(`✅ ${data.length} comandos registrados en Discord.`);
} catch (error) {
	console.error(error);
}