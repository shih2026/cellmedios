'use client';
import {useEffect,useState} from 'react';
import {FlaskConical,ExternalLink,RotateCcw} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {stateQuestions,diffusionQuestions,diffusionSetups} from '@/lib/questions';
import {freshRecord,type SimState,type AnswerRecord} from '@/lib/model';
import {QuestionCard} from './question';
import {OperationLayout,StepGuide} from './operation-layout';
import {Pick} from './exploration';
const urls={states:'https://phet.colorado.edu/sims/html/states-of-matter-basics/latest/states-of-matter-basics_all.html?locale=zh_TW',diffusion:'https://phet.colorado.edu/sims/html/diffusion/latest/diffusion_all.html?locale=zh_TW'};
export function PhETExploration({page,sim,onChange,answers,onAnswer}:{page:number;sim:SimState;onChange:(s:SimState)=>void;answers:Record<string,AnswerRecord>;onAnswer:(id:string,a:AnswerRecord)=>void}){
 const states=page===0;const questions=states?stateQuestions:diffusionQuestions;const active=sim.condition;const q=questions[active];const a=answers[q.id]||freshRecord();const [loaded,setLoaded]=useState(false);const [slow,setSlow]=useState(false);const [frameVersion,setFrameVersion]=useState(0);
 useEffect(()=>{if(loaded)return;const timer=setTimeout(()=>setSlow(true),15000);return()=>clearTimeout(timer);},[loaded,frameVersion]);
 const choose=(i:number)=>onChange({...sim,condition:i,prediction:'',shown:false});
 const record=(value:AnswerRecord)=>{onAnswer(q.id,value);if(value.submitted){const selected=(value.first||value.draft)[0]?.map(i=>q.rows[0].options[i]).join('、')||'';const condition=states?['固態','液態','氣態'][active]:`藍色 ${diffusionSetups[active].blue}、紅色 ${diffusionSetups[active].red}`;onChange({...sim,shown:true,observations:{...sim.observations,[q.id]:sim.observations[q.id]||{condition,prediction:states?'—':sim.prediction,result:selected}}});}};
 return <section className="card exploration phet-exploration"><div className="section-label"><FlaskConical size={19}/>動手探索 · {states?'物質三態':'擴散作用'}</div><div className="explore-heading"><h2>{states?'看分子怎麼排列、怎麼移動':'移除分隔器，看看粒子如何散開'}</h2><span className="pill">{questions.filter(q=>answers[q.id]?.first).length} / 3 組已觀察</span></div>
 <OperationLayout visual={<> <div className="phet-frame"><iframe key={frameVersion} src={states?urls.states:urls.diffusion} title={states?'PhET 物質三態：基礎，繁體中文互動模擬':'PhET 擴散，繁體中文互動模擬'} allowFullScreen onLoad={()=>setLoaded(true)} onError={()=>setSlow(true)}/></div>
 <div className="phet-toolbar"><span className="small">{loaded?'可使用模擬內的暫停、播放與重設按鈕。':'正在載入互動模擬…'}</span><a href={states?urls.states:urls.diffusion} target="_blank" rel="noopener noreferrer">在新分頁開啟模擬<ExternalLink size={15}/></a><Button variant="ghost" onClick={()=>{setLoaded(false);setSlow(false);setFrameVersion(v=>v+1);}}><RotateCcw/>重新載入模擬</Button></div>
 {slow&&!loaded&&<p className="pending">模擬尚未載入。請確認網路連線，或使用上方連結在新分頁操作；回來後可以繼續作答。</p>}
</>}>
 <div className="phet-scenarios">{questions.map((question,i)=><Button key={question.id} variant={active===i?'default':'outline'} onClick={()=>choose(i)}>{states?['固態','液態','氣態'][i]:`藍 ${diffusionSetups[i].blue} ／ 紅 ${diffusionSetups[i].red}`}{answers[question.id]?.first?' ✓':''}</Button>)}</div>
 <StepGuide key={q.id} steps={states?['在左側模擬選擇「狀態」，保持物質種類不變。',`點選「${['固態','液態','氣態'][active]}」，觀察分子間距、排列及移動。`,'選出符合觀察的描述，再提交答案。']:[`重設左側模擬，保留分隔器；將藍色粒子設為 ${diffusionSetups[active].blue}、紅色粒子設為 ${diffusionSetups[active].red}。`,'先留下「我的預測」。','移除分隔器並播放，分別追蹤藍色與紅色粒子，再回答觀察題。']}/>
 {!states&&<Pick label="我的預測：移除分隔器後會發生什麼？（不計分）" options={['兩種粒子都會逐漸散開、混合','只有數量較多的那種粒子會散開','兩種粒子數量相同時，就不會移動']} value={sim.prediction} onChange={prediction=>onChange({...sim,prediction})}/>}
 {states||sim.prediction||a.first?<QuestionCard key={q.id} question={q} record={a} onChange={record}/>:<div className="insight">先選擇「我的預測」，再進行觀察與作答。</div>}
 </OperationLayout>
 {Object.keys(sim.observations).length>0&&<details className="observation-log"><summary>我的觀察紀錄</summary><div className="table-scroll"><table><thead><tr><th>條件</th>{!states&&<th>原預測</th>}<th>第一次觀察答案</th><th>目前答案</th></tr></thead><tbody>{questions.filter(q=>sim.observations[q.id]).map(q=>{const o=sim.observations[q.id];return <tr key={q.id}><td>{o.condition}</td>{!states&&<td>{o.prediction}</td>}<td>{o.result}</td><td>{answers[q.id]?.draft[0]?.map(i=>q.rows[0].options[i]).join('、')||'尚未作答'}</td></tr>})}</tbody></table></div></details>}
 <p className="small">觀察題首次答對得 2 分，第二次起答對得 1 分。重設模擬不會清除已提交紀錄。</p></section>;
}
