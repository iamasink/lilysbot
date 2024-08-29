import { ChatInputCommandInteraction } from "discord.js"
import { Subcommand } from "../../../../types/ApplicationCommand"
import database from "../../../../utils/database"
import embeds from "../../../../utils/embeds"
import { RoleList } from "../../roles"

/**
 * /roles lists delete
 */
export default {
	name: "delete",
	execute: async (interaction: ChatInputCommandInteraction) => {
		const rolelists = await database.get<RoleList>(
			`.guilds.${interaction.guild.id}.roles.lists`,
		)
		const rolelist = interaction.options.getString("name")

		// No Roles Lists - nothing to delete
		if (!Object.keys(rolelists).length) {
			// TODO Update error message
			interaction.reply("No role list available to be deleted.")
			return
		}

		try {
			await database.del(
				`.guilds.${interaction.guild.id}.roles.lists.${rolelist}`,
			)
			interaction.reply({
				embeds: embeds.successEmbed(`Successfully deleted ${rolelist}`),
			})
		} catch (e) {
			throw new Error(`Couldn't delete rolelist\n${e}`)
		}
	},
} satisfies Subcommand
