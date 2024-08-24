import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChatInputCommandInteraction,
	Message,
	PermissionsBitField,
	Snowflake,
} from "discord.js"
import stringSimilarity from "string-similarity"
import { Subcommand } from "../../../../types/ApplicationCommand"
import database from "../../../../utils/database"
import embeds from "../../../../utils/embeds"
import emoji from "../../../../utils/emoji"
import { RoleList } from "../../roles"

const timeout = 15 * 15 * 1000

/**
 * /roles lists create
 */
export default {
	name: "create",
	execute: async (interaction: ChatInputCommandInteraction) => {
		// check if it already exists
		const lists = await database.get(
			`.guilds.${interaction.guild.id}.roles.lists`,
		)

		console.log(`lists = ${JSON.stringify(lists)}`)
		if (lists != null) {
			if (lists.hasOwnProperty(interaction.options.getString("name"))) {
				throw new Error(
					`Could not create role menu, one by this name already exists.`,
				)
			}
			if (Object.keys(lists).length > 24) {
				// if too many rolelists for a select menu
				throw new Error(
					"You have too many rolelists. If you have this many you're probably using it wrong lol.",
				)
			}
		}

		const newroles = []
		const roleList: RoleList = {
			roles: [],
			name: interaction.options.getString("name"),
		}

		const messagesToDelete = []
		await interaction
			.reply({
				embeds: embeds.messageEmbed(
					`Enter roles for the list: ${roleList.name}. `,
					`Type role name or id, type 'done' when finished, or 'cancel' to cancel!\nOptionally add a role description on a new line.\nYou can also type '+rolename' to quickly create a new role by that name`,
				),
			})
			.then((message) => messagesToDelete.push(message))

		console.log(`awawawa msg: ${await messagesToDelete[0]}`)

		// `m` is a message object that will be passed through the filter function
		const filter = (m: Message) => m.author.id === interaction.user.id
		// collect messages
		const collector = interaction.channel.createMessageCollector({
			filter,
			time: timeout,
		})
		collector.on("collect", async (m) => {
			var roleid: string
			let isnew = false
			// delete the collected message
			collector.resetTimer()
			console.log(m)
			const text = m.content.trim()

			console.log(`Collected ${m.content}`)
			if (text.toLowerCase() == "done") {
				m.delete()
				collector.stop("done")
				return
			}
			if (text.toLowerCase() == "cancel") {
				m.delete()
				collector.stop("cancel")
				return
			}
			if (text[0] === "+") {
				// get name
				const rolename = text.split("\n")[0].slice(1)
				// create new role by name with no permissions
				await interaction.guild.roles
					.create({
						name: rolename,
						permissions: new PermissionsBitField(0n),
						reason: "Creating new role for role list",
					})
					.then(async (newrole) => {
						roleid = newrole.id
						console.log(`roleid = ${roleid}`)
						newroles.push(roleid)
						isnew = true
						// handle remove button
						const row =
							new ActionRowBuilder<ButtonBuilder>().addComponents(
								new ButtonBuilder()
									.setCustomId(`roleslist-remove2`)
									.setLabel("Remove")
									.setStyle(ButtonStyle.Danger),
							)
					})
					.catch(console.error)
			} else if (text[0] === "<") {
				// if user pinged a role, extract id
				const id = text.split("\n")[0].slice(3, -1)
				const role = await interaction.guild.roles.fetch(id)
				console.log(role)
				if (!role.managed) {
					roleid = id
				} else {
					interaction
						.followUp({
							embeds: embeds.messageEmbed(
								"Bot roles cannot be used.",
								null,
								null,
								"#ff0000",
							),
						})
						.then((message) => messagesToDelete.push(message))
				}
			} else {
				// fetch from name or id
				const role = await interaction.guild.roles.fetch(
					text.split("\n")[0],
				)
				roleid = ""
				console.log(`role = ${role}`)
				if (!role) {
					// if no role was found from id, search with the text
					// fetch all the guild's roles
					const fetchedroles = await interaction.guild.roles.fetch()
					console.log(
						`fetchedroles = ${JSON.stringify(fetchedroles)}`,
					)
					const rolelist: string[] = []
					const roleidlist: Snowflake[] = []
					for (const [key, value] of fetchedroles) {
						console.log(`key= ${key}, value= ${value}`)
						// managed means its for a bot/application  :)
						if (!value.managed) {
							// if roleList doesn't yet have the role, push it to the rolelist. this is so you can't search for the same thing twice
							if (
								!roleList.roles
									.map((e) => e.id)
									.includes(value.id)
							) {
								console.log("hi")
								rolelist.push(value.name.toLowerCase())
								roleidlist.push(value.id)
							} else {
								console.log("lol no")
							}
						}
					}
					console.log(rolelist)
					// find best match to the text
					const matches = stringSimilarity.findBestMatch(
						text,
						rolelist,
					)
					const index = matches.bestMatchIndex
					if (index != 0) {
						console.log(roleidlist[index])
						roleid = roleidlist[index]
					}
				}
			}

			if (roleid) {
				if (roleList.roles.find((r) => r.id === roleid)) {
					interaction
						.followUp({
							embeds: embeds.messageEmbed(
								"This role has already been added.",
								null,
								null,
								"#ff0000",
							),
						})
						.then((message) => messagesToDelete.push(message))
				} else {
					console.log("Yeah.")
					const role = await interaction.guild.roles.fetch(roleid)
					roleList.roles.push({
						id: role.id,
						description: text.split("\n")[1],
					})

					// handle remove button
					const row =
						new ActionRowBuilder<ButtonBuilder>().addComponents(
							new ButtonBuilder()
								.setCustomId(`roleslist-remove`)
								.setLabel("Remove")
								.setStyle(ButtonStyle.Danger),
						)
					let message: string

					interaction
						.followUp({
							embeds: embeds.messageEmbed(
								null,
								`**<@&${roleid}>**\n(*from '${
									text.split("\n")[0]
								}'*).`,
							),
							components: [row],
						})
						.then((msg) => {
							messagesToDelete.push(msg)
							if (isnew) {
								const filter = (i) =>
									i.customId === "roleslist-remove"
								const collector =
									msg.createMessageComponentCollector({
										filter,
										time: timeout,
									})

								// collect button press to remove role
								collector.on("collect", (i) => {
									if (i.user.id !== interaction.user.id)
										i.reply({
											content: `These buttons aren't for you!`,
											ephemeral: true,
										})

									const index = roleList.roles.findIndex(
										(r) => r.id === roleid,
									)
									roleList.roles.splice(index, 1)
									interaction.guild.roles
										.delete(roleid, "The role needed to go")
										.then(() =>
											console.log("Deleted the role"),
										)
										.catch(console.error)
									collector.stop()
									msg.delete()
								})

								collector.on("end", (collected) => {
									console.log(
										`Collected ${collected.size} interactions.`,
									)
								})
							} else {
								const filter = (i) =>
									i.customId === "roleslist-remove"
								const componentCollector =
									msg.createMessageComponentCollector({
										filter,
										time: timeout,
									})

								// collect button press to remove role
								componentCollector.on("collect", (i) => {
									if (i.user.id === interaction.user.id) {
										const index = roleList.roles.findIndex(
											(r) => r.id === roleid,
										)
										roleList.roles.splice(index, 1)
										componentCollector.stop()
										msg.delete()
									} else {
										i.reply({
											content: `These buttons aren't for you!`,
											ephemeral: true,
										})
									}
								})

								componentCollector.on("end", (collected) => {
									console.log(
										`Collected ${collected.size} interactions.`,
									)
								})
							}

							console.log("awawa")

							const reactioncollector =
								msg.createReactionCollector({
									time: timeout,
								})

							reactioncollector.on(
								"collect",
								(reaction, user) => {
									console.log(
										`Collected ${reaction.emoji.name} from ${user.tag}`,
									)
									if (user.id == interaction.user.id) {
										roleList.roles[
											roleList.roles.findIndex(
												(e) => e.id == role.id,
											)
										].emoji = emoji.getEmojiId(
											reaction.emoji,
										)
									} else {
										// remove the user who added the reaction's reaction.
										reaction.users.remove(user.id)
									}
								},
							)

							reactioncollector.on("end", (collected) => {
								console.log(`Collected ${collected.size} items`)
							})
						})
				}
			} else {
				interaction
					.followUp({
						embeds: embeds.messageEmbed(
							`Role '${text}' not found.`,
							`Type "done" to finish or "cancel" to cancel`,
							null,
							"#ff0000",
						),
					})
					.then((message) => messagesToDelete.push(message))
			}
			m.delete()
		})

		collector.on("end", async (collected, reason) => {
			if (reason == "done") {
				console.log(`Saved ${roleList.roles.length} roles`)
				console.log(`rolelist: ${JSON.stringify(roleList)}`)
				if (roleList.roles.length > 0) {
					interaction.followUp({
						embeds: embeds.successEmbed(
							`Saved ${roleList.roles.length} roles`,
						),
					})

					// cleanup messages
					// for (let i = 0; i < messagesToDelete.length; i++) {
					// 	//message = await interaction.channel.messages.fetch({ message: messagesToDelete[i] })
					// 	//interaction.channel.messages.delete(messagesToDelete[i])
					// 	console.log(messagesToDelete[i].id)
					// }
					interaction.channel.bulkDelete(
						messagesToDelete.map((m) => m.id),
					)

					interaction.followUp({
						embeds: embeds.messageEmbed(
							`Roles in list ${roleList.name}:`,
							`${roleList.roles
								.map((r) => `<@&${r.id}>`)
								.join("\n")}`,
						),
					})

					try {
						const path = `.guilds.${interaction.guild.id}.roles.lists`
						await database.set(path + `.${roleList.name}`, roleList)
					} catch (error) {
						throw new Error(
							`Could not create role list, does one by this name already exist?`,
						)
					}
				} else {
					interaction.followUp({
						embeds: embeds.messageEmbed(
							"No roles added",
							null,
							null,
							"#ff0000",
						),
					})
				}
			} else {
				let message: string = ""
				if (reason == "cancelled") message = ""
				else message = "This interaction has timed out"
				interaction.channel.bulkDelete(
					messagesToDelete.map((m) => m.id),
				)
				interaction.followUp({
					embeds: embeds.messageEmbed(
						"Cancelled",
						message,
						null,
						"#ff0000",
					),
				})
				console.log(newroles)
				for (let i = 0; i < newroles.length; i++) {
					const role = await interaction.guild.roles.fetch(
						newroles[i],
					)
					interaction.guild.roles
						.delete(role)
						.then(() => console.log("Deleted the role"))
						.catch(console.error)
				}
			}
		})
	},
} satisfies Subcommand
