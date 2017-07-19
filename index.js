const kue = require('kue')

/**
 * Returns a queue backed by Redis, built on Kue.
 * @param {Object} options - Options object (queue - instance to use, kue - options for kue, namespace)
 * @returns {Object} integreat-compatible queue object
 */
module.exports = function (options = {}) {
  const queue = options.queue || kue.createQueue(options.kue)
  const namespace = options.namespace || 'great'

  return {
    queue,
    namespace,

    /**
     * Push a job to the queue. If a timestamp is included, the job is
     * scheduled for that time. If not, the action is «scheduled» for right now.
     * @param {Object} payload - Job to schedule
     * @param {integer} timestamp - Timestamp to schedule action for
     * @returns {void}
     */
    async push (payload, timestamp) {
      if (!payload) {
        return
      }

      const job = queue.create(namespace, payload)
      const time = (timestamp) ? new Date(timestamp) : null
      if (time) {
        job.delay(time).save()
      } else {
        job.save()
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
      queue.process(namespace, async (job, ctx, done) => {
        await handler(job.data)
        done()
      })

      return null
    },

    /**
     * Unsubscribe from scheduler queue. Subscription is identified with the
     * handler from the `subscribe` method.
     * @param {object} handle - Subscription handle
     * @returns {void}
     */
    unsubscribe (handle) {
    }
  }
}
