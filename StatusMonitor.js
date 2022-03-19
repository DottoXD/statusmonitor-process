const si = require("systeminformation");
const pidusage = require("pidusage");
let fastify = require('fastify')({ logger: false })

/**
 * @class StatusMonitorProcess
 */
class StatusMonitor {
   /**
   * @param {string} name - your service name"
   * @param {string} type - your service type"
   * @param {string} location - your service location"
   * @param {number} port - webservers port"
   * @param {object} fastify - fastify object"
   */
  constructor(name, type, location, port, fastifyObject) {
      this.name = name;
      this.type = type;
      this.location = location;
      this.port = port;
      this.fastifyObject = fastifyObject;
  }
    
  async statsFetcher() {
      let diskUsage;
      let diskTotal;
      let netIn;
      let netOut;
      let netInSec;
      let netOutSec;
      let load;
      let ping;
      
      if(this.fastifyObject) fastify = this.fastifyObject;
      
      fastify.get('/statusmonitor', async (request, reply) => {
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
         let fixedUptime = convertSeconds(uptime);
          
         let pidUsageStats = await pidusage(process.pid)
          
          await si.fsSize().then((driveInfo) => {
              diskTotal = driveInfo[0].size;
              diskUsage = driveInfo[0].used;
          })

          await si.networkStats().then((networkStats) => {
              netIn = networkStats[0].rx_bytes;
              netOut = networkStats[0].tx_bytes;
              netInSec = networkStats[0].rx_sec;
              netOutSec = networkStats[0].tx_sec;
          })

          await si.currentLoad().then((systemLoad) => {
              load = systemLoad.currentLoad;
          })

          await si.inetLatency().then((Data) => ping = Data);

          await reply.send({
              name: this.name,
              type: this.type,
              host: this.name,
              location: this.location,
              online4: true,
              online6: false,
              cpu: Math.round(pidUsageStats.cpu),
              memory_used: rUsage.heapUsed,
              memory_total: rUsage.rss,
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
              load: 0,
              ping: Math.round(ping),
          })
      })
      
      if(!this.fastifyObject || this.fastifyObject === undefined) {
          fastify.listen(this.port, "0.0.0.0", (err, address) => {
          	if (err) throw err
          })
      }
  }
}

module.exports = StatusMonitor
