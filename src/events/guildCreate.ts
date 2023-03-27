import { Events, Guild, Interaction, Message } from "discord.js"
import Event from "../types/Event"
import { client } from "../index"
import database from "../utils/database"
import embeds from "../utils/embeds"
import settings from "../utils/settings"

// Emitted whenever the client joins a guild.
export default new Event({
	name: Events.GuildCreate,
	async execute(guild: Guild) {
		console.log(`a guild was joined: ${guild}`)

		settings.setDefaults(guild.id)

		// cache invites
		const guildinvites = await guild.invites.fetch()
		guildinvites.map(async invite => {
			const code = invite.code
			const inviterId = invite.inviterId
			const uses = invite.uses
			database.set(`.guilds.${guild.id}.invites.${code}`, { inviterId: inviterId, uses: uses, expired: false })
		})

		guild.systemChannel.send({
			embeds: await embeds.profileEmbed(
				":wave: Hi!",
				`Thanks for inviting me! See \`/settings\` for some options <3 
				This bot is really quite WIP so things might breal and I'm sorry
				-Lily`,
				null, client.user)
		})
	},
}
)

