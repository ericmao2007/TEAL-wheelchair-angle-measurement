import {VectorTile} from '@mapbox/vector-tile';
import {PbfReader} from 'pbf';
window.drawVectorTile=function(bytes){
 const tile=new VectorTile(new PbfReader(new Uint8Array(bytes))),canvas=document.createElement('canvas');canvas.width=canvas.height=1024;function paint(c,x,y,size){c.save();c.translate(x,y);c.beginPath();c.rect(0,0,size,size);c.clip();c.fillStyle='#e9e5dc';c.fillRect(0,0,size,size);
 for(const name of ['landcover','landuse','park','water','waterway','building','transportation','transportation_name','place','poi']){
 const layer=tile.layers[name];if(!layer)continue;
 for(let i=0;i<layer.length;i++){const f=layer.feature(i),g=f.loadGeometry(),k=size/f.extent,p=f.properties;
 if(f.type===1||name==='transportation_name'){const pos=g[0]?.[Math.floor(g[0].length/2)],label=p['name:en']||p.name;if(pos&&label){c.font=name==='place'?'bold 14px sans-serif':'12px sans-serif';c.lineWidth=3;c.strokeStyle='#fff';c.fillStyle='#37454e';c.strokeText(label,pos.x*k,pos.y*k);c.fillText(label,pos.x*k,pos.y*k);}continue;}
 c.beginPath();for(const line of g){line.forEach((v,j)=>j?c.lineTo(v.x*k,v.y*k):c.moveTo(v.x*k,v.y*k));if(f.type===3)c.closePath();}
 if(f.type===3){c.fillStyle=name==='water'?'#9bcbdc':name==='building'?'#c7bcaf':'#c9d8b6';c.fill('evenodd');}
 else {c.strokeStyle=name==='waterway'?'#9bcbdc':['motorway','trunk','primary'].includes(p.class)?'#f2c46c':'#fff';c.lineWidth=name==='transportation'?(['motorway','trunk','primary'].includes(p.class)?5:2.5):1.5;c.stroke();}
 }
 }c.restore();}
 paint(canvas.getContext('2d'),0,0,1024);canvas.paint=paint;return canvas;
};
