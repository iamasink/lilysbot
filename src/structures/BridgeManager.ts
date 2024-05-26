import database from '../utils/database';
import ChannelBridge from './ChannelBridge';

class BridgeManager {
    bridges: ChannelBridge[];

    constructor() {
        this.bridges = []
        this.initialise()
    }

    addBridge(channel1: any, channel2: any) {
        const bridge = new ChannelBridge(channel1, channel2);
        this.bridges.push(bridge);
        console.log(`Bridge created between channels ${channel1.id} and ${channel2.id}`);
        this.saveBridges()
    }

    getBridge(channelId: string): ChannelBridge | undefined {
        const bridge = this.bridges.find(bridge => bridge.isPartOfBridge(channelId));
        if (bridge) {
            console.log(`Bridge found for channel ${channelId}`);
        } else {
            console.log(`No bridge found for channel ${channelId}`);
        }
        return bridge;
    }

    saveBridges() {
        let bridgedata = []
        for (let i = 0, len = this.bridges.length; i < len; i++) {
            bridgedata.push({ channel1: this.bridges[i].channel1.id, channel2: this.bridges[i].channel2.id })
        }
        database.set('.channelbridges', bridgedata)
    }

    // async getBridges(): Promise<any> {
    //     return new Promise((resolve, reject) => {
    //         resolve(database.get(".channelbridges"))
    //     });
    // }

    async initialise() {
        console.log(await database.get(".channelbridges"))
        console.log(this.bridges)
    }

}

export default BridgeManager;
