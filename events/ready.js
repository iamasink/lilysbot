module.exports = {
	name: 'ready',
	// should the event only run once?
	once: true,
	// event logic, which will be called by the event handler whenever the event emits.
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`)
	},
}