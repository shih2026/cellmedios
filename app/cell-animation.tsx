'use client';
import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {CellDiagram} from './diagrams';

type CellMedia={initial:string;results:readonly [string,string,string]};
// Solution order matches the experiment: isotonic, pure water, concentrated salt.
const media:Record<number,CellMedia|undefined>={
 0:{initial:'/cell-animations/red-cell-initial.png',results:[
  '/cell-animations/red-cell-isotonic.gif',
  '/cell-animations/red-cell-pure-water.gif',
  '/cell-animations/red-cell-concentrated-salt.gif',
 ]},
 1:{initial:'/cell-animations/plant-cell-initial.png',results:[
  '/cell-animations/plant-cell-isotonic.gif',
  '/cell-animations/plant-cell-pure-water.gif',
  '/cell-animations/plant-cell-concentrated-salt.gif',
 ]},
};
export function CellAnimation({cell,condition,shown,run}:{cell:number;condition:number;shown:boolean;run:number}){
 const [replay,setReplay]=useState(0);
 const assets=media[cell];
 const solution=['生理食鹽水','純水','濃食鹽水'][condition];
 const name=cell===0?'紅血球':'植物細胞';
 const result=['形狀維持，進出水量大致相同',cell===0?'進水較多，膨脹至可能破裂':'進水較多，膨脹但有細胞壁保護而不破裂',cell===0?'出水較多，失水萎縮':'出水較多，萎縮，細胞膜與細胞壁分離'][condition];
 return <div className="cell-animation">
 <p className="diagram-context">{shown?solution+'中的'+(cell===0?'紅血球':'植物細胞'):'初始細胞 · 先預測，再顯示結果'}</p>
 {assets?<img key={cell+'-'+(shown?condition+'-'+run+'-'+replay:'initial')} className="cell-animation-image" src={shown?assets.results[condition]+'?play='+run+'-'+replay:assets.initial} alt={shown?name+'在'+solution+'中：'+result:name+'初始靜態圖，水可流入也可流出'} />:
 <CellDiagram plant pure={condition===1} salt={condition===2} shown={shown}/>}
 {shown&&assets&&<div className="controls"><Button variant="outline" onClick={()=>setReplay(n=>n+1)}>重新播放動畫</Button></div>}
 </div>;
}
