import { Emoji, EmojiResolvable } from "discord.js"
import { client } from ".."

export default {
	getEmoji(emoji: Emoji): Emoji | string {
		const foundEmoji = client.emojis.cache.find((e) => e.id === emoji.id)
		if (foundEmoji) return foundEmoji
		if (emoji.id == null) {
			const unicodeEmoji = emoji.name
			return unicodeEmoji
		} else {
			console.log("this emoji isn't available..")
			return null
		}
	},
	getEmojiId(emoji: Emoji): string {
		const foundEmoji = client.emojis.cache.find((e) => e.id === emoji.id)
		if (foundEmoji) return foundEmoji.id
		if (emoji.id == null) {
			const unicodeEmoji = emoji.name
			return unicodeEmoji
		} else {
			console.log("this emoji isn't available..")
			return null
		}
	},
}
