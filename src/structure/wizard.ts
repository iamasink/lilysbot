const embeds = require('./embeds')

export default {
	async input(interaction, title, description) {
		await interaction.followUp({ embeds: embeds.messageEmbed(title), ephemeral: true }).then(msg => {
			// `m` is a message object that will be passed through the filter function
			const filter = m => m.author === interaction.user
			const collector = interaction.channel.createMessageCollector({ filter, time: 60000 })
			collector.on('collect', m => {
				console.log(`Collected ${m.content}`)
				console.log(m)
				collector.stop()
				return m.content
			})

			collector.on('end', collected => {
				console.log(`Collected ${collected.size} items`)
				if (collected.size === 0) {
					interaction.followUp({ embeds: embeds.errorEmbed('No name supplied. Cancelling.'), ephemeral: true })
				}
			})
		})
	}
}