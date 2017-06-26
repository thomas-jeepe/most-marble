import { Sink } from 'most'

export class End {
  constructor(public frame: number) {}
  run(_: number, marble: End, sink: Sink<any>) {
    sink.end(marble.frame)
  }
}

export class Err {
  constructor(public error: any, public frame: number) {}
  run(_: number, marble: Err, sink: Sink<any>) {
    sink.error(marble.frame, marble.error)
  }
}

export class Next<N> {
  constructor(public value: N, public frame: number) {}
  run(_: number, marble: Next<N>, sink: Sink<N>) {
    sink.event(marble.frame, marble.value)
  }
}

export type Event = Next<any> | Err | End
