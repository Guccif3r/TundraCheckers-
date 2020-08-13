import router from './router'
import './users'
import './games'
import './waiters'

export default {
    path: '/api',
    handler: router,
}
