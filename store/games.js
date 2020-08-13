export const state = () => ({
    list: [],
})

export const mutations = {
    setGames(state, games) {
        state.list = games
    },
}

export const actions = {
    async get({ commit }) {
        try {
            let { games } = await this.$axios.$get('/api/games')
            commit('setGames', games)
        } catch (e) {
            console.log(e.message)
        }
    },
}
