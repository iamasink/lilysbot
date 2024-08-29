import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChatInputCommandInteraction,
	ComponentType,
	EmbedBuilder,
	Message,
	RoleManager,
	StringSelectMenuBuilder,
} from "discord.js"
import { Subcommand } from "../../../../types/ApplicationCommand"
import database from "../../../../utils/database"
import embeds from "../../../../utils/embeds"
import { Role, RoleList, SelectMenuItem } from "../../roles"

const timeout = 15 * 15 * 1000

export default {
	name: "create",
	execute: async (interaction: ChatInputCommandInteraction) => {
		// /roles menu create

		// get list of role lists from database
		const rolelists = await database.get<RoleList>(
			`.guilds.${interaction.guild.id}.roles.lists`,
		)

		if (!Object.keys(rolelists).length) {
			// TODO Update error message
			interaction.reply(`No roles lists to create`)
			return
		}

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
		let options: SelectMenuItem[] = Object.values(rolelists).map(
			(role) => ({
				label: role.name,
				value: role.name,
			}),
		)

		const row = createRolesListMenu(options)

		// Send the Message with the Roles Menu
		const menuMessage = await interaction.reply({
			embeds: embeds.messageEmbed(
				`Creating role menu '${roleMenu.name}'`,
				`Choose a role list to assign the menu to. \nYou can create one using \`/roles lists create.\``,
			),
			components: [row],
		})

		// Listen for menu interaction
		const menuInteraction = await menuMessage
			.awaitMessageComponent<ComponentType.StringSelect>({
				filter: (i) => i.user.id === interaction.user.id,
				time: timeout,
			})
			.catch((err) => {
				interaction.followUp(`no interactions were collected\n${err}`)
				console.log(`No interactions were collected.\n`, err)
			})

		// User didn't interacted with the menu
		if (!menuInteraction) return

		// ball fondle emoji 🫴🫴🫴

		roleMenu.list = menuInteraction.values[0]
		let list = rolelists[roleMenu.list].roles
		interaction.deleteReply()

		let rows: ActionRowBuilder<StringSelectMenuBuilder | ButtonBuilder>[] =
			[]
		//const menu = await createMenu(interaction.guild, list)

		let message: string

		// roleMenu could be a Menu, Buttons, or Reactions based
		switch (roleMenu.type) {
			case "menu": {
				// If roleMenu.maximum is 1 set the message to singular phrase, else plurals
				message =
					roleMenu.maximum == 1
						? "Select a role from the list!"
						: "Select role(s) from the list!"

				// maximum can't be more than the list size. handle it
				let maximum =
					roleMenu.maximum > list.length
						? list.length
						: roleMenu.maximum

				const row = createChooseRoleMenu(interaction.guild.roles, {
					list,
					minVal: roleMenu.maximum,
					maxVal: maximum,
				})

				rows = [row]
				break
			}
			case "buttons": {
				message = "Click a button to pick a role!"
				rows = createRoleButtons(interaction.guild.roles, list)
				break
			}
			case "reactions": {
				// TODO Choose Role using Reactions
				message = "React to pick a role!"
				for (let i = 0, len = list.length; i < len; i++) {
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

		const embed = createRoleMenuEmbed(
			roleMenu.name,
			roleMenu.description,
			message,
		)

		menuInteraction.message.channel
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
	},
} satisfies Subcommand

interface RoleMenuOptions {
	minVal: number
	maxVal: number
	list: Role[]
}

function createRolesListMenu(menuOptions: { label: string; value: string }[]) {
	return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
		new StringSelectMenuBuilder()
			.setCustomId("select")
			.setPlaceholder("Choose a role list")
			.addOptions(menuOptions),
	)
}

function createChooseRoleMenu(roles: RoleManager, options: RoleMenuOptions) {
	// create the menu
	const menu = new StringSelectMenuBuilder()
		.setCustomId(`roles.selectrolemenu`)
		.setPlaceholder("Choose roles")
		.setMinValues(options.minVal)
		.setMaxValues(options.maxVal)

	// for each role in the list
	// set description and emoji if it should exist.
	const roleMenuItems: SelectMenuItem[] = options.list.map((list) => {
		const menuItem: SelectMenuItem = {
			label: roles.resolve(list.id).name,
			value: list.id,
			description: list.description,
			emoji: list.emoji,
		}

		return menuItem
	})

	return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
		menu.addOptions(roleMenuItems),
	)
}

function createRoleButtons(
	roles: RoleManager,
	list: Role[],
): ActionRowBuilder<ButtonBuilder>[] {
	const actionRows: ActionRowBuilder<ButtonBuilder>[] = []

	// ActionRows can have 5 row
	// For each row create 5 buttons

	for (let i = 0; i < list.length; i += 5) {
		const buttons: ButtonBuilder[] = []

		for (let j = 0; j < 5; j++) {
			const roleListIndex = i + j
			// if there's nothing else to add, don't do anything dumbshit
			if (roleListIndex >= list.length) break

			const roleButton = new ButtonBuilder()
				.setCustomId(`roles.buttonrolemenu.${list[roleListIndex].id}`)
				.setLabel(roles.resolve(list[roleListIndex].id).name)
				.setStyle(ButtonStyle.Primary)
			if (list[roleListIndex].emoji)
				roleButton.setEmoji(list[roleListIndex].emoji)

			buttons.push(roleButton)
		}

		actionRows.push(
			new ActionRowBuilder<ButtonBuilder>().addComponents(...buttons),
		)
	}
	return actionRows
}

function createRoleMenuEmbed(
	menuName: string,
	menuDescription?: string,
	footerText?: string,
) {
	const embed = new EmbedBuilder().setTitle(`Roles - ${menuName}`)

	if (menuDescription) embed.setDescription(`${menuDescription}`)
	if (footerText) embed.setFooter({ text: footerText })

	return embed
}
