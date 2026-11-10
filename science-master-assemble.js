/* طبعة المراجعة النهائية: 35 محورا أساسيا + 9 دروس مرتبطة بالامتحانات الأصلية.
   التوصيف الرسمي لمباراة التعليم يحدد المطلوب، وبطاقة مجزوءة CRMEF تؤطر المحتوى وتورد مراجع التكوين.
   جميع الفقرات كتابة تعليمية أصلية وليست نسخاً حرفياً من كتاب أو منشور وزاري. */
(function(){
"use strict";
const lessons=window.MASAR_SECONDARY_LESSONS||[];
const crmefPdf="https://crmefcasablancasettat.ma/wp-content/uploads/2022/06/%D8%A8%D8%B7%D8%A7%D9%82%D8%A9-%D8%AA%D9%88%D8%B5%D9%8A%D9%81-%D9%85%D8%AC%D8%B2%D9%88%D8%A1%D8%A9-%D8%B9%D9%84%D9%88%D9%85-%D8%A7%D9%84%D8%AA%D8%B1%D8%A8%D9%8A%D8%A9.pdf";
const examPdf="https://drive.google.com/file/d/1H8Ql6B3s3rWep-O51YJJ0MOnF2j7V0WA/view";
const govPage="https://www.men.gov.ma/وثائق-رسمية";
const trainingRef={
"النمو":"أحمد أوزي، «المراهق والعلاقات المدرسية» (2000)؛ Christine Cannard, Le développement de l’adolescent (2019) — ضمن قائمة المراجع في بطاقة CRMEF.",
"التعلم":"Gaston Mialaret, Les sciences de l’éducation (2017)؛ Jean-Pierre Astolfi وآخرون، Mots-clés de didactique des sciences (2008) — ضمن المراجع المقترحة في بطاقة CRMEF.",
"الكفايات":"Philippe Meirieu, Dictionnaire inattendu de pédagogie (2021)؛ Yves Reuter وآخرون، Dictionnaire des concepts fondamentaux des didactiques (2007) — ضمن قائمة CRMEF.",
"الطرائق":"Marguerite Altet, Les pédagogies de l’apprentissage (2018)؛ Philippe Meirieu (2021) — ضمن قائمة المراجع CRMEF.",
"السوسيولوجيا":"Nicole Lautier, Psychosociologie de l’éducation (2011)؛ Gaston Mialaret (2017) — ضمن قائمة CRMEF.",
"الجماعات":"Nicole Lautier, Psychosociologie de l’éducation (2011)؛ George Lapassade, Psychologie de l’éducation — ضمن قائمة CRMEF."
};
function reduceDup(chapters,optional){
  const titles=new Set(chapters.map(x=>x[0].replace(/[\s:–-]+/g,"").trim()));
  const candidates=(optional||[]).filter(([h,body])=>{
    if(!h||!body||body.length<90)return false;
    if(/^(ما النمو\؟|الفكرة|المبدأ|المفهوم|الإطار النظري|في الامتحان|في الثانوي|قاعدة للحفظ|قاعدة امتحانية|خلاصة|مبدأ النظرية)$/.test(h))return false;
    if(/^(ماذا يقول|ما الذي قاله|ما الذي يميز)/.test(h))return false;
    if(titles.has(h.replace(/[\s:–-]+/g,"").trim()))return false;
    return true;
  });
  const favored=/مرحلة|المراحل|النضج|إشراط|تعزيز|التثبيت|الكمون|الصراع|عائق|التجربة|الاستبصار|قوانين|استراتيجية|التقويم|الإدماج|الوساطة|الهابيتوس|العنف|المعايير|الهدف|العمليات|أنواع|نقد|أهمية/;
  const scored=candidates.map((p,index)=>({p,index,score:Math.min(5,p[1].length/90)+(favored.test(p[0])?3:0)}))
    .sort((a,b)=>b.score-a.score).slice(0,3).sort((a,b)=>a.index-b.index);
  return scored.map(x=>x.p);
}
if(lessons.length!==44)throw Error('Expected 44 lessons: found '+lessons.length);
for(let i=0;i<lessons.length;i++){
 const c=lessons[i];
 const deep=Array.isArray(c.deepChapters)?c.deepChapters:[];
 if(i<35&&deep.length<5)throw Error('Not detailed enough: '+i);
 const extras=i<35?reduceDup(deep,c.parts):[];
 c.displayParts=[...deep,...extras].map(([heading,text])=>({heading,text:text.trim()}));
 if(c.displayParts.length<5)throw Error('Too few sections: '+i);
 c.sourceLinks=[
 {label:"توصيف اختبار علوم التربية للثانوي — وزارة التربية الوطنية، نونبر 2025",url:examPdf,kind:"إطار المباراة"},
 {label:"بطاقة مجزوءة علوم التربية للثانوي — المركز الجهوي الدار البيضاء سطات (صفحتا 2 و4)",url:crmefPdf,kind:"برنامج التكوين والمراجع"},
 {label:"بوابة الوثائق الرسمية لوزارة التربية الوطنية",url:govPage,kind:"النصوص المرجعية"}
 ];
 if(c.group==="الجماعات"||c.title.includes("الإنصاف")||c.title.includes("المؤسسة")){
 c.sourceLinks.push({label:"المنظومة التربوية — وزارة التربية الوطنية",url:"https://www.men.gov.ma/التربية-الوطنية",kind:"المرجع الوطني"});
 }
 if(c.title.includes("الحياة المدرسية")||c.title.includes("المؤسسة")){
 c.sourceLinks.push({label:"الحياة المدرسية — وزارة التربية الوطنية",url:"https://pw.men.gov.ma/الحياة-المدرسية",kind:"المرجع التطبيقي"});
 }
 c.bibliography=trainingRef[c.group]||"راجع قائمة مراجع مجزوءة علوم التربية في بطاقة CRMEF.";
 c.coreExamQuestions=c.examLinks?.filter(x=>x.relation==="مباشر").length||0;
}
window.MASAR_SECONDARY_EDITORIAL_VERSION="2026-11-10-course-44";
})();