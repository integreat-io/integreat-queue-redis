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

  t.is(typeof q.flush, 'function')
})

test('should flush waiting', async (t) => {
  const job = {}
  const q = t.context.q = queue({namespace: 'flush1'})
  q.push(job)

  await q.flush()

  const jobs = await q.queue.getJobs('waiting', page)
  t.is(jobs.length, 0)
})

test('should flush scheduled', async (t) => {
  const job = {}
  const q = t.context.q = queue({namespace: 'flush2'})
  q.push(job, Date.now() + 60000)

  await q.flush()

  const jobs = await q.queue.getJobs('delayed', page)
  t.is(jobs.length, 0)
})

test('should flush more than 25 waiting', async (t) => {
  const job = {}
  const q = t.context.q = queue({namespace: 'flush3'})
  for (let i = 0; i < 26; i++) {
    q.push(job)
  }

  await q.flush()

  const jobs = await q.queue.getJobs('waiting', page)
  t.is(jobs.length, 0)
})
