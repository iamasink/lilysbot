const database = require('../structure/database')
const commands = require('../structure/commands')
const embeds = require('../structure/embeds')
const format = require('../structure/format')
const { EmbedBuilder } = require('discord.js')
const log = require('../structure/log')





// Emitted whenever a user is 'updated' in a guild.

module.exports = {
	name: "guildMemberUpdate",
	async execute(member) {
		console.log(member)
		if (member.pending) {
			info = `\nthey are pending.`
		} else {
			info = `\nthey aren't pending.`
		}
		log.log(member.guild, `${member.id} has been updated.` + info)


	},
}