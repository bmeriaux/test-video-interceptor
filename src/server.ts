import { Request, ResponseToolkit, Server } from '@hapi/hapi'
import { Interceptor } from './interceptor'

export async function createServer (port: number, interceptor: Interceptor): Promise<Server> {
  const server = new Server({ port, compression: false })
  if (process.env.NODE_ENV !== 'test') {
    await server.register({
      plugin: require('hapi-pino')
    })
  }
  server.route({
    method: 'GET',
    path: '/{param*}',
    handler: async (request: Request, h: ResponseToolkit) => {
      const urlPath = request.path
      const proxyReponse = await interceptor.execute(urlPath, request.headers)
      const response = h.response(proxyReponse.body).code(proxyReponse.statusCode)
      for (const header in Object.keys(proxyReponse.headers)) {
        if (proxyReponse.headers[header]) {
          response.header(header, proxyReponse.headers[header]!.toString())
        }
      }
      return response
    }
  })
  return server
}
