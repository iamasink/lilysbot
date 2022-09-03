const { SlashCommandBuilder, SlashCommandSubcommandBuilder, EmbedBuilder } = require('discord.js')

function fetchPromise(toFetch) {
	return new Promise((resolve, reject) => {
		try {
			resolve(toFetch.fetch(true))
		} catch { reject() }
	})
}


function format(val, name, append = ``) {
	output = `\n**${name}**: `
	if (val != undefined) {
		output += `${val}${append}`
	} else {
		output = ``
	}
	return output
}


module.exports = {
	data: new SlashCommandBuilder()
		.setName('info')
		.setDescription('Retrieves info...')
		.addSubcommand(subcommand =>
			subcommand
				.setName('user')
				.setDescription('Info about a user')
				.addUserOption(option => option.setName('target').setDescription('A user. Ping or ID'))
				.addStringOption(option => option
					.setName('show')
					.setDescription('Image to show. The main avatar will be shown if selected image is unavailable')
					.addChoices(
						{ name: 'avatar', value: 'avatar' },
						{ name: 'guild avatar', value: 'guild avatar' },
						{ name: 'banner', value: 'banner' }

					)

				)
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('guild')
				.setDescription('Info about the guild')
		),

	async execute(interaction) {
		switch (interaction.options.getSubcommand()) {
			case 'user': {
				const user = interaction.options.getUser('target') || interaction.user

				console.log(interaction.options.getString('info'))
				fetchPromise(user).then(user => {

					if (interaction.guild.members.resolve(user).avatar != undefined) {
						gavURL = `https://cdn.discordapp.com/guilds/${interaction.guild.id}/users/${user.id}/avatars/${interaction.guild.members.resolve(user).avatar}.webp`
					} else { gavURL = undefined }
					a = format(user.hexAccentColor, `Accent color`)
					av = format(user.avatarURL(true), `Avatar URL`, `?size=4096`)
					gav = format(gavURL, `Guild Avatar URL`, `?size=4096`)
					b = format(user.bannerURL(true), `Banner URL`, `?size=4096`)

					switch (interaction.options.getString('show')) {
						case 'avatar': {
							image = user.avatarURL(true)
							imagename = `avatar`
							break
						}
						case 'banner': {
							if (b) {
								image = user.bannerURL(true)
								imagename = `banner`
							} else {
								image = user.avatarURL(true)
								imagename = `avatar`
							}
							break
						}
						case 'guild avatar': {
							if (gav) {
								image = gavURL
								imagename = `guild avatar`
							} else {
								image = user.avatarURL(true)
								imagename = `avatar`
							}
							break
						}
						default: {
							if (b) {
								image = user.bannerURL(true)
								imagename = `banner`
							} else {
								image = user.avatarURL(true)
								imagename = `avatar`
							}
							break
						}
					}



					// inside a command, event listener, etc.
					const exampleEmbed = new EmbedBuilder()
						.setColor(user.hexAccentColor)
						.setTitle(`__${user.username}#${user.discriminator}__`)
						.setThumbnail(`${user.avatarURL(true)}?size=4096`)
						//.setAuthor({ name: 'Some name', iconURL: 'https://i.imgur.com/AfFp7pu.png', url: 'https://discord.js.org' })
						.setDescription(`**ID**: ${user.id}\n**Created at**: <t:${user.createdTimestamp.toString().slice(0, -3)}:f>`)
						.addFields(
							{
								name: '__Profile__', value: `${a}${av}${gav}${b}\n\nShowing ${imagename}:`
							},
						)

						.setImage(`${image}?size=4096`)

					//.setTimestamp()
					//.setFooter({ text: 'Some footer text here', iconURL: 'https://i.imgur.com/Gu1Ggxt.png' })

					interaction.reply({ embeds: [exampleEmbed] })
				})
				break
			}
			case 'guild': {
				console.log(interaction.guild)
				const guild = interaction.guild
				//				fetchPromise(guild).then(async guild => {
				// 					info = `${format(guild.name, `Name`)
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
				await interaction.reply(`An error occurred`)

				//})

				break


			}
		}

	},
}