const Queue = require('bee-queue')
const debug = require('debug')('great:queue')

const flushType = async (queue, type) => {
  const jobs = await queue.getJobs(type, {start: 0, end: 24})
  const p = await Promise.all(jobs.map((job) => queue.removeJob(job.id)))
  if (jobs.length >= 25) {
    await flushType(queue, type)
  }
  return p
}

/**
 * Returns a queue backed by Redis, built on Bee-Queue.
 * @param {Object} options - Options object (queue - instance to use, bee - options for bee-queue, namespace)
 * @returns {Object} integreat-compatible queue object
 */
module.exports = function (options = {}) {
  const {
    maxConcurrency = 1,
    namespace = 'great',
    redis,
    bee
  } = options

  const settings = Object.assign({activateDelayedJobs: true, redis}, bee)
  const queue = (options.queue) ? options.queue : new Queue(namespace, settings)

  debug('Redis queue created for namespace %s, max concurrency %s.', namespace, maxConcurrency)

  const q = {
    queue,
    namespace,

    /**
     * Given a handler function, this function will return the push method.
     * Primary use is to bind to integreat by passing in this function when
     * setting up an Integreat instance.
     * @param {function} handler - Handler function
     * @returns {function} Push function
     */
    bindToQueue (handler) {
      queue.process(maxConcurrency, async (job) => {
        return handler(job.data)
      })

      debug('Bound to queue with handler `%o`.', handler)
      return q.push
    },

    /**
     * Push a job to the queue. If a timestamp is included, the job is
     * scheduled for that time. If not, the action is «scheduled» for right now.
     * @param {Object} payload - Job to schedule
     * @param {integer} timestamp - Timestamp to schedule action for
     * @returns {Object} Job
     */
    async push (payload, timestamp) {
      if (!payload) {
        return null
      }

      if (queue._isClosed) {
        debug('Queue is closed.')
        return null
      }

      const job = queue.createJob(payload)
      const time = (timestamp) ? new Date(timestamp) : null
      if (time && !isNaN(time.getTime())) {
        await job.delayUntil(time).save()
        debug('Scheduled %o for %s.', payload, time)
      } else {
        await job.save()
        debug('Queued %o.', payload)
      }

      return job.id
    },

    /**
     * Subscribe to queue. Whenever a scheduled time is reached,
     * subscribed handlers are called with the respective action.
     * Return a subscription handle, used for unsubscribing.
     * @param {function} handler - Function to receive the action
     * @returns {object} Subscription handle (or null)
     */
    subscribe (handler) {
      queue.process(maxConcurrency, async (job) => {
        return handler(job.data)
      })

      debug('Subscribed `%o`.', handler)
      return null
    },

    /**
     * Unsubscribe from scheduler queue. Subscription is identified with the
     * handler from the `subscribe` method.
     * @param {object} handle - Subscription handle
     * @returns {void}
     */
    unsubscribe (handle) {
      queue.close()
      debug('Unubscribed handle %s.', handle)
    },

    /**
     * Flush all queued jobs, i.e. waiting and scheduled.
     * Active jobs are not flushed.
     * @returns {Promise}
     */
    async flush () {
      return Promise.all([
        flushType(queue, 'waiting'),
        flushType(queue, 'delayed')
      ])
    },

    /**
     * Flush all scheduled jobs.
     * @returns {Promise}
     */
    async flushScheduled () {
      return flushType(queue, 'delayed')
    }
  }

  return q
}
