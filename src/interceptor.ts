import got, { Response as GotResponse } from 'got'
import { URL } from 'url'
import { IncomingHttpHeaders } from 'http'
import { Util } from '@hapi/hapi'

const MANIFEST = 'MANIFEST'
const SEGMENT = 'SEGMENT'
const SUBTITLE = 'SUBTITLE'
const ABSOLUTE_URL_START_REGEX = new RegExp(/http(s?):\/\/[a-z0-9-.:]+/gi)

export interface Interceptor {
  execute(urlPath: string, headers: Util.Dictionary<string>): Promise<Interceptor.Response>
}
export namespace Interceptor {
  export interface Response {
    body: Buffer,
    headers: IncomingHttpHeaders,
    statusCode: number
  }
  export class RequestLogger {
    private start: Date | undefined
    constructor (private mediaContext:string, private url: string, private headers: Util.Dictionary<string>) {
    }

    logRequestIn () {
      if (this.headers.range?.startsWith('bytes=0')) {
        console.log('[TRACK SWITCH]')
      }
      this.start = new Date()
      console.log(`[IN][${this.mediaContext}] ${this.url}`)
    }

    logRequestOut () {
      const end: Date = new Date()
      // @ts-ignore
      console.log(`[OUT][${this.mediaContext}] ${this.url} (${end - this.start}ms)`)
    }
  }
  export function getMediaContext (url: string): string {
    const urlExtension = url.substring(url.lastIndexOf('.'))
    switch (urlExtension) {
      case '.m3u8': return MANIFEST
      case '.ts': return SEGMENT
      case '.vtt': return SUBTITLE
      default: return ''
    }
  }
  export function removeAbsoluteUrlFromManifest (manifest: Buffer): Buffer {
    return Buffer.from(manifest.toString().replace(ABSOLUTE_URL_START_REGEX, ''))
  }
  export function factory (): Interceptor {
    return {
      execute: async (urlPath: string, headers: Util.Dictionary<string>): Promise<Interceptor.Response> => {
        const targetBaseUrl = process.env.TARGET_HOST || 'https://bitdash-a.akamaihd.net'
        const targetUrl = `${targetBaseUrl}${urlPath}`
        headers.host = new URL(targetBaseUrl).host
        const mediaContext = getMediaContext(targetUrl)
        const requestLogger = new RequestLogger(mediaContext, targetUrl, headers)
        requestLogger.logRequestIn()
        const response: GotResponse<any> = await got.get(targetUrl, { headers })
        requestLogger.logRequestOut()
        let responseBody = response.rawBody
        if (mediaContext === MANIFEST) {
          responseBody = removeAbsoluteUrlFromManifest(response.rawBody)
        }
        return { body: responseBody, headers: response.headers, statusCode: response.statusCode }
      }
    }
  }
}
