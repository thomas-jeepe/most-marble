import { Stream } from 'most'
import { parseMarbles } from './parseMarbles'
import { CaptureSink } from './CaptureSink'
import { TestScheduler } from './TestScheduler'
import { Event, End, Next, Err } from './Event'

export class Expectation {
  public presumptions: (() => void)[] = []
  public ready: Promise<any>
  private actual: Event[]
  private resolve: () => void
  private isNot: boolean

  constructor(private timeFactor: number, stream: Stream<any>) {
    this.ready = new Promise(resolve => {
      this.resolve = resolve
    })
    const sink = new CaptureSink(events => {
      this.actual = events
      this.resolve()
    })
    const scheduler = new TestScheduler()
    stream.run(sink, scheduler)
    scheduler.runAll()
  }

  get not() {
    this.isNot = !this.isNot
    return this
  }

  toBe(marbles: string, values?: { [name: string]: any }) {
    this.add(() => {
      const expected = parseMarbles(marbles, values, this.timeFactor)
      if (this.isNot) {
        expect(this.actual).not.toEqual(expected)
      } else {
        expect(this.actual).toEqual(expected)
      }
    })
    return this
  }

  toBeEmpty() {
    this.add(() => {
      if (!this.isNot) {
        expect(this.actual.length).toBe(1)
        expect(this.actual[0].frame).toBe(0)
        expect(this.actual[0]).toBeInstanceOf(End)
      } else {
        expect(this.actual.length).not.toBe(1)
        expect(this.actual[0]).not.toBeInstanceOf(End)
      }
    })
    return this
  }

  toBeOnly(val: any) {
    this.add(() => {
      if (!this.isNot) {
        expect(this.actual.length).toBeGreaterThanOrEqual(1)
        expect(this.actual[0]).toBeInstanceOf(Next)
        expect((this.actual[0] as any).value).toEqual(val)
        expect(this.actual[1]).toBeInstanceOf(End)
      } else {
        expect((this.actual[0] as any).value).not.toEqual(val)
      }
    })
    return this
  }

  toBeArray(arr: any[]) {
    this.add(() => {
      this.actual
        .filter(ev => ev instanceof Next)
        .forEach((ev: Next<any>, i) => {
          if (this.isNot) {
            expect(ev).not.toEqual(arr[i])
          } else {
            expect(ev.value).toEqual(arr[i])
          }
        })
    })
    return this
  }

  toThrow(error?: any) {
    this.add(() => {
      const last = this.actual[this.actual.length - 1]
      if (!this.isNot) {
        checkThrow(last as Err, error)
      } else {
        checkNotThrow(last as Err, error)
      }
    })
    return this
  }

  toStartWith(val: any) {
    this.add(() => {
      if (!this.isNot) {
        expect(this.actual[0]).toBeInstanceOf(Next)
        expect((this.actual[0] as Next<any>).value).toEqual(val)
      } else {
        expect((this.actual[0] as Next<any>).value).not.toEqual(val)
      }
    })
    return this
  }

  toEndWith(val: any) {
    this.add(() => {
      if (!this.isNot) {
        expect(this.actual[this.actual.length - 2]).toBeInstanceOf(Next)
        expect(
          (this.actual[this.actual.length - 2] as Next<any>).value
        ).toEqual(val)
      } else {
        expect(
          (this.actual[this.actual.length - 2] as Next<any>).value
        ).not.toEqual(val)
      }
    })
    return this
  }

  toContain(val: any) {
    this.add(() => {
      if (!this.isNot) {
        expect(findValue(this.actual, val)).not.toBe(undefined)
      } else {
        expect(findValue(this.actual, val)).toBe(undefined)
      }
    })
    return this
  }

  toMatchSnapshot() {
    this.add(() => {
      if (!this.isNot) {
        expect(this.actual).toMatchSnapshot()
      } else {
        throw new Error('.not cannot be used with .toMatchSnapshot')
      }
    })
    return this
  }

  toHaveLength(expected: number) {
    this.add(() => {
      if (!this.isNot) {
        expect(this.actual).toHaveLength(expected)
      } else {
        expect(this.actual).not.toHaveLength(expected)
      }
    })
  }

  toCheckWith(
    f: (actual: Event[], expected: Event[]) => void,
    marbles: string,
    values?: { [name: string]: any }
  ) {
    this.add(() => {
      const expected = parseMarbles(marbles, values, this.timeFactor)
      if (!this.isNot) {
        f(this.actual, expected)
      } else {
        throw new Error('.not cannot be used with toBeWith')
      }
    })
  }

  private add(presumption: () => void) {
    this.presumptions.push(presumption)
  }
}

function findValue(events: Event[], value: any) {
  return events.find(event => {
    if (event instanceof Next) {
      return value === event.value
    }
    return false
  })
}

function checkThrow(event: Err, val: any) {
  expect(event).toBeInstanceOf(Err)
  if (val) {
    expect(event.error).toEqual(val)
  }
}

function checkNotThrow(event: Err, val: any) {
  if (event instanceof Err) {
    if (val) {
      expect(event.error).not.toEqual(val)
    } else {
      expect(event).not.toBeInstanceOf(event)
    }
  }
}
