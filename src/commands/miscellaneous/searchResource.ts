import {
    SlashCommandBuilder,
    EmbedBuilder,
    type ChatInputCommandInteraction,
    MessageFlags,
} from 'discord.js';
import { type BotCommand } from '../../types.js';

export const searchResource: BotCommand = {
    data: new SlashCommandBuilder()
        .setName('searchresource')
        .setDescription('Search shared resources by tags or description')
        .addStringOption(option =>
            option.setName('tags')
                .setDescription('Comma-separated tags to filter')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Search in description')
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('limit')
                .setDescription('Messages to scan (default: 100, max: 200)')
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(200)),

    async execute(interaction: ChatInputCommandInteraction) {
        const tagsRaw = interaction.options.getString('tags');
        const query = interaction.options.getString('query');
        const limit = interaction.options.getInteger('limit') ?? 100;

        if (!tagsRaw && !query) {
            await interaction.reply({
                content: 'You must provide at least one filter: tags or query.',
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        const searchTags = tagsRaw
            ? tagsRaw.split(',').map(t => t.trim().toLowerCase()).filter(t => t.length > 0)
            : [];

        await interaction.deferReply();

        const messages = await interaction.channel?.messages.fetch({ limit }) ?? new Map();
        const botMessages = [...messages.values()].filter(
            msg => msg.author.id === interaction.client.user.id
                && msg.embeds.length > 0
                && msg.embeds[0]?.title,
        );

        const maxResults = 25;
        const results: string[] = [];

        for (const msg of botMessages) {
            if (results.length >= maxResults) break;

            const embed = msg.embeds[0];
            if (!embed || !embed.title) continue;

            const titleLower = embed.title.toLowerCase();
            const matchesQuery = query ? titleLower.includes(query.toLowerCase()) : true;

            const tagsField = embed.fields?.find(
                (f: { name: string; value: string }) => f.name.includes('Tags'),
            );
            const tagsValue = tagsField ? tagsField.value.toLowerCase() : '';
            const matchesTags = searchTags.length > 0
                ? searchTags.some(t => tagsValue.includes(t))
                : true;

            if (matchesQuery && matchesTags) {
                results.push(`[${embed.title}](${msg.url})`);
            }
        }

        if (results.length === 0) {
            await interaction.editReply({ content: 'No resources found matching your filters.' });
            return;
        }

        const replyEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(`🔍 Found ${results.length} resource(s)`)
            .setDescription(results.join('\n'))
            .setFooter({ text: `Scanned last ${limit} messages` })
            .setTimestamp();

        await interaction.editReply({ embeds: [replyEmbed] });
    },
};