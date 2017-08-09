const kue = require('kue')
const debug = require('debug')('great:queue')

/**
 * Returns a queue backed by Redis, built on Kue.
 * @param {Object} options - Options object (queue - instance to use, kue - options for kue, namespace)
 * @returns {Object} integreat-compatible queue object
 */
module.exports = function (options = {}) {
  const {
    queue = kue.createQueue(options.kue),
    maxConcurrency = 1,
    namespace = 'great'
  } = options

  let nextHandle = 1
  const unsubscribed = {}

  debug('Redis queue created for namespace %s, max concurrency %s.', namespace, maxConcurrency)

  return {
    queue,
    namespace,

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

      const job = queue.create(namespace, payload)
      const time = (timestamp) ? new Date(timestamp) : null
      if (time) {
        job.delay(time).save()
        debug('Scheduled %o for %s.', payload, time)
      } else {
        job.save()
        debug('Queued %o.', payload)
      }

      return job
    },

    /**
     * Subscribe to queue. Whenever a scheduled time is reached,
     * subscribed handlers are called with the respective action.
     * Return a subscription handle, used for unsubscribing.
     * @param {function} handler - Function to receive the action
     * @returns {object} Subscription handle (or null)
     */
    subscribe (handler) {
      const handle = nextHandle++

      queue.process(namespace, maxConcurrency, async (job, ctx, done) => {
        if (unsubscribed[handle]) {
          return ctx.pause(5000, () => {})
        }

        await handler(job.data)
        done()
      })

      debug('Subscribed %o with handle %s.', handler, handle)
      return handle
    },

    /**
     * Unsubscribe from scheduler queue. Subscription is identified with the
     * handler from the `subscribe` method.
     * @param {object} handle - Subscription handle
     * @returns {void}
     */
    unsubscribe (handle) {
      unsubscribed[handle] = true
      debug('Unubscribed handle %s.', handle)
    }
  }
}
