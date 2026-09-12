import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {freshState,freshSim,freshRecord,submitRecord,progressPoints,missingTasks,correctRows,concentration,osmosis,cellResult,firstQuestionPoints,correctedQuestionPoints,migrateState} from '../lib/model.ts';
import {formative,summative,game,stateQuestions,diffusionQuestions,diffusionSetups} from '../lib/questions.ts';
const correct=q=>q.rows.map(r=>[...r.answer]);
const answer=q=>submitRecord(q.rows,{...freshRecord(),draft:correct(q)});
test('首次答對 2 分，頁面完成不再送分，重複提交不刷分',()=>{const q=formative[0];let a=answer(q);assert.equal(a.score,2);const first=structuredClone(a.first);for(let i=0;i<10;i++)a=submitRecord(q.rows,a);assert.equal(a.score,2);assert.deepEqual(a.first,first);const s=freshState();s.answers[q.id]=a;s.completed=[0,1,2];assert.equal(progressPoints(s),2);});
test('第二次與第三次才答對均為 1 分；首次錯答保留',()=>{const q=formative[0];for(const wrongTimes of [1,2,3]){let a={...freshRecord(),draft:[[1],[0],[1]]};for(let i=0;i<wrongTimes;i++)a=submitRecord(q.rows,a);assert.equal(a.score,undefined);a=submitRecord(q.rows,{...a,draft:correct(q)});assert.equal(a.score,1);assert.deepEqual(a.first,[[1],[0],[1]]);}});
test('提示不是一次作答；看完整解析完成不獲答對分',()=>{const q=formative[1];assert.equal(submitRecord(q.rows,{...freshRecord(),draft:correct(q),hint:true}).score,2);assert.equal(submitRecord(q.rows,{...freshRecord(),draft:correct(q),demonstrated:true}).score,0);});
test('多列題需全對；水少選或多選皆不正確',()=>{const q=formative[3];assert.equal(submitRecord(q.rows,{...freshRecord(),draft:[[0]]}).first,undefined);const draft=correct(q);draft[2]=[0];assert.equal(correctRows(q.rows,draft)[2],false);draft[2]=[0,1,2];assert.equal(correctRows(q.rows,draft)[2],false);draft[2]=[1,0];assert.ok(correctRows(q.rows,draft).every(Boolean));});
test('評量每題全對 2 分；部分正確 0 分；提交修正後全對 1 分',()=>{const q=summative[0];const good=submitRecord(q.rows,{...freshRecord(),draft:correct(q)},true);assert.equal(firstQuestionPoints(good),2);assert.equal(good.feedback,false);const partial=submitRecord(q.rows,{...freshRecord(),draft:[[0],[1]]},true);assert.equal(firstQuestionPoints(partial),0);assert.equal(correctedQuestionPoints({...partial,correctionCorrect:true}),1);assert.equal(correctedQuestionPoints({...good,correctionCorrect:true}),2);});
test('三態改為三題實際觀察，舊有查看卡片紀錄不能完成',()=>{const s=freshState();s.sims[0]={...freshSim(),seen:['固態','液態','氣態','排列','移動']};s.answers.Q01=answer(formative[0]);assert.equal(missingTasks(s,0).length,3);for(const q of stateQuestions)s.answers[q.id]=answer(q);assert.deepEqual(missingTasks(s,0),[]);});
test('擴散三組數量正確；各自提交觀察題才能完成',()=>{assert.deepEqual(diffusionSetups,[{blue:60,red:20},{blue:20,red:60},{blue:40,red:40}]);const s=freshState();s.answers.Q03=answer(formative[2]);s.sims[2]={...freshSim(),observations:{0:{},1:{},2:{}}};assert.equal(missingTasks(s,2).length,3);for(const q of diffusionQuestions)s.answers[q.id]=answer(q);assert.deepEqual(missingTasks(s,2),[]);assert.match(diffusionQuestions[2].rows[0].options[1],/仍持續移動/);});
test('學習積分上限 24，整合評量 12，遊戲 6，各自獨立',()=>{const s=freshState();s.completed=[0,1,2,3,4,5,6];for(const q of [...formative,...stateQuestions,...diffusionQuestions])s.answers[q.id]=answer(q);s.bestExam=12;s.bestGame=6;assert.equal(progressPoints(s),24);assert.equal(summative.reduce((t,q)=>t+firstQuestionPoints(answer(q)),0),12);assert.equal(game.reduce((t,q)=>t+answer(q).score,0),6);});
test('既有紀錄遷移：保留初答，重算分數，三態擴散重新列待完成',()=>{const s=freshState();delete s.scoreVersion;s.answers.Q01={...answer(formative[0]),score:3};s.answers.Q02={...answer(formative[1]),score:1,demonstrated:true};s.completed=[0,2];s.sims[0]={...freshSim(),seen:['固態']};const ar=Object.fromEntries(summative.map(q=>[q.id,submitRecord(q.rows,{...freshRecord(),draft:correct(q)},true)]));s.rounds=[{answers:ar,score:12,reviewed:false}];s.exam={answers:ar,score:12,reviewed:false};const migrated=migrateState(s);assert.equal(migrated.answers.Q01.score,2);assert.equal(migrated.answers.Q02.score,0);assert.deepEqual(migrated.answers.Q01.first,s.answers.Q01.first);assert.deepEqual(migrated.completed,[]);assert.equal(migrated.firstExam,12);assert.ok(migrated.legacy);assert.deepEqual(migrateState(migrated),migrated);});
test('滲透完成三組觀察即可，不必切換兩種讀法',()=>{assert.deepEqual([0,1,2].map(concentration),['較淡','較濃','較濃']);assert.deepEqual([0,1,2].map(osmosis),['左往右較多','右往左較多','兩向大致相同']);assert.equal(cellResult(0,0).water,'大致相同');assert.match(cellResult(1,1).shape,/細胞壁保護/);const s=freshState();s.sims[4]={...freshSim(),observations:{0:{},1:{},2:{}},readings:[0]};s.answers.Q05=answer(formative[4]);assert.deepEqual(missingTasks(s,4),[]);s.sims[4].readings=[0,1];assert.deepEqual(missingTasks(s,4),[]);});
test('學生正文、圖說、題目與回饋不含來源及備課文字',()=>{const paths=['app/page.tsx','app/question.tsx','app/diagrams.tsx','app/exploration.tsx','app/phet-exploration.tsx','lib/lessons.json','lib/questions.ts'];for(const path of paths)assert.doesNotMatch(readFileSync(new URL('../'+path,import.meta.url),'utf8'),/教材|課本|教學|備課|來源|模型不教/);});
test('兩個指定 PhET 模擬都直接內嵌，提供新分頁與重新載入',()=>{const source=readFileSync(new URL('../app/phet-exploration.tsx',import.meta.url),'utf8');assert.match(source,/<iframe/);assert.match(source,/states-of-matter-basics_all.html\?locale=zh_TW/);assert.match(source,/diffusion_all.html\?locale=zh_TW/);assert.match(source,/allowFullScreen/);assert.match(source,/重新載入模擬/);});

test('分頁需依序完成；成果上傳永遠開放，無法跳頁',async()=>{const {canVisitPage}=await import('../lib/model.ts');const s=freshState();assert.ok(canVisitPage(s,0));assert.ok(canVisitPage(s,7));for(let i=1;i<7;i++)assert.equal(canVisitPage(s,i),false);s.completed=[0];assert.ok(canVisitPage(s,1));assert.equal(canVisitPage(s,2),false);s.completed=[0,2,3];assert.equal(canVisitPage(s,4),false);assert.equal(canVisitPage(s,-1),false);assert.equal(canVisitPage(s,8),false);});
test('密碼解鎖不給分、不偽造完成，恢復鎖定仍依原進度',async()=>{const {canVisitPage,restoreAccessiblePage}=await import('../lib/model.ts');const s={...freshState(),page:6,manualUnlocked:true};for(let i=0;i<8;i++)assert.ok(canVisitPage(s,i));assert.equal(progressPoints(s),0);assert.deepEqual(s.completed,[]);const restored=restoreAccessiblePage({...s,manualUnlocked:false});assert.equal(restored.page,0);assert.equal(canVisitPage(restored,6),false);assert.equal(restoreAccessiblePage({...restored,page:7}).page,7);});

test('濃食鹽水兩類細胞均出水較多，六組觀察才完成，舊分數保留',()=>{
 const s=freshState();s.answers.Q06=answer(formative[5]);s.completed=[5];s.sims[5]=freshSim();
 for(const c of [0,1])for(const i of [0,1])s.sims[5].observations[c+'-'+i]={condition:'',prediction:'',result:''};
 assert.equal(missingTasks(s,5).length,2);
 const migrated=migrateState(s);assert.deepEqual(migrated.completed,[]);assert.deepEqual(migrated.answers,s.answers);
 for(const c of [0,1]){assert.equal(cellResult(c,2).water,'出水較多');s.sims[5].observations[c+'-2']={condition:'濃食鹽水',prediction:'出水較多',result:cellResult(c,2).shape};}
 assert.match(cellResult(1,2).shape,/質壁分離/);assert.deepEqual(missingTasks(s,5),[]);
});

test('重新載入建立全新學習狀態，不延續答案、分數、身分或密碼解鎖',async()=>{
 const {canVisitPage}=await import('../lib/model.ts');
 const old=freshState();old.manualUnlocked=true;old.completed=[0,1,2,3,4,5,6];old.answers.Q01=answer(formative[0]);old.student={className:'測試',seat:'1',name:'測試'};old.page=6;
 const next=freshState();assert.equal(next.page,0);assert.equal(next.tab,'read');assert.deepEqual(next.answers,{});assert.deepEqual(next.sims,{});assert.equal(next.student,undefined);assert.equal(progressPoints(next),0);
 for(let i=1;i<7;i++)assert.equal(canVisitPage(next,i),false);assert.ok(canVisitPage(next,0));assert.ok(canVisitPage(next,7));
 const source=readFileSync(new URL('../app/page.tsx',import.meta.url),'utf8');
 assert.doesNotMatch(source,/localStorage\.(getItem|setItem)|sessionStorage/);assert.match(source,/localStorage\.removeItem\(KEY\)/);
});
