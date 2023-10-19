import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import ApplicationCommand from '../types/ApplicationCommand'
import { client } from '..'

export default new ApplicationCommand({
	permissions: ["Administrator"],
	data: new SlashCommandBuilder()
		.setName('test')
		.setDescription('description'),
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		console.log(interaction.user)
		console.log(await client.users.fetch(interaction.user, { force: true }))

	},
})