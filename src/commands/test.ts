import {
	SlashCommandBuilder,
	ChatInputCommandInteraction,
	ReactionEmoji,
	CommandInteractionOptionResolver
} from 'discord.js'
import ApplicationCommand from '../types/ApplicationCommand'
import calc from '../utils/calc'
import { client } from '..'
import settings from '../utils/settings'
import { RootNodesUnavailableError } from 'redis'

export default new ApplicationCommand({
	permissions: ["KickMembers"],
	data: new SlashCommandBuilder()
		.setName('test')
		.setDescription('testy'),
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		const msg = await interaction.reply({ content: "hi", fetchReply: true })

		const reactioncollector = msg.createReactionCollector({ time: 120000 })


		reactioncollector.on('collect', (reaction, user) => {
			console.log(`Collected ${reaction.emoji.name} from ${user.tag}`)
			console.log(reaction)
			const emoji = client.emojis.cache.find(emoji => emoji.id === reaction.emoji.id)
			console.log(emoji)
			if (!emoji) {
				if (reaction.emoji.id == null) {
					const unicodeEmoji = reaction.emoji.name
					interaction.followUp(`${unicodeEmoji}`)
				} else {
					interaction.followUp("invalid emoji")
				}
			} else {
				interaction.followUp(`${emoji}`)
			}
		})

		reactioncollector.on('end', collected => {
			console.log(`Collected ${collected.size} items`)
		})



	},
}) 