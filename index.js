const bns = require('bns-plus');
const { wire, DNSServer } = bns;
const JSON5 = require("json5")
const fs = require("fs");
const onQuery = require("./onQuery")
global.config = JSON5.parse(fs.readFileSync("./config.json5", "utf8"));
(async () => {
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
    server.on('query', onQuery)
    server.open(53, '0.0.0.0');

})()