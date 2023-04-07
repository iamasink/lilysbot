import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import ApplicationCommand from '../types/ApplicationCommand'
import { openaitoken } from '../config.json'

import { Configuration, OpenAIApi } from 'openai'

const configuration = new Configuration({
	apiKey: openaitoken,
});
const openai = new OpenAIApi(configuration)


export default new ApplicationCommand({
	data: new SlashCommandBuilder()
		.setName('chat')
		.setDescription('description')
		.addStringOption(command => command
			.setName("text")
			.setDescription("enter text")
		)
		.addNumberOption(option => option
			.setName("temperature")
			.setDescription("set the temperature for the response. (decimal 0-2)")
			.setMaxValue(2)
			.setMinValue(0)),
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		if (interaction.guild.id == "1008017419043872849" || interaction.guild.id == "705114283683610988") {
			console.log(interaction)

			await interaction.deferReply()

			const completion = await openai.createChatCompletion({
				model: "gpt-3.5-turbo",
				messages: [
					{
						role: "system",
						content: "You are a Discord chat bot named 'Wiwwie', created and owned by Lily. "
					},
					{
						role: "user",
						content: interaction.options.getString("text"),
						name: interaction.user.username
					}
				],
				temperature: interaction.options.getNumber("temperature"),
				//top_p:
				//n:
				//stream:
				//stop:
				//max_tokens:
				//presence_penalty:
				//frequency_penalty:
				//logit_bias:
				user: interaction.user.id
			})
			console.log(completion.data)
			await interaction.editReply(completion.data.choices[0].message)
		} else {
			interaction.reply("no")
		}

	},
})