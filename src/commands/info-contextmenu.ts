import {
	Interaction,
	ChatInputCommandInteraction,
	GuildMember,
	SlashCommandBuilder,
	SlashCommandSubcommandBuilder,
	EmbedBuilder,
	Embed,
	ContextMenuCommandBuilder,
	ContextMenuCommandType,
	ApplicationCommandType,
	Guild,
} from "discord.js"
import database from "../utils/database"
import format from "../utils/format"
import ApplicationCommand from "../types/ApplicationCommand"
import { client } from ".."
import embeds from "../utils/embeds"
import axios from "axios"
import { stripIndent } from "common-tags"
import commands from "../utils/commands"

export default new ApplicationCommand({
	data: new ContextMenuCommandBuilder()
		.setName("User Info")
		.setType(2),
	async menuUser(interaction, client) {
		if (!interaction.guild) {
			interaction.reply({
				embeds: embeds.warningEmbed("This isn't available in DMs."),
			})
			return
		}

		const member = await interaction.guild.members.fetch(
			interaction.targetId,
		)
		console.log(member)

		await commands.run(interaction, "slash", "info", null, "user", [
			{
				name: "target",
				type: 6,
				value: member.id,
				user: await client.users.fetch(member.id),
				member: await interaction.guild.members.fetch(member.id),
			},
		])
	},
})
