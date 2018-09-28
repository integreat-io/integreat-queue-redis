import test from 'ava'
import sinon from 'sinon'

import queue from '..'

test('should exist', (t) => {
  const q = queue()

  t.truthy(q)
  t.is(typeof q.bindToQueue, 'function')
})

test('should register handler', async (t) => {
  const bee = { process: sinon.spy() }
  const q = queue({ queue: bee })
  const handler = sinon.stub()
  const data = {}

  q.bindToQueue(handler)

  t.is(bee.process.callCount, 1)
  const processFn = bee.process.args[0][1]
  await processFn({ data })
  t.true(handler.calledOnce)
  t.true(handler.calledWith(data))
})

test('should use maxConcurrency', (t) => {
  const bee = { process: sinon.spy() }
  const q = queue({ queue: bee, maxConcurrency: 5 })
  const handler = () => {}

  q.bindToQueue(handler)

  t.is(bee.process.args[0][0], 5)
})

test('should return push method', async (t) => {
  const q = queue()
  const handler = sinon.stub()

  const push = q.bindToQueue(handler)

  t.is(typeof push, 'function')
  t.deepEqual(push, q.push)
})
