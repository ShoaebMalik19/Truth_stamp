import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const config = {
    solidity: "0.8.20",
    networks: {
        coston2: {
            url: "https://coston2-api.flare.network/ext/C/rpc",
            chainId: 114,
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
        },
    },
};

export default config;
