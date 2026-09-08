// Bound to the designated results spreadsheet. No student-data read endpoint.
const SPREADSHEET_ID = '1ItFnYnTx_-tleYx-Fko-82OVOpWCtOCHEcK_4CT5RNQ';
const UPLOAD_SECRET = '__UPLOAD_SECRET__';
const HEADERS = ['班級','座號','姓名','學習積分（24）','首次評量（12）','評量最高（12）','修正後評量（12）','遊戲最高（6）','已完成學習頁數（7）','更新時間','上傳識別碼'];
function json_(data) { return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON); }
function doGet() { return json_({ok:true,service:'cell-explorer-results',version:1}); }
function text_(value, max) {
  if (typeof value !== 'string') throw new Error('請填寫完整的班級、座號與姓名');
  const text = value.trim().normalize('NFKC');
  if (!text || text.length > max || /[\x00-\x1f]/.test(text)) throw new Error('欄位格式不正確');
  return text;
}
function safe_(value) { return /^[=+@-]/.test(value) ? "'" + value : value; }
function number_(value, max, optional) {
  if (optional && value === null) return '';
  if (!Number.isInteger(value) || value < 0 || value > max) throw new Error('分數格式不正確');
  return value;
}
function doPost(e) {
  let lock;
  try {
    if (!e || !e.postData || e.postData.contents.length > 12000) throw new Error('上傳資料格式不正確');
    const p = JSON.parse(e.postData.contents);
    if (p.secret !== UPLOAD_SECRET) return json_({ok:false,error:'上傳驗證失敗'});
    const className = text_(p.className,30), name = text_(p.name,50);
    const seat = text_(p.seat,3);
    if (!/^\d{1,3}$/.test(seat) || Number(seat)<1) throw new Error('座號請填 1 至 999');
    if (typeof p.requestId !== 'string' || !/^[a-zA-Z0-9-]{16,80}$/.test(p.requestId)) throw new Error('上傳識別碼無效');
    const values = [safe_(className),String(Number(seat)),safe_(name),number_(p.learningScore,24),number_(p.firstAssessment,12,true),number_(p.bestAssessment,12,true),number_(p.correctedAssessment,12,true),number_(p.bestGame,6,true),number_(p.completedPages,7)];
    lock=LockService.getScriptLock();
    if(!lock.tryLock(20000)) return json_({ok:false,error:'目前上傳人數較多，請稍後重試'});
    const book=SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet=book.getSheets().filter(s=>s.getSheetId()===0)[0];
    if(!sheet) throw new Error('找不到成果工作表');
    if(sheet.getLastRow()===0) {
      sheet.getRange(1,1,1,HEADERS.length).setValues([HEADERS]);
      sheet.setFrozenRows(1);
      sheet.getRange(1,1,1,HEADERS.length).setFontWeight('bold').setBackground('#e8f0fe');
    } else if(JSON.stringify(sheet.getRange(1,1,1,HEADERS.length).getValues()[0])!==JSON.stringify(HEADERS)) {
      throw new Error('成果工作表欄位不相符，請通知老師');
    }
    const existing=sheet.getLastRow()>1?sheet.getRange(2,1,sheet.getLastRow()-1,HEADERS.length).getValues():[];
    const duplicate=existing.findIndex(r=>r[10]===p.requestId);
    if(duplicate>=0) return json_({ok:true,requestId:p.requestId,row:duplicate+2,action:'unchanged',receivedAt:new Date(existing[duplicate][9]).toISOString()});
    const match=existing.findIndex(r=>String(r[0]).trim()===className&&Number(r[1])===Number(seat)&&String(r[2]).trim()===name);
    const row=match>=0?match+2:sheet.getLastRow()+1;
    const receivedAt=new Date();
    sheet.getRange(row,1,1,3).setNumberFormat('@');
    sheet.getRange(row,1,1,HEADERS.length).setValues([[...values,receivedAt,p.requestId]]);
    sheet.getRange(row,10).setNumberFormat('yyyy/mm/dd hh:mm:ss');
    SpreadsheetApp.flush();
    return json_({ok:true,requestId:p.requestId,row,action:match>=0?'updated':'created',receivedAt:receivedAt.toISOString()});
  } catch(error) {
    return json_({ok:false,error:error.message||'上傳失敗，請稍後重試'});
  } finally { if(lock&&lock.hasLock())lock.releaseLock(); }
}
