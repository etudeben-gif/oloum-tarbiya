const fs=require("node:fs");
const vm=require("node:vm");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const dir=path.join(root,"tarbiya-islamia");
const files=[
"transcribed-questions.js","courses-full.js","grade12-detailed.js","grade3-detailed.js","grade-extra-detailed.js",
"courses-enriched.js","master-grade1.js","master-grade2.js","master-grade3.js",
"master-specialty.js","master-didactics.js","didactics-official-syllabus.js",
"master-official-exam-links.js","master-assemble.js","resumes-specialty.js","resumes-grades.js",
"official-choice-notes.js"
];
const ctx=vm.createContext({window:{},console});
for(const file of files){
 const script=fs.readFileSync(path.join(dir,file),"utf8");
 new vm.Script(script,{filename:file}).runInContext(ctx,{timeout:5000});
}
new vm.Script(fs.readFileSync(path.join(dir,"master-reader.js"),"utf8"),{filename:"master-reader.js"});
const html=fs.readFileSync(path.join(dir,"index.html"),"utf8");
let scripts=0;
for(const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)){
 if(match[1].trim()){new vm.Script(match[1],{filename:"index.html inline"});scripts++}
}
const lessons=ctx.window.MASAR_ISLAM_COURSES||[];

const exams=ctx.window.MASAR_ISLAM_TRANSCRIPT||{};
const errors=[];
const fail=x=>errors.push(x);
if(lessons.length!==58)fail("Expected 58 lessons, received "+lessons.length);

for(const lesson of lessons){
 const id=lesson.id;
 const rows=lesson.resumeRows||lesson.readerChapters?.slice(0,4).map(x=>[x.title,x.text])||[];
 if(rows.length<4)fail(id+": summary has fewer than four concepts");
 if(!lesson.readerChapters?.length)fail(id+": no complete reading chapters");
}
const originals=Object.values(exams).reduce((sum,a)=>sum+Object.keys(a).length,0);
if(originals!==110)fail("Expected 110 transcribed original 2021 questions");
for(const [exam,qs] of Object.entries(exams)){
 for(const [n,q] of Object.entries(qs)){
  if(!q.question||q.options?.length!==4||!("ABCD".includes(q.answer)))fail(exam+" Q"+n+": invalid transcription");
 }
}
if(!html.includes("didactics-official-syllabus.js"))fail("Official specification script not loaded");
if(html.includes("qcm-grade1-reviewed.js")||html.includes("MASAR_GENERATE_TEN_QCM"))fail("Unwanted authored QCM scripts loaded");
if(!html.includes('id="question-context"'))fail("Missing original question stimulus block");
if(html.indexOf('id="scan-frame"')>html.indexOf('class="quiz-form"'))fail("Exam scan is after questions");
if(errors.length){console.error(errors.join("\n"));process.exitCode=1;}
else console.log("PASS:",lessons.length,"complete courses; ",originals,"original 2021 exam questions; question stimulus and scan before answers; inline scripts parsed =",scripts);
