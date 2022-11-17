const bns = require('bns-plus');
const { wire, DNSServer } = bns;
const JSON5 = require("json5")
const fs = require("fs");

global.config = JSON5.parse(fs.readFileSync("./config.json5", "utf8"));
(async () => {
    const { default: fetch } = await import("node-fetch")
    const server = new bns.DNSServer({
        tcp: true,
        edns: true,
        dnssec: true,
        // Add EDNS0 OPT record in responses.
        edns: true,
        // Set the UDP buffer size to 4096.
        ednsSize: 4096,
        // Add EDNS0 DO bit in responses.
        dnssec: true
    });
    server.on('query', async (req, res, rinfo) => {

        const [question] = req.question;
        let name = question.name.toLowerCase()
        if (name.endsWith(config.zone)) {

            let nameInfo;
            try {
                nameInfo = await scQuery(config.nameContract, {
                    "nft_info": {
                        "token_id": name.slice(0, -config.zone.length)
                    }
                })
                let records = nameInfo?.data?.extension?.records || []
                records = records.filter(record => ["ns1", "ns2", "ns3", "ns4"].includes(record.name))
                // res.records.map()
                records.forEach(record => {
                    const rr = new wire.Record();

                    rr.name = name;
                    rr.type = wire.types.NS;
                    rr.ttl = 3600;
                    rr.data = new wire.NSRecord();
                    rr.data.ns = record.value.endsWith(".") ? record.value : record.value + "."
                    res.authority.push(rr)
                })
                res.send()
            } catch (e) {
                console.error(e)
                res.code = wire.codes.NXDOMAIN;
                // res.send()
            }

        } else {
            res.code = wire.codes.NXDOMAIN;
            res.send()
        }
    })
    server.open(53, '0.0.0.0');
    async function scQuery(scAddress, query) {
        let encodedQuery = Buffer.from(JSON.stringify(query)).toString("base64")
        let response = await fetch(`${config.restEndpoint}/cosmwasm/wasm/v1/contract/${scAddress}/smart/${encodedQuery}`).then(r => r.json())
        return response

    }
})()