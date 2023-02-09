import { SlashCommandBuilder } from "discord.js"
import ApplicationCommand from "../types/ApplicationCommand"
import commands from "../utils/commands"
import embeds from "../utils/embeds"

export default new ApplicationCommand({
	data: new SlashCommandBuilder()
		.setName("refresh")
		.setDescription("Reloads the bot and commands"),
	async execute(interaction): Promise<void> {
		await interaction.deferReply()
		const res = await commands.deploy()
		console.log(res)


		try {
			const res = await commands.deploy()
			console.log(res)
			interaction.followUp({ embeds: embeds.successEmbed(`Successfully deployed (${res}) commands!`) })
			interaction.followUp({ embeds: embeds.messageEmbed('Restarting!', 'Please wait...') })
		} catch (error) {
			console.error(error)
			throw error
		}

		// exit the process after 1 sec
		setTimeout(function () { process.exit() }, 1000)
	},
})
