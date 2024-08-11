import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChatInputCommandInteraction,
	ComponentType,
	GuildTextBasedChannel,
	ModalActionRowComponentBuilder,
	ModalBuilder,
	SlashCommandBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js"
import ApplicationCommand from "../types/ApplicationCommand"
import embeds from "../utils/embeds"
import { Octokit } from "@octokit/rest"
import { client } from ".."
import config from "../config.json"
import format from "../utils/format"
import error from "./error"
import { stripIndents } from "common-tags"

export default new ApplicationCommand({
	permissions: ["botowner"],
	data: new SlashCommandBuilder()
		.setName("issue")
		.setDescription("Report an issue"),
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		const modal = new ModalBuilder()
			.setCustomId("myModal")
			.setTitle("Reporting an Issue")

		// Add components to modal

		// Create the text input components
		const reportInputTitle = new TextInputBuilder()
			.setCustomId("errorReportModalTitleField")
			// The label is the prompt the user sees for this input
			.setLabel("Title")
			// Short means only a single line of text
			.setStyle(TextInputStyle.Short)
			.setRequired(true)
			.setPlaceholder("Write a short title for the issue")
			.setMaxLength(50)
		const reportInputDescription = new TextInputBuilder()
			.setCustomId("errorReportModalDescriptionField")
			// The label is the prompt the user sees for this input
			.setLabel("Description")
			// Short means only a single line of text
			// Paragraph means multiple lines etc
			.setStyle(TextInputStyle.Paragraph)
			.setRequired(true)
			.setPlaceholder(
				"Write a description for the issue. What went wrong? What's broken?",
			)
			.setMaxLength(1800)
			.setMinLength(20)

		// An action row only holds one text input,
		// so you need one action row per text input.
		const firstActionRow =
			new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
				reportInputTitle,
			)
		const secondActionRow =
			new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
				reportInputDescription,
			)

		// Add inputs to the modal
		modal.addComponents(firstActionRow)
		modal.addComponents(secondActionRow)

		// Show the modal to the user
		await interaction.showModal(modal)

		interaction
			.awaitModalSubmit({ time: 5 * 60 * 1000 })
			.then(async (i) => {
				i.deferReply({ ephemeral: true })
				console.log(" i recieved it ghsfdjg")
				console.log(interaction)
				console.log(i)

				// try {
				//     if (interaction.replied) interaction.deleteReply()
				// } catch (e) {
				//     console.log(e)
				// }
				const userissuetitle = i.fields.getTextInputValue(
					"errorReportModalTitleField",
				)
				const userissuedesc = i.fields.getTextInputValue(
					"errorReportModalDescriptionField",
				)
				const content = stripIndents`
                Reported by: \`${interaction.user.username} (${interaction.user.id})\`
                User's Message: \`\`\`${userissuedesc}\`\`\`
                `

				client.channels
					.fetch("767026023387758612")
					.then((channel: GuildTextBasedChannel) => {
						console.log("channel" + channel.name)
						channel.send(content)
					})

				// create an github issue from the error report
				const octokit = new Octokit({
					auth: config.github.token,
				})

				let title = format.cutToLength(`${userissuetitle}`, 250)

				octokit.issues
					.create({
						owner: "iamasink",
						repo: "lilysbot",
						title: title,
						body: content,
						labels: ["from discord"],
					})
					.then(async (res) => {
						await i.editReply({
							embeds: embeds.successEmbed(
								`Thank you for your submission!\nLink: ${res.data.html_url}`,
							),
						})
					})
			})
			.catch((err) => console.log("error" + err))
	},
})
