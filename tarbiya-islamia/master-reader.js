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
hero.append(N("h2",null,"دروس التربية الإسلامية"),N("p",null,"التخصص · الديداكتيك · مقررات الإعدادي"));
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

function lessonRows(c){
 return (c.resumeRows?.length?c.resumeRows:(c.readerChapters||[]).slice(0,6).map(x=>[x.title,x.text]));
}
function renderCourse(c){
 detail.replaceChildren();
 const title=N("div","master-title");
 title.append(N("span","master-tag",c.group),N("h2",null,c.title));
 if(c.sourceStatus){title.append(N("p","master-source-status",c.sourceStatus));}
 detail.append(title);
 const chapters=Array.isArray(c.readerChapters)?c.readerChapters:[];
 if(chapters.length){
  const reading=N("div","master-reading");
  chapters.forEach((part,i)=>{
   const chapter=N("section","master-chapter");
   chapter.id="masar-chapter-"+c.id+"-"+i;
   chapter.append(N("h3",null,part.title));
    if(part.sourceUrl)chapter.append(link(part.sourceLabel||"افتح النص الأصلي للدرس",part.sourceUrl));
   for(const paragraph of String(part.text||"").split(/\\n\\s*\\n/).filter(Boolean))
     chapter.append(N("p",null,paragraph.trim()));
   reading.append(chapter);
  });
  detail.append(reading);
 }
 if(c.readerGlossary?.length){
   const extra=N("section","master-glossary");
   extra.append(N("h3",null,"تتمة الدرس والمفاهيم المرتبطة"));
   for(const part of c.readerGlossary){
    const ch=N("div","master-glossary-item");
    ch.append(N("h4",null,part.title),N("p",null,part.text));
    extra.append(ch);
   }
   detail.append(extra);
 }
 const rows=lessonRows(c);
 if(rows.length){
  const summary=N("section","master-quick-review"),table=N("table","master-quick-table");
  const th=N("thead"),tr=N("tr"),tb=N("tbody");
  tr.append(N("th",null,"المفهوم"),N("th",null,"الخلاصة"));
  th.append(tr);table.append(th);
  for(const r of rows){
   const line=N("tr");
   line.append(N("td",null,r[0]),N("td",null,String(r.slice(1).join(" — "))));
   tb.append(line);
  }
  table.append(tb);
  summary.append(N("h3",null,c.sourceStatus?"ملخص مستخرج من الدروس المرتبطة بالمصادر الوزارية":"ملخص الدرس"),table);
  if(c.sourceNote)summary.append(N("p","master-source-note",c.sourceNote));
  detail.append(summary);
 }
 if(c.officialSources?.length){
  const src=N("section","master-citations");
  src.append(N("h3",null,"الوثائق المرجعية"));
  for(const ref of c.officialSources){
   const p=N("p",null,ref.type+" — ");
   p.append(link(ref.title,ref.url));src.append(p);
  }
  detail.append(src);
 }
 const actions=N("div","master-action-row");
 const mark=N("button","primary",finished[c.id]?"✓ تمت المراجعة":"تحديد الدرس كمراجع");
 mark.type="button";
 mark.onclick=()=>{finished[c.id]=!finished[c.id];persist();updateProgress();mark.textContent=finished[c.id]?"✓ تمت المراجعة":"تحديد الدرس كمراجع";showList()};
 const i=courses.findIndex(x=>x.id===c.id),prev=N("button",null,"الدرس السابق"),next=N("button",null,"الدرس التالي");
 for(const b of [prev,next])b.type="button";
 prev.disabled=i===0;next.disabled=i===courses.length-1;
 prev.onclick=()=>goTo(courses[i-1].id);next.onclick=()=>goTo(courses[i+1].id);
 actions.append(mark,prev,next);
 detail.append(actions);
}
function renderQuiz(c){quiz.replaceChildren();}
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