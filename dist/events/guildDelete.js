"use strict";
// Emitted whenever a guild kicks the client or the guild is deleted/left.
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    name: "guildDelete",
    async execute(guild) {
        console.log(`a guild was left: ${guild}`);
    },
};
