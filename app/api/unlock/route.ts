export async function POST(request:Request){
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return Response.json({ok:false},{status:403});
 try{const body=await request.json() as {password?:unknown};if(process.env.PAGE_UNLOCK_PASSWORD&&body.password===process.env.PAGE_UNLOCK_PASSWORD)return Response.json({ok:true});}catch{}
 return Response.json({ok:false,error:'密碼不正確，請再試一次'},{status:403});
}
