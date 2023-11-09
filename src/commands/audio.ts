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
		.setName('audio')
		.setDescription('testy')
		.addSubcommand(command => command
			.setName("play")
			.setDescription("play")
			.addStringOption(option => option
				.setName("url")
				.setDescription("url"))
		)
		.addSubcommand(command => command
			.setName("stop")
			.setDescription("stop")
		)
		.addSubcommand(command => command
			.setName("pause")
			.setDescription("pause")
		)
		.addSubcommand(command => command
			.setName("leave")
			.setDescription("leave")
		)
		.addSubcommand(command => command
			.setName("join")
			.setDescription("join")
		)
	,
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

		const audioPlayer = createAudioPlayer()
		let state = ""

		audioPlayer.on(AudioPlayerStatus.Playing, () => {
			console.log('The audio player has started playing!');
			state = "playing"
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
			state = "idle"
		})
		audioPlayer.on(AudioPlayerStatus.Paused, () => {
			console.log('The audio player is Paused!');
			state = "paused"
		})


		switch (interaction.options.getSubcommand()) {
			case ('play'): {
				const url = interaction.options.get("url")


				// Subscribe the connection to the audio player (will play audio on the voice connection)
				const audioResource = createAudioResource("/mnt/storage/media/data/media/music/Porter Robinson/Nurture/15 - fullmoon lullaby.flac", {
					metadata: {
						title: 'A good song!',
					}
				})
				console.log(audioResource)

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
				return
			}
			case ('stop'): {
				interaction.reply("stoping")

				return
			}
			case ('pause'): {
				if (state == "paused") {

					interaction.reply("pauseing")
					audioPlayer.unpause();

				} else {
					interaction.reply("pauseing")
					audioPlayer.pause();
				}
				return
			}
			case ('leave'): {
				interaction.reply("leaveing")
				audioPlayer.stop();
				connection.destroy()
				return
			}
			case ('join'): {
				interaction.reply("joining")

			}
			default: {
				throw new Error("brokey")
			}
		}


	},
})