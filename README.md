# most-marble
(WIP/ Proof of concept) Marble testing with most js

## What?

Marble testing is a cool way to test asynchronous streams or observables. Rather than manually subscribing, you simple describe your output in a "marble" diagram. It looks like this:

```js
const input$ = stream('-1-2-3|')
const expected = '     01-3-6|'
presume(input$.scan(add, 0)).toBe(expected)
```

`presume` is like the expect for streams. In this example we simply applied the scan operator with adding and declared what the output stream would be.

It also works with periodic functions very well:

```js
const period$ = periodic(1000)
  .constant(1)
  .scan(add, 0)
  .skip(1)
  .take(5)
presume(period$).toBe('1234(5|)')
```

This does all of the testing without having to wait for 1000 ms to go by.

In order to do any of the testing, one needs a testing enviroment. `TestEnviroment` is the enviroment required, but using it manually is a little annoying, so I have a helper function.

`itenv` is simply `it` from jest wrapped to pass `presume` and `stream` to the callback, example:

```js
itenv('should create a stream and be equal to itself', (presume, stream) => {
  const stream$ = stream('a-b-c|')
  presume(stream$).toBe(' a-b-c|')
})
```

`stream` constructs a stream from the values given. If a values object is passed as a second parameter, values from that object are used (as a map). Example: 

```js
itenv('should work with custom values', (presume, stream) => {
  const a$ = stream('ab#', { a: 'hello', b: 'wow', error: new Error('yikes') })
  presume(a$).toThrow(new Error('yikes'))
  presume(a$).toBeArray(['hello', 'wow'])
  presume(a$).toBe('ab#', { a: 'hello', b: 'wow', error: new Error('yikes') })
})
```

`itenv` also takes an optional "middle" option, the frameFactor. The frame factor is what every frame means in miliseconds. For example with a frame factor of 1000:

```
--a-b---c
```

This means wait 2 seconds and emit 'a', wait 1 second and emit 'b' and wait 3 seconds and emit 'c'

So, in order to get the above periodic example working:

```js
itenv('should test a periodic function', 1000, presume => {
  const period$ = periodic(1000)
    .constant(1)
    .scan((acc, v) => acc + v, 0)
    .skip(1)
    .take(5)
  presume(period$).toBe('1234(5|)')
})
```

`presume` also has many nice helper methods with it, including `toThrow`, `toStartWith`, `toEndWith`, `toContain`, `toMatchSnapshot` (jest snapshots), `toHaveLength`, `toCheckWith`, `toBeArray`, `toBeOnly` and `toBeEmpty`. I also added `.not`, so you can make assertions like this:

```js
itenv('should handle the example in the readme', (presume, stream) => {
  presume(stream('a|')).not.toBeEmpty()
  presume(stream('a|')).toBeOnly('a')
})
```

## Syntax

The syntax for marble testing with most is mostly the same as rxjs, simply missing subscriptions.

- `"-"` time: Passage of time by amount put in the test enviroment.
- `"|"` complete: Emits a complete event.
- `"#"` error: Emits an error.
- `"a"` any character or number: Emits a value, if the character is in the values object, it emits what is in the values object for that character, otherwise it will emit a number if it is a number, or simply the character.
- `"()"` grouping: A group of events fired on a single frame, if you have any of the complete, error or nexts in this, it emits as a single frame rather than spread across multiple frames.
- `" "` skip: A space does absolutely nothing. It can be used for alignment.

Examples above or in my tests.

## Using

I don't have an npm package or anything, this is simply a WIP for now.

## Not currently working or covered

- Streams without an explicit end or error
- Higher order streams
- Hot streams
- Subscription handling
