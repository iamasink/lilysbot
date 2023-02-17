

import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import ApplicationCommand from '../types/ApplicationCommand'
import Snoowrap from 'snoowrap'
import {
	reddit
} from "../config.json"
import https from 'https'
import format from '../utils/format'
import axios from 'axios'


const snoowrap = new Snoowrap({
	userAgent: 'Lilysbot',
	clientId: reddit.clientId,
	clientSecret: reddit.clientSecret,
	username: reddit.username,
	password: reddit.password,
})

export default new ApplicationCommand({
	data: new SlashCommandBuilder()
		.setName('reddit')
		.setDescription('reddit')
		.addStringOption(option => option
			.setName('subreddit')
			.setDescription('Subreddit to retrieve image from')
			.setRequired(true)
		)
		.addStringOption(option => option
			.setName('sort')
			.setDescription('Sort by')
			.addChoices(
				{ name: 'Top', value: 'gif_funny' },
			))
		.addIntegerOption(option => option
			.setName('number')
			.setDescription(`Number of images`)
			.setMinValue(1)
			.setMaxValue(100)
		)
		.addIntegerOption(option => option
			.setName('delay')
			.setDescription(`Number of seconds to wait before sending next image. No effect if number = 1. Default is 5 seconds`)
			.setMinValue(5)
			.setMaxValue(60)
		)
		.addBooleanOption(option => option
			.setName('images')
			.setDescription('Allow non images')
		),
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		const onlyImages = interaction.options.getBoolean('images') || true
		await interaction.deferReply()
		let subreddit = interaction.options.getString('subreddit')
		if (subreddit[1] === `/`) subreddit = subreddit.slice(2)
		const number = interaction.options.getInteger('number') || 1
		for (let i = 0; i < number; i++) {
			let url = ``
			let link = ``
			let count = 0
			let res
			let sub: Snoowrap.Subreddit

			setTimeout(async function () {
				sub = snoowrap.getSubreddit(subreddit)
				snoowrap.getSubreddit(subreddit).getRandomSubmission().then(async submission => {
					res = submission
					console.log(`reddit: ${JSON.stringify(await res)}`)
					console.log(`sub: ${JSON.stringify(sub)}`)
					//console.log(await res)
					link = `https://www.reddit.com${await res.permalink}`
					url = await res.url
					if (url != link) {
						//i = `\nImage: ${res.url}`
					}
					count++


					const result = await axios.get(`https://www.reddit.com/r/${subreddit}/about.json`)
					//const image = await getJSONResponse(result.body)
					let data = result.data
					console.log(data)
					let image = data.icon_img || `https://www.redditinc.com/assets/images/site/reddit-logo.png`

					const embed = new EmbedBuilder()
						.setTitle(`image!`)
						.setColor(`#f9beca`)
						.setDescription(`Link: https://www.reddit.com${res.permalink}${i}\nScore: ${res.score}`)
						.setImage(await res.url)
						.setFooter({ text: `Image from reddit.com/r/${subreddit.toLowerCase()}/`, iconURL: image })

					if (i == 0) await interaction.editReply({ embeds: [embed] })
					else await interaction.followUp({ embeds: [embed] })

				})
			}, i * interaction.options.getInteger('delay') * 1000)
		}
	},
})