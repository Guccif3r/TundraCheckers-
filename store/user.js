import axios from 'axios'

export const state = () => ({
    loggedin: false,
    id: null,
    name: null,
    type: null,
})

export const mutations = {
    setUser(state, user) {
        state.loggedin = !!user
        state.id = user && user._id
        state.name = user && user.name
        state.type = user && user.type
    },
}

export const actions = {
    async session({ commit }, { user }) {
        commit('setUser', user)
    },

    async register({ commit }, { user, pass }) {
        try {
            const { data } = await axios.post('/api/register', { user, pass })
            return commit('setUser', data)
        } catch (error) {
            let {
                status,
                data: { message },
            } = error.response || {}
            if (status === 401) throw new Error(message || 'Bad credentials')
            throw error
        }
    },

    async login({ commit }, { user, pass }) {
        try {
            const { data } = await axios.post('/api/login', { user, pass })
            return commit('setUser', data)
        } catch (error) {
            let {
                status,
                data: { message },
            } = error.response || {}
            if (status === 401) throw new Error(message || 'Bad credentials')
            throw error
        }
    },

    async logout({ commit }) {
        await axios.post('/api/logout')
        return commit('setUser', null)
    },
}
