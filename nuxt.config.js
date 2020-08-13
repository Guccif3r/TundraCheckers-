require('dotenv').config()

import bodyParser from 'body-parser'
import session from 'express-session'
import cs from './data/cs'
import pkg from './package'

const MongoStore = require('connect-mongo')(session)

export default {
    mode: 'universal',

    head: {
        title: pkg.name,
        meta: [
            { charset: 'utf-8' },
            {
                name: 'viewport',
                content: 'width=device-width, initial-scale=1',
            },
        ],
    },

    plugins: ['~/plugins/filters.js'],

    server: { timing: { total: process.env.NODE_ENV !== 'production' } },

    modules: ['~/data/db', '~/data/socket'],
    buildModules: ['@nuxtjs/axios', '@nuxtjs/toast', '@nuxtjs/vuetify'],
    build: { extractCSS: true, watch: ['api/**/*.js', 'data/**/*.js'] },

    axios: { credentials: true },

    env: {
        WS_URL: process.env.WS_URL || 'http://localhost:3000',
        API_URL: process.env.API_URL || 'http://localhost:3000',
    },

    serverMiddleware: [
        bodyParser.json(),
        session({
            secret: 'super-secret-key',
            resave: false,
            saveUninitialized: false,
            cookie: { maxAge: 24 * 60 * 60 * 1000 },
            store: new MongoStore({
                url: cs,
                mongoOptions: { useUnifiedTopology: true },
            }),
        }),
        '~/api',
    ],
}
