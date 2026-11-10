(()=>{"use strict";
const $=id=>document.getElementById(id),T=(tag,cls,text)=>{let e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e};
const courses=(window.MASAR_ISLAM_COURSES||[]).filter(c=>c.group!=="المقالات الرسمية"&&c.group!=="منهجية");
const originals=window.MASAR_ISLAM_TRANSCRIPT||{},base=window.MANAR_BASE_QCM||{},advanced=window.MANAR_ADVANCED_QCM||{};
const order=["التخصص","الديداكتيك","الأولى إعدادي","الثانية إعدادي","الثالثة إعدادي","المنهاج الرسمي"];
courses.sort((a,b)=>order.indexOf(a.group)-order.indexOf(b.group));
let selected=courses.find(x=>x.id==="quran")||courses[0],selectedPractice=selected?.id;
const levels=["متوسط","صعب"];
let state={};try{state=JSON.parse(localStorage.getItem("manar-practice-v1")||"{}")||{}}catch(_){}
const persist=()=>{try{localStorage.setItem("manar-practice-v1",JSON.stringify(state))}catch(_){}};
function tabs(name){document.querySelectorAll(".top-tabs button").forEach(b=>b.classList.toggle("active",b.dataset.tab===name));document.querySelectorAll(".tab-panel").forEach(p=>p.hidden=p.id!==name);window.scrollTo?.({top:0,behavior:"smooth"})}
document.querySelectorAll(".top-tabs button").forEach(b=>b.onclick=()=>tabs(b.dataset.tab));
const groups=[...new Set(courses.map(c=>c.group))],sel=$("lesson-group");for(const val of ["جميع المجالات",...groups]){const op=T("option",null,val);op.value=val==="جميع المجالات"?"all":val;sel.append(op)}
function paintList(){
 const query=$("lesson-search").value.trim(),g=sel.value,box=$("lesson-list");box.replaceChildren();
 const items=courses.filter(c=>(g==="all"||!g||c.group===g)&&(!query||(c.title+" "+c.summary+" "+(c.readerChapters||[]).map(x=>x.title).join(" ")).includes(query)));
 for(const c of items){const b=T("button","lesson-link"+(selected?.id===c.id?" active":""),c.title);b.type="button";b.onclick=()=>{selected=c;paintList();paintCourse();if(innerWidth<820)$("lesson-pane").scrollIntoView({behavior:"smooth",block:"start"})};box.append(b)}
 if(!items.length)box.append(T("p","empty","ما لقيت حتى درس بهاد البحث."));
}
$("lesson-search").oninput=paintList;sel.onchange=paintList;
function paragraphText(parent,raw){for(const part of String(raw||"").split(/\n\s*\n/).filter(x=>x.trim()))parent.append(T("p",null,part.trim()))}
function paintCourse(){
 const c=selected,box=$("lesson-pane");if(!c)return;box.replaceChildren();
 box.append(T("span","lesson-kind",c.group),T("h2",null,c.title));
 if(c.summary)box.append(T("p","lead",c.summary));
 const chapters=c.readerChapters?.length?c.readerChapters:(c.parts||[]).map(([title,text])=>({title,text}));
 for(const part of chapters){const sec=T("section","chapter");sec.append(T("h3",null,part.title));paragraphText(sec,part.text);box.append(sec)}
 if(c.readerGlossary?.length){for(const part of c.readerGlossary){const sec=T("section","chapter");sec.append(T("h3",null,part.title));paragraphText(sec,part.text);box.append(sec)}}
 const rows=c.resumeRows||[];
 if(rows.length){const summary=T("section","summary-area");summary.append(T("h3",null,"خلاصة الدرس"));for(const r of rows){const line=T("div","summary-row");line.append(T("b",null,r[0]),T("span",null,r.slice(1).join(" — ")));summary.append(line)}box.append(summary)}
 const foot=T("div","lesson-bottom"),ref=T("p","chapter-note","المحاور حسب التوصيف والمنهاج؛ الشرح ملخص دراسي محرر، لا اقتباس حرفي من الوزارة."),b=T("button","primary","اختبر فهمك من هذا الدرس");b.onclick=()=>{selectedPractice=c.id;$("practice-lesson").value=c.id;tabs("practice");paintPractice()};foot.append(ref,b);box.append(foot);
}
function questionsFor(id){
 const crafted=(advanced[id]||[]).map((q,i)=>({id:"hard-"+i,prompt:q[0],options:q.slice(1,5),correct:q[5],reason:q[6],difficulty:"صعب"}));
 const medium=(base[id]||[]).map((q,i)=>({id:"medium-"+i,prompt:q[0],options:q.slice(1,5),correct:q[5],reason:q[6],difficulty:"متوسط"}));
 return [...crafted,...medium];
}
const practiceSelect=$("practice-lesson");for(const c of courses){let op=T("option",null,c.group+" · "+c.title);op.value=c.id;practiceSelect.append(op)}
practiceSelect.value=selectedPractice;practiceSelect.onchange=()=>{selectedPractice=practiceSelect.value;paintPractice()};
$("practice-level").onchange=paintPractice;
$("reset-practice").onclick=()=>{for(const k of Object.keys(state))if(k.startsWith(selectedPractice+"/"))delete state[k];persist();paintPractice()};
function paintPractice(){
 const all=questionsFor(selectedPractice);
 const items=$("practice-level").value==="hard"?all.filter(x=>x.difficulty==="صعب"):all;
 const box=$("practice-content");box.replaceChildren();
 let answered=0,correct=0;for(const q of items){const pick=state[selectedPractice+"/"+q.id];if(Number.isInteger(pick)){answered++;if(pick===q.correct)correct++}}
 $("practice-stats").textContent=answered+" من "+items.length+" · "+correct+" صحيح · "+(answered-correct)+" خطأ";
 if(!items.length){box.append(T("p","empty","هاد الدرس مازال ما عندوش أسئلة من المستوى المختار."));return}
 items.forEach((q,i)=>{const block=T("article","question-card"),meta=T("div","question-meta"),badge=T("span","difficulty",q.difficulty);meta.append(T("span",null,"السؤال "+(i+1)),badge);block.append(meta,T("h3",null,q.prompt));const opts=T("div","option-list"),key=selectedPractice+"/"+q.id,pick=state[key];
  q.options.forEach((txt,j)=>{const b=T("button","option"+(pick!==undefined?(j===q.correct?" correct":j===pick?" wrong":""):""),String.fromCharCode(65+j)+" — "+txt);b.type="button";b.disabled=pick!==undefined;b.onclick=()=>{state[key]=j;persist();paintPractice()};opts.append(b)});block.append(opts);
  if(pick!==undefined){const fb=T("div","explain"+(pick===q.correct?"":" incorrect"));fb.append(T("strong",null,pick===q.correct?"✓ جواب صحيح":"✗ الجواب غير صحيح"),T("p",null,"الجواب الصحيح: "+String.fromCharCode(65+q.correct)+" — "+q.options[q.correct]),T("p",null,q.reason));block.append(fb)}
  box.append(block)
 });
}
const examList=[
 {id:"2021-specialty",label:"2021 · مادة التخصص",count:80,pages:23,first:3,optionCount:4},
 {id:"2021-didactics",label:"2021 · ديداكتيك",count:30,pages:13,first:3,optionCount:4},
 {id:"2022-specialty",label:"2022 · مادة التخصص",count:100,pages:19,first:2,optionCount:4},
 {id:"2022-didactics",label:"2022 · ديداكتيك",count:60,pages:12,first:2,optionCount:4},
 {id:"2023-specialty",label:"2023 · مادة التخصص",count:100,pages:19,first:1,optionCount:4},
 {id:"2023-didactics",label:"2023 · ديداكتيك",count:60,pages:10,first:1,optionCount:4},
 {id:"2025-specialty",label:"2025 · مادة التخصص",count:80,pages:18,first:2,optionCount:5},
 {id:"2025-didactics",label:"2025 · ديداكتيك",count:60,pages:16,first:2,optionCount:5}
];
let exam=examList[0],qNo=1,examAnswers={};try{examAnswers=JSON.parse(localStorage.getItem("manar-exams-v1")||"{}")||{}}catch(_){}
const saveExam=()=>{try{localStorage.setItem("manar-exams-v1",JSON.stringify(examAnswers))}catch(_){}};
for(const item of examList){const op=T("option",null,item.label);op.value=item.id;$("exam-year").append(op)}
$("exam-year").onchange=()=>{exam=examList.find(x=>x.id===$("exam-year").value);qNo=1;currentScanPage=1;renderExam()};
$("exam-question").onchange=()=>{qNo=Number($("exam-question").value)||1;renderExam()};
$("prev-question").onclick=()=>{qNo=Math.max(1,qNo-1);renderExam()};
$("next-question").onclick=()=>{qNo=Math.min(originals[exam.id]?exam.count:exam.pages,qNo+1);renderExam()};
/* الصفحة الدقيقة لكل سؤال غير موثقة؛ لا نستخدم معادلة تخمينية لإسناد السؤال لصفحة. */
let currentScanPage=1;
function scanImage(ex,p){
 const fig=T("figure","exam-scan"),image=T("img");image.src="../tarbiya-islamia/images/"+ex.id+"-"+String(p).padStart(2,"0")+".webp";image.alt="صورة الورقة الأصلية للدورة "+ex.label+", الصفحة "+p;image.loading="lazy";image.onerror=()=>{fig.replaceChildren(T("p","warning","صورة الصفحة غير متوفرة هنا"))};fig.append(image,T("figcaption",null,"الورقة الأصلية · الصفحة "+p));return fig
}
function renderExam(){
 const original=originals[exam.id]||{},known=Boolean(originals[exam.id]),q=known?original[String(qNo)]:null,box=$("exam-paper");box.replaceChildren();
 const select=$("exam-question");
 const total=known?exam.count:exam.pages;
 if(select.options.length!==total || select.dataset.exam!==exam.id){
  select.replaceChildren();select.dataset.exam=exam.id;
  for(let n=1;n<=total;n++){
   const op=T("option",null,known?"السؤال "+n:"الصفحة "+n);
   op.value=n;select.append(op);
  }
 }
 select.value=String(qNo);
 $("prev-question").disabled=qNo===1;$("next-question").disabled=qNo===total;
 box.append(T("h3",null,exam.label+" — "+(known?"السؤال ":"الصفحة ")+qNo));
 if(q?.context){
  box.append(T("div","exam-stimulus","نص الانطلاق المنقول مع السؤال:\n"+q.context));
 }
 const helper=T("p","chapter-note",known?"الورقة الأصلية: تصفّح صفحاتها للتحقق من النص والسند. لم يُتحقق من صفحة هذا السؤال تحديداً، لذلك لا نعرض رقم صفحة تخمينياً.":"الأسئلة غير مفرغة نصياً لهذه الدورة. تُعرض صفحات الورقة الأصلية دون اختيارات أو إجابات مفترضة.");
 box.append(helper);
 const panel=T("div","exam-scan-controls"),pLabel=T("label",null,"تصفح صفحة الوثيقة الأصلية: "),pSelect=T("select");
 for(let p=1;p<=exam.pages;p++){const o=T("option",null,"الصفحة "+p);o.value=p;pSelect.append(o)}
 if(!known)currentScanPage=qNo;
 currentScanPage=Math.max(1,Math.min(currentScanPage,exam.pages));
 pSelect.value=String(currentScanPage);
 pSelect.onchange=()=>{currentScanPage=Number(pSelect.value)||1;figure.replaceWith(scanImage(exam,currentScanPage));figure=panel.nextElementSibling};
 pLabel.append(pSelect);panel.append(pLabel);
 const back=T("button","outline","صفحة سابقة"),forward=T("button","outline","صفحة تالية");
 function changePage(delta){currentScanPage=Math.max(1,Math.min(exam.pages,currentScanPage+delta));pSelect.value=String(currentScanPage);const next=scanImage(exam,currentScanPage);figure.replaceWith(next);figure=next;back.disabled=currentScanPage<=1;forward.disabled=currentScanPage>=exam.pages}
 back.onclick=()=>changePage(-1);forward.onclick=()=>changePage(1);
 back.disabled=currentScanPage<=1;forward.disabled=currentScanPage>=exam.pages;
 panel.append(back,forward);box.append(panel);
 let figure=scanImage(exam,currentScanPage);box.append(figure);
 if(q){
  box.append(T("div","exam-question",(q.task?"المطلوب: "+q.task+"\n":"")+q.question));
  const options=T("div","answer-options"),key=exam.id+"/"+qNo;
  (q.options||[]).forEach((txt,i)=>{const label=T("label","answer-option"),radio=T("input");radio.type="radio";radio.name="official-exam-answer";radio.value="ABCD"[i];radio.checked=examAnswers[key]===radio.value;label.append(radio,document.createTextNode(" "+String.fromCharCode(65+i)+" — "+txt));options.append(label)});
  box.append(options);
  const act=T("div","actions"),btn=T("button","primary","تصحيح الجواب");act.append(btn);box.append(act);
  const feedback=T("div");box.append(feedback);
  btn.onclick=()=>{const selected=options.querySelector('input[name="official-exam-answer"]:checked');if(!selected){feedback.replaceChildren(T("p","warning","اختر جواباً قبل التصحيح."));return}examAnswers[key]=selected.value;saveExam();showFeedback()};
  function showFeedback(){feedback.replaceChildren();const ans=examAnswers[key];if(!ans)return;const right=ans===q.answer,fb=T("div","result-box"+(right?"":" wrong"));fb.append(T("strong",null,right?"✓ إجابة صحيحة":"✗ إجابة غير صحيحة"),T("p",null,"الجواب الصحيح: "+q.answer+" — "+(q.options["ABCD".indexOf(q.answer)]||"")),T("p",null,q.reason||"التعليل غير متاح"));feedback.append(fb)}
  showFeedback();
 }else if(known){
  box.append(T("p","warning","تعذر العثور على تفريغ موثق لهذا السؤال، يمكنك الرجوع إلى صور الوثيقة أعلاه."));
 }
 if(exam.id.startsWith("2021"))renderEssays();else $("essay-area").replaceChildren();
}
function renderEssays(){
 const container=$("essay-area");container.replaceChildren();
 const essay=(window.MASAR_ISLAM_COURSES||[]).find(x=>x.id===(exam.id==="2021-specialty"?"essay-2021-specialty":"essay-2021-didactics"));
 if(!essay)return;
 container.append(T("h3",null,"الأسئلة المقالية · "+exam.label),T("p",null,"نصوص السؤال وعناصر الإجابة في بنك الورقة، وتُراجع صور صفحاتها الأصلية أعلاه."));
 container.append(T("p","chapter-note","استعرض صفحات الورقة أعلاه لتحديد السند المقالي الأصلي؛ صورة الصفحة الثانية وحدها ليست سنداً مؤكداً لكل سؤال."));
 for(const p of essay.parts||[]){const details=T("details"),sum=T("summary",null,p[0]);details.append(sum);const answer=T("p",null,p[1]);details.append(answer);container.append(details)}
}
paintList();paintCourse();paintPractice();renderExam();
})();