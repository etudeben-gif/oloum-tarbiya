/* Display authentic reading passages before relevant exam questions, directly on site. */
(function(){
"use strict";
const papers={
"2021-specialty":{label:"الوثيقة الأصلية التي تسبق الأسئلة الموضوعية",pages:[2],upto:3,note:"الصفحة الثانية من موضوع 2021 تعرض سنداً وأسئلة إنشائية قبل قسم QCM. اقرأها للتعرف على بنية الورقة، لكنها ليست بالضرورة سنداً لجميع أسئلة الاختيار."},
"2021-didactics":{label:"نص الانطلاق: ديداكتيك التربية الإسلامية 2021",pages:[2],upto:9,note:"هذه الصفحة تضم نصاً تمهيدياً ووضعيات وأسئلة مرتبطة ببداية الورقة. اقرأها قبل الإجابة على الأسئلة التي تحيل إليها."},
"2022-specialty":{label:"النصوص القرآنية الأصلية في بداية امتحان 2022",pages:[2],upto:4,note:"اقرأ النصوص الواردة في أول ورقة الأسئلة قبل اختيار الحروف. النص من صورة الامتحان الأصلية بلا تغيير."},
"2023-specialty":{label:"النص القرآني قبل الاختيارات – امتحان 2023",pages:[1],upto:5,note:"تبدأ ورقة التخصص بسند قرآني؛ اقرأه أولاً قبل الأسئلة التي تحيل عليه."},
"2025-specialty":{label:"النص القرآني وسند الأسئلة – امتحان 2025",pages:[2],upto:4,note:"توجد آيات قرآنية في بداية الورقة؛ اقرأها كما هي قبل الإجابة على الأسئلة المرتبطة بها."}
};
const paper=document.querySelector("#exams .quiz-paper");if(!paper)return;
const el=document.createElement("section");el.className="islam-intro-block";el.id="islam-intro-block";el.hidden=true;
const head=document.createElement("div");head.className="islam-intro-header";
const title=document.createElement("h3");title.textContent="نص الانطلاق";
const toggle=document.createElement("button");toggle.type="button";toggle.textContent="إخفاء النص";
head.append(title,toggle);
const note=document.createElement("p");note.className="mini";
const holder=document.createElement("div");holder.className="islam-intro-images";
el.append(head,note,holder);paper.insertBefore(el,paper.firstChild);
let latest=null,open=true;
function update(){
 const exam=document.getElementById("exam-sel")?.value||"";
 const q=Number(document.getElementById("question-sel")?.value)||1;
 const m=papers[exam];el.hidden=!m;
 if(!m)return;
 const newKey=exam+"-"+String(q<=m.upto);
 if(newKey!==latest){
  latest=newKey;open=q<=m.upto;holder.replaceChildren();
  for(const p of m.pages){
   const img=document.createElement("img");img.loading="lazy";
   img.src="images/"+exam+"-"+String(p).padStart(2,"0")+".webp";
   img.alt=m.label+" – الصفحة "+p;holder.append(img);
   img.onerror=function(){img.alt="تعذر تحميل صورة النص الأصلي، يمكنك الرجوع إلى صفحات الامتحان."}
  }
 }
 title.textContent=m.label;note.textContent=m.note;
 holder.hidden=!open;toggle.textContent=open?"إخفاء النص":"عرض نص الانطلاق";
}
toggle.onclick=()=>{open=!open;holder.hidden=!open;toggle.textContent=open?"إخفاء النص":"عرض نص الانطلاق"};
const ids=["exam-sel","question-sel"];
ids.forEach(id=>document.getElementById(id)?.addEventListener("change",()=>requestAnimationFrame(update)));
["q-prev","q-next","submit-answer"].forEach(id=>document.getElementById(id)?.addEventListener("click",()=>requestAnimationFrame(update)));
document.querySelector('nav button[data-tab="exams"]')?.addEventListener("click",()=>requestAnimationFrame(update));
update();
})();