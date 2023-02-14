import { ActionRowBuilder, ChannelSelectMenuBuilder, ChannelType, ChatInputCommandInteraction, ComponentType, SlashCommandBuilder, TextChannel } from 'discord.js'
import ApplicationCommand from '../types/ApplicationCommand'
import embeds from '../utils/embeds'
import database from '../utils/database'
import { Channel } from 'diagnostics_channel'
const settings = [
	{
		name: "Log Channel",
		value: "log_channel",
		type: "channel"
	},
	{
		name: "Log Channel2",
		value: "log_channel2",
		type: "channel"
	}
]
const choices = settings.map(setting => {
	return { name: setting.name, value: setting.value }
})

export default new ApplicationCommand({
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
				.addChoices(...settings) // '...' expands the array so its not an array idk it works
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
		console.log(`choices: ${JSON.stringify(choices)}`)
		const setting = interaction.options.getString("setting")
		switch (interaction.options.getSubcommand()) {
			case 'set': {
				const option = settings[settings.findIndex(e => e.value == setting)]
				console.log(JSON.stringify(option))
				let value = ""
				switch (option.type) {
					case 'channel': {
						let channel = await channelSelector(interaction)
						console.log(channel.name)
						value = channel.id
					}
				}
				database.set(`.guilds.${interaction.guild.id}.settings.${option.value}`, value)

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
})


async function channelSelector(interaction: ChatInputCommandInteraction): Promise<TextChannel> {
	return new Promise(async (resolve, reject) => {

		const row = new ActionRowBuilder<ChannelSelectMenuBuilder>()
			.addComponents(
				new ChannelSelectMenuBuilder()
					.setCustomId('select')
					.setPlaceholder('Nothing selected')
			)
		const filter = i => {
			return i.user.id === interaction.user.id
		}
		await interaction.reply({ embeds: embeds.messageEmbed("Choose a channel.."), components: [row] }).then((message) => {
			message
				.awaitMessageComponent({ filter, componentType: ComponentType.ChannelSelect, time: 60000 })
				.then(async (i) => {
					let channel = await interaction.guild.channels.fetch(i.values[0])
					console.log(channel)
					if (channel.type == ChannelType.GuildText) {
						interaction.editReply({ embeds: embeds.successEmbed(`Choose a channel..`, `You selected <#${channel.id}>`), components: [] })
						resolve(channel)

					} else {
						interaction.editReply({ embeds: embeds.messageEmbed(`Choose a channel..`, `Invalid channel selected:\n${channel.name}`, null, "#ff0000"), components: [] })
						reject(new Error("Invalid channel selected"))
					}
				})
				.catch(err => {
					interaction.editReply({ embeds: embeds.messageEmbed(`Choose a channel..`, `No channel selected`, null, "#ff0000"), components: [] })
					reject(new Error("No channel selected"))
				})
		})
	})


}
