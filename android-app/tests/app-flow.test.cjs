// PLAYWRIGHT_MODULE=/path/to/playwright node tests/app-flow.test.cjs
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const assets=path.resolve(__dirname,'../app/src/main/assets');
// Match Android's packaged-resource allowlist instead of serving every local file.
const activity=fs.readFileSync(path.resolve(__dirname,'../app/src/main/java/com/maoslope/livetilt/MainActivity.java'),'utf8');
const allowedAssets=new Set([...activity.matchAll(/path\.equals\("([^"]+)"\)/g)].map(m=>m[1]));
for(const [,name] of fs.readFileSync(path.join(assets,'index.html'),'utf8').matchAll(/<script src="([^"]+)"/g))assert(allowedAssets.has(name),'Android WebView blocks required script: '+name);
const fixture=Buffer.from(JSON.parse(fs.readFileSync(path.join(__dirname,'fixture.json'))).base64,'base64');
const frame=p=>{const b=Buffer.from(fixture);b[129]=1|8|16|32|128;b[132]=6;b[133]=63;[9.80665*Math.sin(p*Math.PI/180),0,9.80665*Math.cos(p*Math.PI/180)].forEach((v,i)=>b.writeFloatLE(v,32+i*4));return b.toString('base64');};
const server=http.createServer((req,res)=>{const file=path.join(assets,path.basename(req.url==='/'?'index.html':req.url));if(!allowedAssets.has(path.basename(file))||!fs.existsSync(file)){res.writeHead(404);res.end();return;}res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':'text/html');res.end(fs.readFileSync(file));});
(async()=>{let browser;try{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));browser=await chromium.launch({headless:true,channel:'chrome'});
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{window.gpsRequests=[];window.LiveTiltAndroid={ready(){},connect(){},send(){},loadRecords(){return '[]'},loadSessions(){return '[]'},saveSessions(){return true},location(v){gpsRequests.push(v)},loadZero(){return localStorage.getItem('native-zero')||'null'},saveZero(v){localStorage.setItem('native-zero',v);return true;}};});
 await page.goto('http://127.0.0.1:'+server.address().port);await page.click('#startHistory');assert(await page.locator('#historyPage').isVisible());await page.click('#measureTab');
 await page.evaluate(f=>{onNativeState({state:'ready'});onNativeFrame(f)},frame(3));await page.locator('#scene').waitFor({state:'visible'});assert(!await page.locator('#setupPage').isVisible());
 await page.click('#calibrateTab');assert.equal(await page.locator('#calibrationMenu button:visible').count(),4);for(const id of ['reversalPanel','calibrationPanel','zeroGuide','mountPanel'])assert(!await page.locator('#'+id).isVisible());
 await page.screenshot({path:path.join(__dirname,'calibration-menu-preview.png'),fullPage:true});
 await page.click('#chooseReversal');assert(await page.locator('#reversalPanel').isVisible());assert(!await page.locator('#calibrationPanel').isVisible());await page.click('#reverseStart');await page.evaluate(f=>onNativeFrame(f),frame(1));await page.click('#reverseSecond');
 assert(Math.abs(await page.evaluate(()=>JSON.parse(localStorage.getItem('native-zero')).offset)-2)<.001);
 await page.reload();await page.evaluate(f=>{onNativeState({state:'ready'});onNativeFrame(f)},frame(12));await page.waitForTimeout(100);assert(Math.abs(await page.evaluate(()=>reversal.offset)-2)<.001,'Saved zero reloads automatically');await page.locator('#pitch').filter({hasText:'+10.0°'}).waitFor();
 await page.click('#tare');await page.reload();await page.evaluate(f=>{onNativeState({state:'ready'});onNativeFrame(f)},frame(12));await page.locator('#pitch').filter({hasText:'0.0°'}).waitFor();assert(await page.evaluate(()=>!!tare),'Reference zero also survives relaunch');await page.click('#untare');
 await page.click('#calibrateTab');await page.click('#chooseSensor');assert(await page.locator('#calibrationPanel').isVisible());await page.click('#calibrationBack');await page.click('#chooseZero');assert(await page.locator('#zeroGuide').isVisible());
 // End-to-end mounting with an oblique, right-handed installation (chair X→sensor Y, Y→Z, Z→X).
 let tick=100000;
 const mountedFrames=(p,r=0)=>Array.from({length:70},()=>{const b=Buffer.from(frame(p),'base64'),a=p*Math.PI/180,c=r*Math.PI/180,v=[9.80665*Math.sin(a),-9.80665*Math.cos(a)*Math.sin(c),9.80665*Math.cos(a)*Math.cos(c)];[v[2],v[0],v[1]].forEach((x,i)=>b.writeFloatLE(x,32+4*i));for(let i=0;i<3;i++)b.writeFloatLE(0,44+4*i);b.writeUInt32LE(tick+=50,4);return b.toString('base64');});
 const feed=async(p,r=0)=>page.evaluate(frames=>frames.forEach(onNativeFrame),mountedFrames(p,r));
 await page.click('#calibrationBack');await page.click('#chooseMount');
 await feed(0);await page.click('#mountLevel');assert(await page.evaluate(()=>!!mountLevel));
 await feed(0);await page.click('#mountForward');assert(await page.locator('#mountStatus').innerText().then(s=>s.includes('Measured change 0.0°')));assert(await page.evaluate(()=>!!mountLevel));
 await feed(4);await page.waitForFunction(()=>document.getElementById('mountLive').textContent.includes('4.0°')&&document.getElementById('mountLive').textContent.includes('Ready')); await page.click('#mountForward');assert(await page.evaluate(()=>!!mountMatrix&&!tare&&!reversal.applied));
 await feed(-8,5);const result=await page.evaluate(()=>displayReading(latest.fusion_accel));assert(Math.abs(result.pitch+8)<.001);assert(Math.abs(result.roll-5)<.001);
 await page.reload();await page.evaluate(()=>onNativeState({state:'ready'}));await feed(0);assert(await page.evaluate(()=>!!mountMatrix));assert(Math.abs(await page.evaluate(()=>displayReading().pitch))<.001);
 await page.click('#calibrateTab');await page.click('#chooseMount');await page.screenshot({path:'/tmp/teal-mount-test/mount-preview.png',fullPage:true});
 for(const width of [360,390,432]){await page.setViewportSize({width,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
 await page.click('#mountClear');assert(!await page.evaluate(()=>mountMatrix));
 await page.click('#mapTab');assert(await page.evaluate(()=>gpsRequests.at(-1)),'Map requests GPS independently');assert(await page.locator('#mapCanvas').isVisible(),'Map remains usable while waiting for location');
 await page.evaluate(()=>onNativeLocation({latitude:40.7,longitude:-74,accuracy:75,ageMs:0,timestamp:Date.now()}));await page.locator('#mapCanvas').waitFor({state:'visible'});assert.equal(await page.evaluate(()=>slopeMap.currentLocation.latitude),40.7);assert(await page.locator('#mapLocationStatus').innerText().then(s=>s.includes('75')));
 for(const width of [360,390,432]){await page.setViewportSize({width,height:844});for(const tab of ['measureTab','calibrateTab','historyTab','mapTab']){await page.click('#'+tab);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No overflow: '+width+' '+tab);}}
 assert.deepEqual(errors,[]);console.log('Browser: immediate readings, four calibration pages and mounting rotation, saved zero after reload, auto GPS/approximate fix, responsive navigation passed.');
 }finally{if(browser)await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
