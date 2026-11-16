/* Ask Mo sits where it does on Home: lifts so it just overlaps the footer banner's top line */
(()=>{const OVER=14;let btn,rib,orig=null;
function reset(){if(orig)btn.style.setProperty('bottom',orig.v,orig.p);else btn.style.removeProperty('bottom');}
function upd(){btn=btn||document.querySelector('.ask,.askbtn');rib=rib||document.querySelector('.siteribbon');if(!btn||!rib)return;
if(orig===null)orig=btn.style.getPropertyValue('bottom')?{v:btn.style.getPropertyValue('bottom'),p:btn.style.getPropertyPriority('bottom')}:false;
reset();if(innerWidth<=640)return;
const need=innerHeight-rib.getBoundingClientRect().top-OVER,base=parseFloat(getComputedStyle(btn).bottom)||32;
if(need>base)btn.style.setProperty('bottom',need+'px','important');}
addEventListener('scroll',upd,{passive:true});addEventListener('resize',upd);
const go=()=>{upd();setTimeout(upd,300);setTimeout(upd,1200)};document.readyState=='loading'?addEventListener('DOMContentLoaded',go):go();})();
