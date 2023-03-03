import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import ApplicationCommand from '../types/ApplicationCommand'
import axios from 'axios'
import {
	test
} from "../config.json"
import embeds from '../utils/embeds'
const token = test.authorization
const config = {
	headers: {
		'Authorization': `Bearer ${token}`,
		'Content-Type': "application/json"
	}
}
const entity_id = "light.wiz_rgbw_tunable_b0afb2"

interface bodyParameters {
	entity_id: string
	rgbw_color?: [number, number, number, number]
	brightness_pct?: number
	color_temp_kelvin?: number
}

export default new ApplicationCommand({
	permissions: ["botowner"],
	data: new SlashCommandBuilder()
		.setName('light')
		.setDescription('LOL i hate myself <3')
		.addStringOption(option => option
			.setName('colour')
			.setDescription("hi")
		)
		.addNumberOption(option => option
			.setName('temperature')
			.setDescription('colour temperature in kelvin')
			.setMinValue(2202)
			.setMaxValue(6535)
		)
		.addNumberOption(option => option
			.setName('brightness')
			.setDescription('brightness percent')
			.setMaxValue(0)
			.setMaxValue(100))
		.addBooleanOption(option => option
			.setName('on')
			.setDescription("hi")
		),
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		const colour = interaction.options.getString("colour")
		const on = interaction.options.getBoolean("on")
		const brightness = interaction.options.getNumber('brightness')
		const temperature = interaction.options.getNumber('temperature')
		let service = ''
		let bodyParameters: bodyParameters = { entity_id: entity_id }

		if (colour) {
			const colours = colour.split(",").map(i => parseInt(i))
			bodyParameters.rgbw_color = [colours[0], colours[1], colours[2], 0]
		}
		if (temperature) bodyParameters.color_temp_kelvin = temperature
		if (brightness) bodyParameters.brightness_pct = brightness

		if (on == true || on == undefined) {
			service = 'turn_on'
		} else
			service = 'turn_off'









		console.log(bodyParameters)

		axios.post(
			`http://homeassistant.local:8123/api/services/light/${service}`,
			bodyParameters,
			config
		)
			.catch(console.log)
			.then((res) => {
				console.log(res)
				interaction.reply({ embeds: embeds.successEmbed("success") })
			})

	},
})