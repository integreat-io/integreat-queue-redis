import test from 'ava'
import sinon from 'sinon'

import redis from '..'

test('should call subscribed handler with job data', async (t) => {
  const bee = {process: sinon.spy()}
  const handler = sinon.stub().returns(Promise.resolve())
  const data = {}
  const queue = redis({queue: bee})

  queue.subscribe(handler)

  t.is(bee.process.callCount, 1)
  const processFn = bee.process.args[0][1]
  await processFn({data})
  t.true(handler.calledOnce)
  t.true(handler.calledWith(data))
})

test('should call subscribed with maxConcurrency', (t) => {
  const bee = {process: sinon.spy()}
  const handler = () => {}
  const queue = redis({queue: bee, maxConcurrency: 5})

  queue.subscribe(handler)

  t.is(bee.process.args[0][0], 5)
})

test('should unsubscribe', async (t) => {
  const bee = {close: sinon.spy()}
  const queue = redis({queue: bee})

  queue.unsubscribe()

  t.is(bee.close.callCount, 1)
})
