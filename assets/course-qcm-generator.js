/* Question bank generator for course-targeted pedagogical training.
   Questions generated from reviewed concept/definition pairs; these are
   NOT ministry questions and always carry a distinct training label.
   Output: exactly 10 questions per course (4 direct, 4 reverse,
   1 exception question, 1 correct association or authored case study).
*/
(function(){
"use strict";
const rotate=(arr,n)=>arr.map((_,i)=>arr[(i+n)%arr.length]);
function make(rows,caseQ){
 const four=(rows||[]).filter(r=>Array.isArray(r)&&r.length>=2&&String(r[0]).trim()&&String(r.slice(1).join(" — ")).trim()).slice(0,4);
 if(four.length!==4)throw Error("QCM requires four clear concepts");
 const labels=four.map(r=>String(r[0]).trim()),defs=four.map(r=>r.slice(1).join(" — ").trim());
 const questions=[];
 const stems=[
  "أي مفهوم يوافق التعريف أو الخاصية التالية؟",
  "بماذا نسمي المفهوم الموصوف أدناه؟",
  "حدّد المفهوم الدقيق الذي تشير إليه العبارة:",
  "أي اختيار يُعرّف الفكرة الآتية دون خلط بينها وبين مفاهيم أخرى؟"
 ];
 for(let i=0;i<4;i++){
  const shift=(i+1)%4,opts=rotate(labels,shift);
  questions.push({prompt:stems[i]+"\n"+defs[i],options:opts,correct:(i-shift+4)%4,reason:"«"+labels[i]+"» يعني: "+defs[i]+". البدائل الأخرى تخص مفاهيم مختلفة في نفس الدرس.",kind:"مفهوم",authored:true});
 }
 const reverseStems=["ما الشرح الصحيح للمفهوم: ","أي عبارة تشرح بدقة: ","عند تحليل هذا المصطلح، ما الدلالة الأصح: ","أي تعريف ينبغي ربطه بالمفهوم: "];
 for(let i=0;i<4;i++){
  const shift=(i+2)%4,opts=rotate(defs,shift);
  questions.push({prompt:reverseStems[i]+"«"+labels[i]+"»؟",options:opts,correct:(i-shift+4)%4,reason:"التعريف المناسب لـ«"+labels[i]+"» هو: "+defs[i]+". افصل بين المصطلح ومفاهيم الدرس المجاورة.",kind:"تمييز",authored:true});
 }
 const wrongIndex=2,wrongPairs=four.map((r,i)=>labels[i]+" ← "+defs[i===wrongIndex?(i+1)%4:i]);
 questions.push({prompt:"اختر العبارة غير الصحيحة من العلاقات الآتية:",options:rotate(wrongPairs,1),correct:(wrongIndex-1+4)%4,reason:"الخلط وقع عند «"+labels[wrongIndex]+"»؛ تعريفه الدقيق: "+defs[wrongIndex]+"، وليس "+defs[(wrongIndex+1)%4]+".",kind:"استثناء",authored:true});
 if(caseQ&&Array.isArray(caseQ.options)&&caseQ.options.length===4){
  questions.push({prompt:caseQ.prompt,options:caseQ.options,correct:caseQ.correct,reason:caseQ.reason,kind:"وضعية تطبيقية",authored:true});
 }else{
  const correctAt=3;
  const opts=four.map((r,i)=>{
   if(i===correctAt)return labels[i]+" ← "+defs[i];
   return labels[i]+" ← "+defs[(i+1)%4];
  });
  const shift=2;
  questions.push({prompt:"من خلال المعاني الواردة في الدرس، أي ارتباط بين المفهوم وشرحه صحيح؟",options:rotate(opts,shift),correct:(correctAt-shift+4)%4,reason:"الارتباط الصحيح: «"+labels[correctAt]+"» ← "+defs[correctAt]+". أما بقية الاختيارات فتخلط بين المصطلح وشرح مصطلح آخر.",kind:"تطبيق المفاهيم",authored:true});
 }
 if(questions.length!==10||questions.some(x=>x.options.length!==4||x.correct<0||x.correct>3))throw Error("Invalid ten-question set");
 return questions;
}
window.MASAR_GENERATE_TEN_QCM=make;
})();