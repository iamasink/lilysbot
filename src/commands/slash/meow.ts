const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const { request } = require('undici')


async function getJSONResponse(body: any) {
	let fullBody = ''

	for await (const data of body) {
		fullBody += data.toString()
	}

	return JSON.parse(fullBody)
}


export default {
	data: new SlashCommandBuilder()
		.setName('meow')
		.setDescription('gets a random cat image!!!!'),
	async execute(interaction: any) {
		const catResult = await request('https://aws.random.cat/meow')
		const { file } = await getJSONResponse(catResult.body)

		const exampleEmbed = new EmbedBuilder()
			.setTitle('Here\'s a random cat image!')
			.setColor(`#f9beca`)
			.setImage(file)
			.setFooter({ text: 'Image from random.cat', iconURL: 'https://purr.objects-us-east-1.dream.io/static/img/random.cat-logo.png' })


		interaction.reply({ embeds: [exampleEmbed] })


	},
}
