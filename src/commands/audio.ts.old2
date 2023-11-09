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
import { AudioPlayerStatus, EndBehaviorType, VoiceConnectionStatus, createAudioPlayer, createAudioResource, entersState, joinVoiceChannel } from '@discordjs/voice'
import { OpusEncoder } from '@discordjs/opus'
import * as prism from 'prism-media';
import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream';

export default new ApplicationCommand({
	permissions: ["KickMembers"],
	data: new SlashCommandBuilder()
		.setName('audio')
		.setDescription('testy')
		.addStringOption(option => option
			.setName("id")
			.setDescription("bweh"))
	,
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		const userid = interaction.options.getString("id")


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

		const receiver = connection.receiver

		const opusStream = receiver.subscribe(userid, {
			end: {
				behavior: EndBehaviorType.AfterSilence,
				duration: 10000,
			},
		});

		const oggStream = new prism.opus.OggLogicalBitstream({
			opusHead: new prism.opus.OpusHead({
				channelCount: 2,
				sampleRate: 48000,
			}),
			pageSizeControl: {
				maxPackets: 10,
			},
		});

		const username = (await interaction.client.users.fetch(userid)).username
		const filename = `rec/${Date.now()}-${username}.ogg`;

		const out = createWriteStream(filename);

		console.log(`👂 Started recording ${filename}`);

		pipeline(opusStream, oggStream, out, (err) => {
			if (err) {
				console.warn(`❌ Error recording file ${filename} - ${err.message}`);
			} else {
				console.log(`✅ Recorded ${filename}`);
			}
		});


	},
})