import { Interaction, ChatInputCommandInteraction, GuildMember, SlashCommandBuilder, SlashCommandSubcommandBuilder, EmbedBuilder } from "discord.js"
import database from "../utils/database"
import format from "../utils/format"
import ApplicationCommand from "../types/ApplicationCommand"


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
		.setDescription('Retrieves info...')
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
						{ name: 'hide', value: 'hide' }

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
		),

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
				const av = formatlink(user.avatarURL({ forceStatic: true }), `Avatar URL`, `?size=4096`, `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator) % 5}.png`)
				const gav = formatlink(gavURL, `Guild Avatar URL`, `?size=4096`)
				const b = formatlink(user.bannerURL({ forceStatic: true }), `Banner URL`, `?size=4096`)

				let thumb: string
				let avatar: string

				// if user has an avatar, set thumbnail to avatar
				if (user.avatarURL({ forceStatic: true })) {
					thumb = user.avatarURL({ forceStatic: true })
				} // else set it to default avatar (calculated by discrim modulo 5)
				else { thumb = `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator) % 5}.png` }

				// sets image and image name to whatever was specified
				if (user.avatarURL({ forceStatic: true })) {
					avatar = user.avatarURL({ forceStatic: true })
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
							image = user.bannerURL({ forceStatic: true })
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
					default: { // if no option was specified, default to banner || avatar
						if (b) {
							image = user.bannerURL({ forceStatic: true })
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
					.setTitle(`__${user.username.replace(/[\\"']/g, '\\$&')}#${user.discriminator}__`)
					.setThumbnail(thumb)
					//.setAuthor({ name: 'Some name', iconURL: 'https://i.imgur.com/AfFp7pu.png', url: 'https://discord.js.org' })
					.setDescription(`<@${user.id}>\n**ID**: ${user.id}\n**Created at**: <t:${user.createdTimestamp.toString().slice(0, -3)}:f>\n(${format.time(Date.now() - user.createdTimestamp)})`)



				//.setTimestamp()
				//.setFooter({ text: 'Some footer text here', iconURL: 'https://i.imgur.com/Gu1Ggxt.png' })
				if (interaction.options.getString('show') != 'hide') {
					infoEmbed.addFields({ name: '__Profile__', value: `${a}${av}${gav}${b}\n`, })

					const invitedLink = await database.get(`.guilds.${member.guild.id}.users.${member.id}.invitedLink`)
					const invited = invitedLink ? `${invitedLink}` : `*Unknown*`

					var guildtext = `**Joined at:** <t:${member.joinedTimestamp.toString().slice(0, -3)}:f> (${format.time(Date.now() - member.joinedTimestamp)} ago)`
					guildtext += `\n**Invited by:** ${invited}`


					if (member) infoEmbed.addFields({ name: '__Guild__', value: guildtext })
					if (image) infoEmbed.addFields({ name: `\u200b`, value: `**Showing ${imagename}:**` })
					if (image) infoEmbed.setImage(`${image}?size=4096`)
				}

				// reply with the embed
				interaction.reply({ embeds: [infoEmbed] })
				break
			}
			case 'guild': { // TODO
				console.log(interaction.guild)
				const guild = interaction.guild
				//				fetchPromise(guild).then(async guild => {
				// 					info = `${ format(guild.name, `Name`)
				// 						}
				// ${format(guild.nameAcronym, `nameAcronym`)
				// 						}
				// ${format(guild.approximateMemberCount, `approximateMemberCount`)}
				// ${format(guild.approximatePresenceCount, `approximatePresenceCount`)}
				// ${format(guild.available, `available`)}
				// ${format(guild.banner, `banner`)}
				// ${format(guild.createdAt, `createdAt`)}
				// ${format(guild.createdTimestamp, `createdTimestamp`)}
				// ${format(guild.description, `description`)}
				// ${format(guild.discoverySplash, `discoverySplash`)} `
				// 					info2 = `${format(guild.explicitContentFilter, `explicitContentFilter`)}
				// ${format(guild.features, `features`)}
				// ${format(guild.icon, `icon`)}
				// ${format(guild.id, `id`)}
				// ${format(guild.joinedAt, `joinedAt`)}
				// ${format(guild.joinedTimestamp, `joinedTimestamp`)}
				// ${format(guild.large, `large`)}
				// ${format(guild.maximumBitrate, `maximumBitrate`)}
				// ${format(guild.maximumMembers, `maximumMembers`)} `
				// 					info3 = `${format(guild.maximumPresences, `maximumPresences`)}
				// ${format(guild.memberCount, `memberCount`)}
				// ${format(guild.mfaLevel, `mfaLevel`)}
				// ${format(guild.nsfwLevel, `nsfwLevel`)}
				// ${format(guild.ownerId, `ownerId`)}
				// ${format(guild.partnered, `partnered`)}
				// ${format(guild.preferredLocale, `preferredLocale`)}
				// ${format(guild.premiumProgressBarEnabled, `premiumProgressBarEnabled`)}
				// ${format(guild.premiumSubscriptionCount, `premiumSubscriptionCount`)}
				// ${format(guild.premiumTier, `premiumTier`)} `
				// 					info4 = `${format(guild.shard, `shard`)}
				// ${format(guild.shardId, `shardId`)}
				// ${format(guild.splash, `splash`)}
				// ${format(guild.systemChannel, `systemChannel`)}
				// ${format(guild.vanityURLCode, `vanityURLCode`)} `
				// 					info5 = `${format(guild.vanityURLUses, `vanityURLUses`)}
				// ${format(guild.verificationLevel, `verificationLevel`)}
				// ${format(guild.verified, `verified`)}
				// ${format(guild.widgetChannel, `widgetChannel`)}
				// ${format(guild.widgetChannelId, `widgetChannelId`)}
				// ${format(guild.widgetEnabled, `widgetEnabled`)} `
				throw new Error("Not Implemented")



			}
			case 'bot': {
				const client = interaction.client
				const user = client.user
				console.log(client)


				const infoEmbed = new EmbedBuilder()
					.setColor(`#f9beca`)
					.setTitle(`__${user.username}#${user.discriminator}__`)
					.setThumbnail(`${user.avatarURL({ forceStatic: true })}?size=4096`)
					//.setAuthor({ name: 'Some name', iconURL: 'https://i.imgur.com/AfFp7pu.png', url: 'https://discord.js.org' })
					.setDescription(`**ID**: ${user.id}\n**Created at**: <t:${user.createdTimestamp.toString().slice(0, -3)}:f>`)
					.addFields(
						{
							name: '__Stats__', value: `**Guilds**: ${client.guilds.cache.size}\n**Total Channels**: ${client.channels.cache.size}\n**Total Members**: ${client.users.cache.size}\n`
						},
					)
				//
				interaction.reply({ embeds: [infoEmbed] })

			}
		}

	},
})