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
	ButtonInteraction,
	UserContextMenuCommandInteraction,
	MessageContextMenuCommandInteraction,
	ContextMenuCommandInteraction,
} from "discord.js"
import type { Bot } from "../structures/Client"

interface ApplicationCommandSettings {
	ownerOnly?: boolean
}

export default class ApplicationCommand {
	permissions?: PermissionResolvable[]
	settings?: ApplicationCommandSettings
	data:
		| SlashCommandBuilder
		| ContextMenuCommandBuilder
		| SlashCommandSubcommandsOnlyBuilder
		| ChatInputApplicationCommandData
		| any // this should be a type (not any) but i can't figure it out so whatevs
	execute?: (
		interaction: ChatInputCommandInteraction,
		client?: Bot,
	) => Promise<void> | void
	autocomplete?: (
		interaction: AutocompleteInteraction,
		client?: Bot,
	) => Promise<void> | void
	menuUser?: (
		interaction: UserContextMenuCommandInteraction,
		client?: Bot,
	) => Promise<void> | void
	menuMessage?: (
		interaction: MessageContextMenuCommandInteraction,
		client?: Bot,
	) => Promise<void> | void
	menuBoth?: (
		interaction: ContextMenuCommandInteraction,
		client?: Bot,
	) => Promise<void> | void
	menu?: (interaction: AnySelectMenuInteraction) => Promise<void> | void
	button?: (interaction: ButtonInteraction) => Promise<void> | void

	constructor(options: {
		permissions?: PermissionResolvable[]
		settings?: ApplicationCommandSettings
		data:
			| SlashCommandBuilder
			| ContextMenuCommandBuilder
			| SlashCommandSubcommandsOnlyBuilder
			| ChatInputApplicationCommandData
			| any
		execute?: (
			interaction: ChatInputCommandInteraction,
			client?: Bot,
		) => Promise<void> | void
		autocomplete?: (
			interaction: AutocompleteInteraction,
			client?: Bot,
		) => Promise<void> | void
		menuUser?: (
			interaction: UserContextMenuCommandInteraction,
			client?: Bot,
		) => Promise<void> | void
		menuMessage?: (
			interaction: MessageContextMenuCommandInteraction,
			client?: Bot,
		) => Promise<void> | void
		menuBoth?: (
			interaction: ContextMenuCommandInteraction,
			client?: Bot,
		) => Promise<void> | void
		menu?: (interaction: AnySelectMenuInteraction) => Promise<void> | void
		button?: (interaction: ButtonInteraction) => Promise<void> | void
	}) {
		this.permissions = options.permissions
		this.settings = options.settings
		this.data = options.data
		this.execute = options.execute
		this.autocomplete = options.autocomplete
		this.menuUser = options.menuUser
		this.menuMessage = options.menuMessage
		this.menuBoth = options.menuBoth
		this.menu = options.menu
		this.button = options.button
	}
}

export interface ApplicationCommandAlias {
	commandName: string
	defaultoptions?: string[] // TODO defaultoptions is an Array of OptionsResolvable
	group?: string
	subcommand?: string
	description?: string
	hidedefaults?: boolean
	hidealloptions?: boolean
}