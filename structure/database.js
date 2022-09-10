const redis = require("redis")

async function setupGuilds(client, db) {
	guildData = await db.json.get(`guilds`)

	client.guilds.cache.each(g => {
		if (Object.hasOwn(guildData, g.id)) {
			// console.log("yay")
		} else {
			guildData[g.id] = {
				exists: true,
				users: {}
			}
		}
	})
	await db.json.set(`guilds`, `$`, guildData)

	client.guilds.cache.each(g => {
		g.members.cache.each(m => {
			module.exports.check(`guilds`, `.${g.id}.users.${m.id}`)
		})
	})
}


module.exports = {
	async setupDatabases(client) {
		db = redis.createClient({ url: "redis://localhost:6379" })
		db.on("error", async (err) => {
			console.log("Redis error: " + err)
		})
		await db.connect()
		// console.log((await db.json.get(`test`)))

		setupGuilds(client, db)

	},
	async refreshDatabases(client) {
		setupGuilds(client, db)
	},
	async reset(key, path = `$`) {
		await db.json.set(key, path, {})
	},
	async set(key, path, data) {
		try {
			await db.json.set(key, path, data)
		}
		catch (e) {
			console.log(e)
		}
	},
	async get(key, path = `$`) {
		// console.log(`path: ${path}`)
		try {
			return await db.json.get(key, { path: path })
		}
		catch (e) {
			console.log(e)
		}
	},
	async check(key, path) {
		// check if it exists yet
		if (await module.exports.get(key, path)) {
			// console.log(`ya`)
		} else { // if it doesnt, create it
			// console.log(`na`)
			await module.exports.set(key, path, {})
		}
	}
}