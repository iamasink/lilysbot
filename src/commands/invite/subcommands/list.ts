import { ChatInputCommandInteraction, Invite } from "discord.js"
import { Subcommand } from "../../../types/ApplicationCommand"
import { InviteListSchema, InviteSchema } from "../../../types/Database"
import database from "../../../utils/database"
import format from "../../../utils/format"

export default {
	name: "list",
	async execute(interaction: ChatInputCommandInteraction) {
		const user = interaction.options.getUser("user")

		await interaction.deferReply({ ephemeral: true })
		// await interaction.reply({
		// 	ephemeral: true,
		// 	embeds: embeds.messageEmbed("listing invites..."),
		// })

		// Fetch the invite list from the database
		const invitelist = await database.get<InviteListSchema>(
			`.guilds.${interaction.guild.id}.invites`,
		)
		// console.log(invitelist)
		invitelist
		var newinvitelist: InviteSchema[] = Object.values(invitelist)

		// Fetch the current invites from the guild
		const currentinvites = await interaction.guild.invites.fetch()
		// console.log(currentinvites)

		let output = ""

		const showall = interaction.options.getBoolean("showall")
		for (const invite of newinvitelist) {
			const {
				code,
				name = "",
				expired: hasExpired,
				uses,
				inviterId,
			} = invite
			if (user) {
				if (inviterId !== user.id) {
					continue
				}
			}

			let tempoutput = ""

			// Skip expired invites with no uses if "showall" is false
			if (hasExpired && uses === 0 && !showall) continue

			if (inviterId) {
				tempoutput += `${
					name ? `${name} - ` : ""
				}\`${code}\`, by <@${inviterId}> (${inviterId}),`
			}

			let guildinvite: Invite | undefined

			if (!hasExpired) {
				guildinvite = currentinvites.find((e) => e.code === code)

				if (guildinvite) {
					const createdTimestamp = `<t:${guildinvite.createdTimestamp
						.toString()
						.slice(0, -3)}>`
					let expiresTimestamp = guildinvite.expiresTimestamp
						? `<t:${guildinvite.expiresTimestamp
								.toString()
								.slice(0, -3)}>`
						: "never"
					tempoutput += `at ${createdTimestamp}, till ${expiresTimestamp}, to <#${guildinvite.channelId}>,`
				}
			}

			tempoutput += `uses: ${uses}`

			if (!hasExpired && guildinvite) {
				let maxUses = guildinvite.maxUses.toString()
				if (maxUses === "0") maxUses = `∞`
				tempoutput += `/${maxUses}`
			}

			output += hasExpired ? `\n~~${tempoutput}~~` : `\n${tempoutput}`
		}

		//output += `\nInvites marked as [-] have expired.`
		if (!output) {
			output = "No invites found. "
			if (!showall) output += "Maybe try searching with showall:true?"
		}
		let messages = format.splitMessage(output, 1900, "\n")
		for (let i = 0, len = messages.length; i < len; i++) {
			const data = {
				ephemeral: true,
				content: messages[i],
				allowedMentions: { repliedUser: false, users: [] },
				embeds: [],
			}
			if (i == 0) interaction.editReply(data)
			else interaction.followUp(data)
		}
	},
} satisfies Subcommand
