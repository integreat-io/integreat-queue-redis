import test from 'ava'

import queue from '..'

const page = {start: 0, end: 0}

test('should push job to queue', async (t) => {
  const job = {}
  const q = queue({namespace: 'push1'})

  const ret = await q.push(job)

  t.truthy(ret)
  t.is(ret.data, job)
  t.is(ret.status, 'created')
  const jobs = await q.queue.getJobs('waiting', page)
  t.is(jobs.length, 1)
  t.is(jobs[0].data, job)

  q.flush()
})

test('should not push null to queue', async (t) => {
  const job = null
  const q = queue({namespace: 'push2'})

  const ret = await q.push(job)

  t.is(ret, null)
  const jobs = await q.queue.getJobs('waiting', page)
  t.is(jobs.length, 0)

  q.flush()
})

test('should schedule job', async (t) => {
  const job = {}
  const q = queue({namespace: 'push3'})
  const timestamp = Date.now() + 60000

  const ret = await q.push(job, timestamp)

  t.truthy(ret)
  t.is(ret.options.delay, timestamp)
  const jobs = await q.queue.getJobs('delayed', page)
  t.is(jobs.length, 1)
  t.is(jobs[0].options.delay, timestamp)

  q.flush()
})

test('should push without schedule on invalid timestamp', async (t) => {
  const job = {}
  const q = queue({namespace: 'push4'})
  const timestamp = 'invalid'

  await t.notThrows(async () => {
    const ret = await q.push(job, timestamp)

    t.truthy(ret)
    t.falsy(ret.options.delay)

    const jobs = await q.queue.getJobs('delayed', page)
    t.is(jobs.length, 0)
  })

  q.flush()
})

test('should not push when queue is closed', async (t) => {
  const job = {}
  const q = queue({namespace: 'push5', queue: {_isClosed: true}})

  await t.notThrows(async () => {
    const ret = await q.push(job)

    t.is(ret, null)
  })
})
