import {
	ApplicationCommandOptionType,
	ChatInputCommandInteraction,
	SlashCommandSubcommandBuilder,
	SlashCommandSubcommandGroupBuilder,
} from "discord.js"
import path from "node:path"
import { permissions } from "../../config.json"
import ApplicationCommand from "../../types/ApplicationCommand"
import commands from "../../utils/commands"
import format from "../../utils/format"
import { CommandOptions } from "@node-redis/client/dist/lib/command-options"
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js")

export default new ApplicationCommand({
	settings: {
		ownerOnly: true,
	},
	data: new SlashCommandBuilder()
		.setName("command")
		.setDescription("Configure my commands")
		.addSubcommandGroup((group: SlashCommandSubcommandGroupBuilder) =>
			group
				.setName("alias")
				.setDescription("alias")
				.addSubcommand((command: SlashCommandSubcommandBuilder) =>
					command
						.setName("create")
						.setDescription("create an alias")
						.addStringOption((option) =>
							option
								.setName("alias")
								.setDescription("alias to create")
								.setRequired(true),
						)
						.addStringOption((option) =>
							option
								.setName("commandname")
								.setDescription("commandname")
								.setRequired(true),
						)
						.addStringOption((option) =>
							option.setName("group").setDescription("group"),
						)
						.addStringOption((option) =>
							option
								.setName("subcommand")
								.setDescription("subcommand"),
						)
						.addStringOption((option) =>
							option
								.setName("defaultoptions")
								.setDescription("defaultoptions"),
						)
						.addBooleanOption((option) =>
							option
								.setName("hidealloptions")
								.setDescription("hide options?"),
						)
						.addStringOption((option) =>
							option
								.setName("description")
								.setDescription("override description"),
						),
				)
				.addSubcommand((command: SlashCommandSubcommandBuilder) =>
					command
						.setName("remove")
						.setDescription("remove an alias")
						.addStringOption((option) =>
							option
								.setName("alias")
								.setDescription("alias to remove")
								.setRequired(true),
						),
				)
				.addSubcommand((command) =>
					command.setName("list").setDescription("list all aliases"),
				),
		)
		.addSubcommandGroup((group: SlashCommandSubcommandGroupBuilder) =>
			group
				.setName("command")
				.setDescription("command")
				.addSubcommand((command) =>
					command
						.setName("enable")
						.setDescription("enable a disabled command")
						.addStringOption((option) =>
							option
								.setName("command")
								.setDescription("command to enable")
								.setRequired(true),
						),
				)
				.addSubcommand((command) =>
					command
						.setName("disable")
						.setDescription("disable a command")
						.addStringOption((option) =>
							option
								.setName("command")
								.setDescription("command to disable")
								.setRequired(true),
						),
				)
				.addSubcommand((command) =>
					command
						.setName("refresh")
						.setDescription("refresh guild commands"),
				),
		)
		// .addSubcommand((command: SlashCommandSubcommandBuilder) =>
		// 	command
		// 		.setName("run")
		// 		.setDescription("run a command")
		// 		.addStringOption((option) =>
		// 			option
		// 				.setName("command")
		// 				.setDescription("command to run")
		// 				.setRequired(true),
		// 		),
		// )
		.addSubcommand((command) =>
			command.setName("list").setDescription("list all commands"),
		)
		.addSubcommand((command) =>
			command
				.setName("parse")
				.setDescription("wip")
				.addStringOption((option) =>
					option
						.setName("text")
						.setDescription("text")
						.setRequired(true),
				),
		),
	async execute(
		interaction: ChatInputCommandInteraction,
		client,
	): Promise<void> {
		const subcommandGroupName = interaction.options.getSubcommandGroup()
		const subcommandName = interaction.options.getSubcommand()

		// Modularize SubcommandGroup
		if (subcommandGroupName) {
			let commandFilePath = path.join(
				__dirname,
				subcommandGroupName,
				subcommandGroupName,
			) // ./subcommandgroup_dir/subcommand_file

			const subcommand = await commands.getSubCommand(commandFilePath)
			subcommand.execute(interaction, client)
			return
		}

		// Simple enough to modularize
		switch (subcommandName) {
			case "run": {
				break
			}
			case "list": {
				const commandList = await commands.get()



				const list = commandList

					.map((command) => {
						const options = command.data.options
						const subcommandgroups = options.map(e => {
							if (e.type === ApplicationCommandOptionType.SubcommandGroup) {
								return e.name
							}
						})
						const subcommands = options.find(e => e.type === ApplicationCommandOptionType.SubcommandGroup)
						return `${command.data.name} - "${command.data.description}"
						`

					})
					.join("\n")

				const messages = format.splitMessage(list)
				for (const [index, message] of messages.entries()) {
					if (index == 0) await interaction.reply(message)
					else await interaction.followUp(message)
				}

				break
			}
			case "parse": {
				if (interaction.user.id !== permissions.botowner) return

				const text = interaction.options.getString("text")
				const [commandName, group, subcommand, foundoptions] =
					await commands.textToCommandParser(text)
				console.log([commandName, group, subcommand, foundoptions])
				commands.run(
					interaction,
					"slash",
					commandName,
					group,
					subcommand,
					foundoptions,
				)
			}
		}
	},
})
