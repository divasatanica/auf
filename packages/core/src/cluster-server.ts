import * as cluster from 'cluster';
import { cpus } from 'os';
import { Server, IServerOptions } from './server';

export interface IClusterServerOptions extends IServerOptions {
  workerNum?: number;
}

class ClusterServer extends Server {
  private clusterOptions: IClusterServerOptions
  constructor(options: IClusterServerOptions) {
    super(options);
    this.clusterOptions = options;
  }

  setup(listeningCallback?: () => void) {
    const { workerNum = cpus().length } = this.clusterOptions;
    if (cluster.isMaster) {
      for (let i = 0; i < workerNum; i ++) {
        cluster.fork();
      }
    } else if (cluster.isWorker) {
      const wrappedListeningCallback = () => {
        console.log(`[static-server] Worker process ${process.pid} started`);
        if (listeningCallback) {
          listeningCallback();
        }
        
      }
      super.setup(wrappedListeningCallback);
    }
  }
}

export {
  ClusterServer
}
