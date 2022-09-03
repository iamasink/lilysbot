//const Tags = require('../index.js')
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
			logging: true,
		})

		const Tags = sequelize.define('tags', {
			name: {
				type: Sequelize.STRING,
				unique: true,
			},
			description: Sequelize.TEXT,
			username: Sequelize.STRING,
			usage_count: {
				type: Sequelize.INTEGER,
				defaultValue: 0,
				allowNull: false,
			},
		})

		Tags.sync()

		exports.Tags = Tags

		console.log(`Ready! Logged in as ${client.user.tag}`)

	},
}