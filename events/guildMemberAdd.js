const database = require('../structure/database')
const commands = require('../structure/commands')
const log = require('../structure/log')


// Emitted whenever a user joins a guild.

module.exports = {
	name: "guildMemberAdd",
	async execute(member) {

		console.log(`${member.id} has joined guild ${member.guild}`)
		console.log(member)
		log.log(member.guild, `${member.id}, ${member.tag} has joined guild ${member.guild}`)
			.then(async msg => {
				await commands.run(msg, "info", null, "user", [
					{
						name: 'target',
						type: 6,
						value: member.id,
						user: await client.users.fetch(member.id),
						member: await member.guild.members.fetch(member.id)
					}
				])
			})

		// To compare, we need to load the current invite list.
		const newInvites = await member.guild.invites.fetch()
		// This is the *existing* invites for the guild.
		const oldInvites = await database.get(`.guilds.${member.guild.id}.invites`)
		// Look through the invites, find the one for which the uses went up.
		const invite = newInvites.find(i => i.uses > oldInvites[i.code].uses)
		// This is just to simplify the message being sent below (inviter doesn't have a tag property)
		const inviter = await client.users.fetch(invite.inviterId)
		console.log(`inviter: ${inviter.id}`)

		//await database.check(`guilds`, `.${member.guild.id}.users.${member.id}`)
	},
}