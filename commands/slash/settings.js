const { SlashCommandBuilder, SlashCommandSubcommandBuilder, EmbedBuilder } = require('discord.js')
const commands = require('../../structure/commands')
const database = require('../../structure/database')
const embeds = require('../../structure/embeds')
const settings = [{
	"name": "Log Channel",
	"value": "log_channel",
	"type": "channel"
}]
const choices = settings.map(setting => {
	return { name: setting.name, value: setting.value }
})


module.exports = {
	data: new SlashCommandBuilder()
		.setName('settings')
		.setDescription('Configure stuff')
		.addSubcommand(command => command
			.setName('set')
			.setDescription('change a settings')
			.addStringOption(option => option
				.setName('setting')
				.setDescription('setting to change')
				.setRequired(true)
			)
			// .addStringOption(option => option
			// 	.setName('value')
			// 	.setDescription('value')
			// 	.setRequired(true)
			// )
		)
		.addSubcommand(command => command
			.setName('list')
			.setDescription('list all settings')
		),
	async execute(interaction) {
		console.log(choices)
		switch (interaction.options.getSubcommand()) {
			case 'set': {
				console.log(settings[interaction.options.getString("setting")].type)
				switch (settings[interaction.options.getString("setting")].type) {

				}
				break
			}
			case 'list': {

				break
			}
		}
	},
	// async autocomplete(interaction) {
	// 	console.log(interaction)
	// 	console.log(interaction.options)
	// 	const focusedValue = interaction.options.getFocused()
	// 	const choices = ['Popular Topics: Threads', 'Sharding: Getting started', 'Library: Voice Connections', 'Interactions: Replying to slash commands', 'Popular Topics: Embed preview']
	// 	const filtered = choices.filter(choice => choice.startsWith(focusedValue))
	// 	await interaction.respond(
	// 		filtered.map(choice => ({ name: choice, value: choice })),
	// 	)
	// }
}