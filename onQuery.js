const contractQuery = require("./contractQuery")
module.exports = async (req, res, rinfo) => {

    const [question] = req.question;
    let name = question.name.toLowerCase()
    if (name.endsWith(config.zone)) {

        let nameInfo;
        try {
            nameInfo = await contractQuery(config.nameContract, {
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
}