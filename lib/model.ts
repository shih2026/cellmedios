import type {Row} from './questions';
export type AnswerRecord={draft:number[][];first?:number[][];firstCorrect?:boolean[];hint?:boolean;firstHint?:boolean;demonstrated?:boolean;attempts:number;submitted?:boolean;feedback?:boolean;score?:number;rescueDraft?:number[][];rescueSubmitted?:boolean;correctionCorrect?:boolean};
export type Observation={condition:string;prediction:string;result:string;reading?:string;appearance?:string};
export type SimState={condition:number;prediction:string;shown:boolean;step:number;reading:number;readings:number[];observations:Record<string,Observation>;cell?:number;appearance?:string;selected?:number;seen?:string[];paused?:boolean};
export type ExamRound={answers:Record<string,AnswerRecord>;reviewed:boolean;score?:number};
export type AppState={version:1;manualUnlocked?:boolean;student?:{className:string;seat:string;name:string};scoreVersion?:2;legacy?:unknown;page:number;tab:string;answers:Record<string,AnswerRecord>;sims:Record<string,SimState>;completed:number[];exam:ExamRound;rounds:ExamRound[];firstExam?:number;bestExam?:number;game:Record<string,AnswerRecord>;gameRounds:number[];bestGame?:number;gameOpen:boolean;scroll:Record<string,number>};
export const freshSim=():SimState=>({condition:0,prediction:'',shown:false,step:0,reading:0,readings:[],observations:{},cell:0,appearance:'',selected:0,seen:[],paused:true});
export const freshRecord=():AnswerRecord=>({draft:[],attempts:0});
export const freshState=():AppState=>({version:1,scoreVersion:2,page:0,tab:'read',answers:{},sims:{},completed:[],exam:{answers:{},reviewed:false},rounds:[],game:{},gameRounds:[],gameOpen:false,scroll:{}});
export function correctRows(rows:Row[],draft:number[][]){return rows.map((row,i)=>{const a=[...(draft[i]||[])].sort();return a.length===row.answer.length&&a.every((x,j)=>x===[...row.answer].sort()[j]);});}
export function allAnswered(rows:Row[],draft:number[][]){return rows.every((_,i)=>(draft[i]?.length||0)>0);}
export function submitRecord(rows:Row[],record:AnswerRecord,exam=false):AnswerRecord{if(!allAnswered(rows,record.draft))return record;if(exam&&record.submitted)return record;const c=correctRows(rows,record.draft);return {...record,first:record.first||record.draft.map(a=>[...a]),firstCorrect:record.firstCorrect||c,firstHint:record.first===undefined?!!record.hint:record.firstHint,attempts:record.attempts+1,submitted:true,feedback:!exam,score:exam?undefined:record.score??(c.every(Boolean)?record.demonstrated?0:record.attempts>0?1:2:undefined)};}
export function progressPoints(s:AppState){return Object.values(s.answers).reduce((v,a)=>v+(a.score||0),0);}
export function missingTasks(s:AppState,p:number):string[]{const sim=s.sims[p]||freshSim();const obs=Object.keys(sim.observations);const missing:string[]=[];
if(p===0)for(const [id,name] of [['STATE-solid','固態'],['STATE-liquid','液態'],['STATE-gas','氣態']])if(!s.answers[id]?.first)missing.push(name+'觀察題');
if(p===1)for(let i=0;i<3;i++)if(!obs.includes(String(i)))missing.push(['只加水','只加色素','只減水'][i]+'的預測與觀察');
if(p===2)for(let i=0;i<3;i++)if(!s.answers['DIFF-'+i]?.first)missing.push(['藍色 60、紅色 20','藍色 20、紅色 60','藍色 40、紅色 40'][i]+'的預測與觀察題');
if(p===4){for(let i=0;i<3;i++)if(!obs.includes(String(i)))missing.push(['左低右高','左高右低','兩側相同'][i]+'的水移動觀察');if(sim.readings.length<2)missing.push('比較水與溶質兩種讀法');}
if(p===5)for(let c=0;c<2;c++)for(let i=0;i<2;i++)if(!obs.includes(c+'-'+i))missing.push(['紅血球','植物細胞'][c]+' × '+['生理食鹽水','純水'][i]+'的觀察');
if(p<6&&!s.answers['Q0'+(p+1)]?.first)missing.push('Q0'+(p+1)+' 作答與回饋');
if(p===6&&!s.rounds.length)for(let i=8;i<=13;i++)if(!s.exam.answers['Q'+String(i).padStart(2,'0')]?.submitted)missing.push('Q'+String(i).padStart(2,'0')+' 尚未作答');return missing;}
export const concentration=(i:number)=>['較淡','較濃','較濃'][i];
export const diffusion=(i:number)=>['整體較多往右','整體較多往左','無偏向'][i];
export const osmosis=(i:number)=>['左往右較多','右往左較多','兩向大致相同'][i];
export function cellResult(cell:number,solution:number){return {water:solution===0?'大致相同':'進水較多',shape:solution===0?'形狀維持':cell===0?'膨脹，最後可能破裂':'略膨脹，細胞壁保護而不至破裂'};}

export function firstQuestionPoints(a?:AnswerRecord){return a?.firstCorrect?.length&&a.firstCorrect.every(Boolean)?2:0;}
export function correctedQuestionPoints(a?:AnswerRecord){return firstQuestionPoints(a)||(a?.correctionCorrect?1:0);}
export function migrateState(input:AppState):AppState{
 if(input.scoreVersion===2)return input;
 const normalize=(a:AnswerRecord):AnswerRecord=>({...a,score:a.score===undefined?undefined:a.demonstrated?0:firstQuestionPoints(a)?2:1});
 const examPoints=(round:ExamRound)=>Object.values(round.answers).reduce((t,a)=>t+firstQuestionPoints(a),0);
 const rounds=input.rounds.map(round=>({...round,score:examPoints(round)}));
 const exam={...input.exam,score:input.exam.score===undefined?undefined:examPoints(input.exam)};
 const game=Object.fromEntries(Object.entries(input.game).map(([id,a])=>[id,normalize(a)]));
 const currentGame=Object.values(game);const gameScore=currentGame.length===3&&currentGame.every(a=>a.score!==undefined)?currentGame.reduce((t,a)=>t+(a.score||0),0):undefined;
 const out:AppState={...input,scoreVersion:2,legacy:{gameRounds:input.gameRounds,bestGame:input.bestGame,sims:{0:input.sims[0],2:input.sims[2]},scores:{firstExam:input.firstExam,bestExam:input.bestExam}},answers:Object.fromEntries(Object.entries(input.answers).map(([id,a])=>[id,normalize(a)])),sims:{...input.sims,0:freshSim(),2:freshSim()},game,gameRounds:gameScore===undefined?[]:[gameScore],bestGame:gameScore,rounds,exam,firstExam:rounds[0]?.score,bestExam:rounds.length?Math.max(...rounds.map(r=>r.score||0)):undefined};
 out.completed=out.completed.filter(p=>missingTasks(out,p).length===0);return out;
}

export function canVisitPage(s:AppState,page:number):boolean {
 if(!Number.isInteger(page)||page<0||page>7)return false;
 if(page===0||page===7||s.manualUnlocked)return true;
 return Array.from({length:page},(_,i)=>i).every(i=>s.completed.includes(i));
}
export function restoreAccessiblePage(s:AppState):AppState {
 if(canVisitPage(s,s.page))return s;
 const firstIncomplete=Array.from({length:7},(_,i)=>i).find(i=>!s.completed.includes(i))??0;
 return {...s,page:firstIncomplete,tab:'read'};
}
