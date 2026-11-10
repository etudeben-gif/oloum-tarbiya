/* تحرير مقرر التربية الإسلامية للثانوي الإعدادي:
 * البرنامج حسب منهاج الوزارة 2016، والديداكتيك حسب بطاقات CRMEF،
 * والتدريب QCM مطابق لنص 2021 المنقول من ورقتيه مع شبكتي التصحيح المرفقتين.
 * الشرح تحرير تعليمي وليس نقلا حرفيا من مصدر وزاري. */
(function(){
"use strict";
const courses=window.MASAR_ISLAM_COURSES||[];
const curriculum=courses.find(x=>x.id==="grade1")?.url||"https://ampei.ma/?page_id=18221";
const crmef="https://crmefcasablancasettat.ma/%D8%A8%D8%B7%D8%A7%D9%82%D8%A7%D8%AA-%D8%AA%D9%88%D8%B5%D9%8A%D9%81-%D8%A7%D9%84%D8%AB%D8%A7%D9%86%D9%88%D9%8A-2/";
const examSpec="https://drive.google.com/file/d/1TOgJD3LlkogCecwnDmZv-kYPdSSfZaxm/view";
const examDid="https://drive.google.com/file/d/1TOUSy2tf8Sg5TE5h9qVph3Yq7Krf-QFk/view";
const training={
"التخصص":"مرجع المجالات الشرعية: القرآن والسنة وعلومهما، العقيدة الأشعرية، المذهب المالكي، أصول الفقه ومقاصد الشريعة والسيرة؛ العناوين والنصوص مرتبطة بمتطلبات الاختبار ومضامين منهاج 2016.",
"الديداكتيك":"بطاقات المركز الجهوي لمهن التربية والتكوين: مجزوءة ديداكتيك التربية الإسلامية، وتخطيط التعلمات، وتقويمها وتدبيرها، مع وثيقة منهاج يونيو 2016.",
"الأولى إعدادي":"منهاج التربية الإسلامية 2016، برنامج الأولى إعدادي (ص 13–14): التزكية والاقتداء والاستجابة والقسط والحكمة.",
"الثانية إعدادي":"منهاج التربية الإسلامية 2016، برنامج الثانية إعدادي (ص 15–16) وكفايات هذا المستوى.",
"الثالثة إعدادي":"منهاج التربية الإسلامية 2016، برنامج الثالثة إعدادي (ص 17–18) وكفايات هذا المستوى."
};
if(courses.length!==58)throw Error("Unexpected course count "+courses.length);
for(const c of courses){
 const deep=c.deepChapters||[];
 const original=c.parts||[];
 const essay=c.group==="المقالات الرسمية";
 const map=c.group==="المنهاج الرسمي";
 const methodology=c.group==="منهجية";
 if((c.group==="التخصص"||c.group==="الديداكتيك"||["الأولى إعدادي","الثانية إعدادي","الثالثة إعدادي"].includes(c.group))&&deep.length<3)throw Error("Incomplete course: "+c.id);
 c.readerChapters=(essay||map||methodology?original:deep).map(([title,text])=>({title,text:String(text||"").trim()}));
 const selected=new Set(c.readerChapters.map(x=>x.title.replace(/[\s\u064b-\u065f:–-]/g,"")));
 const useful=essay||map||methodology?[]:original
 .filter(([head,text])=>text?.length>=85 && !/^(في الامتحان|الخلاصة|قاعدة للحفظ|خلاصة للحفظ)$/.test(head))
 .filter(([head])=>!selected.has(head.replace(/[\s\u064b-\u065f:–-]/g,"")))
 .map(([title,text])=>({title,text:text.trim()}));
 c.readerGlossary=useful.slice(0,c.group==="التخصص"?7:c.group==="الديداكتيك"?6:4);
 c.officialSources=[
 {title:"وزارة التربية الوطنية — منهاج التربية الإسلامية للثانوي، يونيو 2016",url:curriculum,type:"منهاج رسمي"},
 {title:"CRMEF الدار البيضاء سطات — بطاقات مجزوءات التربية الإسلامية للتخطيط والتقويم والديداكتيك",url:crmef,type:"تكوين رسمي"}
 ];
 if(c.group==="الديداكتيك"){
   const base="https://crmefcasablancasettat.ma/wp-content/uploads/2022/06/";
   const names=[
     ["بطاقة مجزوءة الديداكتيك – ثانوي تربية إسلامية","بطاقة توصيف مجزوءة الديداكتيك – ثانوي تربية إسلامية.pdf"],
     ["بطاقة مجزوءة التخطيط – ثانوي تربية إسلامية","بطاقة توصيف مجزوءة التخطيط – ثانوي تربية إسلامية.pdf"],
     ["بطاقة مجزوءة التقويم – ثانوي تربية إسلامية","بطاقة توصيف مجزوءة التقويم – ثانوي تربية إسلامية.pdf"],
     ["بطاقة مجزوءة تدبير التعلمات 1 – ثانوي تربية إسلامية","بطاقة توصيف مجزوءة تدبير التعلمات 1 – ثانوي تربية إسلامية.pdf"]
   ];
   let selected=names[0];
   if(c.id==="planning")selected=names[1];
   if(c.id==="assessment")selected=names[2];
   if(c.id==="methods"||c.id==="inclusion")selected=names[3];
   c.officialSources.push({title:selected[0],url:base+encodeURIComponent(selected[1]),type:"بطاقة مجزوءة رسمية PDF"});
 }
  const e=c.group==="الديداكتيك"?"2021-didactics":"2021-specialty";
 if(c.group!=="المنهاج الرسمي"){
 c.officialSources.push({title:"الامتحان الأصلي لدجنبر 2021 ودليل عناصر الإجابة — "+(e==="2021-didactics"?"الديداكتيك":"التخصص"),url:e==="2021-didactics"?examDid:examSpec,type:"أسئلة أصلية وتصحيح مرفق"});
 }
 if(c.url&&c.url!==curriculum)c.officialSources.push({title:"مرجع الموضوع المدون في أرشيف الدرس",url:c.url,type:"مرجع إضافي"});
 c.sourceNote=training[c.group]||"عناصر الدرس مرجعية أو أسئلة مقالية من الوثائق المعروضة، والتفسير التعليمي محرر للمراجعة.";
 if(c.readerChapters.length<3)throw Error("Too few chapters "+c.id);
 c.readerVersion="20261110-islam-master";
}
})();