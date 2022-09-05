const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const embeds = require('../structure/embeds.js')

const childProcess = require('child_process')
const interactionCreate = require('../events/interactionCreate')

function runScript(scriptPath, callback) {

	// keep track of whether callback has been invoked to prevent multiple invocations
	var invoked = false

	var process = childProcess.fork(scriptPath)

	// listen for errors as they may prevent the exit event from firing
	process.on('error', function (err) {
		if (invoked) return
		invoked = true
		callback(err)
	})

	// execute the callback once the process has finished running
	process.on('exit', function (code) {
		if (invoked) return
		invoked = true
		var err = code === 0 ? null : new Error('exit code ' + code)
		callback(err)
	})

}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('refresh')
		.setDescription('Reloads the bot and commands'),
	async execute(interaction) {
		interaction.deferReply()


		runScript('./deploy-commands.js', function (err) {
			if (err) {
				return interaction.followUp({ embeds: embeds.errorEmbed('An error occurred while deploying commands!`', err) })
			} else {
				interaction.followUp({ embeds: embeds.successEmbed('Successfully deployed commands!') })
				interaction.followUp({ embeds: embeds.messageEmbed('Restarting!', 'Please wait...') })
				setTimeout(function () {
					process.exit()
				}, 1000)
			}
		})


	},
}