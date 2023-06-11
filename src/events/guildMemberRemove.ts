import { AuditLogEvent, EmbedBuilder, Events, Guild, GuildMember, Interaction, Message } from "discord.js"
import Event from "../types/Event"
import { client } from "../index"
import database from "../utils/database"
import log from "../utils/log"
import format from "../utils/format"
import settings from "../utils/settings"

// Emitted whenever a user joins a guild.
export default new Event({
	name: Events.GuildMemberRemove,
	async execute(member: GuildMember) {
		const guild = member.guild

		let action: string = "left"

		if (member.pending) {
			//log.log(member.guild, `${member.id} has left guild ${member.guild}, but never passed rules screening`)
			return
		}


		console.log(member)
		console.log(`${member.id} has left guild ${guild}`)

		// stolen from discordjs.guide <3


		const fetchedLogs = await guild.fetchAuditLogs({
			limit: 1,
			type: AuditLogEvent.MemberKick,
		});
		// Since there's only 1 audit log entry in this collection, grab the first one
		const kickLog = fetchedLogs.entries.find(e => e.target.id === member.id)
		console.log(kickLog)

		// Perform a coherence check to make sure that there's *something*
		if (!kickLog) {
			console.log(`${format.shittyUsername(member.user)} left the guild, most likely of their own will.`)
			action = "left"
		}
		else {
			// Now grab the user object of the person who kicked the member
			// Also grab the target of this action to double-check things
			const { executor, target } = kickLog;

			// Update the output with a bit more information
			// Also run a check to make sure that the log returned was for the same kicked member
			if (target.id === member.id) {
				log.log(guild, `${format.shittyUsername(member.user)} left the guild; kicked by ${format.shittyUsername(executor)}?`);
				console.log(`${format.shittyUsername(member.user)} left the guild; kicked by ${format.shittyUsername(executor)}?`);
				if (await settings.get(guild, "leave_kick_message")) {
					action = "was kicked"
				} else {
					action = "false"
				}

			} else {
				console.log(`${format.shittyUsername(member.user)} left the guild, audit log fetch was inconclusive.`);
				log.log(guild, `${format.shittyUsername(member.user)} left the guild, audit log fetch was inconclusive.`);
				action = "vanished??"
			}
		}

		if (await settings.get(guild, "leave_message") && action != "false") {
			const embed = new EmbedBuilder()
				.setColor('#ff0000')
				.setTitle(`${format.shittyUsername(member.user)} ${action}.`)
				.setDescription(`They were a member for ${format.time(Date.now() - member.joinedTimestamp)}.\nJoined on <t:${member.joinedTimestamp.toString().slice(0, -3)}:f>`)
				.setThumbnail(member.user.avatarURL({ forceStatic: false }))
			member.guild.systemChannel.send({ embeds: [embed] })
		} else {
			console.log("this leave/kick message is disabled.")
		}

	},
}
)