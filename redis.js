// this is unused
const redis = require("redis");

(async () => {
	const client = redis.createClient({ url: "redis://localhost:6379" })
	client.on("error", async (err) => {
		console.log(`Redis error - ${err}`)
	})

	await client.connect()
	console.log((await client.json.get(`testy`)))
})()