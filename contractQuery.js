module.exports = async function scQuery(scAddress, query) {
    const { default: fetch } = await import("node-fetch")
    let encodedQuery = Buffer.from(JSON.stringify(query)).toString("base64")
    let response = await fetch(`${config.restEndpoint}/cosmwasm/wasm/v1/contract/${scAddress}/smart/${encodedQuery}`).then(r => r.json())
    return response

}