import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"
import ApplicationCommand from "../types/ApplicationCommand"

export default new ApplicationCommand({
	data: new SlashCommandBuilder()
		.setName("moderate")
		.setDescription("moderator commands")
		.addSubcommand((command) =>
			command.setName("ban").setDescription("ban a user"),
		),
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		const sent = await interaction.reply({
			content: "Pinging...",
			fetchReply: true,
		})
		interaction.editReply(
			`Pong!\nRoundtrip latency: ${
				sent.createdTimestamp - interaction.createdTimestamp
			}ms`,
		)
		console.log(JSON.stringify(interaction.client))
	},
})
