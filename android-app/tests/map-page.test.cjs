// Uses the packaged HTML/CSP and native asset origin, without bypassing CSP.
// PLAYWRIGHT_MODULE=... TILE_FIXTURE=/path/to/real.pbf node tests/map-page.test.cjs
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright'),fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[],violations=[];let tileRequests=0;
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.text().includes('Content Security Policy'))violations.push(m.text());});
 const assets=path.resolve(__dirname,'../app/src/main/assets'),tile=fs.readFileSync(process.env.TILE_FIXTURE);
 await page.route('https://appassets.androidplatform.net/**',route=>{const u=new URL(route.request().url());if(u.pathname.startsWith('/vector/')){tileRequests++;return route.fulfill({contentType:'application/octet-stream',body:tile});}const file=path.join(assets,path.basename(u.pathname));if(!fs.existsSync(file))return route.fulfill({status:404,body:''});return route.fulfill({contentType:file.endsWith('.js')?'application/javascript':'text/html',body:fs.readFileSync(file)});});
 await page.addInitScript(()=>{window.LiveTiltAndroid={ready(){},connect(){},send(){},loadRecords(){return '[]'},loadSessions(){return '[]'},loadZero(){return 'null'},location(){},onlineMap(){return true}};});
 await page.goto('https://appassets.androidplatform.net/assets/index.html');await page.click('#startHistory');await page.click('#mapTab');
 await page.evaluate(()=>onNativeLocation({latitude:36,longitude:-79,accuracy:10,ageMs:0,timestamp:Date.now()}));
 await page.waitForFunction(()=>[...slopeMap.tiles.values()].some(t=>t.canvas),null,{timeout:5000});
 assert(tileRequests>0,'Packaged CSP permits native tile fetches');assert.deepEqual(violations,[]);assert.deepEqual(errors,[]);
 assert(await page.locator('#mapCanvas').isVisible());
 const colors=await page.locator('#mapCanvas').evaluate(el=>{const p=el.getContext('2d').getImageData(0,0,el.width,el.height).data,s=new Set();for(let i=0;i<p.length;i+=64)s.add(p.slice(i,i+3).join(','));return s.size;});assert(colors>10,'Map page paints streets, not only an empty background');
 // Map stays available when a fresh fix is unavailable.
 await page.evaluate(()=>{gpsFix=null;records=[];showPage(false);showPage(true);});assert(await page.locator('#mapCanvas').isVisible(),'No GPS must not hide the map');
 await page.locator('#mapCanvas').screenshot({path:path.join(__dirname,'map-page-fixed.png')});
 console.log('Packaged map: native origin + real CSP + vector fetch/paint + visible map without GPS passed;',tileRequests,'tile requests;',colors,'colors');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
