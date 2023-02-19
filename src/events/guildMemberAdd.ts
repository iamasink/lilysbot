import { Events, GuildMember, Interaction, Message } from "discord.js"
import Event from "../types/Event"
import { client } from "../index"
import database from "../utils/database"
import log from "../utils/log"
import commands from "../utils/commands"

// Emitted whenever a user joins a guild.
export default new Event({
	name: Events.GuildMemberAdd,
	async execute(member: GuildMember) {
		const guild = member.guild

		// To compare, we need to load the current invite list.
		const newInvites = await guild.invites.fetch()
		// This is the *existing* invites for the guild.
		const oldInvites = await database.get(`.guilds.${guild.id}.invites`)
		// Look through the invites, find the one for which the uses went up.
		const invite = newInvites.find(i => i.uses > oldInvites[i.code].uses || 0)
		// update invite cache
		database.set(`.guilds.${guild.id}.invites.${invite.code}.uses`, invite.uses)
		// This is just to simplify the message being sent below (inviter doesn't have a tag property)
		const inviter = await client.users.fetch(invite.inviterId)
		// set inviter code for member
		database.set(`.guilds.${guild.id}.users.${member.id}.invitedLink`, invite.code)


		let inviterUser = await client.users.fetch(inviter.id)

		log.log(guild, `${member.id}, \`${member.user.tag}\` has joined guild ${guild}. They were invited by \`${inviterUser.tag}\` (${inviter.id})`)
			.then(async msg => {
				if (!msg) return
				let interaction = await commands.run(msg, "info", null, "user", [
					{
						name: 'target',
						type: 6,
						value: member.id,
						user: await client.users.fetch(member.id),
						member: await guild.members.fetch(member.id)
					}
				])
			})


		//await database.check(`guilds`, `.${guild.id}.users.${member.id}`)
	},
}
)