const database = require('../structure/database')
const commands = require('../structure/commands')
const log = require('../structure/log')
import { client } from '../index'


// Emitted whenever a user joins a guild.

export default {
	name: "guildMemberAdd",
	async execute(member: any) {
		// To compare, we need to load the current invite list.
		const newInvites = await member.guild.invites.fetch()
		// This is the *existing* invites for the guild.
		const oldInvites = await database.get(`.guilds.${member.guild.id}.invites`)
		// Look through the invites, find the one for which the uses went up.
		const invite = newInvites.find((i: any) => i.uses > oldInvites[i.code].uses)
		// update invite cache
		database.set(`.guilds.${member.guild.id}.invites.${invite.code}.uses`, invite.uses)
		// This is just to simplify the message being sent below (inviter doesn't have a tag property)
		const inviter = await client.users.fetch(invite.inviterId)
		// set inviter code for member
		database.set(`.guilds.${member.guild.id}.users.${member.id}.invitedLink`, invite.code)


		const inviterUser = await client.users.fetch(inviter.id)
		log.log(member.guild, `${member.id}, \`${await member.user.tag}\` has joined guild ${member.guild}. They were invited by \`${inviterUser.tag}\` (${inviter.id})`)
			.then(async (msg: any) => {
				const interaction = await commands.run(msg, "info", null, "user", [
					{
						name: 'target',
						type: 6,
						value: member.id,
						user: await client.users.fetch(member.id),
						member: await member.guild.members.fetch(member.id)
					}
				])
			})


		//await database.check(`guilds`, `.${member.guild.id}.users.${member.id}`)
	},
}