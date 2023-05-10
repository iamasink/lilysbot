import { Attachment, AttachmentBuilder, AttachmentData, AuditLogEvent, Events, GuildTextBasedChannel, Interaction, Message, TextChannel } from "discord.js"
import Event from "../types/Event"
import log from "../utils/log";

// Emitted whenever a message is deleted
export default new Event({
	name: Events.MessageUpdate,
	async execute(oldmessage: Message, newmessage: Message) {
		if (oldmessage.partial) return
		if (newmessage.partial) return

		console.log(`a message was updated in <#${oldmessage.channel.id}>.`)

		// stolen from discordjs.guide <3

		// Ignore direct messages
		if (!oldmessage.guild) return

		if (oldmessage.author.bot) return

		if (oldmessage.embeds.length < newmessage.embeds.length) return

		if (oldmessage.attachments != newmessage.attachments) {
			console.log("attachments were changed")

		}


		log.log(oldmessage.guild, `A message (https://discord.com/channels/${oldmessage.guildId}/${oldmessage.channelId}/${oldmessage.id}) was edited by ${oldmessage.author} in ${oldmessage.channel}:\nOld: ${oldmessage.content}\nNew: ${newmessage.content}`)
		console.log("old")
		console.log(oldmessage)
		console.log("new")
		console.log(newmessage)
	},
}
)