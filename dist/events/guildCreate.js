"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const database_1 = tslib_1.__importDefault(require("../structure/database"));
// Emitted whenever the client joins a guild.
exports.default = {
    name: "guildCreate",
    async execute(guild) {
        console.log(`a guild was joined: ${guild}`);
        database_1.default.set(`.guilds.${guild.id}.joinedAt`, Date());
        // cache invites
        const guildinvites = await guild.invites.fetch();
        guildinvites.map(async (invite) => {
            const code = invite.code;
            const inviterId = invite.inviterId;
            const uses = invite.uses;
            database_1.default.set(`.guilds.${guild.id}.invites.${code}`, { inviterId: inviterId, uses: uses, expired: false });
        });
    },
};
