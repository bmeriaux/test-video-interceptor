# About
![](https://github.com/bmeriaux/test-video-interceptor/workflows/CI/badge.svg)

small request interceptor for m3u8 stream

## How To

### Requirements
- Node >= 12.16.1

### install
 - `npm ci`

### tests
- `npm t`

### build and start
- `npm run build && npm start`

 Available environment variables to change config:
 - `SERVER_PORT`: default to 8080
 - `TARGET_HOST`: default to https://bitdash-a.akamaihd.net

To use it, in VLC:
- File -> open network -> set url of a m3u8 content available on https://bitdash-a.akamaihd.net , replace host with `http://localhost:${SERVER_PORT}`, ex `http://localhost:8080/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8`
    - change the `TARGET_HOST` environment variable at the server start to intercept content of another host, ex `TARGET_HOST=https://mnmedias.api.telequebec.tv npm start` and in vlc open `http://localhost:8080/m3u8/29880.m3u8`

### start in watch mode
- `npm run watch`
