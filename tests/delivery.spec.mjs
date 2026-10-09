import assert from 'node:assert/strict'
import { get } from 'node:http'
import { readFile,writeFile } from 'node:fs/promises'
import { gunzipSync,brotliDecompressSync } from 'node:zlib'

const base = new URL(process.env.GALLERY_URL || 'http://127.0.0.1:5181')

const request = (headers={},method='GET',path='/assets/chongxi-seal.otf?v=1.0') => new Promise((resolve,reject)=>{
  const req=get({hostname:base.hostname,port:base.port || 80,path,headers,method},res=>{
    const chunks=[];res.on('data',chunk=>chunks.push(chunk));res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,body:Buffer.concat(chunks)}))
  });req.on('error',reject)
})
const original=await readFile('public/assets/chongxi-seal.otf')
const results=[]
for(const encoding of ['br','gzip']) {
  const result=await request({'Accept-Encoding':encoding})
  assert.equal(result.status,200)
  assert.equal(result.headers['content-encoding'],encoding)
  assert.match(result.headers['cache-control'],/31536000.*immutable/)
  assert.match(result.headers.vary,/Accept-Encoding/)
  assert.equal(Buffer.compare(encoding==='br'?brotliDecompressSync(result.body):gunzipSync(result.body),original),0)
  const cached=await request({'Accept-Encoding':encoding,'If-None-Match':result.headers.etag})
  assert.equal(cached.status,304)
  assert.equal(cached.body.length,0)
  const head=await request({'Accept-Encoding':encoding},'HEAD')
  assert.equal(Number(head.headers['content-length']),result.body.length)
  assert.equal(head.body.length,0)
  results.push({encoding,original:original.length,transferred:result.body.length,savedPercent:Number(((1-result.body.length/original.length)*100).toFixed(2)),roundTripUnmodified:true,cache304:true,head:true})
}
const identity=await request({'Accept-Encoding':'br;q=0, gzip;q=0, identity;q=1'})
assert.equal(identity.headers['content-encoding'],undefined)
assert.equal(Buffer.compare(identity.body,original),0)
const notFound=await request({},'GET','/assets/missing-font.otf')
assert.equal(notFound.status,404)
assert.ok(!notFound.headers['cache-control']?.includes('86400'))
await writeFile('test-results/delivery-report.json',JSON.stringify({results,identity:true,missingAssetNotCached:true},null,2))
console.log(JSON.stringify({results,identity:true,missingAssetNotCached:true}))
