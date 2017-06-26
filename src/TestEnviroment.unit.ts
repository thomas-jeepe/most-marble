import { itenv } from './TestEnviroment'
import { empty, just, from, periodic } from 'most'

describe('TestEnviroment', () => {
  itenv('should create a stream and be equal to itself', (presume, stream) => {
    const stream$ = stream('a-b-c|')
    presume(stream$).toBe('a-b-c|')
  })

  itenv('should compare an empty stream', presume => {
    presume(empty()).toBe('|')
  })

  itenv('should compare a stream with 1 value', presume => {
    presume(just(1)).toBe('(1|)')
  })

  itenv('should compare a stream with multiple values', presume => {
    presume(from([1, 2, 3])).toBe('(123|)')
  })

  itenv('should work with custom values', (presume, stream) => {
    const a$ = stream('ab#', {
      a: 'ab',
      b: 'ba',
      error: new Error('yikes')
    })
    presume(a$).toThrow(new Error('yikes'))
    presume(a$).toBeArray(['ab', 'ba'])
    presume(a$).toBe('ab#', { a: 'ab', b: 'ba', error: new Error('yikes') })
  })

  itenv('should test a map operator validly', (presume, stream) => {
    const marbles = {
      input: ' 0-1-2|',
      output: '1-2-3|'
    }
    const input$ = stream(marbles.input).map(v => v + 1)
    presume(input$).toBe(marbles.output)
  })

  itenv(
    'should test a scan operator and it should see that it is not equal',
    (presume, stream) => {
      function add(a: number, b: number) {
        return a + b
      }
      const input$ = stream('-1-2-3|')
      const expected = '     01-3-6|'
      presume(input$.scan(add, 0)).toBe(expected)
      presume(input$).not.toBe('abc|')
    }
  )

  itenv(
    'should correctly decide if a stream is empty and is not empty',
    (presume, stream) => {
      const empty$ = stream('|')
      const just1$ = stream('(1|)')
      presume(empty$).toBeEmpty()
      presume(just1$).not.toBeEmpty()
    }
  )

  itenv('should handle the example in the readme', (presume, stream) => {
    presume(stream('a|')).not.toBeEmpty()
    presume(stream('a|')).toBeOnly('a')
  })

  itenv(
    'should correctly decide if a stream is only 1 value and is not only 1 value',
    (presume, stream) => {
      const just1$ = stream('(1|)')
      const just2$ = stream('(2|)')
      presume(just1$).toBeOnly(1)
      presume(just2$).not.toBeOnly(1)
    }
  )

  itenv('should test a periodic function', 1000, presume => {
    const period$ = periodic(1000)
      .constant(1)
      .scan((acc, v) => acc + v, 0)
      .skip(1)
      .take(5)
    presume(period$).toBe('1234(5|)')
  })

  itenv('should compare against an array', presume => {
    presume(from([1, 2, 3])).toBeArray([1, 2, 3])
    presume(from([1, 2, 3])).not.toBeArray([3, 2, 1])
  })

  itenv('should compare errors in a stream', presume => {
    const x = just(1).map(() => {
      throw new Error('yikes')
    })
    presume(x).toBe('#', { error: new Error('yikes') })
  })

  itenv('should check toThrow', presume => {
    const x = just(1).map(() => {
      throw new Error('yikes')
    })
    presume(x).toThrow()
    presume(just(1)).not.toThrow()
  })

  itenv('should check toThrow with a value', presume => {
    const x = just(1).map(() => {
      throw new Error('yikes')
    })
    presume(x).toThrow(new Error('yikes'))
    presume(x).not.toThrow(new Error('yeesh'))
  })

  itenv('it should check toStartWith', (presume, stream) => {
    presume(stream('123|')).toStartWith(1)
    presume(stream('#')).not.toStartWith(1)
    presume(stream('123|')).not.toStartWith(2)
  })

  itenv('it should check toEndWith', (presume, stream) => {
    presume(stream('123|')).toEndWith(3)
    presume(stream('123|')).not.toEndWith(2)
  })

  itenv('it should check toContain', (presume, stream) => {
    presume(stream('123|')).toContain(2)
    presume(stream('123|')).toContain(3)
    presume(stream('123|')).not.toContain(0)
    presume(stream('123|')).not.toContain(4)
  })

  itenv('it should match a snapshot', (presume, stream) => {
    presume(stream('123|')).toMatchSnapshot()
  })

  itenv('should check the length', (presume, stream) => {
    presume(stream('123|')).toHaveLength(4)
    presume(stream('123|')).not.toHaveLength(3)
  })

  itenv('should allow a custom equality check', (presume, stream) => {
    function check(a: any[], b: any[]) {
      expect(a.length).toBe(b.length)
    }
    presume(stream('123|')).toCheckWith(check, '123|')
  })
})
