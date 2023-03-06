import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionsBitField, PermissionResolvable, BitField, VoiceChannel, VoiceBasedChannel, ChannelType, Webhook, ActionRowBuilder, ModalActionRowComponentBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, GuildFeature, GuildMember } from 'discord.js'
import ApplicationCommand from '../types/ApplicationCommand'
import database from '../utils/database'
import { client } from '..'
import axios from 'axios'
import embeds from '../utils/embeds'
import { Octokit } from "@octokit/rest";
import config from "../config.json"

export default new ApplicationCommand({
	permissions: ["KickMembers"],
	data: new SlashCommandBuilder()
		.setName('test')
		.setDescription('testy'),
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		const guild = interaction.guild
		//let res = await database.get(`.guilds.${interaction.guild.id}`)
		//console.log(res)
		// const usernames = await database.get(`.users.661333181802348564.usernames`)
		// const namesarray = []
		// for (let key in usernames) {
		// 	if (usernames.hasOwnProperty(key)) {
		// 		namesarray.push({ key, ...usernames[key] })
		// 	}
		// }
		// const sortedArray = namesarray.sort((a, b) => {
		// 	return a.key - b.key
		// })
		// console.log(sortedArray)
		// const presence = guild.presences.cache
		// const status = presence.get((interaction.member as GuildMember).id).clientStatus

		console.log(interaction.options)
	},
})