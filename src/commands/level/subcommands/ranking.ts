import { ChatInputCommandInteraction, GuildMember } from "discord.js"
import { Subcommand } from "../../../types/ApplicationCommand"
import { UserSchema } from "../../../types/Database"
import calc from "../../../utils/calc"
import database from "../../../utils/database"
import format from "../../../utils/format"

export default {
	name: "ranking",
	execute: async (interaction: ChatInputCommandInteraction) => {
		const guild = interaction.guild

		const extended = interaction.options.getBoolean("extended")
		await interaction.deferReply()

		// some terrible way to sort by xp
		const users = await database.get<UserSchema[]>(
			`.guilds.${interaction.guild.id}.users`,
		)
		const usersArray = []
		const guildUsers = await guild.members.fetch()
		const idList = guildUsers.map((i) => i.id)
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

		const sortedArray = usersArray
			.sort((a, b) => b[1] - a[1])
			.slice(0, limit)
		const members = await guild.members.fetch()

		let output = ""
		let rank = 1
		for (let i = 0, len = sortedArray.length; i < len; i++) {
			const memberid = sortedArray[i][0]
			let member: GuildMember
			member = members.find((m) => m.id == memberid)

			if (members.has(memberid)) {
				const xp = sortedArray[i][1]
				const progress = calc.levelProgress(xp)
				const level = calc.level(xp)
				const xpLower = calc.xp(level)
				const xpHigher = calc.xp(level + 1)
				output += `\`#${rank}\` - ${
					member.displayName
				} ${member} - Level ${calc.level(xp)} (${format.numberCommas(
					xp,
				)} xp)\n`
				output += `\`[${format.bar(
					0,
					progress,
					1,
					25,
				)}]\`\n${format.numberCommas(level)} (${format.numberCommas(
					xpLower,
				)} xp) - ${format.numberCommas(
					level + 1,
				)} (${format.numberCommas(xpHigher)} xp)\n`
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
				await interaction.editReply({
					content: `__**Top ${limit} ranking:**__\n${message}`,
					allowedMentions: { users: [], repliedUser: false },
				})
			} else
				await interaction.followUp({
					content: message,
					allowedMentions: { users: [], repliedUser: false },
				})
		}
	},
} satisfies Subcommand
