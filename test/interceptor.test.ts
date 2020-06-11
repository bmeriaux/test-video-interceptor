import { Interceptor } from '../src/interceptor'
import nock = require('nock')

const chai = require('chai')
chai.use(require('sinon-chai'))
const expect = chai.expect

describe('Interceptor', () => {
  let interceptor: Interceptor
  beforeEach(() => {
    interceptor = Interceptor.factory()
  })
  describe('execute', () => {
    const reqHeaders = { host: 'localhost:8080', 'cache-control': 'no-cache', 'user-agent': 'VLC/3.0.8 LibVLC/3.0.8' }
    const responseHeaders = { 'content-type': 'application/octet-stream', 'cache-control': 'no-cache', 'accept-ranges': 'bytes' }
    const urlPath = '/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8'
    let actual: Interceptor.Response

    beforeEach(async () => {
      nock('https://bitdash-a.akamaihd.net')
        .get(urlPath)
        .reply(200, 'response', responseHeaders)
      actual = await interceptor.execute(urlPath, reqHeaders)
    })
    it('returns a response', () => {
      const expectedReponse = { body: Buffer.from('response'), headers: responseHeaders, statusCode: 200 }
      expect(actual).to.deep.equal(expectedReponse)
    })
  })
})
