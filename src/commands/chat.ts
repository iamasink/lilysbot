import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import ApplicationCommand from '../types/ApplicationCommand'



const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const completion = await openai.createCompletion({
	model: "text-davinci-003",
	prompt: "Hello world",
});
console.log(completion.data.choices[0].text);

export default new ApplicationCommand({
	permissions: ["Administrator"],
	data: new SlashCommandBuilder()
		.setName('chat')
		.setDescription('description'),
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {

	},
})