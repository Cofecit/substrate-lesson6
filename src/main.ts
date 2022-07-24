import { ApiPromise, WsProvider, Keyring } from "@polkadot/api";

/// Don't use localhost
/// Don't use wss it meas ssl for websocket!
const WS_ADDRESS = "ws://127.0.0.1:9944"

// construct WebSocket connection to Substrate
const connectSubstrate = async () => {
    const wsProvider = new WsProvider(WS_ADDRESS);
    const api = await ApiPromise.create({ provider: wsProvider, types: {} })
    await api.isReady;
    console.log("connection to substrate is OK.")
    return api;
}

// subscribe account info of Alice and Bob
const subscribeAliceAndBob = async (api: ApiPromise) => {
    const keyring = new Keyring({ type: 'sr25519' })
    const alice = keyring.addFromUri('//Alice')
    await api.query.system.account(alice.address, (aliceAcc: { data: { free: any; }; }) => {
        console.log("Subscribe to Alice account")
        const aliceFreeSub = aliceAcc.data.free;
        console.log(`Alice Account (sub): ${aliceFreeSub}`)
    })
}

// subscribe events and print them
const subscribeEvents = async (api: ApiPromise) => {
    // subscribe to system events
    api.query.system.events((events: any[]) => {
        console.log(`\nReceived events, count: ${events.length}, details:`);
        // iterate received events
        events.forEach(e => {
            // get event, phase and event types of evnet
            const { event, phase } = e;
            const types = event.typeDef;

            // print event info
            console.log(`\tEvent info: ${event.section}:${event.method}:: (phase=${phase}) ${event.meta.documentation}`);
            console.log(`\tEvent data:`);
            event.data.forEach((data: { toString: () => any; }, index: string | number) => {
                console.log(`\t\t${types[index].type}: ${data.toString()}`);
            });
        });
    });
}
const sleep = async (time: number) => {
    return new Promise(resolve => setTimeout(resolve, time));
}

const main = async () => {
    const api = await connectSubstrate()
    await subscribeAliceAndBob(api)
    await subscribeEvents(api)
    await sleep(600000)
    console.log("successfuly exit")
}

main().then(() => {
    console.log("connection succefully!")
    process.exit(0)
}).catch((err) => {
    console.log("connection failed: " + err)
    process.exit(1)
})