const redis = require("redis")
const { spawn } = require('node:child_process')

async function setupGuilds(client) {
	guildData = await process.db.json.get(`guilds`)

	client.guilds.cache.each(async g => {
		await module.exports.check(`guilds`, `.${g.id}`)
		await module.exports.check(`guilds`, `.${g.id}.commands`)
		await module.exports.check(`guilds`, `.${g.id}.commands.global`)
		await module.exports.check(`guilds`, `.${g.id}.commands.aliases`)
		await module.exports.check(`guilds`, `.${g.id}.users`)
		await module.exports.check(`guilds`, `.${g.id}.roles`)
		await module.exports.check(`guilds`, `.${g.id}.roles.lists`)
		await module.exports.check(`guilds`, `.${g.id}.roles.menus`)

		g.members.cache.each(async m => {
			await module.exports.check(`guilds`, `.${g.id}.users.${m.id}`)
			await module.exports.check(`guilds`, `.${g.id}.users.${m.id}.xp`)
		})
	})
}
async function connect() {
	errcount = 0
	process.db = redis.createClient({ url: "redis://localhost:6379" })
	process.db.on("error", async (err) => {
		console.log(`Redis error: ${err}`)
	})
	await process.db.connect()
	// console.log((await db.json.get(`test`)))

}





module.exports = {
	async setupDatabases(client) {
		connect()

		setupGuilds(client, process.db)

	},
	async refreshDatabases(client) {
		setupGuilds(client, process.db)
	},
	async reset(key, path = `$`) {
		await process.db.json.set(key, path, {})
	},
	async set(key, path, data) {
		try {
			await process.db.json.set(key, path, data)
		}
		catch (e) {
			console.log(e)
			throw new Error(`Could not set ${key}: $.${path} to ${data}.\n${e}`)
		}
	},
	async get(key, path) {
		// console.log(`path: ${path}`)
		try {
			return await process.db.json.get(key, { path: path })
		}
		catch (e) {
			console.log(e)
			throw new Error(`Could not retrieve ${key}: $.${path}.\n${e}`)
		}
	},
	async check(key, path) {
		//console.log(`checking ${key}, ${path}`)
		// check if it exists yet
		try {
			v = await module.exports.get(key, path)
			//console.log(`check success: ${path}`)
		}
		catch (e) {
			await module.exports.set(key, path, {})
			//console.log(`check failure: ${path}`)
		}

		// if (await module.exports.get(key, path)) {
		// 	//console.log(`ya`)
		// } else { // if it doesnt, create it
		// 	//console.log(`na`)
		// 	await module.exports.set(key, path, {})
		// }
	},
	async del(key, path) {
		// console.log(`path: ${path}`)
		try {
			await process.db.json.del(key, path)
		}
		catch (e) {
			console.log(e)
			throw new Error(`Could not delete ${key}: $.${path}.\n${e}`)
		}
	},

	async checks(key, paths) {
		// eg paths = ["645053287208452106", "commands", "aliases"]
		console.log(`checks ${key}, ${paths}`)
		path = '.'
		for (i = 0; i < paths.length; i++) {
			if (i == 0) {
				path += paths[i]
			} else {
				path += '.' + paths[i]
			}
			console.log(`path: ${path}`)
			try {
				await module.exports.check(key, path)
			} catch (e) {
				console.log(e)
				throw new Error(`Could not check ${key}: $.${path}.\n${e}`)
			}
		}
	}
}