require('dotenv').config()
const express = require('express')
const { Nuxt, Builder } = require('nuxt')

const host = process.env.HOST || '127.0.0.1'
const port = process.env.PORT || 3000

let config = require('./nuxt.config.js')
config.dev = process.env.NODE_ENV !== 'production'

async function start() {
    const nuxt = new Nuxt(config)

    if (config.dev) {
        const builder = new Builder(nuxt)
        await builder.build()
    }

    const app = express()
    app.use(nuxt.render)
    app.listen(port, host)
    console.log(`Server is listening on http://${host}:${port}`)
}
start()
