const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const { request } = require('undici')


async function getJSONResponse(body) {
	let fullBody = ''

	for await (const data of body) {
		fullBody += data.toString()
	}

	return JSON.parse(fullBody)
}


module.exports = {
	data: new SlashCommandBuilder()
		.setName('nekos')
		.setDescription('nekos.life')
		.addStringOption(option => option
			.setName('image')
			.setDescription('Type of image to retrieve')
			.addChoices(
				{ name: 'smug', value: 'smug' },
				{ name: 'woof', value: 'woof' },
				{ name: 'gasm', value: 'gasm' },
				{ name: '8ball', value: '8ball' },
				{ name: 'goose', value: 'goose' },
				{ name: 'cuddle', value: 'cuddle' },
				{ name: 'avatar', value: 'avatar' },
				{ name: 'slap', value: 'slap' },
				{ name: 'pat', value: 'pat' },
				{ name: 'gecg', value: 'gecg' },
				{ name: 'feed', value: 'feed' },
				{ name: 'fox girl', value: 'fox_girl' },
				{ name: 'lizard', value: 'lizard' },
				{ name: 'neko', value: 'neko' },
				{ name: 'hug', value: 'hug' },
				{ name: 'meow', value: 'meow' },
				{ name: 'kiss', value: 'kiss' },
				{ name: 'wallpaper', value: 'wallpaper' },
				{ name: 'tickle', value: 'tickle' },
				{ name: 'spank', value: 'spank' },
				{ name: 'waifu', value: 'waifu' },
				{ name: 'lewd', value: 'lewd' },
				{ name: 'ngif', value: 'ngif' }
			)
			.setRequired(true)
		),

	async execute(interaction) {
		type = interaction.options.getString('image')
		const result = await request(`https://nekos.life/api/v2/img/${type}`)
		const image = await getJSONResponse(result.body)

		const embed = new EmbedBuilder()
			.setTitle(`Here\'s a random ${type} image!`)
			.setColor(`#f9beca`)
			.setImage(image.url)
			.setFooter({ text: 'Image from nekos.life', iconURL: 'https://avatars.githubusercontent.com/u/34457007?s=200&v=4' })


		interaction.reply({ embeds: [embed] })


	},
}
