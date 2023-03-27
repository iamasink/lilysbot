import {
	SlashCommandBuilder,
	ChatInputCommandInteraction
} from 'discord.js'
import ApplicationCommand from '../types/ApplicationCommand'
import calc from '../utils/calc'
import { client } from '..'
import settings from '../utils/settings'

export default new ApplicationCommand({
	permissions: ["KickMembers"],
	data: new SlashCommandBuilder()
		.setName('test')
		.setDescription('testy'),
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		const guildsIds = (await client.guilds.fetch()).map(e => e.id)
		for (let i = 0, len = guildsIds.length; i < len; i++) {
			const guildId = guildsIds[i]
			console.log(guildId)
			settings.setDefaults(guildId)
		}
	},
}) 