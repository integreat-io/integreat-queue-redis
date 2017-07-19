import test from 'ava'
import kue from 'kue'

import redis from '..'

// Helpers

const kueue = kue.createQueue()

test.before((t) => {
  kueue.testMode.enter()
})

test.afterEach.always((t) => {
  kueue.testMode.clear()
})

test.after.always((t) => {
  kueue.testMode.exit()
})

// Tests

test.serial('should push job to queue', async (t) => {
  const job = {}
  const queue = redis()

  const ret = await queue.push(job)

  t.is(kueue.testMode.jobs.length, 1)
  t.is(kueue.testMode.jobs[0].data, job)
  t.is(kueue.testMode.jobs[0].type, 'great')
  t.is(ret, kueue.testMode.jobs[0].id)
})

test.serial('should not push null to queue', (t) => {
  const job = null
  const queue = redis()

  queue.push(job)

  t.is(kueue.testMode.jobs.length, 0)
})

test.serial('should schedule job', (t) => {
  const job = {}
  const queue = redis()
  const timestamp = Date.now() + 60000

  queue.push(job, timestamp)

  t.is(kueue.testMode.jobs.length, 1)
  const delay = kueue.testMode.jobs[0]._delay
  t.true(delay <= 60000)
  t.true(delay >= 60000 - 1000) // Gives the test one second wiggle room
})

test.serial('should push without schedule on invalid timestamp', (t) => {
  const job = {}
  const queue = redis()
  const timestamp = 'invalid'

  t.notThrows((t) => {
    queue.push(job, timestamp)
  })

  t.is(kueue.testMode.jobs.length, 1)
  t.is(kueue.testMode.jobs[0]._delay, undefined)
})
