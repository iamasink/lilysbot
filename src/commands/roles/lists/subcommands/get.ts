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
		const rolelists = await database.get<RoleList>(
			`.guilds.${interaction.guild.id}.roles.lists`,
		)

		if (!Object.keys(rolelists).length) {
			// Nothing to get since there's no roles lists created
			// Should this still display all roles?
			// TODO Update error message
			interaction.reply(
				"There's no created role lists to get. Create one first",
			)
			return
		}

		const rolelistsArray = Object.values(rolelists)

		const listName = interaction.options.getString("name")

		// User specified list name - /role lists get <name>
		if (listName && listName !== "all") {
			// Find the specified list name in rolelists
			const roleList = rolelistsArray.find(
				(list) => list.name == listName,
			)

			// Can't find
			if (!roleList) {
				// TODO Update error message
				interaction.reply(`Couldn't find specified role list name`)
				return
			}

			// Send list
			interaction.reply({
				embeds: embeds.messageEmbed(
					`Roles List - ${roleList.name} - ${roleList.roles.length}`,
					roleList.roles
						.map((r) =>
							// Add role emoji if its available else just mention the role
							r.emoji ? `${r.emoji} <@&${r.id}>` : `<@&${r.id}>`,
						)
						.join("\n"),
				),
			})

			return
		}

		// Default to all list
		const roles = await getRoles(interaction)

		const tagList = roles.map((role) =>
			role.name !== "@everyone" ? `<@&${role.id}>` : `@everyone`,
		)

		const roleListsText = rolelistsArray
			.map((list) => `${list.name} - ${list.roles.length}`)
			.join("\n")

		await interaction.reply({
			embeds: embeds.messageEmbed(
				`Roles - ${tagList.length}`,
				tagList.join("\n"),
			),
		})

		await interaction.followUp({
			embeds: embeds.messageEmbed(
				`Role Lists - ${rolelistsArray.length}`,
				roleListsText,
			),
		})

		// TODO: add rolelists
	},
} satisfies Subcommand
