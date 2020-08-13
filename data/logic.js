/* eslint-disable indent */
import './extensions'

function hydrate(board, w = 8, h = 8) {
    return Array.range(h).map(r =>
        Array.range(w).map(c =>
            r % 2 != c % 2 ? '_' : board[(r * 8 + c - (c % 2)) / 2]
        )
    )
}

function visualize(board, w = 8, h = 8) {
    return hydrate(board, w, h)
        .map(r => r.join(' '))
        .reverse()
        .join('\n')
        .replace(/_/g, '-')
}

let letters = 'abcdefghijklmnopqrstuvwxyz'
let fx = x => letters[x]
let fy = y => y + 1

let a2p = ([x, y]) => fx(x) + fy(y)
let p2a = p => {
    let [ok, x, y] = p.match(/^([a-z])([0-9]+)$/)
    return ok && [letters.indexOf(x), +y - 1]
}

let a2i = ([x, y]) => Math.floor(x / 2) + y * 4
let i2a = i => {
    let y = Math.floor(i / 4)
    return [(i % 4) * 2 + (y % 2), y]
}

let m2o = m => {
    let a =
        m &&
        m.match(
            /^([a-z][0-9]+)(-|:\(([a-z][0-9]+)(=([WwBb]))?\))([a-z][0-9]+)$/
        )
    return !a ? null : { src: a[1], dst: a[6], attack: a[3], dead: a[5], m }
}

function blank() {
    return {
        w: 8,
        h: 8,
        board: 'wwwwwwwwwwww________bbbbbbbbbbbb',
        turn: 'white',
    }
}

function victory(state) {
    if (!state.board.match(/w/i)) return 'black'
    if (!state.board.match(/b/i)) return 'white'
    if (!state.moves) return state.turn == 'white' ? 'black' : 'white'
    return undefined
}
function refresh(state) {
    let result = Object.assign({}, state)

    result.moves = listMoves(result)
    result.length = result.history.split(/\s+/).filter(i => i).length
    result.win = result.win || victory(result)
    Object.assign(result, checkbot(result))

    return result
}

function checkbot(state) {
    let history = state.length
    let moves = state.moves.split(/\s/).filter(i => i).length

    let existing = state.bot_guess.split(/\s+/).filter(i => i)
    let offset = state.botter == 'white' ? 1 : 0
    let needed = 0 < Math.ceil((history + offset) / 2) - existing.length || ''
    if (needed) needed = 1 < moves ? '1' : '0'

    let bot_guess = (state.bot_guess + ' ' + needed).trim()
    let all = bot_guess.match(/1([BH]{2})/g) || []
    let bot_total = all.length
    let correct = all.filter(i => i[1] == i[2]).length
    let bot_pct = Math.round((100 * correct) / bot_total) || 0

    return { bot_guess, bot_total, bot_pct }
}
function modboard(state, p, v) {
    let result = Object.assign({}, state)
    let b = result.board.split('')
    b[a2i(p2a(p))] = v
    result.board = b.join('')
    return result
}

function makeMove(state, move) {
    if (state.win || !move) return state

    let empty = '_'
    let sxy2i = (x, y) => a2i([letters.indexOf(x), +y - 1])
    let p2sxy = s => s.match(/([a-z])([0-9]+)/).slice(1)

    let [, sx, sy, rest, dx, dy] = move.match(
        /^([a-z])([0-9]+)(.*)([a-z])([0-9]+):?$/
    )
    let src = sxy2i(sx, sy)
    let dst = sxy2i(dx, dy)

    let result = Object.assign({}, state)
    let modboard = f => {
        let b = result.board.split('')
        f(b)
        result.board = b.join('')
    }
    modboard(b => {
        b[dst] = b[src]
        b[src] = empty
    })

    let kill = (rest.match(/.*\(([a-z])([0-9]+)\)/) || []).slice(1).join('')
    let jump = `(${kill})${dx + dy}`
    result.deads = ((result.deads || '') + ' ' + kill).trim()

    result.piece = dx + dy
    let upgrade =
        (+dy == 1 && result.turn == 'black') ||
        (+dy == state.h && result.turn == 'white')
    if (upgrade)
        modboard(b => {
            let i = sxy2i(dx, dy)
            b[i] = b[i].toUpperCase()
        })

    result.moves = listMoves(result)

    let combo = move.includes(':') && result.moves.includes(':')
    if (combo) {
        result.hops = `${result.hops || sx + sy + ':'}${jump}:`
        return result
    }

    if (result.deads)
        modboard(b => {
            let deads = result.deads.split(' ').map(p => a2i(p2a(p)))
            for (let dead of deads) b[dead] = empty
        })

    result.turn = state.turn == 'white' ? 'black' : 'white'
    result.history = [result.history, result.hops ? result.hops + jump : move]
        .join(' ')
        .trim()
    result.hops = null
    result.piece = null
    result.deads = null
    result.moves = listMoves(result)
    result.win = result.win || victory(result)

    return result
}

function undoMove(state) {
    return state
}

function listMoves(state) {
    if (state.win) return ''

    let board = hydrate(state.board, state.w, state.h)

    let get = ([x, y]) => (board[y] || [])[x]

    let free = c => c == '_'
    let your = c => c.toLowerCase() == state.turn[0]
    let opponent = c => c && !free(c) && !your(c)
    let dead = xy => (state.deads || '').includes(a2p(xy))

    let add = (...points) => [
        points.reduce((s, [x]) => s + x, 0),
        points.reduce((s, [, y]) => s + y, 0),
    ]
    let left = [-1, 0]
    let right = [1, 0]
    let forward = state.turn == 'white' ? [0, 1] : [0, -1]
    let backward = state.turn == 'white' ? [0, -1] : [0, 1]
    let directions = [
        add(forward, left),
        add(forward, right),
        add(backward, left),
        add(backward, right),
    ]
    let opposite = ([x, y]) => [-x, -y]

    let moves = []

    let startFrom = pos => {
        let piece = get(pos)

        if (!your(piece)) return

        let king = piece != piece.toLowerCase()

        let moveline = (dir, start) => {
            let xy = add(start, dir)
            let candidates = []
            while (true) {
                let cell = get(xy)
                if (!cell) break
                if (!free(cell)) break
                candidates.push(xy)
                if (!king) break
                xy = add(xy, dir)
            }
            return [candidates, xy]
        }

        let canStrike = start => dir => {
            let [, last] = moveline(dir, start)
            let oppo = get(last)
            if (!opponent(oppo) || dead(last)) return false
            let next = get(add(last, dir))
            return free(next)
        }
        let canContinue = skip => start =>
            directions.filter(d => d + '' != skip + '').some(canStrike(start))

        let process = (dir, moveable) => {
            let [walks, last] = moveline(dir, pos)
            if (moveable) moves = [...moves, ...walks.map(dst => [pos, dst])]

            let oppo = get(last)
            if (!opponent(oppo) || dead(last)) return

            let [lands] = moveline(dir, last)
            if (king) {
                let continuable = lands.filter(canContinue(opposite(dir)))
                if (continuable.length) lands = continuable
            }
            moves = [...moves, ...lands.map(dst => [pos, dst, last])]
        }

        process(add(forward, left), 'moveable')
        process(add(forward, right), 'moveable')
        process(add(backward, left), king ? 'moveable' : false)
        process(add(backward, right), king ? 'moveable' : false)
    }

    if (state.piece) startFrom(p2a(state.piece))
    else
        for (let y of Array.range(8))
            for (let x of Array.range(8)) startFrom([x, y])

    let attacks = moves.filter(([, , attack]) => attack)
    if (attacks.length) moves = attacks

    let fm = m =>
        !m[2]
            ? `${a2p(m[0])}-${a2p(m[1])}`
            : `${a2p(m[0])}:(${a2p(m[2])})${a2p(m[1])}`
    return moves
        .map(fm)
        .order()
        .join(' ')
}

export default {
    a2p,
    p2a,
    m2o,
    a2i,
    i2a,

    hydrate,
    visualize,

    blank,
    refresh,
    victory,
    modboard,

    makeMove,
    undoMove,
    listMoves,
}
