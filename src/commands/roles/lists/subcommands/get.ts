import { ChatInputCommandInteraction } from "discord.js"
import { Subcommand } from "../../../../types/ApplicationCommand"
import database from "../../../../utils/database"
import embeds from "../../../../utils/embeds"
import { RoleList, getRoles } from "../../roles"

/**
 * /roles lists get
 */
export default {
	name: "get",
	execute: async (interaction: ChatInputCommandInteraction) => {
		const rolelists = await database.get<RoleList[]>(
			`.guilds.${interaction.guild.id}.roles.lists`,
		)
		if (
			!interaction.options.getString("name") ||
			interaction.options.getString("name") == "all"
		) {
			const roles = await getRoles(interaction)
			//options = roles.map(r => r = { label: r.name, value: r.id })
			//console.log("options: ", options)
			const tagList = []
			for (const [key, value] of roles) {
				console.log(`${key} goes ${value}`)
				console.log(`${value.name}`)
				if (value.name != `@everyone`) tagList.push(`<@&${value.id}>`)
				else tagList.push(`@everyone`)
			}
			let roleliststext = ""
			let count = 0
			for (const i in rolelists) {
				roleliststext += `${rolelists[i].name} - ${rolelists[i].roles.length}\n`
				count++
			}

			console.log(tagList)
			await interaction.reply({
				embeds: embeds.messageEmbed(
					`Roles - ${tagList.length}`,
					tagList.join("\n"),
				),
			})
			await interaction.followUp({
				embeds: embeds.messageEmbed(
					`Role Lists - ${count}`,
					roleliststext,
				),
			})
			// TODO: add rolelists
		} else {
			console.log(JSON.stringify(rolelists))
			for (const i in rolelists) {
				if (
					rolelists[i].name == interaction.options.getString("name")
				) {
					interaction.reply({
						embeds: embeds.messageEmbed(
							`Roles List - ${rolelists[i].name} - ${rolelists[i].roles.length}`,
							rolelists[i].roles
								.map((r) => `${r.emoji} <@&${r.id}>`)
								.join("\n"),
						),
					})
				}
			}
		}
	},
} satisfies Subcommand
