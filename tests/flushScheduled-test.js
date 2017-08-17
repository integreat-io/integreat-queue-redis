import test from 'ava'

import queue from '..'

const page = {start: 0, end: 0}

test.afterEach((t) => {
  const q = t.context.q
  if (q) {
    return q.queue.destroy()
  }
})

test('should exist', (t) => {
  const q = queue()

  t.is(typeof q.flushScheduled, 'function')
})

test('should flush scheduled', async (t) => {
  const job = {}
  const q = t.context.q = queue({namespace: 'scheduled1'})
  q.push(job, Date.now() + 60000)

  await q.flushScheduled()

  const jobs = await q.queue.getJobs('delayed', page)
  t.is(jobs.length, 0)
})

test('should only flush scheduled', async (t) => {
  const job = {}
  const q = t.context.q = queue({namespace: 'scheduled2'})
  q.push(job)

  await q.flushScheduled()

  const jobs = await q.queue.getJobs('waiting', page)
  t.is(jobs.length, 1)
})

test('should flush more than 25 scheduled', async (t) => {
  const job = {}
  const q = t.context.q = queue({namespace: 'scheduled3'})
  for (let i = 0; i < 26; i++) {
    q.push(job, Date.now() + 60000)
  }

  await q.flushScheduled()

  const jobs = await q.queue.getJobs('delayed', page)
  t.is(jobs.length, 0)
})
