import { ChatInputCommandInteraction } from "discord.js"
import { Subcommand } from "../../../types/ApplicationCommand"

import commands from "../../../utils/commands"
import embeds from "../../../utils/embeds"

export default {
	name: "command",
	execute: async (
		interaction: ChatInputCommandInteraction,
	): Promise<void> => {
		switch (interaction.options.getSubcommand()) {
			case "enable": {
				break
			}
			case "disable": {
				break
			}
			case "refresh": {
				commands.refreshGuild(interaction.guild.id)
				interaction.reply({
					embeds: embeds.successEmbed("Refreshed guild commands"),
				})
				break
			}
			default: {
				throw new Error("it broke")
			}
		}
	},
} satisfies Subcommand
