const { PermissionsBitField, SlashCommandBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js')
const embeds = require('../../structure/embeds')
const buttons = require('../../structure/buttons')
const wizard = require('../../structure/wizard')
const database = require('../../structure/database')
var stringSimilarity = require("string-similarity")
const { messageEmbed } = require('../../structure/embeds')



async function getRoles(interaction) {
	//await interaction.reply(interaction.options.getString('input'))
	roles = interaction.guild.roles.cache

	roles = roles.filter(r => r.managed != true)
	return roles.sort((a, b) => b.rawPosition - a.rawPosition)
}

async function createMenu(guild, rolelist) {
	var output = ""
	for (i = 0; i < rolelist.length; i++) {
		role = await guild.roles.fetch(rolelist[i].id)
		output += `\n${role.name}`
	}
	return `breuh\n` + output
}

async function updateMenu(id) {

}

module.exports = {
	discordPermissions: [PermissionsBitField.Flags.ManageRoles],
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
	async execute(interaction) {
		switch (interaction.options.getSubcommandGroup()) {
			case 'menu': {
				switch (interaction.options.getSubcommand()) {
					case 'create': {
						// get list of role lists from database
						rolelists = await database.get(`guilds`, `.${interaction.guild.id}.roles.lists`)
						options = []
						console.log(JSON.stringify(rolelists))
						roleMenu = {}
						roleMenu.name = interaction.options.getString('name')
						roleMenu.minimum = interaction.options.getInteger('minimum') || 0
						roleMenu.maximum = interaction.options.getInteger('maximum') || 25
						roleMenu.type = interaction.options.getString('type') || "menu"
						roleMenu.description = interaction.options.getString('description')

						// create options for select menu from role list list
						for (i in rolelists) {
							console.log(rolelists[i].name)
							options.push({ label: rolelists[i].name, value: rolelists[i].name })
						}
						console.log(options)
						const row = new ActionRowBuilder()
							.addComponents(
								new SelectMenuBuilder()
									.setCustomId('select')
									.setPlaceholder('Choose a role list')
									.addOptions(options)

							)
						// ball fondle emoji 🫴🫴🫴
						interaction.reply({ embeds: embeds.messageEmbed(`Creating role menu '${roleMenu.name}'`, `Choose a role list to assign the menu to. You can create one using /roles lists create.`), components: [row] }).then(msg => {
							const filter = i => i.user.id === interaction.user.id
							// await user to interact with the menu
							msg.awaitMessageComponent({ filter, componentType: ComponentType.SelectMenu, time: 120000 })
								.then(async i => {
									//await i.reply(`You selected ${i.values[0]}!`)
									roleMenu.list = i.values[0]
									//i.followUp(JSON.stringify(rolelists[roleMenu.list]))
									list = rolelists[roleMenu.list].roles
									console.log(`list: ${JSON.stringify(list)}`)
									interaction.deleteReply()
									//list = await database.get(`guilds`, `.${interaction.guild.id}.roles.lists.${roleMenu.list}`)

									menu = await createMenu(interaction.guild, list)
									num = list.length

									switch (roleMenu.type) {
										case 'menu': {
											// maximum can't be more than the list size. handle it
											if (roleMenu.maximum > list.length) {
												maximum = list.length
											} else {
												maximum = roleMenu.maximum
											}

											const menu = new SelectMenuBuilder()
												.setCustomId(`roles.rolemenu`)
												.setPlaceholder('Choose roles')
												.setMinValues(roleMenu.minimum)
												.setMaxValues(maximum)

											options = []
											for (let i = 0; i < num; i++) {
												push = {}
												push.label = `${interaction.guild.roles.resolve(list[i].id).name}`
												push.value = `${list[i].id}`
												if (list[i].description) {
													push.description = list[i].description
													console.log(`desc: ${push.description}`)

												}
												if (list[i])
													options.push(push)
											}
											menu.addOptions(options)

											const row = new ActionRowBuilder()
												.addComponents(menu)
											console.log(`menu: ${JSON.stringify(menu)}`)
											rows = [row]

											break
										}
										case 'buttons': {
											rowcount = Math.floor(1 + (num / 5))
											rows = []
											buttonsOnLastRow = num - (rows * 5)
											for (x = 0; x < rowcount; x++) {
												rows[x] = new ActionRowBuilder()
												if (x == rowcount - 1) {
													buttonscount = buttonsOnLastRow
												} else {
													buttonscount = 5
												}
												console.log(`buttonscount ${buttonscount}`)
												for (let i = 0; i < buttonscount; i++) {
													rows[x].addComponents(
														new ButtonBuilder()
															.setCustomId(`roles.rolemenu.${list[i].id}`)
															.setLabel(`${interaction.guild.roles.resolve(list[i].id).name}`)
															.setStyle(ButtonStyle.Primary),
													)
												}
											}
											break
										}
									}




									i.message.channel.send({ embeds: embeds.messageEmbed(`Roles - ${roleMenu.name}`, roleMenu.description), components: rows }).then(async msg => {
										roleMenu.id = msg.id
										await database.set(`guilds`, `.${interaction.guild.id}.roles.menus.${roleMenu.id}`, roleMenu)
									})

								})
								.catch(err => console.log(`No interactions were collected.\n`, err))
						})


						// interaction.guild.channels.cache.get(interaction.channelId).send('__Roles__').then(msg => {
						// 	const id = msg.id
						// 	roleMenu.id = id
						// 	console.log(interaction.channel.messages.fetch(id))
						// 	path = `.${interaction.guild.id}.roles.menus`
						// 	try {
						// 		database.set(`guilds`, path + `.${roleMenu.name}`, roleMenu)
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
						lists = await database.get(`guilds`, `.${interaction.guild.id}.roles.lists`)

						console.log(`lists = ${JSON.stringify(lists)}`)
						if (lists.hasOwnProperty(interaction.options.getString('name'))) {
							throw new Error(`Could not create role menu, one by this name already exists.`)
						}
						if (Object.keys(lists).length > 24) {
							// if too many rolelists for a select menu
							throw new Error("You have too many rolelists. If you have this many you're probably using it wrong lol.")
						}


						newroles = []
						roleList = {}
						roleList.roles = []
						roleList.name = interaction.options.getString('name')
						interaction.reply({ embeds: embeds.messageEmbed(`Enter roles for the list: ${roleList.name}. `, `Type role name or id, type 'done' when finished, or 'cancel' to cancel!\nOptionally add a role description on a new line.\nYou can also type '+rolename' to quickly create a new role by that name`), })

						// `m` is a message object that will be passed through the filter function
						const filter = m => m.author.id === interaction.user.id
						// collect messages
						const collector = interaction.channel.createMessageCollector({ filter, time: 120000 })
						collector.on('collect', async m => {
							var roleid
							isnew = false
							// delete the collected message
							m.delete()
							collector.resetTimer()
							console.log(m)
							text = m.content.trim()
							console.log(`Collected ${m.content}`)
							if (text.toLowerCase() == 'done') {
								collector.stop()
								return
							} else if (text.toLowerCase() == 'cancel') {
								collector.stop("cancel")
								return
							} else if (text[0] === '+') {
								// get name
								rolename = text.split('\n')[0].slice(1)
								// create new role by name with no permissions
								await interaction.guild.roles.create({ name: rolename, permissions: new PermissionsBitField(0n), reason: "Creating new role for role list" })
									.then(async newrole => {
										roleid = newrole.id
										console.log(`roleid = ${roleid}`)
										newroles.push(roleid)
										isnew = true
										// handle remove button
										const row = new ActionRowBuilder()
											.addComponents(
												new ButtonBuilder()
													.setCustomId(`roleslist-remove2`)
													.setLabel('Remove')
													.setStyle(ButtonStyle.Danger),
											)

										await interaction.followUp({ embeds: embeds.messageEmbed(null, `**<@&${roleid}>**\n(*new role*).`), components: [row] }).then(msg => {
											const filter = i => i.customId === 'roleslist-remove2'
											const collector = msg.createMessageComponentCollector({ filter, time: 120000 })

											// collect button press to remove role
											collector.on('collect', i => {
												if (i.user.id === interaction.user.id) {
													index = roleList.roles.findIndex(r => r.id === roleid)
													roleList.roles.splice(index, 1)
													interaction.guild.roles.delete(roleid, 'The role needed to go')
														.then(() => console.log('Deleted the role'))
														.catch(console.error)
													collector.stop()
													msg.delete()

												} else {
													i.reply({ content: `These buttons aren't for you!`, ephemeral: true })
												}
											})

											collector.on('end', collected => {
												console.log(`Collected ${collected.size} interactions.`)
											})
										})
									})
									.catch(console.error)
							} else if (text[0] === '<') { // if user pinged a role, extract id
								id = text.split('\n')[0].slice(3, -1)
								role = await interaction.guild.roles.fetch(id)
								console.log(role)
								if (!role.managed) {
									roleid = id
								} else {
									interaction.followUp({ embeds: embeds.messageEmbed("Bot roles cannot be used.", null, null, '#ff0000') })
								}
							} else {
								// fetch from name or id
								role = await interaction.guild.roles.fetch(text.split('\n')[0])
								roleid = ""
								console.log(`role = ${role}`)
								if (!role) { // if no role was found from id, search with the text
									fetchedroles = await interaction.guild.roles.fetch()
									console.log(`fetchedroles = ${JSON.stringify(fetchedroles)}`)
									rolelist = []
									roleidlist = []
									for ([key, value] of fetchedroles) {
										console.log(`key= ${key}, value= ${value}`)
										if (!value.managed) {
											rolelist.push(value.name.toLowerCase())
											roleidlist.push(value.id)
										}
									}
									console.log(rolelist)
									matches = stringSimilarity.findBestMatch(text, rolelist)
									index = matches.bestMatchIndex
									if (index != 0) {
										console.log(roleidlist[index])
										roleid = roleidlist[index]
									}
								}

							}


							if (roleid) {
								if (roleList.roles.find(r => r.id === roleid)) {
									interaction.followUp({ embeds: embeds.messageEmbed("This role has already been added.", null, null, '#ff0000') })
								} else {
									console.log("Yeah.")
									role = await interaction.guild.roles.fetch(roleid)
									roleList.roles.push({ id: role.id, description: text.split('\n')[1] })

									if (!isnew) {
										// handle remove button
										const row = new ActionRowBuilder()
											.addComponents(
												new ButtonBuilder()
													.setCustomId(`roleslist-remove`)
													.setLabel('Remove')
													.setStyle(ButtonStyle.Danger),
											)

										interaction.followUp({ embeds: embeds.messageEmbed(null, `**<@&${roleid}>**\n(*from '${text.split('\n')[0]}'*).`), components: [row] }).then(msg => {
											const filter = i => i.customId === 'roleslist-remove'
											const collector = msg.createMessageComponentCollector({ filter, time: 120000 })

											// collect button press to remove role
											collector.on('collect', i => {
												if (i.user.id === interaction.user.id) {
													index = roleList.roles.findIndex(r => r.id === roleid)
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
											const reactioncollector = message.createReactionCollector({ filter, time: 15000 })

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
							}
						})
						collector.on('end', async (collected, reason) => {
							if (reason == 'cancel') {
								interaction.followUp({ embeds: embeds.messageEmbed("Cancelled", null, null, '#ff0000') })
								console.log(newroles)
								for (let i = 0; i < newroles.length; i++) {
									role = await interaction.guild.roles.fetch(newroles[i])
									interaction.guild.roles.delete(role)
										.then(() => console.log('Deleted the role'))
										.catch(console.error)
								}
							} else {
								console.log(`Saved ${roleList.roles.length} roles`)
								if (roleList.roles.length > 0) {
									interaction.followUp({ embeds: embeds.successEmbed(`Saved ${roleList.roles.length} roles`) })
									interaction.followUp({ embeds: embeds.messageEmbed(`Roles in list ${roleList.name}:`, `${roleList.roles.map(r => `<@&${r.id}>`).join('\n')}`) })

									try {
										path = `.${interaction.guild.id}.roles.lists`
										database.set(`guilds`, path + `.${roleList.name}`, roleList)
									} catch (error) {
										throw new Error(`Could not create role menu, does one by this name already exist?`)
									}
								} else {
									interaction.followUp({ embeds: embeds.messageEmbed("No roles added", null, null, '#ff0000') })
								}
							}
						})
						break
					}
					case 'get': {
						rolelists = await database.get(`guilds`, `.${interaction.guild.id}.roles.lists`)
						if (!interaction.options.getString('name') || interaction.options.getString('name') == 'all') {
							roles = await getRoles(interaction)
							//options = roles.map(r => r = { label: r.name, value: r.id })
							//console.log("options: ", options)
							tagList = []
							for (const [key, value] of roles) {
								console.log(`${key} goes ${value}`)
								console.log(`${value.name}`)
								if (value.name != `@everyone`) tagList.push(`<@&${value.id}>`)
								else tagList.push(`@everyone`)
							}
							roleliststext = ""
							count = 0
							for (i in rolelists) {
								roleliststext += `${rolelists[i].name} - ${rolelists[i].roles.length}\n`
								count++
							}

							console.log(tagList)
							await interaction.reply({ embeds: embeds.messageEmbed(`Roles - ${tagList.length}`, tagList.join('\n')) })
							await interaction.followUp({ embeds: embeds.messageEmbed(`Role Lists - ${count}`, roleliststext) })
							// todo add rolelists


						} else {
							console.log(JSON.stringify(rolelists))
							for (i in rolelists) {
								roles = rolelists[i].roles.map(r => `<@&${r.id}>`)
								if (rolelists[i].name == interaction.options.getString('name')) {
									interaction.reply({ embeds: embeds.messageEmbed(`Roles List - ${rolelists[i].name} - ${rolelists[i].roles.length}`, roles.join('\n')) })
								}
							}

						}

						break
					}
					case 'delete': {
						rolelists = await database.get(`guilds`, `.${interaction.guild.id}.roles.lists`)
						rolelist = interaction.options.getString('name')
						try {
							await database.del(`guilds`, `.${interaction.guild.id}.roles.lists.${rolelist}`)
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
	async menu(interaction) {
		await interaction.deferReply()
		console.log(interaction.values)
		console.log(interaction)
		id = interaction.customId.split(".")
		switch (id[1]) {
			case 'rolemenu': {
				const menuid = interaction.message.id
				const roleMenu = await database.get(`guilds`, `.${interaction.guild.id}.roles.menus.${menuid}`)
				const roleList = await database.get(`guilds`, `.${interaction.guild.id}.roles.lists.${roleMenu.list}`)
				const user = await interaction.user.fetch()
				const member = await interaction.guild.members.resolve(user)
				const roles = await member.roles.cache // members roles
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
							console.log(`adding ${roleList.roles[i]}`)
							await interaction.guild.members.addRole({ user: member, role: roleList.roles[i].id, reason: `rolemenu ${roleMenu.name}` })
						}
					}
				}
				await interaction.editReply({ embeds: embeds.messageEmbed(`Roles updated!`,), ephemeral: true }).then(msg =>
					msg.delete())
				break
			}
		}
	},
	async button(interaction) {
		console.log(interaction)
		id = interaction.customId.split(".")
		switch (id[1]) {
			case 'rolemenu': {
				await interaction.deferReply()
				const roleid = id[2]
				const menuid = interaction.message.id
				const roleMenu = await database.get(`guilds`, `.${interaction.guild.id}.roles.menus.${menuid}`)
				const roleList = await database.get(`guilds`, `.${interaction.guild.id}.roles.lists.${roleMenu.list}`)
				console.log(roleMenu)
				console.log(roleList)
				const role = await interaction.guild.roles.fetch(roleid)
				const user = await interaction.user.fetch()
				const member = await interaction.guild.members.resolve(user)
				const roles = await member.roles.cache // members roles
				// list of role ids from the list
				const roleids = roleList.roles.map(r => r.id)

				// this is the list of roles the user has that are also in the role list
				rolesinlist = roles.filter(r => {
					// if its in the roleList, add it
					if (roleids.includes(r.id)) {
						return r.id
					}
				})

				//count roles the user has in the list
				rolecount = 0
				// for (var i = 0; i < roles.size; i++) {
				// 	// for each role the user has
				// 	console.log(i)
				// 	console.log(roles[i])
				// 	if (roleids.includes(roles[i].id)) {
				// 		rolecount++
				// 	}
				// }
				for ([key, value] of roles) {
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

				await interaction.editReply({ embeds: embeds.messageEmbed(`Roles updated!`,), ephemeral: true }).then(msg => msg.delete())


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
}