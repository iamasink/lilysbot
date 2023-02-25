import { ActivityType, Events, PresenceData, TextChannel } from 'discord.js'
import Event from '../types/Event'
import { client } from "../index"
import database from '../utils/database'
import format from '../utils/format'
import invites from '../utils/invites'
import embeds from '../utils/embeds'

export default new Event({
	name: Events.ClientReady,
	once: true,
	async execute(): Promise<void> {
		// Runs when the bot logs in

		const users = client.users.cache.size
		const guilds = await client.guilds.fetch()
		console.log(`Logged in as ${client.user?.tag as string}`)
		console.log(`Guilds: ${guilds.size}`)
		console.log(`Users: ${users}`)

		let res = client.user.setPresence({
			activities: [{ name: `You and ${users - 1} others <3`, type: ActivityType.Watching, }],
			status: 'dnd',
		});

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
		}, 2000 + guilds.size * 100) // wait (hopefully) an appropriate amount of time


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
			//console.log(res)
		}, 60 * 1000);
	},
})