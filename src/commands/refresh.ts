import { SlashCommandBuilder, ChatInputCommandInteraction, ActivityType } from "discord.js"
import ApplicationCommand from "../types/ApplicationCommand"
import commands from "../utils/commands"
import embeds from "../utils/embeds"
import database from "../utils/database"
import { client } from ".."

export default new ApplicationCommand({
	settings: {
		ownerOnly: true
	},
	data: new SlashCommandBuilder()
		.setName("refresh")
		.setDescription("Reloads the bot and commands"),
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		await interaction.deferReply()

		try {
			const res = await commands.deploy()
			console.log(res)
			client.user.setPresence({
				activities: [{ name: `Deploying Commands!`, type: ActivityType.Playing }],
				status: "dnd",
			})
			await interaction.followUp({
				embeds: embeds.successEmbed(
					`Successfully deployed (${res}) commands!`,
				),
			})
			client.user.setPresence({
				activities: [{ name: `Restarting...`, type: ActivityType.Playing }],
				status: "dnd",
			})
			let msg = await interaction.followUp({
				embeds: embeds.messageEmbed("Restarting!", "Please wait..."),
			})
			await database.set(`.botdata.lastchannel`, {
				guild: interaction.guild.id,
				channel: interaction.channel.id,
				message: msg.id,
			})
		} catch (error) {
			console.error(error)
			throw error
		}

		// exit the process after 1 sec
		setTimeout(function () {
			process.exit()
		}, 1000)
	},
})
