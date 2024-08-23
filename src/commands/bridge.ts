import {
	SlashCommandBuilder,
	ChatInputCommandInteraction,
	Client,
	EmbedBuilder,
} from "discord.js"
import ApplicationCommand from "../types/ApplicationCommand"
import { client } from ".."

export default new ApplicationCommand({
	settings: {
		ownerOnly: true
	},
	data: new SlashCommandBuilder()
		.setName("bridge")
		.setDescription("Create or manage bridges between channels")
		.addSubcommand((subcommand) =>
			subcommand
				.setName("create")
				.setDescription("Create a bridge between two channels")
				.addStringOption((option) =>
					option
						.setName("channel1")
						.setDescription("The first channel ID")
						.setRequired(true),
				)
				.addStringOption((option) =>
					option
						.setName("channel2")
						.setDescription("The second channel ID")
						.setRequired(true),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("remove")
				.setDescription("Remove a bridge between two channels")
				.addStringOption((option) =>
					option
						.setName("channel1")
						.setDescription("The first channel ID")
						.setRequired(true),
				)
				.addStringOption((option) =>
					option
						.setName("channel2")
						.setDescription("The second channel ID")
						.setRequired(false),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("list")
				.setDescription("List all bridged channels"),
		),
	async execute(interaction: ChatInputCommandInteraction) {
		if (interaction.options.getSubcommand() === "create") {
			const channel1 = interaction.options.getString("channel1", true)
			const channel2 = interaction.options.getString("channel2", true)

			try {
				if (channel1 && channel2) {
					client.bridgeManager.addBridge(channel1, channel2)
					await interaction.reply(
						`Bridge created between ${channel1} and ${channel2}`,
					)
				} else {
					await interaction.reply("Invalid channel IDs")
				}
			} catch (error) {
				console.error(error)
				await interaction.reply(
					"An error occurred while creating the bridge",
				)
			}
		} else if (interaction.options.getSubcommand() === "list") {
			const bridges = client.bridgeManager.bridges

			if (!bridges || bridges.length === 0) {
				await interaction.reply("No bridges are currently set up.")
				return
			}

			let output = ""

			bridges.forEach((bridge, index) => {
				const channel1 = bridge.channel1
				const channel2 = bridge.channel2
				output += `Bridge ${
					index + 1
				}: Channel 1: ${channel1}\nChannel 2: ${channel2}\n`
			})

			await interaction.reply({ content: output })
		} else if (interaction.options.getSubcommand() === "remove") {
			const channel1 = interaction.options.getString("channel1", true)
			const channel2 = interaction.options.getString("channel2") || null
			client.bridgeManager.removeBridge(channel1, channel2)
			interaction.reply("✅")
		}
	},
})
