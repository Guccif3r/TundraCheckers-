<template>
    <v-app dark>
        <v-navigation-drawer v-model="drawer" fixed clipped app>
            <v-list>
                <v-list-item
                    v-for="item in items"
                    :key="item.text"
                    link
                    @click="$router.push(item.link)"
                >
                    <v-list-item-action>
                        <v-icon>{{ item.icon }}</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>{{ item.text }}</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-subheader v-if="games" class="mt-3 grey--text text--darken-1 text-uppercase">Игры</v-subheader>
                <v-list v-if="games">
                    <v-list-item
                        v-for="game in games"
                        :key="game._id"
                        link
                        @click="$router.push(`/games/${game._id}`)"
                    >
                        <v-list-item-action>
                            <v-icon>{{ gameIcon(game) }}</v-icon>
                        </v-list-item-action>
                        <v-list-item-title
                            v-text="`${game.created.slice(11,19)}, ${(game.history||'').split(/\s/).length} ход`"
                        />
                    </v-list-item>
                </v-list>
            </v-list>
        </v-navigation-drawer>
        <v-app-bar color="primary" dense fixed clipped-left app>
            <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
            <img class="logo" src="../images/logo.png" />
            <v-toolbar-title class="mr-5 align-center">
                <span class="title">Тундра</span>
            </v-toolbar-title>
            <v-spacer />
        </v-app-bar>
        <v-content>
            <Nuxt />
        </v-content>
    </v-app>
</template>

<script>
export default {
    head: { title: 'Тундра' },
    data: _ => ({
        drawer: false,
        items: [
            //{
            //    icon: 'mdi-gamepad-variant-outline',
            //    text: 'New Game',
            //    link: '/game',
            //},
            {
                icon: 'mdi-office-building',
                text: 'Игровой зал',
                link: '/lobby',
            },
            {
                icon: 'mdi-login',
                text: 'Войти',
                link: '/sign-in',
            },
        ],
    }),
    computed: {
        games() {
            let games = this.$store.state.games.list
            return games && games.length ? games : null
        },
    },
    methods: {
        gameIcon(game) {
            if (!game) return ''
            let user = this.$store.state.user.id
            let player =
                game.white == user ? 'white' : game.black == user ? 'black' : ''
            if (!player) return ''
            return !game.win && game.turn == player
                ? 'mdi-gamepad-square'
                : !game.win && game.turn != player
                ? 'mdi-gamepad-square-outline'
                : game.win == 'both'
                ? 'mdi-scale-balance'
                : game.win == player
                ? 'mdi-star'
                : 'mdi-emoticon-dead'
        },
    },
}
</script>

<style>
.logo {
    width: 44px;
    height: 44px;
}
</style>
