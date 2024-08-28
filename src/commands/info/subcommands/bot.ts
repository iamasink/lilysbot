import { stripIndents } from "common-tags"
import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js"
import { Subcommand } from "../../../types/ApplicationCommand"
import database from "../../../utils/database"

export default {
	name: "bot",
	execute: async (interaction: ChatInputCommandInteraction, client) => {
		const user = client.user
		// console.log(client)

		const users: object = await database.get(".users")
		console.log(Object.keys(users).length)

		const infoEmbed = new EmbedBuilder()
			.setColor(`#f9beca`)
			.setTitle(`__${user.username}#${user.discriminator}__`)
			.setThumbnail(`${user.avatarURL({ forceStatic: false })}?size=4096`)
			//.setAuthor({ name: 'Some name', iconURL: 'https://i.imgur.com/AfFp7pu.png', url: 'https://discord.js.org' })
			.setDescription(
				`**ID**: ${user.id}\n**Created at**: <t:${user.createdTimestamp
					.toString()
					.slice(0, -3)}:f>`,
			)
			.addFields(
				{
					name: "__Stats__",
					value: stripIndents`**Guilds**: ${client.guilds.cache.size}
							**Total Channels**: ${client.channels.cache.size}
							**Total Members**: ${client.users.cache.size}
							**Total Members2**: ${""}`,
				},
				// {
				// 	name: '__System Info__', value:
				// 		stripIndent`

				// 		`
				// 	// **Load**: ${glances.load.min1.toFixed(2)} ${glances.load.min5.toFixed(2)} ${glances.load.min15.toFixed(2)}
				// 	// **Uptime**: ${glances.uptime}
				// 	// **CPU**:
				// 	// 　　*Cores*: ${glances.core.phys} | ${glances.core.log}
				// 	// 　　*Usage*: ${glances.cpu.total}
				// 	// **Memory**:
				// 	// 　　*Used*: ${(glances.mem.used / 1073741824).toFixed(2)}G / ${(glances.mem.total / 1073741824).toFixed(2)}G
				// 	// 　　*Percent*: ${glances.mem.percent}
				// 	// 　　\`${format.bar(0, glances.mem.used, glances.mem.total, 25, true)}\`

				// },
			)
		//
		interaction.reply({ embeds: [infoEmbed] })
	},
} satisfies Subcommand
