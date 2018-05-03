import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'

import { Channel } from '../../Channel'
import { IMessage } from '../../proto'
import { WebChannel } from '../../WebChannel'
import { IMessageFactory, IWebChannelStream, Service } from '../Service'

export enum TopologyEnum {
  FULL_MESH,
}

export enum TopologyState {
  JOINING,
  JOINED,
  DISCONNECTING,
  DISCONNECTED,
}

/**
 * It is responsible to preserve Web Channel
 * structure intact (i.e. all peers have the same vision of the Web Channel).
 * Among its duties are:
 *
 * - Add a new peer into Web Channel.
 * - Remove a peer from Web Channel.
 * - Send a broadcast message.
 * - Send a message to a particular peer.
 *
 * @see FullMesh
 */
export abstract class Topology<OutMsg, InMsg extends OutMsg> extends Service<OutMsg, InMsg> {
  protected wcStream: IWebChannelStream<OutMsg, InMsg>
  protected wc: WebChannel

  private _state: TopologyState
  private stateSubject: Subject<TopologyState>

  constructor(wc: WebChannel, serviceId: number, proto: IMessageFactory<OutMsg, InMsg>) {
    super(serviceId, proto)
    this.wc = wc
    this.wcStream = super.useWebChannelStream(wc)
    this.stateSubject = new Subject()
    this._state = TopologyState.DISCONNECTED
  }

  get onState(): Observable<TopologyState> {
    return this.stateSubject.asObservable()
  }

  get state(): TopologyState {
    return this._state
  }

  protected setState(state: TopologyState) {
    if (this.state !== state) {
      this._state = state
      this.stateSubject.next(state)
    }
  }
}

export interface ITopology {
  onState: Observable<TopologyState>

  state: TopologyState

  /**
   * Broadcast a message to the network.
   */
  send(msg: IMessage): void

  /**
   * Forward the message to its recipient(s).
   */
  forward(msg: IMessage): void

  /**
   * Send a message to a particular peer in the network.
   */
  sendTo(msg: IMessage): void

  /**
   * Disconnect from the network
   */
  leave(): void

  /**
   * This handler will be called when one of the network channel closed.
   */
  onChannelClose(event: Event, channel: Channel): void

  /**
   * This handler will be called when an error occured on one of the network
   * channel.
   */
  onChannelError(event: Event, channel: Channel): void
}
