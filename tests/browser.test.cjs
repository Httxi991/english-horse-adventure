/* Optional integration test. Requires Playwright and an installed Chromium. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const URL=process.env.GAME_URL||'http://127.0.0.1:8080/english-horse-adventure/';
const out=path.join(__dirname,'../test-results');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const launchOptions={headless:true,...(process.env.CHROME_BIN?{executablePath:process.env.CHROME_BIN,args:['--no-sandbox','--no-zygote','--single-process','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']}: {})};
 let browser=await chromium.launch(launchOptions);
 const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
 const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('english-horse-adventure-v1')));
 async function rideToQuestion(key='ArrowRight'){await page.keyboard.down(key);await page.waitForSelector('[data-answer]',{timeout:10000});await page.keyboard.up(key);}
 async function correctIndex(){return page.evaluate(()=>{const title=document.querySelector('#modalTitle').textContent;return window.QUESTION_BANK.find(q=>q.prompt===title).answer;});}
 await page.goto(URL);await page.waitForFunction(()=>document.querySelector('#homeCanvas').width>0);await page.waitForTimeout(200);
 await page.screenshot({path:path.join(out,'desktop-home.png'),fullPage:true});
 await page.click('#horseMenu');await page.click('[data-horse="3"]');await page.click('#done');assert.equal(await page.locator('#horseLabel').textContent(),'Honey');
 await page.click('#settingsMenu');await page.check('#muteSetting');await page.click('#done');await page.reload();assert.equal(await page.locator('#horseLabel').textContent(),'Honey');assert.equal((await saved()).settings.muted,true);
 await page.click('#play');await page.screenshot({path:path.join(out,'desktop-game.png'),fullPage:true});
 await page.keyboard.down('KeyW');await page.keyboard.down('KeyD');await page.waitForSelector('[data-answer]',{timeout:10000});await page.keyboard.up('KeyW');await page.keyboard.up('KeyD');assert.equal((await saved()).game.x,520);
 let answer=await correctIndex();await page.click(`[data-answer="${(answer+1)%4}"]`);assert.match(await page.locator('#feedback').textContent(),/Try again!/);assert.equal((await saved()).game.score,0);
 await page.keyboard.down('ArrowRight');await page.waitForTimeout(200);await page.keyboard.up('ArrowRight');assert.equal((await saved()).game.x,520);
 await page.screenshot({path:path.join(out,'desktop-question.png'),fullPage:true});
 await page.click('#questionPause');await page.click('#resumeRide');await page.click(`[data-answer="${answer}"]`);assert.equal((await saved()).game.score,60);
 // Even multiple synchronous button clicks cannot count the answer again.
 await page.evaluate(i=>{const b=document.querySelector(`[data-answer="${i}"]`);for(let n=0;n<10;n++)b.click();},answer);assert.equal((await saved()).game.score,60);
 await page.reload();await page.click('#resume');assert.equal(await page.locator('[data-answer]:disabled').count(),4);assert.equal((await saved()).game.score,60);await page.click('#continueRide');
 await page.keyboard.down('ArrowLeft');await page.waitForTimeout(400);await page.keyboard.up('ArrowLeft');await page.keyboard.down('ArrowRight');await page.waitForTimeout(450);await page.keyboard.up('ArrowRight');assert.equal(await page.locator('dialog[open]').count(),0);
 await page.click('#pause');const pausedX=(await saved()).game.x;await page.keyboard.down('KeyD');await page.waitForTimeout(100);await page.keyboard.up('KeyD');assert.equal((await saved()).game.x,pausedX);await page.click('#goHome');await page.click('#resume');
 for(let stop=1;stop<5;stop++){await rideToQuestion();answer=await correctIndex();await page.click(`[data-answer="${answer}"]`);await page.click('#continueRide');}
 assert.equal((await saved()).game.completed,5);assert.equal((await saved()).game.phase,'riding');
 await page.keyboard.down('ArrowRight');await page.waitForSelector('#playAgain',{timeout:10000});await page.keyboard.up('ArrowRight');assert.equal((await saved()).game.score,460);assert.equal((await saved()).game.firstTry,4);assert.match(await page.locator('.result-icon').getAttribute('aria-label'),/3 out of 3/);await page.screenshot({path:path.join(out,'desktop-result.png'),fullPage:true});
 await page.click('#finishHome');assert.match(await page.locator('#record').textContent(),/460/);await browser.close();console.log("PASS: desktop flow and persistence");browser=await chromium.launch(launchOptions);
 const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});const phone=await mobile.newPage();phone.on('pageerror',e=>errors.push(e.message));await phone.goto(URL);await phone.waitForTimeout(150);await phone.screenshot({path:path.join(out,'mobile-home.png'),fullPage:true});await phone.click('#difficultyMenu');await phone.click('[data-level="Advanced"]');await phone.click('#play');
 const cdp=await mobile.newCDPSession(phone);const box=await phone.locator('[data-dir="right"]').boundingBox();await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+box.width/2,y:box.y+box.height/2}]});await phone.waitForSelector('[data-answer]',{timeout:10000});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await phone.screenshot({path:path.join(out,'mobile-question.png'),fullPage:true});
 for(const width of [320,390,768]){await phone.setViewportSize({width,height:844});assert.ok(await phone.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`No page overflow at ${width}`);assert.ok(await phone.locator('#modal').evaluate(el=>el.scrollWidth<=el.clientWidth),`No question overflow at ${width}`);for(const item of await phone.locator('.answer').all())assert.ok(await item.evaluate(el=>el.scrollWidth<=el.clientWidth),`No answer overflow at ${width}`);}
 await phone.setViewportSize({width:390,height:844});answer=await phone.evaluate(()=>window.QUESTION_BANK.find(q=>q.prompt===document.querySelector('#modalTitle').textContent).answer);await phone.click(`[data-answer="${answer}"]`);await phone.click('#continueRide');
 const xBefore=await phone.evaluate(()=>JSON.parse(localStorage.getItem('english-horse-adventure-v1')).game.x);await phone.waitForTimeout(800);await phone.click('#pause');const xAfter=await phone.evaluate(()=>JSON.parse(localStorage.getItem('english-horse-adventure-v1')).game.x);assert.equal(xBefore,xAfter,'Touch is released when a question opens');await phone.click('#resumeRide');await phone.screenshot({path:path.join(out,'mobile-game.png'),fullPage:true});
 assert.deepEqual(errors,[]);await browser.close();console.log('PASS: desktop complete run, mandatory stops, retries, duplicate scoring guard, feedback restore, pause, settings persistence, mobile touch, wrapping at 320/390/768px, relative asset paths, and zero browser errors.');
})().catch(e=>{console.error(e);process.exit(1)});
