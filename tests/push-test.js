import test from 'ava'

import m from '..'

const namespace = 'push-test'

test('should push job to queue', async (t) => {
  const job = {}
  const queue = m({namespace})

  const ret = await queue.push(job)

  t.truthy(ret)
  t.is(ret.data, job)
  t.is(ret.status, 'created')
})

test('should not push null to queue', async (t) => {
  const job = null
  const queue = m({namespace})

  const ret = await queue.push(job)

  t.is(ret, null)
})

test('should schedule job', async (t) => {
  const job = {}
  const queue = m({namespace})
  const timestamp = Date.now() + 60000

  const ret = await queue.push(job, timestamp)

  t.truthy(ret)
  t.is(ret.options.delay, timestamp)
})

test('should push without schedule on invalid timestamp', async (t) => {
  const job = {}
  const queue = m({namespace})
  const timestamp = 'invalid'

  await t.notThrows(async () => {
    const ret = await queue.push(job, timestamp)

    t.truthy(ret)
    t.falsy(ret.options.delay)
  })
})

test('should not when queue is closed', async (t) => {
  const job = {}
  const queue = m({queue: {_isClosed: true}})

  await t.notThrows(async () => {
    const ret = await queue.push(job)

    t.is(ret, null)
  })
})
