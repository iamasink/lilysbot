import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChannelSelectMenuBuilder,
	ChannelType,
	ChatInputCommandInteraction,
	ComponentType,
	GuildChannel,
	PermissionsBitField,
	Role,
	RoleSelectMenuBuilder,
	SlashCommandBuilder,
	Snowflake,
	StringSelectMenuBuilder,
	TextChannel,
} from "discord.js"
import ApplicationCommand from "../types/ApplicationCommand"
import embeds from "../utils/embeds"
import database from "../utils/database"
import settings from "../utils/settings"
import { findBestMatch } from "string-similarity"
const settingsList = settings.settingsList

const choices = settingsList.map((setting) => {
	return { name: setting.name, value: setting.value }
})

export default new ApplicationCommand({
	permissions: [new PermissionsBitField("Administrator")],
	data: new SlashCommandBuilder()
		.setName("settings")
		.setDescription("Configure bot settings for this server")
		.addSubcommand(
			(command) =>
				command
					.setName("set")
					.setDescription("change a settings")
					.addStringOption((option) =>
						option
							.setName("setting")
							.setDescription("setting to change")
							.setRequired(true)
							.addChoices(...settingsList),
					),
			// .addStringOption(option => option
			// 	.setName('value')
			// 	.setDescription('value')
			// 	.setRequired(true)
			// )
		)
		// .addSubcommand(command => command
		// 	.setName('set2')
		// 	.setDescription('change a settings')
		// 	.addStringOption(option => option
		// 		.setName('setting')
		// 		.setDescription('setting to change')
		// 		.setAutocomplete(true)
		// 		.setRequired(true)
		// 	)
		// )
		.addSubcommand((command) =>
			command.setName("get").setDescription("get all options"),
		)
		.addSubcommand((command) =>
			command.setName("list").setDescription("list all settings"),
		),
	async execute(interaction) {
		const guild = interaction.guild

		console.log(`choices: ${JSON.stringify(choices)}`)
		switch (interaction.options.getSubcommand()) {
			case "set": {
				const settingName = interaction.options.getString("setting")
				console.log(settingName)
				const option: Setting =
					settingsList[
						settingsList.findIndex((e) => e.value === settingName)
					]
				console.log(JSON.stringify(option))
				const oldvalue = await settings.get(
					interaction.guild,
					settingName,
				)
				let value = ""
				switch (option.type) {
					case "channel": {
						let channel = await channelSelector(
							interaction,
							option.name,
							oldvalue,
						)
						if (channel) {
							console.log(channel.name)

							value = channel.id
						} else {
							value = null
						}
						break
					}
					case "role": {
						let role = await roleSelector(
							interaction,
							option.name,
							oldvalue,
						)
						if (role) {
							console.log(role.name)
							value = role.id
							break
						} else {
							value = null
						}
					}
					case "toggle": {
						value = await toggleSelector(
							interaction,
							option.name,
							oldvalue,
						)
						break
					}
					case "string": {
						value = await stringSelector(
							interaction,
							option.name,
							option.options,
							oldvalue,
						)
						break
					}
					// case 'list': {
					// 	value = await stringSelector(interaction, option.name)
					// }
					default: {
						throw new Error(`invalid type: ${option.type}`)
					}
				}
				//database.set(`.guilds.${interaction.guild.id}.settings.${option.value}`, value)
				settings.set(guild, option.value, value)

				break
			}
			case "get": {
				const settings: object = await database.get(
					`.guilds.${interaction.guild.id}.settings`,
				)

				interaction.reply({
					embeds: embeds.messageEmbed(
						`Settings:\n${JSON.stringify(settings)}`,
					),
					ephemeral: true,
				})

				break
			}
			case "list": {
				await settings.setDefaults(interaction.guild.id)

				const output = settingsList.map(async (e) => {
					const name = e.name
					const type = e.type
					const description = e.description
					let currentValue: string = ""
					const value = await settings.get(
						interaction.guild,
						`${e.value}`,
					)
					if (value != null) {
						switch (type) {
							case "channel": {
								currentValue = `<#${value}>`
								break
							}
							case "role": {
								currentValue = `< @& ${value}>`
								break
							}
							case "toggle": {
								currentValue = `${value}`
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
				interaction.reply({
					embeds: embeds.messageEmbed(
						`Settings:`,
						(await Promise.all(output)).join("\n"),
					),
					ephemeral: true,
				})
				break
			}
		}
	},
	async autocomplete(interaction) {
		// console.log(interaction)
		// const focusedOption = interaction.options.getFocused(true)
		// // add the name of each invite and username to the invites as a new array
		// // Use Promise.all to wait for all async operations in map to complete
		// const arrayWithNames = await Promise.all(settingsList.map(async i => {
		// 	// Combine name with value from settings
		// 	const settingValue = await settings.get(interaction.guild, i.value)
		// 	return `${i.name} - ${settingValue || "unset"}`
		// }))
		// const matches = findBestMatch(focusedOption.value, arrayWithNames)
		// // console.log(matches)
		// let filtered = []
		// if (matches.bestMatch.rating === 0) {
		// 	filtered = arrayWithNames.sort((a, b) => {
		// 		return b.length - a.length
		// 	})
		// 	// console.log(filtered)
		// } else {
		// 	let sorted = matches.ratings.sort((a, b) => {
		// 		return b.rating - a.rating
		// 	})
		// 	// console.log("sorted:")
		// 	// console.log(sorted)
		// 	filtered = sorted.map(i => i.target)
		// }
		// var shortfiltered = filtered
		// if (filtered.length > 10) {
		// 	shortfiltered = filtered.slice(0, 5)
		// }
		// var response = shortfiltered.map(choice => {
		// 	const name = choice
		// 	// console.log(name)
		// 	const value = choice.split(' ')[0]
		// 	return { name: name, value: value }
		// })
		// // console.log(response)
		// await interaction.respond(response)
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

async function channelSelector(
	interaction: ChatInputCommandInteraction,
	setting: string,
	oldvalue: string,
): Promise<TextChannel> {
	const title = `Choose a channel for __${setting}__`
	return new Promise(async (resolve, reject) => {
		const row =
			new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
				new ChannelSelectMenuBuilder()
					.setCustomId("select")
					.setPlaceholder("Nothing selected"),
			)
		const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId("button")
				.setLabel("none")
				.setStyle(ButtonStyle.Danger),
		)
		const filter = (i) => {
			return i.user.id === interaction.user.id
		}
		await interaction
			.reply({
				embeds: embeds.messageEmbed(
					title,
					`**Currently**: *<#${oldvalue}>*`,
				),
				components: [row, row2],
				ephemeral: true,
			})
			.then((message) => {
				message
					.awaitMessageComponent({ filter, time: 60000 })
					.then(async (i) => {
						if (i.componentType == ComponentType.ChannelSelect) {
							let channel =
								await interaction.guild.channels.fetch(
									i.values[0],
								)
							console.log(channel)
							if (channel.type == ChannelType.GuildText) {
								interaction.editReply({
									embeds: embeds.successEmbed(
										title,
										`You selected <#${channel.id}>`,
									),
									components: [],
								})
								resolve(channel)
							} else {
								interaction.editReply({
									embeds: embeds.messageEmbed(
										title,
										`Invalid channel selected:\n${channel.name}`,
										null,
										"#ff0000",
									),
									components: [],
								})
								reject(new Error("Invalid channel selected"))
							}
						} else if (i.componentType == ComponentType.Button) {
							let channel = null
							console.log(channel)
							interaction.editReply({
								embeds: embeds.successEmbed(
									title,
									`You selected none`,
								),
								components: [],
							})
							resolve(channel)
						}
					})
					.catch((err) => {
						interaction.editReply({
							embeds: embeds.messageEmbed(
								title,
								`No channel selected`,
								null,
								"#ff0000",
							),
							components: [],
						})
						reject(new Error("No channel selected"))
					})
			})
	})
}

async function roleSelector(
	interaction: ChatInputCommandInteraction,
	setting: string,
	oldvalue: string,
): Promise<Role> {
	const title = `Choose a role for __${setting}__`
	return new Promise(async (resolve, reject) => {
		const row = new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(
			new RoleSelectMenuBuilder()
				.setCustomId("select")
				.setPlaceholder("Nothing selected"),
		)
		const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId("button")
				.setLabel("none")
				.setStyle(ButtonStyle.Danger),
		)
		const filter = (i) => {
			return i.user.id === interaction.user.id
		}
		await interaction
			.reply({
				embeds: embeds.messageEmbed(
					title,
					`**Currently**: *${interaction.guild.roles.fetch(
						oldvalue,
					)}*`,
				),
				components: [row, row2],
				ephemeral: true,
			})
			.then((message) => {
				message
					.awaitMessageComponent({
						filter,
						componentType: ComponentType.RoleSelect,
						time: 60000,
					})
					.then(async (i) => {
						if (i.componentType == ComponentType.RoleSelect) {
							let role = await interaction.guild.roles.fetch(
								i.values[0],
							)
							console.log(role)
							interaction.editReply({
								embeds: embeds.successEmbed(
									title,
									`You selected <@&${role.id}>`,
								),
								components: [],
							})
							resolve(role)
						} else if (i.componentType == ComponentType.Button) {
							let role = null
							console.log(role)
							interaction.editReply({
								embeds: embeds.successEmbed(
									title,
									`You selected none`,
								),
								components: [],
							})
							resolve(role)
						}
					})
					.catch((err) => {
						interaction.editReply({
							embeds: embeds.messageEmbed(
								title,
								`No role selected`,
								null,
								"#ff0000",
							),
							components: [],
						})
						reject(new Error("No role selected"))
					})
			})
	})
}

async function toggleSelector(
	interaction: ChatInputCommandInteraction,
	setting: string,
	oldvalue: string,
): Promise<any> {
	return stringSelector(
		interaction,
		setting,
		[
			{ label: "On", value: "true" },
			{ label: "Off", value: "false" },
		],
		oldvalue == "true" ? "On" : "Off",
	)
}

async function stringSelector(
	interaction: ChatInputCommandInteraction,
	setting: string,
	options: SelectorOption[],
	oldvalue: string,
): Promise<any> {
	const title = `Choose a value for __${setting}__...`

	return new Promise(async (resolve, reject) => {
		const row =
			new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
				new StringSelectMenuBuilder()
					.setCustomId("select")
					.setPlaceholder("Nothing selected")
					.setOptions(
						...options.map((e) => {
							if (!e.label) {
								e.label = e.value
							}
							return e as SelectorOptionLabel
						}),
					),
			)
		const filter = (i) => {
			return i.user.id === interaction.user.id
		}
		await interaction
			.reply({
				embeds: embeds.messageEmbed(
					title,
					`**Currently**: *${oldvalue}*`,
				),
				components: [row],
				ephemeral: true,
			})
			.then((message) => {
				message
					.awaitMessageComponent({
						filter,
						componentType: ComponentType.StringSelect,
						time: 60000,
					})
					.then(async (i) => {
						let value = i.values[0]
						console.log(value)
						interaction.editReply({
							embeds: embeds.successEmbed(
								title,
								`You selected ${value}`,
							),
							components: [],
						})
						resolve(value)
					})
					.catch((err) => {
						interaction.editReply({
							embeds: embeds.warningEmbed(
								title,
								`Nothing selected`,
							),
							components: [],
						})
						setTimeout(() => interaction.deleteReply(), 10000)
						// reject(new Error("Nothing selected"))
					})
			})
	})
}
