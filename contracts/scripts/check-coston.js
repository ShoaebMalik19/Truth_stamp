const { createPublicClient, http } = require('viem');
const { coston2 } = require('viem/chains');

async function check() {
    const client = createPublicClient({
        chain: coston2,
        transport: http('https://coston2-api.flare.network/ext/C/rpc')
    });

    const address = "0xa85233C63b9Ee964Add6F2cffe00Fd84eb32338f";
    const code = await client.getBytecode({ address });

    console.log(`Code at ${address}:`, code ? code.slice(0, 50) + "..." : "None");
}

check();
