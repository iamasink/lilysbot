import { Channel } from "diagnostics_channel"
import {
	ChannelType,
	Guild,
	GuildTextBasedChannel,
	MessagePayload,
	Webhook,
	WebhookMessageCreateOptions,
} from "discord.js"
import { client } from ".."

export default {
	async send(
		channel: GuildTextBasedChannel,
		message: string | MessagePayload | WebhookMessageCreateOptions,
	) {
		const guild = channel.guild

		console.log(channel.type)
		console.log(ChannelType.GuildText)
		if (channel.type === ChannelType.GuildText) {
			let fetchedWebhook = (await guild.fetchWebhooks()).find(
				(e) =>
					e.channelId === channel.id && e.owner.id === client.user.id,
			)
			let webhook: Webhook

			if (fetchedWebhook) {
				webhook = fetchedWebhook
				console.log(`fetched webhook ${webhook}`)
			} else {
				await channel
					.createWebhook({
						name: `lily's bot webhook for #${channel.name}`,
						avatar: "https://m.yoink.org.uk/r/63e9af9c3f84e65ed6e7a93645d173a5.png",
						reason: `automatic webhook creation to send a webhook message in ${channel.name}`,
					})
					.then((wh) => {
						console.log(`Created webhook ${wh}`)
						webhook = wh
					})
					.catch(console.error)
			}

			return await webhook.send(message)
		} else {
			console.log("invalid channel type.")
		}
	},
}
