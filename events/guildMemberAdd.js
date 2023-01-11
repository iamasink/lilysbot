const database = require('../structure/database')
const commands = require('../structure/commands')
const log = require('../structure/log')


// Emitted whenever a user joins a guild.

module.exports = {
	name: "guildMemberAdd",
	async execute(member) {

		console.log(`${member.id} has joined guild ${member.guild}`)
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


		//await database.check(`guilds`, `.${member.guild.id}.users.${member.id}`)
	},
}