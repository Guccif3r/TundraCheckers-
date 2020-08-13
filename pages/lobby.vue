<template>
    <v-container fill-height>
        <v-layout justify-center align-center>
            <v-flex text-center>
                <v-snackbar v-model="show" color="success" :timeout="5000" top>{{ message }}</v-snackbar>
                <v-row justify-center>
                    <v-col cols="12">
                        <v-btn
                            v-if="!waiting"
                            :loading="loading"
                            :disabled="loading"
                            x-large
                            color="primary"
                            @click="join"
                        >Ждать соперника</v-btn>
                        <v-btn
                            v-else
                            :loading="loading"
                            :disabled="loading"
                            x-large
                            outlined
                            color="primary"
                            @click="leave"
                        >Перестать ждать соперника</v-btn>
                    </v-col>
                </v-row>
                <v-card>
                    <v-simple-table fixed-header>
                        <thead>
                            <tr>
                                <th class="text-center">Игрок</th>
                                <th class="text-center">Ожидает</th>
                                <th class="text-center"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="player in list" :key="player.user">
                                <td>{{ player.name }}</td>
                                <td>{{ player.joined | ago(now, true) }}</td>
                                <td>
                                    <v-btn
                                        v-if="player.user != self.id"
                                        :loading="loading"
                                        :disabled="loading"
                                        color="primary"
                                        @click="e => create(player.user)"
                                    >
                                        <v-icon>mdi-play</v-icon>Играть
                                    </v-btn>
                                </td>
                            </tr>
                        </tbody>
                    </v-simple-table>
                </v-card>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
import socket from '~/plugins/socket.io.js'

async function getWaiters($axios) {
    try {
        var { data } = await $axios.get(`/api/waiters`)
    } catch (e) {
        console.log(e.message)
    }
    return (data || {}).waiters
}

export default {
    middleware: 'auth',

    data: _ => ({
        loading: false,
        creating: false,

        show: false,
        message: false,

        timern: null,
        now: +Date.now(),
    }),

    computed: {
        self() {
            return this.$store.state.user
        },
        waiting() {
            return this.waiters.filter(w => w.user == this.self.id)[0]
        },
        list() {
            return this.waiters.filter(
                w => w.user == this.self.id || w.type != this.self.type
            )
        },
        invited() {
            return (this.waiting || {}).game
        },
    },

    watch: {
        async invited(game) {
            this.start(game)
        },
    },

    methods: {
        async refresh() {
            let waiters = await getWaiters(this.$axios)
            if (waiters) this.waiters = waiters
        },
        async waiterAction(action) {
            await this.$axios.post(`/api/waiters/${action}`)
            await this.refresh()
        },

        async join() {
            this.loading = true
            try {
                await this.waiterAction('join')
            } catch (e) {
                console.log(e.message)
            }
            this.loading = false
        },

        async leave() {
            this.loading = true
            try {
                await this.waiterAction('leave')
            } catch (e) {
                console.log(e.message)
            }
            this.loading = false
        },

        async start(game) {
            if (!game) return
            this.message = 'Заходим в игру!'
            this.show = true
            await this.waiterAction('leave')
            setTimeout(_ => this.$router.push(`/games/${game}`), 2000)
        },

        async create(user) {
            this.loading = true
            this.creating = true
            try {
                let { data } = await this.$axios.post(`/api/games`, {
                    opponent: user,
                })
                let game = (data || {}).id
                if (!game) throw new Error('Failed to create game')
                await this.start(game)
            } catch (e) {
                console.log(e.message)
            }
            this.creating = false
            this.loading = false
        },
    },

    async asyncData({ $axios, params: { id } }) {
        let waiters = (await getWaiters($axios, id)) || []
        return { waiters }
    },

    async fetch({ store, params }) {
        await store.dispatch('games/get')
    },

    mounted() {
        this.timer = setInterval(_ => (this.now = +Date.now()), 1000)
        socket.on(`waiter-updated`, this.refresh)
    },
    beforeDestroy() {
        clearInterval(this.timer)
    },
}
</script>

<style>
</style>
