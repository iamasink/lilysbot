const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const { footer } = require('../config.json')

/**
 * Creates an embed
 *
 * @param {string} color
 * @param {string} title
 * @param {string} description
 * @param {array} fields array of field objects {name, value}
 * @param {string} image
 * @param {string} thumbnail
 * @param {object} footer footer object {text, url}
 * @return {object} embed object
 */
function embed(color, title, description, fields, image, thumbnail, footer) {
	const embed = new EmbedBuilder()
	if (color) embed.setColor(color)
	if (title) embed.setTitle(title)
	if (description) embed.setDescription(description)
	if (fields) {
		for (const f of fields) {
			embed.addFields(f)
		}
	}
	if (image) embed.setImage(image)
	if (thumbnail) embed.setThumbnail(thumbnail)
	if (footer) embed.setFooter(footer)
	console.log(`embed: ${JSON.stringify(embed)}`)
	return [embed]
}
//



module.exports = {
	/**
	 * Creates an error embed
	 *
	 * @param {string} when text for 'while' field
	 * @param {string|object} error 
	 * @return {object} 
	 */
	errorEmbed(when, error,) {
		return embed(
			`#ff0000`,
			`An error occurred!`,
			null,
			[{
				name: '__Error__',
				value: `${error.name || error}\n${error.message || ''}`
			}], null, null,

		)
	},

	/**
	 * Creates a success (green) embed
	 *
	 * @param {*} title
	 * @return {*} 
	 */
	successEmbed(title) {
		return embed(`#00ff00`, title)
	},

	/**
	 * Creates a message (default pink) embed 
	 *
	 * @param {*} title
	 * @param {*} description
	 * @param {*} fields
	 * @param {string} [color='#f9beca']
	 * @return {*} 
	 */
	messageEmbed(title, description, fields, color = '#f9beca') {
		return embed(
			color,
			title,
			description,
			fields
		)
	},

	/**
	 * Creates a profile embed. 
	 * Has guild member avatar || profile picture as thumbnail,
	 * color is user's accent color || pink default
	 *
	 * @param {*} title
	 * @param {*} description
	 * @param {*} fields
	 * @param {*} user
	 * @param {*} guild
	 * @return {*} 
	 */
	async profileEmbed(title, description, fields, user, guild) {
		user = await user.fetch()
		if (guild.members.resolve(user) && guild.members.resolve(user).avatar != undefined) {
			thumbnail = `https://cdn.discordapp.com/guilds/${guild.id}/users/${user.id}/avatars/${guild.members.resolve(user).avatar}.webp`
		} else { thumbnail = user.avatarURL(true) }
		color = user.hexAccentColor || `#f9beca`
		return embed(
			color,
			title,
			description,
			fields,
			null,
			thumbnail
		)

	}
}