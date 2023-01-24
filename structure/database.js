const redis = require("redis")
const key = "lilybot"


async function connect() {
	console.log("connecting to database...")
	process.db = redis.createClient({ url: "redis://localhost:6379" })
	process.db.on("error", async (err) => {
		console.log(`Redis error: ${err}`)
	})
	await process.db.connect()
	// console.log((await db.json.get(`test`)))

	client.guilds.cache.each(async g => {
		await module.exports.check(`.guilds.${g.id}`)
		await module.exports.check(`.guilds.${g.id}.commands`)
		await module.exports.check(`.guilds.${g.id}.commands.global`)
		await module.exports.check(`.guilds.${g.id}.commands.aliases`)
		await module.exports.check(`.guilds.${g.id}.users`)
		await module.exports.check(`.guilds.${g.id}.roles`)
		await module.exports.check(`.guilds.${g.id}.roles.lists`)
		await module.exports.check(`.guilds.${g.id}.roles.menus`)
	})

}


async function check(path) {

}





module.exports = {
	async connect() {
		connect()
	},
	/**
	 * Set data in the redis database
	 *
	 * @param {string} path The path to the data in JSON Path format (start with .)
	 * @param {*} data The data to be stored
	 */
	async set(path, data) {
		//console.log(`Setting "${JSON.stringify(data)}" at "${path}"`)

		// try and set the data.
		try {
			res = await process.db.json.set(key, path, data)
			//console.log(`redis response: ${res}`)
			if (!res) throw new Error("null")
			//console.log(`success: ${path}`)
		}
		catch (e) {
			// console.log("s" + e.toString())
			// console.log("n" + e.name)
			// console.log("m" + e.message)
			// console.log("c" + e.cause)
			switch (e.message) {
				case 'ERR new objects must be created at the root': {
					console.log("error root")
					newpath = path.split(".")
					newpath.pop()
					await module.exports.set("." + newpath, {})
					break
				}
				case 'null': { // if it failed to set the value, fix it idk
					console.log("error null")
					newpath = path.split(".")
					newpath.pop()
					await module.exports.set(newpath.join("."), {}) // go up one layer and set the json stuffs
					await module.exports.set(path, data) // try again so its recursive ?? it seemed to work so idk
					break
				}
				default: {
					console.log("unhandled error")
					throw new Error(`Redis Error while setting "${data}" at "${path}": "${e.message}"`)
				}
			}

		}


	},
	/**
	 * Get data from the redis database
	 *
	 * @param {string} path The path to the data in JSON Path format (start with .)
	 * @return {*} Returns data from the path
	 */
	async get(path) {
		try {
			//console.log(`get path: ${path}`)
			data = await process.db.json.get(key, { path: path })
			//console.log(`retrieved data ${data} from path ${path}`)
			return data
		}
		catch (e) {
			return
		}

	},
	/**
	 * Delete data from the redis database
	 *
	 * @param {string} path The path to the data in JSON Path format (start with .)
	 */
	async del(path) {
		// console.log(`path: ${path}`)
		try {
			await process.db.json.del(key, path)
		}
		catch (e) {
			console.log(e)
			throw new Error(`Could not delete ${key}: $.${path}.\n${e}`)
		}
	},
	/**
	 * Check if item exists in database
	 *
	 * @param {string} path The path to the data in JSON Path format (start with .)
	 */
	async check(path) {
		//console.log(`check path: ${path}`)
		value = await module.exports.get(path)
		//console.log(`value = ${JSON.stringify(value)}`)
		if (!value) {
			console.log("error")
			await module.exports.set(path, {})
			return false
		}

		//console.log("exists")
		return true
	}
}