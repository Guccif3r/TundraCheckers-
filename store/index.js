export const actions = {
    async nuxtServerInit({ dispatch }, { req }) {
        await dispatch('user/session', req.session || {})
    },
}
