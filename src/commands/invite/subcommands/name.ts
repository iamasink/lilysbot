import { ChatInputCommandInteraction } from "discord.js"
import { Subcommand } from "../../../types/ApplicationCommand"
import database from "../../../utils/database"
import embeds from "../../../utils/embeds"

export default {
	name: "name",
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		const guild = interaction.guild
		const code = interaction.options.getString("code")
		const name = interaction.options.getString("name")

		if (!(await database.get(`.guilds.${guild.id}.invites.${code}`))) {
			interaction.reply({
				ephemeral: true,
				embeds: embeds.warningEmbed(`Invalid Invite`),
			})
			return
		}
		database.set(`.guilds.${guild.id}.invites.${code}.name`, name)
		interaction.reply({
			ephemeral: true,
			embeds: embeds.successEmbed(
				`Invite Renamed`,
				`Invite \`${code}\` renamed to \`${name}\``,
			),
		})
	},
} satisfies Subcommand
