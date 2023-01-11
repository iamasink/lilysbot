const { SlashCommandBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder, EmbedBuilder } = require('discord.js')
const commands = require('../../structure/commands')
const GIFEncoder = require('gifencoder')
const { createCanvas } = require('canvas')
const fs = require('fs')
const database = require('../../structure/database')



module.exports = {
	data: new SlashCommandBuilder()
		.setName('test')
		.setDescription('test!')
		.addStringOption(option => option
			.setName('text')
			.setDescription('text lol')
		),
	async execute(interaction) {
		console.log(interaction)
		//await interaction.deferReply()
		if (interaction.user.id !== '303267459824353280') throw new Error

		commands.textToCommandParser()



		// let command = require(`./info`).data
		// console.log(command)
		// console.log(this.data)






		// // const command = interaction.client.commands.get("test")
		// // console.log(command)
		// // commands.run(interaction, "roles", "lists", "get")
		// //await interaction.reply({ content: `a\n${commands.typeResolver("sub_command")}` })
		// if (interaction.options.getString('text')) {

		// 	//interaction.reply(commands.textToCommandParser(interaction.options.getString("text")))

		// } else {
		// 	const encoder = new GIFEncoder(320, 240)
		// 	encoder.start()
		// 	encoder.setRepeat(-1)   // 0 for repeat, -1 for no-repeat
		// 	encoder.setDelay(25)  // frame delay in ms
		// 	encoder.setQuality(25) // image quality. 10 is default.

		// 	// use node-canvas
		// 	const canvas = createCanvas(320, 240)
		// 	const ctx = canvas.getContext('2d')

		// 	framecount = 25
		// 	for (let i = 0; i < framecount; i++) {
		// 		ctx.fillStyle = '#f9beca'
		// 		ctx.fillRect(0, 0, 320, 240)
		// 		// Select the font size and type from one of the natively available fonts
		// 		ctx.font = '60px sans-serif'

		// 		// Select the style that will be used to fill the text in
		// 		ctx.fillStyle = '#ffffff'

		// 		// Actually fill the text with a solid color
		// 		ctx.fillText(interaction.member.displayName, canvas.width / 2.5, canvas.height / 1.8)
		// 		ctx.fillRect(0, 0, (i / framecount) * 320, 240)
		// 		encoder.addFrame(ctx)
		// 	}



		// 	encoder.finish()
		// 	const buf = encoder.out.getData()
		// 	const file = new AttachmentBuilder(buf).setName('file.gif')



		// 	const encoder2 = new GIFEncoder(320, 240)
		// 	encoder2.start()
		// 	encoder2.setRepeat(-1)   // 0 for repeat, -1 for no-repeat
		// 	encoder2.setDelay(25)  // frame delay in ms
		// 	encoder2.setQuality(25) // image quality. 10 is default.

		// 	// use node-canvas
		// 	const canvas2 = createCanvas(320, 240)
		// 	const ctx2 = canvas.getContext('2d')

		// 	framecount2 = 25
		// 	for (let i = 0; i < framecount; i++) {
		// 		ctx.fillStyle = '#ffffff'
		// 		ctx.fillRect(0, 0, 320, 240)
		// 		// Select the font size and type from one of the natively available fonts
		// 		ctx.font = '60px sans-serif'

		// 		// Select the style that will be used to fill the text in
		// 		ctx.fillStyle = '#000000'

		// 		// Actually fill the text with a solid color
		// 		ctx.fillText(interaction.member.displayName, canvas.width / 2.5, canvas.height / 1.8)
		// 		encoder.addFrame(ctx)
		// 	}



		// 	encoder.finish()
		// 	const buf2 = encoder.out.getData()
		// 	const file2 = new AttachmentBuilder(buf).setName('file.gif')


		// 	const exampleEmbed = new EmbedBuilder()
		// 		.setTitle('Some title')
		// 		.setImage('https://i.imgur.com/UxPJaKh.png')

		// 	await interaction.editReply({ embeds: [exampleEmbed] })
		// 	setTimeout(async () => {

		// 		exampleEmbed.setImage('https://i.imgur.com/Lyx4yR6.png')
		// 		const file2 = new AttachmentBuilder(`https://i.imgur.com/NKW4fuf.gif`).setName('file.gif')
		// 		await interaction.editReply({ embeds: [exampleEmbed] })
		// 	}, 1000)



	},
}