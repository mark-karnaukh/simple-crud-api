// server.js
import * as http from 'http';
const pid = process.pid;

http
  .createServer((req, res) => {
    console.log(req.method, process.pid, process.env.id, process.env.port);

    res.end(`Handled by process ${pid}`);
  })
  .listen(Number(process.env.port) + Number(process.env.id) + 1, () => {
    console.log(
      `Started process ${pid}, port: ${
        Number(process.env.port) + Number(process.env.id) + 1
      }`,
    );
  });

process.on('message', (msg) => {
  console.log(`Message from master: ${msg}`);
});
