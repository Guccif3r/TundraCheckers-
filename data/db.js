import mongoose from 'mongoose'
import cs from './cs'

export default function() {
    mongoose.connect(cs, {
        useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const connection = mongoose.connection
    connection.on('error', console.error.bind(console, 'connection error:'))
    connection.once('open', _ => console.log(`Mongoose connected to ${cs}`))
}
