const tap = require('tap')
const IdPool = require('./')

tap.test('single growth', t => {
  let pool
  let id

  t.test('construct', t => {
    pool = new IdPool()
    t.ok(pool)
    t.end()
  })

  t.test('reserve', t => {
    id = pool.reserve()
    t.equal(id, 1)
    t.end()
  })

  t.test('release', t => {
    pool.release(id)
    t.deepEqual(pool.available, [ 1 ])
    t.end()
  })

  t.test('release event', t => {
    pool.on('release', released => {
      t.equal(released, id)
      t.end()
    })
    const id = pool.reserve()
    pool.release(id)
  })

  t.end()
})

tap.test('fractional growth', t => {
  const pool = new IdPool(IdPool.FractionalGrowth(0.5, 3, 6))
  t.ok(pool)

  let id

  t.test('first growth', t => {
    id = pool.reserve()
    t.deepEqual(pool.available, [ 2, 3 ])
    t.end()
  })

  t.test('release first id', t => {
    pool.release(id)
    t.deepEqual(pool.available, [ 2, 3, 1 ])
    t.end()
  })

  const ids = []
  t.test('second growth', t => {
    ids.push(pool.reserve())
    ids.push(pool.reserve())
    ids.push(pool.reserve())
    ids.push(pool.reserve())
    t.deepEqual(pool.available, [ 5, 6 ])
    t.end()
  })

  t.test('release second growth', t => {
    for (let id of ids) {
      pool.release(id)
    }
    t.deepEqual(pool.available, [ 5, 6, 2, 3, 1, 4 ])
    t.end()
  })

  t.end()
})
