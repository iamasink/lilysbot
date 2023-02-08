"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const tslib_1 = require("tslib")
const database_1 = tslib_1.__importDefault(require("../structure/database"))
// Emitted whenever the client joins a guild.
export default {
    name: "guildCreate",
    execute(guild) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            console.log(`a guild was joined: ${guild}`)
            database_1.default.set(`.guilds.${guild.id}.joinedAt`, Date())
            // cache invites
            const guildinvites = yield guild.invites.fetch()
            guildinvites.map((invite) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const code = invite.code
                const inviterId = invite.inviterId
                const uses = invite.uses
                database_1.default.set(`.guilds.${guild.id}.invites.${code}`, { inviterId: inviterId, uses: uses, expired: false })
            }))
        })
    },
}
