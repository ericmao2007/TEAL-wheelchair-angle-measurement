/* Two opposite headings on the same contact face: p1=s+b, p2=-s+b.
 * Estimates a constant Pitch zero bias; does not calibrate scale or prove yaw. */
(function(root){
'use strict';
const DEG=180/Math.PI;
function reading(a){
 if(!Array.isArray(a)||a.length!==3||!a.every(Number.isFinite))return null;
 const [x,y,z]=a;
 return {pitch:Math.atan2(x,Math.hypot(y,z))*DEG,roll:-Math.atan2(y,z)*DEG,up:z>0};
}
class ReversalZero {
 constructor(){this.clear();}
 get busy(){return this.stage==='turn';}
 clear(){this.applied=false;this.offset=0;this.result=null;this.cancel();}
 cancel(){this.stage='idle';this.first=null;this.second=null;}
 snapshot(vector){const r=reading(vector);return r?{pitch:r.pitch,roll:r.roll,count:1}:null;}
 start(vector){
  const first=this.snapshot(vector);if(!first)return false;
  this.cancel();this.first=first;this.stage='turn';return true;
 }
 opposite(vector){
  if(this.stage!=='turn')return false;
  const second=this.snapshot(vector);if(!second)return false;
  this.second=second;this.stage='review';return this.apply();
 }
 get candidate(){return this.first&&this.second?{offset:(this.first.pitch+this.second.pitch)/2,slope:Math.abs(this.first.pitch-this.second.pitch)/2}:null;}
 apply(){
  if(this.stage!=='review'||!this.candidate)return false;
  const c=this.candidate;this.offset=c.offset;this.applied=true;this.result={...c,first:{...this.first},second:{...this.second}};this.cancel();return true;
 }
 correct(vector){
  if(!this.applied)return vector;
  const r=reading(vector);if(!r)return null;
  const p=(r.pitch-this.offset)/DEG,roll=r.roll/DEG,n=Math.hypot(...vector);
  // Reconstruct one corrected vector for angle, Grade, 3D, relative zero and GPS.
  return [n*Math.sin(p),-n*Math.cos(p)*Math.sin(roll),n*Math.cos(p)*Math.cos(roll)];
 }
}
const api={ReversalZero,reading};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ReversalCalibration=api;
})(globalThis);
