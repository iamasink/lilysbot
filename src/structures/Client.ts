import { Client, Collection } from "discord.js"
import { token } from "../config.json"
import { readdirSync } from "fs"
import path from "node:path"
import ApplicationCommand from "../types/ApplicationCommand"
import Event from "../types/Event"
import commands from "../utils/commands"
import database from "../utils/database"
import BridgeManager from './BridgeManager'

// Bot is a class which extends discord.js Client,
// it is called in index.ts 
export class Bot extends Client {
	commands: Collection<string, ApplicationCommand> = new Collection()
	bridgeManager: BridgeManager
	constructor(options) {
		super(options)
		// this.bridgeManager = new BridgeManager()
	}

	// function to login and start the bot
	start() {
		database.connect()
		this.register()
		this.login(token)
		console.log("starting!")
	}

	// function to register commands and events
	async register() {
		// register commands
		const commandfilepath = path.join(__dirname, '..', 'commands')
		console.log(commandfilepath)
		const commandFiles: string[] = readdirSync(commandfilepath).filter(
			(file) => file.endsWith('.js') || file.endsWith('.ts')
		)
		console.log(commandFiles)

		commandFiles.forEach(async file => {
			console.log(file)
			const command: ApplicationCommand = (await import(`../commands/${file}`)).default as ApplicationCommand
			this.commands.set(command.data.name, command)
		})

		// register events
		const filepath = path.join(__dirname, '..', 'events')
		console.log(filepath)
		const eventFiles: string[] = readdirSync(filepath).filter(
			(file) => file.endsWith('.js') || file.endsWith('.ts')
		)
		console.log(eventFiles)

		eventFiles.forEach(async file => {
			console.log(file)
			const event: Event = (await import(`../events/${file}`)).default as Event
			if (event.once) {
				this.once(event.name, (...args) => event.execute(...args))
			} else {
				this.on(event.name, (...args) => event.execute(...args))
			}
		})
	}
}
