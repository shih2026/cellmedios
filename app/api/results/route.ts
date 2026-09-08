import {validateUpload} from '@/lib/upload';
export async function POST(request:Request){
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return Response.json({ok:false,error:'請從學習網頁上傳'},{status:403});
 const url=process.env.GAS_DEPLOYMENT_URL;const secret=process.env.GAS_UPLOAD_SECRET;
 if(!url||!secret)return Response.json({ok:false,error:'成果上傳尚未完成設定，請稍後再試'},{status:503});
 let payload;try{const body=await request.text();if(body.length>12000)throw new Error('資料太長');payload=validateUpload(JSON.parse(body));}catch(error){return Response.json({ok:false,error:error instanceof Error?error.message:'資料格式不正確'},{status:400});}
 try{
  const result=await fetch(url,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({...payload,secret}),redirect:'follow',signal:AbortSignal.timeout(40000)});
  if(!result.ok)throw new Error('接收服務未回應');const data=await result.json() as Record<string,unknown>;
  if(!data.ok||data.requestId!==payload.requestId||typeof data.receivedAt!=='string'||typeof data.row!=='number'||!['created','updated','unchanged'].includes(String(data.action)))return Response.json({ok:false,error:typeof data.error==='string'?data.error:'尚未收到試算表確認，請重試'},{status:502});
  return Response.json({ok:true,requestId:data.requestId,receivedAt:data.receivedAt,action:data.action,row:data.row});
 }catch{return Response.json({ok:false,error:'尚未收到試算表確認，請檢查網路後重試；重試不會重複新增同一次上傳'},{status:502});}
}
