import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"
import path from "path"
import type { Bot } from "../../structures/Client"
import ApplicationCommand from "../../types/ApplicationCommand"
import { RolesListSchema, RolesMenuSchema } from "../../types/Database"
import commands from "../../utils/commands"
import database from "../../utils/database"
var stringSimilarity = require("string-similarity")

export async function getRoles(interaction) {
	//await interaction.reply(interaction.options.getString('input'))
	let roles = interaction.guild.roles.cache

	roles = roles.filter((r) => r.managed != true)
	return roles.sort((a, b) => b.rawPosition - a.rawPosition)
}

export interface RoleList {
	name: string
	roles: Role[]
}

export interface Role {
	name?: string
	description: string
	id: string
	emoji?: string
}

export interface SelectMenuItem {
	label: string
	value: string
	description?: string
	emoji?: string
}

const timeout = 15 * 15 * 1000

export default new ApplicationCommand({
	permissions: ["ManageRoles"],
	data: new SlashCommandBuilder()
		.setName("roles")
		.setDescription("setup roles")
		.addSubcommandGroup((group) =>
			group
				.setName("menu")
				.setDescription("role menu options")
				.addSubcommand((command) =>
					command
						.setName("create")
						.setDescription("create a menu")
						.addStringOption((option) =>
							option
								.setName("name")
								.setDescription("name of the menu")
								.setRequired(true),
						)
						.addStringOption((option) =>
							option
								.setName("description")
								.setDescription(
									"description to show with the menu",
								),
						)
						.addStringOption((option) =>
							option
								.setName("type")
								.setDescription(
									"type of menu. Defaults to menu",
								)
								.addChoices(
									{
										name: "Dropdown menu (recommended)",
										value: "menu",
									},
									{
										name: "Buttons (can select 1 role only)",
										value: "buttons",
									},
									{ name: "Reactions", value: "reactions" },
								),
						)
						.addIntegerOption((option) =>
							option
								.setName("minimum")
								.setDescription(
									"minimum number of roles in this list a user can have. Defaults to 0.  No effect with Buttons",
								),
						)
						.addIntegerOption((option) =>
							option
								.setName("maximum")
								.setDescription(
									"maximum number of roles in this list a user can have. No limit by default. No effect with Buttons",
								),
						),
				)
				.addSubcommand((command) =>
					command
						.setName("update")
						.setDescription("update a menu")
						.addStringOption((option) =>
							option
								.setName("menu")
								.setDescription("name of menu or id of message")
								.setRequired(true),
						),
				),
		)
		.addSubcommandGroup((group) =>
			group
				.setName("lists")
				.setDescription("role lists")
				.addSubcommand((command) =>
					command
						.setName("get")
						.setDescription("list roles")
						.addStringOption((option) =>
							option
								.setName("name")
								.setDescription(
									"name of the role list. Defaults to all",
								),
						),
				)
				.addSubcommand((command) =>
					command
						.setName("create")
						.setDescription("create a new role list")
						.addStringOption((option) =>
							option
								.setName("name")
								.setDescription("name of role list")
								.setRequired(true),
						),
				)
				.addSubcommand((command) =>
					command
						.setName("delete")
						.setDescription("delete a role list")
						.addStringOption((option) =>
							option
								.setName("name")
								.setDescription("name of role list")
								.setRequired(true),
						),
				)
				.addSubcommand((command) =>
					command
						.setName("edit")
						.setDescription("edit a role list")
						.addStringOption((option) =>
							option
								.setName("name")
								.setDescription("name of role list")
								.setRequired(true),
						),
				),
		),
	async execute(
		interaction: ChatInputCommandInteraction,
		client: Bot,
	): Promise<void> {
		// please jesus christ come down and refactor this code <3
		// and add comments

		const subcommandGroupName = interaction.options.getSubcommandGroup()

		const subcommandGroupPath = path.join(
			__dirname,
			subcommandGroupName,
			subcommandGroupName,
		) // ./subcommandgroup_dir/subcommandgroup_file

		const subcommand = await commands.getSubCommand(subcommandGroupPath)
		subcommand.execute(interaction, client)
	},
	async menu(interaction): Promise<void> {
		//await interaction.deferReply()
		console.log(interaction.values)
		console.log(interaction)
		const id = interaction.customId.split(".")
		console.log(id)
		switch (id[1]) {
			case "selectrolemenu": {
				await interaction.deferUpdate()
				const menuid = interaction.message.id
				const roleMenu = await database.get<RolesMenuSchema>(
					`.guilds.${interaction.guild.id}.roles.menus.${menuid}`,
				)
				const roleList = await database.get<RolesListSchema>(
					`.guilds.${interaction.guild.id}.roles.lists.${roleMenu.list}`,
				)
				const user = await interaction.user.fetch()
				const member = interaction.guild.members.resolve(user)
				const roles = member.roles.cache // members roles
				const roleids = roleList.roles.map((r) => r.id) // list of ids on the role list

				// for every role on the role list
				for (let i = 0; i < roleList.roles.length; i++) {
					console.log(i)
					console.log(roleList.roles[i])
					// if the user has it:
					if (roles.find((r) => r.id === roleList.roles[i].id)) {
						console.log("user has it")
						// if its not selected on the list
						if (
							!interaction.values.includes(roleList.roles[i].id)
						) {
							// remove it
							console.log(`removing ${roleList.roles[i]}`)
							await interaction.guild.members.removeRole({
								user: member,
								role: roleList.roles[i].id,
								reason: `rolemenu ${roleMenu.name}`,
							})
						}
					} else {
						// if the user doesn't have it
						console.log("not found")
						// if its selceted on the list
						if (interaction.values.includes(roleList.roles[i].id)) {
							// add it
							console.log(`adding ${roleList.roles[i].id}`)
							await interaction.guild.members.addRole({
								user: member,
								role: roleList.roles[i].id,
								reason: `rolemenu ${roleMenu.name}`,
							})
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
			case "buttonrolemenu": {
				const roleid = id[2]
				const menuid = interaction.message.id
				const roleMenu = await database.get<RolesMenuSchema>(
					`.guilds.${interaction.guild.id}.roles.menus.${menuid}`,
				)
				const roleList = await database.get<RolesListSchema>(
					`.guilds.${interaction.guild.id}.roles.lists.${roleMenu.list}`,
				)
				console.log(roleMenu)
				console.log(roleList)
				const role = await interaction.guild.roles.fetch(roleid)
				const user = await interaction.user.fetch()
				const member = interaction.guild.members.resolve(user)
				const roles = member.roles.cache // members roles
				// list of role ids from the list
				const roleids = roleList.roles.map((r) => r.id)

				// this is the list of roles the user has that are also in the role list
				let rolesinlist = roles.filter((r) => {
					// if its in the roleList, add it
					if (roleids.includes(r.id)) {
						return r.id
					}
				})

				if (rolesinlist.filter((r) => r.id == roleid).size > 0) {
					console.log("hi")
					// remove it
					console.log(`removing ${roleList.roles[i]}`)
					try {
						await interaction.guild.members.removeRole({
							user: member,
							role: roleid,
							reason: `rolemenu ${roleMenu.name}`,
						})
						await interaction.reply({
							content: `Removed the role <@&${roleid}>`,
							ephemeral: true,
						})
					} catch (e) {
						await interaction.reply(
							`Failed to remove role <@&${roleid}>. The bot probably isn't high enough in the role hierarchy. Go to server settings, roles and drag my role up!!\nError: ${e}`,
						)
					}
				} else {
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
						if (roles.find((r) => r.id === roleList.roles[i].id)) {
							console.log("user has it")
							// if its not selected on the list
							if (roleid != roleList.roles[i].id) {
								// remove it
								console.log(`removing ${roleList.roles[i]}`)
								try {
									await interaction.guild.members.removeRole({
										user: member,
										role: roleList.roles[i].id,
										reason: `rolemenu ${roleMenu.name}`,
									})
									await interaction.reply({
										content: `Removed the role <@&${roleList.roles[i].id}>`,
										ephemeral: true,
									})
								} catch (e) {
									await interaction.reply(
										`No Permission to remove role <@&${roleList.roles[i].id}>. The bot probably isn't high enough in the role hierarchy. Go to server settings, roles and drag my role up!!\nError: ${e}`,
									)
								}
							}
						} else {
							// if the user doesn't have it
							console.log("not found")
							// if its selceted on the list
							if (roleid == roleList.roles[i].id) {
								// add it
								console.log(`adding ${roleList.roles[i]}`)
								try {
									await interaction.guild.members.addRole({
										user: member,
										role: roleList.roles[i].id,
										reason: `rolemenu ${roleMenu.name}`,
									})
									await interaction.reply({
										content: `Added the role <@&${roleList.roles[i].id}>`,
										ephemeral: true,
									})
								} catch (e) {
									await interaction.reply(
										`No Permission to remove role <@&${roleList.roles[i].id}>. The bot probably isn't high enough in the role hierarchy. Go to server settings, roles and drag my role up!!\nError: ${e}`,
									)
								}
							}
						}
					}
				}
				if (!interaction.replied) {
					// if the interaction wasn't otherwise acknowledged, acknowledged it. This is so it doesn't say "This interaction failed" or whatever
					await interaction.deferUpdate()
				}

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
	},
})
