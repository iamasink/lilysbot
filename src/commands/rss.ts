import {
	ChatInputCommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
} from "discord.js"
import ApplicationCommand from "../types/ApplicationCommand"
import embeds from "../utils/embeds"
import Parser from "rss-parser"
const parser = new Parser()

export default new ApplicationCommand({
	data: new SlashCommandBuilder()
		.setName("rss")
		.setDescription("Setup rss feeds and stuff")
		.addSubcommand((command) =>
			command
				.setName("get")
				.setDescription("get a rss feed")
				.addStringOption((option) =>
					option
						.setName("url")
						.setDescription("url to an xml rss feed ")
						.setRequired(true),
				)
				.addNumberOption((option) =>
					option
						.setName("limit")
						.setDescription(
							"the maximum amount of entries to retrieve. default 1, maximum 5",
						)
						.setMinValue(1)
						.setMaxValue(5)
						.setRequired(false),
				),
		),
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		switch (interaction.options.getSubcommand()) {
			case "get": {
				const url = await interaction.options.getString("url")
				await interaction.reply({
					embeds: embeds.messageEmbed(
						"Retrieving RSS Feed...",
						`**URL:** \`${url}\`\n**Title:** \` \``,
					),
				})

				var limit = (await interaction.options.getNumber("limit")) || 1
				if (limit > 5 || limit < 1) limit = 1

				let feed = await parser.parseURL(url)

				await interaction.editReply({
					embeds: embeds.successEmbed(
						"Retrieving RSS Feed",
						`**URL:** \`${url}\`\n**Title:** \`${feed.title}\``,
					),
				})

				let len = 0
				if (feed.items.length > limit) len = limit
				else len = feed.items.length

				for (let i = 0; i < len; i++) {
					let item = feed.items[i]
					console.log(item.title + ":" + item.link)
					const embed = new EmbedBuilder()
						.setColor(`#f9beca`)
						.setTitle(`${feed.title}`)
						//.setAuthor({ name: item.creator })
						.setTimestamp(Date.parse(item.isoDate))
						.setDescription(item.content)

					await interaction.followUp({ embeds: [embed] })
				}

				break
			}
			case "ranking": {
				break
			}
		}
	},
})
