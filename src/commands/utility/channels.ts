import { ChannelType, type Guild, type GuildBasedChannel } from 'discord.js';

const channelTypeLabels: Record<number, string> = {
	[ChannelType.GuildText]: 'Texto',
	[ChannelType.GuildVoice]: 'Voz',
	[ChannelType.GuildCategory]: 'Categoría',
	[ChannelType.GuildAnnouncement]: 'Anuncios',
	[ChannelType.GuildForum]: 'Foro',
	[ChannelType.GuildStageVoice]: 'Stage',
	[ChannelType.PublicThread]: 'Hilo público',
	[ChannelType.PrivateThread]: 'Hilo privado',
};

function channelSort(a: GuildBasedChannel, b: GuildBasedChannel) {
	const pa = 'position' in a ? (a.position as number) ?? 0 : 0;
	const pb = 'position' in b ? (b.position as number) ?? 0 : 0;
	return pa - pb;
}

export function buildChannelsList(guild: Guild): string[] {
	const all = [...guild.channels.cache.values()];

	const top = all
		.filter(c => c.parentId === null || (c as { type: number }).type === ChannelType.GuildCategory)
		.sort(channelSort);

	const lines: string[] = [];

	for (const channel of top) {
		const label = channelTypeLabels[channel.type] ?? 'Otro';
		const ts = channel.createdTimestamp ?? 0;
		const created = `<t:${Math.floor(ts / 1000)}:R>`;
		lines.push(`**#${channel.name}** — ${label} — ${created}`);

		const children = all
			.filter(c => c.parentId === channel.id)
			.sort(channelSort);

		for (const child of children) {
			const childLabel = channelTypeLabels[child.type] ?? 'Otro';
			const childTs = child.createdTimestamp ?? 0;
			const childCreated = `<t:${Math.floor(childTs / 1000)}:R>`;
			lines.push(`  └ #${child.name} — ${childLabel} — ${childCreated}`);
		}
	}

	const chunks: string[] = [];
	let current = '';

	for (const line of lines) {
		const next = current ? `${current}\n${line}` : line;
		if (next.length > 1900) {
			chunks.push(current);
			current = line;
		} else {
			current = next;
		}
	}
	if (current) chunks.push(current);

	return chunks;
}
