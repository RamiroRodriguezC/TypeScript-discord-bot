// src/commands/utility/ping.ts
import { type ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { type BotCommand } from '../../types.js';

export const ping: BotCommand = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),

    async execute(interaction: ChatInputCommandInteraction) {
        const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        await interaction.editReply(`Pong! ${latency}ms`);
    }
};

export const say: BotCommand = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Replies with your input!')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message to repeat')
                .setRequired(true)),

    async execute(interaction: ChatInputCommandInteraction) {
        const message = interaction.options.getString('message', true);
        await interaction.reply(message);
    }
};
