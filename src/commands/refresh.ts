import { SlashCommandBuilder } from "discord.js"
import ApplicationCommand from "../types/ApplicationCommand"
import commands from "../utils/commands"

export default new ApplicationCommand({
	data: new SlashCommandBuilder()
		.setName("refresh")
		.setDescription("Reloads the bot and commands"),
	async execute(interaction): Promise<void> {
		await interaction.deferReply()
		const res = await commands.deploy()
		console.log(res)

		// try {
		// 	interaction.followUp({ embeds: embeds.successEmbed(`Successfully deployed (${res}) commands!`) })
		// 	interaction.followUp({ embeds: embeds.messageEmbed('Restarting!', 'Please wait...') })
		// } catch (error) {
		// 	console.error(error)
		// 	throw error
		// }

		setTimeout(function () {
			process.exit()
		}, 1000)



		// runScript('./deploy-commands.js', function (err) {
		// 	if (err) {
		// 		return interaction.followUp({ embeds: embeds.errorEmbed('An error occurred while deploying commands!`', err) })
		// 	} else {
		// 		interaction.followUp({ embeds: embeds.successEmbed('Successfully deployed commands!') })
		// 		interaction.followUp({ embeds: embeds.messageEmbed('Restarting!', 'Please wait...') })
		// 		setTimeout(function () {
		// 			process.exit()
		// 		}, 1000)
		// 	}
		// })


	},
})
