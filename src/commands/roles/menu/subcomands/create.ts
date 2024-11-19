import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChatInputCommandInteraction,
	ComponentType,
	EmbedBuilder,
	Message,
	StringSelectMenuBuilder,
	StringSelectMenuInteraction,
} from "discord.js"
import { Subcommand } from "../../../../types/ApplicationCommand"
import database from "../../../../utils/database"
import embeds from "../../../../utils/embeds"
import { RoleList, SelectMenuItem } from "../../roles"

const timeout = 15 * 15 * 1000

export default {
	name: "update",
	execute: async (interaction: ChatInputCommandInteraction) => {
		// /roles menu create

		// get list of role lists from database
		const rolelists: RoleList[] = await database.get(
			`.guilds.${interaction.guild.id}.roles.lists`,
		)
		let options = []
		console.log(JSON.stringify(rolelists))
		let roleMenu = {
			name: interaction.options.getString("name"),
			minimum: interaction.options.getInteger("minimum") || 0,
			maximum: interaction.options.getInteger("maximum") || 25,
			type: interaction.options.getString("type") || "menu",
			description: interaction.options.getString("description"),
			list: "",
			roles: [],
			id: "",
		}

		// create options for select menu from role list list
		for (let i in rolelists) {
			console.log(rolelists[i].name)
			options.push({
				label: rolelists[i].name,
				value: rolelists[i].name,
			})
		}
		console.log(options)
		if (options.length == 0) {
			throw new Error("No role lists exist. Create one.")
		}
		const row =
			new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
				new StringSelectMenuBuilder()
					.setCustomId("select")
					.setPlaceholder("Choose a role list")
					.addOptions(options),
			)
		// ball fondle emoji 🫴🫴🫴
		interaction
			.reply({
				embeds: embeds.messageEmbed(
					`Creating role menu '${roleMenu.name}'`,
					`Choose a role list to assign the menu to. \nYou can create one using \`/roles lists create.\``,
				),
				components: [row],
			})
			.then((msg) => {
				const filter = (i: StringSelectMenuInteraction) =>
					i.user.id === interaction.user.id
				// await user to interact with the menu
				msg.awaitMessageComponent({
					filter,
					componentType: ComponentType.StringSelect,
					time: timeout,
				})
					.then(async (i) => {
						console.log(i)

						//await i.reply(`You selected ${i.values[0]}!`)
						roleMenu.list = i.values[0]
						//i.followUp(JSON.stringify(rolelists[roleMenu.list]))
						let list = rolelists[roleMenu.list].roles
						console.log(`list: ${JSON.stringify(list)}`)
						interaction.deleteReply()
						//list = await database.get(`.${interaction.guild.id}.roles.lists.${roleMenu.list}`)

						let rows = []
						//const menu = await createMenu(interaction.guild, list)
						const num = list.length
						let message: string

						switch (roleMenu.type) {
							case "menu": {
								if (roleMenu.maximum == 1) {
									message = "Select a role from the list!"
								} else {
									message = "Select role(s) from the list!"
								}

								// maximum can't be more than the list size. handle it
								let maximum = roleMenu.maximum
								if (roleMenu.maximum > list.length) {
									maximum = list.length
								} else {
									maximum = roleMenu.maximum
								}

								// create the menu
								const menu = new StringSelectMenuBuilder()
									.setCustomId(`roles.selectrolemenu`)
									.setPlaceholder("Choose roles")
									.setMinValues(roleMenu.minimum)
									.setMaxValues(maximum)

								options = []
								// for each role in the list
								for (let i = 0; i < num; i++) {
									let push: SelectMenuItem = {
										label: interaction.guild.roles.resolve(
											list[i].id,
										).name,
										value: list[i].id,
									}

									// set description and emoji if it should exist.

									if (list[i].description) {
										push.description = list[i].description
										console.log(`desc: ${push.description}`)
									}
									if (list[i].emoji) {
										push.emoji = list[i].emoji
									}
									if (list[i]) {
										options.push(push)
									}
								}
								console.log(
									`options: ${JSON.stringify(options)}`,
								)
								menu.addOptions(options)

								const row =
									new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
										menu,
									)
								console.log(`menu: ${JSON.stringify(menu)}`)
								rows = [row]

								break
							}
							case "buttons": {
								message = "Click a button to pick a role!"

								// maximum can't be more than the list size. handle it
								let maximum = roleMenu.maximum
								if (roleMenu.maximum > list.length) {
									maximum = list.length
								} else {
									maximum = roleMenu.maximum
								}

								const actionRows: ActionRowBuilder<ButtonBuilder>[] =
									[]

								for (let i = 0; i < list.length; i += 5) {
									const buttons: ButtonBuilder[] = []

									for (let j = 0; j < 5; j++) {
										if (i + j < list.length) {
											new ButtonBuilder()
											const button = new ButtonBuilder()
											button.setCustomId(
												`roles.buttonrolemenu.${
													list[i + j].id
												}`,
											)
											button.setLabel(
												interaction.guild.roles.resolve(
													list[i + j].id,
												).name,
											)
											button.setStyle(ButtonStyle.Primary)
											if (list[i + j].emoji)
												button.setEmoji(
													list[i + j].emoji,
												)

											buttons.push(button)
										} else {
											// if there's nothing else to add, don't do anything dumbshit
										}
									}

									actionRows.push(
										new ActionRowBuilder<ButtonBuilder>().addComponents(
											...buttons,
										),
									)
								}

								rows = actionRows

								console.log(rows)

								break
							}
							case "reactions": {
								message = "React to pick a role!"
								for (
									let i = 0, len = list.length;
									i < len;
									i++
								) {
									// if (!list[i].emoji) {
									// 	throw new Error("all roles must have an emoji assigned")
									// }
								}

								console.log(rows)
								break
							}
							default: {
								throw new Error("invalid option")
							}
						}

						const embed = new EmbedBuilder().setTitle(
							`Roles - ${roleMenu.name}`,
						)

						if (roleMenu.description)
							embed.setDescription(`${roleMenu.description}`)
						if (message) embed.setFooter({ text: message })

						i.message.channel
							.send({
								embeds: [embed],
								components: rows,
							})
							.then(async (msg: Message) => {
								roleMenu.id = msg.id
								await database.set(
									`.guilds.${interaction.guild.id}.roles.menus.${roleMenu.id}`,
									roleMenu,
								)
							})
					})
					.catch((err) => {
						interaction.followUp(
							`no interactions were collected\n${err}`,
						)
						console.log(`No interactions were collected.\n`, err)
					})
			})
	},
} satisfies Subcommand
