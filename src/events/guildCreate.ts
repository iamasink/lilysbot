import { Events, Guild, Interaction, Message } from "discord.js"
import Event from "../types/Event"
import { client } from "../index"
import database from "../utils/database"
import embeds from "../utils/embeds"

// Emitted whenever the client joins a guild.
export default new Event({
	name: Events.GuildCreate,
	async execute(guild: Guild) {
		console.log(`a guild was joined: ${guild}`)

		// cache invites
		const guildinvites = await guild.invites.fetch()
		guildinvites.map(async invite => {
			const code = invite.code
			const inviterId = invite.inviterId
			const uses = invite.uses
			database.set(`.guilds.${guild.id}.invites.${code}`, { inviterId: inviterId, uses: uses, expired: false })
		})

		guild.systemChannel.send({ embeds: await embeds.profileEmbed(":wave: Hi!", "Thanks for inviting me! <3\nCurrently the bot is really quite unstable so things WILL break.\n\"So why are invites enabled?\" you may ask?\nbecause I'm too lazy to turn them off.\nalso if you fuck shit up that's on you", null, client.user) })
	},
}
)