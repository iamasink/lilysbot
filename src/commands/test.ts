import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionsBitField, PermissionResolvable, BitField, VoiceChannel, VoiceBasedChannel, ChannelType, Webhook } from 'discord.js'
import ApplicationCommand from '../types/ApplicationCommand'
import database from '../utils/database'
import log from '../utils/log'
import embeds from '../utils/embeds'
import { client } from '..'
import webhooks from '../utils/webhooks'

export default new ApplicationCommand({
	permissions: ["KickMembers"],
	data: new SlashCommandBuilder()
		.setName('test')
		.setDescription('testy'),
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		//let res = await database.get(`.guilds.${interaction.guild.id}`)
		//console.log(res)

		interaction.reply("hi")
		//interaction.reply(JSON.stringify(client.commands.get("roles").execute))

	},
})