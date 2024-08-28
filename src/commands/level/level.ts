import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"
import path from "path"
import ApplicationCommand from "../../types/ApplicationCommand"
import commands from "../../utils/commands"

// function fetchPromise(toFetch) {
// 	return new Promise((resolve, reject) => {
// 		try {
// 			resolve(toFetch.fetch(true))
// 		} catch {
// 			reject()
// 		}
// 	})
// }

export default new ApplicationCommand({
	data: new SlashCommandBuilder()
		.setName("level")
		.setDescription("Retrieves level...")
		.addSubcommand((command) =>
			command
				.setName("get")
				.setDescription("get a users level")
				.addUserOption((option) =>
					option
						.setName("target")
						.setDescription("A user. Ping or ID")
						.setRequired(false),
				),
		)
		.addSubcommand((command) =>
			command
				.setName("ranking")
				.setDescription("see a list of the highest levels")
				.addBooleanOption((option) =>
					option
						.setName("extended")
						.setDescription("add a description here :O"),
				),
		),
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		// get the guild
		const subcommandName = interaction.options.getSubcommand()

		const subcommandPath = path.join(
			__dirname,
			"subcommands",
			subcommandName,
		)
		const subcommand = await commands.getSubCommand(subcommandPath)

		subcommand.execute(interaction)
	},
})
