# statusmonitor-process
A free status monitor solution, used to show a nodejs process' resources usage. This is an early version.
You can selfhost a [statusmonitor-server](https://github.com/DottoXD/statusmonitor-server) instance and connect those 2, you will get a beautiful status page that shows your nodejs process' stats.

# important note
This project runs with [fastify](https://npmjs.com/package/fastify), [pidusage](https://npmjs.com/package/pidusage) and [systeminformation](https://npmjs.com/package/systeminformation)

# update 0.0.2
+ first release

# features
Every feature available in [statusmonitor-client](https://github.com/DottoXD/statusmonitor-client) is available there too!

# known issues
There are no known issues at the moment.

# simple setup guide
You can easily setup [statusmonitor-server](https://github.com/DottoXD/statusmonitor-process) in 2 steps!

**Step one: install the package!**
```
npm i @dottoxd/statusmonitor-process
```

**Step two: configure your project!**
*just 3 lines of code are needed for this to work!*
```
const StatusMonitor = require("@dottoxd/statusmonitor-process")
const Monitor = new StatusMonitor.Process("Your application name", "DOCKER", "US", 3000);
const ProcessMonitor = Monitor.statsFetcher();
```
