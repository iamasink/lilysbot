import {
	ActionRowBuilder,
	ApplicationCommandManager,
	ChannelSelectMenuBuilder,
	ChatInputCommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
	TextBasedChannel,
} from "discord.js"
import ApplicationCommand from "../types/ApplicationCommand"
import format from "../utils/format"
import database from "../utils/database"
import moment, { now } from "moment"

export default new ApplicationCommand({
	settings: {
		ownerOnly: true,
	},
	data: new SlashCommandBuilder()
		.setName("test")
		.setDescription("description"),
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		console.log(interaction)
	},
})
