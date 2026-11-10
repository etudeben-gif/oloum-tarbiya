/* منهجية المراجعة: ملخص الدرس، الشرح المفصل، 10 QCM تدريبية، ثم أسئلة المباراة الأصلية 2021 مع التعليل. */
(function(){
"use strict";
const courses=window.MASAR_ISLAM_COURSES||[];
const bank=window.MASAR_ISLAM_TRANSCRIPT||{};
const section=document.getElementById("courses");
const original=document.getElementById("course-items");
if(!section||!original||!courses.length)return;
original.hidden=true;
const staticExample=document.getElementById("masar-static-course");
if(staticExample)staticExample.hidden=true;
const oldNotice=section.querySelector(".notice");
if(oldNotice)oldNotice.hidden=true;
const order=["التخصص","الديداكتيك","الأولى إعدادي","الثانية إعدادي","الثالثة إعدادي","المنهاج الرسمي","المقالات الرسمية","منهجية"];
courses.sort((a,b)=>order.indexOf(a.group)-order.indexOf(b.group));
const container=document.createElement("div");container.id="masar-course-app";
section.insertBefore(container,section.firstChild);
const N=(tag,cls,value)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(value!==undefined)x.textContent=value;return x};
const letters="ABCDE";
const examLabels={"2021-specialty":"تخصص التربية الإسلامية · دجنبر 2021","2021-didactics":"ديداكتيك التربية الإسلامية · دجنبر 2021"};
const examPdf={"2021-specialty":"https://drive.google.com/file/d/1TOgJD3LlkogCecwnDmZv-kYPdSSfZaxm/view","2021-didactics":"https://drive.google.com/file/d/1TOUSy2tf8Sg5TE5h9qVph3Yq7Krf-QFk/view"};
const hero=N("div","master-hero");
hero.append(
  N("div","master-pill","الوثائق الأصلية أولاً · ثم ملخصات توضيحية موسومة بمصدرها"),
  N("h2",null,"التربية الإسلامية: المصادر الأصلية والبرنامج الرسمي"),
  N("p",null,courses.length+" محوراً في البرنامج والمراجعة. المنهاج الوزاري يحدد المضامين والتدرج، لكنه لا يقدم بالضرورة نص درس تخصص مفصل في كل موضوع. المراجع الأصلية معروضة قبل أي تلخيص."),
  N("p",null,"التلخيصات والشروح وأسئلة التدريب نصوص تحريرية غير رسمية، وليست منقولة من كتاب مدرسي. أسئلة امتحان 2021 وحدها منقولة من ورقتيه الأصليتين مع مفاتيحها المرفقة.")
);
const filters=N("div","master-filters");
const search=N("input");search.type="search";search.placeholder="ابحث عن موضوع أو آية أو مفهوم أو حكم فقهي...";search.setAttribute("aria-label","البحث في كل محتوى الدروس");
const select=N("select");select.setAttribute("aria-label","المجال الدراسي");
for(const [value,label] of [["التخصص","التخصص: علوم شرعية"],["الديداكتيك","الديداكتيك: التخطيط والتدبير والتقويم"],["الأولى إعدادي","الأولى إعدادي"],["الثانية إعدادي","الثانية إعدادي"],["الثالثة إعدادي","الثالثة إعدادي"],["المنهاج الرسمي","خرائط المنهاج الرسمية"],["المقالات الرسمية","الأسئلة المقالية الرسمية"],["منهجية","منهجية الاختبار"],["all","جميع الدروس"]]){const opt=N("option",null,label);opt.value=value;select.append(opt)}
select.value="التخصص";filters.append(select,search);hero.append(filters);
const progress=N("p","master-pill");hero.append(progress);
const library=N("div","master-library");
const detail=N("article","master-detail");
const quiz=N("section","master-quiz");quiz.id="masar-master-quiz";
container.append(hero,library,detail,quiz);
let finished={};try{finished=JSON.parse(localStorage.getItem(window.MASAR_PROFILES?.key("masar-islam-lessons-v2")||"masar-islam-lessons-v2")||"{}")||{}}catch(_){}
let answers={};try{answers=JSON.parse(localStorage.getItem(window.MASAR_PROFILES?.key("masar-islam-qcm-v2")||"masar-islam-qcm-v2")||"{}")||{}}catch(_){}
let current="quran",activeQuestion=0,picked="";
const questionIds=Object.entries(bank).flatMap(([exam,questions])=>Object.keys(questions).map(q=>({exam,q})));
function scoreSummary(){
 let right=0,wrong=0,skipped=0;
 for(const {exam,q} of questionIds){const answer=answers[exam+"-"+q];if(!answer){skipped++;continue}if(answer===bank[exam][q].answer)right++;else wrong++}
 return {right,wrong,skipped,points:right-wrong,attempted:right+wrong,total:questionIds.length};
}
function scoreText(s){return (s.points>0?"+":"")+s.points}
function makeMindMap(c){
 const box=N("section","master-mindmap");
 box.setAttribute("aria-label","الخريطة الذهنية التفاعلية للدرس");
 box.append(N("div","master-mindmap-kicker","تصوّر الدرس قبل القراءة"));
 box.append(N("h3",null,"الخريطة الذهنية"));
 box.append(N("p","master-mindmap-note","اضغط على أي فرع للانتقال مباشرة إلى الشرح المرتبط به."));
 const root=N("div","master-mindmap-root");
 root.append(N("span","master-mindmap-root-icon","✦"),N("strong",null,c.title),N("span","master-mindmap-root-sub",c.readerChapters.length+" مفاهيم أساسية"));
 box.append(root);
 const branches=N("div","master-mindmap-branches");
 c.readerChapters.forEach((part,i)=>{
  const btn=N("button","master-mindmap-branch",part.title);
  btn.type="button";btn.setAttribute("aria-label","اقرأ القسم: "+part.title);
  btn.append(N("small",null,"المحور "+(i+1)));
  btn.onclick=()=>document.getElementById("islam-chapter-"+i)?.scrollIntoView({behavior:"smooth",block:"start"});
  branches.append(btn);
 });
 box.append(branches);
 return box;
}
function persist(){
 try{localStorage.setItem(window.MASAR_PROFILES?.key("masar-islam-lessons-v2")||"masar-islam-lessons-v2",JSON.stringify(finished))}catch(_){}
 try{localStorage.setItem(window.MASAR_PROFILES?.key("masar-islam-qcm-v2")||"masar-islam-qcm-v2",JSON.stringify(answers))}catch(_){}
 try{window.dispatchEvent(new Event("masar-lesson-qcm"))}catch(_){}
}
function normalize(v){return String(v||"").normalize("NFKC").toLocaleLowerCase("ar").replace(/[\u064b-\u065f\u0670]/g,"").replace(/[إأآ]/g,"ا").replace(/ى/g,"ي")}
function matches(c){
 const cat=select.value,searchTerm=normalize(search.value.trim());
 const text=[c.title,c.summary,...(c.readerChapters||[]).flatMap(p=>[p.title,p.text]),...(c.readerGlossary||[]).flatMap(p=>[p.title,p.text])].join(" ");
 return (cat==="all"||c.group===cat)&&(!searchTerm||normalize(text).includes(searchTerm));
}
function link(label,url){const a=N("a",null,label);a.href=url;a.target="_blank";a.rel="noopener noreferrer";return a}
function splitParagraphs(text){
 return String(text).split(/\n\s*\n|\n/g).map(p=>p.trim()).filter(Boolean);
}
function updateProgress(){
 const f=courses.filter(c=>finished[c.id]).length;
 const score=scoreSummary();
 progress.textContent="أنجزت "+f+" / "+courses.length+" درساً · "+score.attempted+" / "+score.total+" سؤالاً · النقطة "+scoreText(score)+" · ✓"+score.right+" / ✕"+score.wrong;
 const top=document.getElementById("progress");if(top)top.textContent="النظام الكندي: "+scoreText(score)+" نقطة · "+score.right+" صحيح · "+score.wrong+" خطأ";
 const oldScore=document.getElementById("total-score");
 const oldBreakdown=document.getElementById("answered-total");
 const oldBar=document.getElementById("progress-fill");
 if(oldScore)oldScore.textContent=scoreText(score)+" نقطة";
 if(oldBreakdown)oldBreakdown.textContent=score.right+" صحيح (+1) · "+score.wrong+" خطأ (−1) · "+score.skipped+" متروك (0)";
 if(oldBar)oldBar.style.width=100*score.attempted/Math.max(1,score.total)+"%";
}
function showList(){
 library.replaceChildren();
 const subset=courses.filter(matches);
 if(!subset.length){library.append(N("p",null,"ما لقيناش درساً مطابقاً. بدّل كلمة البحث أو المجال."));return}
 for(const c of subset){
  const b=N("button","master-tile"+(c.id===current?" selected":""),c.title);b.type="button";
  b.append(N("small",null,c.group+" · "+c.readerChapters.length+" فصول"+(finished[c.id]?" · ✓ قُرئ":"")));
  b.onclick=()=>openCourse(c.id,true);library.append(b);
 }
}
function goTo(id,scroll=true){
 const c=courses.find(x=>x.id===id);if(!c)return;
 current=id;activeQuestion=0;picked="";
 renderCourse(c);renderQuiz(c);showList();updateProgress();
 if(scroll)detail.scrollIntoView({behavior:"smooth",block:"start"});
}

const practiceKey=window.MASAR_PROFILES?.key("masar-islam-practice-v3")||"masar-islam-practice-v3";
let practice={};try{practice=JSON.parse(localStorage.getItem(practiceKey)||"{}")||{}}catch(_){}
function savePractice(){try{localStorage.setItem(practiceKey,JSON.stringify(practice))}catch(_){}}
function shortText(text,max=280){
 const first=String(text||"").split(/\n+/)[0];
 return first.length>max?first.slice(0,max).trim()+"…":first.trim();
}
function lessonRows(c){
 const arr=c.resumeRows?.length>=4?c.resumeRows:(c.readerChapters||[]).slice(0,4).map(p=>[p.title,shortText(p.text,145)]);
 return arr.filter(r=>Array.isArray(r)&&r.length>=2&&String(r[0]).trim()&&String(r.slice(1).join(" — ")).trim());
}
function extraConceptQuestions(c){
 const rows=lessonRows(c).slice(0,4).map(r=>[String(r[0]).trim(),String(r.slice(1).join(" — ")).trim()]);
 if(rows.length!==4||new Set(rows.map(r=>r[1])).size!==4)return [];
 const definitions=rows.map(r=>r[1]);
 const stems=[
   "في ضوء ملخص هذا الدرس، ما العبارة الأدق التي تفسر «",
   "إذا ورد المفهوم «",
   "لتمييز المفهوم «",
   "أي تفسير يناسب «"
 ];
 return rows.map((r,i)=>({
   prompt:stems[i]+r[0]+"»؟",options:definitions.slice(),correct:i,
   reason:"يوضح ملخص الدرس أن «"+r[0]+"» معناه: "+r[1]+". أما العبارات الأخرى فتخص مفاهيم مختلفة في الدرس.",
   kind:"تثبيت التمييز بين المفاهيم",authored:true,sourceLesson:c.id
 }));
}
function practiceQuestions(c){
 const authored=window.MASAR_CURATED_QCM?.[c.id]||[];
 const candidates=[...authored.slice(0,6),...extraConceptQuestions(c)];
 const seed=Array.from(c.id).reduce((v,ch)=>v+ch.charCodeAt(0),0)%4;
 return candidates.map((item,i)=>{
   if(!Array.isArray(item.options)||item.options.length!==4||!Number.isInteger(item.correct)||item.correct<0||item.correct>3)return null;
   const rotate=(seed+(i<6?3*i:2*(i-6)))%4;
   const indices=[0,1,2,3].map(n=>(n+rotate)%4);
   return {...item,options:indices.map(j=>item.options[j]),correct:indices.indexOf(item.correct)};
 }).filter(Boolean);
}
function renderPractice(c){
 const questions=practiceQuestions(c);
 const box=N("section","master-practice");
 box.append(N("span","master-quick-kicker","المرحلة الثانية — اختبار تدريبي من هذا الدرس · ليس امتحاناً وزارياً"));
 box.append(N("h3",null,"10 QCM لفهم "+c.title));
 box.append(N("p","master-practice-intro","6 أسئلة تطبيقية محررة لهذا الموضوع + 4 أسئلة تثبيت مستخرجة من ملخصه. تتغير مواضع الإجابة الصحيحة، ويظهر الجواب والتعليل بعد الاختيار."));
 if(questions.length!==10){
  box.append(N("p","master-noq","تعذر تحميل مجموعة هذا الدرس كاملة؛ تحقق من ملفات بنك المراجعة قبل إجراء الاختبار."));
  return box;
 }
 const score=questions.reduce((total,item,i)=>{const choice=practice[c.id+"-review-"+i];return choice===undefined?total:total+(choice===item.correct?1:-1)},0);
 const done=questions.filter((_,i)=>practice[c.id+"-review-"+i]!==undefined).length;
 box.append(N("div","master-practice-score","نقطتك في التدريب: "+(score>0?"+":"")+score+" · أجبت عن "+done+" / 10"));
 questions.forEach((item,i)=>{
  const key=c.id+"-review-"+i,chosen=practice[key],q=N("article","master-practice-question");
  q.append(N("strong",null,"Q"+(i+1)+" — "+item.kind),N("p",null,item.prompt));
  const options=N("div","master-practice-options");
  item.options.forEach((option,j)=>{
   const state=chosen!==undefined?(j===item.correct?" correct":j===chosen?" wrong":""):"";
   const b=N("button","master-practice-option"+state,String.fromCharCode(65+j)+" — "+option);
   b.type="button";b.disabled=chosen!==undefined;
   b.onclick=()=>{practice[key]=j;savePractice();box.replaceWith(renderPractice(c))};
   options.append(b);
  });
  q.append(options);
  if(chosen!==undefined){
   const good=chosen===item.correct;
   const fb=N("div","master-practice-feedback"+(good?"":" wrong"));
   fb.append(N("strong",null,good?"✓ جواب صحيح +1":"✗ جواب غير صحيح −1"));
   fb.append(N("p",null,"الجواب الصحيح: "+String.fromCharCode(65+item.correct)+" — "+item.options[item.correct]));
   if(!good)fb.append(N("p",null,"اختيارك: "+String.fromCharCode(65+chosen)+" — "+item.options[chosen]));
   fb.append(N("p",null,"التعليل: "+item.reason));
   fb.append(N("p","mini","هذا سؤال تدريبي من ملخص الدرس، وليس نصاً مقتبساً من مباراة رسمية."));
   q.append(fb);
   const retry=N("button","master-practice-retry","إعادة محاولة السؤال");retry.type="button";
   retry.onclick=()=>{delete practice[key];savePractice();box.replaceWith(renderPractice(c))};
   q.append(retry);
  }
  box.append(q);
 });
 return box;
}
function renderCourse(c){
 detail.replaceChildren();
 const heading=N("div","master-title");
 heading.append(N("span","master-tag",c.group),N("h2",null,c.title),N("p",null,"الوثيقة الأصلية أولاً، ثم ملخص وشرح غير رسميين، ثم تدريبات محررة، وبعدها أسئلة المباريات المنقولة عن الأصل."));
 detail.append(heading);
 const official=N("section","master-primary-documents");
 official.append(N("h3",null,"أولاً: الوثيقة الأصلية المعتمدة — قبل أي ملخص"));
 const origin=N("p",null,"البرنامج الوزاري يحدد محتوى المادة وتوزيع الدروس، ولا يعادل كتاباً مفصلاً في علوم القرآن أو الحديث أو الفقه. اقرأ الوثيقة الأصلية وتحقق من المحاور قبل استعمال الملخص أدناه.");
 official.append(origin);
 const ministry="https://ampei.ma/wp-content/uploads/2021/02/وثيقة-منهاج-التربية-الإسلامية-بسلكي-التعليم-الثانوي-الإعدادي-والتأهيلي-العمومي-والخصوصي-يونيو-2016.pdf";
 const older="https://drive.google.com/file/d/1sgRHfZiHx1M1cL1nTiXffPjYJNRZY6ee/view";
 const specialty="https://drive.google.com/file/d/1WBEIWhyO7RyFQJDK7TyMKnMX3mqHMelg/view";
 const didactics="https://drive.google.com/file/d/17VzuoBGS3TtsujEyxxX9okcfJfWgVpJB/view";
 official.append(link("منهاج الوزارة يونيو 2016 — PDF أصلي",ministry));
 if(c.group==="الأولى إعدادي")official.append(N("p",null,"موضع البرنامج: الصفحتان 13–14 من وثيقة 2016."));
 if(c.group==="الثانية إعدادي")official.append(N("p",null,"موضع البرنامج: الصفحتان 15–16 من وثيقة 2016."));
 if(c.group==="الثالثة إعدادي")official.append(N("p",null,"موضع البرنامج: الصفحتان 17–18 من وثيقة 2016."));
 if(c.group==="الديداكتيك")official.append(N("p",null,"توصيف الاختبار من المركز الوطني للامتحانات: المجالات وأوزانها، وليس درساً مفصلاً."),link("التوصيف الرسمي للديداكتيك — PDF",didactics));
 if(c.group==="التخصص")official.append(N("p",null,"وثيقة توصيف اختبار مادة التخصص تحدد المجالات المحتملة للأسئلة، ولا تعتبر مرجعاً تعليمياً مفصلاً لكل علم."),link("توصيف اختبار التخصص — PDF",specialty));
 if(["الأولى إعدادي","الثانية إعدادي","الثالثة إعدادي"].includes(c.group))official.append(link("التوجيهات التربوية 2009 — مرجع تاريخي سابق للمنهاج المعدل",older));
 detail.append(official);
 const rows=lessonRows(c),compact=N("section","master-quick-review master-focused");
 compact.append(N("span","master-quick-kicker","تلخيص تحريري غير رسمي — للمساعدة فقط"),N("h3",null,"ملخص مُحرّر من فريق الموقع، وليس نص درس وزارياً"));
 const table=N("table","master-quick-table"),th=N("thead"),tr=N("tr"),body=N("tbody");
 tr.append(N("th",null,"المفهوم أو القضية"),N("th",null,"الخلاصة الدقيقة"));th.append(tr);table.append(th);
 for(const r of rows){const line=N("tr");line.append(N("td",null,r[0]),N("td",null,r.slice(1).join(" — ")));body.append(line)}
 table.append(body);compact.append(table);
 const understand=N("div","master-understand");
 understand.append(N("h4",null,"انتبه عند حل QCM"),N("p",null,c.examTip||"اقرأ المطلوب بدقة، ثم قارن الاختيارات على أساس التعليل."));
 compact.append(understand);detail.append(compact);
 const chapters=Array.isArray(c.readerChapters)?c.readerChapters:[];
 if(chapters.length){
  const full=N("details","master-full-course"),toggle=N("summary",null,"اقرأ الشرح المفصل للدرس ("+chapters.length+" فصول)"),outline=N("div","master-outline"),items=N("ol"),reading=N("div","master-reading");
  full.append(toggle);
  chapters.forEach((part,i)=>{
   const sectionId="masar-reading-"+c.id+"-"+i,li=N("li"),anchor=N("a",null,part.title);
   anchor.href="#"+sectionId;li.append(anchor);items.append(li);
   const chapter=N("section","master-chapter");chapter.id=sectionId;
   chapter.append(N("span","master-chapter-number","القسم "+(i+1)+"/"+chapters.length),N("h3",null,part.title));
   for(const p of String(part.text||"").split(/\n\s*\n/).filter(Boolean))chapter.append(N("p",null,p.trim()));
   reading.append(chapter);
  });
  outline.append(N("h3",null,"فهرس الشرح التفصيلي"),items);full.append(outline,reading);
  if(c.readerGlossary?.length){
   const gloss=N("section","master-glossary");gloss.append(N("h3",null,"مفاهيم واستدراكات"));
   for(const p of c.readerGlossary){const item=N("div","master-glossary-entry");item.append(N("h4",null,p.title),N("p",null,p.text));gloss.append(item)}full.append(gloss);
  }
  detail.append(full);
 }
 detail.append(renderPractice(c));
 const sources=N("details","master-citations master-citations-compact");
 sources.append(N("summary",null,"المراجع والأوراق الأصلية"));
 sources.append(N("p",null,c.sourceNote||"المحتوى تعليمي، وتوثق الأوراق الأصلية منفصلة."));
 for(const ref of (c.officialSources||[])){const row=N("div","master-citation-line");row.append(N("small",null,ref.type+" · "),link(ref.title,ref.url));sources.append(row)}
 detail.append(sources);
 const actions=N("div","master-action-row"),mark=N("button","primary",finished[c.id]?"✓ درس مراجع":"✓ أنهيت مراجعة الدرس");
 mark.type="button";mark.onclick=()=>{finished[c.id]=!finished[c.id];persist();updateProgress();mark.textContent=finished[c.id]?"✓ درس مراجع":"✓ أنهيت مراجعة الدرس";showList()};
 const i=courses.findIndex(x=>x.id===c.id),prev=N("button",null,"الدرس السابق"),next=N("button",null,"الدرس التالي"),original=N("button",null,"أسئلة المباراة الأصلية");
 for(const b of [prev,next,original])b.type="button";
 prev.disabled=i===0;next.disabled=i===courses.length-1;
 prev.onclick=()=>goTo(courses[i-1].id);next.onclick=()=>goTo(courses[i+1].id);
 original.onclick=()=>quiz.scrollIntoView({behavior:"smooth",block:"start"});
 actions.append(mark,prev,next,original);detail.append(actions);
}
function renderQuiz(c){
 quiz.replaceChildren();
 const list=c.officialExamLinks||[];
 quiz.append(N("h3",null,"المرحلة الثالثة — أسئلة QCM من المباريات السابقة"));
 quiz.append(N("p",null,"أسئلة دجنبر 2021 المنقولة من أوراق التخصص والديداكتيك، مع الأصل المصور والاختيارات الأربعة وحرف الجواب ودليل التصحيح. التعليل تحرير تعليمي. تنقيط المراجعة هنا: +1 صحيح، −1 خطأ، 0 متروك."));
 const board=N("div","master-scoreboard");
 const score=scoreSummary();
 for(const [label,value,kind] of [["النقطة",scoreText(score),"points"],["صحيح +1",score.right,"correct"],["خطأ −1",score.wrong,"incorrect"],["متروك 0",score.skipped,"skipped"]]){
  const item=N("div","master-scoreboard-item "+kind);
  item.append(N("span",null,label),N("strong",null,String(value)));
  board.append(item);
 }
 quiz.append(board);
 if(!list.length){
  const empty=N("p","master-noq","لا يوجد في بنك دجنبر 2021 سؤال يُطابق موضوع هذا الدرس مباشرة. الأسئلة التدريبية أعلاه مرتبطة بالدرس؛ وللاطلاع على الأسئلة الرسمية افتح الورقتين أدناه.");
  empty.append(" ",link("أسئلة التخصص الأصلية",examPdf["2021-specialty"])," · ",link("أسئلة الديداكتيك الأصلية",examPdf["2021-didactics"]));quiz.append(empty);return;
 }
 quiz.append(N("p",null,"المتاح: "+list.length+" سؤالاً من امتحان دجنبر 2021. يوضح الوسم هل السؤال في المبحث نفسه أم مجرد سؤال في المجال الأوسع. النصوص والاختيارات من بنك الورقة المنقول."));
 const picker=N("div","master-quiz-picker");
 list.forEach((entry,i)=>{
  const b=N("button",(i===activeQuestion?"current":""),"Q"+entry.number+" · "+"مرتبط");
  b.type="button";b.title=entry.linkStrength+" — "+entry.question;
  b.onclick=()=>{activeQuestion=i;picked="";renderQuiz(c)};
  picker.append(b);
 });quiz.append(picker);
 const entry=list[Math.min(activeQuestion,list.length-1)];
 const obj=bank[entry.exam]?.[String(entry.number)];
 if(!obj){quiz.append(N("p","master-noq","تعذر العثور على السؤال في النص المنقول. افتح PDF الأصلي."));return}
 const qbox=N("article","master-quiz-question");
 qbox.append(N("span","master-tag",examLabels[entry.exam]+" · Q"+entry.number+" · "+entry.linkStrength));
 if(obj.task)qbox.append(N("p","master-tag","تنبيه: المطلوب في السؤال الأصلي هو «"+obj.task+"»؛ انتبه لاختيار العبارة غير الصحيحة."));
 qbox.append(N("h4",null,obj.question));
 if(obj.context)qbox.append(N("div","master-question-context",obj.context));
 const ansId=entry.exam+"-"+entry.number,existing=answers[ansId];
 for(const [i,option] of obj.options.entries()){
  const label=N("label","master-choice"),radio=N("input");radio.type="radio";radio.name="islam-master-answer";radio.value=letters[i];
  radio.disabled=!!existing;radio.checked=existing===letters[i];
  radio.onchange=()=>{picked=letters[i]};
  label.append(radio,N("strong",null,letters[i]+" — "),document.createTextNode(option));qbox.append(label);
 }
 const controls=N("div");
 const check=N("button","master-quiz-button",existing?"تم التصحيح":"صحّح الجواب");
 check.type="button";check.disabled=!!existing;
 check.onclick=()=>{if(!picked){alert("اختار أولاً أحد الأجوبة A أو B أو C أو D.");return}answers[ansId]=picked;persist();renderQuiz(c)};
 const retry=N("button","master-quiz-button secondary","عاود نفس السؤال");retry.type="button";retry.hidden=!existing;
 retry.onclick=()=>{delete answers[ansId];picked="";persist();renderQuiz(c)};
 const skip=N("button","master-quiz-button secondary","تخطي (0 نقطة)");skip.type="button";skip.disabled=activeQuestion>=list.length-1;
 skip.onclick=()=>{activeQuestion++;picked="";renderQuiz(c)};
 const next=N("button","master-quiz-button secondary","السؤال التالي");next.type="button";next.disabled=activeQuestion>=list.length-1;
 next.onclick=()=>{activeQuestion++;picked="";renderQuiz(c)};
 controls.append(check,retry,skip,next);qbox.append(controls);
 if(existing){
  const good=existing===obj.answer,feedback=N("div","master-feedback"+(good?"":" wrong"));
  feedback.append(N("strong",null,good?"✓ جواب صحيح · +1 نقطة":"✗ الجواب غير صحيح · −1 نقطة"));
  feedback.append(N("p",null,"جوابك: "+existing+" · الجواب الصحيح حسب دليل 2021: "+obj.answer+" — "+(obj.options[letters.indexOf(obj.answer)]||"راجع الاختيارات الأصلية")));
  feedback.append(N("p",null,"التعليل: "+obj.reason));
   const notes=window.MASAR_ISLAM_OPTION_NOTES?.[ansId];
   if(notes){
     const review=N("div","master-choice-rationales");
     review.append(N("strong",null,"تحليل الاختيارات واحداً واحداً"));
     for(let i=0;i<obj.options.length;i++){
       const letter=letters[i];
       const why=notes[letter];
       if(why)review.append(N("p",null,letter+" — "+(letter===obj.answer?"✓ ":"✗ ")+why));
     }
     feedback.append(review);
   }else{
     feedback.append(N("p","master-explanation-limit","التعليل يشرح سبب اختيار الجواب المحدد في مفتاح 2021. لم يكتمل بعد تحليل مستقل لكل بديل في هذا السؤال، لذلك لا ننسب تبريراً غير مدقق إلى المصدر الأصلي."));
   }
  feedback.append(N("p",null,"المطلوب: "+(obj.task||"اختيار الجواب الصحيح")+". وثيقة التصحيح الأصلية هي مرجع الحرف، أما شرح المفهوم فصياغة تعليمية."));
  feedback.append(link("افتح ملف PDF الأصلي ودليل التصحيح",obj.keySourceUrl||examPdf[entry.exam]));
  qbox.append(feedback);
 }
 qbox.append(N("p",null,"المصدر: "+(obj.keySource||"ورقة امتحان 2021")+" — "+examLabels[entry.exam]));
 qbox.append(link("تحقق من نص السؤال ودليل الإجابة في PDF الأصلي",obj.keySourceUrl||examPdf[entry.exam]));
 quiz.append(qbox);
 updateProgress();
}
function openCourse(id,scroll=true){goTo(id,scroll)}
select.addEventListener("change",()=>{
 const first=courses.find(matches);
 if(first)goTo(first.id,false);else showList();
});
search.addEventListener("input",()=>{
 const first=courses.find(matches);
 if(first&&first.id!==current)goTo(first.id,false);else showList();
});
window.MASAR_MASTER_SYNC=function(){
 try{answers=JSON.parse(localStorage.getItem(window.MASAR_PROFILES?.key("masar-islam-qcm-v2")||"masar-islam-qcm-v2")||"{}")||{}}catch(_){}
 const c=courses.find(x=>x.id===current);if(c)renderQuiz(c);
 updateProgress();
};
goTo(current,false);
})();