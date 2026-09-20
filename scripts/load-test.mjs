/** Bounded read-only synthetic smoke load; NOT a population-scale benchmark. */
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.env.BASE_URL||'http://127.0.0.1:8095';
const count=Math.min(Number(process.env.LOAD_REQUESTS||500),10000);
const concurrency=Math.min(Number(process.env.LOAD_CONCURRENCY||8),50);
if(!Number.isInteger(count)||count<1||!Number.isInteger(concurrency)||concurrency<1)throw new Error('Positive bounded integer load parameters required');
const timings=[];const errors=[];let next=0;
const started=performance.now();
await Promise.all(Array.from({length:concurrency},async()=>{while(next<count){const index=next++;const start=performance.now();try{const response=await fetch(base+(index%3===0?'/api/v1/public/config':'/api/v1/schemes?page_size=10'),{signal:AbortSignal.timeout(20000)});await response.text();if(!response.ok)errors.push({status:response.status,index});}catch(error){errors.push({index,error:String(error)});}timings.push(performance.now()-start);}}));
const elapsed=(performance.now()-started)/1000;timings.sort((a,b)=>a-b);const percentile=p=>Math.round(timings[Math.min(timings.length-1,Math.ceil(p*timings.length)-1)]);
const report={run_at:new Date().toISOString(),base_url:base,scope:'Read-only public catalogue/config on small synthetic local data; not statewide readiness or availability proof',requests:count,concurrency,seconds:Number(elapsed.toFixed(2)),requests_per_second:Number((count/elapsed).toFixed(2)),p50_ms:percentile(.5),p95_ms:percentile(.95),p99_ms:percentile(.99),max_ms:Math.round(timings.at(-1)),failed:errors.length,errors:errors.slice(0,20)};
await mkdir('docs/test-results',{recursive:true});await writeFile('docs/test-results/load-results.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));process.exitCode=errors.length?1:0;
