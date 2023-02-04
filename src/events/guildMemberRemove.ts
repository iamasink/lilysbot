//const database = require('../structure/database') idk why it complains about this /shrug
//const commands = require('../structure/commands')
import embeds from '../structure/embeds'
import format from '../structure/format'
import { EmbedBuilder } from 'discord.js'
import log from '../structure/log'





// Emitted whenever a user joins a guild.

export default {
	name: "guildMemberRemove",
	async execute(member: any) {
		if (member.pending) {
			log.log(member.guild, `${member.id} has left guild ${member.guild}, but never passed rules screening`)
			return
		}
		log.log(member.guild, `${member.id} has left guild ${member.guild}`)


		console.log(member)
		console.log(`${member.id} has left guild ${member.guild}`)

		const embed = new EmbedBuilder()
			.setColor('#ff0000')
			.setTitle(`${member.user.tag} Left.`)
			.setDescription(`They were a member for ${format.time(Date.now() - member.joinedTimestamp)}.\nJoined on <t:${member.joinedTimestamp.toString().slice(0, -3)}:f>`)
			.setThumbnail(member.user.avatarURL(true))
		member.guild.systemChannel.send({ embeds: [embed] })
	},
}