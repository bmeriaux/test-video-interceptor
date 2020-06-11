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
  export function getMediaContext (url: string): string {
    const urlExtension = url.substring(url.lastIndexOf('.'))
    switch (urlExtension) {
      case '.m3u8': return 'MANIFEST'
      case '.ts': return 'SEGMENT'
      case '.vtt': return 'SUBTITLE'
      default: return ''
    }
  }
  export function factory (): Interceptor {
    return {
      execute: async (urlPath: string, headers: Util.Dictionary<string>): Promise<Interceptor.Response> => {
        const targetBaseUrl = process.env.TARGET_HOST || 'https://bitdash-a.akamaihd.net'
        const targetUrl = `${targetBaseUrl}${urlPath}`
        headers.host = new URL(targetBaseUrl).host
        console.log(`[IN][${getMediaContext(targetUrl)}] ${targetUrl}`)
        const start: Date = new Date()
        const response: GotResponse<any> = await got.get(targetUrl, { headers })
        const end: Date = new Date()
        // @ts-ignore
        console.log(`[OUT][${getMediaContext(targetUrl)}] ${targetUrl} (${end - start}ms)`)
        return { body: response.rawBody, headers: response.headers, statusCode: response.statusCode }
      }
    }
  }
}
