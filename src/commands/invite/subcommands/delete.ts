import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChatInputCommandInteraction,
	ComponentType,
} from "discord.js"
import { Subcommand } from "../../../types/ApplicationCommand"
import embeds from "../../../utils/embeds"

export default {
	name: "delete",
	async execute(interaction: ChatInputCommandInteraction) {
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
				console.log(`${i.user.id} clicked on the ${i.customId} button.`)

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
	},
} satisfies Subcommand
