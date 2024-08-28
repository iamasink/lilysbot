import {
	AutocompleteInteraction,
	ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js"
import path from "node:path"
import { findBestMatch } from "string-similarity"
import ApplicationCommand from "../../types/ApplicationCommand"
import commands from "../../utils/commands"
import database from "../../utils/database"

export interface funnyinvite {
	inviterId: string
	uses: number
	expired: boolean
	code: string
	name?: string
}

export default new ApplicationCommand({
	permissions: ["Administrator"],
	data: new SlashCommandBuilder()
		.setName("invite")
		.setDescription("Manage server invites")
		.addSubcommand((command) =>
			command
				.setName("list")
				.setDescription("list invites")
				.addBooleanOption((option) =>
					option
						.setName("showall")
						.setDescription(
							"show all invites? by default expired invites without uses are hidden.",
						),
				)
				.addUserOption((option) =>
					option
						.setName("user")
						.setDescription("the user of invites to list"),
				),
		)
		.addSubcommand((command) =>
			command
				.setName("name")
				.setDescription("Assign a name to an invite")
				.addStringOption((option) =>
					option
						.setName("code")
						.setDescription("The invite to edit")
						.setRequired(true)
						.setAutocomplete(true),
				)
				.addStringOption((option) =>
					option.setName("name").setDescription("the name to assign"),
				),
		)

		.addSubcommand((command) =>
			command
				.setName("delete")
				.setDescription(
					"permanently and irreversibly deletes an invite",
				)
				.addStringOption((option) =>
					option
						.setName("code")
						.setDescription("The invite to delete")
						.setRequired(true)
						.setAutocomplete(true),
				),
		)

		.addSubcommand((command) =>
			command
				.setName("create")
				.setDescription("create a new invite.")
				.addStringOption((option) =>
					option.setName("name").setDescription("name of the invite"),
				)
				.addChannelOption((option) =>
					option
						.setName("channel")
						.setDescription("the channel to invite to"),
				)
				.addIntegerOption((option) =>
					option
						.setName("length")
						.setDescription(
							"How long the invite should last. Defaults to forever",
						)
						.addChoices(
							{ name: "30 minutes", value: 60 * 30 },
							{ name: "1 hour", value: 60 * 60 },
							{ name: "6 hours", value: 60 * 60 * 6 },
							{ name: "12 hours", value: 60 * 60 * 12 },
							{ name: "1 day", value: 60 * 60 * 24 },
							{ name: "7 days", value: 60 * 60 * 24 * 7 },
							{ name: "Forever", value: 0 },
						),
				)
				.addIntegerOption((option) =>
					option
						.setName("maxuses")
						.setDescription(
							"Maximum number of uses. Defaults to infinite",
						),
				),
		)

		.addSubcommand((command) =>
			command
				.setName("details")
				.setDescription("get details for an invite")
				.addStringOption((option) =>
					option
						.setName("code")
						.setDescription("the invite to query")
						.setRequired(true)
						.setAutocomplete(true),
				),
		),

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		const subcommandName = interaction.options.getSubcommand()

		const subcommandPath = path.join(
			__dirname,
			"subcommands",
			subcommandName,
		)
		const subcommand = await commands.getSubCommand(subcommandPath)

		subcommand.execute(interaction)
	},
	async autocomplete(interaction: AutocompleteInteraction) {
		const focusedOption = interaction.options.getFocused(true)
		// console.log(focusedOption)
		switch (focusedOption.name) {
			case "code": {
				break
			}
			default: {
				// console.log("uh oh stinky")
				throw new Error(
					"something went wrong, you can't autocomplete this??",
				)
			}
		}

		const invites = await database.get(
			`.guilds.${interaction.guild.id}.invites`,
		)

		//convert to array of objects (from object of objects)
		var invitesArray: funnyinvite[] = Object.keys(invites).map((key) => {
			return invites[key]
		})
		for (let i in invitesArray) {
			// console.log("awaw")
			// console.log(i)
			// console.log(invitesArray[i])
		}

		// add the name of each invite and username to the invites as a new array
		let arrayWithNames = invitesArray.map((i) => {
			let output = i.code
			if (i.name) {
				output += ` - ${i.name}`
			}
			return output
		})

		const matches = findBestMatch(focusedOption.value, arrayWithNames)
		// console.log(matches)
		let filtered = []

		if (matches.bestMatch.rating === 0) {
			filtered = arrayWithNames.sort((a, b) => {
				return b.length - a.length
			})
			// console.log(filtered)
		} else {
			let sorted = matches.ratings.sort((a, b) => {
				return b.rating - a.rating
			})
			// console.log("sorted:")
			// console.log(sorted)
			filtered = sorted.map((i) => i.target)
		}

		var shortfiltered = filtered
		if (filtered.length > 10) {
			shortfiltered = filtered.slice(0, 5)
		}
		var response = shortfiltered.map((choice) => {
			const name = choice
			// console.log(name)
			const value = choice.split(" ")[0]

			return { name: name, value: value }
		})
		// console.log(response)
		await interaction.respond(response)
	},
})
