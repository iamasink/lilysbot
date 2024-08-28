import {
	ChannelType,
	ChatInputCommandInteraction,
	TextChannel,
} from "discord.js"
import { Subcommand } from "../../../types/ApplicationCommand"
import database from "../../../utils/database"
import embeds from "../../../utils/embeds"

export default {
	name: "create",
	async execute(interaction: ChatInputCommandInteraction) {
		const name = interaction.options.getString("name")
		const channel =
			interaction.options.getChannel("channel") ||
			(await interaction.guild.channels.fetch(
				interaction.guild.systemChannelId,
			))
		const length = interaction.options.getInteger("length") || 0
		const maxuses = interaction.options.getInteger("maxuses") || 0

		if (
			channel.type == ChannelType.GuildCategory ||
			channel.type == ChannelType.GuildDirectory ||
			channel.type == ChannelType.PublicThread ||
			channel.type == ChannelType.PrivateThread
		) {
			await interaction.reply({
				ephemeral: true,
				embeds: embeds.warningEmbed(
					"The channel you selected is of an invalid type.",
				),
			})
		}

		;(channel as TextChannel)
			.createInvite({
				unique: true,
				maxAge: length,
				maxUses: maxuses,
				reason: "invite create command",
			})
			.then(async (invite) => {
				console.log(`Created an invite with a code of ${invite.code}`)
				console.log(invite)
				if (name) {
					// the database entry will be created because the event inviteCreate is emitted
					await database.set(
						`.guilds.${interaction.guild.id}.invites.${invite.code}.name`,
						name,
					)
					await interaction.reply({
						ephemeral: true,
						embeds: embeds.successEmbed(
							`Created Invite`,
							`Created Invite with name \`${name}\`, to channel ${channel}.`,
						),
					})
				} else {
					await interaction.reply({
						ephemeral: true,
						embeds: embeds.successEmbed(
							`Created Invite`,
							`Created Invite to channel ${channel}.`,
						),
					})
				}
				await interaction.followUp({
					ephemeral: true,
					content: `https://discord.gg/${invite.code}`,
				})
			})
	},
} satisfies Subcommand
