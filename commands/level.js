const { SlashCommandBuilder, SlashCommandSubcommandBuilder, EmbedBuilder } = require('discord.js')
const embeds = require('../structure/embeds')
const format = require('../structure/format')
const database = require('../structure/database')
const calc = require('../structure/calc')



function fetchPromise(toFetch) {
	return new Promise((resolve, reject) => {
		try {
			resolve(toFetch.fetch(true))
		} catch { reject() }
	})
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('level')
		.setDescription('Retrieves level...')
		.addUserOption(option => option.setName('target').setDescription('A user. Ping or ID').setRequired(true)
		),

	async execute(interaction) {

		const user = interaction.options.getUser('target') || interaction.user
		xp = await database.get(`guilds`, `.${interaction.guild.id}.users.${interaction.user.id}.xp`)
		console.log(xp)
		progress = calc.levelProgress(xp)
		level = calc.level(xp)
		xpLower = calc.xp(level)
		xpHigher = calc.xp(level + 1)
		const embed = await embeds.profileEmbed(`${user.username}'s level`, `**Level ${level} (${xp} xp)** \n\`[${format.bar(0, progress, 1, 25)}]\`\n${level} (${xpLower} xp) - ${level + 1} (${xpHigher} xp)`, null, user, interaction.guild)
		interaction.reply({ embeds: embed })
	}
}