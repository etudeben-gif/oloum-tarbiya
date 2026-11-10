/* الأسئلة المقالية المنقولة من ورقتي 2021، مع إظهار السند المصور قبل الأسئلة. */
(function(){
"use strict";
const root=document.getElementById("essay-exams");
if(!root)return;
const records=(window.MASAR_ISLAM_COURSES||[]).filter(c=>c.group==="المقالات الرسمية");
root.replaceChildren();
const h=document.createElement("h2");h.textContent="الأسئلة المقالية من امتحانات 2021";root.append(h);
for(const lesson of records){
 const article=document.createElement("article");article.className="exam-essay-series";
 const title=document.createElement("h3");title.textContent=lesson.title;article.append(title);
 const para=document.createElement("p");para.textContent="نص الوضعية والسند كما وردا في صفحة الورقة الأصلية، قبل عرض الأسئلة.";article.append(para);
 const page=document.createElement("img");
 page.src=lesson.id.includes("didactics")?"images/2021-didactics-02.webp":"images/2021-specialty-02.webp";
 page.alt="السند الأصلي لأسئلة 2021 المقالية؛ الصفحة 2 من ورقة الامتحان";
 page.loading="lazy";page.style.width="100%";page.style.maxWidth="850px";page.style.height="auto";page.style.display="block";page.style.margin="12px auto 24px";
 page.onerror=()=>{page.hidden=true;para.textContent="السند الأصلي توجد صورته في الصفحات الأولى من الورقة داخل عارض الامتحانات."};
 article.append(page);
 for(const part of lesson.parts||[]){
  const item=document.createElement("section");item.className="exam-essay-question";
  const question=document.createElement("h4");question.textContent=part[0];item.append(question);
  const details=document.createElement("details"),summary=document.createElement("summary");
  summary.textContent="عناصر الإجابة";details.append(summary);
  const answer=document.createElement("p");answer.textContent=part[1];details.append(answer);item.append(details);article.append(item);
 }
 root.append(article);
}
})();