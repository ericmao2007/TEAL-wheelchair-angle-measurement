import {VectorTile} from '@mapbox/vector-tile';
import {PbfReader} from 'pbf';
window.drawVectorTile=function(bytes){
 const tile=new VectorTile(new PbfReader(new Uint8Array(bytes))),canvas=document.createElement('canvas');canvas.width=canvas.height=1024;
 function labelRule(layer,p,zoom){
  const rank=Number(p.rank),cls=String(p.class||'').toLowerCase();
  if(layer==='transportation_name')return zoom>=15||(zoom>=13&&['motorway','trunk','primary','secondary'].includes(cls));
  if(layer==='poi')return zoom>=14&&(Number.isFinite(rank)?rank<=18:zoom>=16);
  if(layer!=='place')return false;
  if(zoom<6)return (Number.isFinite(rank)&&rank<=4)||['capital','city'].includes(cls);
  if(zoom<9)return (Number.isFinite(rank)&&rank<=8)||['capital','city','town'].includes(cls);
  if(zoom<11)return (Number.isFinite(rank)&&rank<=12)||['capital','city','town','village','suburb'].includes(cls);
  if(zoom<13)return Number.isFinite(rank)&&rank<=16;
  return true;
 }
 function priority(layer,p){
  const rank=Number(p.rank);return layer==='place'?(Number.isFinite(rank)?rank:30):layer==='transportation_name'?(['motorway','trunk','primary'].includes(p.class)?40:60):(Number.isFinite(rank)?70+rank:95);
 }
 function paint(c,x,y,size,zoom=14){c.save();c.translate(x,y);c.beginPath();c.rect(0,0,size,size);c.clip();c.fillStyle='#e9e5dc';c.fillRect(0,0,size,size);
 const labels=[];
 for(const layerName of ['landcover','landuse','park','water','waterway','building','transportation','transportation_name','place','poi']){
 const layer=tile.layers[layerName];if(!layer)continue;
 for(let i=0;i<layer.length;i++){const feature=layer.feature(i),geometry=feature.loadGeometry(),k=size/feature.extent,properties=feature.properties;
 if(feature.type===1||layerName==='transportation_name'){const pos=geometry[0]?.[Math.floor(geometry[0].length/2)],label=properties['name:en']||properties.name;if(pos&&label&&labelRule(layerName,properties,zoom)){c.font=layerName==='place'?'bold 14px sans-serif':'12px sans-serif';labels.push({label,x:pos.x*k,y:pos.y*k,font:c.font,priority:priority(layerName,properties)});}continue;}
 c.beginPath();for(const line of geometry){line.forEach((v,j)=>j?c.lineTo(v.x*k,v.y*k):c.moveTo(v.x*k,v.y*k));if(feature.type===3)c.closePath();}
 if(feature.type===3){c.fillStyle=layerName==='water'?'#9bcbdc':layerName==='building'?'#c7bcaf':'#c9d8b6';c.fill('evenodd');}
 else {c.strokeStyle=layerName==='waterway'?'#9bcbdc':['motorway','trunk','primary'].includes(properties.class)?'#f2c46c':'#fff';c.lineWidth=layerName==='transportation'?(['motorway','trunk','primary'].includes(properties.class)?5:2.5):1.5;c.stroke();}
 }
 }
 labels.sort((a,b)=>a.priority-b.priority);const occupied=[];
 for(const label of labels){c.font=label.font;const width=c.measureText(label.label).width,box={left:label.x-2,top:label.y-14,right:label.x+width+2,bottom:label.y+3};if(occupied.some(other=>box.left<other.right&&box.right>other.left&&box.top<other.bottom&&box.bottom>other.top))continue;occupied.push(box);c.lineWidth=3;c.strokeStyle='#fff';c.fillStyle='#37454e';c.strokeText(label.label,label.x,label.y);c.fillText(label.label,label.x,label.y);}
 c.restore();}
 paint(canvas.getContext('2d'),0,0,1024);canvas.paint=paint;return canvas;
};
