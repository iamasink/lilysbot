const { SlashCommandBuilder, SlashCommandSubcommandBuilder, EmbedBuilder } = require('discord.js')
const embeds = require('../../structure/embeds')
const format = require('../../structure/format')
const database = require('../../structure/database')
const calc = require('../../structure/calc')
const invites = require('../../structure/invites')



module.exports = {
	data: new SlashCommandBuilder()
		.setName('invite')
		.setDescription('Manage invites')
		.addSubcommand(command => command
			.setName('list')
			.setDescription('list invites')

		),
	async execute(interaction) {
		switch (interaction.options.getSubcommand()) {
			case 'list': {
				await interaction.reply("nya")
				const invitelist = await interaction.guild.invites.fetch()
				console.log(invitelist)
				output = ""

				const invitestring = invitelist.map(async e => {
					const code = e.code
					const inviter = await interaction.client.users.fetch(e.inviterId)
					const createdTimestamp = `<t:${e.createdTimestamp.toString().slice(0, -3)}>`
					if (e._expiresTimestamp) {
						expiresTimestamp = `<t:${e._expiresTimestamp.toString().slice(0, -3)}>`
					} else {
						expiresTimestamp = `never`
					}

					return `\`${code}\`, by ${await inviter.tag}, at ${createdTimestamp}, till ${expiresTimestamp}, to <#${e.channelId}>, uses: ${e.uses}`
				})
				for (let i = 0, len = invitestring.length; i < len; i++) {
					output += await invitestring[i] + "\n"
				}
				messages = format.splitMessage(output, 1900, "\n")
				for (let i = 0, len = messages.length; i < len; i++) {
					interaction.followUp(messages[i])
				}
			}
			default: {
				break
			}
		}
	}
}