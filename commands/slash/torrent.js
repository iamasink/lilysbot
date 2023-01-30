const { SlashCommandBuilder } = require('discord.js')
const embeds = require('../../structure/embeds')
const commands = require('../../structure/commands')
const { Buffer } = require('node:buffer')
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
				.setName('magnet')
				.setDescription('Enter a magnet link to parse')
			)
			.addAttachmentOption(option => option
				.setName('torrent')
				.setDescription('Enter a .torrent file to parse')
			)
		)
	,
	async execute(interaction) {
		switch (interaction.options.getSubcommand()) {
			case 'get': {
				await interaction.deferReply()

				const attachment = interaction.options.getAttachment('torrent')
				console.log(attachment)
				const text = interaction.options.getString('magnet')
				if (attachment) {
					const request = https.get(attachment.url, async function (response) {
						var torrent
						await response.pipe(bl(async function (err, data) {
							if (err)
								return console.error(err)
							console.log(data.toString().length)

							try {
								torrent = parseTorrent(data)
								console.log(torrent)

								var extrainfo = ``
								if (torrent.comment) extrainfo += `\n**Comment:** ${torrent.comment}`


								await interaction.editReply({
									embeds: embeds.messageEmbed("Parsed torrent!",
										`**Name:** ${torrent.name}
								**Created At:** ${torrent.created}
								**Created By:** ${torrent.createdBy}
								**Private:** ${torrent.private || "false"}
	
								**Announce:** ${torrent.announce.join("\n")}
		
								**Total Length:** ${torrent.length}b
								**Files:**
								${torrent.files.map(e => [e.name, e.length, e.offset]).join("\n")}
								**Info Hash:** ${torrent.infoHash}
								${extrainfo}
								`)

								})
							} catch {
								interaction.editReply({
									embeds: embeds.warningEmbed(
										"Torrent could not be parsed.",
										`Are you sure \n*${attachment.name}*\nis a .torrent file?`)
								})
							}

						}))
					})
				} else if (text) {
					try {

						const torrent = parseTorrent(text)
						console.log(torrent)
						var extrainfo = ``
						if (torrent.xl) extrainfo += `\n**Exact Length:** ${torrent.xl}`
						if (torrent.xt) extrainfo += `\n**Exact Topic:** ${torrent.xt}`
						if (torrent.ws) extrainfo += `\n**Web Seed:** ${torrent.ws}`
						if (torrent.as) extrainfo += `\n**Acceptable Source:** ${torrent.as}`
						if (torrent.xs) extrainfo += `\n**eXact Source:** ${torrent.xs}`
						if (torrent.kt) extrainfo += `\n**Keyword Topic:** ${torrent.kt}`
						if (torrent.mt) extrainfo += `\n**Manifest Topic:** ${torrent.mt}`
						if (torrent.so) extrainfo += `\n**Select Only:** ${torrent.so}`


						await interaction.editReply({
							embeds: embeds.messageEmbed("Parsed magnet!",
								`**Name:** ${torrent.dn}
							**File Size (Length):** ${torrent.xl || "Unknown"}
							${extrainfo}

							**Trackers:**
							${torrent.tr.join("\n")}

							**Info Hash:** ${torrent.infoHash}
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
					return interaction.editReply({ embeds: embeds.warningEmbed("No Torrent Selected", "You must add an attachment to a .torrent file or a magnet link") })
				}






				break
			}

			default: {
				throw new Error("invalid subcommand")
			}
		}

	},
}
