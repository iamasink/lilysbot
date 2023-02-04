const database = require("../structure/database")

// A pretty useful method to create a delay without blocking the whole script.
const wait = require("timers/promises").setTimeout

export default {
	name: 'ready',
	// should the event only run once?
	once: true,
	// event logic, which will be called by the event handler whenever the event emits.
	async execute(client: any) {
		await database.connect()
		console.log(`Ready! Logged in as ${client.user.tag}`)

		await wait(1000)

		// Loop over all the guilds
		client.guilds.cache.forEach(async (guild: any) => {
			// Fetch all Guild Invites
			const oldinvites = await database.get(`.guilds.${guild.id}.invites`)
			const guildinvites = await guild.invites.fetch()

			guildinvites.map(async (invite: any) => {

				const code = invite.code
				const inviterId = invite.inviterId
				const uses = invite.uses
				database.set(`.guilds.${guild.id}.invites.${code}.inviterId`, inviterId)
				database.set(`.guilds.${guild.id}.invites.${code}.uses`, uses)
				database.set(`.guilds.${guild.id}.invites.${code}.expired`, false)
				database.set(`.guilds.${guild.id}.invites.${code}.code`, code)
			})
			for (const i in oldinvites) {
				if (guildinvites.has(i)) {
					console.log(`sex ${i}`)
				} else {
					console.log(`expired ${i}`)
					database.set(`.guilds.${guild.id}.invites.${i}.expired`, true)
				}
			}
		})
	},
}