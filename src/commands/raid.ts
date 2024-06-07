import { ChatInputCommandInteraction, GuildFeature, SlashCommandBuilder } from 'discord.js'
import ApplicationCommand from '../types/ApplicationCommand'
import embeds from '../utils/embeds'
import format from '../utils/format'

export default new ApplicationCommand({
	permissions: ["botowner"],
	data: new SlashCommandBuilder()
		.setName('raid')
		.setDescription('Configure anti-raid measures')
		.addSubcommand(command => command
			.setName('kick')
			.setDescription("kick members")
			.addStringOption(option => option
				.setName('kickoption')
				.setDescription('members to kick')
				.addChoices(
					{ name: 'Pending', value: 'pending' },
					{ name: 'No Avatar', value: 'no_avatar' },
				)
			)
			.addBooleanOption(option => option
				.setName("dryrun")
				.setDescription("don't actually do anything, just list"))

		)
		.addSubcommand(option => option
			.setName("pauseinvites")
			.setDescription("pause invites for a period of time")
			.addNumberOption(option => option
				.setName("minutes")
				.setDescription("how many minutes to pause invites for")
			)
		)
		.addSubcommand(option => option
			.setName("resumeinvites")
			.setDescription("resume invites")
		)
	,
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		switch (interaction.options.getSubcommand()) {
			case 'kick': {
				const option = interaction.options.getString("kickoption")
				const isDryRun = interaction.options.getBoolean("dryrun")
				console.log(option)

				interaction.reply("Kicking members...")
				let toban = []
				const memberlist = await interaction.guild.members.fetch()
				console.log(memberlist.size)
				memberlist.forEach(async member => {
					switch (option) {
						case 'pending': {
							if (member.pending) {
								if (!isDryRun) {
									await member.kick()
								}
								toban.push(member.user.id)
								console.log(`kicked member ${format.shittyUsername(member.user)}`)

							}
							break
						}
						case 'no_avatar': {
							if (!member.user.avatarURL()) {
								// await member.kick()
								toban.push(member.user.id)
								console.log(`kicked member: ${format.shittyUsername(member.user)}`)
							}
							break
						}
						default: {
							console.log("invalid option")
							break
						}
					}

				})


				console.log(toban.length)
				new Promise((resolveInner) => {
					setTimeout(resolveInner, 1000)
				}).then(onfulfilled => {
					interaction.editReply("finished")
				})
				break
			}
			case 'pauseinvites': {
				const time = interaction.options.getNumber('minutes')
				if (time) {
					throw new Error("time isn't implemented yet")
				}
				console.log(interaction.guild.features)
				const currentfeatures = interaction.guild.features
				const newfeatures = currentfeatures.filter(e => e !== "INVITES_DISABLED")
				newfeatures.push("INVITES_DISABLED")
				console.log(newfeatures)
				await interaction.guild.edit({ features: [...newfeatures] })
				console.log(interaction.guild.features)
				interaction.reply({ embeds: embeds.messageEmbed(":pause_button: Invites have been paused for this server", null, null, "#ff0000") })
				break
			}
			case 'resumeinvites': {
				console.log(interaction.guild.features)
				const currentfeatures = interaction.guild.features
				const newfeatures = currentfeatures.filter(e => e !== "INVITES_DISABLED")
				console.log(newfeatures)
				await interaction.guild.edit({ features: [...newfeatures] })
				console.log(interaction.guild.features)
				interaction.reply({ embeds: embeds.successEmbed(":arrow_forward: Invites have been resumed for this server") })
				break
			}

		}
	}
})