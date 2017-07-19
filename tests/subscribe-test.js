import test from 'ava'
import sinon from 'sinon'

import redis from '..'

test('should call subscribed handler with job data', async (t) => {
  const kue = {process: sinon.spy()}
  const handler = sinon.stub().returns(Promise.resolve())
  const done = sinon.spy()
  const data = {}
  const queue = redis({queue: kue})

  queue.subscribe(handler)

  t.true(kue.process.calledOnce)
  t.true(kue.process.calledWith('great'))
  const processFn = kue.process.args[0][2]
  await processFn({data}, {}, done)
  t.true(handler.calledOnce)
  t.true(handler.calledWith(data))
  t.true(done.calledOnce)
})

test('should call subscribed with maxConcurrency', (t) => {
  const kue = {process: sinon.spy()}
  const handler = () => {}
  const queue = redis({queue: kue, maxConcurrency: 5})

  queue.subscribe(handler)

  t.is(kue.process.args[0][1], 5)
})

test('should unsubscribe', async (t) => {
  const kue = {process: sinon.spy()}
  const handler = sinon.stub().returns(Promise.resolve())
  const ctx = {pause: sinon.spy()}
  const queue = redis({queue: kue})

  const handle = queue.subscribe(handler)
  queue.unsubscribe(handle)

  const processFn = kue.process.args[0][2]
  await processFn({}, ctx, () => {})
  t.false(handler.called)
  t.true(ctx.pause.calledOnce)
  t.notThrows(() => {
    ctx.pause.args[0][1]()
  })
})
