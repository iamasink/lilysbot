import {
	AuditLogEvent,
	EmbedBuilder,
	Events,
	Guild,
	GuildMember,
	Interaction,
	Message,
} from "discord.js"
import Event from "../types/Event"
import database from "../utils/database"
import log from "../utils/log"
import format from "../utils/format"
import settings from "../utils/settings"
import { InviteListSchema } from "../types/Database"
import { stripIndents } from "common-tags"

// Emitted whenever a user joins a guild.
export default new Event({
	name: Events.GuildMemberRemove,
	async execute(member: GuildMember) {
		const guild = member.guild

		let action: "left" | "was banned" | "kicked" | "false" | "vanished" | "was kicked" = "left"

		if (member.pending) {
			//log.log(member.guild, `${member.id} has left guild ${member.guild}, but never passed rules screening`)
			return
		}

		// console.log(member)
		// console.log(`${member.id} has left guild ${guild}`)

		// stolen from discordjs.guide <3

		const fetchedKickLogs = await guild.fetchAuditLogs({
			limit: 1,
			type: AuditLogEvent.MemberKick,
		})

		const fetchedBanLogs = await guild.fetchAuditLogs({
			limit: 1,
			type: AuditLogEvent.MemberBanAdd,
		})

		// Since there's only 1 audit log entry in this collection, grab the first one
		const kickLog = fetchedKickLogs.entries.find(
			(e) => e.target.id === member.id,
		)
		// console.log(kickLog)
		const banLog = fetchedBanLogs.entries.find(
			(e) => e.target.id === member.id,
		)
		// console.log(banLog)

		// Perform a coherence check to make sure that there's *something*
		if (!kickLog && !banLog) {
			// console.log(`${member.displayName} (${member.user.username}) left the guild, most likely of their own will.`)
			action = "left"
		} else if (banLog) {
			// Now grab the user object of the person who kicked the member
			// Also grab the target of this action to double-check things
			const { executor, target } = banLog

			// Update the output with a bit more information
			// Also run a check to make sure that the log returned was for the same kicked member
			if (target.id === member.id) {
				log.log(
					guild,
					`${member.displayName} (${member.user.username} ${member.user}) left the guild; banned by ${executor.username} ${executor}`,
				)
				// console.log(`${member.displayName} (${member.user.username} ${member.user}) left the guild; banned by ${format.shittyUsername(executor)}`);
				if (await settings.get(guild, "leave_kick_message")) {
					action = "was banned"
				} else {
					action = "false"
				}
			} else {
				// console.log(`${format.shittyUsername(member.user)} left the guild, audit log fetch was inconclusive.`);
				log.log(
					guild,
					`${member.displayName} (${member.user.username} ${member.user}) left the guild, audit log fetch was inconclusive.`,
				)
				action = "vanished"
			}
		} else if (kickLog) {
			// Now grab the user object of the person who kicked the member
			// Also grab the target of this action to double-check things
			const { executor, target } = kickLog

			// Update the output with a bit more information
			// Also run a check to make sure that the log returned was for the same kicked member
			if (target.id === member.id) {
				// console.log(`${member.displayName} (${member.user.username}) left the guild; kicked by ${format.shittyUsername(executor)}`);
				log.log(
					guild,
					`${member.displayName} (${member.user.username} ${member.user}) left the guild; kicked by ${executor.username} ${executor}}`,
				)
				if (await settings.get(guild, "leave_kick_message")) {
					action = "was kicked"
				} else {
					action = "false"
				}
			} else {
				// console.log(`${format.shittyUsername(member.user)} left the guild, audit log fetch was inconclusive.`);
				log.log(
					guild,
					`${member.displayName} (${member.user.username} ${member.user}) left the guild, audit log fetch was inconclusive.`,
				)
				action = "vanished"
			}
		}
		const invitedLink = await database.get<string>(
			`.guilds.${member.guild.id}.users.${member.id}.invitedLink`,
		)
		const invites = await database.get<InviteListSchema>(
			`.guilds.${member.guild.id}.invites`,
		)
		// display inviter if they were banned or kicked
		let invitermsg = ""
		const invite = invites[invitedLink]
		if (invite && action === "was banned" || action === "was kicked") {
			let inviter = null
			try {
				inviter = await guild.members.fetch(invite.inviterId)
			} catch (e) {
				console.log("invite issue")
			}
			if (inviter) {
				invitermsg = `They were invited by ${inviter} (${invite.inviterId}) ${invite.code.slice(0, 4)}`
			}
		}

		if ((await settings.get(guild, "leave_message")) && action != "false") {
			const embed = new EmbedBuilder()
				.setColor("#ff0000")
				.setTitle(`${member.user.username} ${action}.`)
				.setDescription(
					`They were a member for ${format.time(Date.now() - member.joinedTimestamp,)}.
					Joined on <t:${member.joinedTimestamp.toString().slice(0, -3)}:f>
					ID: ${member.id}\n`
					+ invitermsg,
				)
				.setThumbnail(member.user.avatarURL({ forceStatic: false }))
			if (action == "was banned") {
				const gifs = [
					"https://media.tenor.com/7VY8WFpRZZcAAAAC/explosions-spontaneous-explosion.gif",
					"https://media.tenor.com/g9TJiULXIZQAAAAd/air-strike.gif",
					"https://media.tenor.com/2L8cGGO6_MIAAAAd/operation-teapot-nuke.gif",
					"https://media.tenor.com/eEs1jRy5UXgAAAAC/house-explosion.gif",
					"https://media.tenor.com/Xk-mBqoSLX0AAAAC/kaguya-boom.gif",
				]
				const gif = gifs[Math.floor(Math.random() * gifs.length)]
				embed.setImage(gif)
			}
			member.guild.systemChannel.send({ embeds: [embed] })
		} else {
			console.log("this leave/kick message is disabled.")
		}
	},
})
