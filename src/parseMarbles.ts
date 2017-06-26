import { Err, Event, End, Next } from './Event'

type Values = { [name: string]: any } | undefined

function getValue(key: string, values: Values) {
  if (typeof values === 'object') {
    return values[key]
  }
  const num = parseInt(key, 10)
  return isNaN(num) ? key : num
}

function getError(values: Values) {
  return values ? values.error : 'error'
}

function validateMarbles(marbles: string) {
  if (marbles.indexOf('|') === -1 && marbles.indexOf('#') === -1) {
    throw new Error(
      `Streams that don't end are currently not supported with marbles`
    )
  }
}

function toEvents(marbles: string, values: Values, frameFactor: number) {
  let frame = 0
  let inGroup = false
  let skippedLast = false
  return marbles.split('').reduce((acc, char, idx) => {
    frame = inGroup || skippedLast ? frame : frame + frameFactor
    skippedLast = false
    if (idx === 0) {
      frame = 0
    }
    // tslint:disable:cyclomatic-complexity
    switch (char) {
      case '-':
        return acc
      case '#':
        return acc.concat(new Err(getError(values), frame))
      case '|':
        return acc.concat(new End(frame))
      case '(':
        inGroup = true
        return acc
      case ')':
        inGroup = false
        return acc
      case ' ':
        skippedLast = true
        return acc
      default:
        return acc.concat(new Next(getValue(char, values), frame))
    }
    // tslint:enable:cyclomatic-complexity
  }, [] as Event[])
}

export function parseMarbles(
  marbles: string,
  values?: Values,
  frameFactor = 10
) {
  validateMarbles(marbles)
  return toEvents(marbles, values, frameFactor)
}
