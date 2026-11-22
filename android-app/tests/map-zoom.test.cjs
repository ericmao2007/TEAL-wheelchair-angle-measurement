const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const requests=[],draws=[];
const context=new Proxy({measureText(){return {width:40};},drawImage(...args){draws.push(args);}},{get:(o,k)=>o[k]||(()=>{})});
const sandbox={window:{devicePixelRatio:1,addEventListener(){}},Image:class{set src(value){requests.push(value);this.complete=true;this.naturalWidth=256;}},console};sandbox.globalThis=sandbox;
vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../app/src/main/assets/map.js'),'utf8'),sandbox);
const info={},map=new sandbox.GradientMap({clientWidth:350,clientHeight:480,addEventListener(){},getContext(){return context;}},info,()=>{});
map.visible=true;map.focus({latitude:36,longitude:-78.9});
map.changeZoom(2);const before=map.center.slice();map.changeZoom(7);
assert.equal(map.zoom,26);assert(Math.abs(map.center[0]/before[0]-128)<1e-9);assert(draws.some(a=>a[3]===32768&&a[4]===32768),'Zoom 26 scales zoom-19 tiles by 128');assert(requests.every(u=>Number(u.split('/')[3])<=19),'No unsupported tile zoom requested');
map.changeZoom(100);assert.equal(map.zoom,26);map.changeZoom(-100);assert.equal(map.zoom,2);assert(info.textContent.includes('2/26'));
console.log('Map: zoom 2–26, center retained, 128x overzoom, native tiles capped at 19 passed.');

const empty=new sandbox.GradientMap({clientWidth:350,clientHeight:480,addEventListener(){},getContext(){return context;}},{},()=>{});
empty.visible=true;const beforeRequests=requests.length;empty.draw();assert(empty.center);assert(requests.length>beforeRequests,'Empty map requests world tiles');
empty.setPoints([{latitude:36,longitude:-78.9,pitch:2}]);assert.equal(empty.zoom,17,'First saved point focuses local map');
console.log('Empty map draws world tiles and first saved point recenters passed.');

const handlers={};const pinch=new sandbox.GradientMap({clientWidth:350,clientHeight:480,addEventListener(k,v){handlers[k]=v},setPointerCapture(){},getBoundingClientRect(){return {left:0,top:0}},getContext(){return context}}, {},()=>{});
pinch.visible=true;pinch.focus({latitude:36,longitude:-79});
handlers.pointerdown({pointerId:1,clientX:100,clientY:240});handlers.pointerdown({pointerId:2,clientX:200,clientY:240});
const old=pinch.zoom;handlers.pointermove({pointerId:2,clientX:300,clientY:240});assert.equal(pinch.zoom,old+1,'Two fingers doubling distance zoom one level');
handlers.pointerup({type:'pointerup',pointerId:2,clientX:300,clientY:240});handlers.pointermove({pointerId:1,clientX:110,clientY:240});assert(pinch.center.every(Number.isFinite),'Single finger resumes after pinch');
console.log('Pinch zoom and transition back to panning passed.');
