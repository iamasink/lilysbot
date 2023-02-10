import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionsBitField, PermissionResolvable, BitField } from 'discord.js'
import ApplicationCommand from '../types/ApplicationCommand'
import database from '../utils/database'
import log from '../utils/log'
import embeds from '../utils/embeds'

export default new ApplicationCommand({
	permissions: ["KickMembers"],
	data: new SlashCommandBuilder()
		.setName('test')
		.setDescription('testy'),
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		//let res = await database.get(`.guilds.${interaction.guild.id}`)
		//console.log(res)

		log.log(interaction.guild, "test")

		interaction.reply({ embeds: embeds.messageEmbed("title", "[test](https://google.com)") })
	},
})