import mongoose from 'mongoose'
import './db'
import { socketControl } from './socket'

const WaiterSchema = new mongoose.Schema({
    joined: { type: Date, default: Date.now },
    user: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    game: { type: String },
})

WaiterSchema.post('save', async function() {
    socketControl.broadcast(`waiter-updated`, {})
})
WaiterSchema.post('remove', async function() {
    socketControl.broadcast(`waiter-updated`, {})
})
const Waiter = mongoose.model('Waiter', WaiterSchema)

export default Waiter
