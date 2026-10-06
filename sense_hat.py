"""Educational Sense HAT implementation for the browser; no hardware access."""
import asyncio, inspect, json, math, time
from collections import namedtuple
from js import emitPixels, emitRunState

ACTION_PRESSED='pressed'
ACTION_HELD='held'
ACTION_RELEASED='released'
DIRECTION_UP='up'
DIRECTION_DOWN='down'
DIRECTION_LEFT='left'
DIRECTION_RIGHT='right'
DIRECTION_MIDDLE='middle'
InputEvent=namedtuple('InputEvent','timestamp direction action')
_state=dict(temperature=21,humidity=45,pressure=1013,pitch=0,roll=0,yaw=0,accel_x=0,accel_y=0,accel_z=1)
_pixels=[[0,0,0] for _ in range(64)]
_sticks=[]
_rotation=0
_low=False

# Compact 5 by 7 font. Lowercase uses the corresponding uppercase glyph.
_font={
'A':'01110 10001 10001 11111 10001 10001 10001','B':'11110 10001 10001 11110 10001 10001 11110','C':'01111 10000 10000 10000 10000 10000 01111','D':'11110 10001 10001 10001 10001 10001 11110','E':'11111 10000 10000 11110 10000 10000 11111','F':'11111 10000 10000 11110 10000 10000 10000','G':'01111 10000 10000 10111 10001 10001 01111','H':'10001 10001 10001 11111 10001 10001 10001','I':'11111 00100 00100 00100 00100 00100 11111','J':'00111 00010 00010 00010 10010 10010 01100','K':'10001 10010 10100 11000 10100 10010 10001','L':'10000 10000 10000 10000 10000 10000 11111','M':'10001 11011 10101 10101 10001 10001 10001','N':'10001 11001 10101 10011 10001 10001 10001','O':'01110 10001 10001 10001 10001 10001 01110','P':'11110 10001 10001 11110 10000 10000 10000','Q':'01110 10001 10001 10001 10101 10010 01101','R':'11110 10001 10001 11110 10100 10010 10001','S':'01111 10000 10000 01110 00001 00001 11110','T':'11111 00100 00100 00100 00100 00100 00100','U':'10001 10001 10001 10001 10001 10001 01110','V':'10001 10001 10001 10001 10001 01010 00100','W':'10001 10001 10001 10101 10101 10101 01010','X':'10001 10001 01010 00100 01010 10001 10001','Y':'10001 10001 01010 00100 00100 00100 00100','Z':'11111 00001 00010 00100 01000 10000 11111',
'0':'01110 10001 10011 10101 11001 10001 01110','1':'00100 01100 00100 00100 00100 00100 01110','2':'01110 10001 00001 00010 00100 01000 11111','3':'11110 00001 00001 01110 00001 00001 11110','4':'00010 00110 01010 10010 11111 00010 00010','5':'11111 10000 10000 11110 00001 00001 11110','6':'01110 10000 10000 11110 10001 10001 01110','7':'11111 00001 00010 00100 01000 01000 01000','8':'01110 10001 10001 01110 10001 10001 01110','9':'01110 10001 10001 01111 00001 00001 01110',
'!':'00100 00100 00100 00100 00100 00000 00100','?':'01110 10001 00001 00010 00100 00000 00100','.':'00000 00000 00000 00000 00000 00100 00100',',':'00000 00000 00000 00000 00100 00100 01000',':':'00000 00100 00100 00000 00100 00100 00000','-':'00000 00000 00000 11111 00000 00000 00000','+':'00000 00100 00100 11111 00100 00100 00000','/':'00001 00010 00010 00100 01000 01000 10000',' ':'00000 00000 00000 00000 00000 00000 00000'}

def _colour(c):
    c=list(c)
    if len(c)!=3 or any(not isinstance(v,int) or v<0 or v>255 for v in c):
        raise ValueError('Colour must be three integers from 0 to 255.')
    return c
def _show():
    p=[c[:] for c in _pixels]
    for _ in range(_rotation//90): p=[p[(7-x)*8+y] for y in range(8) for x in range(8)]
    emitPixels(json.dumps(p),_low,_rotation)
def _clear():
    _pixels[:]=[[0,0,0] for _ in range(64)]
    _show()
def _reset():
    global _rotation,_low
    _sticks.clear(); _rotation=0; _low=False
def _event(direction,action):
    event=InputEvent(time.time(),direction,action)
    for stick in _sticks:
        stick._events.append(event);stick._pending.append(event)
        stick._events[:]=stick._events[-256:];stick._pending[:]=stick._pending[-256:]
def _has_callbacks():
    return any(any(callable(getattr(s,'direction_'+d)) for d in ('up','down','left','right','middle','any')) for s in _sticks)
async def _dispatch():
    for stick in list(_sticks):
        pending=stick._pending[:];stick._pending.clear()
        for event in pending:
            for d in (event.direction,'any'):
                fn=getattr(stick,'direction_'+d)
                if callable(fn):
                    emitRunState('Running…')
                    try: inspect.signature(fn).bind(event); args=(event,)
                    except TypeError: args=()
                    result=fn(*args)
                    if inspect.isawaitable(result): await result

class SenseStick:
    def __init__(self):
        self._events=[];self._pending=[]
        for d in ('up','down','left','right','middle','any'): setattr(self,'direction_'+d,None)
        _sticks.append(self)
    def get_events(self):
        events=self._events[:];self._events.clear();return events
    async def wait_for_event(self,emptybuffer=False):
        if emptybuffer: self._events.clear()
        emitRunState('Waiting for joystick…')
        try:
            while not self._events: await asyncio.sleep(.01)
            return self._events.pop(0)
        finally:
            emitRunState('Running…')

class SenseHat:
    def __init__(self,*args,**kwargs): self.stick=SenseStick()
    def clear(self,*args):
        c=_colour(args[0] if len(args)==1 else args) if args else [0,0,0]
        _pixels[:]=[c[:] for _ in range(64)];_show()
    def set_pixels(self,pixel_list):
        if len(pixel_list)!=64: raise ValueError('set_pixels needs exactly 64 RGB colours.')
        _pixels[:]=[_colour(c) for c in pixel_list];_show()
    def get_pixels(self): return [c[:] for c in _pixels]
    def set_pixel(self,x,y,*args):
        self._xy(x,y);_pixels[y*8+x]=_colour(args[0] if len(args)==1 else args);_show()
    def get_pixel(self,x,y): self._xy(x,y);return _pixels[y*8+x][:]
    def _xy(self,x,y):
        if not isinstance(x,int) or not isinstance(y,int) or not 0<=x<8 or not 0<=y<8: raise ValueError('Pixel coordinates must be integers from 0 to 7.')
    def set_rotation(self,r=0,redraw=True):
        global _rotation
        if r not in (0,90,180,270): raise ValueError('Rotation must be 0, 90, 180 or 270.')
        _rotation=r
        if redraw: _show()
    rotation=property(lambda self:_rotation,set_rotation)
    def _set_low(self,value):
        global _low
        _low=bool(value);_show()
    low_light=property(lambda self:_low,_set_low)
    def flip_h(self,redraw=True):
        p=[_pixels[y*8+7-x][:] for y in range(8) for x in range(8)]
        if redraw: self.set_pixels(p)
        return p
    def flip_v(self,redraw=True):
        p=[_pixels[(7-y)*8+x][:] for y in range(8) for x in range(8)]
        if redraw: self.set_pixels(p)
        return p
    def show_letter(self,s,text_colour=[255,255,255],back_colour=[0,0,0]):
        if len(s)!=1: raise ValueError('show_letter needs a single character.')
        fg,bg=_colour(text_colour),_colour(back_colour)
        rows=_font.get(s.upper(),_font['?']).split()
        self.set_pixels([fg if y<7 and 1<=x<6 and rows[y][x-1]=='1' else bg for y in range(8) for x in range(8)])
    async def show_message(self,text_string,scroll_speed=.1,text_colour=[255,255,255],back_colour=[0,0,0]):
        if scroll_speed<0: raise ValueError('Scroll speed must not be negative.')
        fg,bg=_colour(text_colour),_colour(back_colour)
        columns=[[0]*8 for _ in range(8)]
        for c in str(text_string):
            rows=_font.get(c.upper(),_font['?']).split()
            columns += [[int(rows[y][x]) if y<7 else 0 for y in range(8)] for x in range(5)]+[[0]*8]
        columns += [[0]*8 for _ in range(8)]
        for offset in range(len(columns)-7):
            self.set_pixels([fg if columns[offset+x][y] else bg for y in range(8) for x in range(8)])
            await asyncio.sleep(max(.001,scroll_speed));await _dispatch()
    def get_temperature(self): return _state['temperature']
    get_temperature_from_humidity=get_temperature
    get_temperature_from_pressure=get_temperature
    temperature=property(get_temperature)
    temp=property(get_temperature)
    def get_humidity(self): return _state['humidity']
    humidity=property(get_humidity)
    def get_pressure(self): return _state['pressure']
    pressure=property(get_pressure)
    def get_orientation_degrees(self): return {k:_state[k] for k in ('pitch','roll','yaw')}
    get_orientation=get_orientation_degrees
    orientation=property(get_orientation)
    def get_orientation_radians(self): return {k:math.radians(v) for k,v in self.get_orientation().items()}
    orientation_radians=property(get_orientation_radians)
    def get_compass(self): return _state['yaw']
    compass=property(get_compass)
    def get_accelerometer_raw(self):
        return {axis:float(_state['accel_'+axis]) for axis in ('x','y','z')}
    accelerometer_raw=property(get_accelerometer_raw)
    def get_gyroscope_raw(self): return dict(x=0.0,y=0.0,z=0.0)
    gyro_raw=gyroscope_raw=property(get_gyroscope_raw)
    get_gyroscope=get_orientation
    get_accelerometer=get_orientation
    gyro=gyroscope=property(get_gyroscope)
    accel=accelerometer=property(get_accelerometer)
    def get_compass_raw(self):
        a=math.radians(_state['yaw']);return dict(x=40*math.cos(a),y=40*math.sin(a),z=0.0)
    compass_raw=property(get_compass_raw)
    def set_imu_config(self,compass_enabled,gyro_enabled,accel_enabled): pass
    def load_image(self,*args,**kwargs): raise NotImplementedError('Image files are not supported. Use set_pixels instead.')

import sys
sys.modules['sense_emu']=sys.modules[__name__]
