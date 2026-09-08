'use client';
import {useState} from 'react';
import {ZoomIn,ArrowRight,RotateCcw} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
const figures={
  2:{file:'diffusion',title:'從巨觀到微觀，看懂擴散',alt:'上排紅墨水由集中到均勻；下排比較物質通過細胞膜時，由濃度差到動態平衡的過程。',intro:'上排看顏色分布，下排看物質通膜；點選階段，對照同一欄的兩種尺度。',steps:[
    {label:'① 尚未均勻',text:'紅墨水集中在局部；下排則表示細胞膜兩側有濃度差。先找出高濃度與低濃度區域。',box:[22,8,23,82]},
    {label:'② 逐漸散開',text:'整體呈現由高濃度區往低濃度區散開的趨勢。圖中膜外較濃，因此物質有由外進內的整體趨勢；個別分子仍隨機移動。',box:[46,8,24,82]},
    {label:'③ 均勻分布',text:'均勻不等於停止！兩側濃度相同時，分子仍可雙向通過，兩向通過量大致相同。',box:[71,8,24,82]}]},
  3:{file:'membrane',title:'一張圖，看清物質的通膜路徑',alt:'氧氣與二氧化碳直接通膜；葡萄糖、胺基酸、礦物質藉特殊蛋白質通膜；水有直接通膜與藉特殊蛋白質兩種路徑。',intro:'點選一組物質，找出它在圖中的路徑。箭頭表示可以通過的路徑，不代表固定的淨移動方向。',steps:[
    {label:'氧氣・二氧化碳',text:'可以直接穿過細胞膜，不需要特殊蛋白質協助。',box:[9,1,15,70]},
    {label:'葡萄糖・胺基酸・礦物質',text:'需要膜上的特殊蛋白質協助。不同物質需要適合自己的運輸蛋白；葡萄糖通常由載體蛋白運送。',box:[24,2,47,76]},
    {label:'水的兩條路徑',text:'水可以直接通過細胞膜，也可以經由膜上的特殊蛋白質通過。配對時，兩種方式都要選。',box:[62,23,30,66]}]},
  5:{file:'cells',title:'同一種溶液，兩種細胞會怎樣？',alt:'三欄依序為濃食鹽水、生理食鹽水與純水，上排為動物細胞，下排為植物細胞，呈現水量與外觀的變化。',intro:'點選溶液，上下比較動物與植物細胞。先讀進出水量，再觀察形狀與細胞壁。',steps:[
    {label:'濃食鹽水',text:'出水量大於進水量。動物細胞萎縮；植物細胞失水後，原生質體縮小，細胞膜與細胞壁分離。此處提供讀圖比較，不新增計分題。',box:[8,1,28,94]},
    {label:'生理食鹽水',text:'本圖情境中，進出水量大致相同，細胞外觀維持。不變不代表沒有水進出；生理食鹽水對不同植物細胞的效果不一定相同。',box:[36,1,30,94]},
    {label:'純水',text:'進水量大於出水量。動物細胞膨脹，最後可能破裂；植物細胞有細胞壁支撐，膨脹但不至於破裂。',box:[66,1,30,94]}]}
} as const;
export function ImportantFigure({page}:{page:2|3|5}){
 const data=figures[page];const [active,setActive]=useState<number|null>(null);const [open,setOpen]=useState(false);const [zoom,setZoom]=useState(false);const step=active===null?null:data.steps[active];
 return <section className="card important-figure"><div className="important-figure-heading"><div><div className="section-label">重點圖解 · 點選比較</div><h2>{data.title}</h2><p>{data.intro}</p></div><Button variant="outline" onClick={()=>setOpen(true)}><ZoomIn size={18}/>放大原圖</Button></div><div className="figure-step-controls" aria-label="圖解導讀">{data.steps.map((item,i)=><Button key={item.label} variant={active===i?'default':'outline'} aria-pressed={active===i} onClick={()=>setActive(i)}>{item.label}</Button>)}<Button variant="ghost" onClick={()=>setActive(null)}><RotateCcw size={16}/>看全圖</Button></div><div className="important-image-wrap"><img src={`/important-figures/${data.file}.png`} alt={data.alt} width={page===2?1414:page===3?1690:1544} height={page===2?1124:page===3?1018:1176}/>{step&&<span className="figure-focus" aria-hidden="true" style={{left:step.box[0]+'%',top:step.box[1]+'%',width:step.box[2]+'%',height:step.box[3]+'%'}}/>}</div><div className="figure-guide" aria-live="polite"><div key={active??'all'} className="figure-guide-copy"><strong>{step?.label??'先看全圖，再逐項比較'}</strong><p>{step?.text??data.alt}</p></div><Button variant="outline" onClick={()=>setActive(active===null?0:(active+1)%data.steps.length)}>下一個重點<ArrowRight size={17}/></Button></div><Dialog open={open} onOpenChange={value=>{setOpen(value);if(!value)setZoom(false);}}><DialogContent className="important-figure-dialog"><DialogTitle>{data.title}</DialogTitle><DialogDescription>可切換原尺寸查看文字；放大時可上下及左右捲動。</DialogDescription><Button variant="outline" onClick={()=>setZoom(!zoom)}>{zoom?'符合視窗':'原尺寸放大'}</Button><div className="important-zoom-scroll"><img style={zoom?{width:page===2?1414:page===3?1690:1544,maxWidth:'none'}:undefined} src={`/important-figures/${data.file}.png`} alt={data.alt}/></div></DialogContent></Dialog></section>;
}
