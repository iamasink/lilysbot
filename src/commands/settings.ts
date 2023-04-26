import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelSelectMenuBuilder, ChannelType, ChatInputCommandInteraction, ComponentType, GuildChannel, PermissionsBitField, Role, RoleSelectMenuBuilder, SlashCommandBuilder, Snowflake, StringSelectMenuBuilder, TextChannel } from 'discord.js'
import ApplicationCommand from '../types/ApplicationCommand'
import embeds from '../utils/embeds'
import database from '../utils/database'
import settings from '../utils/settings'
import { compareTwoStrings } from 'string-similarity'
const settingsList = settings.settingsList

const choices = settingsList.map(setting => {
	return { name: setting.name, value: setting.value }
})

export default new ApplicationCommand({
	permissions: [new PermissionsBitField("Administrator")],
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
				.addChoices(...settingsList) // '...' expands the array so its not an array idk it works
			)
			// .addStringOption(option => option
			// 	.setName('value')
			// 	.setDescription('value')
			// 	.setRequired(true)
			// )
		)
		.addSubcommand(command => command
			.setName('get')
			.setDescription('get all options')
		)
		.addSubcommand(command => command
			.setName('list')
			.setDescription('list all settings')
		),
	async execute(interaction) {
		const guild = interaction.guild

		console.log(`choices: ${JSON.stringify(choices)}`)
		switch (interaction.options.getSubcommand()) {
			case 'set': {
				const setting = interaction.options.getString("setting")
				console.log(setting)
				const option: setting = await settingsList[settingsList.findIndex(e => e.value === setting)]
				console.log(JSON.stringify(option))
				let value = ""
				switch (option.type) {
					case 'channel': {
						let channel = await channelSelector(interaction, option.name)
						if (channel) {
							console.log(channel.name)

							value = channel.id
						} else {
							value = null
						}
						break
					}
					case 'role': {
						let role = await roleSelector(interaction, option.name)
						if (role) {
							console.log(role.name)
							value = role.id
							break
						} else {
							value = null
						}
					}
					case 'toggle': {
						value = await toggleSelector(interaction, option.name)
						break
					}
					default: {
						throw new Error(`invalid type: ${option.type}`)
					}
				}
				//database.set(`.guilds.${interaction.guild.id}.settings.${option.value}`, value)
				settings.set(guild, option.value, value)

				break
			}
			case 'get': {
				const settings: object = await database.get(`.guilds.${interaction.guild.id}.settings`)

				interaction.reply({ embeds: embeds.messageEmbed(`Settings:\n${JSON.stringify(settings)}`), ephemeral: true })

				break
			}
			case 'list': {
				await settings.setDefaults(interaction.guild.id)


				const output = settingsList.map(async e => {
					const name = e.name
					const type = e.type
					const description = e.description
					let currentValue: string = ""
					const value = await settings.get(interaction.guild, `${e.value}`)
					if (value) {
						switch (type) {
							case 'channel': {
								currentValue = `<#${value}>`
								break
							}
							case 'role': {
								currentValue = `< @& ${value}>`
								break
							}
							default: {
								currentValue = `\`${value}\``
								break
							}
						}
					} else {
						currentValue = "Not Set."

					}

					return `${name} - ${type} type\n${description}\nCurrently: ${currentValue}\n`
				})
				interaction.reply({ embeds: embeds.messageEmbed(`Settings:`, (await Promise.all(output)).join("\n")), ephemeral: true })
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


async function channelSelector(interaction: ChatInputCommandInteraction, setting: string): Promise<TextChannel> {
	return new Promise(async (resolve, reject) => {

		const row = new ActionRowBuilder<ChannelSelectMenuBuilder>()
			.addComponents(
				new ChannelSelectMenuBuilder()
					.setCustomId('select')
					.setPlaceholder('Nothing selected')
			)
		const row2 = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('button')
					.setLabel("none")
					.setStyle(ButtonStyle.Danger)
			)
		const filter = i => {
			return i.user.id === interaction.user.id
		}
		await interaction.reply({ embeds: embeds.messageEmbed("Choose a channel.."), components: [row, row2], ephemeral: true }).then((message) => {
			message
				.awaitMessageComponent({ filter, time: 60000 })
				.then(async (i) => {

					if (i.componentType == ComponentType.ChannelSelect) {
						let channel = await interaction.guild.channels.fetch(i.values[0])
						console.log(channel)
						if (channel.type == ChannelType.GuildText) {
							interaction.editReply({ embeds: embeds.successEmbed(`Choose a channel..`, `You selected <#${channel.id}>`), components: [] })
							resolve(channel)

						} else {
							interaction.editReply({ embeds: embeds.messageEmbed(`Choose a channel..`, `Invalid channel selected:\n${channel.name}`, null, "#ff0000"), components: [] })
							reject(new Error("Invalid channel selected"))
						}
					}
					else if (i.componentType == ComponentType.Button) {
						let channel = null
						console.log(channel)
						interaction.editReply({ embeds: embeds.successEmbed(`Choose a channel..`, `You selected none`), components: [] })
						resolve(channel)
					}

				})
				.catch(err => {
					interaction.editReply({ embeds: embeds.messageEmbed(`Choose a channel..`, `No channel selected`, null, "#ff0000"), components: [] })
					reject(new Error("No channel selected"))
				})
		})
	})
}

async function roleSelector(interaction: ChatInputCommandInteraction, setting: string): Promise<Role> {
	return new Promise(async (resolve, reject) => {

		const row = new ActionRowBuilder<RoleSelectMenuBuilder>()
			.addComponents(
				new RoleSelectMenuBuilder()
					.setCustomId('select')
					.setPlaceholder('Nothing selected')
			)
		const row2 = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('button')
					.setLabel("none")
					.setStyle(ButtonStyle.Danger)
			)
		const filter = i => {
			return i.user.id === interaction.user.id
		}
		await interaction.reply({ embeds: embeds.messageEmbed("Choose a role.."), components: [row, row2], ephemeral: true }).then((message) => {
			message
				.awaitMessageComponent({ filter, componentType: ComponentType.RoleSelect, time: 60000 })
				.then(async (i) => {
					if (i.componentType == ComponentType.RoleSelect) {
						let role = await interaction.guild.roles.fetch(i.values[0])
						console.log(role)
						interaction.editReply({ embeds: embeds.successEmbed(`Choose a role..`, `You selected <@&${role.id}>`), components: [] })
						resolve(role)
					}
					else if (i.componentType == ComponentType.Button) {
						let role = null
						console.log(role)
						interaction.editReply({ embeds: embeds.successEmbed(`Choose a role..`, `You selected none`), components: [] })
						resolve(role)
					}
				})
				.catch(err => {
					interaction.editReply({ embeds: embeds.messageEmbed(`Choose a role..`, `No role selected`, null, "#ff0000"), components: [] })
					reject(new Error("No role selected"))
				})
		})
	})
}

async function toggleSelector(interaction: ChatInputCommandInteraction, setting: string): Promise<any> {
	return stringSelector(interaction, setting, [{ label: "On", value: "true" }, { label: "Off", value: "false" }])
}

async function stringSelector(interaction: ChatInputCommandInteraction, setting: string, options: any): Promise<any> {
	return new Promise(async (resolve, reject) => {

		const row = new ActionRowBuilder<StringSelectMenuBuilder>()
			.addComponents(
				new StringSelectMenuBuilder()
					.setCustomId('select')
					.setPlaceholder('Nothing selected')
					.setOptions(...options)
			)
		const filter = i => {
			return i.user.id === interaction.user.id
		}
		await interaction.reply({ embeds: embeds.messageEmbed(`Choose a value for **${setting}**...`), components: [row], ephemeral: true }).then((message) => {
			message
				.awaitMessageComponent({ filter, componentType: ComponentType.StringSelect, time: 60000 })
				.then(async (i) => {
					let value = i.values[0]
					console.log(value)
					interaction.editReply({ embeds: embeds.successEmbed(`Choose a value for **${setting}**...`, `You selected ${value}`), components: [] })
					resolve(value)
				})
				.catch(err => {
					interaction.editReply({ embeds: embeds.messageEmbed(`Choose a value for **${setting}**...`, `Nothing selected`, null, "#ff0000"), components: [] })
					reject(new Error("Nothing selected"))
				})
		})
	})
}
