import test from 'ava'

import queue from '..'

test('should exist', (t) => {
  t.is(typeof queue, 'function')
})

test('should return bee instance', (t) => {
  const bee = {}

  const q = queue({ queue: bee })

  t.is(q.queue, bee)
})

test('should return queue namespace', (t) => {
  const q = queue()

  t.is(q.namespace, 'great')
})

test('should get queue namespace from options', (t) => {
  const options = { namespace: 'greater' }

  const q = queue(options)

  t.is(q.namespace, 'greater')
})
