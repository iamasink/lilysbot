import type {
	ChatInputCommandInteraction,
	ContextMenuCommandBuilder,
	SlashCommandBuilder,
	SlashCommandSubcommandsOnlyBuilder,
	ChatInputApplicationCommandData,
	SharedSlashCommandOptions,
	SlashCommandStringOption,
	PermissionResolvable,
	AutocompleteInteraction,
	CacheType,
	AnySelectMenuInteraction,
	ButtonInteraction
} from "discord.js"


export default class ApplicationCommand {
	permissions?: PermissionResolvable[] | ["botowner"]
	data: SlashCommandBuilder | ContextMenuCommandBuilder | SlashCommandSubcommandsOnlyBuilder | ChatInputApplicationCommandData | any // this should be a type (not any) but i can't figure it out so whatevs
	execute: (interaction: ChatInputCommandInteraction) => Promise<void> | void
	autocomplete?: (interaction: AutocompleteInteraction) => Promise<void> | void
	menu?: (interaction: AnySelectMenuInteraction) => Promise<void> | void
	button?: (interaction: ButtonInteraction) => Promise<void> | void

	constructor(options: {
		permissions?: PermissionResolvable[] | ["botowner"]
		data: SlashCommandBuilder | ContextMenuCommandBuilder | SlashCommandSubcommandsOnlyBuilder | ChatInputApplicationCommandData | any
		execute: (interaction: ChatInputCommandInteraction) => Promise<void> | void
		autocomplete?: (interaction: AutocompleteInteraction) => Promise<void> | void
		menu?: (interaction: AnySelectMenuInteraction) => Promise<void> | void
		button?: (interaction: ButtonInteraction) => Promise<void> | void

	}) {
		this.permissions = options.permissions
		this.data = options.data
		this.execute = options.execute
		this.autocomplete = options.autocomplete
		this.menu = options.menu
		this.button = options.button
	}
}
