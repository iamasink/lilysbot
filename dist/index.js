/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import 'dotenv/config';
import { Client, GatewayIntentBits, Collection, Partials } from 'discord.js';
import { readdirSync } from 'fs';
const { TOKEN } = process.env;
// Discord client object
global.client = Object.assign(new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
    ],
    partials: [Partials.Channel],
}), {
    commands: new Collection(),
    msgCommands: new Collection(),
});
// Set each command in the commands folder as a command in the client.commands collection
const commandFiles = readdirSync('./commands').filter((file) => file.endsWith('.js') || file.endsWith('.ts'));
for (const file of commandFiles) {
    const command = (await import(`./commands/${file}`))
        .default;
    client.commands.set(command.data.name, command);
}
const msgCommandFiles = readdirSync('./messageCommands').filter((file) => file.endsWith('.js') || file.endsWith('.ts'));
for (const file of msgCommandFiles) {
    const command = (await import(`./messageCommands/${file}`))
        .default;
    client.msgCommands.set(command.name, command);
}
// Event handling
const eventFiles = readdirSync('./events').filter((file) => file.endsWith('.js') || file.endsWith('.ts'));
for (const file of eventFiles) {
    const event = (await import(`./events/${file}`)).default;
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    }
    else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}
await client.login(TOKEN);
