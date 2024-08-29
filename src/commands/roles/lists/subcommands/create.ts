import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChatInputCommandInteraction,
	ComponentType,
	InteractionResponse,
	Message,
	PermissionsBitField,
	RoleManager,
	Snowflake,
} from "discord.js"
import stringSimilarity from "string-similarity"
import { Subcommand } from "../../../../types/ApplicationCommand"
import database from "../../../../utils/database"
import embeds from "../../../../utils/embeds"
import { RoleList, RoleListProps } from "../../roles"

const timeout = 15 * 15 * 1000

// Regex for string where it starts with role mention
const roleMentionRegex = /^<@&(\d+)>/

/**
 * /roles lists create
 */
export default {
	name: "create",
	execute: async (interaction: ChatInputCommandInteraction) => {
		// check if it already exists
		const lists = await database.get<RoleList>(
			`.guilds.${interaction.guild.id}.roles.lists`,
		)

		const listName = interaction.options.getString("name")

		console.log(`lists = ${JSON.stringify(lists)}`)
		if (lists != null) {
			if (lists.hasOwnProperty(listName)) {
				interaction.reply(
					`Could not create role menu, one by this name already exists.`,
				)
			}
			if (Object.keys(lists).length > 24) {
				// if too many rolelists for a select menu
				interaction.reply(
					"You have too many rolelists. If you have this many you're probably using it wrong lol.",
				)
			}
		}

		const newroles: string[] = []
		const roleList: RoleListProps = {
			roles: [],
			name: listName,
		}

		const messagesToDelete: Array<InteractionResponse | Message> = []
		await interaction
			.reply({
				embeds: embeds.messageEmbed(
					`Enter roles for the list: ${roleList.name}. `,
					`Type role name or id, type 'done' when finished, or 'cancel' to cancel!\nOptionally add a role description on a new line.\nYou can also type '+rolename' to quickly create a new role by that name`,
				),
			})
			.then((message) => messagesToDelete.push(message))

		// collect messages
		const collector = interaction.channel.createMessageCollector({
			filter: (m: Message) => m.author.id === interaction.user.id, // `m` is a message object that will be passed through the filter function
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
			const reason = text.toLowerCase()
			if (reason == "done" || reason == "cancel") {
				m.delete()
				collector.stop(reason)
				return
			}

			// Create New Role
			if (text.startsWith("+")) {
				// get name
				const rolenameToCreate = text.split("\n")[0].slice(1)

				// create new role by name with no permissions
				const newRole = await createRole(
					rolenameToCreate,
					interaction.guild.roles,
				)

				if (newRole) {
					roleid = newRole.id
					console.log(`roleid = ${roleid}`)
					newroles.push(roleid)
					isnew = true
				}
			} else if (text.match(roleMentionRegex)) {
				// if user pinged a role, extract id
				const id = text.split("\n")[0].slice(3, -1)
				const role = await interaction.guild.roles.fetch(id)
				console.log(role)
				if (!role?.managed) {
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
					return
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
					for (const [key, role] of fetchedroles) {
						console.log(`key= ${key}, value= ${role}`)
						// managed means its for a bot/application  :)
						if (role.managed) continue

						if (roleList.roles.some((r) => r.id == role.id)) {
							console.log("lol no")
							continue
						}

						// if roleList doesn't yet have the role, push it to the rolelist. this is so you can't search for the same thing twice
						rolelist.push(role.name.toLowerCase())
						roleidlist.push(role.id)
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

			if (!roleid) {
				const message = await sendRoleNotFoundMessage(interaction, text)
				messagesToDelete.push(message)
				m.delete()
				return
			}

			if (roleList.roles.find((r) => r.id === roleid)) {
				const message = await sendRoleAlreadyAddedMessage(interaction)
				messagesToDelete.push(message)
				m.delete()
				return
			}

			console.log("Yeah.")
			const role = await interaction.guild.roles.fetch(roleid)
			roleList.roles.push({
				id: role.id,
				description: text.split("\n")[1],
			})

			const row = createRemoveRoleButton()

			const msg = await interaction.followUp({
				embeds: embeds.messageEmbed(
					null,
					`**<@&${roleid}>**\n(*from '${text.split("\n")[0]}'*).`,
				),
				components: [row],
			})

			messagesToDelete.push(msg)

			const removeRoleButtonInteraction =
				await msg.awaitMessageComponent<ComponentType.Button>({
					filter: (i) => {
						if (i.user.id !== interaction.user.id) {
							i.reply({
								content: `These buttons aren't for you!`,
								ephemeral: true,
							})

							return false
						}

						return i.customId === "roleslist-remove"
					},
					time: timeout,
				})

			// No Interaction or Timeout
			if (!removeRoleButtonInteraction) return

			// Handle remove button clicked
			const index = roleList.roles.findIndex((r) => r.id === roleid)
			roleList.roles.splice(index, 1)

			if (isnew) {
				interaction.guild.roles
					.delete(roleid, "The role needed to go")
					.then(() => console.log("Deleted the role"))
					.catch(console.error)
			}

			msg.delete()
			m.delete()
		})

		collector.on("end", async (collected, reason) => {
			// Cancelled or Timedout
			if (reason !== "done") {
				let message =
					reason == "cancelled"
						? ""
						: "This interaction has timed out"

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

				for (const roleId of newroles) {
					const role = await interaction.guild.roles.fetch(roleId)
					interaction.guild.roles
						.delete(role)
						.then(() => console.log("Deleted the role"))
						.catch(console.error)
				}

				return
			}

			// Done creating list
			console.log(`Saved ${roleList.roles.length} roles`)
			console.log(`rolelist: ${JSON.stringify(roleList)}`)

			if (!roleList.roles.length) {
				interaction.followUp({
					embeds: embeds.messageEmbed(
						"No roles added",
						null,
						null,
						"#ff0000",
					),
				})

				return
			}

			interaction.followUp({
				embeds: embeds.successEmbed(
					`Saved ${roleList.roles.length} roles`,
				),
			})

			// cleanup messages
			interaction.channel.bulkDelete(messagesToDelete.map((m) => m.id))

			interaction.followUp({
				embeds: embeds.messageEmbed(
					`Roles in list ${roleList.name}:`,
					`${roleList.roles.map((r) => `<@&${r.id}>`).join("\n")}`,
				),
			})

			try {
				const listPath = `.guilds.${interaction.guild.id}.roles.lists`
				await database.set(listPath + `.${roleList.name}`, roleList)
			} catch (error) {
				console.error(error)

				throw new Error(
					`Could not create role list, does one by this name already exist?`,
				)
			}
		})
	},
} satisfies Subcommand

function createRemoveRoleButton() {
	return new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setCustomId(`roleslist-remove`)
			.setLabel("Remove")
			.setStyle(ButtonStyle.Danger),
	)
}

async function createRole(roleName: string, roleManager: RoleManager) {
	return roleManager
		.create({
			name: roleName,
			permissions: new PermissionsBitField(0n),
			reason: "Creating new role for role list",
		})
		.catch(console.error)
}

async function sendRoleNotFoundMessage(
	interaction: ChatInputCommandInteraction,
	roleName: string,
) {
	return interaction.followUp({
		embeds: embeds.messageEmbed(
			`Role '${roleName}' not found.`,
			`Type "done" to finish or "cancel" to cancel`,
			null,
			"#ff0000",
		),
	})
}

async function sendRoleAlreadyAddedMessage(
	interaction: ChatInputCommandInteraction,
) {
	return interaction.followUp({
		embeds: embeds.messageEmbed(
			"This role has already been added.",
			null,
			null,
			"#ff0000",
		),
	})
}
