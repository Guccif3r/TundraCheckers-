const host = process.env.DB_HOST || 'localhost'
const port = process.env.DB_PORT || 27017
const inst = process.env.DB_INST || 'tundra'
const cs = process.env.DB || `mongodb://${host}:${port}/${inst}`
export default cs
