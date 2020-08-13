<template>
    <v-container flex-column fluid>
        <v-row justify="center" align="center">
            <v-col cols="12">
                <div class="handle">
                    <v-icon v-if="opponent == state.turn" class="icon-turn">mdi-arrow-right-circle</v-icon>
                    <v-icon class="icon-checkers">{{ userchecker(opponent) }}</v-icon>
                    <span class="player-name opponent">{{ username(state[opponent]) }}</span>
                    <span v-if="botter" class="guesspct">{{ `(${state.bot_pct}% угадывает)` }}</span>
                </div>
            </v-col>
        </v-row>
        <v-row justify="center" align="center">
            <div v-if="board" class="grid elevation-8">
                <template v-for="y in order(dims.rows, 'v')">
                    <cell
                        v-for="x in order(dims.cols, 'h')"
                        :key="p(x,y)"
                        :cell="cell(x, y)"
                        :dead="dead(x, y)"
                        :moveable="moveable(x, y)"
                        :selected="selected(x, y)"
                        :targeted="targeted(x, y)"
                        :size="cellSize"
                        @click="clickCell"
                    />
                </template>
            </div>
        </v-row>
        <v-row justify="center" align="center">
            <v-col cols="12">
                <div class="handle">
                    <v-icon v-if="player == state.turn" class="icon-turn">mdi-arrow-right-circle</v-icon>
                    <v-icon class="icon-checkers">{{ userchecker(player) }}</v-icon>
                    <span class="player-name player">{{ username(state[player]) }}</span>
                </div>
            </v-col>
        </v-row>
        <v-row justify="center" align="center">
            <!--<v-btn v-if="!fresh" class="teal" @click="restore">
                    <v-icon>mdi-undo</v-icon>Отменить ход
                </v-btn>
                <v-btn v-if="!fresh" class="red" @click="restart">
                    <v-icon>mdi-restart</v-icon>Новая игра
            </v-btn>-->
            <v-btn v-if="!gameover" color="error" class="mx-1" @click="giveUp">
                <v-icon>mdi-grave-stone</v-icon>Сдаться
            </v-btn>
            <v-btn
                v-if="!gameover && !state.tie"
                color="error"
                class="mx-1"
                outlined
                @click="offerTie"
            >
                <v-icon>mdi-scale-balance</v-icon>Предложить ничью
            </v-btn>
            <v-btn
                v-if="!gameover && state.tie == opponent"
                color="error"
                class="mx-1"
                @click="acceptTie"
            >
                <v-icon>mdi-scale-balance</v-icon>Принять ничью
            </v-btn>
            <v-btn v-if="gameover" color="success" class="mx-1" @click="lobby">
                <v-icon>mdi-office-building</v-icon>Вернуться в игровой зал
            </v-btn>
        </v-row>

        <v-bottom-sheet v-model="botask" persistent width="300">
            <v-card>
                <v-card-title
                    class="headline"
                    primary-title
                >{{ botter ? 'Кто будет ходить?' : 'Кто ходил?' }}</v-card-title>
                <v-divider></v-divider>
                <v-card-actions>
                    <v-btn color="success" text @click="e => botguess('H')">Человек</v-btn>
                    <div class="flex-grow-1"></div>
                    <v-btn color="error" text @click="e => botguess('B')">Бот</v-btn>
                </v-card-actions>
            </v-card>
        </v-bottom-sheet>

        <v-dialog v-model="endmodal.show" width="500">
            <v-card>
                <v-card-title class="headline" primary-title>{{ endmodal.header }}</v-card-title>
                <v-card-text>{{ endmodal.body }}</v-card-text>
                <v-divider></v-divider>
                <v-card-actions>
                    <div class="flex-grow-1"></div>
                    <v-btn color="success" text @click="lobby">Вернуться в игровой зал</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script>
import Cell from '~/components/Cell.vue'
import Logic from '~/data/logic'

export default {
    components: { Cell },

    data: _ => ({
        state: {},
        active: null,
        shown: false,
        dialog: false,
        editing: false,
        endmodal: { show: false, icon: '', header: '', body: '' },
    }),

    props: ['id', 'initial', 'usernames'],

    watch: {
        botask(v) {
            if (v) this.dialog = true
        },
    },

    computed: {
        cellSize() {
            return '0 0 ' + 100 / (this.state.size || 8) + '%'
        },

        player() {
            return this.state.white == this.$store.state.user.id
                ? 'white'
                : 'black'
        },

        opponent() {
            return this.state.white != this.$store.state.user.id
                ? 'white'
                : 'black'
        },

        botter() {
            return this.$store.state.user.type == 'botter'
        },

        reversed() {
            return this.player != 'white'
        },

        gameover() {
            return !!this.state.win
        },

        yourmove() {
            return this.player == this.state.turn
        },

        fresh() {
            return !(this.state.history || '').length
        },

        board() {
            let board = Logic.hydrate(this.state.board)

            let kd = { W: true, B: true }
            let kingf = s => kd[s] || false
            let pd = { W: 'white', w: 'white', B: 'black', b: 'black' }
            let playerf = s => pd[s] || null

            return this.dims.rows
                .map(y =>
                    this.dims.cols.map(x => {
                        let p = this.p(x, y)
                        let c = board[y][x]
                        let odd = !!((x + y) % 2)
                        let player = playerf(c)
                        let empty = !player
                        let king = kingf(c)
                        return { x, y, p, c, odd, empty, player, king }
                    })
                )
                .flat()
                .reduce((d, i) => ((d[i.p] = i), d), {})
        },

        moves() {
            return this.gameover || !this.yourmove
                ? []
                : (this.state.moves || '')
                      .split(' ')
                      .filter(i => i)
                      .map(m => Logic.m2o(m))
        },

        botask() {
            let guess = this.state.bot_guess || ''
            let last =
                guess
                    .split(/\s/)
                    .filter(i => i)
                    .slice(-1)[0] || ''
            let needed = last[0] == '1' && last.length < (this.botter ? 2 : 3)
            let res = !this.gameover && this.yourmove && needed
            return res
        },

        lastMovePositions() {
            let last = (this.state.history || '')
                .split(/\s+/)
                .filter(i => i)
                .slice(-1)[0]
            return last || ''
        },
        showingLastMove() {
            return this.botask && !this.botter
        },

        deads() {
            return (this.state.deads || '').split(' ').filter(i => i)
        },
        targets() {
            if (this.gameover || !this.active) return []
            return this.moves.filter(m => m.src == this.active).map(m => m.dst)
        },

        dims() {
            return { rows: Array.range(8), cols: Array.range(8) }
        },

        userdict() {
            return (this.usernames || []).reduce(
                (d, u) => ((d[u.id] = u.name), d),
                {}
            )
        },
    },

    methods: {
        username(id) {
            let user = (this.usernames || []).filter(u => u.id == id)[0]
            return (user || {}).name || id
        },
        userchecker(color) {
            return color == 'black'
                ? 'mdi-circle'
                : color == 'white'
                ? 'mdi-circle-outline'
                : ''
        },

        order(a, dir) {
            return this.reversed != (dir == 'h')
                ? a
                : a.map((_, i) => a[a.length - 1 - i])
        },

        p(x, y) {
            return Logic.a2p([x, y])
        },
        cell(x, y) {
            let p = this.p(x, y)
            return this.board[p]
        },

        dead(x, y) {
            let p = arguments.length == 1 ? x : this.p(x, y)
            return this.deads.includes(p)
        },
        targeted(x, y) {
            let p = arguments.length == 1 ? x : this.p(x, y)
            return this.showingLastMove
                ? this.lastMovePositions.includes(p)
                : this.targets.includes(p)
        },
        moveable(x, y) {
            let p = arguments.length == 1 ? x : this.p(x, y)
            return this.showingLastMove
                ? false
                : this.moves.some(m => m.src == p)
        },
        selected(x, y) {
            let p = arguments.length == 1 ? x : this.p(x, y)
            return this.showingLastMove ? false : p == this.active
        },

        updateMoves() {
            this.active = null
        },

        clickCell(cell) {
            if (this.gameover) return

            if (this.editing) return this.cycle(cell)

            if (this.targeted(cell.p)) return this.makeMove(cell)
            if (!cell.empty) return this.activate(cell)
        },

        your(cell) {
            return this.player == cell.player
        },

        cycle(cell) {
            let d = { W: 'w', w: 'B', B: 'b', b: '_', _: 'W' }
            this.state = Logic.modboard(this.state, cell.p, d[cell.c])
        },

        activate(cell) {
            if (this.gameover) return (this.active = null)
            if (this.state.piece) return (this.active = this.state.piece)
            if (
                !cell &&
                this.moves.length >= 1 &&
                this.moves.every(m => m.src == this.moves[0].src)
            )
                return (this.active = this.moves[0].src)
            if (!cell || this.active == cell.p) return (this.active = null)
            if (this.your(cell) && this.moveable(cell.p)) this.active = cell.p
        },

        async botguess(answer) {
            this.state = Object.assign({}, this.state, {
                bot_guess: this.state.bot_guess + answer,
            })
            await this.saveState()
        },

        async makeMove(cell) {
            let move = this.moves.filter(
                m => m.src == this.active && m.dst == cell.p
            )[0]
            if (!move) return

            if (this.state.tie == this.opponent)
                this.state = Object.assign({}, this.state, { tie: '' })
            this.state = Logic.makeMove(this.state, move.m)
            this.activate()
            this.showEndMessage()

            await this.saveState()
        },

        async showEndMessage() {
            if (!this.state.win) return
            if (this.shown) return

            this.endmodal.icon =
                this.state.win == 'both'
                    ? 'mdi-scale-balance'
                    : this.state.win == this.player
                    ? 'mdi-star'
                    : 'mdi-emoticon-dead'

            this.endmodal.header =
                this.state.win == 'both'
                    ? 'Ничья!'
                    : this.state.win == this.player
                    ? 'Вы выиграли!'
                    : 'Вы проиграли!'

            let global = this.botter ? null : await this.getGlobalStats()

            this.endmodal.body = this.botter
                ? 'Возвращаемся в игровой зал...'
                : `Правильно дано ${this.state.bot_pct}% из ${this.state.bot_total} ответов` +
                  (!global
                      ? ''
                      : `. Это больше, чем в ${global.betterPct}% игр`)

            if (this.botter) setTimeout(this.lobby, 2000)

            this.endmodal.show = true
            this.shown = true
        },

        async getGlobalStats() {
            try {
                var { data } = await this.$axios.get(`/api/game-stats`)
                var stats = data.stats
                var total = stats.sum(i => i.count) || 0
                var better =
                    stats
                        .filter(i => i.pct < this.state.bot_pct)
                        .sum(i => i.count) || 0
                var betterPct = !total ? 0 : Math.round((100 * better) / total)
            } catch (e) {
                console.log(e.message)
            }
            return !stats ? null : { stats, total, better, betterPct }
        },

        async saveState() {
            let state = this.state
            state = Logic.refresh(state)

            let same = JSON.stringify(state) == JSON.stringify(this.initial)
            if (same) return

            let id = this.id
            if (!id) return await this.create()

            await this.$axios.post(`/api/games/${id}`, { state })
        },

        async load(state) {
            if (!state) return

            let same = JSON.stringify(state) == JSON.stringify(this.state)
            if (same) return

            this.state = state
            this.activate()
            this.showEndMessage()
        },

        async create() {
            let { data } = await this.$axios.post('/api/games', {
                state: this.state,
            })
            let id = (data || {}).id
            if (id) this.$router.push(`/games/${id}`)
        },

        async lobby() {
            await this.$axios.post(`/api/waiters/join`)
            return this.$router.push(`/lobby`)
        },
        async restart() {
            if (this.id) return this.$router.push(`/games`)
            this.state = Logic.blank()
            await this.create()
        },

        restore() {
            this.state = Logic.undoMove(this.state)
        },

        async giveUp() {
            this.state = Object.assign({}, this.state, { win: this.opponent })
            await this.saveState()
        },
        async offerTie() {
            this.state = Object.assign({}, this.state, { tie: this.player })
            await this.saveState()
        },
        async acceptTie() {
            if (this.state.tie != this.opponent) return
            this.state = Object.assign({}, this.state, { win: 'both' })
            await this.saveState()
        },
    },

    watch: {
        initial(v) {
            if (this.initial) this.load(this.initial)
        },
    },

    async created() {
        if (this.initial) this.load(this.initial)
        else this.restart()
    },
    async mounted() {
        if (this.initial) this.load(this.initial)
        await this.saveState()
    },
}
</script>

<style>
.handle {
    text-align: center;
    font-size: 20px;
    font-weight: bold;
}
.handle .player-name,
.handle .guesspct {
    vertical-align: middle;
}
.handle .player-name.player {
    color: hsl(120, 100%, 30%);
}
.handle .player-name.opponent {
    color: hsl(0, 100%, 30%);
}
.handle .guesspct {
    color: grey;
}
.handle .icon-checkers {
    color: black;
}
.handle .icon-turn {
    color: black;
}

.grid {
    display: flex;
    flex-wrap: wrap;

    width: 100%;
    border: 3px solid black;
    max-width: 75vh;
    margin: 10px;
}
</style>
