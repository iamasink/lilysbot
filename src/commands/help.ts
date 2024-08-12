import {
	ChatInputCommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
} from "discord.js"
import ApplicationCommand from "../types/ApplicationCommand"
import commands from "../utils/commands"
import format from "../utils/format"
import { client } from ".."
import { stripIndents } from "common-tags"

export default new ApplicationCommand({
	settings: {
		ownerOnly: true
	},
	data: new SlashCommandBuilder()
		.setName("help")
		.setDescription("Display help information"),
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		const embed = new EmbedBuilder()
			.setColor("#f9beca")
			.setTitle("Wiwwie")
			.setDescription(
				stripIndents`hi im wiwwie <3
				[GitHub Repo](https://github.com/iamasink/lilysbot)
				For a list of commands run \`/command list\`
				`,
			)
			.setThumbnail(client.user.avatarURL())
		interaction.reply({ embeds: [embed] })
	},
})
