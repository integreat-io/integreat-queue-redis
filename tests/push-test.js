import test from 'ava'

import queue from '..'

const page = {start: 0, end: 0}

// Helpers

let namescapeCount = 1
const nextNamespace = () => 'push' + namescapeCount++

test.afterEach((t) => {
  const q = t.context.q
  if (q) {
    return q.queue.destroy()
  }
})

// Tests

test('should push job to queue', async (t) => {
  const job = {}
  const q = t.context.q = queue({namespace: nextNamespace()})

  await q.push(job)

  const jobs = await q.queue.getJobs('waiting', page)
  t.is(jobs.length, 1)
  t.is(jobs[0].data, job)
})

test('should return job id', async (t) => {
  const job = {}
  const q = t.context.q = queue({namespace: nextNamespace()})

  const ret = await q.push(job)

  const jobs = await q.queue.getJobs('waiting', page)
  const id = jobs[0].id
  t.is(ret, id)
})

test('should use provided job id', async (t) => {
  const job = {}
  const q = t.context.q = queue({namespace: nextNamespace()})
  const id = 'theid'

  const ret = await q.push(job, null, id)

  const jobs = await q.queue.getJobs('waiting', page)
  t.is(jobs[0].id, id)
  t.is(ret, id)
})

test('should not push null to queue', async (t) => {
  const job = null
  const q = t.context.q = queue({namespace: nextNamespace()})

  const ret = await q.push(job)

  t.is(ret, null)
  const jobs = await q.queue.getJobs('waiting', page)
  t.is(jobs.length, 0)
})

test('should schedule job', async (t) => {
  const job = {}
  const q = t.context.q = queue({namespace: nextNamespace()})
  const timestamp = Date.now() + 60000

  const ret = await q.push(job, timestamp)

  const jobs = await q.queue.getJobs('delayed', page)
  t.is(jobs.length, 1)
  t.is(jobs[0].options.delay, timestamp)
  t.is(ret, jobs[0].id)
})

test('should push without schedule on invalid timestamp', async (t) => {
  const job = {}
  const q = t.context.q = queue({namespace: nextNamespace()})
  const timestamp = 'invalid'

  await t.notThrows(async () => {
    await q.push(job, timestamp)

    const jobs = await q.queue.getJobs('delayed', page)
    t.is(jobs.length, 0)
  })
})

test('should not push when queue is closed', async (t) => {
  const job = {}
  const q = queue({
    namespace: nextNamespace(),
    queue: {_isClosed: true}
  })

  await t.notThrows(async () => {
    const ret = await q.push(job)

    t.is(ret, null)
  })
})
