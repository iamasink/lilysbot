"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const discord_js_1 = require("discord.js");
const embeds_1 = tslib_1.__importDefault(require("../../structure/embeds"));
const commands_1 = tslib_1.__importDefault(require("../../structure/commands"));
// function runScript(scriptPath, callback) {
// 	// keep track of whether callback has been invoked to prevent multiple invocations
// 	var invoked = false
// 	var process = childProcess.fork(scriptPath)
// 	// listen for errors as they may prevent the exit event from firing
// 	process.on('error', function (err) {
// 		if (invoked) return
// 		invoked = true
// 		callback(err)
// 	})
// 	// execute the callback once the process has finished running
// 	process.on('exit', function (code) {
// 		if (invoked) return
// 		invoked = true
// 		var err = code === 0 ? null : new Error('exit code ' + code)
// 		callback(err)
// 	})
// }
exports.default = {
    permission: `botowner`,
    data: new discord_js_1.SlashCommandBuilder()
        .setName('refresh')
        .setDescription('Reloads the bot and commands'),
    async execute(interaction) {
        await interaction.deferReply();
        const res = await commands_1.default.deploy();
        try {
            interaction.followUp({ embeds: embeds_1.default.successEmbed(`Successfully deployed (${res}) commands!`) });
            interaction.followUp({ embeds: embeds_1.default.messageEmbed('Restarting!', 'Please wait...') });
        }
        catch (error) {
            console.error(error);
            throw error;
        }
        setTimeout(function () {
            process.exit();
        }, 1000);
        // runScript('./deploy-commands.js', function (err) {
        // 	if (err) {
        // 		return interaction.followUp({ embeds: embeds.errorEmbed('An error occurred while deploying commands!`', err) })
        // 	} else {
        // 		interaction.followUp({ embeds: embeds.successEmbed('Successfully deployed commands!') })
        // 		interaction.followUp({ embeds: embeds.messageEmbed('Restarting!', 'Please wait...') })
        // 		setTimeout(function () {
        // 			process.exit()
        // 		}, 1000)
        // 	}
        // })
    },
};
