import { ChatInputCommandInteraction } from "discord.js"

import { Subcommand } from "../../../types/ApplicationCommand"

import commands from "../../../utils/commands"
import database from "../../../utils/database"
import embeds from "../../../utils/embeds"

export default {
	name: "alias",
	execute: async (
		interaction: ChatInputCommandInteraction,
		client,
	): Promise<void> => {
		const alias = interaction.options.getString("alias")?.toLowerCase()
		console.log("alias: " + alias)

		const guildID = interaction.guild.id
		const path = `.guilds.${guildID}.commands.aliases`
		const aliasPath = path + "." + alias
		var value: string
		var exists: boolean

		if (alias) {
			try {
				value = await database.get(aliasPath)
			} catch (e) {
				value = undefined
			}
			console.log(`value: ${value}`)
			if (value) exists = true
			else exists = false
		}

		switch (interaction.options.getSubcommand()) {
			case "create": {
				if (exists) throw new Error(`$${aliasPath} already exists`)

				// check if there is a command already named as this alias, and prevent that
				if (client.commands.has(alias))
					throw new Error(`${alias} is an already existing command`)
				if ((await interaction.guild.commands.fetch()).has(alias))
					throw new Error(
						`${alias} is an already existing guild command`,
					)

				try {
					const command = interaction.options.getString("commandname")
					const group = interaction.options.getString("group")
					const subcommand =
						interaction.options.getString("subcommand")
					const defaultoptions = JSON.parse(
						interaction.options.getString("defaultoptions"),
					)
					const hidealloptions =
						interaction.options.getBoolean("hidealloptions")
					const description =
						interaction.options.getString("description")
					console.log(defaultoptions)

					const data = {
						commandname: command,
						group: group,
						subcommand: subcommand,
						defaultoptions: defaultoptions || [],
						hidedefaults: true,
						hidealloptions: hidealloptions,
						description: description,
					}
					await database.set(aliasPath, data)
					commands.refreshGuild(guildID)

					interaction.reply({
						embeds: embeds.successEmbed(
							"Created alias successfully",
						),
					})
				} catch (err) {
					// interaction.reply({
					// 	embeds: embeds.errorEmbed(
					// 		"Creating alias",
					// 		err,
					// 	),
					// })
					throw new Error(
						`Alias $${aliasPath} could not be created\n${err}`,
					)
				}
				break
			}
			case "remove": {
				if (!exists) throw new Error(`${aliasPath} does not exist`)
				try {
					await database.del(aliasPath)
					commands.refreshGuild(guildID)
					interaction.reply({
						embeds: embeds.successEmbed(
							"Removed alias successfully",
						),
					})
				} catch (err) {
					interaction.reply({
						embeds: embeds.errorEmbed("Removing alias", err),
					})
				}

				break
			}
			case "list": {
				value = await database.get(path)
				await interaction.reply({
					embeds: embeds.messageEmbed("List:", JSON.stringify(value)),
				})
				break
			}
		}
	},
} satisfies Subcommand
