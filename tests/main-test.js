import test from 'ava'

import redis from '..'

test('should exist', (t) => {
  t.is(typeof redis, 'function')
})

test('should return integreat-compatible queue object', (t) => {
  const queue = redis()

  t.truthy(queue)
  t.is(typeof queue.push, 'function')
  t.is(typeof queue.subscribe, 'function')
  t.is(typeof queue.unsubscribe, 'function')
})

test('should return bee instance', (t) => {
  const bee = {}

  const queue = redis({queue: bee})

  t.is(queue.queue, bee)
})

test('should return queue namespace', (t) => {
  const queue = redis()

  t.is(queue.namespace, 'great')
})

test('should get queue namespace from options', (t) => {
  const options = {namespace: 'greater'}

  const queue = redis(options)

  t.is(queue.namespace, 'greater')
})
