import {
	SlashCommandBuilder,
	ChatInputCommandInteraction,
	ReactionEmoji,
	CommandInteractionOptionResolver,
	ContextMenuCommandBuilder,
	ApplicationCommandType,
	ContextMenuCommandInteraction,
	AnySelectMenuInteraction
} from 'discord.js'
import ApplicationCommand from '../types/ApplicationCommand'
import calc from '../utils/calc'
import { client } from '..'
import settings from '../utils/settings'
import { RootNodesUnavailableError } from 'redis'
import { stripIndents } from 'common-tags'

export default new ApplicationCommand({
	permissions: ["Administrator"],
	data: new ContextMenuCommandBuilder()
		.setName('test')
		.setType(ApplicationCommandType.Message)
	,
	async menu(interaction: AnySelectMenuInteraction): Promise<void> {
		interaction.reply("hi!")
	},
}) 