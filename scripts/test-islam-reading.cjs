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
 assert.equal(document.getElementById("courses").hidden,false,"Courses should be visible before the exam QCM");
 assert(document.getElementById("masar-course-app"),"New Islamic full-course reader did not load");
 document.querySelector('nav button[data-tab="exams"]').click();
 assert.equal(document.getElementById("exams").hidden,false,"Exam tab must remain accessible");
 assert.equal(intro.hidden,false,"Reading card missing in original exam tab");
 assert.equal(exam.value,"2021-specialty","Start with the fully corrected original 2021 specialty test");
 const expected={
  "2021-specialty":"2021-specialty-02.webp",
  "2021-didactics":"2021-didactics-02.webp"
 };
 for(const [id,image] of Object.entries(expected)){
  exam.value=id;exam.dispatchEvent(new Event("change",{bubbles:true}));
  assert.equal(intro.hidden,false,id+" reading block hidden");
  const srcs=[...document.querySelectorAll("#intro-live-images img")].map(img=>img.getAttribute("src"));
  assert(srcs.some(x=>x.endsWith(image)),id+" missing original passage image");
  assert.equal(document.getElementById("intro-live-images").hidden,true,id+" source document intentionally collapsed until reader opens it");
 }
 for(const id of ["2022-specialty","2023-specialty","2025-specialty","2022-didactics","2023-didactics","2025-didactics"]){
  exam.value=id;exam.dispatchEvent(new Event("change",{bubbles:true}));
  assert.equal(intro.hidden,true,id+" should not fabricate a separate introduction");
 }
 const tab=document.querySelector('nav button[data-tab="courses"]');
 tab.click();
 assert.equal(document.getElementById("courses").hidden,false,"Lesson tab not accessible");
 const app=document.getElementById("masar-course-app");
 assert(app,"Expanded course reader missing");
 assert.equal(document.querySelectorAll(".master-tile").length,9,"Specialty filter must show nine complete courses");
 assert.equal(document.querySelectorAll(".master-chapter").length,0,"Long-form chapters must be hidden from summaries");
 assert(app.querySelector(".master-quick-review"),"Concise memorization table missing");
 assert(app.querySelectorAll(".master-quick-table tbody tr").length>=4,"Every lesson must summarize at least four concepts");
 assert.equal(app.querySelectorAll(".master-practice-question").length,4,"Four on-topic practice QCM are required");
 app.querySelector(".master-practice-option").click();
 assert(app.querySelector(".master-practice-feedback"),"Practice quiz should explain correction");
 app.querySelector(".master-practice-retry").click();
 assert.equal(app.querySelector(".master-practice-feedback"),null,"Practice retry should clear feedback");
 assert.equal(document.querySelectorAll(".master-choice").length,4,"Original QCM choices not embedded after the lesson");
 assert.equal(app.querySelectorAll(".master-mindmap").length,0,"Confusing mind maps must be removed");
 assert.equal(app.querySelector(".master-scoreboard-item.points strong").textContent,"0","New exam score should start at zero");
 document.querySelector(".master-choice input").click();
 document.querySelector(".master-quiz-button").click();
 assert(document.querySelector(".master-feedback"),"Corrective reasoning was not displayed");
 assert.match(document.querySelector(".master-feedback").textContent,/الجواب الصحيح.*C/,"2021 key not shown");
 assert.match(document.querySelector(".master-feedback").textContent,/−1 نقطة/,"Incorrect option must deduct one Canadian-score point");
 assert.equal(app.querySelector(".master-scoreboard-item.points strong").textContent,"-1","Wrong answer should make total minus one");
 assert.match(document.getElementById("total-score").textContent,/-1 نقطة/,"Original exam and inline reader scores must stay synchronized");
 document.querySelector(".master-quiz-button.secondary").click();
 assert.equal(document.querySelector(".master-feedback"),null,"Retry did not clear feedback");
 assert.equal(app.querySelector(".master-scoreboard-item.points strong").textContent,"0","Retry should remove the previous penalty");
 document.querySelectorAll(".master-choice input")[2].click();
 document.querySelector(".master-quiz-button").click();
 assert.equal(app.querySelector(".master-scoreboard-item.points strong").textContent,"+1","Correct option should earn one point");
 assert.match(document.getElementById("total-score").textContent,/\+1 نقطة/,"Correct score must synchronize with exam view");
 document.querySelector(".master-quiz-button.secondary").click();
 assert.equal(app.querySelector(".master-scoreboard-item.points strong").textContent,"0","Retry should clear earned point too");
 const category=app.querySelector(".master-filters select");
 category.value="الديداكتيك";category.dispatchEvent(new Event("change",{bubbles:true}));
 assert.equal(document.querySelectorAll(".master-tile").length,10,"Didactics lessons missing");
 assert.match(app.querySelector(".master-quiz").textContent,/اختر الجواب الخاطئ/,"Didactics reverse instruction missing");
 category.value="الأولى إعدادي";category.dispatchEvent(new Event("change",{bubbles:true}));
 assert.equal(document.querySelectorAll(".master-tile").length,11,"First-year secondary lessons missing");
 assert.equal(app.querySelectorAll(".master-practice-question").length,4,"Every grade lesson must have relevant practice QCM");
 assert.equal(app.querySelectorAll(".master-quiz-question").length,0,"A 2021 question from Al-Mutaffifin must not be attributed to Surat Qaf");
 const mapped=new Set((dom.window.MASAR_ISLAM_COURSES||[]).flatMap(c=>(c.officialExamLinks||[]).map(x=>x.exam+":"+x.number)));
 assert.equal(mapped.size,110,"Every real 2021 QCM should be filed under a fitting specialty or didactics topic");
 const shownErrors=errors.filter(s=>/Uncaught|ReferenceError|TypeError|SyntaxError/.test(s));
 assert.deepEqual(shownErrors,[],"Browser scripts raised exceptions: "+shownErrors.join("; "));
 console.log("SUCCESS: 58 concise Islamic courses with on-topic QCM and corrected original exam associations, sourced QCM correction and retry, and original exam passages.");
 dom.window.close();
})().catch(error=>{console.error(error);process.exitCode=1});
