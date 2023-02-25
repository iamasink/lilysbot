import { SlashCommandBuilder, EmbedBuilder, ColorResolvable, APIEmbedField, EmbedFooterOptions, APIEmbed, User } from "discord.js"
import { footer } from "../config.json"

function embed(
	color: ColorResolvable,
	title: string,
	description?: string,
	fields?: APIEmbedField[],
	image?: string,
	thumbnail?: string,
	footer?: EmbedFooterOptions
): EmbedBuilder[] {
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

export default {
	errorEmbed(when: string, error: any): EmbedBuilder[] {
		return embed(
			"#d02721",
			"An error occurred!",
			undefined,
			[
				{
					name: "__Error__",
					value: `${error.name || error}\n${error.message || ""}`,
				},
			],
			undefined,
			undefined,
			undefined,
		)
	},

	successEmbed(title: string, description?: string): any {
		return embed("#00ff00", title, description)
	},

	messageEmbed(
		title: string,
		description?: string,
		fields?: any,
		color: ColorResolvable = "#f9beca",
	): any {
		return embed(color, title, description, fields)
	},

	warningEmbed(
		title: string,
		description?: string,
		fields?: any,
		color: ColorResolvable = "#f2bb05",
	) {
		return embed(color, title, description, fields)
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
	async profileEmbed(
		title: string,
		description?: string,
		fields?: any,
		user?: User,
		guild?: any,
	): Promise<any> {
		user = await user.fetch()
		let thumbnail: string

		if (
			guild &&
			guild.members.resolve(user) &&
			guild.members.resolve(user).avatar != undefined
		) {
			thumbnail = `https://cdn.discordapp.com/guilds/${guild.id}/users/${user.id}/avatars/${guild.members.resolve(user).avatar}.webp`
		} else {
			thumbnail = user.avatarURL()
		}

		const color = user.hexAccentColor || "#f9beca"
		return embed(
			color,
			title,
			description,
			fields,
			undefined,
			thumbnail,
		)
	},
}
