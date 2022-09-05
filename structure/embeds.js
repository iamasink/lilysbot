const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const { footer } = require('../config.json')


function embed(color, title, description, fields) {
	const embed = new EmbedBuilder()
	if (color) embed.setColor(color)
	if (title) embed.setTitle(title)
	if (description) embed.setDescription(description)
	if (fields) {
		for (const f of fields) {
			embed.addFields(f)
		}
	}
	//embed.setTimestamp()
	//embed.setFooter({ text: footer, iconURL: 'https://cdn.discordapp.com/attachments/645053287208452112/1016137789223485512/unknown.png?size=4096' })
	console.log(`embed: ${JSON.stringify(embed)}`)
	return [embed]
}
//



module.exports = {
	/**
	 * Creates an error embed
	 *
	 * @param {*} when 
	 * @param {*} error
	 * @return {*} 
	 */
	errorEmbed(when, error) {
		return embed(
			`#ff0000`,
			`An error occurred!`,
			null,
			[{
				name: '__While__',
				value: `${when}`
			},
			{
				name: '__Error__',
				value: `${error}`
			}],

		)
	},

	successEmbed(title) {
		return embed(`#00ff00`, title)
	},

	messageEmbed(title, description, fields, color = '#f9beca') {
		return embed(
			color,
			title,
			description,
			fields
		)
	}
}