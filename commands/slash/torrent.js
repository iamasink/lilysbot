const { SlashCommandBuilder } = require('discord.js')
const embeds = require('../../structure/embeds')
const commands = require('../../structure/commands')
const { Buffer } = require('node:buffer')
//var { parseTorrent } = require('parse-torrent')
const fs = require('fs')
const parseTorrent = require('parse-torrent')
const https = require('https') // or 'https' for https:// URLs
const bl = require('bl')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('torrent')
		.setDescription('get info about a torrent')
		.addSubcommand(command => command
			.setName('get')
			.setDescription('get info about a torrent. attach a .torrent file or enter a magnet link')
			.addStringOption(option => option
				.setName('text')
				.setDescription('a!')
			)
			.addAttachmentOption(option => option
				.setName('attachment')
				.setDescription('a2')
			)
		)
	,
	async execute(interaction) {
		switch (interaction.options.getSubcommand()) {
			case 'get': {
				const attachment = interaction.options.getAttachment('attachment')
				console.log(attachment)
				await interaction.deferReply()

				const request = https.get(attachment.url, async function (response) {
					var torrent
					await response.pipe(bl(async function (err, data) {
						if (err)
							return console.error(err)
						console.log(data.toString().length)
						torrent = await parseTorrent(data)
						console.log(torrent)
						await interaction.editReply({
							embeds: embeds.messageEmbed("Parsed Torrent!",
								`**Name:** ${torrent.name}
						**Created At:** ${torrent.created}
						**Created By:** ${torrent.createdBy}
						**Private:** ${torrent.private || "false"}

						**Files:**
						${torrent.files.map(e => e.name).join("\n")}
						`)
						})

					}))




				})

				break
			}

			default: {
				throw new Error("invalid subcommand")
			}
		}

	},
}
