import { ChatInputCommandInteraction } from "discord.js"
import path from "path"
import { Subcommand } from "../../../types/ApplicationCommand"
import commands from "../../../utils/commands"

const timeout = 15 * 15 * 1000

export default {
	name: "menu",
	execute: async (interaction: ChatInputCommandInteraction) => {
		const subcommandName = interaction.options.getSubcommand()

		// /role menu update
		if (subcommandName == "update") return // TODO

		const subcommandPath = path.join(
			__dirname,
			"subcommands",
			subcommandName,
		)
		const subcommand = await commands.getSubCommand(subcommandPath)

		subcommand.execute(interaction)
	},
} satisfies Subcommand
