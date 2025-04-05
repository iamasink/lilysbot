import {
	Attachment,
	AttachmentBuilder,
	AttachmentData,
	AuditLogEvent,
	Events,
	GuildTextBasedChannel,
	Interaction,
	Message,
	TextChannel,
} from "discord.js"
import Event from "../types/Event"
import log from "../utils/log"
import webhooks from "../utils/webhooks"
import { RawAttachmentData } from "discord.js/typings/rawDataTypes"
import format from "../utils/format"

// Emitted whenever a message is deleted
export default new Event({
	name: Events.MessageDelete,
	async execute(message: Message) {
		// console.log(`a message was deleted in ${message.channel.id}.`)

		// stolen from discordjs.guide <3

		// Ignore direct messages
		if (!message.guild) return
		const fetchedLogs = await message.guild.fetchAuditLogs({
			limit: 1,
			type: AuditLogEvent.MessageDelete,
		})
		if (message.webhookId) {
			// console.log("webhook id " + message.webhookId)
			return
		}
		if (message.author && message.author.bot) return

		// fetch the entry weith the correct id
		let deletionLog
		if (message.author) {
			deletionLog = fetchedLogs.entries.find(
				(e) => e.target.id === message.author.id,
			)
			// console.log(deletionLog)
		}

		// Perform a coherence check to make sure that there's *something*
		if (!deletionLog) {
			console.log("no deletionlog")
			console.log(message)
			let msg: string
			// Discord does not emit an audit log if the person who deleted the message is a bot deleting a single message or is the author of the message itself.
			if (message.author) {
				msg = `A message by ${message.author.username} <@${message.author.id}> was deleted in <#${message.channel.id}>`
				// console.log(msg)
				log.log(message.guild, msg)
			} else {
				msg = `A message by ??? was deleted in <#${message.channel.id}>`
				// console.log(msg)
				log.log(message.guild, msg)
				return
			}
		} else {
			// Now grab the user object of the person who deleted the message
			// Also grab the target of this action to double-check things
			const { executor, target } = deletionLog

			if (target.bot) return

			// Update the output with a bit more information
			// Also run a check to make sure that the log returned was for the same author's message
			if (target.id === message.author.id) {
				console.log(
					`A message by ${message.author.username} <@${message.author.id}> was deleted in <#${message.channel.id}> by ${executor.username}.`,
				)
				log.log(
					message.guild,
					`A message by ${message.author} <@${message.author.id}> was deleted in <#${message.channel.id}> by ${executor}.`,
				)
			}
		}

		const channel = await message.guild.channels.fetch(
			await log.channel(message.guild),
		)

		// console.log(`channel: ${channel}`)
		// console.log(message.attachments)

		let note: string = ""
		let files: AttachmentBuilder[]
		let size: number = 0
		message.attachments.forEach((e) => {
			size += e.size
			// console.log(e.size)
			// console.log(size)
		})
		// console.log(`total filesize: ${size}`)
		if (size < 8_000_000) {
			files = message.attachments.map((e) => new AttachmentBuilder(e.url))
		} else {
			files = []
			note = "\n__Files:__"
			message.attachments.map(
				(e) =>
				(note += `\n[${format.markdownEscape(e.name) ||
					format.markdownEscape(e.url)
					}](${e.url})`),
			)
		}

		let content: string = ""
		let length = message.content.length + note.length
		console.log(length)
		content = message.content + note

		let msgs = format.splitMessage(content, 2000, " ", "[...]", "[...]")


		for (let i = 0, len = msgs.length; i < len; i++) {
			try {
				let msg = msgs[i]
				if (i == msgs.length - 1) {
					// Attach files only to the last one
					await webhooks.send(channel as GuildTextBasedChannel, {
						content: msg,
						username: message.member ? message.member.nickname : message.author.username,
						files: files,
						avatarURL: message.author.avatarURL({ forceStatic: false }),
					})
				} else {
					await webhooks.send(channel as GuildTextBasedChannel, {
						content: msg,
						username: message.member ? message.member.nickname : message.author.username,
						avatarURL: message.author.avatarURL({ forceStatic: false }),
					})
				}
			} catch (e) {
				console.log("failed to log deleted message", e)
				throw new Error(`failed to log deleted message, ${e}`)
			}
		}
	},
})
