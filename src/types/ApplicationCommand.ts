import type {
	ChatInputCommandInteraction,
	ContextMenuCommandBuilder,
	SlashCommandBuilder,
	SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js'

/**
 * Represents an Application Command
 */
export default class ApplicationCommand {
	data:
		| SlashCommandBuilder
		| ContextMenuCommandBuilder
	execute: (interaction: ChatInputCommandInteraction) => Promise<void> | void

	constructor(options: {
		data:
		| SlashCommandBuilder
		| ContextMenuCommandBuilder
		execute: (
			interaction: ChatInputCommandInteraction
		) => Promise<void> | void
	}) {
		this.execute = options.execute
		this.data = options.data
	}
}