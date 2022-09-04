

const Sequelize = require('sequelize')

module.exports = {
	name: 'ready',
	// should the event only run once?
	once: true,
	// event logic, which will be called by the event handler whenever the event emits.
	execute(client) {

		// setup Sequelize database
		const sequelize = new Sequelize('discord', 'root', 'XZL$cWr35&@@BQ2g', {
			host: 'localhost',
			dialect: 'mysql',
			logging: false,
		})

		global.Tags = sequelize.define('tags', {
			guild: Sequelize.STRING,
			name: {
				type: Sequelize.STRING,
				unique: true,
			},
			description: Sequelize.TEXT,
			user: Sequelize.STRING,
			usage_count: {
				type: Sequelize.INTEGER,
				defaultValue: 0,
				allowNull: false,
			},
		})
		global.Tags.sync()

		console.log(`Ready! Logged in as ${client.user.tag}`)

	},
}