// cluster.js
import cluster from 'cluster';
import * as os from 'os';

if (cluster.isPrimary) {
  console.log('PORT', process.env.PORT);
  const cpus = os.cpus().length;

  console.log(`Forking for ${cpus} CPUs`);
  for (let i = 0; i < cpus; i++) {
    cluster.fork({ id: i, port: process.env.port });
  }

  Object.values(cluster.workers).forEach((worker) => {
    worker.send(`Hello Worker ${worker.id}`);
  });
} else {
  import('./server.js');
}
