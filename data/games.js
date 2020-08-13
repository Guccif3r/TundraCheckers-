import mongoose from 'mongoose'
import './db'
import Logic from './logic'
import { socketControl } from './socket'

const GameSchema = new mongoose.Schema({
    w: { type: Number, default: 8 },
    h: { type: Number, default: 8 },

    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },

    white: { type: String, required: true },
    black: { type: String, required: true },
    botter: { type: String, required: true },

    turn: { type: String, enum: ['white', 'black'], default: 'white' },
    board: {
        type: String,
        match: /^[WwBb_]{32}$/,
        default: 'wwwwwwwwwwww________bbbbbbbbbbbb',
    },
    history: { type: String, match: /^[1-8a-h() \n:-]+$/, default: '' },
    length: { type: Number, default: 0 },

    win: { type: String, enum: ['white', 'black', 'both'] },
    tie: { type: String, enum: ['white', 'black', ''] },

    bot_guess: { type: String, match: /^((0|1[BH]{0,2})( |$))*$/, default: '' },
    bot_total: { type: Number, default: 0 },
    bot_pct: { type: Number, default: 100 },

    moves: { type: String, match: /^[1-8a-h() :-]*$/, default: '' },
    piece: { type: String, match: /^[a-h][1-8]$/ },
    hops: { type: String, match: /^[1-8a-h() :]+$/ },
    deads: { type: String, match: /^[1-8a-h ]+$/ },
})

GameSchema.pre('save', function(next) {
    this.updated = Date.now()
    this.set(Logic.refresh(this._doc))
    next()
})

GameSchema.post('save', async function() {
    socketControl.broadcast(`game-updated-${this._id}`)
})

const Game = mongoose.model('Game', GameSchema)

export default Game
