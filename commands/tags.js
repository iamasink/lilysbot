const { SlashCommandBuilder } = require('discord.js')
const Tags = require('../events/ready.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('tags')
		.setDescription('Edit tags')
		.addSubcommand(subcommand =>
			subcommand.setName('add')
				.setDescription('subcommand description')

				.addStringOption(option =>
					option.setName('2name')
						.setDescription('a description'))
				.addStringOption(option =>
					option.setName('2description')
						.setDescription('a description'))

		)
		.addSubcommand(subcommand =>
			subcommand.setName('tag')
				.setDescription('subcommand description')


				.addStringOption(option =>
					option.setName('3name')
						.setDescription('a description'))

		)
		.addSubcommand(subcommand =>
			subcommand.setName('edit')
				.setDescription('subcommand description')

				.addStringOption(option =>
					option.setName('4name')
						.setDescription('a description'))

				.addStringOption(option =>
					option.setName('4description')
						.setDescription('a description'))

		)
		.addSubcommand(subcommand =>
			subcommand.setName('info')
				.setDescription('subcommand description')
				.addStringOption(option =>
					option.setName('5name')
						.setDescription('a description'))

		)
		.addSubcommand(subcommand =>
			subcommand.setName('list')
				.setDescription('subcommand description')
				.setDescription('a description')

		)
		.addSubcommand(subcommand =>
			subcommand.setName('remove')
				.setDescription('subcommand description')
				.addStringOption(option =>
					option.setName('6name')
						.setDescription('a description'))

		),


	async execute(interaction) {
		switch (interaction.options.getSubcommand()) {
			case 'add': {
				const tagName = interaction.options.getString('2name')
				const tagDescription = interaction.options.getString('2description')

				try {
					// equivalent to: INSERT INTO tags (name, description, username) values (?, ?, ?);
					const tag = await Tags.create({
						name: tagName,
						description: tagDescription,
						username: interaction.author.username,
					})

					return interaction.reply(`Tag ${tag.name} added.`)
				} catch (error) {
					if (error.name === 'SequelizeUniqueConstraintError') {
						return interaction.reply('That tag already exists.')
					}

					return interaction.reply(`Something went wrong with adding a tag.\nError- ${error}`)
				}
			}
			case 'tag': {
				const tagName = interaction.options.getString('3name')

				// equivalent to: SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
				const tag = await Tags.findOne({ where: { name: tagName } })

				if (tag) {
					// equivalent to: UPDATE tags SET usage_count = usage_count + 1 WHERE name = 'tagName';
					tag.increment('usage_count')
					return interaction.reply(tag.get('description'))
				}

				return interaction.reply(`Could not find tag: ${tagName}`)
			} case 'edit': {
				const tagName = interaction.options.getString('4name')
				const tagDescription = interaction.options.getString('4description')

				// equivalent to: UPDATE tags (description) values (?) WHERE name = ?;
				const affectedRows = await Tags.update({ description: tagDescription }, { where: { name: tagName } })

				if (affectedRows > 0) {
					return interaction.reply(`Tag ${tagName} was edited.`)
				}

				return interaction.reply(`Could not find a tag with name ${tagName}.`)
			} case 'info': {
				const tagName = interaction.options.getString('5name')

				// equivalent to: SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
				const tag = await Tags.findOne({ where: { name: tagName } })

				if (tag) {
					return interaction.reply(`${tagName} was created by ${tag.username} at ${tag.createdAt} and has been used ${tag.usage_count} times.`)
				}

				return interaction.reply(`Could not find tag: ${tagName}`)
			} case 'list': {
				const tagList = await Tags.findAll({ attributes: ['name'] })
				const tagString = tagList.map(t => t.name).join(', ') || 'No tags set.'

				return interaction.reply(`List of tags: ${tagString}`)
			} case 'remove': {
				// equivalent to: DELETE from tags WHERE name = ?;
				const tagName = interaction.options.getString('6name')
				const rowCount = await Tags.destroy({ where: { name: tagName } })

				if (!rowCount) return interaction.reply('That tag did not exist.')

				return interaction.reply('Tag deleted.')
			}
		}
	},
}