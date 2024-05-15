import { ActionRowBuilder, ChannelSelectMenuBuilder, ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import ApplicationCommand from '../types/ApplicationCommand'
import { client } from '..'
import format from '../utils/format'
import database from '../utils/database'
import moment, { now } from 'moment'

export default new ApplicationCommand({
	permissions: ["Administrator"],
	data: new SlashCommandBuilder()
		.setName('test')
		.setDescription('description'),
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		const info = database.set(".info2", `data ${moment().format()}`)

	},
})

