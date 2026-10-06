import ast, asyncio, inspect, time
import sense_hat
import builtins
from js import requestInput, emitRunState

async def _input(prompt=''):
    return str(await requestInput(str(prompt)))
builtins.input = _input

_original_sleep = time.sleep
async def _sleep(seconds):
    if seconds < 0: raise ValueError('sleep length must be non-negative')
    await asyncio.sleep(seconds)
time.sleep = _sleep

async def _call(fn, *args, **kwargs):
    value = fn(*args, **kwargs)
    if inspect.isawaitable(value): return await value
    return value

async def _tick():
    await asyncio.sleep(0.001)
    await sense_hat._dispatch()

class Responsive(ast.NodeTransformer):
    def __init__(self): self.synchronous = 0
    def visit_FunctionDef(self, node):
        if node.name.startswith('__'):
            return node
        self.generic_visit(node)
        return ast.copy_location(ast.AsyncFunctionDef(name=node.name,args=node.args,body=node.body,decorator_list=node.decorator_list,returns=node.returns,type_comment=node.type_comment),node)
    def visit_Call(self,node):
        self.generic_visit(node)
        return ast.copy_location(ast.Await(ast.Call(func=ast.Name(id='_call',ctx=ast.Load()),args=[node.func]+node.args,keywords=node.keywords)),node)
    def visit_For(self,node):
        self.generic_visit(node)
        node.body.insert(0,ast.Expr(ast.Await(ast.Call(func=ast.Name(id='_tick',ctx=ast.Load()),args=[],keywords=[]))))
        return node
    visit_While=visit_For
    def visit_Lambda(self,node): return node
    def visit_ClassDef(self,node):
        # Class bodies execute synchronously; adapt regular methods only.
        node.body=[self.visit(n) if isinstance(n,ast.FunctionDef) else n for n in node.body]
        return node

_env={'__name__':'__main__','_call':_call,'_tick':_tick}

async def run(source, shell=False):
    global _env
    if not shell:
        sense_hat._reset()
        _env={'__name__':'__main__','_call':_call,'_tick':_tick}
    tree=ast.parse(source,filename='main.py')
    if shell and tree.body and isinstance(tree.body[-1],ast.Expr):
        tree.body[-1]=ast.copy_location(ast.Expr(ast.Call(func=ast.Name(id='_display',ctx=ast.Load()),args=[tree.body[-1].value],keywords=[])),tree.body[-1])
    if any(isinstance(n,(ast.Yield,ast.YieldFrom,ast.AsyncFunctionDef,ast.Await)) for n in ast.walk(tree)):
        raise NotImplementedError('Generators and explicit async/await are not supported by this simulator.')
    tree=ast.fix_missing_locations(Responsive().visit(tree))
    _env['_display']=lambda value: print(repr(value)) if value is not None else None
    result=eval(compile(tree,'main.py','exec',flags=ast.PyCF_ALLOW_TOP_LEVEL_AWAIT),_env)
    if inspect.isawaitable(result): await result
    if not shell:
        while sense_hat._has_callbacks():
            emitRunState('Waiting for joystick events…')
            await _tick()
        # No remaining event listeners: return to the worker and finish this run.
        sense_hat._sticks.clear()
