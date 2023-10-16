import { ChatInputCommandInteraction, GuildMember, SlashCommandBuilder } from 'discord.js'
import ApplicationCommand from '../types/ApplicationCommand'
import database from '../utils/database'
import calc from '../utils/calc'
import embeds from '../utils/embeds'
import format from '../utils/format'
import { client } from '..'


function fetchPromise(toFetch) {
	return new Promise((resolve, reject) => {
		try {
			resolve(toFetch.fetch(true))
		} catch { reject() }
	})
}

export default new ApplicationCommand({
	data: new SlashCommandBuilder()
		.setName('level')
		.setDescription('Retrieves level...')
		.addSubcommand(command => command
			.setName('get')
			.setDescription('get a users level')
			.addUserOption(option => option
				.setName('target')
				.setDescription('A user. Ping or ID')
				.setRequired(false)
			)
		)
		.addSubcommand(command => command
			.setName('ranking')
			.setDescription('see a list of the highest levels')
			.addBooleanOption(option => option
				.setName("extended")
				.setDescription("add a description here :O")
			)
		)
	,
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		// get the guild
		const guild = interaction.guild

		switch (interaction.options.getSubcommand()) {
			case 'get': {
				// get the user from the option, if no user is provided get the user who ran the command
				const user = interaction.options.getUser('target') || interaction.user
				// get the user's xp from the database
				const xp: number = await database.get(`.guilds.${guild.id}.users.${user.id}.xp`) || 0
				//console.log(xp)
				// calculate the level progress and stuff
				const progress = calc.levelProgress(xp)
				const level = calc.level(xp)
				const xpLower = calc.xp(level)
				const xpHigher = calc.xp(level + 1)
				// send an embed with the information
				const embed = await embeds.profileEmbed(
					`${user.username}'s level`,
					`**Level ${format.numberCommas(level)} (${format.numberCommas(xp)} xp)** \n\`[${format.bar(0, progress, 1, 25)}]\`\n${format.numberCommas(level)} (${format.numberCommas(xpLower)} xp) - ${format.numberCommas(level + 1)} (${format.numberCommas(xpHigher)} xp)`, null, user, interaction.guild)
				interaction.reply({ embeds: embed })


				break
			}
			case 'ranking': {
				const extended = interaction.options.getBoolean("extended")
				await interaction.deferReply()

				// some terrible way to sort by xp
				const users = await database.get(`.guilds.${interaction.guild.id}.users`)
				const usersArray = []
				const guildUsers = await guild.members.fetch()
				const idList = guildUsers.map(i => i.id)
				// console.log(idList)

				for (let key in users) {
					//console.log(key, users[key])
					if (!idList.includes(key)) {
						continue
					}
					if (!users[key].xp) continue
					usersArray.push([key, users[key].xp])
				}

				let limit: number
				if (extended) {
					limit = 100
				} else {
					limit = 10
				}

				const sortedArray = usersArray.sort((a, b) => b[1] - a[1]).slice(0, limit)
				const members = await guild.members.fetch()

				let output = ''
				let rank = 1
				for (let i = 0, len = sortedArray.length; i < len; i++) {
					const memberid = sortedArray[i][0]
					let member: GuildMember
					member = members.find(m => m.id == memberid)

					if (members.has(memberid)) {
						const xp = sortedArray[i][1]
						const progress = calc.levelProgress(xp)
						const level = calc.level(xp)
						const xpLower = calc.xp(level)
						const xpHigher = calc.xp(level + 1)
						output += `\`#${rank}\` - ${(member.displayName)} ${(member)} - Level ${calc.level(xp)} (${format.numberCommas(xp)} xp)\n`
						output += `\`[${format.bar(0, progress, 1, 25)}]\`\n${format.numberCommas(level)} (${format.numberCommas(xpLower)} xp) - ${format.numberCommas(level + 1)} (${format.numberCommas(xpHigher)} xp)\n`
						rank++
					} else {
						// the member's probably left. Kind of an L not going to lie..
						// output += `\`#${i + 1}\` - <@${(memberid)}> - Level ${calc.level(sortedArray[i][1])}\n`
					}
				}


				const messages = format.splitMessage(output, 1500)
				for (let i = 0, len = messages.length; i < len; i++) {
					const message = messages[i]
					if (i == 0) {
						await interaction.editReply({ content: `__**Top ${limit} ranking:**__\n${message}`, allowedMentions: { users: [], repliedUser: false } })
					}
					else await interaction.followUp({ content: message, allowedMentions: { users: [], repliedUser: false } })
				}




				break
			}
		}
	},
})