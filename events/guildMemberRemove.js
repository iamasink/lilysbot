const database = require('../structure/database')
const commands = require('../structure/commands')
const embeds = require('../structure/embeds')
const format = require('../structure/format')
const { EmbedBuilder } = require('discord.js')
const log = require('../structure/log')





// Emitted whenever a user joins a guild.

module.exports = {
	name: "guildMemberRemove",
	async execute(member) {
		console.log(member)
		console.log(`${member.id} has left guild ${member.guild}`)
		log.log(member.guild, `${member.id} has left guild ${member.guild}`)

		const embed = new EmbedBuilder()
			.setColor('#ff0000')
			.setTitle(`${member.user.tag} Left.`)
			.setDescription(`They were a member for ${format.time(Date.now() - member.joinedTimestamp)}.\nJoined on <t:${member.joinedTimestamp.toString().slice(0, -3)}:f>`)
			.setThumbnail(member.user.avatarURL(true))
		member.guild.systemChannel.send({ embeds: [embed] })
	},
}