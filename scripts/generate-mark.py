import math
P0=(311.0,124.0); P1=(486.0,240.0); P2=(604.0,378.0); P3=(274.0,482.0)
def bez(t):
    u=1-t
    return (u**3*P0[0]+3*u*u*t*P1[0]+3*u*t*t*P2[0]+t**3*P3[0],
            u**3*P0[1]+3*u*u*t*P1[1]+3*u*t*t*P2[1]+t**3*P3[1])
def dbez(t):
    u=1-t
    return (3*u*u*(P1[0]-P0[0])+6*u*t*(P2[0]-P1[0])+3*t*t*(P3[0]-P2[0]),
            3*u*u*(P1[1]-P0[1])+6*u*t*(P2[1]-P1[1])+3*t*t*(P3[1]-P2[1]))
A,B,H=1.10,0.45,30.0
tmax=A/(A+B); norm=(tmax**A)*((1-tmax)**B)
halfw=lambda t: H*(t**A)*((1-t)**B)/norm
N=240; left=[]; right=[]
for i in range(N+1):
    t=0.998*(i/N); x,y=bez(t); dx,dy=dbez(t)
    Ln=math.hypot(dx,dy) or 1e-9
    nx,ny=-dy/Ln,dx/Ln; wv=halfw(t)
    left.append((x+nx*wv,y+ny*wv)); right.append((x-nx*wv,y-ny*wv))
fmt=lambda p:" ".join("%.1f,%.1f"%q for q in p)
open('/tmp/w/left.txt','w').write("M "+fmt(right)+" "+fmt(list(reversed(left)))+" Z")
mir=lambda pts:[(1000.0-x,y) for x,y in pts]
open('/tmp/w/right.txt','w').write("M "+fmt(mir(right))+" "+fmt(mir(list(reversed(left))))+" Z")
print("regenerated", len(open('/tmp/w/left.txt').read()), "chars")
