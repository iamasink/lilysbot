import {
	ChatInputCommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
} from "discord.js"
import ApplicationCommand from "../types/ApplicationCommand"
import axios from "axios"

export default new ApplicationCommand({
	data: new SlashCommandBuilder()
		.setName("roast")
		.setDescription("roasts someone!!!!")
		.addUserOption((option) =>
			option.setName("user").setDescription("user to roast"),
		),
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		let message = ""
		const user = interaction.options.getUser("user")
		const result = await axios.get(
			"https://evilinsult.com/generate_insult.php?lang=en&type=json",
		)
		console.log(result)

		if (user) message += `<@${user.id}>, `
		message += (result.data.insult as string)
			.replaceAll("&#039;", `'`)
			.replaceAll(`&quot;`, `"`)

		interaction.reply({ content: message })
	},
})
