/* Interactive lesson library: all content stays within Masar. */
(function(){
"use strict";
const data=window.MASAR_ISLAM_COURSES||[];
const section=document.getElementById("courses");
const originalGrid=document.getElementById("course-items");
if(!section||!originalGrid||!data.length)return;
originalGrid.hidden=true;
const description=section.querySelector(".notice");if(description)description.hidden=true;
const app=document.createElement("div");app.id="masar-course-app";section.insertBefore(app,section.firstChild);
let done={};try{done=JSON.parse(localStorage.getItem("masar-islam-lessons-v2")||"{}")||{}}catch(e){}
let current=data[0].id;
function node(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n}
const header=node("div","course-hero");
header.append(node("div","section-eyebrow","افهم الدرس ثم طبق في الامتحان"),node("h2",null,"دروس التربية الإسلامية كاملة داخل الموقع"),node("p",null,"دروس منظمة مع الأمثلة والمفاهيم الأساسية، ثم QCM من أوراق المباريات الأصلية. ما تحتاجش تخرج من الموقع باش تقرا."));
const filters=node("div","course-filters");
const search=node("input");search.type="search";search.placeholder="قلب على درس أو مفهوم...";search.setAttribute("aria-label","البحث في الدروس");
const select=node("select");select.setAttribute("aria-label","اختيار مجال الدروس");
for(const opt of [["all","جميع الدروس"],["التخصص","مادة التخصص"],["الديداكتيك","ديداكتيك المادة"],["منهجية","منهجية QCM"]]){const o=node("option",null,opt[1]);o.value=opt[0];select.append(o)}
const progress=node("p","mini");
filters.append(search,select);header.append(filters,progress);
const details=node("article","card course-detail");details.id="masar-current-course";
const grid=node("div","course-library-grid");
app.append(header,details,grid);
function count(){const n=data.filter(c=>done[c.id]).length;progress.textContent="تمت مراجعة "+n+" من "+data.length+" دروس";const top=document.getElementById("progress");if(top)top.textContent="دروسك "+n+" / "+data.length}
function openCourse(id,scroll){
 const c=data.find(x=>x.id===id);if(!c)return;current=id;
 details.replaceChildren();
 const head=node("div","course-detail-head");
 head.append(node("span","pill-choice",c.group),node("h2",null,c.title),node("p","mini","مدة تقريبية: "+c.time));
 details.append(head,node("p","course-lead",c.summary));
 for(const [j,p] of c.parts.entries()){const sec=node("section","course-chapter");sec.append(node("h3",null,(j+1)+". "+p[0]),node("p",null,p[1]));details.append(sec)}
 const memory=node("div","course-memory");memory.append(node("strong",null,"الخلاصة للحفظ"),node("p",null,c.memorize));details.append(memory);
 const cite=node("details","course-source");const summary=node("summary",null,"مصدر الدرس (اختياري)");const a=node("a",null,"مراجعة المصدر");a.href=c.url;a.target="_blank";a.rel="noopener noreferrer";cite.append(summary,node("p",null,c.source),a);details.append(cite);
 const actions=node("div","course-actions");
 const mark=node("button","primary",done[id]?"✓ تمت مراجعة الدرس":"✓ أنهيت الدرس");
 mark.type="button";mark.onclick=()=>{done[id]=!done[id];try{localStorage.setItem("masar-islam-lessons-v2",JSON.stringify(done))}catch(e){}openCourse(id,false);showList();};
 const practice=node("button","secondary","تدرب فـQCM ديال المباراة");practice.type="button";
 practice.onclick=()=>{
  const exSelect=document.getElementById("exam-sel");
  if(exSelect){exSelect.value=c.exam;exSelect.dispatchEvent(new Event("change",{bubbles:true}))}
  const tab=document.querySelector('nav button[data-tab="exams"]');if(tab)tab.click();
  document.getElementById("exams")?.scrollIntoView({behavior:"smooth",block:"start"});
 };
 const next=node("button","secondary","الدرس الموالي ←");next.type="button";next.onclick=()=>{const idx=data.findIndex(c=>c.id===id);openCourse(data[(idx+1)%data.length].id,true)};
 actions.append(mark,practice,next);details.append(actions);
 for(const t of grid.querySelectorAll(".course-library-tile"))t.classList.toggle("selected",t.dataset.id===id);
 if(scroll)details.scrollIntoView({behavior:"smooth",block:"start"});
}
function showList(){
 grid.replaceChildren();
 const needle=search.value.trim().toLocaleLowerCase("ar"),cat=select.value;
 const subset=data.filter(c=>(cat==="all"||c.group===cat)&&(!needle||(c.title+" "+c.summary+" "+c.parts.map(p=>p[0]).join(" ")).toLocaleLowerCase("ar").includes(needle)));
 if(!subset.length)grid.append(node("p","notice","ما لقيناش درس مطابق، جرّب كلمة أخرى."));
 for(const c of subset){
  const tile=node("button","card course-library-tile"+(current===c.id?" selected":""));tile.type="button";tile.dataset.id=c.id;
  tile.append(node("span","pill-choice",c.group),node("h3",null,c.title),node("p",null,c.summary),node("span","mini",(done[c.id]?"✓ تمت المراجعة · ":"")+c.parts.length+" أجزاء · اقرأ الدرس"));
  tile.onclick=()=>openCourse(c.id,true);grid.append(tile);
 }
 count();
}
search.addEventListener("input",showList);select.addEventListener("change",showList);
showList();openCourse(current,false);
// Keep exam tab active on entry so the authentic pre-question text is visible immediately.
const quickStart=node("button","primary","افتح امتحان QCM ونص الانطلاق");
quickStart.type="button";
quickStart.onclick=()=>{
 const tab=document.querySelector('nav button[data-tab="exams"]');
 if(tab)tab.click();
 document.getElementById("intro-live")?.scrollIntoView({behavior:"smooth",block:"start"});
};
header.append(quickStart);
})();