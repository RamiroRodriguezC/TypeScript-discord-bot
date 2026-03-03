import 'dotenv/config';

// Validamos que las variables existan para que TS no se queje de tipos "undefined"
if (!process.env.DISCORD_TOKEN) throw new Error("Falta DISCORD_TOKEN en las variables de entorno");
if (!process.env.CLIENT_ID) throw new Error("Falta CLIENT_ID en las variables de entorno");
if (!process.env.GUILD_ID) console.warn("No se ha definido GUILD_ID. Los comandos pueden tardar hasta una hora en aparecer en Discord.");

export const CONFIG = {
    TOKEN: process.env.DISCORD_TOKEN,
    CLIENT_ID: process.env.CLIENT_ID,
    // Tip: Añade el ID de tu servidor de pruebas aquí para actualizaciones instantáneas
    GUILD_ID: process.env.GUILD_ID 
};