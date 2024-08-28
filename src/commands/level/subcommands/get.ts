import { ChatInputCommandInteraction } from "discord.js"
import { Subcommand } from "../../../types/ApplicationCommand"
import calc from "../../../utils/calc"
import database from "../../../utils/database"
import embeds from "../../../utils/embeds"
import format from "../../../utils/format"

export default {
	name: "get",
	execute: async (interaction: ChatInputCommandInteraction) => {
		const guild = interaction.guild

		// get the user from the option, if no user is provided get the user who ran the command
		const user = interaction.options.getUser("target") || interaction.user
		// get the user's xp from the database
		const xp: number =
			(await database.get(`.guilds.${guild.id}.users.${user.id}.xp`)) || 0
		//console.log(xp)
		// calculate the level progress and stuff
		const progress = calc.levelProgress(xp)
		const level = calc.level(xp)
		const xpLower = calc.xp(level)
		const xpHigher = calc.xp(level + 1)
		// send an embed with the information
		const embed = await embeds.profileEmbed(
			`${user.username}'s level`,
			`**Level ${format.numberCommas(level)} (${format.numberCommas(
				xp,
			)} xp)** \n\`[${format.bar(
				0,
				progress,
				1,
				25,
			)}]\`\n${format.numberCommas(level)} (${format.numberCommas(
				xpLower,
			)} xp) - ${format.numberCommas(level + 1)} (${format.numberCommas(
				xpHigher,
			)} xp)`,
			null,
			user,
			interaction.guild,
		)
		interaction.reply({ embeds: embed })
	},
} satisfies Subcommand
