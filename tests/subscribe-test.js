import test from 'ava'
import sinon from 'sinon'

import queue from '..'

test('should call subscribed handler with job data', async (t) => {
  const bee = {process: sinon.spy()}
  const handler = sinon.stub().returns(Promise.resolve())
  const data = {id: 'job1'}
  const q = queue({queue: bee})

  q.subscribe(handler)

  t.is(bee.process.callCount, 1)
  const processFn = bee.process.args[0][1]
  await processFn({data})
  t.is(handler.callCount, 1)
  t.deepEqual(handler.args[0][0], data)
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

test('should set job id on data', async (t) => {
  const bee = {process: sinon.spy()}
  const handler = sinon.stub().returns(Promise.resolve())
  const id = 'job2'
  const data = {}
  const q = queue({queue: bee})

  q.subscribe(handler)
  const processFn = bee.process.args[0][1]
  await processFn({data, id})
  const calledData = handler.args[0][0]

  t.is(calledData.id, 'job2')
})

test('should not overwrite data.id', async (t) => {
  const bee = {process: sinon.spy()}
  const handler = sinon.stub().returns(Promise.resolve())
  const id = 'job2'
  const data = {id: 'job1'}
  const q = queue({queue: bee})

  q.subscribe(handler)
  const processFn = bee.process.args[0][1]
  await processFn({data, id})
  const calledData = handler.args[0][0]

  t.is(calledData.id, 'job1')
})
