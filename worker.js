postMessage({type:'progress',text:'Starting Python…'});
importScripts('pyodide.js');
let py,hat,inputResolve,busy=false,lastRunState='';
self.emitRunState=text=>{if(text!==lastRunState){lastRunState=text;postMessage({type:'run-state',text})}};
self.emitPixels=(pixels,low,rotation)=>{postMessage({type:'pixels',pixels:JSON.parse(pixels),low});postMessage({type:'rotation',rotation})};
self.requestInput=prompt=>new Promise(resolve=>{inputResolve=resolve;self.emitRunState('Waiting for input…');postMessage({type:'input',prompt})});
const initialized=(async()=>{
  try{
    py=await loadPyodide({indexURL:new URL('./',self.location.href).href});
    postMessage({type:'progress',text:'Preparing Sense HAT…'});
    py.setStdout({batched:text=>postMessage({type:'out',text})});
    py.setStderr({batched:text=>postMessage({type:'out',text})});
    for(const file of ['sense_hat.py','runner.py'])py.FS.writeFile(file,await(await fetch(file)).text());
    await py.runPythonAsync('import sense_hat, runner');hat=py.pyimport('sense_hat');
    postMessage({type:'ready'});
  }catch(e){postMessage({type:'fatal',text:'Could not load Python. Reload to retry. '+e.message})}
})();
onmessage=async({data:m})=>{
  await initialized;if(!hat)return;
  if(m.state){const data=py.toPy(m.state);hat._state.update(data);data.destroy()}
  if(m.type==='input-response'&&inputResolve){self.emitRunState('Running…');inputResolve(m.value);inputResolve=null}
  if(m.type==='joystick')hat._event(m.direction,m.action);
  if(m.type==='clear')hat._clear();
  if(m.type==='run'||m.type==='shell'){
    if(busy)return;
    busy=true;lastRunState='';
    try{
      py.globals.set('_source',m.code);py.globals.set('_shell',m.type==='shell');
      await py.runPythonAsync(`
import traceback
try:
    await runner.run(_source, shell=_shell)
except BaseException as error:
    if isinstance(error, SyntaxError):
        print(f"{type(error).__name__} on line {error.lineno}: {error.msg}")
        if error.text:
            print(error.text.rstrip())
            print(' ' * max(0, (error.offset or 1)-1) + '^')
    else:
        frames = traceback.extract_tb(error.__traceback__)
        user_frames = [f for f in frames if f.filename == 'main.py']
        location = f' on line {user_frames[-1].lineno}' if user_frames else ''
        print(f'{type(error).__name__}{location}: {error}')
    _failed = True
else:
    _failed = False
`);
      postMessage({type:'done',error:py.globals.get('_failed')});
    }catch(e){postMessage({type:'out',text:e.message});postMessage({type:'done',error:true})}
    finally{busy=false;inputResolve=null}
  }
};

