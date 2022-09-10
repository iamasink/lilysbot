const { SlashCommandBuilder, SlashCommandSubcommandBuilder, EmbedBuilder } = require('discord.js')
const interactionCreate = require('../events/interactionCreate')
const database = require('../structure/database')


function fetchPromise(toFetch) {
	return new Promise((resolve, reject) => {
		try {
			resolve(toFetch.fetch(true))
		} catch { reject() }
	})
}


function format(val, name, append = ``) {
	output = `\n**${name}**: `
	if (val != undefined) {
		output += `${val}${append}`
	} else {
		output = ``
	}
	return output
}


module.exports = {
	permission: `botowner`,
	data: new SlashCommandBuilder()
		.setName('database')
		.setDescription('Database stuff')
		.addSubcommand(subcommand => subcommand
			.setName('reset')
			.setDescription('a')
			.addStringOption(option => option
				.setName('key')
				.setDescription('a')
			)
			.addStringOption(option => option
				.setName('path')
				.setDescription('a')
				.setName('path')
				.setDescription('path')
			)
		),

	async execute(interaction) {
		switch (interaction.options.getSubcommand()) {
			case 'reset': {
				switch (interaction.options.getString('option')) {
					case 'reset': {
						database.reset(`guilds`,)
					}
				}

				break
			}
		}
	}
}