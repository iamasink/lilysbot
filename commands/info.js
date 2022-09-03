const { SlashCommandBuilder, SlashCommandSubcommandBuilder } = require('discord.js')

function fetchPromise(toFetch) {
	return new Promise((resolve, reject) => {
		try {
			resolve(toFetch.fetch(true))
		} catch { reject() }
	})
}


function exists(val, name) {
	output = `${name}: `
	if (val != undefined) {
		output += `${val}`
	} else {
		output += `Not found`
	}
	console.log(output)
	return output
}

function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1)
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('info')
		.setDescription('Retrieves info...')
		.addSubcommand(subcommand =>
			subcommand
				.setName('user')
				.setDescription('Info about a user')
				.addUserOption(option => option.setName('target').setDescription('The user'))
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
					info = `${exists(user.username, `Username`)}
${exists(user.discriminator, `Discriminator`)}
${exists(user.bot, `Bot`)}
${exists(user.system, `System`)}
${exists(user.createdAt, `Created at`)}
${exists(user.createdTimestamp, `Created timestamp`)}
${exists(user.hexAccentColor, `Accent color`)}
${exists(user.bannerURL(true), `banner`)} 
${exists(user.avatarURL(true), `avatar`)}
		`
					interaction.reply(info)
				})
				break
			}
			case 'guild': {
				console.log(interaction.guild)
				const guild = interaction.guild

				fetchPromise(guild).then(async guild => {
					info = `${exists(guild.name, `Name`)}
${exists(guild.nameAcronym, `nameAcronym`)}
${exists(guild.approximateMemberCount, `approximateMemberCount`)}
${exists(guild.approximatePresenceCount, `approximatePresenceCount`)}
${exists(guild.available, `available`)}
${exists(guild.banner, `banner`)}
${exists(guild.createdAt, `createdAt`)}
${exists(guild.createdTimestamp, `createdTimestamp`)}
${exists(guild.description, `description`)}
${exists(guild.discoverySplash, `discoverySplash`)}`
					info2 = `${exists(guild.explicitContentFilter, `explicitContentFilter`)}
${exists(guild.features, `features`)}
${exists(guild.icon, `icon`)}
${exists(guild.id, `id`)}
${exists(guild.joinedAt, `joinedAt`)}
${exists(guild.joinedTimestamp, `joinedTimestamp`)}
${exists(guild.large, `large`)}
${exists(guild.maximumBitrate, `maximumBitrate`)}
${exists(guild.maximumMembers, `maximumMembers`)}`
					info3 = `${exists(guild.maximumPresences, `maximumPresences`)}
${exists(guild.memberCount, `memberCount`)}
${exists(guild.mfaLevel, `mfaLevel`)}
${exists(guild.nsfwLevel, `nsfwLevel`)}
${exists(guild.ownerId, `ownerId`)}
${exists(guild.partnered, `partnered`)}
${exists(guild.preferredLocale, `preferredLocale`)}
${exists(guild.premiumProgressBarEnabled, `premiumProgressBarEnabled`)}
${exists(guild.premiumSubscriptionCount, `premiumSubscriptionCount`)}
${exists(guild.premiumTier, `premiumTier`)}`
					info4 = `${exists(guild.shard, `shard`)}
${exists(guild.shardId, `shardId`)}
${exists(guild.splash, `splash`)}
${exists(guild.systemChannel, `systemChannel`)}
${exists(guild.vanityURLCode, `vanityURLCode`)}`
					info5 = `${exists(guild.vanityURLUses, `vanityURLUses`)}
${exists(guild.verificationLevel, `verificationLevel`)}
${exists(guild.verified, `verified`)}
${exists(guild.widgetChannel, `widgetChannel`)}
${exists(guild.widgetChannelId, `widgetChannelId`)}
${exists(guild.widgetEnabled, `widgetEnabled`)}`

					await interaction.reply(info)
					await interaction.followUp(info2)
					await interaction.followUp(info3)
					await interaction.followUp(info4)
					await interaction.followUp(info5)






				})
				break


			}
		}

	},
}