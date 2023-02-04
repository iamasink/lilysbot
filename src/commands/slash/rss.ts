const { SlashCommandBuilder, SlashCommandSubcommandBuilder, EmbedBuilder } = require('discord.js')
const Parser = require('rss-parser')
const embeds = require('../../structure/embeds')


let parser = new Parser()

export default {
	data: new SlashCommandBuilder()
		.setName('rss')
		.setDescription('Setup rss feeds and stuff')
		.addSubcommand((command: any) => command
			.setName('get')
			.setDescription('get a rss feed')
			.addStringOption((option: any) => option
				.setName('url')
				.setDescription('url to an xml rss feed ')
				.setRequired(true)
			)
			.addNumberOption((option: any) => option
				.setName('limit')
				.setDescription('the maximum amount of entries to retrieve. default 1, maximum 5')
				.setMinValue(1)
				.setMaxValue(5)
				.setRequired(false)
			)
		)
	// .addSubcommand((command ) => command 
	// 	.setName('ranking')
	// 	.setDescription('see a list of the highest levels')
	// )

	,
	async execute(interaction: any) {
		switch (interaction.options.getSubcommand()) {
			case 'get': {
				const url = await interaction.options.getString('url')
				await interaction.reply({ embeds: embeds.messageEmbed("Retrieving RSS Feed...", `**URL:** \`${url}\`\n**Title:** \` \``) })


				var limit: number = await interaction.options.getNumber('limit') || 1
				if (limit > 5 || limit < 1) limit = 1


				let feed = await parser.parseURL(url)

				await interaction.editReply({ embeds: embeds.successEmbed("Retrieving RSS Feed", `**URL:** \`${url}\`\n**Title:** \`${feed.title}\``) })

				let len: number
				if (feed.items.length > limit) len = limit
				else len = feed.items.length

				for (let i = 0; i < len; i++) {
					let item = feed.items[i]
					console.log(item.title + ':' + item.link)
					const embed = new EmbedBuilder()
						.setColor(`#f9beca`)
						.setTitle(`${feed.title}`)
						//.setAuthor({ name: item.creator })
						.setTimestamp(Date.parse(item.isoDate))
						.setDescription(item.content)

					await interaction.followUp({ embeds: [embed] })
				}



				break
			}
			case 'ranking': {


				break
			}
		}
	}
}