/* Tutorial 2: real Python execution, multi-input checks and understanding questions. */
(() => {
  const lessons=window.tutorialLessons, el=id=>document.getElementById(id);
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const drafts=lessons.map(l=>l.starter), checked=lessons.map(()=>new Set()), answered=new Set();
  const quizFeedback={};
  let step=0, active=false, freeCode='', run=null, feedback='', storageWorks=true;
  const storageKey='sense-hat-tutorial-2-progress-v1';
  const complete=i=>checked[i].size===lessons[i].tests.length&&answered.has(i);
  const completed=()=>lessons.map((_,i)=>i).filter(complete);
  function data(){return {tutorial:'Tutorial_2',version:1,step,drafts:[...drafts],checked:checked.map(s=>[...s]),answered:[...answered]};}
  function remember(){try{sessionStorage.setItem(storageKey,JSON.stringify(data()));storageWorks=true;}catch{storageWorks=false;}}
  function restore(d){
    if(!d||d.tutorial!=='Tutorial_2'||d.version!==1||!Number.isInteger(d.step)||d.step<0||d.step>=lessons.length||!Array.isArray(d.drafts)||d.drafts.length!==lessons.length||!d.drafts.every(s=>typeof s==='string')||!Array.isArray(d.checked)||d.checked.length!==lessons.length||!d.checked.every((a,i)=>Array.isArray(a)&&a.every(n=>Number.isInteger(n)&&n>=0&&n<lessons[i].tests.length))||!Array.isArray(d.answered)||!d.answered.every(i=>Number.isInteger(i)&&i>=0&&i<lessons.length))throw Error('Invalid progress');
    step=d.step;d.drafts.forEach((s,i)=>drafts[i]=s);checked.forEach((s,i)=>{s.clear();d.checked[i].forEach(n=>s.add(n));});answered.clear();d.answered.forEach(i=>answered.add(i));lessons.forEach((l,i)=>quizFeedback[i]=answered.has(i)?'Correct. '+l.question[3]:'');run=null;
  }
  function download(name,text,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
  const strip=document.createElement('div');strip.className='tutorial-strip';
  strip.innerHTML='<button id="tutorial-toggle">Start Tutorial 2</button><span id="progress-tools" hidden><button id="save-progress" class="quiet">Save progress</button><label class="upload quiet">Open progress<input id="open-progress" type="file" accept=".json" hidden></label></span>';
  document.querySelector('.editor').prepend(strip);
  const score=document.createElement('div');score.id='lesson-score';score.hidden=true;score.setAttribute('role','status');score.setAttribute('aria-live','polite');document.querySelector('header').append(score);
  const panel=document.createElement('section');panel.id='tutorial';panel.className='panel tutorial-panel';panel.hidden=true;document.querySelector('.output-panel').after(panel);
  function save(){if(active)drafts[step]=el('code').value;remember();}
  el('save-progress').onclick=()=>{save();download('Tutorial_2-progress.json',JSON.stringify(data(),null,2),'application/json');};
  el('open-progress').onchange=async e=>{const file=e.target.files[0];if(!file||running)return;try{if(file.size>1000000)throw Error('Too large');restore(JSON.parse(await file.text()));el('code').value=drafts[step];feedback='Tutorial 2 progress restored.';show();}catch{feedback='Choose a Tutorial_2-progress.json file saved by this tutorial. Tutorial 1 progress cannot be used here.';show();}e.target.value='';};
  function show(){
    const l=lessons[step], done=completed(), q=l.question;
    score.innerHTML='<strong>Lessons Successfully Completed: <span id="completed-lesson-numbers">'+(done.map(i=>i+1).join(', ')||'None yet')+'</span></strong><p>Tutorial 2 · <span id="completed-lesson-count">'+done.length+' of '+lessons.length+' lessons</span> · All test runs + understanding question correct</p>';
    panel.innerHTML=`<div class="bar"><strong>Tutorial 2 · If / Else</strong><span>${done.length} / ${lessons.length} completed</span></div><div class="lesson-body"><label for="lesson-select">Choose a lesson</label><select id="lesson-select">${lessons.map((x,i)=>`<option value="${i}" ${step===i?'selected':''}>${complete(i)?'✓ ':''}${i+1}. ${escape(x.title)}</option>`).join('')}</select><progress max="${lessons.length}" value="${done.length}" aria-label="Lessons completed"></progress><h2>${escape(l.title)}</h2><p>${escape(l.concept)}</p><div class="decision-guide" aria-label="Decision guide"><span>Check condition</span><span>True → if block</span><span>False → else, or skip</span></div><div class="lesson-task"><strong>Your turn</strong><p>${escape(l.task)}</p></div><p class="prediction"><strong>Before you run:</strong> ${escape(l.predict)}</p><details><summary>Show a hint</summary><pre>${escape(l.hint)}</pre></details><details><summary>Show a worked solution</summary><p>Try your own code first, then compare it with this example.</p><pre>${escape(l.solution)}</pre></details><h3>Test both paths</h3><p class="lesson-foot">Use the same code for every test. Select Run code, enter the listed values, then Check this run. Changing your code clears this lesson’s checked tests.</p><ul class="test-cases">${l.tests.map((t,i)=>`<li>${checked[step].has(i)?'✓':'○'} ${escape(t.label)} <span>Enter: ${t.inputs.map(escape).join(', then ')}</span></li>`).join('')}</ul><div class="lesson-controls"><button id="check-run" class="primary">Check this run</button><button id="reset-lesson">Reset starter</button></div><p id="lesson-feedback" role="status">${escape(feedback||'Edit the code, run it, enter an answer below OUTPUT, and check each result.')}</p><section class="lesson-quiz" aria-label="Understanding question"><h3>Show what you understand</h3><p>${escape(q[0])}</p><div class="quiz-choices">${q[1].map((c,i)=>`<button data-answer="${i}">${escape(c)}</button>`).join('')}</div><p role="status">${escape(quizFeedback[step]||'All test runs and a correct answer are required for completion.')}</p></section><div class="lesson-controls"><button id="lesson-prev" ${step===0?'disabled':''}>Previous</button><button id="lesson-next" ${step===lessons.length-1?'disabled':''}>Next lesson →</button></div><p class="lesson-foot">${storageWorks?'Progress survives refreshes in this tab.':'Browser saving is unavailable.'} Use Save progress before closing the tab; Open progress restores it. Based on Python_If_Else_Tutorial (Fahrenheit Edition), parts 1–6.</p>${done.length===lessons.length?'<p class="lesson-complete">All six lessons completed! Capture the header summary for your instructor.</p>':''}</div>`;
    el('lesson-select').onchange=e=>move(Number(e.target.value));el('lesson-prev').onclick=()=>move(step-1);el('lesson-next').onclick=()=>move(step+1);el('check-run').onclick=check;
    panel.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{const correct=Number(b.dataset.answer)===q[2];if(correct)answered.add(step);else answered.delete(step);quizFeedback[step]=correct?'Correct. '+q[3]:'Not yet. Review the explanation and try again.';show();});
    el('reset-lesson').onclick=()=>{if(running||!confirm('Reset this lesson’s code to its starter?'))return;el('code').value=l.starter;invalidate();feedback='Starter restored.';show();};
    remember();lock();
  }
  function lock(){el('tutorial-toggle').disabled=running;el('save-progress').disabled=running;el('open-progress').disabled=running;if(!active)return;['lesson-select','reset-lesson','check-run','lesson-prev','lesson-next'].forEach(id=>el(id).disabled=running||(id==='lesson-prev'&&step===0)||(id==='lesson-next'&&step===lessons.length-1));}
  function move(i){if(running||i<0||i>=lessons.length)return;save();step=i;el('code').value=drafts[i];run=null;feedback='';show();document.querySelector('.simulation').scrollTop=0;}
  function invalidate(){drafts[step]=el('code').value;checked[step].clear();run=null;feedback='Code changed. Check all listed test inputs with this version.';}
  el('code').addEventListener('input',()=>{if(active){invalidate();show();}});
  el('tutorial-toggle').onclick=()=>{if(running)return;if(active){save();active=false;el('code').value=freeCode;}else{freeCode=el('code').value;active=true;el('code').value=drafts[step];}run=null;panel.hidden=!active;score.hidden=!active;el('progress-tools').hidden=!active;document.body.classList.toggle('tutorial-active',active);el('tutorial-toggle').textContent=active?'Return to playground':'Start Tutorial 2';el('examples').disabled=active;el('upload').disabled=active;if(active)show();};
  window.addEventListener('python-run',e=>{if(active){run={code:e.detail.code,step,inputs:[],lines:[],done:false,error:false};feedback='Running. Enter the test values below OUTPUT.';show();}lock();});
  window.addEventListener('python-message',e=>{const m=e.detail;if(active&&run){if(m.type==='out')run.lines.push(m.text);if(m.type==='done'){run.done=true;run.error=m.error;feedback=m.error?'Python found an error. Check the colon and indentation, fix your code, and run again.':'Run finished. Select Check this run.';show();}}lock();});
  window.addEventListener('python-input',e=>{if(active&&run)run.inputs.push(e.detail.value);});
  window.addEventListener('python-stop',()=>{run=null;feedback='Stopped. Run to completion before checking.';if(active)show();lock();});
  function check(){
    const l=lessons[step];
    if(!run||!run.done||run.step!==step||run.code!==el('code').value){feedback='Run this version to completion first.';show();return;}
    if(run.error){feedback='Fix the Python error in OUTPUT and try again.';show();return;}
    const t=l.tests.findIndex(t=>t.inputs.length===run.inputs.length&&t.inputs.every((v,i)=>v===run.inputs[i].trim()));
    if(t<0){feedback='Run again with one of the listed test inputs. Keep the provided input() lines.';show();return;}
    // Require the control statement being taught as well as matching output.
    const code=run.code.split('\n').filter(s=>!s.trimStart().startsWith('#')).join('\n');
    const ifLines=code.match(/^\s*if\s+.+:\s*(?:#.*)?$/gm)||[];
    const structure=ifLines.length>0&&(step!==1||/^else\s*:/m.test(code))&&(step!==2||(/^elif\s+/m.test(code)&&/^else\s*:/m.test(code)))&&(step!==3||(code.match(/^if\s+/gm)||[]).length>=2)&&(step!==4||/^ {4,}if\s+/m.test(code))&&(step!==5||/^else\s*:/m.test(code));
    if(!structure){feedback='Use the if/elif/else structure described in this lesson. Matching text alone does not demonstrate the decision.';show();return;}
    const actual=run.lines.join('\n').trim().split('\n').map(s=>s.trimEnd()), expected=l.tests[t].output;
    if(actual.length!==expected.length||expected.some((s,i)=>s!==actual[i])){feedback='Not quite. For this input, expected output is:\n'+expected.join('\n')+'\nCheck your conditions, indentation, and message spelling.';show();return;}
    checked[step].add(t);feedback=checked[step].size===l.tests.length?'All test runs match! Answer the understanding question to complete this lesson.':'This test matches! '+checked[step].size+' of '+l.tests.length+' checked. Run the same code with another listed input.';show();
  }
  try{const s=sessionStorage.getItem(storageKey);if(s)restore(JSON.parse(s));}catch{}
  window.addEventListener('pagehide',save);
  if(new URLSearchParams(location.search).get('playground')!=='1')el('tutorial-toggle').click();
})();
