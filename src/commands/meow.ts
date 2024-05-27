import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import ApplicationCommand from '../types/ApplicationCommand'
import axios from 'axios'

export default new ApplicationCommand({
	data: new SlashCommandBuilder()
		.setName('meow')
		.setDescription('Get a random cat image'),
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		const catResult = await axios.get('https://aws.random.cat/meow')
		console.log(catResult)
		const { file } = catResult.data
		console.log(file)

		const exampleEmbed = new EmbedBuilder()
			.setTitle('Here\'s a random cat image!')
			.setColor(`#f9beca`)
			.setImage(file)
			.setFooter({ text: 'Image from random.cat', iconURL: 'https://purr.objects-us-east-1.dream.io/static/img/random.cat-logo.png' })
		interaction.reply({ embeds: [exampleEmbed] })
	},
})