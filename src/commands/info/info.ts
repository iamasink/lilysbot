import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"
import path from "path"
import ApplicationCommand from "../../types/ApplicationCommand"
import commands from "../../utils/commands"

// function fetchPromise(toFetch) {
// 	return new Promise((resolve, reject) => {
// 		try {
// 			resolve(toFetch.fetch(true))
// 		} catch { reject() }
// 	})
// }

export function formattext(
	val: string,
	name: string,
	append: string = ``,
	fallback?: string,
) {
	let output = `\n**${name}**: `
	if (val != undefined && val != null) {
		output += `${val}${append}`
	} else {
		if (fallback) output += `${fallback}${append}`
		else output = ``
	}
	return output
}
export function formatlink(
	link: string,
	name: string,
	linkappend: string = "",
	fallbacklink?: string,
	dontappendonfallback: boolean = false,
) {
	let output: string
	output = `\n**${name}**`
	let outputlink: string

	if (link != undefined && link != null) {
		outputlink = `${link}${linkappend}`
		return `\n[${name}](${outputlink})`
	} else {
		if (fallbacklink) {
			if (dontappendonfallback) outputlink = `${fallbacklink}`
			else outputlink = `${fallbacklink}${linkappend}`
			return `\n**[${name}](${outputlink})**`
		} else {
			return ``
		}
	}
}

export default new ApplicationCommand({
	data: new SlashCommandBuilder()
		.setName("info")
		.setDescription("Retrieves info about a user, the guild or this bot")
		.addSubcommand((subcommand) =>
			subcommand
				.setName("user")
				.setDescription("Info about a user")
				.addUserOption((option) =>
					option
						.setName("target")
						.setDescription("A user. Ping or ID")
						.setRequired(true),
				)
				.addStringOption((option) =>
					option
						.setName("show")
						.setDescription("Image to show")
						.addChoices(
							{ name: "avatar", value: "avatar" },
							{ name: "guild avatar", value: "guild avatar" },
							{ name: "banner", value: "banner" },
							{ name: "hide", value: "hide" },
							{ name: "username history", value: "usernames" },
						),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand.setName("guild").setDescription("Info about the guild"),
		)
		.addSubcommand((subcommand) =>
			subcommand.setName("bot").setDescription("Info about the bot"),
		),

	async execute(interaction: ChatInputCommandInteraction, client) {
		const subcommandName = interaction.options.getSubcommand()

		const subcommandPath = path.join(
			__dirname,
			"subcommands",
			subcommandName,
		)
		const subcommand = await commands.getSubCommand(subcommandPath)

		subcommand.execute(interaction, client)

		//console.log(`intercation: ${JSON.stringify(interaction)}`)
		switch (interaction.options.getSubcommand()) {
		}
	},
})
