import { End, Next, Err } from './Event'
import { parseMarbles } from './parseMarbles'

describe('parseMarbles', () => {
  it('should read an empty (only complete) marble', () => {
    const events = parseMarbles('|')
    expect(events).toEqual([new End(0)])
  })

  it('should read a single value and then a complete', () => {
    const events = parseMarbles('a|', undefined, 10)
    expect(events).toEqual([new Next('a', 0), new End(10)])
  })

  it('should parseInt values which are numbers', () => {
    const events = parseMarbles('123|', undefined, 10)
    expect(events).toEqual([
      new Next(1, 0),
      new Next(2, 10),
      new Next(3, 20),
      new End(30)
    ])
  })

  it('should read values from the given values object', () => {
    const events = parseMarbles('abc|', { a: 1, b: 2, c: 3 }, 10)
    expect(events).toEqual([
      new Next(1, 0),
      new Next(2, 10),
      new Next(3, 20),
      new End(30)
    ])
  })

  it('should get an error value from the values object', () => {
    const events = parseMarbles(
      'ab#',
      { a: 1, b: 2, error: new Error('yikes') },
      10
    )
    expect(events).toEqual([
      new Next(1, 0),
      new Next(2, 10),
      new Err(new Error('yikes'), 20)
    ])
  })

  it('should be able to skip frames', () => {
    const events = parseMarbles('1  2 3   |')
    expect(events).toEqual([
      new Next(1, 0),
      new Next(2, 10),
      new Next(3, 20),
      new End(30)
    ])
  })

  it("should be able to align with the skip ' ' operator", () => {
    const a = parseMarbles('1(23)|')
    const b = parseMarbles('12   |')
    expect(a).toEqual([
      new Next(1, 0),
      new Next(2, 10),
      new Next(3, 10),
      new End(20)
    ])
    expect(b).toEqual([new Next(1, 0), new Next(2, 10), new End(20)])
  })
})
