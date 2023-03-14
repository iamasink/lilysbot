import {
	SlashCommandBuilder,
	ChatInputCommandInteraction,
	PermissionsBitField,
	PermissionResolvable,
	BitField,
	VoiceChannel,
	VoiceBasedChannel,
	ChannelType,
	Webhook,
	ActionRowBuilder,
	ModalActionRowComponentBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	GuildFeature,
	GuildMember
} from 'discord.js'
import ApplicationCommand from '../types/ApplicationCommand'
import database from '../utils/database'
import { client } from '..'
import axios from 'axios'
import embeds from '../utils/embeds'
import { Octokit } from "@octokit/rest";
import config from "../config.json"
import { AudioPlayerStatus, VoiceConnectionStatus, createAudioPlayer, createAudioResource, entersState, joinVoiceChannel } from '@discordjs/voice'

export default new ApplicationCommand({
	permissions: ["KickMembers"],
	data: new SlashCommandBuilder()
		.setName('test')
		.setDescription('testy'),
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		const command = new SlashCommandBuilder()
			.setName('command')
			.setDescription('Configure commands')
			.addSubcommandGroup(group => group
				.setName('alias')
				.setDescription('alias')
				.addSubcommand(command => command
					.setName('create')
					.setDescription('create an alias')
					.addStringOption(option => option
						.setName('alias')
						.setDescription('alias to create')
						.setRequired(true)

					).addStringOption(option => option
						.setName("commandname")
						.setDescription("commandname")
						.setRequired(true)
					)
					.addStringOption(option => option
						.setName("group")
						.setDescription("group")
					)
					.addStringOption(option => option
						.setName("subcommand")
						.setDescription("subcommand")
					)
					.addStringOption(option => option
						.setName("defaultoptions")
						.setDescription("defaultoptions")
					)
					.addBooleanOption(option => option
						.setName('hidealloptions')
						.setDescription('hide options?')
					)
					.addStringOption(option => option
						.setName('description')
						.setDescription('override description'))
				)
				.addSubcommand(command => command
					.setName('remove')
					.setDescription('remove an alias')
					.addStringOption(option => option
						.setName('alias')
						.setDescription('alias to remove')
						.setRequired(true)
					)
				)
				.addSubcommand(command => command
					.setName('list')
					.setDescription('list all aliases')
				)
			)
			.addSubcommandGroup(group => group
				.setName('command')
				.setDescription('command')
				.addSubcommand(command => command
					.setName('enable')
					.setDescription('enable a disabled command')
					.addStringOption(option => option
						.setName('command')
						.setDescription('command to enable')
						.setRequired(true)
					)
				)
				.addSubcommand(command => command
					.setName('disable')
					.setDescription('disable a command')
					.addStringOption(option => option
						.setName('command')
						.setDescription('command to disable')
						.setRequired(true)
					)
				)
				.addSubcommand(command => command
					.setName('list')
					.setDescription('list all commands')
				)
			)
			.addSubcommand(command => command
				.setName('run')
				.setDescription('run a command')
				.addStringOption(option => option
					.setName('command')
					.setDescription('command to run')
					.setRequired(true)
				)
			)

		console.log(JSON.stringify(command))
	},
})