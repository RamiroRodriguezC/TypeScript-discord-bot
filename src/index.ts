// Importaciones de la librería discord.js
import { 
	Client, 
	Events, 
	GatewayIntentBits, 
	Collection ,
	REST, 
	Routes, 
	SlashCommandBuilder, 
	MessageFlags  
} from 'discord.js';

import { type BotCommand } from './types.js'; // Esto ahora funcionará perfecto
// Importamos desde el archivo de config, el json con las variables de entorno
import { CONFIG } from './config.js'; // Importante el .js al final por NodeNext
// Destructuring del CONFIG para tener variables más limpias
const {TOKEN, CLIENT_ID, GUILD_ID} = CONFIG;

// Importaciones de módulos nativos de Node.js con el prefijo node:
import fs from 'node:fs';
import path from 'node:path';


// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.

// Inicializamos la colección usando los tipos para que no den error de 'any'
client.commands = new Collection<string, BotCommand>();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

client.once(Events.ClientReady, (readyClient) => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});
// Log in to Discord with your client's token
client.login(TOKEN);

