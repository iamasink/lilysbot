import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import ApplicationCommand from '../types/ApplicationCommand'
import { client } from '..'
import format from '../utils/format'

export default new ApplicationCommand({
	permissions: ["Administrator"],
	data: new SlashCommandBuilder()
		.setName('test')
		.setDescription('description'),
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {

		const string = `aaaa\\_bbbb\\_cccc aaaa\\_bbbb\\_ aaaa \\_\\_underline\\_\\_\\_ this\\_\\_should\\_\\_ be underlined this\\_shouldnt\\_be\\_italicized\\_ except at the end!!! and just a normal _italics_ i love ~~strikethroughs~~ **lol*** a***`
		console.log(string)






		interaction.reply(`\`\`\`${format.markdownEscape(string)}\`\`\``)
	},
})