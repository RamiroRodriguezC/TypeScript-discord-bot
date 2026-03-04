import { 
    SlashCommandBuilder, 
    type SlashCommandOptionsOnlyBuilder,
    type SlashCommandSubcommandsOnlyBuilder,
    type ChatInputCommandInteraction,
    type ClientEvents
} from 'discord.js';
import { Collection } from 'discord.js';
/**
 * INTERFACE: BotCommand
 * Usamos una unión de tipos para 'data'. Esto permite que el comando tenga:
 * 1. Solo opciones (.addStringOption, etc.)
 * 2. Solo subcomandos (.addSubcommand)
 * 3. O que sea el builder base.
 */
export interface BotCommand {
    data: 
          SlashCommandBuilder 
        | SlashCommandOptionsOnlyBuilder 
        | SlashCommandSubcommandsOnlyBuilder;

    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

export interface BotEvent {
    name: keyof ClientEvents;
    once?: boolean;
    execute: (...args: any[]) => void;
}
/**
 * MODULE AUGMENTATION:
 * Aquí le "avisamos" a TypeScript que, en este proyecto, 
 * la clase Client de discord.js tendrá una propiedad extra llamada 'commands'.
 */
declare module 'discord.js' {
    export interface Client {
        commands: Collection<string, BotCommand>;
    }
}

