import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionsBitField, PermissionResolvable, BitField, VoiceChannel, VoiceBasedChannel, ChannelType, Webhook, ActionRowBuilder, ModalActionRowComponentBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, GuildFeature } from 'discord.js'
import ApplicationCommand from '../types/ApplicationCommand'
import database from '../utils/database'
export default new ApplicationCommand({
	permissions: ["KickMembers"],
	data: new SlashCommandBuilder()
		.setName('test')
		.setDescription('testy'),
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		//let res = await database.get(`.guilds.${interaction.guild.id}`)
		//console.log(res)
		const commands = await interaction.guild.commands
	},
})