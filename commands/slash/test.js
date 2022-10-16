const { SlashCommandBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('test')
		.setDescription('test!'),
	async execute(interaction) {
		const row = new ActionRowBuilder()
			.addComponents(
				new SelectMenuBuilder()
					.setCustomId('select')
					.setPlaceholder('Nothing selected')
					.setMinValues(1)
					.setMaxValues(2)
					.addOptions([
						{
							label: 'Select me',
							value: 'first_option',
							emoji: '🐈'
						},
						{
							label: 'You can select me too',
							value: 'second_option',
						},
						{
							label: 'I am also an option',
							description: 'This is a description as well',
							value: 'third_option',
						},
						{
							label: 'Select me2',
							description: 'This is a description',
							value: 'first_option2',
						},
						{
							label: 'You can select me too2',
							description: 'This is also a description',
							value: 'second_option2',
						},
						{
							label: 'I am also an option2',
							description: 'This is a description as well',
							value: 'third_option2',
						},
						{
							label: 'Select me3',
							description: 'This is a description',
							value: 'first_option3',
						},
						{
							label: 'You can select me too3',
							description: 'This is also a description',
							value: 'second_option3',
						},
						{
							label: 'I am also an option3',
							description: 'This is a description as well',
							value: 'third_option3',
						}
					]),
			)


		row2 = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('sergrhrtshtrshtrs')
					.setLabel('Click me!')
					.setStyle(ButtonStyle.Primary),
			)
		console.log(row.components[0])
		row.components[0].data.type = 6
		await interaction.reply({ content: 'Pong!', components: [row, row2] })
	},
}