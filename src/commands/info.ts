import { Interaction, ChatInputCommandInteraction, GuildMember, SlashCommandBuilder, SlashCommandSubcommandBuilder, EmbedBuilder, Embed } from "discord.js"
import database from "../utils/database"
import format from "../utils/format"
import ApplicationCommand from "../types/ApplicationCommand"
import { client } from ".."
import embeds from "../utils/embeds"
import axios from "axios"
import { stripIndent, stripIndents } from "common-tags"
import moment from "moment"

// function fetchPromise(toFetch) {
// 	return new Promise((resolve, reject) => {
// 		try {
// 			resolve(toFetch.fetch(true))
// 		} catch { reject() }
// 	})
// }


function formattext(val: string, name: string, append: string = ``, fallback?: string) {
	let output = `\n**${name}**: `
	if (val != undefined && val != null) {
		output += `${val}${append}`
	} else {
		if (fallback) output += `${fallback}${append}`
		else output = ``
	}
	return output
}
function formatlink(link: string, name: string, linkappend: string = "", fallbacklink?: string, dontappendonfallback: boolean = false) {
	let output: string
	output = `\n**${name}**`
	let outputlink: string

	if (link != undefined && link != null) {
		outputlink = `${link}${linkappend}`
		return `\n[${name}](${outputlink})`
	} else {
		if (fallbacklink) {
			if (dontappendonfallback) outputlink = `${fallbacklink}`
			else outputlink = `${fallbacklink}${linkappend}`
			return `\n**[${name}](${outputlink})`
		}
		else {
			return ``
		}
	}
}


export default new ApplicationCommand({
	data: new SlashCommandBuilder()
		.setName('info')
		.setDescription('Retrieves info about a user, the guild or this bot')
		.addSubcommand(subcommand =>
			subcommand
				.setName('user')
				.setDescription('Info about a user')
				.addUserOption(option => option.setName('target').setDescription('A user. Ping or ID').setRequired(true))
				.addStringOption(option => option
					.setName('show')
					.setDescription('Image to show')
					.addChoices(
						{ name: 'avatar', value: 'avatar' },
						{ name: 'guild avatar', value: 'guild avatar' },
						{ name: 'banner', value: 'banner' },
						{ name: 'hide', value: 'hide' },
						{ name: 'username history', value: 'usernames' },
					)
				)
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('guild')
				.setDescription('Info about the guild')
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('bot')
				.setDescription('Info about the bot')
		)

	,

	async execute(interaction: ChatInputCommandInteraction) {
		//console.log(`intercation: ${JSON.stringify(interaction)}`)
		switch (interaction.options.getSubcommand()) {
			case 'user': {
				console.log(interaction.options)
				// get target user, if not, the user that created the interaction (ie called the command)
				let user = interaction.options.getUser('target')
				console.log(user)
				// fetches the user so their banner, accent colour is available
				user = await user.fetch()

				console.log(interaction.options.getString('info'))

				let member: GuildMember
				if (interaction.guild.members.resolve(user)) {
					member = interaction.guild.members.resolve(user)
				}

				// if they are in this guild and have a guild avatar, set their guild avatar url
				let gavURL
				if (member && member.avatar != undefined) {
					gavURL = `https://cdn.discordapp.com/guilds/${interaction.guild.id}/users/${user.id}/avatars/${member.avatar}.webp`
				} else { gavURL = null }

				// format each thing 

				const a = formattext(user.hexAccentColor, `Accent color`)
				const av = formatlink(user.avatarURL({ forceStatic: false }), `Avatar URL`, `?size=4096`, `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator) % 5}.png`)
				const gav = formatlink(gavURL, `Guild Avatar URL`, `?size=4096`)
				const b = formatlink(user.bannerURL({ forceStatic: false }), `Banner URL`, `?size=4096`)

				let thumb: string
				let avatar: string

				// if user has an avatar, set thumbnail to avatar
				if (user.avatarURL({ forceStatic: false })) {
					thumb = user.avatarURL({ forceStatic: false })
				} // else set it to default avatar (calculated by discrim modulo 5)
				else { thumb = `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator) % 5}.png` }

				// sets image and image name to whatever was specified
				if (user.avatarURL({ forceStatic: false })) {
					avatar = user.avatarURL({ forceStatic: false })
				} else {
					avatar = `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator) % 5}.png`
				}

				let image: string
				let imagename: string


				switch (interaction.options.getString('show')) {
					case 'avatar': {
						image = avatar
						imagename = `avatar`
						break
					}
					case 'banner': {
						if (b) {
							image = user.bannerURL({ forceStatic: false })
							imagename = `banner`
						} else {
							image = avatar
							imagename = `avatar`
						}
						break
					}
					case 'guild avatar': {
						if (gav) {
							image = gavURL
							imagename = `guild avatar`
						} else {
							image = avatar
							imagename = `avatar`
						}
						break
					}
					case 'hide': {
						image = null
						imagename = null
						break
					}
					case 'usernames': {
						image = null
						imagename = null

						break
					}
					default: { // if no option was specified, default to banner || avatar
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
						value: stripIndents`<t:${user.createdTimestamp.toString().slice(0, -3)}:f>
											(${format.timeDiff(moment(), moment(user.createdTimestamp))} ago)`
					})


				//.setTimestamp()
				//.setFooter({ text: 'Some footer text here', iconURL: 'https://i.imgur.com/Gu1Ggxt.png' })
				if (interaction.options.getString('show') != 'hide' && interaction.options.getString('show') != "usernames") {

					infoEmbed.addFields({ name: '__Profile__', value: `${a}${av}${gav}${b}\n`, })

					if (interaction.guild.members.resolve(user)) {
						const invitedLink = await database.get(`.guilds.${member.guild.id}.users.${member.id}.invitedLink`)
						const invites: object = await database.get(`.guilds.${member.guild.id}.invites`)
						const invite = invites[invitedLink]

						var guildtext = stripIndents`**Joined at:** 
													<t:${member.joinedTimestamp.toString().slice(0, -3)}:f>
													(${format.timeDiff(moment(), moment(member.joinedTimestamp))} ago)`
						if (member.nickname) {
							guildtext += stripIndents`\n**Nickname:** ${member.nickname}`
						}
						if (invite) {
							const invitedById = invite.inviterId
							const invitedBy = await client.users.fetch(invitedById) || null
							const invited = invitedBy ? `\`${invitedBy.username}\` <@${invitedById}>` : `*Unknown*`
							// const invited = invitedBy ? `<@${invitedById}>` : `*Unknown*`
							guildtext += `\n**Invited by:** ${invited} ${invite.code.slice(0, 4)}`
						}

						if (member) infoEmbed.addFields({ name: '__Guild__', value: guildtext })
					}

					if (image) infoEmbed.addFields({ name: `\u200b`, value: `**Showing ${imagename}:**` })
					if (image) infoEmbed.setImage(`${image}?size=4096`)
				}
				if (interaction.options.getString('show') == "usernames") {
					const usernames = await database.get(`.users.${user.id}.usernames`)
					let text = `\n`
					console.log(usernames)
					for (let key in usernames) {
						if (usernames.hasOwnProperty(key)) {
							const data = usernames[key]
							if (data.from == data.to) continue
							text += `<t:${key.slice(0, -3)}>\n\`${format.removeDiscrimForNewUsernames(data.from)}\`  **→**  \`${format.removeDiscrimForNewUsernames(data.to)}\`\n`
						}
					}


					let msgs = format.splitMessage(text, 1000, "\n")
					for (let i = 0, len = msgs.length; i < len; i++) {
						if (i == 0) {
							infoEmbed.addFields({ name: "__Known Username History__", value: msgs[i] })
						} else {
							infoEmbed.addFields({ name: `__Known Username History (${i + 1})__`, value: msgs[i] })
						}


					}

				}


				// reply with the embed
				interaction.reply({ embeds: [infoEmbed] })
				break
			}
			case 'guild': { // TODO
				console.log(interaction.guild)
				const guild = await interaction.guild.fetch()
				const channels = await interaction.guild.channels.fetch()
				const channels2 = interaction.guild.channels.cache
				console.log(channels)
				const textChannelCount = channels.filter(i => i.isTextBased()).size
				const voiceChannelCount = channels.filter(i => i.isVoiceBased()).size
				const activeThreadChannelCount = (await guild.channels.fetchActiveThreads()).threads.filter(i => !i.archived).size
				const archivedThreadChannelCount = (await guild.channels.fetchActiveThreads()).threads.filter(i => i.archived).size
				const threadChannelCount = channels2.filter(i => i.isThread()).size

				const roles = await guild.roles.fetch()
				const roleCount = roles.size
				const managedRoleCount = roles.filter(role => role.managed).size

				const members = await guild.members.fetch({ withPresences: true })
				const memberCount = guild.memberCount


				const onlineMembers = members.filter(member =>
					member.presence?.status === 'online' ||
					member.presence?.status === 'dnd' ||
					member.presence?.status === 'idle'
				)
				const onlineMemberCount = onlineMembers.size

				const botMemberCount = members.filter(member => member.user.bot).size
				const onlineBotMemberCount = onlineMembers.filter(member => member.user.bot).size


				const embed = new EmbedBuilder()
					.setTitle(`${guild.name} (${guild.id})`)
					.setFields(
						{ name: "Description", value: `${guild.description}` },
						{ name: "**Owner**", value: `<@${guild.ownerId}>` },
						{ name: "**Created at**", value: `<t:${guild.createdTimestamp.toString().slice(0, -3)}:f>` },
						{
							name: "__**Channels**__", value:
								stripIndent`
								**Total**: ${channels.size}
								**Text Channels**: ${textChannelCount}
								**Voice Channels**: ${voiceChannelCount}
								**Thread Channels**: ${activeThreadChannelCount} active of ${threadChannelCount}
							`
						},
						{
							name: "__**Roles**__", value:
								stripIndent`
								**Total**: ${roleCount}
								**Roles**: ${roleCount - managedRoleCount}
								**Bot (aka Managed) Roles**: ${managedRoleCount}
							`
						},
						{
							name: "__**Members**__", value:
								stripIndent`
								**Total**: ${memberCount} | ${memberCount - botMemberCount} Users, ${botMemberCount} Bots
								**Online**: ${onlineMemberCount} | ${onlineMemberCount - onlineBotMemberCount} Users, ${onlineBotMemberCount} Bots
							`
						}
					)
					.setThumbnail(guild.iconURL())

				interaction.reply({ embeds: [embed] })
				break


			}
			case 'bot': {
				const client = interaction.client
				const user = client.user
				// console.log(client)

				const users: object = await database.get(".users")
				console.log(Object.keys(users).length)


				const infoEmbed = new EmbedBuilder()
					.setColor(`#f9beca`)
					.setTitle(`__${user.username}#${user.discriminator}__`)
					.setThumbnail(`${user.avatarURL({ forceStatic: false })}?size=4096`)
					//.setAuthor({ name: 'Some name', iconURL: 'https://i.imgur.com/AfFp7pu.png', url: 'https://discord.js.org' })
					.setDescription(`**ID**: ${user.id}\n**Created at**: <t:${user.createdTimestamp.toString().slice(0, -3)}:f>`)
					.addFields(
						{
							name: '__Stats__', value:
								stripIndents`**Guilds**: ${client.guilds.cache.size}
							**Total Channels**: ${client.channels.cache.size}
							**Total Members**: ${client.users.cache.size}
							**Total Members2**: ${""}`
						},
						// {
						// 	name: '__System Info__', value:
						// 		stripIndent`

						// 		`
						// 	// **Load**: ${glances.load.min1.toFixed(2)} ${glances.load.min5.toFixed(2)} ${glances.load.min15.toFixed(2)} 
						// 	// **Uptime**: ${glances.uptime}
						// 	// **CPU**:
						// 	// 　　*Cores*: ${glances.core.phys} | ${glances.core.log}
						// 	// 　　*Usage*: ${glances.cpu.total}
						// 	// **Memory**:
						// 	// 　　*Used*: ${(glances.mem.used / 1073741824).toFixed(2)}G / ${(glances.mem.total / 1073741824).toFixed(2)}G
						// 	// 　　*Percent*: ${glances.mem.percent}
						// 	// 　　\`${format.bar(0, glances.mem.used, glances.mem.total, 25, true)}\`

						// },
					)
				//
				interaction.reply({ embeds: [infoEmbed] })
				break
			}
		}

	},
})