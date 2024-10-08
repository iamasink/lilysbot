import {
	SlashCommandOptionsOnlyBuilder,
	ChatInputApplicationCommandData,
	SlashCommandBuilder,
	SlashCommandStringOption,
	SlashCommandSubcommandBuilder,
	SharedSlashCommandOptions,
	CommandInteraction,
	ChatInputCommandInteraction,
} from "discord.js"
import ApplicationCommand from "../types/ApplicationCommand"

export default new ApplicationCommand({
	data: new SlashCommandBuilder()
		.setName("echo")
		.setDescription("Repeats your input")
		.addStringOption((option) =>
			option
				.setName("message")
				.setDescription("The message to echo")
				.setRequired(true),
		),
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		interaction.reply({
			content: interaction.options.getString("message"),
			allowedMentions: { users: [], repliedUser: false },
		})
	},
})
