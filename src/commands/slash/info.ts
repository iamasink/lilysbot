const { SlashCommandBuilder, SlashCommandSubcommandBuilder, EmbedBuilder } = require('discord.js')
const database = require('../../structure/database')
const calc = require('../../structure/calc')
const format = require('../../structure/format')


// function fetchPromise(toFetch) {
// 	return new Promise((resolve, reject) => {
// 		try {
// 			resolve(toFetch.fetch(true))
// 		} catch { reject() }
// 	})
// }


function formattext(val, name, append = ``, fallback) {
	output = `\n**${name}**: `
	if (val != undefined && val != null) {
		output += `${val}${append}`
	} else {
		if (fallback) output += `${fallback}${append}`
		else output = ``
	}
	return output
}


export default {
	data: new SlashCommandBuilder()
		.setName('info')
		.setDescription('Retrieves info...')
		.addSubcommand(subcommand =>
			subcommand
				.setName('user')
				.setDescription('Info about a user')
				.addUserOption((option: any) => option.setName('target').setDescription('A user. Ping or ID').setRequired(true))
				.addStringOption((option: any) => option
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

	async execute(interaction: any) {
		//console.log(`intercation: ${JSON.stringify(interaction)}`)
		switch (interaction.options.getSubcommand()) {
			case 'user': {
				console.log(interaction.options)
				// get target user, if not, the user that created the interaction (ie called the command)
				user = interaction.options.getUser('target')
				console.log(user)
				// fetches the user so their banner, accent colour is available
				user = await user.fetch()

				console.log(interaction.options.getString('info'))

				if (interaction.guild.members.resolve(user)) {
					member = interaction.guild.members.resolve(user)
				}

				// if they are in this guild and have a guild avatar, set their guild avatar url
				if (member && member.avatar != undefined) {
					gavURL = `https://cdn.discordapp.com/guilds/${interaction.guild.id}/users/${user.id}/avatars/${member.avatar}.webp`
				} else { gavURL = null }

				// format each thing 
				a = formattext(user.hexAccentColor, `Accent color`)
				av = formattext(user.avatarURL(true), `Avatar URL`, `?size=4096`, `https://cdn.discordapp.com/embed/avatars/${user.discriminator % 5}.png`)
				gav = formattext(gavURL, `Guild Avatar URL`, `?size=4096`)
				b = formattext(user.bannerURL(true), `Banner URL`, `?size=4096`)

				// if user has an avatar, set thumbnail to avatar
				if (user.avatarURL(true)) {
					thumb = user.avatarURL(true)
				} // else set it to default avatar (calculated by discrim modulo 5)
				else { thumb = `https://cdn.discordapp.com/embed/avatars/${user.discriminator % 5}.png` }

				// sets image and image name to whatever was specified
				if (user.avatarURL(true)) {
					avatar = user.avatarURL(true)
				} else {
					avatar = `https://cdn.discordapp.com/embed/avatars/${user.discriminator % 5}.png`
				}



				switch (interaction.options.getString('show')) {
					case 'avatar': {
						image = avatar
						imagename = `avatar`
						break
					}
					case 'banner': {
						if (b) {
							image = user.bannerURL(true)
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
							image = user.bannerURL(true)
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
					.setTitle(`__${user.username}#${user.discriminator}__`)
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
				throw ("NotImplementedError")

				//})

				break


			}
			case 'bot': {
				client = interaction.client
				user = client.user
				console.log(client)
				console.log(client.guilds.size)


				const infoEmbed = new EmbedBuilder()
					.setColor(`#f9beca`)
					.setTitle(`__${user.username}#${user.discriminator}__`)
					.setThumbnail(`${user.avatarURL(true)}?size=4096`)
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
}