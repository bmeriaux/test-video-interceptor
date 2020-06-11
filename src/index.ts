import { createServer } from './server'
import { Interceptor } from './interceptor'

const PORT = Number(process.env.SERVER_PORT || 8080)
async function start () {
  try {
    const server = await createServer(PORT, Interceptor.factory())
    await server.start()
    console.log(`Server running at: ${server.info.uri}`)
  } catch (error) {
    console.error('Could not start server', error)
    process.exit(1)
  }
}

start()
