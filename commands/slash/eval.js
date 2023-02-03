const { SlashCommandBuilder } = require('discord.js')
const http = require('http')
const https = require('https')


const database = require('../../structure/database')
const format = require('../../structure/format')
const commands = require('../../structure/commands')
const calc = require('../../structure/calc')
const colour = require('../../structure/colour')
const log = require('../../structure/log')
const buttons = require('../../structure/buttons')








// This function cleans up and prepares the
// result of our eval command input for sending
// to the channel
const clean = async (text) => {
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


module.exports = {
	permission: `botowner`,
	data: new SlashCommandBuilder()
		.setName('eval')
		.setDescription('eval')
		.addStringOption(option => option
			.setName("string")
			.setDescription("string to eval")
			.setRequired(true)),
	async execute(interaction) {
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
			messages = format.splitMessage("```js\n" + cleaned + "\n```", 2000, '\n', '```js\n', '\n```')
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