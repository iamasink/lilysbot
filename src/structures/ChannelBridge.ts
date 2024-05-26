import { Snowflake } from "discord.js";

class ChannelBridge {
    channel1: Snowflake;
    channel2: Snowflake;

    constructor(channel1: Snowflake, channel2: Snowflake) {
        this.channel1 = channel1;
        this.channel2 = channel2;
    }

    isPartOfBridge(channelId: Snowflake): boolean {
        console.log(channelId)
        return this.channel1 === channelId || this.channel2 === channelId;
    }

    getOppositeChannel(channelId: Snowflake): Snowflake | null {
        if (this.channel1 === channelId) return this.channel2;
        if (this.channel2 === channelId) return this.channel1;
        return null;
    }
}

export default ChannelBridge;
