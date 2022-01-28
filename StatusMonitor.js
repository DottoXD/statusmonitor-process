const si = require("systeminformation");
const pidusage = require("pidusage");
const fastify = require('fastify')({ logger: false })

/**
 * @class StatusMonitorProcess
 */
class StatusMonitor {
   /**
   * @param {string} name - your service name"
   * @param {string} type - your service type"
   * @param {string} location - your service location"
   * @param {number} port - webservers port"
   */
  constructor(name, type, location, port) {
      this.name = name;
      this.type = type;
      this.location = location;
      this.port = port;
  }
    
  async statsFetcher() {
      let diskUsage;
      let diskTotal;
      let netIn;
      let netOut;
      let netInSec;
      let netOutSec;
      
      fastify.get('/', async (request, reply) => {
          function convertSeconds(seconds) {
              seconds = Number(seconds);
              var d = Math.floor(seconds / (3600 * 24));
              var h = Math.floor((seconds % (3600 * 24)) / 3600);
              var m = Math.floor((seconds % 3600) / 60);
              var s = Math.floor(seconds % 60);

              var dDisplay = d > 0 ? d + (d == 1 ? "d " : "d ") : "";
              var hDisplay = h > 0 ? h + (h == 1 ? "h " : "h ") : "";
              var mDisplay = m > 0 ? m + (m == 1 ? "m " : "m ") : "";
              var sDisplay = s > 0 ? s + (s == 1 ? "s" : "s") : "";
              return dDisplay + hDisplay + mDisplay + sDisplay;
          }
          
         let rUsage = process.memoryUsage();
      
         let uptime = await process.uptime();
         let fixedUptime = await convertSeconds(uptime);
          
         let pidUsageStats = await pidusage(process.pid)
          
          await si.fsSize().then((driveInfo) => (diskTotal = driveInfo[0].size * Math.pow(1024, -2)));
          await si.fsSize().then((driveInfo) => (diskUsage = driveInfo[0].used * Math.pow(1024, -2)));
          await si.networkStats().then((networkStats) => (netIn = networkStats[0].rx_bytes));
          await si.networkStats().then((networkStats) => (netOut = networkStats[0].tx_bytes));
          await si.networkStats().then((networkStats) => (netInSec = networkStats[0].rx_sec));
          await si.networkStats().then((networkStats) => (netOutSec = networkStats[0].tx_sec));
          
          
          await reply.send({
              name: this.name,
              type: this.type,
              host: this.name,
              location: this.location,
              online4: true,
              online6: false,
              cpu: Math.round(pidUsageStats.cpu),
              memory_used: rUsage.heapUsed * Math.pow(1024, -1),
              memory_total: rUsage.rss * Math.pow(1024, -1),
              hdd_used: diskUsage,
              hdd_total: diskTotal,
              swap_total: 0,
              swap_used: 0,
              network_rx: netIn,
              network_rx_sec: netInSec,
              network_tx: netOut,
              network_tx_sec: netOutSec,
              uptime: fixedUptime,
              custom: "",
              load: 0
          })
      })
      
      fastify.listen(this.port, "0.0.0.0", (err, address) => {
          if (err) throw err
      })
  }
}

module.exports = StatusMonitor
