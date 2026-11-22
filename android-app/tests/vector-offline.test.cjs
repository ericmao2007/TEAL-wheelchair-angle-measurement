// PLAYWRIGHT_MODULE=... TILE_FIXTURE=/path/to/tile.pbf node tests/vector-offline.test.cjs
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright'),fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const page=await browser.newPage();await page.goto('about:blank');await page.addScriptTag({path:path.resolve(__dirname,'../app/src/main/assets/vector.js')});
 const bytes=[...fs.readFileSync(process.env.TILE_FIXTURE)];
 await page.context().setOffline(true);
 const result=await page.evaluate(bytes=>{const canvas=drawVectorTile(new Uint8Array(bytes));document.body.appendChild(canvas);const p=canvas.getContext('2d').getImageData(0,0,1024,1024).data;const colors=new Set();for(let i=0;i<p.length;i+=64)colors.add(p.slice(i,i+3).join(','));return {width:canvas.width,colors:colors.size};},bytes);
 assert.equal(result.width,1024);assert(result.colors>10,'Real vector tile renders roads and labels while network is disabled');
 await page.screenshot({path:path.join(__dirname,'offline-vector-preview.png')});console.log('Real downloaded vector tile renders offline with local decoder and fonts:',result);
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
