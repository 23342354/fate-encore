"""서곡 배경 합성 — 다다미방 탁자 위에 봉투와 초대장을 원근에 맞춰 얹는다.

저장소 맨 위에서 실행:  python3 tools/compose-room.py   (Pillow · numpy 필요)
만드는 그림
  assets/img/story/room-envelope.jpg  봉인된 봉투가 놓인 방
  assets/img/story/room-letter.jpg    열린 봉투와 꺼낸 초대장이 놓인 방
  assets/img/story/envelope-desk.jpg  봉투 확대 장면의 흐린 탁자
봉투 위치는 맨 아래 rect_cm(가로cm, 세로cm, 폭, 높이, 회전각) 으로 바꾼다.
탁자 상판은 가로 90cm x 세로 60cm 로 잡았다.
"""
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageChops
BASE="assets/img/story/window-lit.jpg"   # 불 켜진 다다미방 (같은 그림)
OUT="assets/img/story/"
base=Image.open(BASE).convert('RGB')
W,H=base.size

def homography(src, dst):
    A=[]
    for (x,y),(u,v) in zip(src,dst):
        A.append([x,y,1,0,0,0,-u*x,-u*y,-u]); A.append([0,0,0,x,y,1,-v*x,-v*y,-v])
    _,_,Vt=np.linalg.svd(np.array(A,float)); h=Vt[-1].reshape(3,3); return h/h[2,2]
def apply(h,pts):
    out=[]
    for x,y in pts:
        p=h@[x,y,1]; out.append((p[0]/p[2],p[1]/p[2]))
    return out

# 탁자 상판 (cm 평면, 가로 90 x 세로 60) → 그림 좌표
TABLE_IMG=[(475,486),(666,486),(740,548),(402,548)]   # 뒤-왼, 뒤-오, 앞-오, 앞-왼
TABLE_CM =[(0,0),(90,0),(90,60),(0,60)]
Hc=homography(TABLE_CM,TABLE_IMG)

def rect_cm(cx,cy,w,h,deg):
    r=np.radians(deg); c,s=np.cos(r),np.sin(r)
    pts=[(-w/2,-h/2),(w/2,-h/2),(w/2,h/2),(-w/2,h/2)]
    return [(cx+x*c-y*s, cy+x*s+y*c) for x,y in pts]

S=4  # 텍스처 배율

def envelope_tex(open_=False, w=480, h=330):
    t=Image.new('RGBA',(w,h),(0,0,0,0)); d=ImageDraw.Draw(t)
    # 몸통
    for y in range(h):
        k=y/h; col=(int(236-10*k),int(226-12*k),int(200-14*k),255)
        d.line([(0,y),(w,y)],fill=col)
    d.rectangle([0,0,w-1,h-1],outline=(176,158,120,255),width=3)
    # 아래쪽 접힌 면의 선
    d.line([(0,h),(w*0.5,h*0.52)],fill=(196,180,146,255),width=3)
    d.line([(w,h),(w*0.5,h*0.52)],fill=(196,180,146,255),width=3)
    if not open_:
        d.polygon([(0,0),(w,0),(w*0.5,h*0.58)],fill=(226,214,184,255),outline=(176,158,120,255))
        # 금박 실선
        d.line([(w*0.3,h*0.8),(w*0.7,h*0.8)],fill=(196,156,70,255),width=5)
        # 밀랍 봉인
        d.ellipse([w*0.5-22,h*0.58-22,w*0.5+22,h*0.58+22],fill=(150,30,34,255))
        d.ellipse([w*0.5-14,h*0.58-14,w*0.5+14,h*0.58+14],outline=(190,70,70,255),width=3)
    return t

def sheet_tex(w=420, h=560):
    t=Image.new('RGBA',(w,h),(250,246,234,255)); d=ImageDraw.Draw(t)
    d.rectangle([0,0,w-1,h-1],outline=(190,172,130,255),width=3)
    d.rectangle([16,16,w-17,h-17],outline=(200,172,110,255),width=2)
    for i,y in enumerate(range(118,h-90,30)):
        L=(w-120)*(0.62 if i%4==3 else 0.92)
        d.line([(60,y),(60+L,y)],fill=(178,170,154,255),width=5)
    d.line([(w*0.3,64),(w*0.7,64)],fill=(196,156,70,255),width=7)
    return t

SS=4
def paste_on_table(img, tex, quad_cm, shadow=True, shadow_off=(1.2,1.6), blur=5, alpha=0.5, glare=0.16):
    quad=apply(Hc,quad_cm)
    bq=[(x*SS,y*SS) for x,y in quad]
    tw,th=tex.size
    hinv=homography(bq,[(0,0),(tw,0),(tw,th),(0,th)])
    layer=tex.transform((W*SS,H*SS),Image.PERSPECTIVE,hinv.flatten()[:8],Image.BICUBIC)
    layer=layer.resize((W,H),Image.LANCZOS)
    # 천장 조명의 반사 — 종이도 탁자처럼 하얗게 뜬다
    rgb,a=layer.convert('RGB'),layer.getchannel('A')
    rgb=Image.blend(rgb,Image.new('RGB',(W,H),(255,252,244)),glare)
    out=img.copy()
    if shadow:
        sq=apply(Hc,[(x+shadow_off[0],y+shadow_off[1]) for x,y in quad_cm])
        sh=Image.new('L',(W*SS,H*SS),0); ImageDraw.Draw(sh).polygon([(x*SS,y*SS) for x,y in sq],fill=int(255*alpha))
        sh=sh.resize((W,H),Image.LANCZOS).filter(ImageFilter.GaussianBlur(blur*0.6))
        out=Image.composite(Image.new('RGB',(W,H),(70,60,46)),out,sh)
    out.paste(rgb,(0,0),a)
    return out, quad

# ── 1. 방 — 탁자 위의 봉투
env=envelope_tex()
room,q=paste_on_table(base, env, rect_cm(53,30,26,18,-12))
room.save(OUT+"room-envelope.jpg",quality=88,optimize=True,progressive=True)
print("room envelope quad",[tuple(round(v) for v in p) for p in q])

# ── 2. 다시, 초대장이 놓인 방 — 열린 봉투와 꺼낸 초대장
openenv=envelope_tex(open_=True)
r2,_=paste_on_table(base, openenv, rect_cm(29,31,26,18,8))
r2,q2=paste_on_table(r2, sheet_tex(), rect_cm(60,30,19,26,-7), shadow_off=(1,1.4), blur=4, alpha=.45)
r2.save(OUT+"room-letter.jpg",quality=88,optimize=True,progressive=True)

# ── 3. 봉투 확대용 탁자 — 상판을 크게 당기고 흐리게
cx,cy=571,512; cw=258; ch=cw*2//3
crop=base.crop((cx-cw//2,cy-ch//2,cx+cw//2,cy+ch//2)).resize((1500,1000),Image.LANCZOS)
crop=crop.filter(ImageFilter.GaussianBlur(16))
# 가장자리 어둡게
vig=Image.new('L',(1500,1000),0); vd=ImageDraw.Draw(vig)
for i in range(60):
    vd.ellipse([-300+i*9,-260+i*7,1800-i*9,1260-i*7],fill=int(i*4.2))
vig=vig.filter(ImageFilter.GaussianBlur(60))
crop=Image.composite(crop,Image.new('RGB',crop.size,(30,26,20)),vig)
crop.save(OUT+"envelope-desk.jpg",quality=86,optimize=True,progressive=True)

