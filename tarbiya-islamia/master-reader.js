/* واجهة المقرر الموسع للتربية الإسلامية: الدروس أولا ثم QCM الرسمية 2021 وتفسير التصحيح. */
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
  N("div","master-pill","المقرر المفصل · اختبار التخصص والديداكتيك للسلك الثانوي"),
  N("h2",null,"التربية الإسلامية: شرح مختصر ومفهوم + QCM"),
  N("p",null,courses.length+" ملخصاً منظماً لعلوم التخصص وديداكتيك المادة ودروس الإعدادي. كل درس فيه مفاهيم مبسطة وأمثلة وفروق مهمة لـQCM، ثم تدريبات خاصة وأصلية عند توفرها."),
  N("p",null,"الدروس كاملة في شكل ملخص مفهوم، مع أمثلة وفروق QCM. بلا خريطة ذهنية ولا شرح مطوّل.")
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

const practiceKey=window.MASAR_PROFILES?.key("masar-islam-practice-2026")||"masar-islam-practice-2026";
let practice={};try{practice=JSON.parse(localStorage.getItem(practiceKey)||"{}")||{}}catch(_){}
function savePractice(){try{localStorage.setItem(practiceKey,JSON.stringify(practice))}catch(_){}}
function shortText(text,max=280){
 const parts=String(text||"").split(/\n+/)[0].match(/[^.!؟؛]+[.!؟؛]?/g)||[];
 let out="";for(const p of parts){if(out.length&&out.length+p.length>max)break;out+=p}
 return (out||String(text||"")).trim().slice(0,Math.max(max,out.length));
}
function lessonRows(c){
 if(c.resumeRows?.length>=4)return c.resumeRows;
 return c.readerChapters.slice(0,6).map(p=>[p.title,shortText(p.text,160)]);
}
function renderPractice(c){
 const rows=lessonRows(c).filter(r=>r[0]&&r[1]).slice(0,4),box=N("section","master-practice");
 box.append(N("span","master-quick-kicker","تدريب خاص بالدرس — غير وزاري"),N("h3",null,"QCM للفهم قبل الامتحان"),N("p","master-practice-intro","اختار المفهوم المناسب من 4 اختيارات؛ التصحيح يشرح العلاقة. الصحيح +1، الخطأ −1، المتروك 0."));
 if(rows.length<4)return box;
 let points=0;for(let i=0;i<4;i++){const x=practice[c.id+"-"+i];if(x!==undefined)points+=x===i?1:-1}
 box.append(N("div","master-practice-score","نقطة هذا الدرس: "+(points>0?"+":"")+points));
 for(let i=0;i<4;i++){
  const key=c.id+"-"+i,chosen=practice[key],q=N("div","master-practice-question");
  q.append(N("strong",null,"Q"+(i+1)+" — أي مفهوم ينطبق عليه الشرح؟"),N("p",null,rows[i].slice(1).join(" — ")));
  const choices=N("div","master-practice-options");
  for(let j=0;j<4;j++){
   const k=(j+i+1)%4,button=N("button","master-practice-option"+(chosen!==undefined&&k===i?" correct":chosen===k?" wrong":""),rows[k][0]);
   button.type="button";button.disabled=chosen!==undefined;
   button.onclick=()=>{practice[key]=k;savePractice();renderCourse(c)};
   choices.append(button);
  }
  q.append(choices);
  if(chosen!==undefined){
   q.append(N("p","master-practice-feedback",(chosen===i?"✓ صحيح +1":"✗ خطأ −1")+" · "+rows[i][0]+": "+rows[i].slice(1).join(" — ")));
   const retry=N("button","master-practice-retry","إعادة المحاولة");retry.type="button";
   retry.onclick=()=>{delete practice[key];savePractice();renderCourse(c)};q.append(retry);
  }
  box.append(q);
 }
 return box;
}
function renderCourse(c){
 detail.replaceChildren();
 const title=N("div","master-title");
 title.append(N("span","master-tag",c.group),N("h2",null,c.title),N("p",null,"شرح مختصر مفهوم حسب المنهاج، مثال، الفرق بين المصطلحات، وQCM مرتبطة بالدرس."));
 detail.append(title);
 const rows=lessonRows(c),compact=N("section","master-quick-review master-focused");
 compact.append(N("span","master-quick-kicker","خلاصة للمراجعة قبل 28 نونبر"),N("h3",null,"افهم الفكرة، ثم احفظ المصطلح"));
 const table=N("table","master-quick-table"),head=N("thead"),tr=N("tr"),body=N("tbody");
 tr.append(N("th",null,"المفهوم"),N("th",null,"الشرح الواضح"));head.append(tr);table.append(head);
 for(const r of rows){const line=N("tr");line.append(N("td",null,r[0]),N("td",null,r.slice(1).join(" — ")));body.append(line)}
 table.append(body);compact.append(table);
 const explain=N("div","master-understand");
 explain.append(N("h4",null,"كيفاش نفهم الدرس؟"),N("p",null,shortText(c.readerChapters[0]?.text,330)));
 explain.append(N("h4",null,"انتبه فـQCM"),N("p",null,c.examTip||"ميز المصطلحات المتشابهة، ثم طبقها على مثال واضح."));
 compact.append(explain);detail.append(compact);
 detail.append(renderPractice(c));
 const sources=N("details","master-citations master-citations-compact");
 sources.append(N("summary",null,"مراجع الدرس والوثائق الرسمية"));
 sources.append(N("p",null,c.sourceNote));
 for(const ref of c.officialSources){const row=N("div","master-citation-line");row.append(N("small",null,ref.type+" · "),link(ref.title,ref.url));sources.append(row)}
 detail.append(sources);
 const actions=N("div","master-action-row"),mark=N("button","primary",finished[c.id]?"✓ درس مراجع":"✓ أنهيت مراجعة الدرس");
 mark.type="button";mark.onclick=()=>{finished[c.id]=!finished[c.id];persist();updateProgress();mark.textContent=finished[c.id]?"✓ درس مراجع":"✓ أنهيت مراجعة الدرس";showList()};
 const i=courses.findIndex(x=>x.id===c.id),prev=N("button",null,"الدرس السابق"),next=N("button",null,"الدرس التالي"),original=N("button",null,"الأسئلة الأصلية المرتبطة بالدرس");
 for(const b of [prev,next,original])b.type="button";
 prev.disabled=i===0;next.disabled=i===courses.length-1;
 prev.onclick=()=>goTo(courses[i-1].id);next.onclick=()=>goTo(courses[i+1].id);
 original.onclick=()=>quiz.scrollIntoView({behavior:"smooth",block:"start"});
 actions.append(mark,prev,next,original);detail.append(actions);
}
function renderQuiz(c){
 quiz.replaceChildren();
 const list=c.officialExamLinks||[];
 quiz.append(N("h3",null,"المرحلة الثانية — QCM أصلية بعد الدرس"));
 quiz.append(N("p",null,"أسئلة 2021 من أوراق التخصص والديداكتيك مع التصحيح والتعليل. نظام التنقيط الكندي للتدريب فقط: +1 للإجابة الصحيحة، −1 للخاطئة، 0 للمتروكة."));
 const board=N("div","master-scoreboard");
 const score=scoreSummary();
 for(const [label,value,kind] of [["النقطة",scoreText(score),"points"],["صحيح +1",score.right,"correct"],["خطأ −1",score.wrong,"incorrect"],["متروك 0",score.skipped,"skipped"]]){
  const item=N("div","master-scoreboard-item "+kind);
  item.append(N("span",null,label),N("strong",null,String(value)));
  board.append(item);
 }
 quiz.append(board);
 if(!list.length){
  const empty=N("p","master-noq","ما لقيناش سؤالاً أصلياً مطابقاً لهاد الدرس ضمن أسئلة 2021. التدريب اللي فوق مخصص لنفس الموضوع وموسوم بأنه غير وزاري.");
  empty.append(" ",link("أسئلة التخصص الأصلية",examPdf["2021-specialty"])," · ",link("أسئلة الديداكتيك الأصلية",examPdf["2021-didactics"]));quiz.append(empty);return;
 }
 quiz.append(N("p",null,"المتاح: "+list.length+" سؤالاً أصلياً مربوطاً بهاذ المبحث بعد مراجعة العناوين؛ والتدريب الخاص بالدرس كاين فوق."));
 const picker=N("div","master-quiz-picker");
 list.forEach((entry,i)=>{
  const b=N("button",(i===activeQuestion?"current":""),"Q"+entry.number+" · "+"مرتبط");
  b.type="button";b.title=entry.question;
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