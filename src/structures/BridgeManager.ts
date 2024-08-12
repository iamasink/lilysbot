import {
	AttachmentBuilder,
	GuildTextBasedChannel,
	Message,
	Snowflake,
	TextBasedChannel,
} from "discord.js"
import database from "../utils/database"
import ChannelBridge from "./ChannelBridge"
import { client } from ".."
import format from "../utils/format"
import webhooks from "../utils/webhooks"
import { BridgeSchema } from "../types/Database"

class BridgeManager {
	bridges: ChannelBridge[]

	constructor() {
		this.bridges = []
		this.initialise()
	}

	addBridge(channel1: Snowflake, channel2: Snowflake) {
		const bridge = new ChannelBridge(channel1, channel2)
		this.bridges.push(bridge)
		console.log(
			`Bridge created between channels ${channel1} and ${channel2}`,
		)
		this.saveBridges()
	}

	getBridge(channelId: string): ChannelBridge | undefined {
		const bridge = this.bridges.find((bridge) =>
			bridge.isPartOfBridge(channelId),
		)
		if (bridge) {
			console.log(`Bridge found for channel ${channelId}`)
		} else {
			console.log(`No bridge found for channel ${channelId}`)
		}
		return bridge
	}

	removeBridge(channel1: Snowflake, channel2?: Snowflake) {
		let bridgedBridge
		if (!channel2) {
			bridgedBridge = this.bridges.find((bridge) =>
				bridge.isPartOfBridge(channel1),
			)
		} else {
			bridgedBridge = this.bridges.find(
				(bridge) =>
					bridge.channel1 === channel1 &&
					bridge.channel2 === channel2,
			)
		}
		console.log(bridgedBridge)
		this.bridges.splice(this.bridges.indexOf(bridgedBridge), 1)
		this.saveBridges()
	}

	saveBridges() {
		let bridgedata = []
		for (let i = 0, len = this.bridges.length; i < len; i++) {
			bridgedata.push({
				channel1: this.bridges[i].channel1,
				channel2: this.bridges[i].channel2,
			})
		}
		database.set(".channelbridges", bridgedata)
	}

	// async getBridges(): Promise<any> {
	//     return new Promise((resolve, reject) => {
	//         resolve(database.get(".channelbridges"))
	//     });
	// }

	async initialise() {
		// await database.connect() // there's most likely a better way to do this or place to put this
		const bridges = await database.get<BridgeSchema[]>(".channelbridges")
		if (!bridges?.length) return
		for (let i = 0, len = bridges.length; i < len; i++) {
			this.addBridge(bridges[i].channel1, bridges[i].channel2)
		}
		// console.log(this.bridges = await database.get(".channelbridges"))
	}

	async handleBridgedMessage(message: Message): Promise<void> {
		if (message.author.bot) return
		// Check if the message's channel is part of any bridge
		const bridgedBridge = this.bridges.find((bridge) =>
			bridge.isPartOfBridge(message.channel.id),
		)
		if (bridgedBridge) {
			try {
				const oppositeChannelid = bridgedBridge.getOppositeChannel(
					message.channel.id,
				)
				if (oppositeChannelid) {
					// Logic to handle the opposite channel
					console.log(
						`Message is in a bridged channel. Opposite channel ID: ${oppositeChannelid}`,
					)
					const oppositeChannel = (await client.channels.fetch(
						oppositeChannelid,
					)) as TextBasedChannel

					console.log(message.attachments)

					let note: string = ""
					let files: AttachmentBuilder[]
					let size: number = 0
					message.attachments.forEach((e) => {
						size += e.size
						console.log(e.size)
						console.log(size)
					})
					console.log(`total filesize: ${size}`)
					if (size < 8_000_000) {
						files = message.attachments.map(
							(e) => new AttachmentBuilder(e.url),
						)
					} else {
						files = []
						note = "\n__Files:__"
						message.attachments.map(
							(e) =>
								(note += `\n[${
									format.markdownEscape(e.name) ||
									format.markdownEscape(e.url)
								}](${e.url})`),
						)
					}

					let content: string = ""
					let length = message.content.length + note.length
					console.log(length)
					content = message.content + note

					let msgs = format.splitMessage(
						content,
						2000,
						" ",
						"[...]",
						"[...]",
					)
					for (let i = 0, len = msgs.length; i < len; i++) {
						let msg = msgs[i]
						if (i == msgs.length - 1) {
							// attach files only to the last one
							webhooks.send(
								oppositeChannel as GuildTextBasedChannel,
								{
									content: msgs[i],
									username: `${
										message.member.displayName ||
										message.author.username
									} (bridged by Wiwwie)`,
									files: files,
									avatarURL: message.author.avatarURL({
										forceStatic: false,
									}),
								},
							)
						} else {
							webhooks.send(
								oppositeChannel as GuildTextBasedChannel,
								{
									content: msgs[i],
									username: `${
										message.member.displayName ||
										message.author.username
									} (bridged by Wiwwie)`,
									avatarURL: message.author.avatarURL({
										forceStatic: false,
									}),
								},
							)
						}
					}
				} else {
					console.log(`Opposite channel not found.`)
				}
			} catch (e) {
				console.log("failed to bridge" + e)
			}
		}
	}
}

export default BridgeManager
