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
  N("h2",null,"التربية الإسلامية: الدرس كاملاً ثم الأسئلة الرسمية"),
  N("p",null,courses.length+" درساً ومحوراً: القرآن والتجويد والحديث والفقه والعقيدة والأصول والسيرة، وديداكتيك المادة، ودروس الإعدادي الثلاث. الشرح منظم بالأفكار والأدلة والأمثلة، والأسئلة التفاعلية من ورقتي 2021 الأصليتين فقط."),
  N("p",null,"ابدأ بعلوم التخصص، أو اختر مستوى الإعدادي أو الديداكتيك. تميّز الأزرار بين سؤال مطابق لمجال الدرس وبين سؤال عام للمراجعة.")
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
let finished={};try{finished=JSON.parse(localStorage.getItem("masar-islam-lessons-v2")||"{}")||{}}catch(_){}
let answers={};try{answers=JSON.parse(localStorage.getItem("masar-islam-qcm-v2")||"{}")||{}}catch(_){}
let current="quran",activeQuestion=0,picked="";
function persist(){
 try{localStorage.setItem("masar-islam-lessons-v2",JSON.stringify(finished))}catch(_){}
 try{localStorage.setItem("masar-islam-qcm-v2",JSON.stringify(answers))}catch(_){}
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
 const a=Object.keys(answers).filter(k=>k.startsWith("2021-specialty-")||k.startsWith("2021-didactics-")).length;
 progress.textContent="مراجعة "+f+" / "+courses.length+" درساً · أجبت عن "+a+" سؤالاً من أصل 110 QCM رسمية";
 const top=document.getElementById("progress");if(top)top.textContent="تقدم المراجعة: "+f+" درساً / "+a+" سؤالاً";
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
function renderCourse(c){
 detail.replaceChildren();
 const title=N("div","master-title");
 title.append(N("span","master-tag",c.group+(c.id.startsWith("g1-")?" · الأولى إعدادي":c.id.startsWith("g2-")?" · الثانية إعدادي":c.id.startsWith("g3-")?" · الثالثة إعدادي":"")),N("h2",null,c.title),N("p",null,c.summary));
 title.append(N("p",null,"تتضمن القراءة "+c.readerChapters.length+" فصول أساسية، "+c.readerGlossary.length+" فقرة ضبط إضافية، ثم أسئلة من الامتحان الأصلي إن وُجدت صلة موضوعية موثقة."));
 detail.append(title);
 const toc=N("nav","master-outline");toc.setAttribute("aria-label","فهرس الدرس");
 toc.append(N("h3",null,"فهرس الدرس — اقرأ بالتسلسل"));
 const ol=N("ol");
 c.readerChapters.forEach((p,i)=>{const li=N("li"),a=N("a",null,p.title);a.href="#islam-chapter-"+i;li.append(a);ol.append(li)});
 toc.append(ol);detail.append(toc);
 const reading=N("div","master-reading");
 c.readerChapters.forEach((part,i)=>{
   const sec=N("section","master-chapter");sec.id="islam-chapter-"+i;
   sec.append(N("span","master-chapter-number","الفصل "+(i+1)+" / "+c.readerChapters.length),N("h3",null,part.title));
   for(const para of splitParagraphs(part.text))sec.append(N("p",null,para));
   reading.append(sec);
 });
 detail.append(reading);
 if(c.readerGlossary.length){
  const expand=N("details","master-glossary"),sum=N("summary",null,"مصطلحات وتفصيلات إضافية من الدرس (افتح للمراجعة)");
  expand.append(sum);
  for(const item of c.readerGlossary){
   const elem=N("div","master-glossary-item");elem.append(N("h4",null,item.title));
   for(const p of splitParagraphs(item.text))elem.append(N("p",null,p));
   expand.append(elem);
  }
  detail.append(expand);
 }
 const sources=N("section","master-citations");
 sources.append(N("h3",null,"المراجع الوزارية والملفات الأصلية"));
 sources.append(N("p",null,c.sourceNote+" الشرح مكتوب للمراجعة وليس نقلاً حرفياً من وثيقة الوزارة أو من مرجع فقهي."));
 for(const item of c.officialSources){
  const row=N("div","master-citation-line");row.append(N("small",null,item.type+" · "),link(item.title,item.url));sources.append(row);
 }
 detail.append(sources);
 const actions=N("div","master-action-row");
 const mark=N("button","primary",finished[c.id]?"✓ درس مراجع":"✓ أنهيت قراءة الدرس");
 mark.type="button";mark.onclick=()=>{finished[c.id]=!finished[c.id];persist();updateProgress();mark.textContent=finished[c.id]?"✓ درس مراجع":"✓ أنهيت قراءة الدرس";showList()};
 const currentIdx=courses.findIndex(x=>x.id===c.id),prev=N("button",null,"الدرس السابق"),next=N("button",null,"الدرس التالي");
 prev.type=next.type="button";prev.disabled=currentIdx===0;next.disabled=currentIdx===courses.length-1;
 prev.onclick=()=>goTo(courses[currentIdx-1].id);
 next.onclick=()=>goTo(courses[currentIdx+1].id);
 const exercise=N("button",null,"انزل إلى الأسئلة الرسمية");exercise.type="button";exercise.onclick=()=>quiz.scrollIntoView({behavior:"smooth",block:"start"});
 actions.append(mark,prev,next,exercise);detail.append(actions);
}
function renderQuiz(c){
 quiz.replaceChildren();
 const list=c.officialExamLinks||[];
 quiz.append(N("h3",null,"المرحلة الثانية — QCM أصلية بعد الدرس"));
 quiz.append(N("p",null,"هذه نصوص الأسئلة والاختيارات المنقولة من امتحاني مادة التخصص وديداكتيك التربية الإسلامية لدجنبر 2021. مفاتيح الإجابة من جدول العناصر المرفق بالورقة، والتعليل شرح تعليمي. ما كاين حتى سؤال مختلق."));
 if(!list.length){
  const empty=N("p","master-noq","هذا المحور ما لقيناش ليه سؤالاً مطابقاً ضمن 110 أسئلة QCM المنقولة من 2021؛ ما غاديش نعوضوه بسؤال مفبرك. تقدر تفتح ورقتي الامتحان الأصليتين.");
  empty.append(" ",link("أسئلة التخصص الأصلية",examPdf["2021-specialty"])," · ",link("أسئلة الديداكتيك الأصلية",examPdf["2021-didactics"]));quiz.append(empty);return;
 }
 quiz.append(N("p",null,"المتاح: "+list.length+" سؤالاً، منها "+list.filter(x=>x.linkStrength==="مباشر في مجال الدرس").length+" مباشرة في مجال الدرس؛ والأسئلة الموسومة «المجال الأوسع» تفيد في المراجعة لكنها لا تتناول عنوان الدرس حرفياً."));
 const picker=N("div","master-quiz-picker");
 list.forEach((entry,i)=>{
  const b=N("button",(i===activeQuestion?"current":""),"Q"+entry.number+" · "+(entry.linkStrength==="مباشر في مجال الدرس"?"مباشر":"موسع"));
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
 const next=N("button","master-quiz-button secondary","السؤال التالي");next.type="button";next.disabled=activeQuestion>=list.length-1;
 next.onclick=()=>{activeQuestion++;picked="";renderQuiz(c)};
 controls.append(check,retry,next);qbox.append(controls);
 if(existing){
  const good=existing===obj.answer,feedback=N("div","master-feedback"+(good?"":" wrong"));
  feedback.append(N("strong",null,good?"✓ جواب صحيح":"✗ الجواب غير صحيح"));
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
goTo(current,false);
})();