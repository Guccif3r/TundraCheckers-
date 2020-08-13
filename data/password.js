import argon2 from 'argon2'
import zxcvbn from 'zxcvbn'

async function check(pass) {
    if (typeof pass !== 'string') throw new Error('Password is not a string!')
    if (pass.length < 10) throw new Error('Password is too short!')
    let result = zxcvbn(pass.slice(0, 200))
    if (result.score < 3) {
        let suggestions = [
            result.feedback.warning + '.',
            ...(result.feedback.suggestion || ['Try again']),
        ]
        throw new Error(`Password is too weak: ${suggestions.join(' ')}`)
    }
    return true
}

async function encode(password) {
    await check(password)
    return await argon2.hash(password, {
        type: argon2.argon2id,
        timeCost: 10,
        memoryCost: 4096,
        parallelism: 2,
        hashLength: 128,
    })
}

async function compare(encoded, password) {
    return await argon2.verify(encoded, password)
}

export default { encode, compare }
