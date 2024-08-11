import {
	ChatInputCommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
} from "discord.js"
import ApplicationCommand from "../types/ApplicationCommand"
import axios from "axios"

async function getJSONResponse(body) {
	let fullBody = ""

	for await (const data of body) {
		fullBody += data.toString()
	}

	return JSON.parse(fullBody)
}

export default new ApplicationCommand({
	data: new SlashCommandBuilder()
		.setName("nekos")
		.setDescription("Fetch images from nekos.life")
		.addStringOption((option) =>
			option
				.setName("image")
				.setDescription("Type of image to retrieve")
				.addChoices(
					{ name: "smug", value: "smug" },
					{ name: "woof", value: "woof" },
					{ name: "8ball", value: "8ball" },
					{ name: "goose", value: "goose" },
					{ name: "cuddle", value: "cuddle" },
					{ name: "slap", value: "slap" },
					{ name: "pat", value: "pat" },
					{ name: "gecg", value: "gecg" },
					{ name: "feed", value: "feed" },
					{ name: "fox girl", value: "fox_girl" },
					{ name: "lizard", value: "lizard" },
					{ name: "neko", value: "neko" },
					{ name: "hug", value: "hug" },
					{ name: "meow", value: "meow" },
					{ name: "kiss", value: "kiss" },
					{ name: "wallpaper", value: "wallpaper" },
					{ name: "tickle", value: "tickle" },
					{ name: "waifu", value: "waifu" },
				)
				.setRequired(true),
		)
		.addIntegerOption((option) =>
			option
				.setName("number")
				.setDescription(`Number of images`)
				.setMinValue(1)
				.setMaxValue(100),
		)
		.addIntegerOption((option) =>
			option
				.setName("delay")
				.setDescription(
					`Number of seconds to wait before sending next image. No effect if number = 1. Default is 5 seconds`,
				)
				.setMinValue(5)
				.setMaxValue(60),
		),
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		const type = interaction.options.getString("image")
		const number = interaction.options.getInteger("number") || 1
		for (let i = 0; i < number; i++) {
			setTimeout(
				async function () {
					const result = await axios.get(
						`https://nekos.life/api/v2/img/${type}`,
					)
					const image = result.data
					console.log(result.data)

					const embed = new EmbedBuilder()
						.setTitle(`Here\'s a random ${type} image!`)
						.setColor(`#f9beca`)
						.setImage(image.url)
						.setFooter({
							text: "Image from nekos.life",
							iconURL:
								"https://avatars.githubusercontent.com/u/34457007?s=200&v=4",
						})

					if (i == 0) await interaction.reply({ embeds: [embed] })
					else await interaction.followUp({ embeds: [embed] })
				},
				i * interaction.options.getInteger("delay") * 1000,
			)
		}
	},
})
