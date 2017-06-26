import { Sink } from 'most'
import { Event, Next, End, Err } from './Event'

export class CaptureSink implements Sink<any> {
  events: Event[] = []

  constructor(public cb: (events: Event[]) => void) {}

  event(time: number, value: any) {
    this.events.push(new Next(value, time))
  }

  error(time: number, error: any) {
    this.events.push(new Err(error, time))
    this.cb(this.events)
  }

  end(time: number) {
    this.events.push(new End(time))
    this.cb(this.events)
  }
}
