class ChannelBridge {
    channel1: any;
    channel2: any;

    constructor(channel1: any, channel2: any) {
        this.channel1 = channel1;
        this.channel2 = channel2;
    }

    isPartOfBridge(channelId: string): boolean {
        return this.channel1.id === channelId || this.channel2.id === channelId;
    }

    getOppositeChannel(channelId: string): any {
        if (this.channel1.id === channelId) return this.channel2;
        if (this.channel2.id === channelId) return this.channel1;
        return null;
    }
}

export default ChannelBridge;
