import mongoose from 'mongoose'
import './db'

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    pass: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    type: {
        type: String,
        required: true,
        enum: ['guest', 'botter'],
        default: 'guest',
    },
})
const User = mongoose.model('User', UserSchema)

export default User
