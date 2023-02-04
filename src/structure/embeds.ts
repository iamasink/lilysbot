const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const { footer } = require('../config.json')


function embed(color: string, title: string, description?: string, fields?: any, image?: string, thumbnail?: string, footer?: object): object {
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



export default {
	errorEmbed(when: string, error: Error,): object {

		return embed(
			`#d02721`,
			`An error occurred!`,
			undefined,
			[{
				name: '__Error__',
				value: `${error.name || error}\n${error.message || ''}`
			}], undefined, undefined, undefined

		)
	},

	successEmbed(title: string, description?: string): any {
		return embed(`#00ff00`, title, description)
	},

	messageEmbed(title: string, description?: string, fields?: any, color: string = '#f9beca'): any {
		return embed(
			color,
			title,
			description,
			fields
		)
	},

	warningEmbed(title: string, description?: string, fields?: any, color = '#f2bb05') {
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
	async profileEmbed(title: string, description: string, fields: any, user: any, guild: any): Promise<any> {
		user = await user.fetch()
		var thumbnail: string
		var color: number | string

		if (guild.members.resolve(user) && guild.members.resolve(user).avatar != undefined) {
			thumbnail = `https://cdn.discordapp.com/guilds/${guild.id}/users/${user.id}/avatars/${guild.members.resolve(user).avatar}.webp`
		} else { thumbnail = user.avatarURL(true) }
		color = user.hexAccentColor || `#f9beca`
		return embed(
			color.toString(),
			title,
			description,
			fields,
			undefined,
			thumbnail
		)

	}
}