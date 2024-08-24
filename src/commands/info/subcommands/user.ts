import { stripIndents } from "common-tags"
import {
	ChatInputCommandInteraction,
	EmbedBuilder,
	GuildMember,
} from "discord.js"
import moment from "moment"
import { Subcommand } from "../../../types/ApplicationCommand"
import { InviteListSchema, UsernameSchema } from "../../../types/Database"
import database from "../../../utils/database"
import format from "../../../utils/format"
import { formatlink, formattext } from "../info"

export default {
	name: "user",
	async execute(
		interaction: ChatInputCommandInteraction,
		client,
	): Promise<void> {
		console.log(interaction.options)
		// get target user, if not, the user that created the interaction (ie called the command)
		let user = interaction.options.getUser("target")
		console.log(user)
		// fetches the user so their banner, accent colour is available
		user = await user.fetch()

		console.log(interaction.options.getString("info"))

		let member: GuildMember
		if (interaction.guild.members.resolve(user)) {
			member = interaction.guild.members.resolve(user)
		}

		// if they are in this guild and have a guild avatar, set their guild avatar url
		let gavURL
		if (member && member.avatar != undefined) {
			gavURL = `https://cdn.discordapp.com/guilds/${interaction.guild.id}/users/${user.id}/avatars/${member.avatar}.webp`
		} else {
			gavURL = null
		}

		// format each thing

		const a = formattext(user.hexAccentColor, `Accent color`)
		const av = formatlink(
			user.avatarURL({ forceStatic: false }),
			`Avatar URL`,
			`?size=4096`,
			`https://cdn.discordapp.com/embed/avatars/${
				parseInt(user.discriminator) % 5
			}.png`,
		)
		const gav = formatlink(gavURL, `Guild Avatar URL`, `?size=4096`)
		const b = formatlink(
			user.bannerURL({ forceStatic: false }),
			`Banner URL`,
			`?size=4096`,
		)

		let thumb: string
		let avatar: string

		// if user has an avatar, set thumbnail to avatar
		if (user.avatarURL({ forceStatic: false })) {
			thumb = user.avatarURL({ forceStatic: false })
		} // else set it to default avatar (calculated by discrim modulo 5)
		else {
			thumb = `https://cdn.discordapp.com/embed/avatars/${
				parseInt(user.discriminator) % 5
			}.png`
		}

		// sets image and image name to whatever was specified
		if (user.avatarURL({ forceStatic: false })) {
			avatar = user.avatarURL({ forceStatic: false })
		} else {
			avatar = `https://cdn.discordapp.com/embed/avatars/${
				parseInt(user.discriminator) % 5
			}.png`
		}

		let image: string
		let imagename: string

		switch (interaction.options.getString("show")) {
			case "avatar": {
				image = avatar
				imagename = `avatar`
				break
			}
			case "banner": {
				if (b) {
					image = user.bannerURL({ forceStatic: false })
					imagename = `banner`
				} else {
					image = avatar
					imagename = `avatar`
				}
				break
			}
			case "guild avatar": {
				if (gav) {
					image = gavURL
					imagename = `guild avatar`
				} else {
					image = avatar
					imagename = `avatar`
				}
				break
			}
			case "hide": {
				image = null
				imagename = null
				break
			}
			case "usernames": {
				image = null
				imagename = null

				break
			}
			default: {
				// if no option was specified, default to banner || avatar
				if (b) {
					image = user.bannerURL({ forceStatic: false })
					imagename = `banner`
				} else if (av) {
					image = null
					imagename = null
				} else {
				}
				break
			}
		}
		console.log(`thumb = ${thumb}`)

		// create embed
		const infoEmbed = new EmbedBuilder()
			.setColor(user.hexAccentColor)
			.setTitle(`__${format.markdownEscape(user.username)}__`)
			.setThumbnail(thumb)
			//.setAuthor({ name: 'Some name', iconURL: 'https://i.imgur.com/AfFp7pu.png', url: 'https://discord.js.org' })
			.setDescription(`<@${user.id}>`)
			//.setDescription(`<@${user.id}>\n**ID**: ${user.id}\n**Created at**: <t:${user.createdTimestamp.toString().slice(0, -3)}:f>\n(${format.time(Date.now() - user.createdTimestamp)})`)
			.addFields({ name: "ID", value: `${user.id}` })
			// <t:..:f> creates a discord timestamp, using the createdTimestamp of the user. the last 3 characters are stripped because it is in ms. Is this a bad way to do it? dunno
			// moment(time).diff(moment()) gets the difference between two times. calling just moment() gets the current time
			.addFields({
				name: "Created at",
				value: stripIndents`<t:${user.createdTimestamp
					.toString()
					.slice(0, -3)}:f>
											(${format.timeDiff(moment(), moment(user.createdTimestamp))} ago)`,
			})

		//.setTimestamp()
		//.setFooter({ text: 'Some footer text here', iconURL: 'https://i.imgur.com/Gu1Ggxt.png' })
		if (
			interaction.options.getString("show") != "hide" &&
			interaction.options.getString("show") != "usernames"
		) {
			infoEmbed.addFields({
				name: "__Profile__",
				value: `${a}${av}${gav}${b}\n`,
			})

			if (interaction.guild.members.resolve(user)) {
				const invitedLink = await database.get<string>(
					`.guilds.${member.guild.id}.users.${member.id}.invitedLink`,
				)
				const invites = await database.get<InviteListSchema>(
					`.guilds.${member.guild.id}.invites`,
				)
				const invite = invites[invitedLink]

				var guildtext = stripIndents`**Joined at:** 
													<t:${member.joinedTimestamp.toString().slice(0, -3)}:f>
													(${format.timeDiff(moment(), moment(member.joinedTimestamp))} ago)`
				if (member.nickname) {
					guildtext += stripIndents`\n**Nickname:** ${member.nickname}`
				}
				if (invite) {
					const invitedById = invite.inviterId
					const invitedBy =
						(await client.users.fetch(invitedById)) || null
					const invited = invitedBy
						? `\`${invitedBy.username}\` <@${invitedById}>`
						: `*Unknown*`
					// const invited = invitedBy ? `<@${invitedById}>` : `*Unknown*`
					guildtext += `\n**Invited by:** ${invited} ${invite.code.slice(
						0,
						4,
					)}`
				}

				if (member)
					infoEmbed.addFields({
						name: "__Guild__",
						value: guildtext,
					})
			}

			if (image)
				infoEmbed.addFields({
					name: `\u200b`,
					value: `**Showing ${imagename}:**`,
				})
			if (image) infoEmbed.setImage(`${image}?size=4096`)
		}
		if (interaction.options.getString("show") == "usernames") {
			const usernames = await database.get<UsernameSchema>(
				`.users.${user.id}.usernames`,
			)
			let text = `\n`
			console.log(usernames)
			for (let key in usernames) {
				if (usernames.hasOwnProperty(key)) {
					const data = usernames[key]
					if (data.from == data.to) continue
					text += `<t:${key.slice(
						0,
						-3,
					)}>\n\`${format.removeDiscrimForNewUsernames(
						data.from,
					)}\`  **→**  \`${format.removeDiscrimForNewUsernames(
						data.to,
					)}\`\n`
				}
			}

			let msgs = format.splitMessage(text, 1000, "\n")
			for (let i = 0, len = msgs.length; i < len; i++) {
				if (i == 0) {
					infoEmbed.addFields({
						name: "__Known Username History__",
						value: msgs[i],
					})
				} else {
					infoEmbed.addFields({
						name: `__Known Username History (${i + 1})__`,
						value: msgs[i],
					})
				}
			}
		}

		// reply with the embed
		interaction.reply({ embeds: [infoEmbed] })
	},
} satisfies Subcommand
