import { ActivityType, Events, PresenceData } from 'discord.js'
import Event from '../types/Event'
import { client } from "../index"
import database from '../utils/database'
import format from '../utils/format'

export default new Event({
	name: Events.ClientReady,
	once: true,
	execute(): void {
		// Runs when the bot logs in

		const users = client.users.cache.size

		console.log(`Logged in as ${client.user?.tag as string}`)
		console.log(`Guilds: ${client.guilds.cache.size}`)
		console.log(`Users: ${users}`)

		let res = client.user.setPresence({
			activities: [{ name: `You and ${users - 1} others <3`, type: ActivityType.Watching, }],
			status: 'dnd',
		});

		console.log(res)

		// Loop over all the guilds
		client.guilds.cache.forEach(async (guild) => {
			// Fetch all Guild Invites
			const oldinvites = await database.get(`.guilds.${guild.id}.invites`)
			const guildinvites = await guild.invites.fetch()

			guildinvites.map(async invite => {
				const code = invite.code
				const inviterId = invite.inviterId
				const uses = invite.uses
				database.set(`.guilds.${guild.id}.invites.${code}.inviterId`, inviterId)
				database.set(`.guilds.${guild.id}.invites.${code}.uses`, uses)
				database.set(`.guilds.${guild.id}.invites.${code}.expired`, false)
				database.set(`.guilds.${guild.id}.invites.${code}.code`, code)
			})
			for (let i in oldinvites) {
				if (guildinvites.has(i)) {
					console.log(`${guild} - not expired ${i}`)
				} else {
					console.log(`${guild} - expired ${i}`)
					database.set(`.guilds.${guild.id}.invites.${i}.expired`, true)
				}
			}
		})


		// update the activity on an interval
		setInterval(() => {
			const activities: PresenceData[] = [
				{
					activities: [{ name: `You and ${client.users.cache.size - 1} others <33`, type: ActivityType.Watching, }],
					status: 'dnd',
				},
				{
					activities: [{ name: `You.`, type: ActivityType.Watching, }],
					status: 'idle',
				},
				{
					activities: [{ name: `${client.guilds.cache.size} Guilds`, type: ActivityType.Listening, }],
					status: 'online',
				},
				{
					activities: [{ name: `For ${format.time(client.uptime)}`, type: ActivityType.Playing, }],
					status: 'online',
				},
			]

			console.log("updating activity")
			let random = Math.floor(Math.random() * activities.length)

			let res = client.user.setPresence(activities[random]);
			console.log(res)
		}, 60 * 1000);
	},
})