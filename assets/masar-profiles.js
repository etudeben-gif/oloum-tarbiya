/* Masar: named local learning profiles shared by Sciences and Islamic Education.
   GitHub Pages is static: this is PER BROWSER storage, NOT a remote login or
   cross-device identity system. Anyone using the browser can select any name.
   Export/import enables deliberate transfer and backups.
*/
(function(){
"use strict";
const INDEX="masar-learner-profiles-v1",ACTIVE="masar-learner-active-v1";
const DATA_KEYS=["masar-original-exams-v1","masar-islam-qcm-v2","masar-islam-lessons-v2","masar-islam-lessons-v1","masar-science-practice-2026","masar-islam-practice-2026"];
const PREFIX="masar-learner-data-v1:";
function read(k){try{return localStorage.getItem(k)}catch(_){return null}}
function write(k,v){try{localStorage.setItem(k,v);return true}catch(_){return false}}
function parse(v,fallback){try{return JSON.parse(v)||fallback}catch(_){return fallback}}
function list(){const a=parse(read(INDEX),[]);return Array.isArray(a)?a.filter(x=>x&&typeof x.id==="string"&&typeof x.name==="string"):[]}
function cleanName(s){return String(s||"").normalize("NFKC").replace(/\s+/g," ").trim().slice(0,45)}
function sameName(a,b){return cleanName(a).toLocaleLowerCase("ar")===cleanName(b).toLocaleLowerCase("ar")}
function current(){const id=read(ACTIVE);return list().find(p=>p.id===id)||null}
function key(base){const p=current();return PREFIX+(p?p.id:"unselected")+":"+base}
function statsFor(p){const obj=base=>parse(read(PREFIX+p.id+":"+base),{});
 const science=obj(DATA_KEYS[0]),isl=obj(DATA_KEYS[1]),lessons=obj(DATA_KEYS[2]);
 return {science:Object.keys(science).length,islam:Object.keys(isl).length,lessons:Object.values(lessons).filter(Boolean).length};
}
function createOrFind(name,{migrate=false}={}){
 name=cleanName(name);
 if(name.length<2)throw Error("دخل اسم فيه جوج حروف على الأقل.");
 if(name.length>45)throw Error("الاسم طويل بزاف.");
 const profiles=list(),found=profiles.find(p=>sameName(p.name,name));
 if(found)return found;
 const id="u"+Date.now().toString(36)+Math.random().toString(36).slice(2,10);
 const p={id,name,createdAt:new Date().toISOString()};
 profiles.push(p);
 if(!write(INDEX,JSON.stringify(profiles)))throw Error("المتصفح منع حفظ البيانات. راجع إعدادات التخزين.");
 if(migrate&&profiles.length===1){
  for(const base of DATA_KEYS){const legacy=read(base);if(legacy!==null)write(PREFIX+p.id+":"+base,legacy)}
 }
 return p;
}
function activate(id,{reload=true}={}){
 const p=list().find(x=>x.id===id);
 if(!p)throw Error("هاد الملف ما بقاش موجود.");
 if(!write(ACTIVE,p.id))throw Error("تعذر حفظ اسم المتعلم فالمتصفح.");
 if(reload)window.location.reload();
 return p;
}
function download(p){
 const data={format:"masar-study-profile",version:1,learnerName:p.name,exportedAt:new Date().toISOString(),progress:{}};
 for(const base of DATA_KEYS)data.progress[base]=parse(read(PREFIX+p.id+":"+base),{});
 const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json;charset=utf-8"});
 const url=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=url;a.download="masar-progress-"+new Date().toISOString().slice(0,10)+".json";
 document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
}
async function restore(file){
 if(!file||file.size>3*1024*1024)throw Error("اختار ملفاً صحيحاً أقل من 3MB.");
 const data=JSON.parse(await file.text());
 if(data?.format!=="masar-study-profile"||data?.version!==1||!data.progress||typeof data.progress!=="object")throw Error("الملف ماشي نسخة احتياطية صالحة لمسار.");
 const p=createOrFind(data.learnerName);
 const stat=statsFor(p);
 if((stat.science||stat.islam||stat.lessons)&&!window.confirm("سبق تسجل تقدم بهاد الاسم فهاد المتصفح. الاسترجاع غادي يعوض البيانات الحالية، واش متأكد؟"))return null;
 for(const base of DATA_KEYS){
  const value=data.progress[base]||{};
  if(!value||typeof value!=="object"||Array.isArray(value))throw Error("بيانات الملف غير صالحة.");
  if(!write(PREFIX+p.id+":"+base,JSON.stringify(value)))throw Error("تعذر استرجاع بعض البيانات.");
 }
 return p;
}
const api={key,list,current,statsFor,createOrFind,activate,DATA_KEYS};
window.MASAR_PROFILES=api;

function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n}
function btn(text,onClick,cls){const b=el("button",cls||"",text);b.type="button";b.addEventListener("click",onClick);return b}
function mount(){
 if(!document.body||document.getElementById("masar-profile-root"))return;
 const root=el("div","masar-profile-shell");root.id="masar-profile-root";
 document.body.prepend(root);
 const chip=btn("",()=>open(true),"masar-profile-chip");chip.id="masar-profile-chip";document.body.append(chip);
 const cover=el("div","masar-profile-cover");cover.id="masar-profile-cover";cover.hidden=true;
 cover.setAttribute("role","dialog");cover.setAttribute("aria-modal","true");cover.setAttribute("aria-labelledby","masar-profile-title");
 const panel=el("div","masar-profile-modal"),badge=el("div","masar-profile-brand","مِسار • مساحة المتعلم");
 const heading=el("h2","", "دخل باسمك");heading.id="masar-profile-title";
 const nameBox=el("form","masar-profile-form"),label=el("label","", "الاسم ديالك");
 label.setAttribute("for","masar-name-input");
 const input=el("input");input.id="masar-name-input";input.type="text";input.autocomplete="nickname";input.maxLength=45;input.required=true;input.minLength=2;input.placeholder="مثلاً: محمد أمين";
 const go=el("button","masar-profile-main","دخول ومتابعة المراجعة");go.type="submit";
 const message=el("p","masar-profile-message");message.setAttribute("aria-live","polite");
 nameBox.append(label,input,go,message);
 const roster=el("section","masar-profile-roster"),rosterTitle=el("h3","", "اختار المتعلم");
 const rosterList=el("div","masar-profile-roster-list");
 roster.append(rosterTitle,rosterList);
 const migrateWrap=el("label","masar-profile-migrate");
 const migrate=el("input");migrate.type="checkbox";migrate.checked=true;
 migrateWrap.append(migrate,document.createTextNode(" استرجاع النقط القديمة"));
 const backup=el("div","masar-profile-backup"),backupTitle=el("h3","", "حفظ ونقل التقدم");
 const exportBtn=btn("تنزيل نسخة من نقطي",()=>{const p=current();if(p)download(p)},"masar-profile-export");
 const uploadBtn=btn("استرجاع نسخة",()=>fileInput.click(),"masar-profile-import");
 const fileInput=el("input");fileInput.type="file";fileInput.accept=".json,application/json";fileInput.hidden=true;
 fileInput.addEventListener("change",async()=>{
   try{const p=await restore(fileInput.files?.[0]);if(p)activate(p.id)}
   catch(e){message.textContent=e.message||"تعذر استرجاع الملف."}
   fileInput.value="";
 });
 backup.append(backupTitle,exportBtn,uploadBtn,fileInput);
 const exit=btn("إغلاق",()=>close(),"masar-profile-close");
 panel.append(badge,heading,nameBox,migrateWrap,roster,backup,exit);
 cover.append(panel);document.body.append(cover);
 let forceLogin=false;
 function close(){if(forceLogin)return;cover.hidden=true;document.body.classList.remove("masar-profile-locked")}
 function showUsers(){
  const profiles=list();rosterList.replaceChildren();
  roster.hidden=!profiles.length;
  migrateWrap.hidden=profiles.length>0||!DATA_KEYS.some(k=>read(k)!==null);
  const active=current();chip.textContent=active?"👤 "+active.name+" · ملفي":"👤 دخول المتعلم";
  for(const p of profiles){
   const st=statsFor(p),row=el("div","masar-profile-person");
   const details=el("div","masar-profile-person-name");
   details.append(el("strong","",p.name),el("small","",st.science+" سؤال علوم التربية · "+st.islam+" سؤال تربية إسلامية · "+st.lessons+" درس مكتمل"));
   const action=btn(active?.id===p.id?"ملفي الحالي":"دخول",()=>activate(p.id),"masar-profile-select");
   if(active?.id===p.id)action.disabled=true;
   row.append(details,action);rosterList.append(row);
  }
  backup.hidden=!active;exit.hidden=forceLogin;
 }
 function open(manual=false){
  forceLogin=!manual&&!current();
  showUsers();cover.hidden=false;document.body.classList.add("masar-profile-locked");
  setTimeout(()=>input.focus(),0);
 }
 nameBox.addEventListener("submit",e=>{
  e.preventDefault();
  try{const p=createOrFind(input.value,{migrate:migrate.checked});message.textContent="";activate(p.id)}
  catch(err){message.textContent=err.message}
 });
 if(!current())open(false);else showUsers();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});else mount();
})();