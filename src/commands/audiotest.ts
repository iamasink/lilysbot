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
		.setName('audiotest')
		.setDescription('testy'),
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {


		const connection = joinVoiceChannel({
			channelId: "1008017419664638049",
			guildId: interaction.guild.id,
			adapterCreator: interaction.guild.voiceAdapterCreator,
		})

		// fix the audio stopping after ~60 seconds, from https://github.com/discordjs/discord.js/issues/9185#issuecomment-1452514375
		const networkStateChangeHandler = (oldNetworkState: any, newNetworkState: any) => {
			const newUdp = Reflect.get(newNetworkState, 'udp');
			clearInterval(newUdp?.keepAliveInterval);
		}
		connection.on('stateChange', (oldState, newState) => {
			const oldNetworking = Reflect.get(oldState, 'networking');
			const newNetworking = Reflect.get(newState, 'networking');

			oldNetworking?.off('stateChange', networkStateChangeHandler);
			newNetworking?.on('stateChange', networkStateChangeHandler);
		});




		// Subscribe the connection to the audio player (will play audio on the voice connection)
		const audioResource = createAudioResource("/mnt/hdd/media/data/media/music/Wonder Egg Priority OST 1/01. 出会い.flac", {
			metadata: {
				title: 'A good song!',

			}
		})
		console.log(audioResource)

		const audioPlayer = createAudioPlayer()
		audioPlayer.play(audioResource)
		const subscription = connection.subscribe(audioPlayer)

		connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
			try {
				await Promise.race([
					entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
					entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
				]);
				// Seems to be reconnecting to a new channel - ignore disconnect
			} catch (error) {
				console.log(error)
				// Seems to be a real disconnect which SHOULDN'T be recovered from
				connection.destroy();
			}
		})
		audioPlayer.on(AudioPlayerStatus.Playing, () => {
			console.log('The audio player has started playing!');
		})
		audioPlayer.on(AudioPlayerStatus.AutoPaused, () => {
			console.log('The audio player has AutoPaused!');
			audioPlayer.unpause()
		})
		audioPlayer.on(AudioPlayerStatus.Buffering, () => {
			console.log('The audio player is buffering!');
		})
		audioPlayer.on(AudioPlayerStatus.Idle, () => {
			console.log('The audio player is now Idle!');
		})
		audioPlayer.on(AudioPlayerStatus.Paused, () => {
			console.log('The audio player is Paused!');
		})
	},
})