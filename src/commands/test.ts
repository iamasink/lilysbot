import {
	SlashCommandBuilder,
	ChatInputCommandInteraction,
	ReactionEmoji,
	CommandInteractionOptionResolver
} from 'discord.js'
import ApplicationCommand from '../types/ApplicationCommand'
import calc from '../utils/calc'
import { client } from '..'
import settings from '../utils/settings'
import { RootNodesUnavailableError } from 'redis'

export default new ApplicationCommand({
	permissions: ["KickMembers"],
	data: new SlashCommandBuilder()
		.setName('test')
		.setDescription('testy'),
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {


	},
}) 