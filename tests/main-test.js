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

test('should return kue instance', (t) => {
  const kue = {}

  const queue = redis({queue: kue})

  t.is(queue.queue, kue)
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
