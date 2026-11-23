const assert=require('node:assert/strict');
const M=require('../app/src/main/assets/mount.js');
const g=9.80665,rad=d=>d*Math.PI/180;
const gravity=(p,r)=>[g*Math.sin(rad(p)),-g*Math.cos(rad(p))*Math.sin(rad(r)),g*Math.cos(rad(p))*Math.cos(rad(r))];
const near=(a,b)=>a.forEach((x,i)=>assert(Math.abs(x-b[i])<1e-8,`${a} != ${b}`));
// Independent Rodrigues rotations include inverted, sideways and oblique mounting.
function rotate(v,axis,angle){const n=Math.hypot(...axis),u=axis.map(x=>x/n),c=Math.cos(angle),s=Math.sin(angle),d=u.reduce((a,x,i)=>a+x*v[i],0),k=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];return v.map((x,i)=>x*c+k[i]*s+u[i]*d*(1-c));}
for(let i=0;i<100;i++){
 const toSensor=v=>rotate(v,[1+i%7,2+i%5,3],i*.17);
 const matrix=M.solve(toSensor(gravity(0,0)),toSensor(gravity(12,0)));
 assert(M.validate(matrix));
 for(const [p,r] of [[0,0],[15,0],[-12,0],[0,8],[0,-9],[17,11],[-23,-15]])near(M.apply(matrix,toSensor(gravity(p,r))),gravity(p,r));
 assert(M.validate(JSON.parse(JSON.stringify(matrix))));
}
assert(!M.validate([[1,0,0],[0,1,0],[0,0,-1]]));assert(!M.validate(null));
for(const angle of [0,2,40,180])assert.throws(()=>M.solve(gravity(0,0),gravity(angle,0)));
assert.throws(()=>M.solve([0,0,0],gravity(10,0)));assert.throws(()=>M.solve([NaN,0,1],gravity(10,0)));
const pose=new M.StablePose();
for(let i=0;i<=65;i++)pose.update(gravity(0,0),i*.05,[0,0,0],'a');
near(pose.capture(3.25),gravity(0,0));assert.equal(pose.capture(4),null);
pose.update(gravity(0,0),3.3,[2,0,0],'a');assert.equal(pose.capture(3.3),null);
for(let i=0;i<=65;i++)pose.update(gravity(i%2?1:0,0),4+i*.05,[0,0,0],'a');assert.equal(pose.capture(7.25),null);
pose.reset();for(let i=0;i<=65;i++)pose.update(gravity(0,0),8+i*.05,[0,0,0],'a');
pose.update(gravity(0,0),11.3,[0,0,0],'b');assert.equal(pose.capture(11.3),null);
console.log('Mount: 100 arbitrary installations, combined slopes, sign, persistence, degeneracy and stable capture passed.');

