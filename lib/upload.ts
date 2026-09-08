import {summative} from './questions';
import {progressPoints,correctedQuestionPoints,type AppState} from './model';
export type UploadPayload={className:string;seat:string;name:string;requestId:string;learningScore:number;firstAssessment:number|null;bestAssessment:number|null;correctedAssessment:number|null;bestGame:number|null;completedPages:number};
export function uploadSnapshot(s:AppState){return {learningScore:progressPoints(s),firstAssessment:s.firstExam??null,bestAssessment:s.bestExam??null,correctedAssessment:s.exam.score===undefined?null:summative.reduce((t,q)=>t+correctedQuestionPoints(s.exam.answers[q.id]),0),bestGame:s.bestGame??null,completedPages:s.completed.filter(p=>p<7).length};}
export function validateUpload(input:unknown):UploadPayload {
 if(!input||typeof input!=='object')throw new Error('上傳資料格式不正確');
 const p=input as Record<string,unknown>;
 const text=(key:string,max:number)=>{if(typeof p[key]!=='string')throw new Error('請填寫班級、座號和姓名');const v=(p[key] as string).trim().normalize('NFKC');if(!v||v.length>max||/[\x00-\x1f]/.test(v))throw new Error('班級或姓名格式不正確');return v;};
 const className=text('className',30),seat=text('seat',3),name=text('name',50),requestId=text('requestId',80);
 if(!/^\d{1,3}$/.test(seat)||Number(seat)<1)throw new Error('座號請填 1 至 999');
 if(!/^[a-zA-Z0-9-]{16,80}$/.test(requestId))throw new Error('上傳識別碼無效');
 const score=(key:string,max:number,optional=false)=>{const v=p[key];if(optional&&v===null)return null;if(typeof v!=='number'||!Number.isInteger(v)||v<0||v>max)throw new Error('分數資料不正確，請重新整理後再試');return v;};
 return {className,seat:String(Number(seat)),name,requestId,learningScore:score('learningScore',24)!,firstAssessment:score('firstAssessment',12,true),bestAssessment:score('bestAssessment',12,true),correctedAssessment:score('correctedAssessment',12,true),bestGame:score('bestGame',6,true),completedPages:score('completedPages',7)!};
}
