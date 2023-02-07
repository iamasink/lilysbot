"use strict";
// const { SlashCommandBuilder } = require('discord.js')
// const embeds = require('../../structure/embeds')
// module.exports = {
// 	data: new SlashCommandBuilder()
// 		.setName('tags')
// 		.setDescription('Edit tags')
// 		.addSubcommand((subcommand: any) => subcommand
// 			.setName('add')
// 			.setDescription('subcommand description')
// 			.addStringOption((option: any) => option
// 				.setName('2name')
// 				.setDescription('a description'))
// 			.addStringOption((option: any) => option
// 				.setName('2description')
// 				.setDescription('a description'))
// 		)
// 		.addSubcommand((subcommand: any) => subcommand
// 			.setName('tag')
// 			.setDescription('subcommand description')
// 			.addStringOption((option: any) => option
// 				.setName('3name')
// 				.setDescription('a description'))
// 		)
// 		.addSubcommand((subcommand: any) => subcommand
// 			.setName('edit')
// 			.setDescription('subcommand description')
// 			.addStringOption((option: any) => option
// 				.setName('4name')
// 				.setDescription('a description'))
// 			.addStringOption((option: any) => option
// 				.setName('4description')
// 				.setDescription('a description'))
// 		)
// 		.addSubcommand((subcommand: any) => subcommand
// 			.setName('info')
// 			.setDescription('subcommand description')
// 			.addStringOption((option: any) => option
// 				.setName('5name')
// 				.setDescription('a description'))
// 		)
// 		.addSubcommand((subcommand: any) => subcommand
// 			.setName('list')
// 			.setDescription('subcommand description')
// 			.setDescription('a description')
// 		)
// 		.addSubcommand((subcommand: any) => subcommand
// 			.setName('remove')
// 			.setDescription('subcommand description')
// 			.addStringOption((option: any) => option
// 				.setName('6name')
// 				.setDescription('a description'))
// 		),
// 	async execute(interaction: any) {
// 		switch (interaction.options.getSubcommand()) {
// 			case 'add': {
// 				const tagGuild = interaction.guild.id
// 				const tagName = interaction.options.getString('2name')
// 				const tagDescription = interaction.options.getString('2description')
// 				const tagUser = interaction.user.id
// 				try {
// 					// equivalent to: INSERT INTO tags (name, description, username) values (?, ?, ?);
// 					const tag = await global.Tags.create({
// 						guild: tagGuild,
// 						name: tagName,
// 						description: tagDescription,
// 						user: tagUser,
// 					})
// 					return interaction.reply(`Tag ${tag.name} added.`)
// 				} catch (error) {
// 					if (error.name === 'SequelizeUniqueConstraintError') {
// 						return interaction.reply({ embeds: embeds.errorEmbed(`Adding tag \`${tagName}\``, `That tag already exists!\n${error}`), ephemeral: true })
// 					}
// 					return interaction.reply({ embeds: embeds.errorEmbed(`Adding tag ${tagName}`, `${error}`) })
// 				}
// 			}
// 			case 'tag': {
// 				const tagName = interaction.options.getString('3name')
// 				// equivalent to: SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
// 				const tag = await Tags.findOne({ where: { guild: interaction.guild.id, name: tagName } })
// 				if (tag) {
// 					// equivalent to: UPDATE tags SET usage_count = usage_count + 1 WHERE name = 'tagName';
// 					tag.increment('usage_count')
// 					return interaction.reply({ embeds: embeds.messageEmbed(tag.get('name'), tag.get('description')) })
// 				}
// 				return interaction.reply(`Could not find tag: ${tagName}`)
// 			} case 'edit': {
// 				const tagName = interaction.options.getString('4name')
// 				const tagDescription = interaction.options.getString('4description')
// 				// equivalent to: UPDATE tags (description) values (?) WHERE name = ?;
// 				const affectedRows = await Tags.update({ description: tagDescription }, { where: { guild: interaction.guild.id, name: tagName } })
// 				if (affectedRows > 0) {
// 					return interaction.reply(`Tag ${tagName} was edited.`)
// 				}
// 				return interaction.reply(`Could not find a tag with name ${tagName}.`)
// 			} case 'info': {
// 				const tagName = interaction.options.getString('5name')
// 				// equivalent to: SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
// 				const tag = await Tags.findOne({ where: { guild: interaction.guild.id, name: tagName } })
// 				if (tag) {
// 					return interaction.reply(`\`${tagName}\` was created by ${interaction.guild.members.resolve(tag.user)} (${tag.user}) at ${tag.createdAt} and has been used ${tag.usage_count} times.`)
// 				}
// 				return interaction.reply(`Could not find tag: ${tagName}`)
// 			} case 'list': {
// 				const tagList = await Tags.findAll({
// 					where: { guild: interaction.guild.id },
// 					attributes: { include: ['name'] }
// 				})
// 				const tagString = tagList.map(t => `${t.name}@${t.guild}`).join('\n') || 'No tags set.'
// 				return interaction.reply({ embeds: embeds.messageEmbed(`List of tags: `, `${tagString}`) })
// 			} case 'remove': {
// 				// equivalent to: DELETE from tags WHERE name = ?;
// 				const tagName = interaction.options.getString('6name')
// 				const rowCount = await Tags.destroy({ where: { guild: interaction.guild.id, name: tagName } })
// 				if (!rowCount) return interaction.reply('That tag did not exist.')
// 				return interaction.reply('Tag deleted.')
// 			}
// 		}
// 	},
// }
