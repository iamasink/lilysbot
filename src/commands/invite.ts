import {
	ActionRowBuilder,
	AutocompleteInteraction,
	ButtonBuilder,
	ButtonStyle,
	CategoryChannel,
	ChannelType,
	ChatInputCommandInteraction,
	ComponentType,
	Invite,
	Message,
	SlashCommandBuilder,
	TextChannel,
} from "discord.js"
import ApplicationCommand from "../types/ApplicationCommand"
import { InviteSchema, UserSchema } from "../types/Database"
import database from "../utils/database"
import embeds from "../utils/embeds"
import format from "../utils/format"
import { findBestMatch } from "string-similarity"
import { stripIndents } from "common-tags"

interface funnyinvite {
	inviterId: string
	uses: number
	expired: boolean
	code: string
	name?: string
}

export default new ApplicationCommand({
	permissions: ["Administrator"],
	data: new SlashCommandBuilder()
		.setName("invite")
		.setDescription("Manage server invites")
		.addSubcommand((command) =>
			command
				.setName("list")
				.setDescription("list invites")
				.addBooleanOption((option) =>
					option
						.setName("showall")
						.setDescription(
							"show all invites? by default expired invites without uses are hidden.",
						),
				),
		)
		.addSubcommand((command) =>
			command
				.setName("name")
				.setDescription("Assign a name to an invite")
				.addStringOption((option) =>
					option
						.setName("code")
						.setDescription("The invite to edit")
						.setRequired(true)
						.setAutocomplete(true),
				)
				.addStringOption((option) =>
					option.setName("name").setDescription("the name to assign"),
				),
		)

		.addSubcommand((command) =>
			command
				.setName("delete")
				.setDescription(
					"permanently and irreversibly deletes an invite",
				)
				.addStringOption((option) =>
					option
						.setName("code")
						.setDescription("The invite to delete")
						.setRequired(true)
						.setAutocomplete(true),
				),
		)

		.addSubcommand((command) =>
			command
				.setName("create")
				.setDescription("create a new invite.")
				.addStringOption((option) =>
					option.setName("name").setDescription("name of the invite"),
				)
				.addChannelOption((option) =>
					option
						.setName("channel")
						.setDescription("the channel to invite to"),
				)
				.addIntegerOption((option) =>
					option
						.setName("length")
						.setDescription(
							"How long the invite should last. Defaults to forever",
						)
						.addChoices(
							{ name: "30 minutes", value: 60 * 30 },
							{ name: "1 hour", value: 60 * 60 },
							{ name: "6 hours", value: 60 * 60 * 6 },
							{ name: "12 hours", value: 60 * 60 * 12 },
							{ name: "1 day", value: 60 * 60 * 24 },
							{ name: "7 days", value: 60 * 60 * 24 * 7 },
							{ name: "Forever", value: 0 },
						),
				)
				.addIntegerOption((option) =>
					option
						.setName("maxuses")
						.setDescription(
							"Maximum number of uses. Defaults to infinite",
						),
				),
		)

		.addSubcommand((command) =>
			command
				.setName("details")
				.setDescription("get details for an invite")
				.addStringOption((option) =>
					option
						.setName("code")
						.setDescription("the invite to query")
						.setRequired(true)
						.setAutocomplete(true),
				),
		),

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		switch (interaction.options.getSubcommand()) {
			case "list": {
				await interaction.reply({
					ephemeral: true,
					embeds: embeds.messageEmbed("listing invites..."),
				})
				const invitelist = await database.get<InviteSchema[]>(
					`.guilds.${interaction.guild.id}.invites`,
				)
				// console.log(invitelist)
				var output = ""

				for (let i in invitelist) {
					// console.log(i)
					const invite = invitelist[i]
					const code = i
					const name = invite.name ? `${invite.name} - ` : ""
					const hasExpired = invite.expired
					const uses = invite.uses
					const showall = interaction.options.getBoolean("showall")
					// console.log(code, name, hasExpired, uses)
					// console.log(invite.inviterId)
					const inviter = await interaction.client.users.fetch(
						invite.inviterId,
					)
					var tempoutput = ``

					if (hasExpired && uses === 0 && !showall) continue

					tempoutput += `${name}\`${code}\`, by \`${inviter.username}\` (<@${inviter.id}>),`

					let guildinvite: Invite

					if (!hasExpired) {
						guildinvite = await interaction.guild.invites.fetch(
							code,
						)
						const createdTimestamp = `<t:${guildinvite.createdTimestamp
							.toString()
							.slice(0, -3)}>`
						let expiresTimestamp = ``
						if (guildinvite.expiresTimestamp) {
							expiresTimestamp = `<t:${await guildinvite.expiresTimestamp
								.toString()
								.slice(0, -3)}>`
						} else {
							expiresTimestamp = `never`
						}
						tempoutput += `at ${createdTimestamp}, till ${expiresTimestamp}, to <#${guildinvite.channelId}>,`
					}

					tempoutput += `uses: ${uses}`
					if (!hasExpired) {
						guildinvite = await interaction.guild.invites.fetch(
							code,
						)
						// console.log(guildinvite)
						var maxUses = guildinvite.maxUses.toString()
						if (maxUses == "0") maxUses = `∞`
						tempoutput += `/${maxUses}`
					}
					if (hasExpired) {
						output += `\n~~${tempoutput}~~`
					} else {
						output += `\n${tempoutput}`
					}
				}

				//output += `\nInvites marked as [-] have expired.`
				let messages = format.splitMessage(output, 1900, "\n")
				for (let i = 0, len = messages.length; i < len; i++) {
					interaction.followUp({
						ephemeral: true,
						content: messages[i],
						allowedMentions: { repliedUser: false, users: [] },
					})
				}

				break
			}
			case "name": {
				const guild = interaction.guild
				const code = interaction.options.getString("code")
				const name = interaction.options.getString("name")

				if (
					!(await database.get(`.guilds.${guild.id}.invites.${code}`))
				) {
					interaction.reply({
						ephemeral: true,
						embeds: embeds.warningEmbed(`Invalid Invite`),
					})
					return
				}
				database.set(`.guilds.${guild.id}.invites.${code}.name`, name)
				interaction.reply({
					ephemeral: true,
					embeds: embeds.successEmbed(
						`Invite Renamed`,
						`Invite \`${code}\` renamed to \`${name}\``,
					),
				})

				break
			}
			case "delete": {
				const guild = interaction.guild
				const code = interaction.options.getString("code")
				const invites = await interaction.guild.invites.fetch()

				// console.log(code)

				// find the invite in the server, it must be from the server and not from the database because this only removes invites from servers. database info stays :)
				const invite = invites.find((invite) => invite.code === code)

				// warn for stuff
				if (!invite) {
					interaction.reply({
						ephemeral: true,
						embeds: embeds.warningEmbed(`Invalid Invite`),
					})
					return
				}
				if (!invite.deletable) {
					interaction.reply({
						ephemeral: true,
						embeds: embeds.warningEmbed(
							`Invite could not be deleted.`,
							`Invite \`${code}\` couldn't be deleted.\nDoes it not exist or do I not have permission?`,
						),
					})
					return
				}

				// create actionrow with confirm, delete button
				const row = new ActionRowBuilder<ButtonBuilder>()
					.addComponents(
						new ButtonBuilder()
							.setCustomId("invite-confirmdelete")
							.setLabel("Delete")
							.setStyle(ButtonStyle.Danger),
					)
					.addComponents(
						new ButtonBuilder()
							.setCustomId("invite-canceldelete")
							.setLabel("Cancel")
							.setStyle(ButtonStyle.Secondary),
					)

				// create confirm reply, fetch the message
				let msg = await interaction.reply({
					embeds: embeds.warningEmbed(
						"Are you sure?",
						`Are you sure you want to delete invite \`${code}\`?`,
					),
					components: [row],
					ephemeral: true,
					fetchReply: true,
				})

				console.log(msg)

				// collect for button interactions for time from fetched interaction msg
				const collector = msg.createMessageComponentCollector({
					componentType: ComponentType.Button,
					time: 0.1 * 60 * 1000,
				})

				let message

				// when a button is collected
				collector.on("collect", async (i) => {
					// double check its the correct user (is this needed? its ephemeral)
					if (i.user.id === interaction.user.id) {
						console.log(
							`${i.user.id} clicked on the ${i.customId} button.`,
						)

						// complete action based on input
						if (i.customId == "invite-confirmdelete") {
							invite.delete()
							message = {
								embeds: embeds.successEmbed(
									`Invite Deleted`,
									`Invite \`${code}\` deleted`,
								),
								components: [],
							}
						} else if (i.customId == "invite-canceldelete") {
							message = {
								embeds: embeds.messageEmbed(
									`Invite Deletion Canceled`,
									`Invite \`${code}\``,
								),
								components: [],
							}
						} else {
							return
						}

						if (interaction.replied) {
							// edit the original confirmation message
							await interaction.editReply(message)
							// stop the collector with reason "done"
							collector.stop("done")
						}
					}
				})

				// when collector ends, from .stop() or from timeout,
				collector.on("end", async (collected, reason) => {
					// if the reason was from collector.stop("done"), return
					if (reason == "done") return
					// otherwise cancel the message
					msg.edit({
						embeds: embeds.messageEmbed(
							`Invite Deletion Canceled`,
							`Invite \`${code}\``,
						),
						components: [],
					})
				})

				break
			}

			case "create": {
				const name = interaction.options.getString("name")
				const channel =
					interaction.options.getChannel("channel") ||
					(await interaction.guild.channels.fetch(
						interaction.guild.systemChannelId,
					))
				const length = interaction.options.getInteger("length") || 0
				const maxuses = interaction.options.getInteger("maxuses") || 0

				if (
					channel.type == ChannelType.GuildCategory ||
					channel.type == ChannelType.GuildDirectory ||
					channel.type == ChannelType.PublicThread ||
					channel.type == ChannelType.PrivateThread
				) {
					await interaction.reply({
						ephemeral: true,
						embeds: embeds.warningEmbed(
							"The channel you selected is of an invalid type.",
						),
					})
				}

				;(channel as TextChannel)
					.createInvite({
						unique: true,
						maxAge: length,
						maxUses: maxuses,
						reason: "invite create command",
					})
					.then(async (invite) => {
						console.log(
							`Created an invite with a code of ${invite.code}`,
						)
						console.log(invite)
						if (name) {
							// the database entry will be created because the event inviteCreate is emitted
							await database.set(
								`.guilds.${interaction.guild.id}.invites.${invite.code}.name`,
								name,
							)
							await interaction.reply({
								ephemeral: true,
								embeds: embeds.successEmbed(
									`Created Invite`,
									`Created Invite with name \`${name}\`, to channel ${channel}.`,
								),
							})
						} else {
							await interaction.reply({
								ephemeral: true,
								embeds: embeds.successEmbed(
									`Created Invite`,
									`Created Invite to channel ${channel}.`,
								),
							})
						}
						await interaction.followUp({
							ephemeral: true,
							content: `https://discord.gg/${invite.code}`,
						})
					})
				break
			}

			case "details": {
				const guild = interaction.guild
				const code = interaction.options.getString("code")

				const invites = await interaction.guild.invites.fetch()
				const invite: Invite = invites.find(
					(invite) => invite.code === code,
				)
				if (
					!(await database.get(`.guilds.${guild.id}.invites.${code}`))
				) {
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

				break
			}
			default: {
				break
			}
		}
	},
	async autocomplete(interaction: AutocompleteInteraction) {
		const focusedOption = interaction.options.getFocused(true)
		// console.log(focusedOption)
		switch (focusedOption.name) {
			case "code": {
				break
			}
			default: {
				// console.log("uh oh stinky")
				throw new Error(
					"something went wrong, you can't autocomplete this??",
				)
			}
		}

		const invites = await database.get(
			`.guilds.${interaction.guild.id}.invites`,
		)

		//convert to array of objects (from object of objects)
		var invitesArray: funnyinvite[] = Object.keys(invites).map((key) => {
			return invites[key]
		})
		for (let i in invitesArray) {
			// console.log("awaw")
			// console.log(i)
			// console.log(invitesArray[i])
		}

		// add the name of each invite and username to the invites as a new array
		let arrayWithNames = invitesArray.map((i) => {
			let output = i.code
			if (i.name) {
				output += ` - ${i.name}`
			}
			return output
		})

		const matches = findBestMatch(focusedOption.value, arrayWithNames)
		// console.log(matches)
		let filtered = []

		if (matches.bestMatch.rating === 0) {
			filtered = arrayWithNames.sort((a, b) => {
				return b.length - a.length
			})
			// console.log(filtered)
		} else {
			let sorted = matches.ratings.sort((a, b) => {
				return b.rating - a.rating
			})
			// console.log("sorted:")
			// console.log(sorted)
			filtered = sorted.map((i) => i.target)
		}

		var shortfiltered = filtered
		if (filtered.length > 10) {
			shortfiltered = filtered.slice(0, 5)
		}
		var response = shortfiltered.map((choice) => {
			const name = choice
			// console.log(name)
			const value = choice.split(" ")[0]

			return { name: name, value: value }
		})
		// console.log(response)
		await interaction.respond(response)
	},
})
