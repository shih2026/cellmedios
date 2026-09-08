'use client';
import {useState,type ReactNode} from 'react';
import {Button} from '@/components/ui/button';
export function OperationLayout({visual,children}:{visual:ReactNode;children:ReactNode}){return <div className="operation-layout"><div className="operation-visual">{visual}</div><div className="operation-instructions">{children}</div></div>}
export function StepGuide({steps}:{steps:string[]}){const [step,setStep]=useState(0);return <div className="step-guide"><strong>操作指示 {step+1} / {steps.length}</strong><p aria-live="polite">{steps[step]}</p><div className="controls"><Button variant="outline" disabled={step===0} onClick={()=>setStep(step-1)}>上一指示</Button><Button variant="outline" disabled={step===steps.length-1} onClick={()=>setStep(step+1)}>下一指示</Button></div></div>}
