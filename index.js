const EventEmitter = require('events').EventEmitter

class IdPool extends EventEmitter {
  /**
   * IdPool acquires ids that have ensured uniqueness until released.
   *
   *   var pool = new IdPool()
   *   var first = pool.reserve()
   *   var second = pool.reserve()
   *   setImmediate(function () {
   *     pool.release(first)
   *     pool.release(second)
   *   })
   *
   * This default behaviour uses a singular element growth algorithm at each
   * reserve. An alternative algorithm for bounded fractional growth is included
   * in the event that you need to optimize for high-frequency id usage.
   *
   * @constructor
   * @class IdPool
   * @param {Function} algorithm Growth algorithm to use when pool runs dry
   */
  constructor (algorithm) {
    super()
    this.grow = algorithm || IdPool.SingularGrowth()
    this.available = []
  }

  /**
   * @method reserve
   * @returns {Number} Unique id
   */
  reserve () {
    if (!this.available.length) this.grow()
    return this.available.shift()
  }

  /**
   * @method release
   * @params {Number} The unique id to release back into the pool
   */
  release (id) {
    this.emit('release', id)
    this.available.push(id)
  }

  //
  // Growth algorithms
  //

  /**
   * Singular
   *
   * @method SingularGrowth
   */
  static SingularGrowth () {
    let index = 1
    return function () {
      this.available.push(index++)
    }
  }

  /**
   * Fractional with optional bounds
   *
   * @method FractionalGrowth
   * @param {Number} fraction Percentage of pool to attempt to grow by
   * @param {Number} lower Minimum required growth per call
   * @param {Number} upper Maximum allowed growth per call
   */
  static FractionalGrowth (fraction, lower, upper) {
    let index = 1
    return function () {
      let n = Math.ceil(index * fraction)
      if (lower) n = Math.max(lower, n)
      if (upper) n = Math.min(upper, n)
      for (let i = 0; i < n; i++) {
        this.available.push(index++)
      }
    }
  }
}

module.exports = IdPool
