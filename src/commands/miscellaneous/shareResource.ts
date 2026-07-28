import {
    SlashCommandBuilder,
    EmbedBuilder,
    AttachmentBuilder,
    type ChatInputCommandInteraction,
    MessageFlags,
} from 'discord.js';
import { type BotCommand } from '../../types.js';

export const shareResource: BotCommand = {
    data: new SlashCommandBuilder()
        .setName('shareresource')
        .setDescription('Save a resource to the chat (media, file, link, or text)')
        .addStringOption(option =>
            option.setName('title')
                .setDescription('Title of the resource')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('tags')
                .setDescription('Comma-separated tags (e.g. programacion, desarrollo web, tutorial)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('description')
                .setDescription('Description or notes about the resource')
                .setRequired(false))
        .addAttachmentOption(option =>
            option.setName('media')
                .setDescription('Image or video to share')
                .setRequired(false))
        .addAttachmentOption(option =>
            option.setName('file')
                .setDescription('File to share (PDF, ZIP, etc.)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('url')
                .setDescription('Link URL')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('text')
                .setDescription('Plain text content')
                .setRequired(false)),

    async execute(interaction: ChatInputCommandInteraction) {
        const title = interaction.options.getString('title', true);
        const description = interaction.options.getString('description');
        const tagsRaw = interaction.options.getString('tags', true);
        const media = interaction.options.getAttachment('media');
        const file = interaction.options.getAttachment('file');
        const url = interaction.options.getString('url');
        const text = interaction.options.getString('text');

        if (!media && !file && !url && !text) {
            await interaction.reply({
                content: 'You must provide at least one of: media, file, url, or text.',
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        const tags = tagsRaw.split(',').map(t => t.trim()).filter(t => t.length > 0);

        const type = media ? 'media' : file ? 'file' : url ? 'link' : 'text';
        const emojis = { media: '📷', file: '📎', link: '🔗', text: '📝' } as const;
        const colors = { media: 0x00FF00, file: 0xFFA500, link: 0x0099FF, text: 0x9900FF } as const;

        const embed = new EmbedBuilder()
            .setColor(colors[type])
            .setTitle(`${emojis[type]} ${title}`)
            .setFooter({ text: `🏷️ ${tags.map(t => `#${t}`).join(' · ')}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        if (description) {
            const truncated = description.length > 2000
                ? description.slice(0, 1997) + '...'
                : description;
            embed.setDescription(truncated);
        }

        if (media && media.contentType?.startsWith('image/')) {
            embed.setImage(`attachment://${media.name}`);
        }

        if (url) {
            embed.addFields({ name: '🔗 URL', value: url });
        }

        if (text) {
            const truncated = text.length > 1000 ? text.slice(0, 997) + '...' : text;
            embed.addFields({ name: '📝 Texto', value: truncated });
        }

        embed.addFields({ name: '👤 Guardado por', value: interaction.user.tag });

        const files: AttachmentBuilder[] = [];

        if (media) {
            files.push(new AttachmentBuilder(media.url, { name: media.name }));
        }

        if (file) {
            files.push(new AttachmentBuilder(file.url, { name: file.name }));
        }

        await interaction.deferReply();

        await interaction.editReply({
            embeds: [embed],
            files: files.length > 0 ? files : undefined,
        });
    },
};