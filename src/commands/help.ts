import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import ApplicationCommand from '../types/ApplicationCommand'
import commands from '../utils/commands'
import format from '../utils/format'

export default new ApplicationCommand({
	permissions: ["botowner"],
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Help me!!'),
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		const lines = []
		const commandList = await commands.get()
		for (let i = 0, len = commandList.length; i < len; i++) {
			const command = commandList[i]
			lines.push(`${command.data.name} - testing!!!!!`)
		}
		const message = lines.join("\n")
		interaction.reply(message)
	},
})