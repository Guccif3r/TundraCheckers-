import '../data/extensions'
import router from './router'
import Game from '../data/games'
import User from '../data/users'
import Waiter from '../data/waiters'

import Logic from '../data/logic'

let any = user => [{ white: user }, { black: user }]

router.get('/games', async (req, res) => {
    let user = (((req.session || {}).user || {})._id || '') + ''
    if (!user) return res.status(401).json({ message: 'Необходимо войти' })

    let games = await Game.find({ $or: any(user) })

    res.json({ games })
})

router.post('/games', async (req, res) => {
    let usero = (req.session || {}).user || {}
    let user = usero._id || ''
    if (!user) return res.status(401).json({ message: 'Необходимо войти' })

    let opponent = req.body.opponent
    if (!opponent)
        return res.status(404).json({ message: 'Соперник не указан' })
    let oppouser = await User.findOne({ _id: opponent })
    if (!oppouser)
        return res.status(404).json({ message: 'Соперник не существует' })
    if (oppouser.type == usero.type)
        return res.status(400).json({ message: 'Неверный тип соперника' })

    let [white, black] = [user, opponent].shuffle()
    let isBotter = u =>
        (u == opponent && oppouser.type == 'botter') ||
        (u == user && usero.type == 'botter') ||
        false
    let botter = isBotter(white) ? 'white' : isBotter(black) ? 'black' : null

    let game = Object.assign({}, Logic.blank(), { white, black, botter })
    game = new Game(game)
    await game.save()
    await Waiter.updateOne({ user: opponent }, { $set: { game: game._id } })

    res.json({ ok: true, id: game._id + '' })
})

router.get('/games/:id', async (req, res) => {
    let user = (((req.session || {}).user || {})._id || '') + ''
    if (!user) return res.status(401).json({ message: 'Необходимо войти' })

    let _id = (req.params.id.match(/(.{20,})/) || [])[0]
    if (!_id) return res.status(404).json({ message: 'Игра не указана' })

    let game = await Game.findOne({ _id, $or: any(user) })
    if (!game) return res.status(404).json({ message: 'Игра не найдена' })

    res.json({ game })
})

router.post('/games/:id', async (req, res) => {
    let user = (((req.session || {}).user || {})._id || '') + ''
    if (!user) return res.status(401).json({ message: 'Необходимо войти' })

    let _id = (req.params.id.match(/(.{20,})/) || [])[0]
    if (!_id) return res.status(404).json({ message: 'Игра не указана' })

    let game = await Game.findOne({ _id, $or: any(user) })
    if (!game)
        return res.status(404).json({ message: `Игра ${_id} не найдена` })

    let forbidden = ['_id', 'created', 'white', 'black', 'botter']
    for (let k of Object.keys(req.body.state))
        if (!forbidden.includes(k)) game[k] = req.body.state[k]
    await game.save()

    res.json({ ok: true })
})

router.get('/game-stats', async (req, res) => {
    let user = (((req.session || {}).user || {})._id || '') + ''
    if (!user) return res.status(401).json({ message: 'Необходимо войти' })

    let aggregate = await Game.aggregate([
        { $group: { _id: '$bot_pct', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
    ])
    let stats = aggregate.map(({ _id, count }) => ({ pct: _id, count }))

    res.json({ stats })
})
