import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import { Buffer } from 'node:buffer'
import fs from 'fs'
import parseTorrent from 'parse-torrent'
import https from 'https' // or 'https' for https:// URLs
import bl from 'bl'
import embeds from '../utils/embeds'
import ApplicationCommand from '../types/ApplicationCommand'

export default new ApplicationCommand({
	data: new SlashCommandBuilder()
		.setName('torrent')
		.setDescription('get info about a torrent')
		.addSubcommand(command => command
			.setName('get')
			.setDescription('get info about a torrent. attach a .torrent file or enter a magnet link')
			.addStringOption(option => option
				.setName('magnet')
				.setDescription('Enter a magnet link to parse')
			)
			.addAttachmentOption(option => option
				.setName('torrent')
				.setDescription('Enter a .torrent file to parse')
			).addBooleanOption(option => option
				.setName('hide')
				.setDescription('hide the information for everyone but you. defaults to true. recommended for private torrents')
			),
		),
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		console.log(interaction)
		const hide = interaction.options.getBoolean("hide") || true

		switch (interaction.options.getSubcommand()) {
			case 'get': {
				await interaction.deferReply({ ephemeral: hide })

				const attachment = interaction.options.getAttachment('torrent')
				console.log(attachment)
				const text = interaction.options.getString('magnet')
				if (attachment) {
					parseTorrent.remote(attachment.url, async (err, parsedTorrent) => {
						if (err) {
							interaction.editReply({
								embeds: embeds.warningEmbed(
									"Torrent could not be parsed.",
									`Are you sure \n*${attachment.name}*\nis a .torrent file?\nFull error: ${err}`)
							})
						}
						console.log(parsedTorrent)


						console.log(parsedTorrent.toString().length)
						const torrent = parsedTorrent

						var extrainfo = ``
						if ((torrent.info as any).comment) extrainfo += `\n**Comment:** ${(torrent.info as any).comment}`

						// info ?: TorrentInfo | undefined;
						// infoBuffer ?: Buffer | undefined;
						// infoHash ?: string | undefined;
						// infoHashBuffer ?: Buffer | undefined;
						// name ?: string | undefined;
						// private ?: boolean | undefined;
						// created ?: Date | undefined;
						// createdBy ?: string | undefined;
						// announce ?: string[] | undefined;
						// urlList ?: string[] | undefined;
						// pieceLength ?: number | undefined;
						// lastPieceLength ?: number | undefined;
						// pieces ?: string[] | undefined;
						// length ?: number | undefined;
						// files ?: ParsedFile[] | undefined;
						// infoHash: string;
						// name ?: string | undefined;
						// announce ?: string[] | undefined;
						// urlList ?: string[] | undefined;
						let files: string
						if (torrent.files.length < 10) {
							files = torrent.files.map(e => [e.name.replace(/[\\"'*_]/g, '\\$&').replace(/\u0000/g, '\\0'), e.length, e.offset]).join("\n")
						} else {
							files = torrent.files.map(e => [e.name.replace(/[\\"'*_]/g, '\\$&').replace(/\u0000/g, '\\0'), e.length, e.offset]).slice(0, 10).join("\n") + "\n..."
						}


						await interaction.editReply({
							embeds: embeds.messageEmbed("Parsed torrent!",
								`**Name:** ${torrent.name}
								**Created At:** ${torrent.created}
								**Created By:** ${torrent.createdBy}
								**Private:** ${torrent.private || "false"}
								
								**Announce:** ${torrent.announce.join("\n")}

								**Total Length:** ${torrent.length}b
								**Files:** (Name, Length, Offset)
								${files}
								**Info Hash:** ${torrent.infoHash}
								${extrainfo}
								`)

						})
					}
					)



				} else if (text) {
					try {

						const torrent = parseTorrent(text)
						console.log(torrent)
						var extrainfo = ``

						if (torrent.dn) extrainfo += `\nDisplay Name: ${Array.from([torrent.dn].flat()).join("\n	-	")}`
						if (torrent.tr) extrainfo += `\nAddress TRacker: ${Array.from([torrent.tr].flat()).join("\n	-	")}`
						if (torrent.xs) extrainfo += `\neXact Source: ${Array.from([torrent.xs].flat()).join("\n	-	")}`
						if (torrent.as) extrainfo += `\nAcceptable Source: ${Array.from([torrent.as].flat()).join("\n	-	")}`
						if (torrent.ws) extrainfo += `\nWeb Seed: ${Array.from([torrent.ws].flat()).join("\n	-	")}`
						if (torrent.kt) extrainfo += `\nKeyword Topic: ${Array.from([torrent.kt].flat()).join("\n	-	")}`
						if (torrent.ix) extrainfo += `\nIX(?): ${Array.from([torrent.ix].flat()).join("\n	-	")}`
						if (torrent.xt) extrainfo += `\nExact Topic: ${Array.from([torrent.xt].flat()).join("\n	-	")}`
						if (torrent.name) extrainfo += `\nname: ${Array.from([torrent.name].flat()).join("\n	-	")}`
						if (torrent.keywords) extrainfo += `\nkeywords: ${Array.from([torrent.keywords].flat()).join("\n	-	")}`
						if (torrent.announce) extrainfo += `\nannounce: ${Array.from([torrent.announce].flat()).join("\n	-	")}`
						if (torrent.urlList) extrainfo += `\nurlList: ${Array.from([torrent.urlList].flat()).join("\n	-	")}`


						await interaction.editReply({
							embeds: embeds.messageEmbed(
								"Parsed magnet!",
								`**Name:** ${torrent.dn || torrent.name || "?"}
							${extrainfo}

							**Trackers:** (Address TRacker)
							${Array.from(torrent.tr).join("\n") || "?"}

							**Info Hash:** ${torrent.infoHash || "?"}
							`)
						})

					} catch {
						interaction.editReply({
							embeds: embeds.warningEmbed(
								"Magnet link could not be parsed.",
								`Are you sure \n*${text}*\nis a magnet link?`)
						})
					}


				} else {
					interaction.editReply({ embeds: embeds.warningEmbed("No Torrent Selected", "You must add an attachment to a .torrent file or a magnet link") })
				}

				break
			}

			default: {
				throw new Error("invalid subcommand")
			}
		}

	},
})