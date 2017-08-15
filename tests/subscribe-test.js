import test from 'ava'
import sinon from 'sinon'

import queue from '..'

test('should call subscribed handler with job data', async (t) => {
  const bee = {process: sinon.spy()}
  const handler = sinon.stub().returns(Promise.resolve())
  const data = {}
  const q = queue({queue: bee})

  q.subscribe(handler)

  t.is(bee.process.callCount, 1)
  const processFn = bee.process.args[0][1]
  await processFn({data})
  t.true(handler.calledOnce)
  t.true(handler.calledWith(data))
})

test('should call subscribed with maxConcurrency', (t) => {
  const bee = {process: sinon.spy()}
  const handler = () => {}
  const q = queue({queue: bee, maxConcurrency: 5})

  q.subscribe(handler)

  t.is(bee.process.args[0][0], 5)
})

test('should unsubscribe', async (t) => {
  const bee = {close: sinon.spy()}
  const q = queue({queue: bee})

  q.unsubscribe()

  t.is(bee.close.callCount, 1)
})
