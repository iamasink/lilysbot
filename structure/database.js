// TODO: backport new database.js to lilysbot etc

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
		console.log(`Setting "${data}" at "${path}"`)

		// try and set the data.
		try {
			res = await process.db.json.set(key, path, data)
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
					console.log("b")
					newpath = path.split(".")
					newpath.pop()
					module.exports.set("." + newpath, {})
					break
				}
				case 'null': { // if it failed to set the value, fix it idk
					console.log("c")
					newpath = path.split(".")
					newpath.pop()
					module.exports.set(newpath.join("."), {}) // go up one layer and set the json stuffs
					module.exports.set(path, data) // try again so its recursive ?? it seemed to work so idk
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
			console.log(`get path: ${path}`)
			return await process.db.json.get(key, { path: path })
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
		console.log(`check path: ${path}`)
		try {
			value = await process.db.json.get(key, { path: path })
		}
		catch (e) {
			console.log("error")
			console.log("m" + e.message)
			if (e.message.substring(e.message.length - 14) == "does not exist") {
				console.log("awawa")
			}
			return false
		}


		console.log("exists")
		return true
	}
}