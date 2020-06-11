import got, { Response as GotResponse } from 'got'
import { URL } from 'url'
import { IncomingHttpHeaders } from 'http'
import { Util } from '@hapi/hapi'

export interface Interceptor {
  execute(urlPath: string, headers: Util.Dictionary<string>): Promise<Interceptor.Response>
}
export namespace Interceptor {
  export interface Response {
    body: Buffer,
    headers: IncomingHttpHeaders,
    statusCode: number
  }
  export function factory (): Interceptor {
    return {
      execute: async (urlPath: string, headers: Util.Dictionary<string>): Promise<Interceptor.Response> => {
        const targetBaseUrl = process.env.TARGET_URL || 'https://bitdash-a.akamaihd.net'
        const targetUrl = `${targetBaseUrl}${urlPath}`
        headers.host = new URL(targetBaseUrl).host
        console.log('[IN]', targetUrl)
        const start: Date = new Date()
        const response: GotResponse<any> = await got.get(targetUrl, { headers })
        const end: Date = new Date()
        // @ts-ignore
        console.log(`[OUT] ${targetUrl} (${end - start}ms)`)
        return { body: response.rawBody, headers: response.headers, statusCode: response.statusCode }
      }
    }
  }
}
