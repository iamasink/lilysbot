import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import ApplicationCommand from '../types/ApplicationCommand'
import database from '../utils/database'
import calc from '../utils/calc'
import embeds from '../utils/embeds'
import format from '../utils/format'


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
		),
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

				// some terrible way to sort by xp
				const users = await database.get(`.guilds.${interaction.guild.id}.users`)
				const usersArray = []
				for (let key in users) {
					console.log(key, users[key])
					users[key]
					if (!users[key].xp) continue
					usersArray.push([key, users[key].xp])
				}

				usersArray.sort((a, b) => b[1] - a[1]).slice(0, 10)

				let output = ''
				for (let i = 0, len = usersArray.length; i < len; i++) {
					const member = await guild.members.fetch(usersArray[i][0])
					output += `\`#${i + 1}\` - ${(member.nickname || member.user.username)} ${(member)} - Level ${calc.level(usersArray[i][1])}\n`
				}


				interaction.reply({ content: output, allowedMentions: { users: [], repliedUser: false } })
				break
			}
		}
	},
})