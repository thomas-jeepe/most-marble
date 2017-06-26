import { Sink, Scheduler, PropagateTask, Stream } from 'most'
import { Event } from './Event'

class MarblesSource {
  private scheduler: Scheduler
  private sink: Sink<any>
  private active = true
  constructor(public events: Event[]) {}

  run(sink: Sink<any>, scheduler: Scheduler) {
    this.sink = sink
    this.scheduler = scheduler
    this._runMarbles()
    return {
      dispose: () => {
        this.active = false
      }
    }
  }

  private _scheduleEvent = (event: Event) => {
    this.scheduler.delay(
      event.frame,
      new PropagateTask(this._runEvent, event, this.sink)
    )
  }

  private _runEvent = (_: number, event: Event, sink: Sink<any>) => {
    if (this.active) {
      ;(event.run as any)(_, event, sink)
    }
  }

  private _runMarbles() {
    this.events.forEach(this._scheduleEvent)
  }
}

export class MarbleStream extends Stream<any> {
  constructor(public events: Event[]) {
    super(new MarblesSource(events))
  }
}
