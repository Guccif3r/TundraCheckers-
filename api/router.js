import express from 'express'

const router = express.Router()
const app = express()
router.use((req, res, next) => {
    Object.setPrototypeOf(req, app.request)
    Object.setPrototypeOf(res, app.response)
    req.res = res
    res.req = req
    next()
})

let handle = (o, f) =>
    function() {
        let args = Array.from(arguments)
        let handler = args[args.length - 1]
        let catcher = async function() {
            try {
                let r = handler.apply(this, arguments)
                if (r && r.then) r = await r
                return r
            } catch (e) {
                console.error(e.stack)
                let res = arguments[1]
                res.status(500).json({ message: `Неизвестная ошибка` })
            }
        }
        args[args.length - 1] = catcher
        f.apply(o, args)
    }
let { get, post, all } = router
router.get = handle(router, get)
router.post = handle(router, post)
router.all = handle(router, all)

export default router
