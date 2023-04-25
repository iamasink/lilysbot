import { ActivityOptions, ActivityType, Events, PresenceData, PresenceStatusData, TextChannel } from 'discord.js'
import Event from '../types/Event'
import { client } from "../index"
import database from '../utils/database'
import format from '../utils/format'
import invites from '../utils/invites'
import embeds from '../utils/embeds'
import axios from 'axios'

export default new Event({
	name: Events.ClientReady,
	once: true,
	async execute(): Promise<void> {
		// Runs when the bot logs in
		console.log("Starting Bot")

		const users = client.users.cache.size
		const guilds = await client.guilds.fetch()
		console.log(`Logged in as ${client.user?.tag as string}`)
		console.log(`Guilds: ${guilds.size}`)
		console.log(`Users: ${users}`)

		let res = client.user.setPresence({
			activities: [{ name: `Starting Up!`, type: ActivityType.Playing, }],
			status: 'dnd',
		})

		console.log(res)

		setTimeout(async () => {
			// update the database cache with all invites, some may have been lost if the bot was offline.
			invites.updateAllInviteCaches()

			// say that the bots been restarted if /refresh was used
			const restartinfo = await database.get(`.botdata.lastchannel`)
			console.log(restartinfo)
			if (restartinfo && restartinfo.message != null) {
				const guild = await client.guilds.fetch(restartinfo.guild)
				const channel = await guild.channels.fetch(restartinfo.channel)
				const message = await (channel as TextChannel).messages.fetch(restartinfo.message)
				message.reply({ embeds: embeds.successEmbed(`Restarted!`) })
			}
			database.set(`.botdata.lastchannel`, { guild: null, channel: null, message: null })
			client.user.setPresence({
				activities: [{ name: `Restarted!`, type: ActivityType.Playing, }],
				status: 'online',
			})

		}, 2000 + guilds.size * 100) // wait (hopefully) an appropriate amount of time


		// update the activity on an interval
		setInterval(async () => {
			const activities: ActivityOptions[] = [
				{ type: ActivityType.Watching, name: `you and ${client.users.cache.size - 1} others <33`, },
				{ type: ActivityType.Watching, name: `you.`, },
				{ type: ActivityType.Listening, name: `${client.guilds.cache.size} guilds`, },
				{ type: ActivityType.Playing, name: `for ${format.time(client.uptime)}`, },
			]
			const statuses: PresenceStatusData[] = [
				"dnd",
				"idle",
				"online",
			]

			console.log("updating activity")
			let randomActivity = Math.floor(Math.random() * activities.length)
			let randomStatus = Math.floor(Math.random() * activities.length)
			let activity = activities[randomActivity]
			let status = statuses[randomStatus]
			const glances = (await axios.get('http://localhost:61208/api/3/all')).data

			//activity.name = activity.name + ` | Load: ${glances.cpu.total}`

			let res = client.user.setPresence({
				activities: [activity],
				status: status
			})

			console.log(res)
		}, 60 * 1000);
	},
})