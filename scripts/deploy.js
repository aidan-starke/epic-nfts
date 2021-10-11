const fs = require('fs')

const main = async () => {
    const nftContractFactory = await hre.ethers.getContractFactory('MyEpicNFT');
    const nftContract = await nftContractFactory.deploy();
    await nftContract.deployed();
    console.log("Contract deployed to:", nftContract.address);

    let config = `
    export const nftContractAddress = '${nftContract.address}'
    `

    let data = JSON.stringify(config)
    fs.writeFileSync('client/src/config.js', JSON.parse(data))
};

const runMain = async () => {
    try {
        await main();
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

runMain();