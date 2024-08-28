import { stripIndent } from "common-tags"
import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js"
import { Subcommand } from "../../../types/ApplicationCommand"

export default {
	name: "guild",
	execute: async (
		interaction: ChatInputCommandInteraction,
	): Promise<void> => {
		await interaction.deferReply()
		// TODO
		console.log(interaction.guild)
		const guild = await interaction.guild.fetch()
		const channels = await interaction.guild.channels.fetch()
		const channels2 = interaction.guild.channels.cache
		console.log(channels)
		const textChannelCount = channels.filter((i) => i.isTextBased()).size
		const voiceChannelCount = channels.filter((i) => i.isVoiceBased()).size
		const activeThreadChannelCount = (
			await guild.channels.fetchActiveThreads()
		).threads.filter((i) => !i.archived).size
		const archivedThreadChannelCount = (
			await guild.channels.fetchActiveThreads()
		).threads.filter((i) => i.archived).size
		const threadChannelCount = channels2.filter((i) => i.isThread()).size

		const roles = await guild.roles.fetch()
		const roleCount = roles.size
		const managedRoleCount = roles.filter((role) => role.managed).size

		const members = await guild.members.fetch({
			withPresences: true,
		})
		const memberCount = guild.memberCount

		const onlineMembers = members.filter(
			(member) =>
				member.presence?.status === "online" ||
				member.presence?.status === "dnd" ||
				member.presence?.status === "idle",
		)
		const onlineMemberCount = onlineMembers.size

		const botMemberCount = members.filter((member) => member.user.bot).size
		const onlineBotMemberCount = onlineMembers.filter(
			(member) => member.user.bot,
		).size

		const embed = new EmbedBuilder()
			.setTitle(`${guild.name} (${guild.id})`)
			.setFields(
				{ name: "Description", value: `${guild.description}` },
				{ name: "**Owner**", value: `<@${guild.ownerId}>` },
				{
					name: "**Created at**",
					value: `<t:${guild.createdTimestamp
						.toString()
						.slice(0, -3)}:f>`,
				},
				{
					name: "__**Channels**__",
					value: stripIndent`
								**Total**: ${channels.size}
								**Text Channels**: ${textChannelCount}
								**Voice Channels**: ${voiceChannelCount}
								**Thread Channels**: ${activeThreadChannelCount} active of ${threadChannelCount}
							`,
				},
				{
					name: "__**Roles**__",
					value: stripIndent`
								**Total**: ${roleCount}
								**Roles**: ${roleCount - managedRoleCount}
								**Bot (aka Managed) Roles**: ${managedRoleCount}
							`,
				},
				{
					name: "__**Members**__",
					value: stripIndent`
								**Total**: ${memberCount} | ${
						memberCount - botMemberCount
					} Users, ${botMemberCount} Bots
								**Online**: ${onlineMemberCount} | ${
						onlineMemberCount - onlineBotMemberCount
					} Users, ${onlineBotMemberCount} Bots
							`,
				},
			)
			.setThumbnail(guild.iconURL())

		interaction.editReply({ embeds: [embed] })
	},
} satisfies Subcommand
