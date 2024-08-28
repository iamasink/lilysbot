import { ChatInputCommandInteraction } from "discord.js"
import path from "path"
import { Subcommand } from "../../../types/ApplicationCommand"
import commands from "../../../utils/commands"

export default {
	name: "lists",
	execute: async (interaction: ChatInputCommandInteraction) => {
		const subcommandName = interaction.options.getSubcommand()
		const subcommandPath = path.join(
			__dirname,
			"subcommands",
			subcommandName,
		)
		const subcommand = await commands.getSubCommand(subcommandPath)

		subcommand.execute(interaction)
	},
} satisfies Subcommand
