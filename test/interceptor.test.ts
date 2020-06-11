import { Interceptor } from '../src/interceptor'
import { readFileSync } from 'fs'
import Path from 'path'
import { SinonFakeTimers, SinonStub } from 'sinon'
import nock = require('nock')
import sinon = require('sinon')
import RequestLogger = Interceptor.RequestLogger

const chai = require('chai')
chai.use(require('sinon-chai'))
const expect = chai.expect

describe('Interceptor', () => {
  let interceptor: Interceptor
  beforeEach(() => {
    interceptor = Interceptor.factory()
  })
  describe('RequestLogger', () => {
    let consoleLogStub: SinonStub
    let requestLogger: Interceptor.RequestLogger
    const url = 'https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8'
    beforeEach(() => {
      consoleLogStub = sinon.stub(console, 'log')
    })
    afterEach(() => {
      consoleLogStub.restore()
    })
    context('header range start with bytes=0', () => {
      beforeEach(() => {
        requestLogger = new RequestLogger('MANIFEST', url, { range: 'bytes=0' })
      })
      context('logRequestIn', () => {
        beforeEach(() => {
          requestLogger.logRequestIn()
        })
        it('call console.log with TRACK SWITCH', () => {
          expect(consoleLogStub).to.have.been.calledWith('[TRACK SWITCH]')
        })
        it('call console.log with expected String for IN', () => {
          expect(consoleLogStub).to.have.been.calledWith('[IN][MANIFEST] https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8')
        })
      })
    })
    context('header range does not start with bytes=0', () => {
      beforeEach(() => {
        requestLogger = new RequestLogger('MANIFEST', url, {})
      })
      context('logRequestIn', () => {
        beforeEach(() => {
          requestLogger.logRequestIn()
        })
        it('call console.log with expected String for IN', () => {
          expect(consoleLogStub)
            .to.have.been.calledWith('[IN][MANIFEST] https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8')
        })
      })
      context('logRequestOut', () => {
        let clock: SinonFakeTimers
        beforeEach(() => {
          const now = new Date()
          clock = sinon.useFakeTimers(now)
          requestLogger.logRequestIn()
          clock.tick(2000)
          requestLogger.logRequestOut()
        })
        afterEach(() => clock.restore)
        it('call console.log with expected String for OUT with request duration', () => {
          expect(consoleLogStub)
            .to.have.been.calledWith('[OUT][MANIFEST] https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8 (2000ms)')
        })
      })
    })
  })
  describe('removeAbsoluteUrlFromManifest', () => {
    let manifest: Buffer
    beforeEach(() => {
      const originalManifest: Buffer = readFileSync(Path.resolve(__dirname, 'chunklist_b1128000.m3u8'))
      manifest = Interceptor.removeAbsoluteUrlFromManifest(originalManifest)
    })
    it('remove scheme and hostname of absolute url', () => {
      expect(manifest.indexOf('https://')).to.equal(-1)
      expect(manifest.indexOf('http://')).to.equal(-1)
      expect(manifest.indexOf('wowza-test.streamroot.io')).to.equal(-1)
    })
  })
  describe('execute', () => {
    const reqHeaders = { host: 'localhost:8080', 'cache-control': 'no-cache', 'user-agent': 'VLC/3.0.8 LibVLC/3.0.8' }
    const responseHeaders = { 'content-type': 'application/octet-stream', 'cache-control': 'no-cache', 'accept-ranges': 'bytes' }
    const urlPath = '/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8'
    let actual: Interceptor.Response
    let logRequestInStub: SinonStub
    let logRequestOutStub: SinonStub
    beforeEach(async () => {
      nock('https://bitdash-a.akamaihd.net')
        .get(urlPath)
        .reply(200, 'response', responseHeaders)
      logRequestInStub = sinon.stub(RequestLogger.prototype, 'logRequestIn')
      logRequestOutStub = sinon.stub(RequestLogger.prototype, 'logRequestOut')
      actual = await interceptor.execute(urlPath, reqHeaders)
    })
    afterEach(() => {
      logRequestInStub.restore()
      logRequestOutStub.restore()
    })
    it('log request In', () => {
      expect(logRequestInStub).to.have.been.called
    })
    it('log request Out', () => {
      expect(logRequestOutStub).to.have.been.called
    })
    it('returns a response', () => {
      const expectedReponse = { body: Buffer.from('response'), headers: responseHeaders, statusCode: 200 }
      expect(actual).to.deep.equal(expectedReponse)
    })
  })
  describe('getMediaContext', () => {
    it('returns MANIFEST when url ends with m3u8', () => {
      expect(Interceptor.getMediaContext('https://bitdash-a.akamaihd.net/content/sintel/hls/audio/surround/en/320kbit.m3u8'))
        .to.equal('MANIFEST')
    })
    it('returns SEGMENT when url ends with ts', () => {
      expect(Interceptor.getMediaContext('https://bitdash-a.akamaihd.net/content/sintel/hls/audio/stereo/en/128kbit/seq-1.ts'))
        .to.equal('SEGMENT')
    })
    it('returns SUBTITLE when url ends with vtt', () => {
      expect(Interceptor.getMediaContext('https://bitdash-a.akamaihd.net/content/sintel/hls/subtitles_es.vtt'))
        .to.equal('SUBTITLE')
    })
  })
})
