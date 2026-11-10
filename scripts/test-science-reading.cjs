const assert=require("node:assert/strict");
const path=require("node:path");
const {JSDOM,VirtualConsole}=require("jsdom");

(async()=>{
 const errors=[],vc=new VirtualConsole(),saved={};
 vc.on("jsdomError",e=>errors.push(e.message));
 const dom=await JSDOM.fromFile(path.resolve("index.html"),{
  resources:"usable",runScripts:"dangerously",pretendToBeVisual:true,virtualConsole:vc,
  beforeParse(w){
   Object.defineProperty(w,"localStorage",{value:{getItem(k){return saved[k]||null},setItem(k,v){saved[k]=v}}});
   w.fetch=async()=>({ok:true,json:async()=>({})});
   w.HTMLElement.prototype.scrollIntoView=function(){};
   w.HTMLCanvasElement.prototype.getContext=function(){return{drawImage(){}}};
   w.requestAnimationFrame=fn=>{fn();return 0;};
   w.confirm=()=>true;
   w.Image=class{constructor(){this.naturalWidth=1000;this.naturalHeight=1500;this.complete=false;this.onload=null;this.onerror=null}set src(v){this._src=v}get src(){return this._src}};
  }
 });
 const {document,Event}=dom.window,$=id=>document.getElementById(id);
 await new Promise(resolve=>dom.window.addEventListener("load",resolve,{once:true}));
 await new Promise(resolve=>setTimeout(resolve,70));
 assert.equal(document.querySelectorAll(".course-tab").length,44,"Missing full set of courses");
 assert(document.querySelector(".science-quick-table"),"Course quick-review table missing");
 document.querySelectorAll(".course-tab")[1].click();
 const piagetRows=[...document.querySelectorAll(".science-quick-table tbody tr")];
 assert.equal(piagetRows.length,4,"Piaget should have exactly four developmental stages");
 assert.match(piagetRows[0].textContent,/الحس حركية.*0–2/,"Sensorimotor age missing");
 assert.match(piagetRows[2].textContent,/7–11/,"Concrete operational age missing");
 assert.match(piagetRows[3].textContent,/11–12/,"Formal operational stage missing");
 document.querySelectorAll(".course-tab")[0].click();
 assert(document.querySelector(".science-mindmap"),"Science mind map absent");
 assert(document.querySelectorAll(".science-mindmap-branch").length>=5,"Mind map branches absent");
 assert.equal(document.querySelectorAll(".science-mindmap-branch").length,document.querySelectorAll(".master-chapter").length,"Every chapter should be in map");
 assert.equal($("science-points").textContent,"0","Initial Canadian score must be zero");
 assert.equal($("science-unanswered").textContent,"354","All 354 questions must have immediately available keys");
 const input=(n)=>document.querySelectorAll('#answers input[name="answer"]')[n];
 const retry=()=>{ $("retry").click();assert.equal($("science-points").textContent,"0") };
 assert.equal($("exam-select").value,"2025");
 input(0).click();$("check").click();
 assert.equal($("science-points").textContent,"-1","Wrong 2025 answer should deduct a point");
 assert.match($("feedback").textContent,/−1 نقطة/);
 retry();
 input(1).click();$("check").click();
 assert.equal($("science-points").textContent,"+1","Correct 2025 answer should add a point");
 assert.match($("feedback").textContent,/\+1 نقطة/);
 retry();
 // February 2024 used to have no key until an asynchronous request; it must now score instantly.
 $("exam-select").value="2024f";$("exam-select").dispatchEvent(new Event("change"));
 assert.equal($("q-code").textContent,"Q61");
 input(0).click();$("check").click();
 assert.equal($("science-points").textContent,"-1","February 2024 must be graded without fetch");
 retry();
 input(3).click();$("check").click();
 assert.equal($("science-points").textContent,"+1","February 2024's teacher answer should earn a point");
 retry();
 $("exam-select").value="2024a";$("exam-select").dispatchEvent(new Event("change"));
 input(1).click();$("check").click();
 assert.equal($("science-points").textContent,"+1","April 2024 official key should still grade");
 retry();
 const broken=errors.filter(e=>/Uncaught|ReferenceError|TypeError|SyntaxError/.test(e));
 assert.deepEqual(broken,[],"Browser errors: "+broken.join("; "));
 console.log("SUCCESS: 44 Sciences courses, interactive maps, 354 immediately gradable questions (all 6 sessions), right +1 / wrong -1 / retry 0, official and proposed keys clearly separated.");
 dom.window.close();
})().catch(e=>{console.error(e);process.exitCode=1;});
