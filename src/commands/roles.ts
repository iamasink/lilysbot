import { PermissionsBitField, SlashCommandBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonBuilder, ButtonStyle, ComponentType, ChatInputCommandInteraction, StringSelectMenuBuilder, Message, StringSelectMenuInteraction, Snowflake, ActionRow } from 'discord.js'
import embeds from '../utils/embeds'
import database from '../utils/database'
import ApplicationCommand from '../types/ApplicationCommand'
var stringSimilarity = require("string-similarity")

async function getRoles(interaction) {
	//await interaction.reply(interaction.options.getString('input'))
	let roles = interaction.guild.roles.cache

	roles = roles.filter(r => r.managed != true)
	return roles.sort((a, b) => b.rawPosition - a.rawPosition)
}

async function createMenu(guild, rolelist) {
	var output = ""
	for (let i = 0; i < rolelist.length; i++) {
		let role = await guild.roles.fetch(rolelist[i].id)
		output += `\n${role.name}`
	}
	return `breuh\n` + output
}

async function updateMenu(id) {

}

export default new ApplicationCommand({
	permissions: ["ManageRoles"],
	data: new SlashCommandBuilder()
		.setName('roles')
		.setDescription('setup roles')
		.addSubcommandGroup(group => group
			.setName('menu')
			.setDescription('role menu options')
			.addSubcommand(command => command
				.setName('create')
				.setDescription('create a menu')
				.addStringOption(option => option
					.setName('name')
					.setDescription('name of the menu')
					.setRequired(true)
				)
				.addStringOption(option => option
					.setName('description')
					.setDescription('description to show with the menu')
				)
				.addStringOption(option => option
					.setName('type')
					.setDescription('type of menu. Defaults to menu')
					.addChoices(
						{ name: 'Dropdown menu (recommended)', value: 'menu' },
						{ name: 'Buttons (can select 1 role only)', value: 'buttons' }
					))
				.addIntegerOption(option => option
					.setName('minimum')
					.setDescription('minimum number of roles in this list a user can have. Defaults to 0.  No effect with Buttons')
				)
				.addIntegerOption(option => option
					.setName('maximum')
					.setDescription('maximum number of roles in this list a user can have. No limit by default. No effect with Buttons')
				)

			)
			.addSubcommand(command => command
				.setName('update')
				.setDescription('update a menu')
				.addStringOption(option => option
					.setName('menu')
					.setDescription('name of menu or id of message')
					.setRequired(true))
			)
		)
		.addSubcommandGroup(group => group
			.setName('lists')
			.setDescription('role lists')
			.addSubcommand(command => command
				.setName('get')
				.setDescription('list roles')
				.addStringOption(option => option
					.setName('name')
					.setDescription('name of the role list. Defaults to all'))
			)
			.addSubcommand(command => command
				.setName('create')
				.setDescription('create a new role list')
				.addStringOption(option => option
					.setName('name')
					.setDescription('name of role list')
					.setRequired(true)
				)
			)
			.addSubcommand(command => command
				.setName('delete')
				.setDescription('delete a role list')
				.addStringOption(option => option
					.setName('name')
					.setDescription('name of role list')
					.setRequired(true)
				)
			)
		),
	async execute(interaction): Promise<void> {
		// please jesus christ come down and refactor this code <3
		// and add comments
		switch (interaction.options.getSubcommandGroup()) {
			case 'menu': {
				switch (interaction.options.getSubcommand()) {
					case 'create': {
						// get list of role lists from database
						const rolelists = await database.get(`.guilds.${interaction.guild.id}.roles.lists`)
						let options = []
						console.log(JSON.stringify(rolelists))
						let roleMenu = {
							"name": interaction.options.getString('name'),
							"minimum": interaction.options.getInteger('minimum') || 0,
							"maximum": interaction.options.getInteger('maximum') || 25,
							"type": interaction.options.getString('type') || "menu",
							"description": interaction.options.getString('description'),
							"list": "",
							"roles": [],
							"id": ""
						}

						// create options for select menu from role list list
						for (let i in rolelists) {
							console.log(rolelists[i].name)
							options.push({ label: rolelists[i].name, value: rolelists[i].name })
						}
						console.log(options)
						if (options.length == 0) {
							throw new Error("No role lists exist. Create one.")
						}
						const row = new ActionRowBuilder<StringSelectMenuBuilder>()
							.addComponents(
								new StringSelectMenuBuilder()
									.setCustomId('select')
									.setPlaceholder('Choose a role list')
									.addOptions(options)
							)
						// ball fondle emoji 🫴🫴🫴
						interaction.reply({ embeds: embeds.messageEmbed(`Creating role menu '${roleMenu.name}'`, `Choose a role list to assign the menu to. You can create one using /roles lists create.`), components: [row] }).then(msg => {
							const filter = (i: StringSelectMenuInteraction) => i.user.id === interaction.user.id
							// await user to interact with the menu
							msg.awaitMessageComponent({ filter, componentType: ComponentType.StringSelect, time: 120000 })
								.then(async i => {
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

									switch (roleMenu.type) {
										case 'menu': {
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
												.setPlaceholder('Choose roles')
												.setMinValues(roleMenu.minimum)
												.setMaxValues(maximum)

											options = []
											for (let i = 0; i < num; i++) {
												let push = {
													label: interaction.guild.roles.resolve(list[i].id).name,
													value: list[i].id,
													description: "."
												}
												if (list[i].description) {
													push.description = list[i].description
													console.log(`desc: ${push.description}`)

												}
												if (list[i])
													options.push(push)
											}
											console.log(`options: ${JSON.stringify(options)}`)
											menu.addOptions(options)

											const row = new ActionRowBuilder<StringSelectMenuBuilder>()
												.addComponents(menu)
											console.log(`menu: ${JSON.stringify(menu)}`)
											rows = [row]

											break
										}
										case 'buttons': {
											// maximum can't be more than the list size. handle it
											let maximum = roleMenu.maximum
											if (roleMenu.maximum > list.length) {
												maximum = list.length
											} else {
												maximum = roleMenu.maximum
											}


											const actionRows: ActionRowBuilder<ButtonBuilder>[] = [];

											for (let i = 0; i < list.length; i += 5) {
												const buttons: ButtonBuilder[] = [];

												for (let j = 0; j < 5; j++) {
													if (i + j < list.length) {
														buttons.push(new ButtonBuilder()
															.setCustomId(`roles.buttonrolemenu.${list[i + j].id}`)
															.setLabel(interaction.guild.roles.resolve(list[i + j].id).name)
															.setStyle(ButtonStyle.Primary));
													} else {
														// if there's nothing else to add, don't do anything dumbshit
													}
												}

												actionRows.push(new ActionRowBuilder<ButtonBuilder>().addComponents(...buttons));
											}

											rows = actionRows



											// let rowcount = Math.floor(1 + (num / 5))
											// let rows = []
											// let buttonsOnLastRow = num - (rows * 5)
											// for (let x = 0; x < rowcount; x++) {
											// 	rows[x] = new ActionRowBuilder()
											// 	let buttonscount: number
											// 	if (x == rowcount - 1) {
											// 		buttonscount = buttonsOnLastRow
											// 	} else {
											// 		buttonscount = 5
											// 	}
											// 	console.log(`buttonscount ${buttonscount}`)
											// 	for (let i = 0; i < buttonscount; i++) {
											// 		rows[x].addComponents(
											// 			new ButtonBuilder()
											// 				.setCustomId(`roles.rolemenu.${list[i].id}`)
											// 				.setLabel(`${interaction.guild.roles.resolve(list[i].id).name}`)
											// 				.setStyle(ButtonStyle.Primary),
											// 		)
											// 	}
											// }
											// break
										}
									}




									i.message.channel.send({ embeds: embeds.messageEmbed(`Roles - ${roleMenu.name}`, roleMenu.description), components: rows }).then(async (msg: Message) => {
										roleMenu.id = msg.id
										await database.set(`.guilds.${interaction.guild.id}.roles.menus.${roleMenu.id}`, roleMenu)
									})

								})
								.catch(err => {
									interaction.followUp(`no interactions were collected\n${err}`)
									console.log(`No interactions were collected.\n`, err)
								})
						})


						// interaction.guild.channels.cache.get(interaction.channelId).send('__Roles__').then(msg => {
						// 	const id = msg.id
						// 	roleMenu.id = id
						// 	console.log(interaction.channel.messages.fetch(id))
						// 	path = `.${interaction.guild.id}.roles.menus`
						// 	try {
						// 		database.set(path + `.${roleMenu.name}`, roleMenu)
						// 	} catch (error) {
						// 		throw new Error(`Could not create role menu, does one by this name already exist?`)
						// 	}
						// })

						break
					}
					case 'update': {

					}
				}
				break
			}
			case 'lists': {
				switch (interaction.options.getSubcommand()) {
					case 'create': {
						// check if it already exists
						const lists = await database.get(`.guilds.${interaction.guild.id}.roles.lists`)

						console.log(`lists = ${JSON.stringify(lists)}`)
						if (lists.hasOwnProperty(interaction.options.getString('name'))) {
							throw new Error(`Could not create role menu, one by this name already exists.`)
						}
						if (Object.keys(lists).length > 24) {
							// if too many rolelists for a select menu
							throw new Error("You have too many rolelists. If you have this many you're probably using it wrong lol.")
						}


						const newroles = []
						const roleList = {
							"roles": [],
							"name": interaction.options.getString('name')
						}

						const messagesToDelete = []
						await interaction.reply({ embeds: embeds.messageEmbed(`Enter roles for the list: ${roleList.name}. `, `Type role name or id, type 'done' when finished, or 'cancel' to cancel!\nOptionally add a role description on a new line.\nYou can also type '+rolename' to quickly create a new role by that name`), })
							.then((message) => messagesToDelete.push(message))

						console.log(`awawawa msg: ${await (messagesToDelete[0])}`)

						// `m` is a message object that will be passed through the filter function
						const filter = (m: Message) => m.author.id === interaction.user.id
						// collect messages
						const collector = interaction.channel.createMessageCollector({ filter, time: 120000 })
						collector.on('collect', async m => {
							var roleid: string
							const isnew = false
							// delete the collected message
							m.delete()
							collector.resetTimer()
							console.log(m)
							const text = m.content.trim()
							console.log(`Collected ${m.content}`)
							if (text.toLowerCase() == 'done') {
								collector.stop()
								return
							}
							if (text.toLowerCase() == 'cancel') {
								collector.stop("cancel")
								return
							}
							if (text[0] === '+') {
								// get name
								const rolename = text.split('\n')[0].slice(1)
								// create new role by name with no permissions
								await interaction.guild.roles.create({ name: rolename, permissions: new PermissionsBitField(0n), reason: "Creating new role for role list" })
									.then(async newrole => {
										roleid = newrole.id
										console.log(`roleid = ${roleid}`)
										newroles.push(roleid)
										const isnew = true
										// handle remove button
										const row = new ActionRowBuilder<ButtonBuilder>()
											.addComponents(
												new ButtonBuilder()
													.setCustomId(`roleslist-remove2`)
													.setLabel('Remove')
													.setStyle(ButtonStyle.Danger),
											)

										await interaction.followUp({ embeds: embeds.messageEmbed(null, `**<@&${roleid}>**\n(*new role*).`), components: [row] }).then(msg => {
											messagesToDelete.push(msg)
											const filter = i => i.customId === 'roleslist-remove2'
											const collector = msg.createMessageComponentCollector({ filter, time: 120000 })

											// collect button press to remove role
											collector.on('collect', i => {
												if (i.user.id !== interaction.user.id) i.reply({ content: `These buttons aren't for you!`, ephemeral: true })

												const index = roleList.roles.findIndex(r => r.id === roleid)
												roleList.roles.splice(index, 1)
												interaction.guild.roles.delete(roleid, 'The role needed to go')
													.then(() => console.log('Deleted the role'))
													.catch(console.error)
												collector.stop()
												msg.delete()

											})

											collector.on('end', collected => {
												console.log(`Collected ${collected.size} interactions.`)
											})
										})
									})
									.catch(console.error)
							} else if (text[0] === '<') { // if user pinged a role, extract id
								const id = text.split('\n')[0].slice(3, -1)
								const role = await interaction.guild.roles.fetch(id)
								console.log(role)
								if (!role.managed) {
									roleid = id
								} else {
									interaction.followUp({ embeds: embeds.messageEmbed("Bot roles cannot be used.", null, null, '#ff0000') })
										.then((message) => messagesToDelete.push(message))
								}
							} else {
								// fetch from name or id
								const role = await interaction.guild.roles.fetch(text.split('\n')[0])
								roleid = ""
								console.log(`role = ${role}`)
								if (!role) { // if no role was found from id, search with the text
									const fetchedroles = await interaction.guild.roles.fetch()
									console.log(`fetchedroles = ${JSON.stringify(fetchedroles)}`)
									const rolelist: string[] = []
									const roleidlist: Snowflake[] = []
									for (const [key, value] of fetchedroles) {
										console.log(`key= ${key}, value= ${value}`)
										if (!value.managed) {
											rolelist.push(value.name.toLowerCase())
											roleidlist.push(value.id)
										}
									}
									console.log(rolelist)
									const matches = stringSimilarity.findBestMatch(text, rolelist)
									const index = matches.bestMatchIndex
									if (index != 0) {
										console.log(roleidlist[index])
										roleid = roleidlist[index]
									}
								}

							}


							if (roleid) {
								if (roleList.roles.find(r => r.id === roleid)) {
									interaction.followUp({ embeds: embeds.messageEmbed("This role has already been added.", null, null, '#ff0000') })
										.then((message) => messagesToDelete.push(message))
								} else {
									console.log("Yeah.")
									const role = await interaction.guild.roles.fetch(roleid)
									roleList.roles.push({ id: role.id, description: text.split('\n')[1] })

									if (!isnew) {
										// handle remove button
										const row = new ActionRowBuilder<ButtonBuilder>()
											.addComponents(
												new ButtonBuilder()
													.setCustomId(`roleslist-remove`)
													.setLabel('Remove')
													.setStyle(ButtonStyle.Danger),
											)

										interaction.followUp({ embeds: embeds.messageEmbed(null, `**<@&${roleid}>**\n(*from '${text.split('\n')[0]}'*).`), components: [row] }).then(msg => {
											messagesToDelete.push(msg)
											const filter = i => i.customId === 'roleslist-remove'
											const collector = msg.createMessageComponentCollector({ filter, time: 120000 })

											// collect button press to remove role
											collector.on('collect', i => {
												if (i.user.id === interaction.user.id) {
													const index = roleList.roles.findIndex(r => r.id === roleid)
													roleList.roles.splice(index, 1)
													collector.stop()
													msg.delete()

												} else {
													i.reply({ content: `These buttons aren't for you!`, ephemeral: true })
												}
											})

											collector.on('end', collected => {
												console.log(`Collected ${collected.size} interactions.`)
											})
											const reactioncollector = msg.createReactionCollector({ filter, time: 15000 })

											reactioncollector.on('collect', (reaction, user) => {
												console.log(`Collected ${reaction.emoji.name} from ${user.tag}`)
												if (user == interaction.user) {

												} else {

												}
											})

											reactioncollector.on('end', collected => {
												console.log(`Collected ${collected.size} items`)
											})
										})
									}

								}
							} else {
								interaction.followUp({ embeds: embeds.messageEmbed(`Role '${text}' not found.`, `Type "done" to finish or "cancel" to cancel`, null, '#ff0000') })
									.then((message) => messagesToDelete.push(message))
							}
						})
						collector.on('end', async (collected, reason) => {
							if (reason == 'cancel') {
								interaction.followUp({ embeds: embeds.messageEmbed("Cancelled", null, null, '#ff0000') })
									.then((message) => messagesToDelete.push(message))
								console.log(newroles)
								for (let i = 0; i < newroles.length; i++) {
									const role = await interaction.guild.roles.fetch(newroles[i])
									interaction.guild.roles.delete(role)
										.then(() => console.log('Deleted the role'))
										.catch(console.error)
								}
							} else {
								console.log(`Saved ${roleList.roles.length} roles`)
								console.log(`rolelist: ${JSON.stringify(roleList)}`)
								if (roleList.roles.length > 0) {
									interaction.followUp({ embeds: embeds.successEmbed(`Saved ${roleList.roles.length} roles`) })

									// cleanup messages
									// for (let i = 0; i < messagesToDelete.length; i++) {
									// 	//message = await interaction.channel.messages.fetch({ message: messagesToDelete[i] })
									// 	//interaction.channel.messages.delete(messagesToDelete[i])
									// 	console.log(messagesToDelete[i].id)
									// }
									interaction.channel.bulkDelete(messagesToDelete.map(m => m.id))


									interaction.followUp({ embeds: embeds.messageEmbed(`Roles in list ${roleList.name}:`, `${roleList.roles.map(r => `<@&${r.id}>`).join('\n')}`) })

									try {
										const path = `.guilds.${interaction.guild.id}.roles.lists`
										await database.set(path + `.${roleList.name}`, roleList)
									} catch (error) {
										throw new Error(`Could not create role list, does one by this name already exist?`)
									}
								} else {
									interaction.followUp({ embeds: embeds.messageEmbed("No roles added", null, null, '#ff0000') })
								}
							}
						})
						break
					}
					case 'get': {
						const rolelists = await database.get(`.guilds.${interaction.guild.id}.roles.lists`)
						if (!interaction.options.getString('name') || interaction.options.getString('name') == 'all') {
							const roles = await getRoles(interaction)
							//options = roles.map(r => r = { label: r.name, value: r.id })
							//console.log("options: ", options)
							const tagList = []
							for (const [key, value] of roles) {
								console.log(`${key} goes ${value}`)
								console.log(`${value.name}`)
								if (value.name != `@everyone`) tagList.push(`<@&${value.id}>`)
								else tagList.push(`@everyone`)
							}
							let roleliststext = ""
							let count = 0
							for (const i in rolelists) {
								roleliststext += `${rolelists[i].name} - ${rolelists[i].roles.length}\n`
								count++
							}

							console.log(tagList)
							await interaction.reply({ embeds: embeds.messageEmbed(`Roles - ${tagList.length}`, tagList.join('\n')) })
							await interaction.followUp({ embeds: embeds.messageEmbed(`Role Lists - ${count}`, roleliststext) })
							// todo add rolelists


						} else {
							console.log(JSON.stringify(rolelists))
							for (const i in rolelists) {
								const roles = rolelists[i].roles.map(r => `<@&${r.id}>`)
								if (rolelists[i].name == interaction.options.getString('name')) {
									interaction.reply({ embeds: embeds.messageEmbed(`Roles List - ${rolelists[i].name} - ${rolelists[i].roles.length}`, roles.join('\n')) })
								}
							}

						}

						break
					}
					case 'delete': {
						const rolelists = await database.get(`.guilds.${interaction.guild.id}.roles.lists`)
						const rolelist = interaction.options.getString('name')
						try {
							await database.del(`.${interaction.guild.id}.roles.lists.${rolelist}`)
							interaction.reply({ embeds: embeds.successEmbed(`Successfully deleted ${rolelist}`) })
						} catch (e) {
							throw new Error(`Couldn't delete rolelist\n${e}`)
						}

						break
					}
				}
				break

			}
		}
	},
	async menu(interaction): Promise<void> {
		//await interaction.deferReply()
		console.log(interaction.values)
		console.log(interaction)
		const id = interaction.customId.split(".")
		console.log(id)
		switch (id[1]) {
			case 'selectrolemenu': {
				await interaction.deferUpdate()
				const menuid = interaction.message.id
				const roleMenu = await database.get(`.guilds.${interaction.guild.id}.roles.menus.${menuid}`)
				const roleList = await database.get(`.guilds.${interaction.guild.id}.roles.lists.${roleMenu.list}`)
				const user = await interaction.user.fetch()
				const member = interaction.guild.members.resolve(user)
				const roles = member.roles.cache // members roles
				const roleids = roleList.roles.map(r => r.id) // list of ids on the role list

				// for every role on the role list
				for (let i = 0; i < roleList.roles.length; i++) {
					console.log(i)
					console.log(roleList.roles[i])
					// if the user has it:
					if (roles.find(r => r.id === roleList.roles[i].id)) {
						console.log("user has it")
						// if its not selected on the list
						if (!interaction.values.includes(roleList.roles[i].id)) {
							// remove it
							console.log(`removing ${roleList.roles[i]}`)
							await interaction.guild.members.removeRole({ user: member, role: roleList.roles[i].id, reason: `rolemenu ${roleMenu.name}` })
						}
					} else { // if the user doesn't have it
						console.log("not found")
						// if its selceted on the list
						if (interaction.values.includes(roleList.roles[i].id)) {
							// add it
							console.log(`adding ${roleList.roles[i].id}`)
							await interaction.guild.members.addRole({ user: member, role: roleList.roles[i].id, reason: `rolemenu ${roleMenu.name}` })
						}
					}
				}
				//await interaction.editReply({ embeds: embeds.messageEmbed(`Roles updated!`,), ephemeral: true }).then(msg => msg.delete())
				break
			}
		}
	},
	async button(interaction) {
		console.log(interaction)
		let id = interaction.customId.split(".")
		switch (id[1]) {
			case 'buttonrolemenu': {
				const roleid = id[2]
				const menuid = interaction.message.id
				const roleMenu = await database.get(`.guilds.${interaction.guild.id}.roles.menus.${menuid}`)
				const roleList = await database.get(`.guilds.${interaction.guild.id}.roles.lists.${roleMenu.list}`)
				console.log(roleMenu)
				console.log(roleList)
				const role = await interaction.guild.roles.fetch(roleid)
				const user = await interaction.user.fetch()
				const member = interaction.guild.members.resolve(user)
				const roles = member.roles.cache // members roles
				// list of role ids from the list
				const roleids = roleList.roles.map(r => r.id)

				// this is the list of roles the user has that are also in the role list
				let rolesinlist = roles.filter(r => {
					// if its in the roleList, add it
					if (roleids.includes(r.id)) {
						return r.id
					}
				})

				//count roles the user has in the list
				let rolecount = 0
				// for (var i = 0; i < roles.size; i++) {
				// 	// for each role the user has
				// 	console.log(i)
				// 	console.log(roles[i])
				// 	if (roleids.includes(roles[i].id)) {
				// 		rolecount++
				// 	}
				// }
				for (const [key, value] of roles) {
					console.log(`key: ${key}`)
					console.log(`value: ${value}`)
					if (roleids.includes(value.id)) {
						rolecount++
					}
				}


				console.log(`roleids: ${JSON.stringify(roleids)}`)
				console.log(`rolesinlist: ${JSON.stringify(rolesinlist)}`)
				console.log(`roles: ${JSON.stringify(roles)}`)


				// for every role on the role list
				for (let i = 0; i < roleList.roles.length; i++) {
					console.log(i)
					console.log(roleList.roles[i])
					// if the user has it:
					if (roles.find(r => r.id === roleList.roles[i].id)) {
						console.log("user has it")
						// if its not selected on the list
						if (roleid != roleList.roles[i].id) {
							// remove it
							console.log(`removing ${roleList.roles[i]}`)
							await interaction.guild.members.removeRole({ user: member, role: roleList.roles[i].id, reason: `rolemenu ${roleMenu.name}` })
						}
					} else { // if the user doesn't have it
						console.log("not found")
						// if its selceted on the list
						if (roleid == roleList.roles[i].id) {
							// add it
							console.log(`adding ${roleList.roles[i]}`)
							await interaction.guild.members.addRole({ user: member, role: roleList.roles[i].id, reason: `rolemenu ${roleMenu.name}` })
						}
					}
				}

				await interaction.deferUpdate()
				//await interaction.editReply({ embeds: embeds.messageEmbed(`Roles updated!`,), options: { ephemeral: true } }).then(msg => msg.delete())


				// // does the user already have the role?
				// if (roles.find(r => r.id === roleid)) {
				// 	if (rolecount >= maxroles) {
				// 		interaction.guild.members.removeRole({ user: user, role: roleid, reason: `rolemenu ${roleMenu.name}` })
				// 	} else {
				// 		interaction.reply({ embeds: embeds.messageEmbed(`You have too few roles in list ${roleMenu.name}!`, `${rolecount} / ${minroles}. `), ephemeral: true })
				// 	}

				// } else {
				// 	if (rolecount <= minroles) {

				// 		interaction.guild.members.addRole({ user: user, role: roleid, reason: `rolemenu ${roleMenu.name}` })
				// 		interaction.reply({ embeds: embeds.messageEmbed(`Added role ${role.name}`), ephemeral: true })
				// 	} else {
				// 		interaction.reply({ embeds: embeds.messageEmbed(`You have too many roles in list ${roleMenu.name}!`, `${rolecount} / ${maxroles}. `), ephemeral: true })


				// 	}


				// }
				//interaction.reply(rolename)


				break
			}
		}

		for (var i = 0; i < id.length; i++) {
			console.log(id[i])
		}

		//throw new Error("not implemented")
	}
})
