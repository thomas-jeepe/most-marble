import { Stream } from 'most'
import { parseMarbles } from './parseMarbles'
import { MarbleStream } from './MarbleStream'
import { Expectation } from './Expectation'

type CreateStream = (
  marbles: string,
  values?: { [name: string]: any }
) => MarbleStream
type Presume = (stream: Stream<any>) => Expectation
type Cb = (oxpect: Presume, stream: CreateStream) => any

export class TestEnviroment {
  expectations: Expectation[] = []
  constructor(public timeFactor = 10) {}

  stream = (marbles: string, values?: { [name: string]: any }) => {
    const events = parseMarbles(marbles, values, this.timeFactor)
    return new MarbleStream(events)
  }

  presume = (stream: Stream<any>) => {
    const expectation = new Expectation(this.timeFactor, stream)
    this.expectations.push(expectation)
    return expectation
  }

  flush() {
    return Promise.all(this.expectations.map(ex => ex.ready)).then(() => {
      this.expectations.forEach(ex => ex.presumptions.forEach(cb => cb()))
    })
  }
}

export function env(timeFactor: number, fn: Cb): () => any
export function env(fn: Cb): () => any
export function env(timeFactor: Cb | number, fn?: Cb) {
  if (typeof timeFactor === 'number') {
    const testEnv = new TestEnviroment(timeFactor)
    return () => {
      ;(fn as any)(testEnv.presume, testEnv.stream)
      return testEnv.flush()
    }
  } else {
    const testEnv = new TestEnviroment()
    return () => {
      timeFactor(testEnv.presume, testEnv.stream)
      return testEnv.flush()
    }
  }
}

export function itenv(name: string, timeFactor: number, fn: Cb): void
export function itenv(name: string, fn: Cb): void
export function itenv(name: string, timeFactor: Cb | number, fn?: Cb) {
  it(name, env(timeFactor as any, fn as any))
}
