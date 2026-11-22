const assert=require('node:assert/strict');
const {csv,html}=require('../app/src/main/assets/sessions.js');
const session={id:'<script>,"unsafe"',startedAt:1000,stoppedAt:3000,samples:[{timestamp:2000,pitch:10,roll:-2,latitude:36,longitude:-78.9,accuracy:5,locationTimestamp:1900,zeroMethod:'reversal',pitchZeroOffset:2},{timestamp:2500,pitch:0,roll:0,latitude:null,longitude:null,accuracy:null,locationTimestamp:null}]};
const output=csv([session]);
assert(output.startsWith('\ufeff'));assert(output.includes('"<script>,""unsafe"""'));assert(output.includes('"36","-78.9","5"'));assert(!output.includes('null'));assert(output.includes('1970-01-01T00:00:02.000Z'));
const report=html([session]);assert(!report.includes('<script>'));assert(report.includes('&lt;script&gt;'));assert(report.includes('17.632698'));assert(report.includes('<td>-78.9</td>'));
assert(csv([]).includes('latitude'));console.log('Exports: CSV escaping/UTF-8, HTML escaping, timestamps, GPS blanks, grade passed.');
