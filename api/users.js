import router from './router'
import User from '../data/users'
import password from '../data/password'
import mongoose from 'mongoose'

const externalizeSelf = user => ({
    id: user._id,
    name: user.name,
    email: user.email,
    type: user.type,
})

const externalize = user => ({
    id: user._id,
    name: user.name,
    type: user.type,
})

router.get('/users/:id', async (req, res) => {
    let user = (((req.session || {}).user || {})._id || '') + ''
    if (!user) return res.status(401).json({ message: 'Необходимо войти' })

    let valid = mongoose.Types.ObjectId.isValid(req.params.id)
    if (!valid) return res.status(404).json({ message: 'Не найден' })

    let result = await User.findOne({ _id: req.params.id })
    if (!result) return res.status(404).json({ message: 'Не найден' })

    res.json({ ...externalize(result) })
})

router.post('/register', async (req, res) => {
    let user = await User.findOne({ name: req.body.user })

    let exists = !!user
    if (exists) return res.status(401).json({ message: 'Уже существует' })

    try {
        var pass = await password.encode(req.body.pass)
    } catch (e) {
        return res.status(401).json({ message: e.message })
    }

    user = new User({
        name: req.body.user,
        email: req.body.user,
        pass,
    })
    await user.save()
    user = await User.findOne({ name: user.name })

    req.session.user = user
    res.json(externalizeSelf(user))
})

router.post('/login', async (req, res) => {
    let user = await User.findOne({ name: req.body.user })
    if (!user) return res.status(401).json({ message: 'Неверные данные для входа' })

    try {
        var valid = await password.compare(user.pass, req.body.pass)
    } catch (e) {
        return res.status(401).json({ message: e.message })
    }
    if (!valid) return res.status(401).json({ message: 'Неверные данные для входа' })

    req.session.user = user
    res.json(externalizeSelf(user))
})

router.post('/logout', async (req, res) => {
    delete req.session.user
    res.json({ ok: true })
})
