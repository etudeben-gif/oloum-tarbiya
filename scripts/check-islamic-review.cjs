const fs=require("node:fs");
const vm=require("node:vm");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const dir=path.join(root,"tarbiya-islamia");
const files=[
"transcribed-questions.js","courses-full.js","grade12-detailed.js","grade3-detailed.js","grade-extra-detailed.js",
"courses-enriched.js","master-grade1.js","master-grade2.js","master-grade3.js",
"master-specialty.js","master-didactics.js","master-official-exam-links.js","master-assemble.js",
"resumes-specialty.js","resumes-grades.js","exam-topic-matches.js","official-links-audited.js",
"official-choice-notes.js",
"qcm-specialty-reviewed.js","qcm-didactics-reviewed.js","qcm-grade1-reviewed.js",
"qcm-grade2-reviewed.js","qcm-grade3-reviewed.js","qcm-support-reviewed.js"
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
const training=ctx.window.MASAR_CURATED_QCM||{};
const exams=ctx.window.MASAR_ISLAM_TRANSCRIPT||{};
const errors=[];
const fail=x=>errors.push(x);
if(lessons.length!==58)fail("Expected 58 lessons, received "+lessons.length);
if(Object.keys(training).length!==lessons.length)fail("Training topic count mismatch");
for(const lesson of lessons){
 const id=lesson.id;
 const curated=training[id]||[];
 if(curated.length!==6)fail(id+": expected six applied questions");
 const rows=lesson.resumeRows||lesson.readerChapters?.slice(0,4).map(x=>[x.title,x.text])||[];
 if(rows.length<4)fail(id+": fewer than four summary concepts");
 const defs=rows.slice(0,4).map(r=>String(r.slice(1).join(" — ")).trim());
 if(new Set(defs).size!==4||defs.some(x=>!x))fail(id+": non-distinct recap definitions");
 for(const [i,q] of curated.entries()){
  if(!q.prompt||!q.reason)fail(id+" Q"+i+": missing explanation or prompt");
  if(!Array.isArray(q.options)||q.options.length!==4||new Set(q.options).size!==4)fail(id+" Q"+i+": bad options");
  if(!Number.isInteger(q.correct)||q.correct<0||q.correct>3)fail(id+" Q"+i+": invalid answer");
 }
 if(!lesson.readerChapters?.length)fail(id+": no complete reading chapters");
 const links=lesson.officialExamLinks||[];
 if(!links.length)fail(id+": no original exam links");
 for(const l of links)if(!exams[l.exam]?.[l.number])fail(id+": missing source original "+l.exam+" Q"+l.number);
}
const originals=Object.values(exams).reduce((sum,a)=>sum+Object.keys(a).length,0);
if(originals!==110)fail("Expected 110 transcribed original 2021 questions");
for(const [exam,qs] of Object.entries(exams)){
 for(const [n,q] of Object.entries(qs)){
  if(!q.question||q.options?.length!==4||!("ABCD".includes(q.answer)))fail(exam+" Q"+n+": invalid transcription");
 }
}
if(!html.includes("qcm-support-reviewed.js")||!html.includes("official-links-audited.js"))fail("Script loading incomplete");
const counts=Object.entries(training).reduce((n,[,q])=>n+q.length,0);
if(errors.length){console.error(errors.join("\n"));process.exitCode=1;}
else console.log("PASS:",lessons.length,"courses; 10 practice QCM/course =",lessons.length*10,"(authored",counts,"+ recap",lessons.length*4,"); original 2021 questions =",originals,"; inline scripts parsed =",scripts);
