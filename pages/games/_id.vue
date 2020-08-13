<template>
    <field :id="id" :initial="state" :usernames="usernames" />
</template>

<script>
import socket from '~/plugins/socket.io.js'
import Field from '~/components/Field.vue'

async function getGame($axios, id, users) {
    try {
        if (!id) return {}

        let { data } = await $axios.get(`/api/games/${id}`)
        var game = (data || {}).game
        if (!game) return {}
    } catch (e) {
        if ((e.response || {}).status == 404) console.log('Game not found')
        else console.log(e)
    }

    if (users)
        try {
            var { data: w } = await $axios.get(`/api/users/${game.white}`)
            var { data: b } = await $axios.get(`/api/users/${game.black}`)
        } catch (e) {
            console.log(e.message)
        }
    return { game, usernames: [w, b].filter(i => i) }
}

export default {
    middleware: 'auth',
    components: { Field },

    data: _ => ({}),

    methods: {
        async update() {
            let { game } = await getGame(this.$axios, this.id)
            let same = JSON.stringify(game) == JSON.stringify(this.state)
            if (same) return
            this.state = game
        },
    },

    async asyncData({ $axios, params: { id } }) {
        let { game, usernames } = await getGame($axios, id, 'users')
        return { id: (game || {})._id, state: game, usernames }
    },

    async fetch({ store, params }) {
        await store.dispatch('games/get')
    },

    mounted() {
        socket.on(`game-updated-${this.id}`, this.update)
    },
}
</script>
