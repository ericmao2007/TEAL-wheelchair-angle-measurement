/* Small, local canvas slippy map. Only visible OSM tiles are requested. */
(function(root){
'use strict';
class GradientMap {
 constructor(canvas,info,onSelect){
  this.canvas=canvas;this.info=info;this.onSelect=onSelect;this.points=[];this.zoom=17;this.center=null;this.hasFocusedPoints=false;
  this.tiles=new Map();this.visible=false;this.hits=[];this.failed=false;
  const pointers=new Map();let gesture=null,moved=false;
  const begin=()=>{const a=[...pointers.values()];gesture=a.length===2?{distance:Math.hypot(a[1].x-a[0].x,a[1].y-a[0].y),zoom:this.zoom,center:this.center?.slice(),x:(a[0].x+a[1].x)/2,y:(a[0].y+a[1].y)/2}:a.length===1?{...a[0],center:this.center?.slice()}:null;};
  canvas.addEventListener('pointerdown',e=>{if(!pointers.size)moved=false;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});canvas.setPointerCapture(e.pointerId);begin();});
  canvas.addEventListener('pointermove',e=>{
   if(!pointers.has(e.pointerId)||!gesture?.center)return;
   pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});const a=[...pointers.values()];
   if(a.length===2&&gesture.distance>0){
    moved=true;const z=Math.max(2,Math.min(26,gesture.zoom+Math.log2(Math.hypot(a[1].x-a[0].x,a[1].y-a[0].y)/gesture.distance))),scale=2**(z-gesture.zoom),r=canvas.getBoundingClientRect();
    this.zoom=z;this.center=[(gesture.center[0]+gesture.x-r.left-canvas.clientWidth/2)*scale-((a[0].x+a[1].x)/2-r.left-canvas.clientWidth/2),(gesture.center[1]+gesture.y-r.top-canvas.clientHeight/2)*scale-((a[0].y+a[1].y)/2-r.top-canvas.clientHeight/2)];
   }else if(a.length===1){if(Math.hypot(e.clientX-gesture.x,e.clientY-gesture.y)>8)moved=true;this.center=[gesture.center[0]-(e.clientX-gesture.x),gesture.center[1]-(e.clientY-gesture.y)];}
   this.draw();
  });
  const end=e=>{if(!moved&&pointers.size===1&&e.type==='pointerup'){const r=canvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;const hit=this.hits.find(p=>Math.hypot(p.x-x,p.y-y)<32);if(hit)this.onSelect(hit.p);}pointers.delete(e.pointerId);begin();};
  canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);canvas.addEventListener('lostpointercapture',end);
  window.addEventListener('online',()=>{for(const [k,img] of this.tiles)if(!img.naturalWidth)this.tiles.delete(k);this.draw();});
  canvas.addEventListener('wheel',e=>{e.preventDefault();this.changeZoom(e.deltaY<0?1:-1);},{passive:false});
  window.addEventListener('resize',()=>this.draw());
 }
 project(p){
  const size=256*2**this.zoom,lat=Math.max(-85.0511,Math.min(85.0511,p.latitude))*Math.PI/180;
  return [(p.longitude+180)/360*size,(1-Math.log(Math.tan(lat)+1/Math.cos(lat))/Math.PI)/2*size];
 }
 setPoints(points){this.points=points;if(!this.hasFocusedPoints&&points.length){this.hasFocusedPoints=true;this.zoom=17;this.focus(points[points.length-1]);}else this.draw();}
 geographicCenter(){if(!this.center)return null;const size=256*2**this.zoom;return {longitude:this.center[0]/size*360-180,latitude:Math.atan(Math.sinh(Math.PI*(1-2*this.center[1]/size)))*180/Math.PI};}
 focus(p){this.center=this.project(p);this.draw();}
 changeZoom(delta){const next=Math.max(2,Math.min(26,this.zoom+delta));if(this.center)this.center=this.center.map(v=>v*2**(next-this.zoom));this.zoom=next;this.draw();}
 draw(){
  if(!this.visible)return;
  const el=this.canvas,w=el.clientWidth,h=el.clientHeight,d=window.devicePixelRatio||1;
  el.width=Math.round(w*d);el.height=Math.round(h*d);const c=el.getContext('2d');c.setTransform(d,0,0,d,0,0);
  c.fillStyle='#17283c';c.fillRect(0,0,w,h);this.hits=[];
  if(!this.center){this.zoom=2;this.center=this.project({latitude:20,longitude:0});}
  const size=256*2**this.zoom,tileZoom=Math.min(window.drawVectorTile?14:19,Math.floor(this.zoom)),scale=2**(this.zoom-tileZoom),tileSize=256*scale,n=2**tileZoom;
  this.center[0]=((this.center[0]%size)+size)%size;this.center[1]=Math.max(0,Math.min(size,this.center[1]));
  const left=this.center[0]-w/2,top=this.center[1]-h/2,needed=new Set();
  for(let x=Math.floor(left/tileSize);x<=Math.floor((left+w)/tileSize);x++)for(let y=Math.floor(top/tileSize);y<=Math.floor((top+h)/tileSize);y++){
   if(y<0||y>=n)continue;
   const tx=((x%n)+n)%n,key=`${tileZoom}/${tx}/${y}`;needed.add(key);
   let img=this.tiles.get(key);if(img?.retryAt&&Date.now()>=img.retryAt){this.tiles.delete(key);img=null;}
   if(!img&&window.drawVectorTile){
    img={complete:false,naturalWidth:0};this.tiles.set(key,img);const entry=img;
    fetch(`https://appassets.androidplatform.net/vector/${key}.pbf`).then(r=>{if(!r.ok)throw Error('No map');return r.arrayBuffer();}).then(bytes=>{entry.canvas=window.drawVectorTile(bytes);entry.complete=true;entry.naturalWidth=1024;this.draw();}).catch(()=>{entry.complete=true;entry.retryAt=Date.now()+15000;this.draw();if(!this.retryTimer&&window.setTimeout)this.retryTimer=window.setTimeout(()=>{this.retryTimer=null;this.draw();},15100);});
   }else if(!img){
    img=new Image();this.tiles.set(key,img);
    img.onload=()=>this.draw();img.onerror=()=>{this.failed=true;img.retryAt=Date.now()+10000;this.draw();};
    img.src=window.LiveTiltAndroid?`https://appassets.androidplatform.net/tiles/${key}.png`:`https://tile.openstreetmap.org/${key}.png`;
   }
   if(img.complete&&img.naturalWidth){if(img.canvas?.paint)img.canvas.paint(c,x*tileSize-left,y*tileSize-top,tileSize,this.zoom);else c.drawImage(img.canvas||img,x*tileSize-left,y*tileSize-top,tileSize,tileSize);}
  }
  if(this.currentLocation){
   const v=this.project(this.currentLocation);let dx=v[0]-this.center[0];dx-=Math.round(dx/size)*size;
   const x=w/2+dx,y=v[1]-top;c.beginPath();c.arc(x,y,8,0,Math.PI*2);c.fillStyle='#70b8ff';c.fill();c.strokeStyle='#ffffff';c.lineWidth=3;c.stroke();c.font='12px system-ui';c.fillStyle='#ffffff';c.fillText('You',x+12,y-12);
  }
  if(this.tiles.size>100)for(const key of this.tiles.keys())if(!needed.has(key))this.tiles.delete(key);
  for(const p of this.points){
   const v=this.project(p);let dx=v[0]-this.center[0];dx-=Math.round(dx/size)*size;
   const x=w/2+dx,y=v[1]-top;if(x< -60||x>w+60||y< -30||y>h+30)continue;
   const color=Math.abs(p.pitch)<3?'#77dbc5':Math.abs(p.pitch)<8?'#f3c567':'#fa8c88';
   c.beginPath();c.arc(x,y,9,0,Math.PI*2);c.fillStyle=color;c.fill();c.strokeStyle='#0b1220';c.lineWidth=2;c.stroke();
   c.font='bold 12px system-ui';c.textAlign='left';const label=(Math.round(p.pitch*10)>0?'+':'')+(Math.round(p.pitch*10)/10||0).toFixed(1)+'°';
   c.fillStyle='#0b1220';c.fillRect(x+13,y-12,c.measureText(label).width+10,23);c.fillStyle=color;c.fillText(label,x+18,y+4);
   this.hits.push({x,y,p});
  }
  const missing=[...needed].some(k=>!this.tiles.get(k)?.naturalWidth);
  this.info.textContent=missing?'Loading / area not downloaded · Download nearby maps while online':`${this.points.length?'':'No saved GPS points · '}Zoom ${Math.round(this.zoom*10)/10}/26${this.zoom>(window.drawVectorTile?14:19)?' · magnified base map':''} · GPS precision unchanged`;
 }
}
root.GradientMap=GradientMap;
})(globalThis);
