"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, ActivityType, Partials } = require('discord.js');
//const { token } = require('./config.json') // retrieve token from config
const database = require('./structure/database');
const config_json_1 = require("./config.json");
// Client setup
exports.client = new Client({
    // Status when starting
    "presence": {
        "status": "online",
        "afk": true,
        "activities": [
            {
                "type": ActivityType.Watching,
                "name": "you"
            }
        ]
    },
    // ? The enumeration for partials.
    // https://discord.js.org/#/docs/discord.js/14.0.3/typedef/Partials
    "partials": [
        Partials.User,
        Partials.Channel,
        Partials.GuildMember,
        Partials.Message,
        Partials.Reaction,
        Partials.GuildScheduledEvent,
        Partials.ThreadMember
    ],
    // ! Required in Discord.js v14
    // https://discord-api-types.dev/api/discord-api-types-v10/enum/GatewayIntentBits
    "intents": [
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildScheduledEvents,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent
    ]
});
async function retrieveCommands() {
    var _a, _b;
    // dynamically retrieve commands
    exports.client.commands = new Collection(); // add commands to a collection so they can be retrieved elsewhere i think
    const commandsPath = path.join(__dirname, 'commands', 'slash'); // path to commands using .join for Some Reason.
    const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.ts')); // read the ./commands/ files ending in .ts
    for (const file of commandFiles) {
        try {
            console.log(file);
            const filePath = path.join(commandsPath, file);
            const command = await (_a = filePath, Promise.resolve().then(() => __importStar(require(_a))));
            //console.log(command.default)
            exports.client.commands.set(command.default.data.name, command); // saves the command to the collection
        }
        catch (error) {
            console.log(error);
        }
    }
    // retrieve context menu commands
    const contextmenuPath = path.join(__dirname, 'commands', 'contextmenu'); // path to context menu commands
    const contextmenuFiles = fs.readdirSync(contextmenuPath).filter((file) => file.endsWith('.ts'));
    for (const file of contextmenuFiles) {
        const filePath = path.join(contextmenuPath, file);
        const command = await (_b = filePath, Promise.resolve().then(() => __importStar(require(_b))));
        exports.client.commands.set(command.default.data.name, command);
    }
}
async function retrieveEvents() {
    var _a;
    // dynamically retrieve events
    const eventsPath = path.join(__dirname, 'events');
    const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.ts'));
    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = await (_a = filePath, Promise.resolve().then(() => __importStar(require(_a))));
        if (event.once) {
            exports.client.once(event.name, (...args) => event.execute(...args));
        }
        else {
            exports.client.on(event.name, (...args) => event.execute(...args));
        }
    }
}
retrieveCommands();
retrieveEvents();
exports.client.login(config_json_1.token);
