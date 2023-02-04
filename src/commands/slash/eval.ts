import { SlashCommandBuilder } from 'discord.js'
import http from 'http'
import https from 'https'


import database from '../../structure/database'
import format from '../../structure/format'
import commands from '../../structure/commands'
import calc from '../../structure/calc'
import colour from '../../structure/colour'
import log from '../../structure/log'








// This function cleans up and prepares the
// result of our eval command input for sending
// to the channel
const clean = async (text: any) => {
	// If our input is a promise, await it before continuing
	if (text && text.constructor.name == "Promise")
		text = await text

	// If the response isn't a string, `util.inspect()`
	// is used to 'stringify' the code in a safe way that
	// won't error out on objects with circular references
	// (like Collections, for example)
	if (typeof text !== "string")
		text = require("util").inspect(text, { depth: 1 })

	// Replace symbols with character code alternatives
	text = text
		.replace(/`/g, "`" + String.fromCharCode(8203))
		.replace(/@/g, "@" + String.fromCharCode(8203))

	// Send off the cleaned up result
	return text
}


export default {
	permission: `botowner`,
	data: new SlashCommandBuilder()
		.setName('eval')
		.setDescription('eval')
		.addStringOption((option: any) => option
			.setName("string")
			.setDescription("string to eval")
			.setRequired(true)),
	async execute(interaction: any) {
		await interaction.deferReply()
		// In case something fails, we to catch errors
		// in a try/catch block
		try {
			// Evaluate (execute) our input
			const evaled = eval("(async () => {" + interaction.options.getString("string") + "})()")
			console.log(evaled)
			// Put our eval result through the function
			// we defined above
			const cleaned = await clean(evaled)
			console.log(cleaned)
			// Reply in the channel with our result
			const messages = format.splitMessage("```js\n" + cleaned + "\n```", 2000, '\n', '```js\n', '\n```')
			await interaction.editReply("evaled")
			for (let i = 0, len = messages.length; i < len; i++) {
				await interaction.followUp(messages[i])
			}

		} catch (err) {
			console.log(err)
			// Reply in the channel with our error
			await interaction.editReply(`\`ERROR\` \`\`\`diff\n\- ${err} \n\`\`\``)
		}

	}
}