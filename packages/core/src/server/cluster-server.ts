import { cpus } from 'os';
import * as cluster from 'cluster';
import { IClusterServerOptions, IMiddlewareAbility, IMiddleWare, IContext } from './interface';
import { BaseServer } from './base-server';
import { MiddlewaresAbility } from './middlewares';

interface IClusterAbility {
  setupCluster(setupFunction: Function): void;
}

interface IClusterServer {
  setup(listeningCallback?: () => void): void;
}

class ClusterAbility implements IClusterAbility {
  private clusterOptions: IClusterServerOptions;
  constructor (clusterOptions: IClusterServerOptions) {
    this.clusterOptions = clusterOptions;
  }
  setupCluster(setupFunction: Function) {
    const { workerNum = cpus().length } = this.clusterOptions;
    if (cluster.isMaster) {
      for (let i = 0; i < workerNum; i ++) {
        cluster.fork();
      }
    } else if (cluster.isWorker) {
      setupFunction()
    }
  }
}

class ClusterServer extends BaseServer implements IClusterServer, IMiddlewareAbility, IClusterAbility {
  private clusterAbility: IClusterAbility;
  private middlewareAbility: IMiddlewareAbility = new MiddlewaresAbility();
  constructor(options: IClusterServerOptions) {
    super(options);
    this.clusterAbility = new ClusterAbility(options);
  }

  setupCluster(setupFunction: Function): void {
    this.clusterAbility.setupCluster(setupFunction)
  }

  setup(listeningCallback?: () => void) {
    const wrappedListeningCallback = () => {
      console.log(`[static-server] Worker process ${process.pid} started`);
      if (listeningCallback) {
        listeningCallback();
      }
      
    }

    this.setupCluster(() => {
      super.setup(wrappedListeningCallback, async ctx => this.next(ctx))
    })
  }

  next(ctx: IContext) {
    return this.middlewareAbility.next(ctx);
  }

  applyMiddleware(middlewares: IMiddleWare[]) {
    this.middlewareAbility.applyMiddleware(middlewares);
  }
}

export {
  ClusterServer
}