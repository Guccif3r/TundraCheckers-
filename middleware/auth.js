export default function({ store, error }) {
    if (!store.state.user.loggedin)
        error({
            message: 'Bad login or password :(',
            statusCode: 403,
        })
}
