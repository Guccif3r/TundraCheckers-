import router from './router'
import Waiter from '../data/waiters'
import { socketControl } from '../data/socket'

router.get('/waiters', async (req, res) => {
    let user = (((req.session || {}).user || {})._id || '') + ''
    if (!user) return res.status(401).json({ message: 'Необходимо войти' })

    let waiters = await Waiter.find({
        $or: [{ user }, { game: { $exists: false } }],
    })

    res.json({ waiters })
})

router.post('/waiters/:action', async (req, res) => {
    let usero = (req.session || {}).user || {}
    let user = usero._id || ''
    if (!user) return res.status(401).json({ message: 'Необходимо войти' })

    if (req.params.action == 'join')
        try {
            await new Waiter({
                user,
                name: usero.name,
                type: usero.type,
            }).save()
        } catch (e) {
            console.log(`User ${user} is already waiting`)
        }
    else if (req.params.action == 'leave') {
        let waiter = await Waiter.findOne({ user })
        if (waiter) await waiter.remove()
    } else return res.status(400).json({ message: 'Неизвестное действие' })

    res.json({ ok: true })
})
