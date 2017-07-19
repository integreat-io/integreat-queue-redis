import test from 'ava'
import sinon from 'sinon'

import redis from '..'

test('should call subscribed handler with job data', async (t) => {
  const kue = {process: sinon.spy()}
  const queue = redis({queue: kue})
  const handler = sinon.stub().returns(Promise.resolve())
  const done = sinon.spy()
  const data = {}

  queue.subscribe(handler)

  t.true(kue.process.calledOnce)
  t.true(kue.process.calledWith('great'))
  await kue.process.args[0][1]({data}, {}, done)
  t.true(handler.calledOnce)
  t.true(handler.calledWith(data))
  t.true(done.calledOnce)
})

test('should return null from subscribe (no handle)', (t) => {
  const kue = {process: () => {}}
  const queue = redis({queue: kue})
  const handler = async () => {}

  const ret = queue.subscribe(handler)

  t.is(ret, null)
})
