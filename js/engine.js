/* Deterministic game rules are separate from rendering and UI. */
'use strict';
(function(root){
 const STOPS=[520,1040,1560,2080,2600], FINISH=3020;
 const levels=['Beginner','Intermediate','Advanced'];
 class Adventure {
  constructor(bank,level='Beginner',random=Math.random){
   this.bank=bank;this.level=levels.includes(level)?level:'Beginner';
   const pool=bank.filter(q=>q.level===this.level).map(q=>q.id);
   for(let i=pool.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
   this.ids=pool.slice(0,5);this.x=90;this.lane=0;this.completed=0;this.score=0;this.firstTry=0;this.attempts=[0,0,0,0,0];this.earned=[0,0,0,0,0];this.phase='riding';this.resumePhase='riding';
  }
  get question(){return this.bank.find(q=>q.id===this.ids[this.completed]);}
  move(dx,dy){
   if(this.phase!=='riding')return;
   this.lane=Math.max(-32,Math.min(32,this.lane+dy));
   const barrier=this.completed<5?STOPS[this.completed]:FINISH;
   this.x=Math.max(65,Math.min(barrier,this.x+dx));
   if(this.x>=barrier){this.phase=this.completed<5?'question':'complete';}
  }
  answer(index){
   if(this.phase!=='question'||!Number.isInteger(index)||index<0||index>3)return null;
   const i=this.completed;this.attempts[i]++;
   if(index!==this.question.answer)return {correct:false,hint:this.question.hint};
   const points=this.attempts[i]===1?100:this.attempts[i]===2?60:40;
   this.score+=points;this.earned[i]=points;if(this.attempts[i]===1)this.firstTry++;
   this.phase='feedback';return {correct:true,points};
  }
  continue(){if(this.phase!=='feedback')return false;this.completed++;this.phase='riding';return true;}
  pause(){if(['riding','question','feedback'].includes(this.phase)){this.resumePhase=this.phase;this.phase='paused';}}
  resume(){if(this.phase==='paused')this.phase=this.resumePhase;}
  get stars(){return this.firstTry>=4?3:this.firstTry>=2?2:1;}
  snapshot(){const {level,ids,x,lane,completed,score,firstTry,attempts,earned,phase,resumePhase}=this;return {version:1,level,ids,x,lane,completed,score,firstTry,attempts,earned,phase,resumePhase};}
  static restore(bank,data){
   try{
    if(!data||data.version!==1||!levels.includes(data.level)||!Array.isArray(data.ids)||data.ids.length!==5||new Set(data.ids).size!==5||!data.ids.every(id=>bank.some(q=>q.id===id&&q.level===data.level)))return null;
    if(!Number.isInteger(data.completed)||data.completed<0||data.completed>5||!Number.isFinite(data.x)||!Number.isFinite(data.lane)||Math.abs(data.lane)>32)return null;
    if(!['riding','question','feedback','paused','complete'].includes(data.phase)||!['riding','question','feedback'].includes(data.resumePhase))return null;
    if(![data.attempts,data.earned].every(a=>Array.isArray(a)&&a.length===5&&a.every(n=>Number.isInteger(n)&&n>=0)))return null;
    const effective=data.phase==='paused'?data.resumePhase:data.phase;
    if(['question','feedback'].includes(effective)&&data.completed===5)return null;
    const paid=data.completed+(effective==='feedback'?1:0);
    for(let i=0;i<5;i++){const expected=i<paid?(data.attempts[i]===1?100:data.attempts[i]===2?60:40):0;if(data.earned[i]!==expected||(i<paid&&data.attempts[i]<1))return null;}
    if(data.score!==data.earned.reduce((a,b)=>a+b,0)||data.firstTry!==data.earned.filter(x=>x===100).length)return null;
    const limit=data.completed<5?STOPS[data.completed]:FINISH;
    if(data.x<65||data.x>limit||(['question','feedback'].includes(effective)&&data.x!==limit)||(effective==='complete'&&(data.completed!==5||data.x!==FINISH)))return null;
    const game=new Adventure(bank,data.level);Object.assign(game,data);return game;
   }catch{return null;}
  }
 }
 Adventure.STOPS=STOPS;Adventure.FINISH=FINISH;root.Adventure=Adventure;
})(typeof window==='undefined'?globalThis:window);
