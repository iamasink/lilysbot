import { Events, GuildMember, Interaction, Message } from "discord.js"
import Event from "../types/Event"
import database from "../utils/database"
import log from "../utils/log"
import commands from "../utils/commands"
import invites from "../utils/invites"
import settings from "../utils/settings"
import format from "../utils/format"
import type { Bot } from "../structures/Client"

// Emitted whenever a user joins a guild.
export default new Event({
	name: Events.GuildMemberAdd,
	async execute(member: GuildMember, client: Bot) {
		const guild = member.guild
		console.log(member)
		let note = "idk who invited them"

		// To compare, we need to load the current invite list.
		const newInvites = await guild.invites.fetch()
		// This is the *existing* invites for the guild.
		const oldInvites = await database.get(`.guilds.${guild.id}.invites`)
		// Look through the invites, find the one for which the uses went up.
		let invite = newInvites.find(
			(i) => i.uses > oldInvites[i.code].uses || 0,
		)
		console.log("invite")
		console.log(invite)
		if (
			newInvites.filter((i) => i.uses > oldInvites[i.code].uses).size > 1
		) {
			console.log(
				"cache is broken somehow, we can't know who invited this user.",
			)
			invites.updateInviteCache(guild)
		} else if (!invite) {
			console.log(
				"the invite doesn't exist anymore, we can't know who invited this user.",
			)
			invites.updateInviteCache(guild)
			// const newOldInvites: object = await database.get(`.guilds.${guild.id}.invites`)
			// const newinvites = Object.values(newOldInvites)

			// const newinvite = newinvites.find(i => i.uses > oldInvites[i.code].uses || 0)
			// console.log(newinvite)
			// database.set(`.guilds.${guild.id}.invites.${invite.code}.uses`, invite.uses)
			// database.set(`.guilds.${guild.id}.users.${member.id}.invitedLink`, invite.code)
		} else {
			// update invite cache
			database.set(
				`.guilds.${guild.id}.invites.${invite.code}.uses`,
				invite.uses,
			)
			// set inviter code for member
			database.set(
				`.guilds.${guild.id}.users.${member.id}.invitedLink`,
				invite.code,
			)
			const inviter = await client.users.fetch(invite.inviterId)
			let inviterUser = await client.users.fetch(inviter.id)
			const username = inviterUser.tag
			const id = inviter.id
			note = `They were invited by \`${username}\` (${inviter.id})`
		}

		log.log(
			guild,
			`${member.id}, \`${member.user}\` has joined guild ${guild}. ${note}`,
		).then(async (msg) => {
			if (!msg) return
			let interaction = await commands.run(
				msg,
				"slash",
				"info",
				null,
				"user",
				[
					{
						name: "target",
						type: 6,
						value: member.id,
						user: await client.users.fetch(member.id),
						member: await guild.members.fetch(member.id),
					},
				],
			)
		})

		//await database.check(`guilds`, `.${guild.id}.users.${member.id}`)
	},
})
