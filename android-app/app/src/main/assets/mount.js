/* Sensor-to-chair orthonormal frame from level and nose-up gravity poses. */
(function(root){
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const valid=v=>Array.isArray(v)&&v.length===3&&v.every(Number.isFinite);
const unit=v=>{if(!valid(v)||Math.hypot(...v)<1e-6)throw Error('Invalid gravity vector');return v.map(x=>x/Math.hypot(...v));};
function validate(m){return Array.isArray(m)&&m.length===3&&m.every(v=>valid(v)&&Math.abs(dot(v,v)-1)<1e-5)&&Math.abs(dot(m[0],m[1]))<1e-5&&Math.abs(dot(m[0],m[2]))<1e-5&&Math.abs(dot(m[1],m[2]))<1e-5&&dot(cross(m[0],m[1]),m[2])>.99999;}
function separation(a,b){return Math.acos(Math.max(-1,Math.min(1,dot(unit(a),unit(b)))))*180/Math.PI;}
function solve(level,noseUp){
 const z=unit(level),g=unit(noseUp),c=dot(z,g),angle=separation(level,noseUp);
 if(angle<2-1e-8)throw Error(`Measured change ${angle.toFixed(1)}°. Need at least 2° of forward tilt from step 1. Turning on flat ground is insufficient. Sensor axes may stay crooked.`);
 if(angle>30+1e-8)throw Error(`Measured change ${angle.toFixed(1)}° exceeds 30°. Keep the sensor fixed and use a gentler supported forward incline; redo level if needed.`);
 const x=unit(g.map((v,i)=>v-c*z[i])),y=unit(cross(z,x));
 return [x,y,z];
}
function apply(matrix,v){return valid(v)?matrix.map(row=>dot(row,v)):null;}
class StablePose{
 constructor(){this.reset();}
 reset(){this.samples=[];this.last=null;this.key=null;}
 update(v,t,gyro,key=''){
  if(!valid(v)||!Number.isFinite(t)||Math.abs(Math.hypot(...v)-9.80665)>.5||!valid(gyro)||Math.hypot(...gyro)>1){this.reset();return;}
  if(this.last!==null&&(t<=this.last||t-this.last>.5||key!==this.key))this.reset();
  this.last=t;this.key=key;this.samples.push({v:v.slice(),t});
  while(this.samples.length>1&&t-this.samples[1].t>=3)this.samples.shift();
 }
 capture(t){
  if(this.last===null||t-this.last>.3||this.samples.length<20||this.last-this.samples[0].t<3-1e-8)return null;
  const mean=[0,1,2].map(i=>this.samples.reduce((s,p)=>s+p.v[i],0)/this.samples.length),u=unit(mean);
  if(this.samples.some(p=>Math.acos(Math.max(-1,Math.min(1,dot(unit(p.v),u))))*180/Math.PI>.2))return null;
  return mean;
 }
}
const api={solve,apply,validate,separation,StablePose};if(typeof module==='object')module.exports=api;else root.MountCalibration=api;
})(globalThis);
