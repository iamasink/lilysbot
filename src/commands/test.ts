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


	},
})