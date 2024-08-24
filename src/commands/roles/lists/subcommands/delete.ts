import { ChatInputCommandInteraction } from "discord.js"
import { Subcommand } from "../../../../types/ApplicationCommand"
import database from "../../../../utils/database"
import embeds from "../../../../utils/embeds"

/**
 * /roles lists delete
 */
export default {
	name: "delete",
	execute: async (interaction: ChatInputCommandInteraction) => {
		const rolelists = await database.get(
			`.guilds.${interaction.guild.id}.roles.lists`,
		)
		const rolelist = interaction.options.getString("name")
		try {
			await database.del(
				`.${interaction.guild.id}.roles.lists.${rolelist}`,
			)
			interaction.reply({
				embeds: embeds.successEmbed(`Successfully deleted ${rolelist}`),
			})
		} catch (e) {
			throw new Error(`Couldn't delete rolelist\n${e}`)
		}
	},
} satisfies Subcommand
