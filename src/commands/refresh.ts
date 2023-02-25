import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js"
import ApplicationCommand from "../types/ApplicationCommand"
import commands from "../utils/commands"
import embeds from "../utils/embeds"
import database from "../utils/database"

export default new ApplicationCommand({
	permissions: ["botowner"],
	data: new SlashCommandBuilder()
		.setName("refresh")
		.setDescription("Reloads the bot and commands"),
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		await interaction.deferReply()

		try {
			const res = await commands.deploy()
			console.log(res)
			await interaction.followUp({ embeds: embeds.successEmbed(`Successfully deployed (${res}) commands!`) })

			let msg = await interaction.followUp({ embeds: embeds.messageEmbed('Restarting!', 'Please wait...') })
			await database.set(`.botdata.lastchannel`, { guild: interaction.guild.id, channel: interaction.channel.id, message: msg.id })
		} catch (error) {
			console.error(error)
			throw error
		}

		// exit the process after 1 sec
		setTimeout(function () { process.exit() }, 1000)
	},
})
