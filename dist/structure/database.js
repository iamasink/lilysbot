"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const redis = require("redis");
const key = "lilybot";
const index_1 = require("../index");
var db; // idk what im doing but hopefully this makes the client available everywhere??!!!
function connect() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        console.log("connecting to database...");
        const db = redis.createClient({ url: "redis://localhost:6379" });
        db.on("error", (err) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            console.log(`Redis error: ${err}`);
        }));
        yield db.connect();
        // console.log((await db.json.get(`test`)))
        index_1.client.guilds.cache.each((g) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield module.exports.check(`.guilds.${g.id}`);
            yield module.exports.check(`.guilds.${g.id}.commands`);
            yield module.exports.check(`.guilds.${g.id}.commands.global`);
            yield module.exports.check(`.guilds.${g.id}.commands.aliases`);
            yield module.exports.check(`.guilds.${g.id}.users`);
            yield module.exports.check(`.guilds.${g.id}.roles`);
            yield module.exports.check(`.guilds.${g.id}.roles.lists`);
            yield module.exports.check(`.guilds.${g.id}.roles.menus`);
        }));
    });
}
exports.default = {
    connect() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            connect();
        });
    },
    /**
     * Set data in the redis database
     *
     * @param {string} path The path to the data in JSON Path format (start with .)
     * @param {*} data The data to be stored
     */
    set(path, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            //console.log(`Setting "${JSON.stringify(data)}" at "${path}"`)
            // try and set the data.
            try {
                const res = yield db.json.set(key, path, data);
                //console.log(`redis response: ${res}`)
                if (!res)
                    throw new Error("null");
                //console.log(`success: ${path}`)
            }
            catch (e) {
                // console.log("s" + e.toString())
                // console.log("n" + e.name)
                // console.log("m" + e.message)
                // console.log("c" + e.cause)
                switch (e.message) {
                    case 'ERR new objects must be created at the root': {
                        console.log("error root");
                        const newpath = path.split(".");
                        newpath.pop();
                        yield module.exports.set("." + newpath, {});
                        break;
                    }
                    case 'null': { // if it failed to set the value, fix it idk
                        console.log("error null");
                        const newpath = path.split(".");
                        newpath.pop();
                        yield module.exports.set(newpath.join("."), {}); // go up one layer and set the json stuffs
                        yield module.exports.set(path, data); // try again so its recursive ?? it seemed to work so idk
                        break;
                    }
                    default: {
                        console.log("unhandled error");
                        throw new Error(`Redis Error while setting "${data}" at "${path}": "${e.message}"`);
                    }
                }
            }
        });
    },
    /**
     * Get data from the redis database
     *
     * @param {string} path The path to the data in JSON Path format (start with .)
     * @return {*} Returns data from the path
     */
    get(path) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                //console.log(`get path: ${path}`)
                const data = yield db.json.get(key, { path: path });
                //console.log(`retrieved data ${data} from path ${path}`)
                return data;
            }
            catch (e) {
                return;
            }
        });
    },
    /**
     * Delete data from the redis database
     *
     * @param {string} path The path to the data in JSON Path format (start with .)
     */
    del(path) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // console.log(`path: ${path}`)
            try {
                yield db.json.del(key, path);
            }
            catch (e) {
                console.log(e);
                throw new Error(`Could not delete ${key}: $.${path}.\n${e}`);
            }
        });
    },
    /**
     * Check if item exists in database
     *
     * @param {string} path The path to the data in JSON Path format (start with .)
     */
    check(path) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            //console.log(`check path: ${path}`)
            var value = yield module.exports.get(path);
            //console.log(`value = ${JSON.stringify(value)}`)
            if (!value) {
                console.log("error");
                yield module.exports.set(path, {});
                return false;
            }
            //console.log("exists")
            return true;
        });
    }
};
