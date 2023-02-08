import { SlashCommandBuilder } from "discord.js"
import ApplicationCommand from "../types/ApplicationCommand"

export default new ApplicationCommand({
	data: new SlashCommandBuilder()
		.setName("ping")
		.setDescription("Replies with Pong!"),
	async execute(interaction): Promise<void> {
		const sent = await interaction.reply({ content: "Pinging...", fetchReply: true })
		interaction.editReply(`Pong!\nRoundtrip latency: ${sent.createdTimestamp - interaction.createdTimestamp}ms`)
		console.log(JSON.stringify(interaction.client))
	},
})