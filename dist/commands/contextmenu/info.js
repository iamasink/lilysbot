"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const discord_js_1 = require("discord.js");
const commands_1 = tslib_1.__importDefault(require("../../structure/commands"));
const index_1 = require("../../index");
exports.default = {
    data: new discord_js_1.ContextMenuCommandBuilder()
        .setName('User Information')
        .setType(discord_js_1.ApplicationCommandType.User),
    async execute(interaction) {
        commands_1.default.run(interaction, "info", null, "user", [
            {
                name: 'target',
                type: 6,
                value: interaction.targetUser.id,
                user: await index_1.client.users.resolve(interaction.targetUser.id)
            }
        ]);
    },
};
