const assert=require("node:assert/strict");
const path=require("node:path");
const {JSDOM,VirtualConsole}=require("jsdom");

(async()=>{
 const errors=[];
 const consoleFeed=new VirtualConsole();
 consoleFeed.on("jsdomError",err=>errors.push(err.message));
 const dom=await JSDOM.fromFile(path.resolve("tarbiya-islamia/index.html"),{
  resources:"usable",runScripts:"dangerously",pretendToBeVisual:true,
  virtualConsole:consoleFeed,
  beforeParse(w){
   w.fetch=async()=>({ok:true,json:async()=>({})});
   w.HTMLElement.prototype.scrollIntoView=function(){};
   w.requestAnimationFrame=cb=>{cb();return 0};
  }
 });
 const {document,Event}=dom.window;
 await new Promise(resolve=>dom.window.addEventListener("load",resolve,{once:true}));
 await new Promise(resolve=>setTimeout(resolve,30));
 const exam=document.getElementById("exam-sel");
 const intro=document.getElementById("intro-live");
 assert(exam&&intro,"Inline exam reader missing");
 assert.equal(document.getElementById("exams").hidden,false,"Exam tab should be visible on initial load");
 assert.equal(intro.hidden,false,"Reading card missing on initial view");
 assert.equal(exam.value,"2025-specialty");
 const expected={
  "2025-specialty":"2025-specialty-02.webp",
  "2023-specialty":"2023-specialty-01.webp",
  "2022-specialty":"2022-specialty-02.webp",
  "2021-specialty":"2021-specialty-02.webp",
  "2021-didactics":"2021-didactics-02.webp"
 };
 for(const [id,image] of Object.entries(expected)){
  exam.value=id;exam.dispatchEvent(new Event("change",{bubbles:true}));
  assert.equal(intro.hidden,false,id+" reading block hidden");
  const srcs=[...document.querySelectorAll("#intro-live-images img")].map(img=>img.getAttribute("src"));
  assert(srcs.some(x=>x.endsWith(image)),id+" missing original passage image");
  assert.equal(document.getElementById("intro-live-images").hidden,false,id+" passage collapsed");
 }
 for(const id of ["2022-didactics","2023-didactics","2025-didactics"]){
  exam.value=id;exam.dispatchEvent(new Event("change",{bubbles:true}));
  assert.equal(intro.hidden,false,id+" intro info hidden");
  assert.equal(document.getElementById("intro-live-empty").hidden,false,id+" should explain no separate preamble");
 }
 const tab=document.querySelector('nav button[data-tab="courses"]');
 tab.click();
 assert.equal(document.getElementById("courses").hidden,false,"Lesson tab not accessible");
 assert.equal(document.querySelectorAll(".course-library-tile").length,20,"Twenty detailed lessons did not render");
 const shownErrors=errors.filter(s=>/Uncaught|ReferenceError|TypeError|SyntaxError/.test(s));
 assert.deepEqual(shownErrors,[],"Browser scripts raised exceptions: "+shownErrors.join("; "));
 console.log("SUCCESS: inline reading texts visible, 5 original sources mapped, 3 no-preamble sessions explained, 20 detailed lessons rendered.");
 dom.window.close();
})().catch(error=>{console.error(error);process.exitCode=1});
