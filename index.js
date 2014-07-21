module.exports = IdPool

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
function IdPool (algorithm) {
  this.grow = algorithm || IdPool.SingularGrowth()
  this.available = []
  this.index = 1
}

/**
 * @method reserve
 * @returns {Number} Unique id
 */
IdPool.prototype.reserve = function () {
  this.available.length || this.grow()
  return this.available.shift()
}

/**
 * @method release
 * @params {Number} The unique id to release back into the pool
 */
IdPool.prototype.release = function (id) {
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
IdPool.SingularGrowth = function () {
  return function () {
    this.available.push(this.index++)
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
IdPool.FractionalGrowth = function (fraction, lower, upper) {
  return function () {
    var n = Math.ceil(this.index * fraction)
    if (lower) n = Math.max(lower, n)
    if (upper) n = Math.min(upper, n)
    var i = 0

    for (; i < n; i++) {
      this.available.push(this.index++)
    }
  }
}
