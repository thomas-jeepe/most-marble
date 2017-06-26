import { TestScheduler } from './TestScheduler'
import { CaptureSink } from './CaptureSink'
import { periodic, from } from 'most'
import { parseMarbles } from './parseMarbles'

describe('TestScheduler', () => {
  it('should handle running a regular synchronous stream', () => {
    let finish: Function
    const promise = new Promise(resolve => (finish = resolve))
    const sink = new CaptureSink(evs => finish(evs))
    const scheduler = new TestScheduler()
    from([1, 2, 3]).run(sink, scheduler)
    scheduler.runAll()
    return promise.then(events => {
      expect(events).toEqual(parseMarbles('(123|)'))
    })
  })

  it('should handle running a periodic stream', async () => {
    const stream = periodic(100).constant(0).take(2)
    let finish: Function
    const promise = new Promise(resolve => (finish = resolve))
    const sink = new CaptureSink(evs => finish(evs))
    const scheduler = new TestScheduler()
    stream.run(sink, scheduler)
    scheduler.runAll()
    return promise.then(events => {
      expect(events).toEqual(parseMarbles('0(0|)', undefined, 100))
    })
  })
})
