import { Server, ServerInjectResponse } from '@hapi/hapi'
import { createServer } from '../src/server'
import { StubbedType, stubInterface } from '@salesforce/ts-sinon'
import { Interceptor } from '../src/interceptor'
import sinon = require('sinon')
const chai = require('chai')
chai.use(require('sinon-chai'))
const expect = chai.expect

describe('server', () => {
  let server: Server
  let interceptorStub: StubbedType<Interceptor>
  beforeEach(async () => {
    interceptorStub = stubInterface(sinon)
    server = await createServer(8081, interceptorStub)
    await server.start()
  })
  afterEach(async () => {
    await server.stop({ timeout: 0 })
  })
  describe('GET /*', () => {
    const reqHeaders = { host: 'localhost:8080', 'cache-control': 'no-cache', 'user-agent': 'VLC/3.0.8 LibVLC/3.0.8' }
    const stubResponse:Interceptor.Response = {
      body: Buffer.from('response'),
      headers: { 'content-type': 'application/octet-stream', 'cache-control': 'no-cache', 'accept-ranges': 'bytes' },
      statusCode: 200
    }
    let actual:ServerInjectResponse
    beforeEach(async () => {
      interceptorStub.execute.resolves(stubResponse)
      actual = await server.inject({
        url: '/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8',
        method: 'GET',
        headers: reqHeaders
      })
    })
    it('call the cdn proxy with the request path and headers', () => {
      expect(interceptorStub.execute)
        .to.have.been.calledWith('/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8', reqHeaders)
    })
    it('returns the response from the interceptor', () => {
      expect(actual.headers).to.contains(stubResponse.headers)
      expect(actual.rawPayload).to.deep.equal(stubResponse.body)
    })
  })
})
