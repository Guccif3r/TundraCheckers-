if (!Array.prototype.flat)
    Array.prototype.flat = function() {
        return [].concat.apply([], this)
    }

Array.range = n => [...new Array(n)].map((_, i) => i)

Array.prototype.shuffle = function(swap) {
    let a = this
    swap =
        swap ||
        ((a, i, j) => {
            let t = a[i]
            a[i] = a[j]
            a[j] = t
        })
    for (let i = a.length; i; i--) swap(a, i - 1, Math.floor(Math.random() * i))
    return a
}

Array.prototype.count = function(map) {
    map = map || (i => i)
    return this.filter(map).length
}
Array.prototype.sum = function(map) {
    return this.reduce((s, i) => s + (map ? map(i) : i), 0)
}
Array.prototype.avg = function(map) {
    return this.sum(map) / this.length
}

Array.prototype.min = function(map) {
    let i = this.length,
        min = undefined
    map = map || (i => i)
    while (i--) if (min == undefined || map(this[i]) < map(min)) min = this[i]
    return min
}
Array.prototype.max = function(map) {
    let i = this.length,
        min = undefined
    map = map || (i => i)
    while (i--) if (min == undefined || map(min) < map(this[i])) min = this[i]
    return min
}
Array.prototype.median = function(map) {
    map = map || (i => i)
    let sorted = this.map(map).order()
    return sorted[Math.floor(sorted.length / 2)]
}

Array.prototype.order = function(field, reverse) {
    field = field || (x => x)
    var keys = field instanceof Array ? field : [field]
    keys = keys.map(k => (!k ? x => x : typeof k === 'string' ? x => x[k] : k))
    if (!keys.length) return this
    return this.sort((a, b) => {
        let i = -1
        while (++i < keys.length) {
            var A = keys[i](a),
                B = keys[i](b)
            if (typeof A !== typeof B)
                (A = (A || '') + ''), (B = (B || '') + '')
            if (A < B || B < A) break
        }
        return (A < B ? -1 : A > B ? 1 : 0) * [-1, 1][+!!reverse]
    })
}
