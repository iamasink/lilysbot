import { ChatInputCommandInteraction, Invite } from "discord.js"
import { Subcommand } from "../../../types/ApplicationCommand"
import { UserSchema } from "../../../types/Database"
import database from "../../../utils/database"
import embeds from "../../../utils/embeds"
import { funnyinvite } from "../invite"

export default {
	name: "details",
	async execute(interaction: ChatInputCommandInteraction) {
		const guild = interaction.guild
		const code = interaction.options.getString("code")

		const invites = await interaction.guild.invites.fetch()
		const invite: Invite = invites.find((invite) => invite.code === code)
		if (!(await database.get(`.guilds.${guild.id}.invites.${code}`))) {
			interaction.reply({
				ephemeral: true,
				embeds: embeds.warningEmbed(`Invalid Invite Code`),
			})
			return
		}
		const dbInvite: funnyinvite = await database.get(
			`.guilds.${guild.id}.invites.${code}`,
		)
		// if (!invite) {
		// 	interaction.reply({ ephemeral: true, embeds: embeds.warningEmbed(`Invalid Invite.`) })
		// 	return
		// }
		console.log(invite)

		const invitedusers = []

		const dbusers = await database.get<UserSchema[]>(
			`.guilds.${guild.id}.users`,
		)
		for (let u in dbusers) {
			if (dbusers.hasOwnProperty(u)) {
				if (dbusers[u].invitedLink == code) {
					invitedusers.push(u)
				}
			}
		}

		console.log(invitedusers)

		// if (invite) {
		// 	const inviter = invite.inviter || "null"
		// 	const channel = await interaction.client.channels.fetch(invite.channelId)
		// 	finalinviter.push`r:\`${inviter}\``
		// }

		// if (dbInvite) {
		// 	const dbInviter = await interaction.client.users.fetch(dbInvite.inviterId)
		// 	finalinviter.push`d:\`${dbInviter}\``
		// }
		// let invitermessage = finalinviter.join(" | ")

		// const invitedUsers = []

		// let message = `__${invite.code } __`

		// console.log(invitermessage)

		// // message +=
		// // 	stripIndents`
		// // 		by: ${inviter || "?" || "?"}
		// // 		to channel: ${channel || "?"}
		// // 		temporary: ${invite.temporary || "?"}
		// // 		maxAge: ${invite.maxAge || "?"}
		// // 		uses: ${invite.uses || "?"}
		// // 		maxUses: ${invite.maxUses || "?"}
		// // 		createdTimestamp: ${invite.createdTimestamp || "?"}
		// // 		expiresTimestamp: ${invite.expiresTimestamp || "?"}
		// // 		`

		// interaction.reply({
		// 	content: message,
		// 	ephemeral: true
		// })
	},
} satisfies Subcommand
