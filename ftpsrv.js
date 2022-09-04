const ftp_srv = require("ftp-srv")
const { correctusername, correctpassword } = require("./config.json")

const server = new ftp_srv({
	url: `ftp://0.0.0.0:21`,
	anonymous: false
})

server.on("login", ({ connection, username, password }, resolve, reject) => {
	try {
		if (username == correctusername && password == correctpassword) {
			return resolve({ root: "C:\\" })
		} else {
			return reject(new errors.GeneralError("Invalid username or password", 401))
		}
	} catch (e) {
		console.log(e)
	}
})

server.listen().then(() => {
	console.log("FTP server is starting...")
})