/* Isometric pixel-art village engine: draws into a low-res canvas that is scaled up with pixelated rendering */
(function(){
const C={
  ol:"#2e2b29", grass:"#8cc16a", grassL:"#a6d283", grassD:"#78ad58", dirt:"#a07850", dirtD:"#86603d", dirtL:"#b48b62", stone:"#9a958c",
  road:"#a9a59d", roadL:"#bdb9b1", walk:"#dcd6c8", walkD:"#c9c2b2", dash:"#f4f1e8",
  water:"#4a90c8", waterD:"#3b78ab", waterL:"#a9d3f0",
  leaf:"#4f9a48", leafL:"#79bd5a", leafLL:"#a3d77a", leafD:"#3a7634", leafDD:"#2c5c2a", trunk:"#7a5232",
  shadow:"rgba(35,45,25,.28)",
  wT:"#f6f3ea", wL:"#ece6d6", wR:"#d1c9b5", roof:"#d9614f", roofL:"#e57d6b", roofD:"#b44b3c", roofDD:"#9a3d30",
  glass:"#8fc2e3", glassL:"#d4ebf7", glassD:"#5f95bd", frame:"#f8f6f0", door:"#8b5e3c", doorD:"#6f4a2e",
  apT:"#f7f7f4", apL:"#e3ded3", apR:"#c4bdaf",
  twT:"#6fb35a", twL:"#a7c8db", twR:"#7fa8c2", twW:"#e6f2f8", twM:"#5c86a3",
  scT:"#c7ad7e", scL:"#f2e2bb", scR:"#d9c496", sand:"#e8d6a6", sandD:"#d8c391", track:"#c9755c",
  shT:"#e8e2d4", shL:"#f4f0e6", shR:"#d6cfbf", awA:"#e0a91b", awB:"#fff6dc",
  rcT:"#9fb096", rcL:"#c7d3bd", rcR:"#a3b39a",
  wdT:"#6e4a2c", wdL:"#c49a6c", wdR:"#a87f53", wdD:"#8b6643",
  panel:"#2f5d8a", panelL:"#5d8fc0", tank:"#eef2f5",
  red:"#d9534f", yellow:"#f2c230", blue:"#3b82c4", green:"#4f9a48", grey:"#9aa0a6", white:"#ffffff", pink:"#f0a3b5", purple:"#a98bd6"
};
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function setup(canvas,W,H,sky){canvas.width=W;canvas.height=H;const g=canvas.getContext("2d");g.imageSmoothingEnabled=false;g.fillStyle=sky;g.fillRect(0,0,W,H);return g;}

function Painter(g,ox,oy,tw,zs){
  const P=(x,y,z=0)=>[Math.round(ox+(x-y)*tw), Math.round(oy+(x+y)*tw/2-z*zs)];
  function poly(pts,col){
    let a=Infinity,b=-Infinity; pts.forEach(p=>{a=Math.min(a,p[1]);b=Math.max(b,p[1]);});
    g.fillStyle=col;
    for(let y=Math.floor(a);y<=Math.ceil(b);y++){
      const yc=y+.5, xs=[];
      for(let i=0;i<pts.length;i++){const p=pts[i],q=pts[(i+1)%pts.length];
        if((p[1]<=yc&&q[1]>yc)||(q[1]<=yc&&p[1]>yc)) xs.push(p[0]+(yc-p[1])*(q[0]-p[0])/(q[1]-p[1]));}
      xs.sort((m,n)=>m-n);
      for(let k=0;k+1<xs.length;k+=2){const x0=Math.round(xs[k]),x1=Math.round(xs[k+1]); if(x1>x0) g.fillRect(x0,y,x1-x0,1);}
    }
  }
  function line(p,q,col){g.fillStyle=col; let [x0,y0]=p,[x1,y1]=q; const dx=Math.abs(x1-x0),sx=x0<x1?1:-1,dy=-Math.abs(y1-y0),sy=y0<y1?1:-1; let e=dx+dy;
    for(let n=0;n<3000;n++){g.fillRect(x0,y0,1,1); if(x0===x1&&y0===y1)break; const e2=2*e; if(e2>=dy){e+=dy;x0+=sx;} if(e2<=dx){e+=dx;y0+=sy;}}}
  const Q=(pts,col)=>poly(pts.map(p=>P(...p)),col);
  const L=(a,b,col=C.ol)=>line(P(...a),P(...b),col);
  const dot=(x,y,z,col,w=1,h=1)=>{const p=P(x,y,z); g.fillStyle=col; g.fillRect(p[0],p[1],w,h);};
  const flat=(x0,y0,x1,y1,z,col)=>Q([[x0,y0,z],[x1,y0,z],[x1,y1,z],[x0,y1,z]],col);
  const shadow=(x0,y0,x1,y1,h)=>{const s=Math.min(h/14,4); Q([[x0,y0,0],[x1+s,y0,0],[x1+s,y1,0],[x0,y1,0]],C.shadow);};
  function box(x0,y0,x1,y1,z0,h,top,left,right,o={}){
    const zt=z0+h;
    Q([[x0,y1,z0],[x1,y1,z0],[x1,y1,zt],[x0,y1,zt]],left);
    Q([[x1,y0,z0],[x1,y1,z0],[x1,y1,zt],[x1,y0,zt]],right);
    Q([[x0,y0,zt],[x1,y0,zt],[x1,y1,zt],[x0,y1,zt]],top);
    if(o.hl!==false){ const e=1/zs; L([x0,y1,zt-e],[x1,y1,zt-e],o.hl||"rgba(255,255,255,.55)"); }
    if(o.ol!==false){L([x0,y0,zt],[x1,y0,zt]);L([x1,y0,zt],[x1,y1,zt]);L([x1,y1,zt],[x0,y1,zt]);L([x0,y1,zt],[x0,y0,zt]);
      L([x0,y1,z0],[x1,y1,z0]);L([x1,y1,z0],[x1,y0,z0]);L([x0,y1,z0],[x0,y1,zt]);L([x1,y1,z0],[x1,y1,zt]);L([x1,y0,z0],[x1,y0,zt]);}
  }
  // windows with frame, glass, highlight and sill
  function winY(x0,x1,y,z0,z1,glass=C.glass,frame=C.frame){
    Q([[x0,y,z0],[x1,y,z0],[x1,y,z1],[x0,y,z1]],frame);
    const ex=(x1-x0)*.15, ez=(z1-z0)*.14;
    Q([[x0+ex,y,z0+ez],[x1-ex,y,z0+ez],[x1-ex,y,z1-ez],[x0+ex,y,z1-ez]],glass);
    Q([[x0+ex,y,z1-ez-(z1-z0)*.25],[x0+ex+(x1-x0)*.25,y,z1-ez],[x0+ex,y,z1-ez]],C.glassL);
    L([x0,y,z0],[x1,y,z0],"rgba(0,0,0,.28)");
  }
  function winX(x,y0,y1,z0,z1,glass=C.glassD,frame="#ddd6c6"){
    Q([[x,y0,z0],[x,y1,z0],[x,y1,z1],[x,y0,z1]],frame);
    const ey=(y1-y0)*.15, ez=(z1-z0)*.14;
    Q([[x,y0+ey,z0+ez],[x,y1-ey,z0+ez],[x,y1-ey,z1-ez],[x,y0+ey,z1-ez]],glass);
    L([x,y0,z0],[x,y1,z0],"rgba(0,0,0,.28)");
  }
  function doorY(x0,x1,y,h,col=C.door){Q([[x0,y,0],[x1,y,0],[x1,y,h],[x0,y,h]],col); Q([[x0+(x1-x0)*.15,y,h*.12],[x1-(x1-x0)*.15,y,h*.12],[x1-(x1-x0)*.15,y,h*.88],[x0+(x1-x0)*.15,y,h*.88]],C.doorD); dot(x1-(x1-x0)*.28,y,h*.5,C.yellow);}
  function doorX(x,y0,y1,h,col=C.door){Q([[x,y0,0],[x,y1,0],[x,y1,h],[x,y0,h]],col); Q([[x,y0+(y1-y0)*.15,h*.12],[x,y1-(y1-y0)*.15,h*.12],[x,y1-(y1-y0)*.15,h*.88],[x,y0+(y1-y0)*.15,h*.88]],C.doorD);}
  function house(x0,y0,x1,y1,h,rh,w,roofC,roofD,roofL){
    if(!w[3]) shadow(x0,y0,x1,y1,h+rh);
    box(x0,y0,x1,y1,0,h,w[0],w[1],w[2],{hl:false});
    const m=(y0+y1)/2, zt=h, zr=h+rh, e=.4;
    Q([[x0-e,y0-e,zt],[x1+e,y0-e,zt],[x1+e,m,zr],[x0-e,m,zr]],roofD);
    Q([[x1,y0,zt],[x1,y1,zt],[x1,m,zr]],w[2]);
    Q([[x0-e,m,zr],[x1+e,m,zr],[x1+e,y1+e,zt],[x0-e,y1+e,zt]],roofC);
    // roof tile rows
    for(let t=.2;t<1;t+=.2){const yy=m+(y1+e-m)*t, zz=zr-(zr-zt)*t; L([x0-e,yy,zz],[x1+e,yy,zz],roofD);}
    for(let x=x0;x<x1+e;x+=.9){ L([x,m,zr],[x,y1+e,zt],"rgba(0,0,0,.08)"); }
    L([x0-e,m,zr],[x1+e,m,zr],roofL||C.roofL);
    L([x1+e,m,zr],[x1+e,y1+e,zt]);L([x1+e,y1+e,zt],[x0-e,y1+e,zt]);L([x0-e,y1+e,zt],[x0-e,m,zr]);
    L([x1+e,m,zr],[x1+e,y0-e,zt]);L([x1,y0,zt],[x1,m,zr]);
    L([x0,y1,0],[x1,y1,0]);L([x1,y1,0],[x1,y0,0]);L([x0,y1,0],[x0,y1,zt]);L([x1,y1,0],[x1,y1,zt]);L([x1,y0,0],[x1,y0,zt]);
    return {m,zt,zr,e};
  }
  function tree(x,y,z=0,r=4,kind=0){
    r=Math.round(r*zs);
    const [px,py]=P(x,y,z), cy=py-Math.round(3*zs)-r;
    if(z===0){ g.fillStyle=C.shadow; for(let dy=-2;dy<=2;dy++){const w=Math.round(r*1.3*Math.sqrt(1-dy*dy/5)); g.fillRect(px+2-w+Math.round(r*.5),py+dy,w*2,1);} }
    g.fillStyle=C.trunk; g.fillRect(px-1,cy+r-1,2,py-cy-r+1); g.fillStyle="#5e3f27"; g.fillRect(px,cy+r-1,1,py-cy-r+1);
    const pal = kind===3? ["#c7849a","#e8a9bd","#f6c9d6","#fde8ee"] : kind===1? ["#2f6b3a","#3f8a4a","#5aa85a","#86c76f"] : kind===2? ["#8a5a2a","#c97a2e","#e5a23a","#f3cf6a"] : [C.leafDD,C.leafD,C.leaf,C.leafL];
    for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){
      const d=dx*dx+dy*dy; if(d>r*r+r*.6) continue;
      const s=(dx+dy)/r + (d/(r*r))*.6;
      let c = s>1.0?pal[0]: s>.2?pal[1]: s>-.6?pal[2]:pal[3];
      if(((dx*7+dy*13)&7)===0 && c!==pal[0]) c=pal[Math.max(0,pal.indexOf(c)-1)];
      g.fillStyle=c; g.fillRect(px+dx,cy+dy,1,1);}
    g.fillStyle=pal[3]; g.fillRect(px-Math.round(r*.45),cy-Math.round(r*.45),2,1);
  }
  function bush(x,y,col=C.leaf){const [px,py]=P(x,y,0); const r=Math.round(1.6*zs);
    for(let dy=-r;dy<=0;dy++)for(let dx=-r*1.4;dx<=r*1.4;dx++){ if(dx*dx/1.96+dy*dy>r*r) continue; g.fillStyle=(dx+dy*2< -r)?C.leafL:(dy>-1?C.leafD:col); g.fillRect(px+Math.round(dx),py+dy-1,1,1);} }
  function flowers(x0,y0,x1,y1,n,seed){const R=rng(seed); const cs=[C.red,C.yellow,C.white,C.pink,C.purple]; for(let i=0;i<n;i++){dot(x0+R()*(x1-x0),y0+R()*(y1-y0),0,cs[Math.floor(R()*cs.length)]);}}
  function car(x,y,dir,col){ // dir 'x' or 'y'
    const [a,b]= dir==='x'?[1.6,.8]:[.8,1.6];
    shadow(x,y,x+a,y+b,3);
    box(x,y,x+a,y+b,.6,2.2,col,col,"rgba(0,0,0,.0)",{hl:false});
    Q([[x+a,y,.6],[x+a,y+b,.6],[x+a,y+b,2.8],[x+a,y,2.8]],"rgba(0,0,0,.25)");
    const ca=dir==='x'?[.35,a-.45,.08,b-.08]:[.08,a-.08,.35,b-.45];
    box(x+ca[0],y+ca[2],x+ca[1],y+ca[3],2.8,1.8,C.glassL,C.glass,C.glassD,{hl:false});
    dot(x+.2,y+b,0.6,C.ol,2,1); dot(x+a-.4,y+b,0.6,C.ol,2,1);
  }
  function lamp(x,y,h){const [px,py]=P(x,y,0),[,ty]=P(x,y,h); g.fillStyle="#4a4d52"; g.fillRect(px,ty,1,py-ty); g.fillStyle=C.yellow; g.fillRect(px-1,ty-2,3,2); g.fillStyle="#4a4d52"; g.fillRect(px-1,ty-3,3,1);}

  function pine(x,y,sz=1){const [px,py]=P(x,y,0); const H=Math.round(16*sz*zs/1.6), W=Math.round(6*sz*zs/1.6);
    g.fillStyle=C.shadow; for(let dy=-1;dy<=1;dy++) g.fillRect(px-1,py+dy,W*2,1);
    g.fillStyle="#5e3f27"; g.fillRect(px-1,py-3,2,3);
    const tiers=3; for(let t=0;t<tiers;t++){ const top=py-3-H+Math.round(t*H/4), h=Math.round(H*.5), w0=Math.round(W*(.55+t*.25));
      for(let r=0;r<h;r++){ const w=Math.round(w0*r/h)+1; for(let dx=-w;dx<=w;dx++){ g.fillStyle= dx>w*.35? "#1f4f2c" : dx<-w*.4? "#4f9a5a" : "#2f6b3a"; g.fillRect(px+dx,top+r,1,1);} } }
    g.fillStyle="#7fc27a"; g.fillRect(px-1,py-3-H+2,1,2);}
  function birch(x,y,sz=1){const [px,py]=P(x,y,0); const H=Math.round(10*sz*zs/1.6), r=Math.round(3.2*sz*zs/1.6);
    g.fillStyle=C.shadow; g.fillRect(px-1,py-1,r*2+2,2);
    g.fillStyle="#f4f1e8"; g.fillRect(px-1,py-H,2,H); g.fillStyle="#2e2b29"; for(let k=2;k<H;k+=3) g.fillRect(px-1+(k%2),py-k,1,1);
    const cy=py-H-r+2; for(let dy=-r-2;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){ if(dx*dx/(r*r)+dy*dy/((r+2)*(r+2))>1) continue; g.fillStyle=(dx+dy)>r*.5?"#6e9e3e":(dx+dy)<-r*.6?"#d4e98a":"#a8cf5e"; g.fillRect(px+dx,cy+dy,1,1);} }
  function rock(x,y,sz=1){const [px,py]=P(x,y,0); const w=Math.round(3*sz*zs/1.6)+1; for(let dy=-w+1;dy<=0;dy++){const ww=w-Math.abs(dy)/2; for(let dx=-ww;dx<=ww;dx++){g.fillStyle=dy===-w+1||dx<-ww+1?"#c9c4ba":dx>ww-1.5?"#7f7a72":"#a9a49a"; g.fillRect(px+Math.round(dx),py+dy,1,1);}}}
  function stump(x,y){const [px,py]=P(x,y,0); g.fillStyle="#7a5232"; g.fillRect(px-2,py-3,5,3); g.fillStyle="#d9b07a"; g.fillRect(px-2,py-4,5,1); g.fillStyle="#a87f53"; g.fillRect(px,py-4,1,1);}
  function mushroom(x,y){const [px,py]=P(x,y,0); g.fillStyle="#f4f1e8"; g.fillRect(px,py-2,1,2); g.fillStyle=C.red; g.fillRect(px-1,py-3,3,1); g.fillStyle=C.white; g.fillRect(px,py-3,1,1);}
  function person(x,y,shirt,hair="#3a2a20"){const [px,py]=P(x,y,0); g.fillStyle=C.shadow; g.fillRect(px-1,py,4,1); g.fillStyle="#3b3f46"; g.fillRect(px,py-3,1,3); g.fillRect(px+1,py-3,1,3); g.fillStyle=shirt; g.fillRect(px-1,py-7,4,4); g.fillStyle="#f2c7a5"; g.fillRect(px,py-9,2,2); g.fillStyle=hair; g.fillRect(px,py-10,2,1);}
  function bench(x,y){box(x,y,x+1.4,y+.5,1.2,.6,"#c49a6c","#a87f53","#8b6643",{hl:false}); box(x,y,x+1.4,y+.15,1.8,1.4,"#c49a6c","#a87f53","#8b6643",{hl:false});}
  function fence(x0,y0,x1,y1,col="#f2efe7"){const n=Math.max(1,Math.round(Math.hypot(x1-x0,y1-y0)/.5)); for(let i=0;i<=n;i++){const x=x0+(x1-x0)*i/n,y=y0+(y1-y0)*i/n; L([x,y,0],[x,y,2.6],col);} L([x0,y0,2.2],[x1,y1,2.2],"#cfc8b8"); L([x0,y0,1],[x1,y1,1],"#cfc8b8");}
  function path(pts,w,col,edge){ for(let i=0;i+1<pts.length;i++){const [ax,ay]=pts[i],[bx,by]=pts[i+1]; const dx=bx-ax,dy=by-ay,l=Math.hypot(dx,dy)||1,nx=-dy/l*w/2,ny=dx/l*w/2;
      Q([[ax+nx,ay+ny,0],[bx+nx,by+ny,0],[bx-nx,by-ny,0],[ax-nx,ay-ny,0]],col); Q([[bx-w/2,by,0],[bx,by-w/2,0],[bx+w/2,by,0],[bx,by+w/2,0]],col);}
    if(edge){const R=rng(pts.length*31); pts.forEach((p,i)=>{if(i+1<pts.length){const [ax,ay]=p,[bx,by]=pts[i+1]; for(let t=0;t<1;t+=.25) dot(ax+(bx-ax)*t+(R()-.5)*w*.6,ay+(by-ay)*t+(R()-.5)*w*.6,0,edge,2,1);}});}}
  function stones(pts){pts.forEach(([x,y])=>{Q([[x-.25,y,0],[x,y-.25,0],[x+.25,y,0],[x,y+.25,0]],"#d8d3c8"); dot(x,y-.2,0,"#efebe3");});}
  function duck(x,y){const [px,py]=P(x,y,0); g.fillStyle=C.white; g.fillRect(px-1,py-2,3,2); g.fillRect(px+1,py-3,1,1); g.fillStyle="#e8893a"; g.fillRect(px+2,py-3,1,1);}
  function flowerbed(x0,y0,x1,y1,n,seed){flat(x0,y0,x1,y1,0,"#8a6040"); flowers(x0,y0,x1,y1,n,seed);}
  function smoke(x,y,z){[[0,0,3],[1,-4,4],[-1,-9,5],[1,-14,4]].forEach(([dx,dy,w])=>{const p=P(x,y,z); g.fillStyle="rgba(255,255,255,.85)"; g.fillRect(p[0]+dx-1,p[1]+dy-4,w,3); g.fillStyle="rgba(200,205,210,.7)"; g.fillRect(p[0]+dx-1,p[1]+dy-2,w,1);});}
  function planter(x,y,z,dir){ if(dir==='y'){ Q([[x,y,z],[x+.9,y,z],[x+.9,y+.25,z-.6],[x,y+.25,z-.6]],"#8b5e3c"); for(let i=0;i<4;i++) dot(x+.1+i*.22,y+.15,z+.4,[C.red,C.yellow,C.pink,C.red][i]); dot(x+.2,y+.15,z+1.1,C.leafL,4,1);} else { Q([[x,y,z],[x,y+.9,z],[x+.25,y+.9,z-.6],[x+.25,y,z-.6]],"#8b5e3c"); for(let i=0;i<4;i++) dot(x+.15,y+.1+i*.22,z+.4,[C.pink,C.yellow,C.red,C.purple][i]);} }
  return {P,Q,L,dot,flat,shadow,box,winY,winX,doorY,doorX,house,tree,bush,flowers,car,lamp,poly,line,g,pine,birch,rock,stump,mushroom,person,bench,fence,path,stones,duck,flowerbed,smoke,planter};
}

function clouds(g,W,list){
  list.forEach(([x,y,w])=>{ g.fillStyle="#ffffff"; g.fillRect(x,y,w,4); g.fillRect(x+3,y-3,w-10,3); g.fillRect(x+8,y-5,Math.max(6,w-22),2); g.fillStyle="#e3eef3"; g.fillRect(x,y+4,w,1); });
}

/* ---------------- village map ---------------- */
const MAP={W:680,H:470};
const MAP_PLACES=[
  {id:"home",   name:"우리 집",          at:[25.5,25.5,30], ready:true},
  {id:"apt",    name:"아파트",           at:[25.6,7.6,74]},
  {id:"school", name:"학교",             at:[10.5,25.5,36]},
  {id:"tower",  name:"큰 건물",          at:[35,5,74]},
  {id:"roofs",  name:"주택가 지붕",      at:[36.9,25,22]},
  {id:"shop",   name:"가전 매장과 수리점", at:[33.6,34.4,26]},
  {id:"recycle",name:"재활용 센터",      at:[35,13.5,22]},
  {id:"forest", name:"숲과 목공소",      at:[9,8,26]}
];
function drawMap(canvas,sky,part){
  const g=setup(canvas,MAP.W,MAP.H,part?"rgba(0,0,0,0)":sky), D=Painter(g,340,112,8,1.6);
  const {P,Q,L,dot,flat,shadow,box,winY,winX,doorY,doorX,house,tree,bush,flowers,car,lamp,pine,birch,rock,stump,mushroom,person,bench,fence,path,stones,duck,flowerbed,smoke,planter}=D;
  if(!part) clouds(g,MAP.W,MAP_CLOUDS);
  [[210,40],[222,46],[232,38],[420,22],[430,28]].forEach(([x,y])=>{g.fillStyle='#55606a'; g.fillRect(x,y,2,1); g.fillRect(x+2,y+1,1,1); g.fillRect(x+3,y,2,1);});
  // ground slab with layered soil
  box(0,0,40,40,-10,10,C.grass,C.dirt,C.dirtD,{hl:false});
  Q([[0,40,-3],[40,40,-3],[40,40,-4],[0,40,-4]],C.dirtL); Q([[40,0,-3],[40,40,-3],[40,40,-4],[40,0,-4]],"#9a7350");
  Q([[0,40,-7],[40,40,-7],[40,40,-10],[0,40,-10]],C.stone); Q([[40,0,-7],[40,40,-7],[40,40,-10],[40,0,-10]],"#7f7a72");
  L([0,40,-10],[40,40,-10]); L([40,40,-10],[40,0,-10]);
  const R=rng(7); for(let i=0;i<2600;i++){const x=R()*40,y=R()*40; dot(x,y,0,R()<.5?C.grassL:C.grassD);}
  // river with banks
  Q([[0,0,0],[3,0,0],[3,40,0],[0,40,0]],C.dirtL);
  Q([[0,0,0],[2.5,0,0],[2.5,40,0],[0,40,0]],C.water);
  Q([[0,0,0],[.8,0,0],[.8,40,0],[0,40,0]],C.waterD);
  for(let y=.5;y<40;y+=1.3){const x=.9+R()*1.2; if(!part) L([x,y,0],[x+.5,y+.25,0],C.waterL);}
  for(let y=1;y<40;y+=2.2){dot(2.8,y+R(),0,C.stone,2,1);}
  // roads, sidewalks, crosswalks
  flat(17.4,0,21.6,40,0,C.walk); flat(3,17.4,40,21.6,0,C.walk);
  flat(18,0,21,40,0,C.road); flat(3,18,40,21,0,C.road);
  for(let t=.5;t<40;t+=1){ L([17.4,t,0],[18,t,0],C.walkD); if(t>3) L([t,17.4,0],[t,18,0],C.walkD); }
  for(let t=1;t<40;t+=2.4){ if(t<16||t>22.5){flat(19.38,t,19.62,t+1.2,0,C.dash);} if((t<16||t>22.5)&&t>3) flat(t,19.38,t+1.2,19.62,0,C.dash);}
  for(let k=0;k<5;k++){ flat(18.2+k*.6,16.2,18.5+k*.6,17.3,0,C.dash); flat(18.2+k*.6,21.7,18.5+k*.6,22.8,0,C.dash); flat(16.2,18.2+k*.6,17.3,18.5+k*.6,0,C.dash); flat(21.7,18.2+k*.6,22.8,18.5+k*.6,0,C.dash);}
  box(0,17.4,3,21.6,0,1.6,C.wdL,C.wdR,C.wdD,{hl:false}); for(let y=17.6;y<21.6;y+=.5) L([0,y,1.6],[3,y,1.6],C.wdD);
  // school grounds: 마사토 field + fenced basketball court
  flat(4.6,29.2,16.6,39.4,0,"#7fb95f");
  flat(4.6,29.2,16.6,30.4,0,"#e3dccb"); for(let x=4.8;x<16.6;x+=.8) L([x,29.2,0],[x,30.4,0],"#d3cbb7");
  flat(8.6,31.2,16.2,38.8,0,"#dcc39a"); for(let i=0;i<420;i++) dot(8.7+R()*7.4,31.3+R()*7.4,0,R()<.5?"#e6cfa8":"#cdb187");
  const W="#fbf7ee"; L([9.2,31.8,0],[15.6,31.8,0],W); L([15.6,31.8,0],[15.6,38.2,0],W); L([15.6,38.2,0],[9.2,38.2,0],W); L([9.2,38.2,0],[9.2,31.8,0],W); L([12.4,31.8,0],[12.4,38.2,0],W);
  flat(4.9,31.2,8.2,35.6,0,"#3aa6a0"); flat(5.3,31.6,7.8,35.2,0,"#4bb8b0"); L([5.3,33.4,0],[7.8,33.4,0],W); L([5.3,31.6,0],[7.8,31.6,0],W); L([7.8,31.6,0],[7.8,35.2,0],W); L([7.8,35.2,0],[5.3,35.2,0],W); L([5.3,35.2,0],[5.3,31.6,0],W);
  // park lawn & pond near home
  flat(22.6,30.8,30,39.6,0,C.grassL); for(let i=0;i<250;i++) dot(22.6+R()*7.4,30.8+R()*8.8,0,R()<.5?C.grass:"#b8dc95");
  Q([[25,35,0],[27,34.6,0],[28,36,0],[26.6,37.4,0],[24.8,36.8,0]],C.water); L([25.6,35.6,0],[26.6,35.4,0],C.waterL);
  flowers(22.8,31,29.8,34,40,3); flowers(22.8,38,29.8,39.5,25,4);
  // forest floor
  for(let i=0;i<300;i++) dot(3.5+R()*13,1+R()*15.5,0,R()<.6?C.grassD:"#6a9e4c");

  // footpaths
  path([[17.4,12.6],[15.2,13.8],[13.6,14.6]],0.9,"#c9a87a","#b8956a");
  path([[12,10.6],[10,9],[8.4,6.2],[6,4.6],[3.4,4]],0.8,"#c9a87a","#b8956a");
  path([[22.2,33],[24,31.6],[27,32.4],[29.4,31.4]],0.7,"#e3dccb","#cfc6b3");
  path([[24.2,37.8],[26,38.6],[29.6,38]],0.7,"#e3dccb","#cfc6b3");
  stones([[28.8,26.8],[28.9,25.6],[29,24.4],[29.1,23.2],[29.2,22.2]]);
  path([[10,30.9],[10,30.2]],1,"#e3dccb");
  // flower strips along sidewalks
  flowerbed(22,21.8,30,22.4,40,31); flowerbed(31,21.8,39.8,22.4,40,32); flowerbed(22,30.3,22.5,39.6,30,33); flowerbed(3.4,21.8,16.6,22.3,50,34);
  flowerbed(3.4,16.6,6,17.2,14,35); flowerbed(22.2,16.6,30,17.2,30,36);
  // lily pads & reeds
  [[1.5,6],[1.1,26],[1.8,33]].forEach(([x,y])=>{dot(x,y,0,"#5aa85a",3,2); dot(x+.1,y,0,C.pink);});
  for(let y=2;y<40;y+=3.7){ const p=P(2.75,y,0); g.fillStyle="#6a9e4c"; g.fillRect(p[0],p[1]-3,1,3); g.fillRect(p[0]+2,p[1]-2,1,2); g.fillStyle="#8b5e3c"; g.fillRect(p[0],p[1]-4,1,1);}
  // forest floor
  for(let i=0;i<160;i++) dot(3.5+R()*13.5,1+R()*15.5,0,R()<.5?"#9cc46e":"#5e9145");

  // apartment complex grounds: pale pavers, lawns, looping walkway
  flat(22.2,.2,31,10.6,0,"#e9e1d0"); for(let i=0;i<260;i++) dot(22.3+R()*8.6,.3+R()*10.2,0,R()<.5?"#f2ece0":"#ddd3bf");
  flat(22.4,4.4,24,6,0,"#8fc46c"); flat(27.4,5,30.8,6.2,0,"#8fc46c"); flat(28.2,7,30.8,10.4,0,"#8fc46c"); flat(22.4,9.4,24,10.4,0,"#8fc46c"); flat(25.8,.4,27.2,4.8,0,"#8fc46c"); flat(30.4,.4,30.9,6.8,0,"#8fc46c");
  for(let i=0;i<140;i++){const x=22.4+R()*8.4,y=.4+R()*10; dot(x,y,0,"#a6d283");}
  path([[24,5.2],[25.4,5.4],[27.4,6.6],[28,8.6],[27.2,10.2]],.6,"#d8cdb6","#c4b89e");
  flat(28.6,7.8,30.2,9.6,0,"#e9a07a"); flat(28.8,8,30,9.4,0,"#f0b08c");
  flowers(22.4,4.4,24,6,16,71); flowers(27.4,5,30.8,6.2,18,72); flowers(25.8,.4,27.2,4.8,14,73);
  const objs=[]; const add=(cx,cy,fn)=>objs.push({d:cx+cy,fn});
  // apartment complex (after the reference photo): slim high-rise towers, grey-white with dark vertical bands, dark crowns, landscaped courtyard
  const aptTower=(x0,y0,x1,y1,H,bx,by,seed)=>{
     const T=rng(seed), GL="#a9cbe2", GLD="#7ea6c4", DK="#3d424a", DKR="#2f3339", ST="#9a948c", STR="#827d76";
     shadow(x0,y0,x1,y1,H); box(x0,y0,x1,y1,0,H,"#d6d9dc","#eceef0","#c6cbd1");
     // stone podium (2 floors)
     Q([[x0,y1,0],[x1,y1,0],[x1,y1,6],[x0,y1,6]],ST); Q([[x1,y0,0],[x1,y1,0],[x1,y1,6],[x1,y0,6]],STR);
     L([x0,y1,6],[x1,y1,6],"#6f6a63"); L([x1,y1,6],[x1,y0,6],"#5f5a54");
     // floors with window rows and slab lines
     for(let z=7.2; z<H-7; z+=3.1){
       for(let x=x0+.18;x<x1-.3;x+=.52){ if(x>bx-.35&&x<bx+.62) continue; Q([[x,y1,z+.6],[x+.36,y1,z+.6],[x+.36,y1,z+2.3],[x,y1,z+2.3]],T()<.12?"#f3e2b5":GL); }
       for(let y=y0+.18;y<y1-.3;y+=.52){ if(y>by-.35&&y<by+.62) continue; Q([[x1,y,z+.6],[x1,y+.36,z+.6],[x1,y+.36,z+2.3],[x1,y,z+2.3]],T()<.1?"#e6d39f":GLD); }
       L([x0,y1,z],[x1,y1,z],"#dfe2e5"); L([x1,y1,z],[x1,y0,z],"#b6bbc1");
     }
     // dark vertical bands running up to a fin above the roof
     Q([[bx,y1,6],[bx+.55,y1,6],[bx+.55,y1,H+4],[bx,y1,H+4]],DK); for(let z=8;z<H;z+=3.1) L([bx+.1,y1,z+1.5],[bx+.45,y1,z+1.5],"#5b616b");
     Q([[x1,by,6],[x1,by+.55,6],[x1,by+.55,H+4],[x1,by,H+4]],DKR); for(let z=8;z<H;z+=3.1) L([x1,by+.1,z+1.5],[x1,by+.45,z+1.5],"#4c5159");
     Q([[bx,y1,H-5],[bx+.55,y1,H-5],[bx+.55,y1,H-1],[bx,y1,H-1]],"#f4f5f6"); dot(bx+.2,y1,H-2,DK,1,2);
     // dark crown (top floors) and parapet
     Q([[x0,y1,H-6],[x1,y1,H-6],[x1,y1,H],[x0,y1,H]],"#565c66"); Q([[x1,y0,H-6],[x1,y1,H-6],[x1,y1,H],[x1,y0,H]],"#454a52");
     for(let x=x0+.2;x<x1-.2;x+=.52) Q([[x,y1,H-5.2],[x+.36,y1,H-5.2],[x+.36,y1,H-1.6],[x,y1,H-1.6]],"#8fb2cb");
     for(let y=y0+.2;y<y1-.2;y+=.52) Q([[x1,y,H-5.2],[x1,y+.36,H-5.2],[x1,y+.36,H-1.6],[x1,y,H-1.6]],"#6f93ae");
     L([x0,y1,H],[x1,y1,H]); L([x1,y1,H],[x1,y0,H]); L([x0,y1,0],[x0,y1,H]); L([x1,y1,0],[x1,y1,H]); L([x1,y0,0],[x1,y0,H]);
     flat(x0,y0,x1,y1,H,"#7d838b"); flat(x0+.2,y0+.2,x1-.2,y1-.2,H,"#a3a9b0");
     // rooftop: dark machine room + solar panels
     box(x0+.5,y0+.4,x0+1.6,y1-.6,H,5,"#4a4f57","#5e646d","#454a52");
     for(let y=y0+.4;y<y1-.6;y+=.6) Q([[x0+1.9,y,H+.4],[x1-.4,y,H+.4],[x1-.4,y+.45,H+1.2],[x0+1.9,y+.45,H+1.2]],C.panel), L([x0+1.9,y+.45,H+1.2],[x1-.4,y+.45,H+1.2],C.panelL);
     // entrance canopy
     box(x0+.5,y1,x0+1.6,y1+.5,4.4,.5,"#e9ecef","#cfd5da","#b9c0c6",{hl:false}); Q([[x0+.6,y1,0],[x0+1.5,y1,0],[x0+1.5,y1,4],[x0+.6,y1,4]],"#6f98b7");
  };
  // forest + workshop
  { const F=rng(99); const avoid=(x,y)=>(x>10.2&&x<17.4&&y>10.2&&y<15.8)||(Math.abs((x-3.4)*(10-4)-(y-4)*(12-3.4))<9 && x<12.5 && y<11);
    for(let i=0;i<190;i++){ const x=3.6+F()*13.4, y=.8+F()*15.6; if(avoid(x,y)) continue; const k=F(), sz=.6+F()*.8;
      if(k<.35) add(x,y,()=>pine(x,y,sz)); else if(k<.5) add(x,y,()=>birch(x,y,sz)); else if(k<.62) add(x,y,()=>tree(x,y,0,2.6+sz*2,2)); else add(x,y,()=>tree(x,y,0,2.4+sz*2.4,F()<.5?0:1)); }
    for(let i=0;i<14;i++){ const x=3.8+F()*13, y=1+F()*15; if(avoid(x,y)) continue; const k=F(); add(x,y-.01,()=> k<.35?rock(x,y,.6+F()*.6): k<.6?stump(x,y): k<.85?mushroom(x,y): bush(x,y)); }
    add(9.6,8.6,()=>person(9.6,8.6,"#e8893a")); }
  add(13,12.5,()=>{ house(11,11,15,14,10,6,[C.wdT,C.wdL,C.wdR],C.wdT,"#4f3420","#8a6040");
     for(let z=2;z<10;z+=2) L([11,14,z],[15,14,z],C.wdD);
     doorY(12,13.1,14,7,"#5e3f27"); winX(15,12,13,4,8);
     [[15.5,12.1],[15.5,12.9],[15.5,13.7]].forEach(([x,y])=>{box(x,y,x+1.3,y+.7,0,1.2,"#d9b07a","#a87f53","#8b6643",{hl:false}); dot(x+1.3,y+.35,.6,"#e8c99a");});
     box(15.6,12.4,16.8,13.2,1.2,1.2,"#d9b07a","#a87f53","#8b6643",{hl:false});});
  add(24.2,2.2,()=>aptTower(22.8,.8,25.6,3.6,82,24,1.6,11));
  add(28.8,3,()=>aptTower(27.4,1.6,30.2,4.4,74,28.4,2.6,12));
  add(25.6,7.6,()=>aptTower(24.2,6.2,27,9,66,25,7.2,13));
  // big office building: glass lobby podium, curtain-wall tower with white vertical fins (external shading), green setback terraces, crown frame
  add(35,5,()=>{ const GL="#5f8fb8", GLR="#4a7598", FIN="#f2f4f6", FINR="#d5dadf";
     shadow(31.4,1.4,38.6,8.6,66);
     // podium: glass lobby (2 floors)
     box(31.4,1.4,38.6,8.6,0,9,"#cfd6dc","#a9cde4","#86afcb");
     for(let x=31.4;x<=38.6;x+=1.2) L([x,8.6,0],[x,8.6,9],"#e9eef2"); for(let y=1.4;y<=8.6;y+=1.2) L([38.6,y,0],[38.6,y,9],"#c9d4dc");
     L([31.4,8.6,4.5],[38.6,8.6,4.5],"#e9eef2"); L([38.6,8.6,4.5],[38.6,1.4,4.5],"#c9d4dc");
     Q([[33.6,8.6,0],[35.4,8.6,0],[35.4,8.6,4],[33.6,8.6,4]],"#3f5f78"); L([34.5,8.6,0],[34.5,8.6,4],"#9fc3dc");
     box(33.2,8.6,35.8,9.6,4.4,.6,"#ffffff","#e9ecef","#cfd5da");
     // podium roof garden
     flat(31.6,1.6,38.4,8.4,9,"#8ccf6e"); for(let i=0;i<70;i++) dot(31.7+R()*6.6,1.7+R()*6.6,9,R()<.5?C.leafL:"#6fb35a");
     // main tower with fins
     const x0=32.4,x1=37.6,y0=2.4,y1=7.6,H=58;
     box(x0,y0,x1,y1,9,H-9,"#cfd6dc",GL,GLR);
     for(let z=9;z<H;z+=3.2){ Q([[x0,y1,z],[x1,y1,z],[x1,y1,z+.9],[x0,y1,z+.9]],"#3f6587"); Q([[x1,y0,z],[x1,y1,z],[x1,y1,z+.9],[x1,y0,z+.9]],"#35577a"); }
     for(let k=0;k<6;k++){ const z=14+k*7; L([x0+.4,y1,z],[x0+1.4,y1,z+4],"#9fc3dc"); L([x1,y0+.6,z+2],[x1,y0+1.6,z+6],"#88abc6"); }
     for(let x=x0+.25;x<x1;x+=.5) Q([[x,y1+.25,9],[x+.12,y1+.25,9],[x+.12,y1+.25,H],[x,y1+.25,H]],FIN);
     for(let y=y0+.25;y<y1;y+=.5) Q([[x1+.25,y,9],[x1+.25,y+.12,9],[x1+.25,y+.12,H],[x1+.25,y,H]],FINR);
     L([x0,y1,9],[x0,y1,H]); L([x1,y1,9],[x1,y1,H]); L([x1,y0,9],[x1,y0,H]);
     // setback terrace with garden
     flat(x0,y0,x1,y1,H,"#8ccf6e"); for(let i=0;i<50;i++) dot(x0+R()*5,y0+R()*5,H,R()<.5?C.leafL:C.leaf);
     for(let x=x0;x<x1;x+=.4) L([x,y1,H],[x,y1,H+1.6],"#e3e8ec"); L([x0,y1,H+1.6],[x1,y1,H+1.6],"#e3e8ec");
     // upper volume + crown frame
     box(33.6,2.8,36.6,6.2,H,8,"#cfd6dc","#4f7aa0","#3f6587"); for(let z=H+1;z<H+8;z+=2.4) L([33.6,6.2,z],[36.6,6.2,z],"#9fc3dc");
     box(33.4,2.6,36.8,6.4,H+8,1,"#ffffff","#e9ecef","#cfd5da");
     L([33.4,6.4,H+9],[33.4,6.4,H+12],"#ffffff"); L([36.8,6.4,H+9],[36.8,6.4,H+12],"#ffffff"); L([36.8,2.6,H+9],[36.8,2.6,H+12],"#e3e8ec"); L([33.4,6.4,H+12],[36.8,6.4,H+12],"#ffffff"); L([36.8,6.4,H+12],[36.8,2.6,H+12],"#e3e8ec");
     for(let y=3;y<6.2;y+=.7) Q([[34,y,H+9.2],[36.2,y,H+9.2],[36.2,y+.5,H+10],[34,y+.5,H+10]],C.panel);
     bush(33,3.4,C.leafL); tree(33,7,H,2.2,0); tree(37.1,7.1,H,2,1); bush(37.1,4.4,C.leaf);
     // street planters
     flowerbed(31.6,8.8,33,9.5,10,51); flowerbed(36,8.8,38.4,9.5,12,52); bench(36.4,9.1); });
  // recycling center
  add(35,13.5,()=>{ shadow(31,11,39,16,16); box(31,11,39,16,0,16,C.rcT,C.rcL,C.rcR);
     for(let z=2;z<16;z+=2) L([31,16,z],[39,16,z],"#b3c0a9");
     Q([[32,16,0],[35.4,16,0],[35.4,16,10],[32,16,10]],"#6d7a66"); for(let z=1;z<10;z+=1.2) L([32,16,z],[35.4,16,z],"#7f8c77");
     winX(39,12,13.4,8,12); winX(39,14,15.4,8,12); Q([[31,16,12],[39,16,12],[39,16,13.4],[31,16,13.4]],"#4f9a48"); Q([[39,11,12],[39,16,12],[39,16,13.4],[39,11,13.4]],"#3f7f39");
     for(let k=0;k<3;k++){const y=11.4+k*1.5; Q([[31.2,y,16],[38.8,y,16],[38.8,y+.9,18.4],[31.2,y+.9,18.4]],"#c7d3bd"); Q([[31.2,y+.9,18.4],[38.8,y+.9,18.4],[38.8,y+1.4,16],[31.2,y+1.4,16]],"#8fa3c0"); L([31.2,y+.9,18.4],[38.8,y+.9,18.4]);}
     box(36,11.8,38,13,16,2.5,C.white,"#e9ecef","#cfd5da",{hl:false}); dot(36.7,12.6,17.5,C.green,3,2);
     [[C.blue,31.3],[C.yellow,32.8],[C.green,34.3],[C.red,35.8]].forEach(([c,x])=>{box(x,16.6,x+1.1,17.5,0,4.2,c,c,"rgba(0,0,0,.2)"); });
     car(36.8,16.4,'x',"#e8e4da"); });
  // new-town Korean elementary school (after the reference photo): wide 4-floor white block with an inner courtyard,
  // long ribbon windows, mustard accent wall at the entrance, solar panels covering the roof, gym volume at the back
  add(10,25.6,()=>{
    const W1="#f7f7f4",W2="#ecebe7",W3="#cdcfcd", GL="#8fb9d4", GLD="#6a95b3", MU="#d9a441", MUD="#bf8a2c";
    const x0=4.6,x1=16.4,y0=22.4,y1=28.6,H=30;
    // gym volume at the back right (higher roof)
    shadow(11.2,21.6,16.4,24,36); box(11.2,21.6,16.4,24,0,36,W1,W2,W3);
    for(let y=21.9;y<23.8;y+=.5) winX(16.4,y,y+.35,24,33,GLD,"#e2e4e4");
    // main block
    shadow(x0,y0,x1,y1,H); box(x0,y0,x1,y1,0,H,W1,W1,W2);
    for(let f=0;f<4;f++){ const z=1.2+f*7.2;
      Q([[x0+.3,y1,z],[x1-.3,y1,z],[x1-.3,y1,z+3.4],[x0+.3,y1,z+3.4]],GL);
      for(let x=x0+.3;x<x1-.3;x+=.55) L([x,y1,z],[x,y1,z+3.4],"#6f98b5");
      L([x0+.3,y1,z+3.4],[x1-.3,y1,z+3.4],"#dfe9ef"); L([x0+.3,y1,z],[x1-.3,y1,z],"#aeb4b8");
      Q([[x1,y0+.3,z],[x1,y1-.3,z],[x1,y1-.3,z+3.4],[x1,y0+.3,z+3.4]],GLD);
      for(let y=y0+.3;y<y1-.3;y+=.55) L([x1,y,z],[x1,y,z+3.4],"#557d99"); }
    // entrance section: mustard accent wall + tall glass + canopy
    Q([[11,y1,0],[13.2,y1,0],[13.2,y1,H],[11,y1,H]],MU);
    for(let f=0;f<4;f++){ const z=1.2+f*7.2; Q([[11.3,y1,z],[12.9,y1,z],[12.9,y1,z+4.6],[11.3,y1,z+4.6]],"#a7cbe0"); L([12.1,y1,z],[12.1,y1,z+4.6],"#6f98b5"); }
    Q([[13.2,y1,0],[14.6,y1,0],[14.6,y1,H+1.5],[13.2,y1,H+1.5]],"#9cc4dc"); for(let z=3;z<H;z+=3) L([13.2,y1,z],[14.6,y1,z],"#e6f2f8"); L([13.9,y1,0],[13.9,y1,H+1.5],"#6f98b5");
    Q([[11,y1,0],[11.1,y1,0],[11.1,y1,H],[11,y1,H]],MUD);
    box(10.6,y1,14.8,y1+1,6.2,.6,"#ffffff","#e9eaec","#cfd3d6",{hl:false});
    Q([[11.6,y1,0],[13,y1,0],[13,y1,5],[11.6,y1,5]],"#3d4a55"); Q([[11.7,y1,0],[12.25,y1,0],[12.25,y1,4.7],[11.7,y1,4.7]],GL); Q([[12.35,y1,0],[12.9,y1,0],[12.9,y1,4.7],[12.35,y1,4.7]],GL);
    for(let i=0;i<5;i++){ const xx=x0+1.2+i*.55; Q([[xx,y1,H-2.6],[xx+.38,y1,H-2.6],[xx+.38,y1,H-1],[xx,y1,H-1]],"#2f5d8a"); }
    // roof: parapet, inner courtyard well, solar panels, rooftop boxes
    flat(x0+.25,y0+.25,x1-.25,y1-.25,H,"#b8bcbf");
    for(let y=y0+.5;y<y1-.6;y+=.75){ if(y>24.3&&y<26.6){ Q([[x0+.5,y,H+.2],[8.4,y,H+.2],[8.4,y+.55,H+.9],[x0+.5,y+.55,H+.9]],C.panel); Q([[13,y,H+.2],[x1-.5,y,H+.2],[x1-.5,y+.55,H+.9],[13,y+.55,H+.9]],C.panel); continue; }
      Q([[x0+.5,y,H+.2],[x1-.5,y,H+.2],[x1-.5,y+.55,H+.9],[x0+.5,y+.55,H+.9]],C.panel); L([x0+.5,y+.28,H+.55],[x1-.5,y+.28,H+.55],C.panelL); }
    { const hp=[[8.6,24.2,H],[12.8,24.2,H],[12.8,26.8,H],[8.6,26.8,H]].map(q=>P(...q));
      g.save(); g.beginPath(); hp.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1])); g.closePath(); g.clip();
      const zb=H-14;
      flat(8.6,24.2,12.8,26.8,zb,"#7fb95f"); for(let i=0;i<40;i++) dot(8.7+R()*4,24.3+R()*2.4,zb,R()<.5?C.leafL:C.leafD);
      Q([[8.6,24.2,zb],[12.8,24.2,zb],[12.8,24.2,H],[8.6,24.2,H]],W1); for(let z=zb+1.2;z<H;z+=7.2){ Q([[8.8,24.2,z],[12.6,24.2,z],[12.6,24.2,z+3.4],[8.8,24.2,z+3.4]],GL); }
      Q([[8.6,24.2,zb],[8.6,26.8,zb],[8.6,26.8,H],[8.6,24.2,H]],W3); for(let z=zb+1.2;z<H;z+=7.2){ Q([[8.6,24.4,z],[8.6,26.6,z],[8.6,26.6,z+3.4],[8.6,24.4,z+3.4]],GLD); }
      tree(11,26,zb,2.6,3); tree(9.8,25.4,zb,2.2,0); g.restore();
      L([8.6,24.2,H],[12.8,24.2,H]); L([8.6,24.2,H],[8.6,26.8,H]); L([8.6,26.8,H],[12.8,26.8,H],"#e9ecee"); L([12.8,26.8,H],[12.8,24.2,H],"#e9ecee"); }
    [[6,22.8],[15,23]].forEach(([x,y])=>box(x,y,x+.9,y+.9,H,2.2,W1,W2,W3));
    box(11.4,21.8,16.2,23.8,36,.4,"#b8bcbf","#d9dbdc","#c4c8ca",{hl:false}); for(let y=22;y<23.6;y+=.6) Q([[11.6,y,36.4],[16,y,36.4],[16,y+.45,37],[11.6,y+.45,37]],C.panel);
    // front planting: cherry trees along building and field
    flowerbed(x0+.2,28.8,10.6,29.2,24,11); flowerbed(14.8,28.8,16.2,29.2,10,12);
    box(4.1,27.8,4.6,28.3,0,5,C.blue,C.blue,"#2f6aa3");
  });
  // basketball court fence + hoops, field goals, cherry trees
  add(4.9,31.2,()=>{ for(let x=4.9;x<=8.2;x+=.4) L([x,31.2,0],[x,31.2,4.5],"#4f9a48"); L([4.9,31.2,4.5],[8.2,31.2,4.5],"#3f7f39"); for(let y=31.2;y<=35.6;y+=.4) L([4.9,y,0],[4.9,y,4.5],"#4f9a48"); L([4.9,31.2,4.5],[4.9,35.6,4.5],"#3f7f39"); });
  add(6.6,35.8,()=>{ L([6.55,35.5,0],[6.55,35.5,5],"#6a737b"); box(6.2,35.3,6.9,35.4,5,1.6,"#ffffff","#ffffff","#d0d0d0",{hl:false}); });
  add(8.2,35.6,()=>{ for(let x=4.9;x<=8.2;x+=.4) L([x,35.6,0],[x,35.6,4.5],"rgba(79,154,72,.7)"); L([4.9,35.6,4.5],[8.2,35.6,4.5],"#3f7f39"); for(let y=31.2;y<=35.6;y+=.4) L([8.2,y,0],[8.2,y,4.5],"rgba(79,154,72,.7)"); L([8.2,31.2,4.5],[8.2,35.6,4.5],"#3f7f39"); });
  add(9.2,35,()=>{ L([9.2,34.3,0],[9.2,34.3,3.6],"#ffffff"); L([9.2,35.7,0],[9.2,35.7,3.6],"#ffffff"); L([9.2,34.3,3.6],[9.2,35.7,3.6],"#ffffff"); });
  add(15.6,35,()=>{ L([15.6,34.3,0],[15.6,34.3,3.6],"#ffffff"); L([15.6,35.7,0],[15.6,35.7,3.6],"#ffffff"); L([15.6,34.3,3.6],[15.6,35.7,3.6],"#ffffff"); });
  [[5.2,29.8],[6.6,29.8],[8,29.8],[9.4,29.8],[13.6,29.8],[15,29.8],[16.2,30.6],[16.2,32.6],[16.2,34.6],[16.2,36.6],[16.2,38.6],[8.6,39],[10.6,39],[12.6,39],[14.6,39],[4.4,37],[4.4,38.8],[6.4,38.8]].forEach(([x,y],i)=>add(x,y,()=>tree(x,y,0,2.6+(i%3)*.3,3)));
  // 정문 (main gate) and fence along the road
  add(17,28,()=>{ for(let y=22.6;y<39.4;y+=.5){ if(y>26.6&&y<29.4) continue; L([16.9,y,0],[16.9,y,2.4],"#4f9a48"); } L([16.9,22.6,2],[16.9,26.6,2],"#3f7f39"); L([16.9,29.4,2],[16.9,39.4,2],"#3f7f39");
    box(16.6,26.2,17.2,26.8,0,6,"#b5654a","#c97a5c","#9a4f39"); box(16.6,29.2,17.2,29.8,0,6,"#b5654a","#c97a5c","#9a4f39");
    Q([[17.2,26.25,1.2],[17.2,26.75,1.2],[17.2,26.75,5],[17.2,26.25,5]],"#f4f1e8"); for(let z=1.8;z<5;z+=.9) L([17.2,26.35,z],[17.2,26.65,z],"#2b2c2f");
    flat(16.6,26.8,17.4,29.2,0,"#e3dccb"); });

  // our house
  add(25.5,25.5,()=>{ house(23,23,28,28,15,9,[C.wT,C.wL,C.wR],C.roof,C.roofD,C.roofL);
     winY(23.7,25,28,6,12); winY(26,27.3,28,6,12); winX(28,23.8,25.2,6,12); doorX(28,26.2,27.4,10);
     box(23.4,24.2,24.2,25,15,7,"#b5654a","#c97a5c","#9a4f39"); smoke(23.8,24.6,23); // chimney
     planter(23.7,28,5.6,"y"); planter(26,28,5.6,"y"); planter(28,23.9,5.6,"x");
     box(28,26,28.7,27.6,0,.8,"#d8d0c0","#cfc6b3","#b8ae9a",{hl:false}); Q([[28,26,11],[28.8,26,10.4],[28.8,27.6,10.4],[28,27.6,11]],C.roofD); L([28.8,26,10.4],[28.8,27.6,10.4]);
     Q([[23.5,28,6],[23.7,28,6],[23.7,28,12],[23.5,28,12]],"#5b8bb8"); Q([[25,28,6],[25.2,28,6],[25.2,28,12],[25,28,12]],"#5b8bb8"); Q([[25.8,28,6],[26,28,6],[26,28,12],[25.8,28,12]],"#5b8bb8"); Q([[27.3,28,6],[27.5,28,6],[27.5,28,12],[27.3,28,12]],"#5b8bb8");
     flat(28,26.2,29.2,27.4,0,C.walk); flat(22.6,28.2,28.4,28.7,0,C.leafD); [[23.4,28.6],[25.2,28.7],[27,28.6]].forEach(([x,y])=>bush(x,y)); flowers(23,28.6,28,29.2,12,21);});
  // 주택가 지붕 (matches the close-up): flat-roof 2-storey house being painted white (cool roof) + red gable house with black-tube solar water heater
  add(32.3,25,()=>{ const x0=30.4,y0=23,x1=34,y1=27.2,h=14;
     shadow(x0,y0,x1,y1,h); box(x0,y0,x1,y1,0,h,"#e8e2d6","#efe4cf","#d9c9ab",{hl:false});
     Q([[x0,y1,0],[x1,y1,0],[x1,y1,3],[x0,y1,3]],"#b5654a"); Q([[x1,y0,0],[x1,y1,0],[x1,y1,3],[x1,y0,3]],"#9a4f39");
     winY(x0+.4,x0+1.4,y1,4.6,8); winY(x0+2,x0+3,y1,4.6,8); winY(x0+.4,x0+1.4,y1,9.6,13); winY(x0+2,x0+3,y1,9.6,13);
     winX(x1,y0+.5,y0+1.5,9.6,13); doorX(x1,y0+2.4,y0+3.4,6.5); box(x1,y0+2.2,x1+.5,y0+3.6,6.8,.4,"#e9ecef","#cfd5da","#b9c0c6",{hl:false});
     flat(x0,y0,x1,y1,h,"#4f9a68"); flat(x0,y0,x1,y0+2.5,h,"#f7f7f2");
     L([x0,y0,h],[x1,y0,h]); L([x1,y0,h],[x1,y1,h]); L([x1,y1,h],[x0,y1,h]); L([x0,y1,h],[x0,y0,h]);
     L([x0,y1,h+.8],[x1,y1,h+.8],"#f0ebe0"); L([x1,y0,h+.8],[x1,y1,h+.8],"#e6dccb");
     [[x0+.5,y0+.6],[x0+1,y0+.5],[x0+.7,y0+1.1]].forEach(([x,y])=>{ const p=P(x,y,h); g.fillStyle="#6b3e22"; g.fillRect(p[0]-1,p[1]-3,3,3); g.fillStyle="#8a5434"; g.fillRect(p[0]-1,p[1]-3,3,1); });
     box(x1-.9,y0+.3,x1-.4,y0+1,h,2.6,"#3b82c4","#4a90c8","#2f6aa3",{hl:false});
     person(x0+1.8,y0+2.9,"#3b82c4","#2b2c2f"); dot(x0+2.3,y0+2.6,h,"#ffffff",2,1);
     planter(x0+.5,y1,4.4,'y'); flowers(x0,y1+.1,x1,y1+.5,8,41); });
  add(37.1,25,()=>{ const x0=35,y0=23,x1=39.2,y1=27.2;
     const r=house(x0,y0,x1,y1,10,7,[C.wT,C.wL,C.wR],"#c45a4a","#a8473a","#e07a68");
     winY(x0+.5,x0+1.5,y1,4,8); winY(x0+2.4,x0+3.4,y1,4,8); doorX(x1,y0+.6,y0+1.6,8); winX(x1,y0+2.4,y0+3.6,4,8);
     const yy=t=>r.m+(y1+r.e-r.m)*t, zz=t=>r.zr-(r.zr-r.zt)*t;
     Q([[x0+.6,yy(.12),zz(.12)],[x1-.6,yy(.12),zz(.12)],[x1-.6,yy(.8),zz(.8)],[x0+.6,yy(.8),zz(.8)]],"#2b2c2f");
     for(let x=x0+.8;x<x1-.6;x+=.3) L([x,yy(.12),zz(.12)],[x,yy(.8),zz(.8)],"#4a4f57"); L([x0+.6,yy(.12),zz(.12)],[x1-.6,yy(.12),zz(.12)],"#cfd5da");
     box(x0+.7,r.m-.6,x1-.7,r.m,r.zr-.6,2.2,"#eef2f5","#f6f8fa","#c9d3da");
     planter(x0+.6,y1,3.6,'y'); bush(x1-.2,y1+.4); flowers(x0,y1+.1,x1,y1+.5,8,42); });
  add(34.6,27.6,()=>{ for(let x=30.4;x<=39.2;x+=.6) L([x,27.7,0],[x,27.7,2],"#f2efe7"); L([30.4,27.7,2],[39.2,27.7,2],"#d6d0c2"); });
  // appliance store (big glass showroom with TVs, fridges, washers; sign + banners) & repair corner
  const GA=["###..#","..#..#","..#.##",".#...#","#....#"], JN=["###..#",".#.###","#.#..#","#.....","#####."], SU=["..#..",".#.#.","#...#","#####","..#..","..#.."], RI=["###.#","..#.#","###.#","#...#","###.#"];
  const txtY=(bm,x0,y,zt,col,s=1)=>bm.forEach((row,r)=>[...row].forEach((ch,c)=>{ if(ch==="#") for(let a=0;a<s;a++) dot(x0+(c*s+a)/8,y,zt-r*s/1.6,col,1,s); }));
  const txtX=(bm,x,y0,zt,col)=>bm.forEach((row,r)=>[...row].forEach((ch,c)=>{ if(ch==="#") dot(x,y0-c/8,zt-r/1.6,col); }));
  add(35,34,()=>{ const SH=20; shadow(31,31,37.6,37,SH); box(31,31,37.6,37,0,SH,"#dfe3e6","#f4f5f6","#d5d9dd");
     // showroom glass, front face (y=37)
     Q([[31.3,37,.6],[37.3,37,.6],[37.3,37,11.6],[31.3,37,11.6]],"#eef4f7");
     // inside: TV wall (upper) and appliances (floor)
     const TV=["#e26d5c","#f2c230","#59b36b","#4a90c8","#a98bd6","#f0a3b5"];
     for(let k=0;k<5;k++){ const x=31.55+k*1.12; Q([[x,37,7.4],[x+.9,37,7.4],[x+.9,37,10.8],[x,37,10.8]],"#24262b"); Q([[x+.1,37,7.8],[x+.8,37,7.8],[x+.8,37,10.4],[x+.1,37,10.4]],TV[k]); Q([[x+.1,37,7.8],[x+.8,37,7.8],[x+.8,37,8.8],[x+.1,37,8.8]],TV[(k+2)%6]); dot(x+.3,37,10,"#ffffff"); }
     // fridge, washer, fridge, aircon stand, washer (front-facing silhouettes)
     const app=(x,w,h,c,door)=>{ Q([[x,37,.8],[x+w,37,.8],[x+w,37,.8+h],[x,37,.8+h]],c); L([x,37,.8+h],[x+w,37,.8+h],"#9aa0a6"); L([x+w,37,.8],[x+w,37,.8+h],"#b5bbc1");
        if(door==="f"){ L([x+w/2,37,1.2],[x+w/2,37,.6+h],"#b9c0c6"); dot(x+w/2-.1,37,.8+h*.55,"#7d838b",1,2); dot(x+w/2+.1,37,.8+h*.55,"#7d838b",1,2);}
        if(door==="w"){ const p=P(x+w/2,37,.8+h*.45); g.fillStyle="#7d838b"; g.fillRect(p[0]-2,p[1]-2,5,4); g.fillStyle="#9fd0ea"; g.fillRect(p[0]-1,p[1]-1,3,2); dot(x+.12,37,.6+h,"#59b36b",2,1);}
        if(door==="a"){ for(let z=1.6;z<h;z+=.9) L([x+.1,37,z],[x+w-.1,37,z],"#c9ced3"); dot(x+.15,37,.4+h,"#4a90c8",2,1);} };
     app(31.5,.9,5.8,"#ffffff","f"); app(32.6,.8,3.4,"#f4f5f6","w"); app(33.6,.9,5.8,"#c9ced3","f"); app(34.7,.5,5.2,"#ffffff","a"); app(35.4,.8,3.4,"#ffffff","w");
     // glass mullions + automatic door
     for(let x=31.3;x<=37.31;x+=1.5) L([x,37,.6],[x,37,11.6],"#8c949c"); L([31.3,37,11.6],[37.3,37,11.6],"#8c949c"); L([31.3,37,6.6],[37.3,37,6.6],"#b7bec4");
     Q([[36.3,37,.6],[37.2,37,.6],[37.2,37,6.4],[36.3,37,6.4]],"rgba(150,200,230,.6)"); L([36.75,37,.6],[36.75,37,6.4],"#5f6870");
     // sign band + letters 가전 + lightning plug badge
     Q([[31,37,12.2],[37.6,37,12.2],[37.6,37,20],[31,37,20]],"#1f4f8f"); L([31,37,12.2],[37.6,37,12.2],"#163a6b"); L([31,37,19.7],[37.6,37,19.7],"#f2c230");
     Q([[31.4,37,13.4],[32.5,37,13.4],[32.5,37,18.4],[31.4,37,18.4]],C.yellow); txtY(["..#","..#",".#.","###",".#.","#.."],31.75,37,17.6,"#1f4f8f",1);
     txtY(GA,33,37,18.9,"#ffffff",2); txtY(JN,34.9,37,18.9,"#ffffff",2);
     // right face: big energy-grade poster
     Q([[37.6,31.6,7],[37.6,36.4,7],[37.6,36.4,15.6],[37.6,31.6,15.6]],"#ffffff"); L([37.6,31.6,15.6],[37.6,36.4,15.6],"#9aa0a6");
     ["#2e9a48","#8cc63f","#f2c230","#f39a2d","#e04b3c"].forEach((c,i)=>{ const z=14.4-i*1.4; Q([[37.6,35.9,z],[37.6,35.9-1.2-i*.45,z],[37.6,35.9-1.2-i*.45,z-1],[37.6,35.9,z-1]],c); });
     txtX(["#","#","#"],37.6,32.4,14.4,"#2e9a48"); dot(37.6,32.3,14.4,"#2e9a48",2,1); dot(37.6,32.3,12.6,"#2e9a48",3,1);
     // rooftop: outdoor AC units + standing LED screen
     [[31.6,31.6],[32.9,31.6],[31.6,32.9]].forEach(([x,y])=>{ box(x,y,x+1,y+.8,SH,1.6,"#e9ecef","#d6dadf","#b9c0c6",{hl:false}); const p=P(x+.5,y+.8,SH+.8); g.fillStyle="#6d747c"; g.fillRect(p[0]-2,p[1]-1,3,3); });
     L([34.4,33,SH],[34.4,33,SH+3],"#4a4d52"); L([36.8,33,SH],[36.8,33,SH+3],"#4a4d52");
     box(34,32.6,37.2,33,SH+3,6.5,"#3a3d42","#24262b","#2f3339",{hl:false}); Q([[34.2,33,SH+3.4],[37,33,SH+3.4],[37,33,SH+9.1],[34.2,33,SH+9.1]],"#3b82c4");
     Q([[34.2,33,SH+3.4],[37,33,SH+3.4],[37,33,SH+5.4],[34.2,33,SH+5.4]],"#59b36b"); txtY(["#...#","#...#",".#.#.","..#.."],34.6,33,SH+8.6,"#ffffff"); dot(35.6,33,SH+7.6,C.yellow,3,2); dot(36.3,33,SH+8.2,"#ffffff",2,1);
     // display row + wind banners + delivery truck
     flat(31,37,37.6,38.2,0,"#e3dccb");
     [[31.4,"#ffffff"],[32.5,"#f4f5f6"]].forEach(([x,c])=>{ box(x,37.3,x+.9,37.9,0,3,c,c,"#d0d4d8",{hl:false}); const p=P(x+.45,37.9,1.6); g.fillStyle="#9aa0a6"; g.fillRect(p[0]-2,p[1]-2,4,4); g.fillStyle="#bfe3f4"; g.fillRect(p[0]-1,p[1]-1,2,2); });
     box(33.7,37.4,34.4,37.9,0,4.4,"#ffffff","#f2f3f5","#d0d4d8",{hl:false}); L([33.75,37.9,3.5],[34.35,37.9,3.5],"#9aa0a6");
     [[35,"#e04b3c"],[37.8,"#f2c230"]].forEach(([x,c])=>{ L([x,38,0],[x,38,11],"#5f6870"); Q([[x,38,11],[x+.5,38,11],[x+.5,38,4.5],[x,38,4.5]],c); L([x+.1,38,9],[x+.4,38,9],"#ffffff"); L([x+.1,38,7.6],[x+.4,38,7.6],"#ffffff"); L([x+.1,38,6.2],[x+.4,38,6.2],"#ffffff"); });
     person(36,38,"#3b82c4"); person(33,38.4,"#f0a3b5","#6b4a2e");
  });
  // repair corner (annex) with shutter and wrench sign
  add(38.4,35,()=>{ shadow(37.6,32.8,39.4,37,11); box(37.6,32.8,39.4,37,0,11,"#c9cfd5","#e4e7ea","#b9c0c6");
     Q([[39.4,33.2,0],[39.4,36.6,0],[39.4,36.6,5.6],[39.4,33.2,5.6]],"#9aa1a8"); for(let z=.6;z<5.6;z+=.7) L([39.4,33.2,z],[39.4,36.6,z],"#828990"); Q([[39.4,33.2,0],[39.4,36.6,0],[39.4,36.6,2],[39.4,33.2,2]],"#3a3d42");
     Q([[37.8,37,1.2],[39.2,37,1.2],[39.2,37,5],[37.8,37,5]],"#cfe3ee"); box(38,36.4,39,36.9,1.2,1.4,"#a87f53","#8b6643","#6f4a2e",{hl:false}); dot(38.3,36.9,3.4,"#2b2c2f",3,2);
     Q([[37.6,37,6.4],[39.4,37,6.4],[39.4,37,10.8],[37.6,37,10.8]],"#e0a91b"); txtY(SU,37.85,37,10.3,"#2b2c2f"); txtY(RI,38.6,37,10,"#2b2c2f");
     Q([[39.4,33.8,6.6],[39.4,36,6.6],[39.4,36,10.4],[39.4,33.8,10.4]],"#2b2c2f"); const p=P(39.4,35.2,9); g.fillStyle="#f2c230"; [[0,0],[1,0],[1,1],[2,2],[3,3],[4,4],[3,4]].forEach(([dx,dy])=>g.fillRect(p[0]+dx-2,p[1]+dy-2,1,1));
  });
  // cars on roads, lamps, street trees, bushes
  if(!part){ add(19.4,8,()=>car(18.3,7.5,'y',"#3b82c4")); add(19,28.5,()=>car(19.9,28,'y',"#f2c230")); add(30,18.5,()=>car(29,18.3,'x',"#e8e4da")); add(9,19.5,()=>car(8,19.5,'x',"#4f9a48")); }
  [[17.2,10],[17.2,24],[22,17.2],[33,17.2],[22,22],[10,22]].forEach(([x,y])=>add(x,y,()=>lamp(x,y,9)));
  [[22.5,29.5,0],[29.5,22.2,2],[16.5,23,0],[3.8,23,1],[16.6,39,0],[39.2,29.6,1],[24,32.4,0],[28.6,32,2],[23.6,38.6,1],[29,38.8,0]].forEach(([x,y,k])=>add(x,y,()=>tree(x,y,0,3,k)));
  [[22.2,16.6],[30,16.6],[38.6,9.6],[38.6,20.6],[3.6,30],[16,30.6]].forEach(([x,y])=>add(x,y,()=>bush(x,y)));

  // apartment complex trees, playground, people
  [[22.6,4.6,3],[23.6,5.8,0],[22.6,9.8,3],[30.6,1,0],[30.6,6.4,3],[26.4,.8,1],[27,4.4,3],[28.4,10.2,0],[30.6,10.2,3],[22.6,7.6,0],[26,10.3,3]].forEach(([x,y,k])=>add(x,y,()=>tree(x,y,0,2.2,k)));
  add(29.4,8.7,()=>{ box(28.9,8.2,29.9,8.8,0,3,"#f2c230","#e0a91b","#c4901a",{hl:false}); L([29.9,8.5,3],[30.3,9.3,0],"#3b82c4"); L([29.9,8.7,3],[30.3,9.5,0],"#3b82c4"); box(28.7,9.1,29.1,9.5,0,2,"#d9534f","#c9453f","#a83a35",{hl:false}); });
  add(27.8,5.6,()=>bench(27.6,5.4)); add(29,7.4,()=>person(29,7.4,"#d9534f")); add(26,5.6,()=>person(26,5.6,"#4f9a48","#e0a91b")); add(24.6,10,()=>person(24.6,10,"#a98bd6"));
  // park & street life
  add(23.4,33.4,()=>bench(23,33.2)); add(27.6,38.9,()=>bench(27.2,38.8));
  add(28.4,35.2,()=>{ // swing set
    L([28,34.6,0],[28.4,34.6,7]); L([28.8,34.6,0],[28.4,34.6,7]); L([28,36.4,0],[28.4,36.4,7]); L([28.8,36.4,0],[28.4,36.4,7]); L([28.4,34.6,7],[28.4,36.4,7],"#d9534f");
    L([28.4,35.1,7],[28.4,35.1,2.4],"#7a7a7a"); L([28.4,35.9,7],[28.4,35.9,2.4],"#7a7a7a"); box(28.2,35,28.6,36,2.2,.4,"#f2c230","#e0a91b","#c4901a",{hl:false});});
  add(25.6,36.2,()=>{duck(25.6,35.8); duck(26.6,36.4);});
  add(1.4,12,()=>duck(1.4,12)); add(1.2,30,()=>duck(1.2,30));
  add(1.2,14.5,()=>{ box(.4,13.8,2,15,0,1.4,"#c49a6c","#a87f53","#8b6643"); person(1.2,14.3,"#3b82c4"); }); // little boat
  add(24.4,31.4,()=>person(24.4,31.4,"#d9534f")); add(26.8,33.2,()=>person(26.8,33.2,"#4f9a48","#e0a91b"));
  add(17.8,25,()=>person(17.8,25,"#a98bd6")); add(30.5,21.9,()=>person(30.5,21.9,"#3b82c4")); add(12.6,34.6,()=>person(12.6,34.6,"#f2c230")); add(6.4,33,()=>person(6.4,33,"#d9534f")); add(10.6,36.4,()=>person(10.6,36.4,"#3b82c4"));
  add(23,12,()=>{ box(22.4,11.2,23,13.2,0,.4,"#bdb8ac","#a9a59d","#8f8b84",{hl:false}); L([22.5,11.3,0],[22.5,11.3,6],"#4a4d52"); L([22.5,13.1,0],[22.5,13.1,6],"#4a4d52"); box(22.3,11.1,23.1,13.3,6,.6,"#3b82c4","#2f6aa3","#285a8b",{hl:false}); }); // bus stop
  add(22.3,24.3,()=>{ box(22.1,24.1,22.5,24.5,0,3,"#d9534f","#c9453f","#a83a35",{hl:false}); }); // mailbox
  add(29.6,24,()=>fence(30.3,27.7,30.3,23.2));
  [[3.6,24],[3.6,26.6]].forEach(([x,y])=>add(x,y,()=>pine(x,y,.8)));
  [[38.8,24.4,1],[38.8,32,0],[30.6,28.6,2],[22.4,27,0],[34.5,39.2,0],[38.6,39.2,1],[3.8,38.8,0]].forEach(([x,y,k])=>add(x,y,()=>tree(x,y,0,2.4,k)));
  [[39,16.6],[38.8,11],[30.6,11.8],[17.1,2.8],[39.2,4]].forEach(([x,y])=>add(x,y,()=>birch(x,y,.7)));
  if(part==="ground") return {P:D.P, W:MAP.W, H:MAP.H};
  if(part==="objects") g.clearRect(0,0,MAP.W,MAP.H);
  objs.sort((a,b)=>a.d-b.d).forEach(o=>o.fn());
  return {P:D.P, W:MAP.W, H:MAP.H};
}
const MAP_CLOUDS=[[40,50,46],[560,30,60],[480,80,36],[150,20,30],[610,130,40],[70,150,34]];
/* animated map: drifting clouds (behind), flowing river + cars (between ground and objects) */
function MapAnim(cSky,cAnim){
  [cSky,cAnim].forEach(c=>{c.width=MAP.W;c.height=MAP.H;});
  const gs=cSky.getContext("2d"), ga=cAnim.getContext("2d"); ga.imageSmoothingEnabled=false;
  const D=Painter(ga,340,112,8,1.6);
  const cols=["#3b82c4","#f2c230","#e8e4da","#4f9a48","#d9534f","#ffffff","#a98bd6"];
  // lanes: axis 'y' (x fixed) or 'x' (y fixed); dir +1/-1; from..to along the axis
  const lanes=[{ax:'y',c:18.3,dir:1,a:-.5,b:38.6},{ax:'y',c:19.9,dir:-1,a:-.5,b:38.6},{ax:'x',c:18.3,dir:1,a:3.2,b:38.6},{ax:'x',c:19.9,dir:-1,a:3.2,b:38.6}];
  const cars=[]; let ci=0; lanes.forEach((ln,li)=>{ for(let k=0;k<2;k++){ cars.push({ln,s:ln.a+((k*19+li*7)%(ln.b-ln.a)),col:cols[ci++%cols.length]}); } });
  const inX=c=>c.s>16.2&&c.s<22.6, pos=c=>c.ln.dir>0?c.s:c.ln.a+c.ln.b-c.s;
  let t=0;
  function step(){
    t++;
    cars.forEach(c=>{
      const ns=c.s+.22, p=pos(c), np=c.ln.dir>0?ns:c.ln.a+c.ln.b-ns;
      const entering=!(p>16.2&&p<22.6)&&(np>16.2&&np<22.6);
      const cross=cars.some(o=>o.ln.ax!==c.ln.ax&&(pos(o)>15.8&&pos(o)<23));
      const ahead=cars.some(o=>o!==c&&o.ln===c.ln&&o.s>c.s&&o.s-c.s<2.6);
      if(!(entering&&cross)&&!ahead){ c.s=ns; if(c.s>c.ln.b){ c.s=c.ln.a; c.col=cols[(Math.random()*cols.length)|0]; } }
    });
  }
  function draw(){
    gs.clearRect(0,0,MAP.W,MAP.H);
    const off=Math.floor(t/3);
    clouds(gs,MAP.W,MAP_CLOUDS.map(([x,y,w],i)=>[((x+off*(1+i%2*.5))%(MAP.W+80))-60,y,w]));
    ga.clearRect(0,0,MAP.W,MAP.H);
    // river: ripples drift downstream
    for(let k=0;k<32;k++){ const y=(k*1.3+t*.05)%40, x=.9+((k*37)%12)/10; D.L([x,y,0],[x+.5,y+.25,0],C.waterL); }
    for(let k=0;k<10;k++){ const y=(k*4.1+t*.08)%40; D.dot(.35,y,0,"#7fb6dc",2,1); }
    // pond sparkle
    if((t>>3)%2) D.dot(25.8,35.6,0,"#ffffff",2,1); else D.dot(26.8,36.2,0,"#ffffff",2,1);
    cars.map(c=>({c,p:pos(c)})).sort((a,b)=>{ const da=a.c.ln.ax==='y'?a.c.ln.c+a.p:a.p+a.c.ln.c, db=b.c.ln.ax==='y'?b.c.ln.c+b.p:b.p+b.c.ln.c; return da-db; })
      .forEach(({c,p})=>{ if(c.ln.ax==='y') D.car(c.ln.c,p,'y',c.col); else D.car(p,c.ln.c,'x',c.col); });
  }
  return {step,draw};
}

/* ---------------- our house (cutaway) ---------------- */
const HOUSE={W:400,H:330};
const HOUSE_ITEMS=[
  {id:"faucet", name:"절수 수도꼭지 설치하기", at:[0.45,1.5,26], href:"water-01.html"},
  {id:"toilet", name:"절수형 변기 사용하기", at:[0.7,3.5,19], href:"water-02.html"},
  {id:"fridge", name:"냉장고 똑똑하게 쓰기", at:[0.75,7,45], href:"energy-12.html"},
  {id:"aircon", name:"인버터 에어컨 고르기", at:[5.8,0.35,61], href:"energy-13.html"},
  {id:"plug",   name:"스마트 플러그로 대기 전력 줄이기", at:[5.3,0,14], href:"energy-05.html"},
  {id:"window", name:"창문에 단열 에어캡 붙이기", at:[8.75,0,49], href:"energy-06.html"},
  {id:"door",   name:"문틈에 문풍지 붙이기", at:[11.2,0,44], href:"energy-07.html"}
];
const ROOMS=[];
function drawHouse(canvas,sky){
  const g=setup(canvas,HOUSE.W,HOUSE.H,sky), D=Painter(g,180,112,16,1.34);
  const {P,Q,L,dot,flat,box,winY,winX,tree,bush,person,planter}=D;
  // slab
  box(-.5,-.5,12,10,-6,6,"#c99e6e","#a07850","#86603d",{hl:false});
  // living room planks
  flat(4,0,12,10,0,"#d2a774");
  for(let x=4;x<12;x+=.55){ L([x,0,0],[x,10,0],"#b98d5c"); }
  const R=rng(5); for(let x=4;x<12;x+=.55){ for(let y=R()*2;y<10;y+=2+R()*1.5) L([x,y,0],[x+.55,y,0],"#b98d5c"); }
  for(let i=0;i<120;i++) dot(4+R()*8,R()*10,0,"#dcb586");
  // bathroom tiles, kitchen tiles
  flat(0,0,4,5,0,"#d7ecf6"); for(let i=.5;i<4;i+=.5) L([i,0,0],[i,5,0],"#b7d6e6"); for(let j=.5;j<5;j+=.5) L([0,j,0],[4,j,0],"#b7d6e6");
  flat(0,5,4,10,0,"#f1e6cc"); for(let i=0;i<8;i++) for(let j=0;j<10;j++) if((i+j)%2) flat(i*.5,5+j*.5,i*.5+.5,5+j*.5+.5,0,"#e6d6b4");
  // rug + sunlight
  flat(6.3,3.8,10.7,7.7,0,"#e9b2a0"); flat(6.6,4.1,10.4,7.4,0,"#f1c8b8"); flat(6.9,4.4,10.1,7.1,0,"#e9b2a0");
  for(let x=7.2;x<10;x+=.6) dot(x,5.75,0,"#d98d78",2,1);
  Q([[7.6,.2,0],[10,.2,0],[10.6,3,0],[8.2,3,0]],"rgba(255,250,210,.35)");
  // walls: back-right (y=0) and back-left (x=0) with thickness
  box(-.5,-.5,12,0,0,64,"#bfb6a3","#f6f0e2","#d6cfbe",{hl:false});
  box(-.5,0,0,10,0,64,"#bfb6a3","#ece4d2","#e9e2d1",{hl:false});
  // wallpaper stripes in living room
  for(let x=4.4;x<12;x+=.8) Q([[x,0,0],[x+.3,0,0],[x+.3,0,64],[x,0,64]],"#f0e9d8");
  Q([[0,0,0],[0,5,0],[0,5,64],[0,0,64]],"#dff0f8"); for(let z=6;z<64;z+=6) L([0,0,z],[0,5,z],"#c4dfec"); for(let y=.6;y<5;y+=.6) L([0,y,0],[0,y,64],"#c4dfec");
  Q([[0,5,0],[0,10,0],[0,10,64],[0,5,64]],"#f3ead6");
  // baseboards
  Q([[4,0,0],[12,0,0],[12,0,3],[4,0,3]],"#cdbfa3"); Q([[0,5,0],[0,10,0],[0,10,3],[0,5,3]],"#cdbfa3");
  // wall outlines
  L([-.5,-.5,64],[12,-.5,64]); L([12,-.5,64],[12,0,64]); L([12,0,64],[0,0,64]); L([0,0,64],[0,10,64]); L([0,10,64],[-.5,10,64]); L([-.5,10,64],[-.5,-.5,64]);
  L([12,0,0],[12,0,64]); L([0,10,0],[0,10,64]); L([0,10,0],[12,10,0],"#6f4f33"); L([12,10,0],[12,0,0],"#6f4f33");
  // window with bubble wrap + curtain
  winY(7.4,10.1,0,20,46,"#bfe0f2","#ffffff");
  for(let x=7.9;x<9.8;x+=.42) for(let z=24;z<43;z+=3.2){ const p=P(x,0,z); g.fillStyle="#ffffff"; g.fillRect(p[0],p[1]-1,2,2); g.fillStyle="#9cc9e2"; g.fillRect(p[0]+1,p[1],1,1);} 
  Q([[7,0,18],[7.5,0,18],[7.5,0,48],[7,0,48]],"#e5a33a"); Q([[10,0,18],[10.5,0,18],[10.5,0,48],[10,0,48]],"#e5a33a"); L([6.8,0,49],[10.7,0,49],"#6a5a48");
  // door with draft strips
  Q([[10.9,0,0],[12,0,0],[12,0,42],[10.9,0,42]],C.ol); Q([[11,0,0],[11.95,0,0],[11.95,0,40],[11,0,40]],"#a8774c");
  Q([[11.15,0,4],[11.8,0,4],[11.8,0,18],[11.15,0,18]],"#956640"); Q([[11.15,0,22],[11.8,0,22],[11.8,0,36],[11.15,0,36]],"#956640");
  Q([[11,0,0],[11.1,0,0],[11.1,0,40],[11,0,40]],"#e0a91b"); dot(11.75,0,20,C.yellow,2,1);
  // plug + aircon
  Q([[5.05,0,8],[5.6,0,8],[5.6,0,13],[5.05,0,13]],"#ffffff"); dot(5.2,0,11.5,C.ol); dot(5.42,0,11.5,C.ol); dot(5.5,0,9.5,"#3cc45a"); L([5.05,0,8],[5.6,0,8],"#b9b3a6");
  box(4.6,0,7.2,.8,52,9,"#ffffff","#f4f4f4","#d9d9d9"); L([4.8,.8,53.5],[7,.8,53.5],"#9aa0a6"); L([4.8,.8,54.5],[7,.8,54.5],"#c4c8cc"); dot(6.8,.8,58,"#3cc45a");
  // frame on bathroom wall: mirror
  winX(0,.9,2.1,28,42,"#cfe6f2","#c6b28f");
  // towel bar
  L([0,3.2,36],[0,4.4,36],"#9aa0a6"); Q([[0,3.3,36],[0,4.3,36],[0,4.3,28],[0,3.3,28]],"#f0a3b5");
  // bathtub along y=0
  box(1.6,0,3.9,1.3,0,10,"#ffffff","#f2f2f2","#d9d9d9"); flat(1.85,.2,3.65,1.1,10,"#9fd0ea"); L([2,.4,10],[2.6,.6,10],"#d6eef8");
  // low partitions (cutaway)
  box(4,0,4.3,5,0,16,"#e3dccb","#f4efe2","#d6cfbe");
  box(0,5,3,5.3,0,16,"#e3dccb","#f4efe2","#d6cfbe");
  // sink: pedestal, basin, faucet
  Q([[.2,1,0],[1.6,1,0],[1.6,2.1,0],[.2,2.1,0]],"rgba(0,0,0,.12)");
  box(0,1.1,.7,1.9,0,13,"#ffffff","#f0f0f0","#d8d8d8");
  box(0,.8,1.3,2.2,13,4,"#ffffff","#f6f6f6","#dcdcdc");
  flat(.25,1.05,1.1,1.95,17,"#bfe0f2"); dot(.7,1.5,17,"#7fb3d9");
  box(0,1.33,.35,1.67,17,5.5,"#d6dade","#a9aeb3","#868b91",{hl:false,ol:false});
  box(.15,1.4,.8,1.6,21.5,1.6,"#d6dade","#a9aeb3","#868b91",{hl:false,ol:false});
  dot(.75,1.5,20.6,"#6fb3e0"); dot(.75,1.5,19.3,"#6fb3e0");
  // toilet
  box(0,3,.55,4,8,10,"#ffffff","#f0f0f0","#d8d8d8"); box(0,3.1,1.35,3.9,0,8,"#ffffff","#f6f6f6","#dcdcdc"); flat(.6,3.25,1.2,3.75,8,"#e6eef2"); dot(.3,3.5,18.3,"#9aa0a6",2,1);
  // kitchen: upper cabinet, fridge, counter with stove
  box(0,8.2,.7,10,40,12,"#e8d7b5","#d9c59d","#c4ae83"); L([.7,9.1,40],[.7,9.1,52],"#b09a70");
  box(0,6,1.45,8,0,42,"#f9f9f9","#eeeeee","#d2d2d2"); L([1.45,6.1,27],[1.45,7.9,27],"#b5b5b5");
  L([1.45,7.7,30],[1.45,7.7,37],"#8f8f8f"); L([1.45,7.7,15],[1.45,7.7,24],"#8f8f8f"); dot(1.45,6.5,34,C.red,2,2); dot(1.45,6.9,32,C.yellow,2,2);
  box(0,8.3,1.45,10,0,16,"#d9c7a3","#c9b58e","#b09c74"); flat(.15,8.4,1.35,9.9,16,"#5a5d62"); [[.5,8.8],[.95,9.5]].forEach(([x,y])=>{dot(x,y,16,"#2b2c2f",3,2);}); 
  // living room: sofa with cushions, table, lamp, plant, bookshelf
  Q([[6,1.4,0],[10.4,1.4,0],[10.4,1.9,0],[6,1.9,0]],"rgba(0,0,0,.14)");
  box(6,0,10,1.4,0,7,"#5b8bb8","#6b9bc6","#4f7aa3"); box(6,0,10,.55,7,9,"#5b8bb8","#6b9bc6","#4f7aa3");
  box(6.2,.55,7.8,1.3,7,2,"#7fa9d1","#8fb6da","#6a93bb",{hl:false}); box(8.2,.55,9.8,1.3,7,2,"#7fa9d1","#8fb6da","#6a93bb",{hl:false});
  box(6.6,.2,7.4,.6,9,4,"#f2c230","#f2c230","#d4a71f",{hl:false});
  Q([[7.5,6.2,0],[9.9,6.2,0],[9.9,6.6,0],[7.5,6.6,0]],"rgba(0,0,0,.14)");
  box(7.5,4.6,9.5,6.2,0,5,"#c49a6c","#a87f53","#8b6643"); box(7.9,5,8.5,5.5,5,3,"#ffffff","#eeeeee","#cccccc",{hl:false});
  const lp=P(4.8,1,0), lt=P(4.8,1,34); g.fillStyle="#4a4d52"; g.fillRect(lp[0],lt[1],1,lp[1]-lt[1]); box(4.5,.7,5.1,1.3,32,6,"#fff3c4","#f7e08a","#e0c35e",{hl:false});
  box(11.2,7.4,11.9,8.2,0,6,"#c97a5c","#b5654a","#9a4f39"); tree(11.55,7.8,6,3.2,1);
  box(11.1,2.2,11.9,5,0,30,"#a87f53","#c49a6c","#8b6643");
  for(let z=7;z<30;z+=7.5){ L([11.9,2.2,z],[11.9,5,z],"#6f4f33"); [["#d9534f",2.4],["#3b82c4",2.8],["#f2c230",3.2],["#4f9a48",3.7],["#a98bd6",4.2]].forEach(([c,y])=>Q([[11.9,y,z+.6],[11.9,y+.3,z+.6],[11.9,y+.3,z+5.5],[11.9,y,z+5.5]],c)); }

  // ---- extra props ----
  // bathroom
  flat(1.7,1.6,3.2,2.5,0,"#f0a3b5"); for(let x=1.8;x<3.2;x+=.3) dot(x,2.5,0,"#e48aa0");
  dot(2.9,.6,10.4,C.yellow,3,2); dot(3.15,.6,11.2,"#e8893a",1,1);
  box(0,2.6,.5,3.3,30,1,"#e9e4d6","#d6cfbe","#c4bba8",{hl:false}); [["#3b82c4",2.7],["#f0a3b5",2.95],["#4f9a48",3.15]].forEach(([c,y])=>box(.1,y,.3,y+.15,31,3,c,c,c,{hl:false,ol:false}));
  box(.95,1.1,1.15,1.3,17,2.4,"#7fb3d9","#6fa6cc","#5d8fb8",{hl:false,ol:false}); dot(1.02,1.18,20.6,C.red); dot(1.08,1.22,20.6,C.green);
  box(2.6,3.7,3.5,4.6,0,6,"#d9c7a3","#c9b58e","#b09c74"); for(let z=1;z<6;z+=1.5) L([2.6,4.6,z],[3.5,4.6,z],"#b09c74"); dot(2.8,4,6.4,C.white,3,1); dot(3,4.2,6.6,"#5b8bb8",2,1);
  box(3.5,.3,3.9,.7,10,2,"#c97a5c","#b5654a","#9a4f39",{hl:false}); tree(3.7,.5,12,1.8,0);
  // kitchen: table + chairs, fruit, kettle, clock, utensils
  Q([[2,6.6,0],[3.8,6.6,0],[3.8,8.6,0],[2,8.6,0]],"rgba(0,0,0,.1)");
  box(2.7,6.2,3.3,6.7,0,6,"#a87f53","#c49a6c","#8b6643",{hl:false}); box(2.7,6.2,3.3,6.35,6,5,"#a87f53","#c49a6c","#8b6643",{hl:false});
  box(2,6.8,3.8,8.3,9,1,"#e8d7b5","#d9c59d","#c4ae83"); L([2.15,8.3,0],[2.15,8.3,9],"#8b6643"); L([3.65,8.3,0],[3.65,8.3,9],"#8b6643"); L([3.8,6.95,0],[3.8,6.95,9],"#8b6643");
  box(2.7,8.4,3.3,8.9,0,6,"#a87f53","#c49a6c","#8b6643",{hl:false}); 
  box(2.6,7.2,3.2,7.8,10,1,"#ffffff","#eeeeee","#d0d0d0",{hl:false}); dot(2.8,7.4,11.4,C.red,2,2); dot(3,7.6,11.4,C.yellow,2,2); dot(2.75,7.65,11.6,"#8bc34a",2,2);
  box(.4,8.6,.9,9.1,16,2.6,"#d9534f","#c9453f","#a83a35",{hl:false}); dot(.9,8.85,17.8,"#a83a35",2,1);
  { const c=P(0,7,55); g.fillStyle=C.ol; g.fillRect(c[0]-3,c[1]-3,6,6); g.fillStyle=C.white; g.fillRect(c[0]-2,c[1]-2,4,4); g.fillStyle=C.ol; g.fillRect(c[0],c[1]-2,1,2); g.fillRect(c[0],c[1],2,1); }
  [[8.6,"#9aa0a6"],[9,"#c49a6c"],[9.4,"#9aa0a6"],[9.8,"#5a5d62"]].forEach(([y,c])=>L([0,y,34],[0,y,28],c)); L([0,8.4,34.5],[0,10,34.5],"#6a5a48");
  Q([[0,5.6,30],[0,6,30],[0,6,40],[0,5.6,40]],"#ffffff"); Q([[0,5.6,38],[0,6,38],[0,6,40],[0,5.6,40]],C.red);
  // living: frames, TV, cat, cushions, toys, slippers, tall plant
  Q([[4.6,0,24],[5.7,0,24],[5.7,0,33],[4.6,0,33]],"#8b6643"); Q([[4.7,0,25],[5.6,0,25],[5.6,0,32],[4.7,0,32]],"#cfe6f2"); Q([[4.7,0,25],[5.6,0,25],[5.6,0,28],[4.7,0,28]],"#8cc16a"); dot(5.3,0,31,C.yellow,2,2);
  Q([[6.1,0,34],[6.7,0,34],[6.7,0,40],[6.1,0,40]],"#8b6643"); Q([[6.15,0,34.6],[6.65,0,34.6],[6.65,0,39.4],[6.15,0,39.4]],"#f0a3b5");
  box(4.3,2.2,5,4.4,0,8,"#7a5232","#a87f53","#8b6643"); box(4.35,2.4,4.55,4.2,8,12,"#2b2c2f","#2b2c2f","#3a3d42"); Q([[4.55,2.55,9],[4.55,4.05,9],[4.55,4.05,19],[4.55,2.55,19]],"#4a7fb0"); L([4.55,2.7,17],[4.55,3.2,18],"#9cc4e4");
  { const c=P(8.2,6.9,0); g.fillStyle="#e8893a"; g.fillRect(c[0]-4,c[1]-3,8,3); g.fillRect(c[0]+3,c[1]-5,3,3); g.fillStyle="#c96f28"; g.fillRect(c[0]-3,c[1]-2,2,1); g.fillRect(c[0],c[1]-2,2,1); g.fillStyle="#e8893a"; g.fillRect(c[0]+3,c[1]-6,1,1); g.fillRect(c[0]+5,c[1]-6,1,1); g.fillStyle=C.ol; g.fillRect(c[0]+4,c[1]-4,1,1); }
  box(10.6,6.2,11.4,7,0,1.6,"#d9534f","#c9453f","#a83a35",{hl:false}); box(5.4,6.6,6.2,7.4,0,1.6,"#5b8bb8","#4f7aa3","#3f6a91",{hl:false});
  [[9.2,8.6,C.red],[9.6,8.7,C.yellow],[9.4,9.1,C.blue],[9.45,8.85,"#4f9a48",1.6]].forEach(([x,y,c,z])=>box(x,y,x+.35,y+.35,z||0,1.6,c,c,"rgba(0,0,0,.25)",{hl:false,ol:false}));
  dot(10.9,1.6,0,"#5b8bb8",3,1); dot(11.3,1.8,0,"#5b8bb8",3,1); flat(10.8,.2,12,1.4,0,"#a8946c"); for(let x=10.9;x<12;x+=.25) L([x,.2,0],[x,1.4,0],"#968360");
  box(4.5,9,5.2,9.7,0,4,"#e6d6b4","#d9c59d","#c4ae83"); tree(4.85,9.35,4,4.6,1);
  box(7.2,8.6,7.8,9.2,0,3,"#ffffff","#f0f0f0","#d8d8d8",{hl:false}); tree(7.5,8.9,3,2.4,0);
  { const c=P(10.4,2.4,0); for(let i=0;i<3;i++){ g.fillStyle=[C.red,"#3b82c4","#f2c230"][i]; g.fillRect(c[0]-6+i*3,c[1]-2-i,3,2);} }
  return {P:D.P, W:HOUSE.W, H:HOUSE.H};
}
/* ---------------- apartment unit (cutaway): entrance hall, living room, balcony ---------------- */
const APT_ITEMS=[
  {id:"erv",     name:"전열 교환기 사용하기", at:[5.6,0,40], href:"energy-02.html"},
  {id:"sensor",  name:"센서등 설치하기", at:[.2,2.3,52], href:"energy-04.html"},
  {id:"balcony", name:"베란다에 태양광 패널 달기", at:[12.7,4.8,22], href:"energy-10.html"}
];
function drawApt(canvas,sky){
  const g=setup(canvas,HOUSE.W,HOUSE.H,sky), D=Painter(g,180,112,16,1.34);
  const {P,Q,L,dot,flat,box,winY,winX,tree,bush,person,planter}=D;
  const R=rng(17);
  // far-away apartment towers in the background (sky)
  [[330,40,26,120],[362,62,22,110],[24,70,22,100]].forEach(([x,y,w,h])=>{ g.fillStyle="#c9d6df"; g.fillRect(x,y,w,h); g.fillStyle="#b3c3ce"; for(let yy=y+4;yy<y+h;yy+=5) for(let xx=x+3;xx<x+w-2;xx+=4) g.fillRect(xx,yy,2,2); g.fillStyle="#9fb1bf"; g.fillRect(x,y,w,3); });
  // concrete slab (high floor) with facade band below
  box(-.5,-.5,12.6,10,-8,8,"#d8d4cc","#c9c4ba","#b5afa4",{hl:false});
  for(let x=0;x<12.6;x+=1.2) L([x,10,-8],[x,10,-1],"#bdb7ac");
  // living room wood floor
  flat(3,0,9.4,10,0,"#d9b27e"); for(let x=3;x<9.4;x+=.5) L([x,0,0],[x,10,0],"#c39a66"); for(let i=0;i<90;i++) dot(3+R()*6.4,R()*10,0,"#e4c08f");
  // entrance hall: sunken tile floor + 중문 area
  flat(0,0,3,4.2,0,"#cfc8bb"); for(let x=.5;x<3;x+=.5) L([x,0,0],[x,4.2,0],"#b8b0a2"); for(let y=.5;y<4.2;y+=.5) L([0,y,0],[3,y,0],"#b8b0a2");
  Q([[0,4.2,0],[3,4.2,0],[3,4.2,1.2],[0,4.2,1.2]],"#a89f90"); flat(0,4.2,3,10,0,"#d9b27e"); for(let x=0;x<3;x+=.5) L([x,4.2,0],[x,10,0],"#c39a66");
  // balcony: tiles
  flat(9.4,0,12,10,0,"#c7c0b2"); for(let x=9.9;x<12;x+=.65) L([x,0,0],[x,10,0],"#b3ab9c"); for(let y=.65;y<10;y+=.65) L([9.4,y,0],[12,y,0],"#b3ab9c");
  // rug + sunlight
  flat(4.6,4,8.2,7.6,0,"#9fc0d8"); flat(4.9,4.3,7.9,7.3,0,"#b8d3e6"); for(let x=5.2;x<7.8;x+=.6) dot(x,5.8,0,"#7fa8c7",2,1);
  Q([[9.4,2,0],[9.4,8,0],[7.6,8.6,0],[7.6,2.6,0]],"rgba(255,250,210,.32)");
  // back walls
  box(-.5,-.5,12.6,0,0,64,"#bfb6a3","#f4f1ea","#d6cfbe",{hl:false});
  box(-.5,0,0,10,0,64,"#bfb6a3","#ebe6dc","#e9e2d1",{hl:false});
  Q([[9.4,0,0],[12.6,0,0],[12.6,0,64],[9.4,0,64]],"#e6e1d6");
  for(let x=3.4;x<9.4;x+=.9) Q([[x,0,0],[x+.35,0,0],[x+.35,0,64],[x,0,64]],"#efebe2");
  Q([[3,0,0],[9.4,0,0],[9.4,0,3],[3,0,3]],"#cdbfa3"); Q([[0,4.2,1.2],[0,10,1.2],[0,10,4],[0,4.2,4]],"#cdbfa3");
  L([-.5,-.5,64],[12.6,-.5,64]); L([12.6,-.5,64],[12.6,0,64]); L([12.6,0,64],[0,0,64]); L([0,0,64],[0,10,64]); L([0,10,64],[-.5,10,64]); L([-.5,10,64],[-.5,-.5,64]);
  L([12.6,0,0],[12.6,0,64]); L([0,10,0],[0,10,64]); L([0,10,0],[12,10,0],"#8f887c"); L([12,10,0],[12,0,0],"#8f887c");
  // ceiling bulkhead along the back wall with ERV duct and diffusers
  box(0,0,12.6,1.3,58,6,"#f7f5f0","#ffffff","#e6e2da");
  [[4.6],[7.6]].forEach(([x])=>{ Q([[x,.25,58],[x+1.1,.25,58],[x+1.1,1.05,58],[x,1.05,58]],"#d9dde1"); for(let k=1;k<4;k++){ const xx=x+k*.27; L([xx,.3,58],[xx,1,58],"#aeb4ba"); } });
  // ERV wall controller
  Q([[5.1,0,34],[6.2,0,34],[6.2,0,42],[5.1,0,42]],"#ffffff"); L([5.1,0,34],[6.2,0,34],"#b9b3a6"); Q([[5.25,0,37],[6.05,0,37],[6.05,0,41],[5.25,0,41]],"#2f6b8a"); dot(5.4,0,40,"#9be0ff",3,1); dot(5.4,0,38.6,"#9be0ff",2,1); dot(5.3,0,35.6,"#3cc45a"); dot(5.6,0,35.6,"#d9dde1"); dot(5.9,0,35.6,"#d9dde1");
  // entrance: front door on x=0 wall, shoe cabinet on y=0 wall, mirror, sensor light above the door
  Q([[0,1.2,0],[0,3.4,0],[0,3.4,42],[0,1.2,42]],C.ol); Q([[0,1.3,0],[0,3.3,0],[0,3.3,41],[0,1.3,41]],"#6f7f8c"); Q([[0,1.5,3],[0,3.1,3],[0,3.1,38],[0,1.5,38]],"#7f909d"); dot(0,3,22,"#d6dade",1,3); dot(0,2.2,32,"#2b2c2f",2,2);
  box(.4,0,2.8,.9,0,30,"#e8e2d6","#f6f2ea","#d9d2c4"); L([1.6,.9,2],[1.6,.9,28],"#c9c0ae"); L([.4,.9,15],[2.8,.9,15],"#c9c0ae"); dot(1.45,.9,20,"#9aa0a6",1,2); dot(1.75,.9,20,"#9aa0a6",1,2);
  box(.8,.1,1.3,.6,30,4,"#f0a3b5","#e48aa0","#c9748a",{hl:false}); tree(1.05,.35,34,2.2,0);
  dot(.6,1.8,0,"#3b82c4",3,1); dot(.9,2.4,0,"#d9534f",3,1); dot(1.8,1.6,0,"#2b2c2f",3,1);
  // motion-sensor light on the wall above the front door
  box(0,1.95,.35,2.65,47,3,"#e9ecef","#ffffff","#d6dade",{hl:false});
  { const p=P(.35,2.3,47); g.fillStyle="#fff6c8"; g.fillRect(p[0]-3,p[1],6,2); g.fillStyle="#9aa0a6"; g.fillRect(p[0]-1,p[1]-2,2,1); }
  // living: wall TV + console, sofa, side table, lamp, plants, family photos
  box(3.5,.1,7.6,1.1,0,5,"#e8e2d6","#f6f2ea","#d9d2c4"); for(let x=4.5;x<7.6;x+=1) L([x,1.1,1],[x,1.1,4.6],"#c9c0ae");
  Q([[4,0,14],[7.1,0,14],[7.1,0,30],[4,0,30]],"#24262b"); Q([[4.15,0,15],[6.95,0,15],[6.95,0,29],[4.15,0,29]],"#3f6c8f"); Q([[4.15,0,15],[6.95,0,15],[6.95,0,20],[4.15,0,20]],"#5d9a62"); dot(6.4,0,27,C.yellow,2,2);
  box(3.6,.3,4,.7,5,3,"#3a3d42","#3a3d42","#2a2c30",{hl:false}); box(7.1,.3,7.5,.7,5,3,"#3a3d42","#3a3d42","#2a2c30",{hl:false});
  Q([[4.2,8.8,0],[8.4,8.8,0],[8.4,9.2,0],[4.2,9.2,0]],"rgba(0,0,0,.14)");
  box(4.2,8.2,8.4,9.8,0,7,"#d8c9ad","#e6d9c0","#c9b893"); box(4.2,9.2,8.4,9.8,7,8,"#d8c9ad","#e6d9c0","#c9b893");
  box(4.4,8.3,6.2,9.1,7,2,"#efe5d2","#f6eedf","#dccfb8",{hl:false}); box(6.4,8.3,8.2,9.1,7,2,"#efe5d2","#f6eedf","#dccfb8",{hl:false}); box(4.6,8.8,5.4,9.2,9,4,"#5b8bb8","#6b9bc6","#4f7aa3",{hl:false}); box(7.2,8.8,8,9.2,9,4,"#e8893a","#e8893a","#c96f28",{hl:false});
  box(5.4,5,7.4,6.4,0,4,"#ffffff","#f0f0f0","#d8d8d8"); box(5.7,5.3,6.2,5.8,4,1.6,"#e9b2a0","#d98d78","#c47862",{hl:false}); dot(6.6,5.6,4.2,"#4f9a48",2,2); dot(6.9,5.9,4.4,C.red,2,1);
  box(8.6,8.4,9.2,9,0,3,"#c97a5c","#b5654a","#9a4f39"); tree(8.9,8.7,3,4,1);
  Q([[0,5.4,26],[0,6.6,26],[0,6.6,34],[0,5.4,34]],"#8b6643"); Q([[0,5.5,27],[0,6.5,27],[0,6.5,33],[0,5.5,33]],"#cfe6f2"); Q([[0,5.5,27],[0,6.5,27],[0,6.5,29],[0,5.5,29]],"#8cc16a");
  Q([[0,7.2,24],[0,8,24],[0,8,30],[0,7.2,30]],"#8b6643"); Q([[0,7.3,25],[0,7.9,25],[0,7.9,29],[0,7.3,29]],"#f0a3b5");
  { const c=P(6.6,7.1,0); g.fillStyle="#f4f1e8"; g.fillRect(c[0]-4,c[1]-3,7,3); g.fillRect(c[0]+2,c[1]-5,3,3); g.fillStyle="#c9c4ba"; g.fillRect(c[0]-3,c[1]-2,2,1); g.fillStyle="#2b2c2f"; g.fillRect(c[0]+3,c[1]-4,1,1); }
  Q([[.6,6.4,0],[2.6,6.4,0],[2.6,8.6,0],[.6,8.6,0]],"rgba(0,0,0,.1)");
  box(.7,6.2,2.5,8.4,9,1,"#c49a6c","#a87f53","#8b6643"); L([.85,8.4,0],[.85,8.4,9],"#6f4f33"); L([2.35,8.4,0],[2.35,8.4,9],"#6f4f33"); L([2.5,6.35,0],[2.5,6.35,9],"#6f4f33");
  box(2.8,6.6,3.3,7.2,0,5,"#e6d9c0","#efe5d2","#d2c3a5",{hl:false}); box(2.8,7.4,3.3,8,0,5,"#e6d9c0","#efe5d2","#d2c3a5",{hl:false});
  box(1.1,6.8,1.7,7.4,10,2,"#ffffff","#eeeeee","#d0d0d0",{hl:false}); dot(1.3,7,12.4,C.red,2,2); dot(1.5,7.2,12.4,C.yellow,2,2); box(1.9,7.6,2.2,7.9,10,1.6,"#7fb3d9","#6fa6cc","#5d8fb8",{hl:false});
  { const c=P(7.9,3.2,0); g.fillStyle="#3a3d42"; g.fillRect(c[0]-4,c[1]-3,9,3); g.fillStyle="#5b6068"; g.fillRect(c[0]-3,c[1]-4,7,1); dot(7.9,3.2,1.8,"#3cc45a"); }
  // sliding glass doors between living room and balcony (low frames, cutaway)
  box(9.3,0,9.5,10,0,4,"#d6dade","#e9ecef","#b9c0c6",{hl:false});
  Q([[9.4,.2,4],[9.4,1,4],[9.4,1,46],[9.4,.2,46]],"#f2ede3"); Q([[9.4,.4,4],[9.4,.9,4],[9.4,.9,44],[9.4,.4,44]],"#e7dcc6");
  // balcony: laundry rack, plants, washing machine, outer parapet + railing
  box(9.7,.2,11.2,1.6,0,12,"#ffffff","#f4f5f6","#d6dadf"); { const p=P(11.2,.9,6); g.fillStyle="#9aa0a6"; g.fillRect(p[0]-2,p[1]-3,5,5); g.fillStyle="#bfe3f4"; g.fillRect(p[0]-1,p[1]-2,3,3);} 
  L([9.8,3,0],[10.6,3,18],"#9aa0a6"); L([11.4,3,0],[10.6,3,18],"#9aa0a6"); L([9.8,7,0],[10.6,7,18],"#9aa0a6"); L([11.4,7,0],[10.6,7,18],"#9aa0a6"); L([10.6,3,18],[10.6,7,18],"#9aa0a6");
  [[3.4,"#f2c230"],[4.2,"#ffffff"],[5,"#5b8bb8"],[5.8,"#f0a3b5"],[6.5,"#8cc16a"]].forEach(([y,c])=>Q([[10.6,y,18],[10.6,y+.55,18],[10.6,y+.55,11],[10.6,y,11]],c));
  [[10.2,8.4,0],[11.2,8.8,1],[10.4,9.3,0]].forEach(([x,y,k])=>{ box(x-.3,y-.3,x+.3,y+.3,0,2.6,"#c97a5c","#b5654a","#9a4f39",{hl:false}); tree(x,y,2.6,2.2,k); });
  box(12,0,12.6,10,0,11,"#e3dfd6","#f2efe8","#cfc9bd");
  for(let y=.3;y<10;y+=.45) L([12.3,y,11],[12.3,y,19],"#8f979e"); L([12.3,0,19],[12.3,10,19],"#6f777e"); L([12.3,0,15],[12.3,10,15],"#8f979e");
  // balcony solar panel hung outside the railing, tilted outward
  Q([[12.85,2.6,5],[12.85,7,5],[12.6,7,20],[12.6,2.6,20]],"#25496d");
  for(let y=3.15;y<7;y+=.55) L([12.85,y,5],[12.6,y,20],"#3d6a96"); for(let z=8.75;z<20;z+=3.75){ const t=(z-5)/15; L([12.85-.25*t,2.6,z],[12.85-.25*t,7,z],"#3d6a96"); }
  L([12.85,2.6,5],[12.85,7,5],"#e3e8ec"); L([12.6,2.6,20],[12.6,7,20],"#e3e8ec"); L([12.85,7,5],[12.6,7,20],"#e3e8ec"); L([12.85,2.6,5],[12.6,2.6,20],"#cfd5da");
  L([12.85,3.3,22],[12.85,3.3,8],"#2b2c2f"); dot(12.6,4.6,17,"rgba(255,255,255,.6)",2,1);
  L([12.3,5,11],[11.8,5.6,3],"#2b2c2f"); box(11.5,5.4,11.9,5.9,0,3,"#ffffff","#eeeeee","#cfd5da",{hl:false}); dot(11.7,5.9,2,"#3cc45a");
  return {P:D.P, W:HOUSE.W, H:HOUSE.H};
}
/* ---------------- school: classroom cutaway + garden with rain barrel ---------------- */
const SCHOOL_ITEMS=[
  {id:"rain",  name:"빗물 저금통으로 빗물 모으기", at:[10.4,.9,22], href:"water-03.html"},
  {id:"paper", name:"재생 종이 쓰기", at:[7,1.2,20], href:"forest-02.html"}
];
function drawSchool(canvas,sky){
  const g=setup(canvas,HOUSE.W,HOUSE.H,sky), D=Painter(g,180,112,16,1.34);
  const {P,Q,L,dot,flat,box,winY,winX,tree,bush,person,planter,flowers,path}=D;
  const R=rng(23);
  // ground slab
  box(-.5,-.5,12.6,10,-6,6,"#c99e6e","#a07850","#86603d",{hl:false});
  // classroom floor (wood) and garden (grass)
  flat(0,0,8.4,10,0,"#d9b27e"); for(let x=0;x<8.4;x+=.5) L([x,0,0],[x,10,0],"#c39a66"); for(let i=0;i<80;i++) dot(R()*8.4,R()*10,0,"#e4c08f");
  flat(8.4,0,12.6,10,0,C.grass); for(let i=0;i<260;i++) dot(8.4+R()*4.2,R()*10,0,R()<.5?C.grassL:C.grassD);
  path([[9.2,10],[9.6,7],[10.8,5.2],[11.6,3.4]],.7,"#e3dccb","#cfc6b3");
  // back walls: classroom (inside) + school exterior (outside part, red brick base + white)
  box(-.5,-.5,8.4,0,0,64,"#bfb6a3","#f6f3ea","#d6cfbe",{hl:false});
  box(-.5,0,0,10,0,64,"#bfb6a3","#efeae0","#e9e2d1",{hl:false});
  box(8.4,-.5,12.6,0,0,64,"#bfb6a3","#f4f5f6","#d6dadf",{hl:false});
  Q([[8.4,0,0],[12.6,0,0],[12.6,0,14],[8.4,0,14]],"#b5654a"); for(let z=2;z<14;z+=2) L([8.4,0,z],[12.6,0,z],"#9a4f39"); for(let x=8.8;x<12.6;x+=.8) for(let z=0;z<14;z+=4) L([x,0,z],[x,0,z+2],"#9a4f39");
  Q([[8.6,0,22],[12.4,0,22],[12.4,0,34],[8.6,0,34]],"#8fb6d3"); Q([[8.6,0,40],[12.4,0,40],[12.4,0,52],[8.6,0,52]],"#8fb6d3"); for(let x=9.4;x<12.4;x+=.95){ L([x,0,22],[x,0,34],"#e9eef2"); L([x,0,40],[x,0,52],"#e9eef2"); }
  L([8.4,0,64],[12.6,0,64]); L([12.6,0,0],[12.6,0,64]); L([12.6,-.5,64],[12.6,0,64]);
  // classroom wall details: wainscot, blackboard + TV, notice board, clock, flag
  Q([[0,0,0],[8.4,0,0],[8.4,0,14],[0,0,14]],"#e6d8bc"); L([0,0,14],[8.4,0,14],"#c9b893"); Q([[0,0,0],[0,10,0],[0,10,14],[0,0,14]],"#e0d1b3"); L([0,0,14],[0,10,14],"#c9b893");
  Q([[1,0,22],[6.6,0,22],[6.6,0,44],[1,0,44]],"#8b6643"); Q([[1.2,0,23],[6.4,0,23],[6.4,0,43],[1.2,0,43]],"#3f6b4f");
  L([1.6,0,38],[3.4,0,38],"#e9efe9"); L([1.6,0,34],[4.4,0,34],"#e9efe9"); L([1.6,0,30],[3.8,0,30],"#e9efe9"); dot(5.2,0,36,"#f2c230",3,3); dot(5.6,0,30,"#f0a3b5",2,2);
  Q([[1.2,0,22],[6.4,0,22],[6.4,0,21],[1.2,0,21]],"#a87f53"); dot(2,0,21.6,"#ffffff",2,1); dot(4.6,0,21.6,"#f2c230",2,1);
  Q([[2.6,0,47],[5,0,47],[5,0,58],[2.6,0,58]],"#24262b"); Q([[2.7,0,48],[4.9,0,48],[4.9,0,57],[2.7,0,57]],"#4a7fb0"); dot(3.4,0,55,"#ffffff",3,1);
  { const c=P(7.4,0,54); g.fillStyle=C.ol; g.fillRect(c[0]-3,c[1]-3,7,7); g.fillStyle=C.white; g.fillRect(c[0]-2,c[1]-2,5,5); g.fillStyle=C.ol; g.fillRect(c[0],c[1]-2,1,3); g.fillRect(c[0],c[1],2,1); }
  Q([[0,1.4,22],[0,5,22],[0,5,42],[0,1.4,42]],"#c49a6c"); Q([[0,1.6,23],[0,4.8,23],[0,4.8,41],[0,1.6,41]],"#e8d7b5");
  [[1.9,36,"#ffffff"],[2.9,37,"#f2c230"],[3.9,35,"#9fd0ea"],[2.2,29,"#f0a3b5"],[3.3,28,"#ffffff"],[4.2,30,"#b9dfae"]].forEach(([y,z,c])=>Q([[0,y,z],[0,y+.7,z],[0,y+.7,z-5],[0,y,z-5]],c));
  dot(0,1.9,37.4,C.red); dot(0,2.9,38.4,C.red); dot(0,3.9,36.4,C.blue);
  // hallway windows on x=0 wall + door
  Q([[0,5.8,28],[0,9.4,28],[0,9.4,44],[0,5.8,44]],"#ddd6c6"); Q([[0,6,29],[0,9.2,29],[0,9.2,43],[0,6,43]],"#bcd9ea"); L([0,7.6,29],[0,7.6,43],"#ddd6c6");
  Q([[0,6.4,0],[0,7.6,0],[0,7.6,26],[0,6.4,26]],"#a87f53"); Q([[0,6.6,16],[0,7.4,16],[0,7.4,23],[0,6.6,23]],"#cfe6f2"); dot(0,7.4,12,C.yellow);
  // wall between classroom and outside (cutaway low wall with window sill)
  box(8.2,0,8.6,10,0,12,"#e3dccb","#f4efe2","#d6cfbe"); box(8.1,0,8.7,10,12,1,"#ffffff","#f2f2f2","#d9d9d9");
  for(let y=1;y<10;y+=2.2){ box(8.25,y,8.55,y+.6,13,2,"#c97a5c","#b5654a","#9a4f39",{hl:false}); dot(8.4,y+.3,15.6,[C.leafL,C.pink,C.yellow,C.leaf][Math.floor(y)%4],3,2); }
  // teacher desk + recycled-paper corner (printer, paper boxes, paper recycling bin)
  box(1.2,1.6,3.6,2.6,0,8,"#c49a6c","#a87f53","#8b6643"); box(1.6,1.8,2.4,2.3,8,3,"#3a3d42","#3a3d42","#2a2c30",{hl:false}); box(2.8,1.9,3.3,2.3,8,1,"#ffffff","#eeeeee","#d0d0d0",{hl:false});
  box(6.2,.3,7.8,1.4,0,10,"#ffffff","#f2f2f2","#d4d4d4"); box(6.4,.4,7.6,1.3,10,3,"#d9dde1","#c4c9ce","#aeb4ba"); flat(6.6,.5,7.4,1.1,13,"#f6f2e6"); L([6.6,1.3,11.4],[7.4,1.3,11.4],"#2b2c2f"); dot(7.5,1.3,12,"#3cc45a");
  box(6.3,1.6,7.2,2.3,0,5,"#c7b38f","#b9a37b","#a08a63"); L([6.3,2.3,4],[7.2,2.3,4],"#8b6643"); Q([[6.45,2.3,1],[7,2.3,1],[7,2.3,3],[6.45,2.3,3]],"#4f9a48"); dot(6.6,2.3,2.4,"#ffffff",2,1);
  box(7.4,2,8,2.6,0,6,"#4f9a48","#5aa84f","#3f7f39",{hl:false}); flat(7.5,2.1,7.9,2.5,6,"#f6f2e6"); dot(7.6,2.6,3.4,"#ffffff",3,1); dot(7.65,2.6,4.4,"#ffffff",1,1);
  // student desks in rows
  for(let r=0;r<3;r++) for(let c=0;c<3;c++){ const x=1.2+c*2.2, y=4+r*1.9;
    Q([[x,y+.7,0],[x+1.4,y+.7,0],[x+1.4,y+1.2,0],[x,y+1.2,0]],"rgba(0,0,0,.1)");
    L([x+.1,y+.7,0],[x+.1,y+.7,8],"#7d838b"); L([x+1.3,y+.7,0],[x+1.3,y+.7,8],"#7d838b");
    box(x,y,x+1.4,y+.75,8,.7,"#e8d7b5","#d9c59d","#c4ae83",{hl:false});
    box(x+.35,y+1,x+1.05,y+1.5,0,5,"#5b8bb8","#6b9bc6","#4f7aa3",{hl:false}); box(x+.35,y+1.4,x+1.05,y+1.55,5,4,"#5b8bb8","#6b9bc6","#4f7aa3",{hl:false});
    const k=(r*3+c)%4; if(k!==3){ flat(x+.2,y+.15,x+.75,y+.55,8.7,["#ffffff","#f6f2e6","#b9dfae"][k]); L([x+.25,y+.3,8.7],[x+.65,y+.3,8.7],"#9aa0a6"); }
    if(k===1) box(x+.9,y+.2,x+1.2,y+.5,8.7,.8,C.red,C.red,"#a83a35",{hl:false,ol:false}); }
  bigPerson(g,P,3.9,7.6,0,"#f2c230"); bigPerson(g,P,1.8,9.4,0,"#d9534f","#6b4a2e");
  // classroom plant + bookshelf
  box(.2,8.2,1,9.8,0,16,"#a87f53","#c49a6c","#8b6643"); for(let z=5;z<16;z+=5.2){ L([1,8.2,z],[1,9.8,z],"#6f4f33"); [["#d9534f",8.4],["#3b82c4",8.7],["#f2c230",9],["#4f9a48",9.3]].forEach(([c,y])=>Q([[1,y,z+.5],[1,y+.2,z+.5],[1,y+.2,z+4],[1,y,z+4]],c)); }
  box(7.4,8.8,8,9.4,0,3,"#c97a5c","#b5654a","#9a4f39"); tree(7.7,9.1,3,3.6,1);
  // outside: downspout from the roof into the rain barrel, watering can, raised vegetable beds, kids
  box(8.4,0,12.6,.5,61,2,"#c4c8cc","#d6dadf","#9aa0a6",{hl:false}); box(10.25,.05,10.6,.4,16,45,"#c4c8cc","#b5bbc1","#8f979e",{hl:false}); for(let z=24;z<60;z+=12) box(10.2,0,10.65,.45,z,.8,"#9aa0a6","#9aa0a6","#7d838b",{hl:false,ol:false});
  box(9.8,.3,11,1.5,0,15,"#3b82c4","#4a90c8","#2f6aa3"); box(9.7,.2,11.1,1.6,15,1,"#2f6aa3","#3b82c4","#285a8b",{hl:false});
  L([9.8,1.5,5],[11,1.5,5],"#285a8b"); L([9.8,1.5,10],[11,1.5,10],"#285a8b"); dot(10.2,1.5,12.6,"#ffffff",4,1); dot(10.2,1.5,11.8,"#ffffff",3,1);
  box(11,1,11.3,1.2,3,1,"#c4c8cc","#9aa0a6","#7d838b",{hl:false,ol:false}); dot(11.3,1.1,3.4,"#7fb3d9");
  box(11.4,1.6,11.9,2.1,0,2.4,"#4f9a48","#5aa84f","#3f7f39",{hl:false}); L([11.9,1.85,2],[12.3,1.85,2.8],"#3f7f39");
  [[9.2,3.4],[9.2,6]].forEach(([x,y],i)=>{ box(x,y,x+2.6,y+1.6,0,3,"#8a6040","#a87f53","#7a5232"); flat(x+.15,y+.15,x+2.45,y+1.45,3,"#7a5232");
     for(let k=0;k<5;k++){ const xx=x+.4+k*.45; dot(xx,y+.5,3,i?"#e04b3c":"#79bd5a",2,2); dot(xx,y+1,3,"#4f9a48",2,2); } });
  flowers(11.6,4,12.5,9.6,26,61);
  tree(12,9.2,0,4.6,3); tree(11.9,5.2,0,3.4,0);
  bigPerson(g,P,10.6,8.6,0,"#3b82c4"); bigPerson(g,P,9,9.4,0,"#f0a3b5","#6b4a2e");
  { const p=P(11.4,3.2,10); g.fillStyle="#f2c230"; g.fillRect(p[0],p[1],2,1); g.fillRect(p[0]+3,p[1],2,1); g.fillStyle="#2b2c2f"; g.fillRect(p[0]+2,p[1],1,2); }
  return {P:D.P, W:HOUSE.W, H:HOUSE.H};
}
/* ---------------- big building: tower with blinds + green roof, basement water-reuse room cut open in front ---------------- */
const TOWER={W:400,H:360};
const TOWER_ITEMS=[
  {id:"grey",      name:"중수도로 물 다시 쓰기", at:[4.4,6.4,-6], href:"water-04.html"},
  {id:"awning",    name:"창문 바깥에 차양 달기", at:[7.6,4.2,48], href:"energy-08.html"},
  {id:"greenroof", name:"옥상에 식물 심기(옥상 녹화)", at:[5.2,1.8,66], href:"energy-09.html"}
];
function drawTower(canvas,sky){
  const g=setup(canvas,TOWER.W,TOWER.H,sky), D=Painter(g,186,118,16,1.34);
  const {P,Q,L,dot,flat,box,tree,bush,person,flowers,bench}=D;
  const R=rng(41), B=-24, H=58;
  [[330,24,30,150],[364,56,24,120],[14,60,26,110]].forEach(([x,y,w,h])=>{ g.fillStyle="#c9d6df"; g.fillRect(x,y,w,h); g.fillStyle="#b3c3ce"; for(let yy=y+4;yy<y+h;yy+=5) for(let xx=x+3;xx<x+w-2;xx+=4) g.fillRect(xx,yy,2,2); });
  // ground block with the basement cut open (front part y>4)
  box(-.5,-.5,12.5,4,B-3,-B+3,C.grass,"#a07850","#86603d",{hl:false});
  for(let z=B;z<0;z+=4) for(let y=-.5;y<4;y+=1.1) dot(12.5,y+R()*.6,z+R()*3,"#8a6040",2,1);
  // basement room: floor, back wall (y=4 under the building), left wall, side soil
  box(-.5,4,12.5,10.4,B-3,3,"#9a958c","#8a6040","#7a5232",{hl:false});
  flat(0,4,12,10.4,B,"#aab2b7"); for(let x=0;x<12;x+=1.2) L([x,4,B],[x,10.4,B],"#98a0a6"); flat(0,8.7,12,9,B,"#e0a91b");
  Q([[0,4,B],[12,4,B],[12,4,0],[0,4,0]],"#c9cdd0"); for(let x=0;x<12;x+=2) for(let z=B;z<0;z+=4) L([x,4,z],[x+2,4,z],"#bcc1c5");
  Q([[0,4,B],[0,10.4,B],[0,10.4,0],[0,4,0]],"#b9bec2");
  box(-.5,4,0,10.4,B,-B,"#8cc16a","#a07850","#86603d",{hl:false});
  box(12,4,12.5,10.4,B,-B,"#8cc16a","#a07850","#86603d",{hl:false});
  for(let z=B+2;z<0;z+=4) for(let y=4;y<10.4;y+=1.1) dot(12.5,y+R()*.6,z+R()*2,"#8a6040",2,1);
  // treatment line: settling -> filter -> disinfect -> storage
  [[.5,"#4f9a48"],[2.9,"#3b82c4"],[5.3,"#6aa9d6"]].forEach(([x,c])=>{ box(x,4.3,x+1.9,6.6,B,15,c,c,"rgba(0,0,0,.22)"); L([x,6.6,B+5],[x+1.9,6.6,B+5],"rgba(255,255,255,.35)"); L([x,6.6,B+10],[x+1.9,6.6,B+10],"rgba(255,255,255,.35)"); box(x+1.9,5.3,x+2.4,5.6,B+12,.6,"#7d838b","#7d838b","#5f6870",{hl:false,ol:false}); });
  box(7.8,4.3,11.6,6.8,B,17,"#d9dde1","#eef0f2","#c4c9ce"); for(let z=B+3;z<B+17;z+=3.4) L([7.8,6.8,z],[11.6,6.8,z],"#b9c0c6");
  { const p=P(9.7,6.8,B+11); g.fillStyle="#ffffff"; g.fillRect(p[0]-6,p[1]-6,13,12); g.fillStyle="#d9534f"; g.fillRect(p[0]-5,p[1]-5,11,10); g.fillStyle="#ffffff"; g.fillRect(p[0]-4,p[1]-4,9,8); g.fillStyle="#3b82c4"; g.fillRect(p[0]-1,p[1]-3,3,5); g.fillStyle="#d9534f"; for(let k=-4;k<5;k++) g.fillRect(p[0]+k,p[1]+Math.round(k*.8),1,1); }
  box(.3,4.2,12,4.5,B+19,.8,"#7f5aa8","#8f6ab8","#6a4a90",{hl:false}); for(let x=1;x<12;x+=2.4) box(x,4.15,x+.25,4.55,B+18.8,1.2,"#f2c230","#f2c230","#c4901a",{hl:false,ol:false});
  box(.3,4.2,12,4.5,B+21.4,.6,"#3b82c4","#4a90c8","#2f6aa3",{hl:false});
  box(9.6,8.4,11,9.6,B,8,"#5f6870","#6f777e","#4a5158"); dot(9.9,9.6,B+6.4,"#3cc45a",2,1); dot(10.4,9.6,B+6.4,"#f2c230",2,1); dot(9.9,9.6,B+4.4,"#9be0ff",5,2);
  box(6.6,8.2,8.2,9.6,B,4,"#3b82c4","#4a90c8","#2f6aa3",{hl:false});
  bigPerson(g,P,5,8.6,0,"#e0a91b"); bigPerson(g,P,3,9.6,0,"#4f9a48");
  // rim: railing around the cut
  for(let x=-.5;x<=12.5;x+=.6) L([x,4,0],[x,4,3],"#9aa0a6");
  // ---- tower ----
  const x0=.6,x1=11.4,y0=-.2,y1=3.8;
  box(x0,y0,x1,y1,0,H,"#cfd6dc","#6d98bd","#567f9f");
  for(let z=0;z<H;z+=8){ Q([[x0,y1,z],[x1,y1,z],[x1,y1,z+1],[x0,y1,z+1]],"#4f7aa0"); Q([[x1,y0,z],[x1,y1,z],[x1,y1,z+1],[x1,y0,z+1]],"#43698b"); }
  for(let x=x0+1.2;x<x1;x+=1.2) L([x,y1,0],[x,y1,H],"#9fc3dc"); for(let y=y0+1;y<y1;y+=1) L([x1,y,0],[x1,y,H],"#8fb2cb");
  for(let k=0;k<6;k++) L([x0+1+k*1.6,y1,10+k*7],[x0+1.8+k*1.6,y1,14+k*7],"#cfe3ee");
  // lobby: entrance glass + canopy
  Q([[4.8,y1,0],[7.2,y1,0],[7.2,y1,6],[4.8,y1,6]],"#3f5f78"); L([6,y1,0],[6,y1,6],"#9fc3dc"); box(4.4,y1,7.6,y1+.7,6.4,.6,"#ffffff","#e9ecef","#cfd5da");
  // external blinds: some floors lowered, some raised
  for(let z=1.6;z<H;z+=8){ Q([[x0,y1+.3,z+6.4],[x1,y1+.3,z+6.4],[x1,y1+.3,z+6.8],[x0,y1+.3,z+6.8]],"#d5dadf"); Q([[x1+.3,y0,z+6.4],[x1+.3,y1,z+6.4],[x1+.3,y1,z+6.8],[x1+.3,y0,z+6.8]],"#b9c0c6"); }
  [[9.6,.95,2,8],[25.6,.7,1.6,10.6],[41.6,1,4.4,11.2],[17.6,.5,6.4,11]].forEach(([z,f,a,b])=>{
    const lo=z+6-5.4*f;
    for(let zz=lo;zz<z+6;zz+=1) Q([[a,y1+.3,zz],[b,y1+.3,zz],[b,y1+.45,zz+.55],[a,y1+.45,zz+.55]],"#eceef0");
    L([a,y1+.35,lo],[b,y1+.35,lo],"#7d838b"); L([a,y1+.35,lo],[a,y1+.35,z+6],"#9aa0a6"); L([b,y1+.35,lo],[b,y1+.35,z+6],"#9aa0a6"); });
  [[33.6,.9],[9.6,.6]].forEach(([z,f])=>{ const lo=z+6-5.4*f; for(let zz=lo;zz<z+6;zz+=1) Q([[x1+.3,y0+.3,zz],[x1+.3,y1-.3,zz],[x1+.45,y1-.3,zz+.55],[x1+.45,y0+.3,zz+.55]],"#dadde0"); L([x1+.35,y0+.3,lo],[x1+.35,y1-.3,lo],"#7d838b"); });
  // ---- green roof ----
  box(x0,y0,x1,y1,H,2.2,"#6f9e5a","#8a6040","#7a5232",{hl:false}); L([x0,y1,H+.8],[x1,y1,H+.8],"#3f7f39");
  for(let i=0;i<160;i++) dot(x0+R()*(x1-x0),y0+R()*(y1-y0),H+2.2,R()<.5?C.leafL:"#5aa84f");
  flat(4.4,y0,6.2,y1,H+2.2,"#d8cdb6"); for(let y=y0+.5;y<y1;y+=.6) L([4.4,y,H+2.2],[6.2,y,H+2.2],"#c4b89e");
  for(let x=x0;x<=x1;x+=.5) L([x,y1,H+2.2],[x,y1,H+5],"#e3e8ec"); L([x0,y1,H+5],[x1,y1,H+5],"#e3e8ec");
  for(let y=y0;y<=y1;y+=.5) L([x1,y,H+2.2],[x1,y,H+5],"#cfd5da"); L([x1,y0,H+5],[x1,y1,H+5],"#cfd5da");
  flowers(x0+.2,y0+.2,4.2,y1-.2,30,77); flowers(6.4,y0+.2,x1-.2,y1-.2,36,78);
  box(7,y0+.4,8.8,y0+1.6,H+2.2,2.2,"#8a6040","#a87f53","#7a5232"); for(let k=0;k<4;k++) dot(7.3+k*.4,y0+1,H+4.4,k%2?"#e04b3c":"#79bd5a",2,2);
  tree(1.6,.8,H+2.2,5,0); tree(10.2,.6,H+2.2,5.4,3); tree(3.2,2.8,H+2.2,3.4,1); tree(9.6,3,H+2.2,3.2,0);
  box(4.6,2.6,6,3.1,H+3.4,.6,"#c49a6c","#a87f53","#8b6643",{hl:false}); box(4.6,2.6,6,2.75,H+4,1.4,"#c49a6c","#a87f53","#8b6643",{hl:false}); bigPerson(g,P,5.9,3.6,H+2.2,"#a98bd6"); bigPerson(g,P,7.6,3.4,H+2.2,"#f2c230","#6b4a2e");
  { const p=P(8,1.4,H+12); g.fillStyle="#f2c230"; g.fillRect(p[0],p[1],2,1); g.fillRect(p[0]+3,p[1],2,1); g.fillStyle="#2b2c2f"; g.fillRect(p[0]+2,p[1],1,2); }
  // street trees beside the building
  tree(12.2,10,0,0,0);
  return {P:D.P, W:TOWER.W, H:TOWER.H};
}
/* ---------------- residential rooftops: flat roof being painted white (cool roof) + gable roof with solar water heater ---------------- */
const ROOFS_ITEMS=[
  {id:"coolroof",   name:"옥상을 하얗게 칠하기(쿨 루프)", at:[2.6,5.2,32], href:"energy-03.html"},
  {id:"solarwater", name:"태양열 온수기로 물 데우기", at:[9.9,7.3,33], href:"energy-11.html"}
];
function drawRoofs(canvas,sky){
  const g=setup(canvas,HOUSE.W,HOUSE.H,sky), D=Painter(g,180,128,16,1.34);
  const {P,Q,L,dot,flat,box,house,winY,winX,doorY,doorX,tree,bush,person,flowers,shadow,planter}=D;
  const R=rng(57);
  [[60,34,40],[300,22,52],[250,70,30]].forEach(([x,y,w])=>{ g.fillStyle="#ffffff"; g.fillRect(x,y,w,6); g.fillRect(x+6,y-4,w-14,4); });
  // ground
  box(-.6,-.6,13,11,-6,6,C.grass,"#a07850","#86603d",{hl:false});
  for(let i=0;i<220;i++) dot(-.5+R()*13.4,-.5+R()*11.4,0,R()<.5?C.grassL:C.grassD);
  flat(6,-.6,6.8,11,0,C.walk); for(let y=0;y<11;y+=.8) L([6,y,0],[6.8,y,0],C.walkD);
  tree(6.6,-.3,0,4,0);
  // ---- house A: 2-storey flat-roof house ----
  const A={x0:0,y0:0,x1:5.6,y1:10,h:28};
  shadow(A.x0,A.y0,A.x1,A.y1,A.h);
  box(A.x0,A.y0,A.x1,A.y1,0,A.h,"#e8e2d6","#efe4cf","#d9c9ab",{hl:false});
  Q([[A.x0,A.y1,0],[A.x1,A.y1,0],[A.x1,A.y1,6],[A.x0,A.y1,6]],"#b5654a"); Q([[A.x1,A.y0,0],[A.x1,A.y1,0],[A.x1,A.y1,6],[A.x1,A.y0,6]],"#9a4f39");
  for(let z=1.5;z<6;z+=1.5){ L([A.x0,A.y1,z],[A.x1,A.y1,z],"#9a4f39"); L([A.x1,A.y1,z],[A.x1,A.y0,z],"#86412f"); }
  winY(.6,2.2,A.y1,9,16); winY(3.2,4.8,A.y1,9,16); winY(.6,2.2,A.y1,19,26); winY(3.2,4.8,A.y1,19,26);
  winX(A.x1,1,2.6,9,16); winX(A.x1,4.2,5.8,19,26); winX(A.x1,7.2,8.8,19,26); doorX(A.x1,7.2,8.6,12);
  box(A.x1,6.6,A.x1+.9,9.2,13,.6,"#e9ecef","#cfd5da","#b9c0c6",{hl:false});
  planter(.7,A.y1,8.6,"y"); planter(3.3,A.y1,18.6,"y");
  // flat roof with parapet: left part already painted white, right part still green (waterproof paint), worker with roller
  const Z=A.h; box(A.x0,A.y0,A.x1,A.y1,Z,.01,"#4f9a68","#efe4cf","#d9c9ab",{hl:false,ol:false});
  flat(A.x0,A.y0,A.x1,A.y1,Z,"#4f9a68"); flat(A.x0,A.y0,A.x1,6.2,Z,"#f7f7f2"); for(let x=.4;x<A.x1;x+=.7) L([x,A.y0,Z],[x,6.2,Z],"#ebebe4");
  for(let x=.3;x<A.x1;x+=.6) L([x,6.2,Z],[x,6.5,Z],"#f7f7f2");
  box(A.x0,A.y0,A.x1,.35,Z,2.4,"#f0ebe0","#e6dccb","#cfc2a8",{hl:false}); box(A.x0,.35,.35,A.y1,Z,2.4,"#f0ebe0","#e6dccb","#cfc2a8",{hl:false});
  box(A.x1-.35,.35,A.x1,A.y1,Z,2.4,"#f0ebe0","#efe4cf","#d9c9ab",{hl:false}); box(.35,A.y1-.35,A.x1-.35,A.y1,Z,2.4,"#f0ebe0","#efe4cf","#d9c9ab",{hl:false});
  // heat shimmer over the green part, cool air over the white part
  for(let k=0;k<4;k++){ const p=P(1.4+k*1.1,8.2,Z+6); g.fillStyle="rgba(232,120,60,.75)"; [[0,0],[1,-1],[0,-2],[-1,-3],[0,-4],[1,-5]].forEach(([dx,dy])=>g.fillRect(p[0]+dx,p[1]+dy,1,1)); }
  for(let k=0;k<3;k++){ const p=P(1.6+k*1.3,2.6,Z+5); g.fillStyle="rgba(120,180,230,.8)"; g.fillRect(p[0],p[1],4,1); g.fillRect(p[0]+1,p[1]-2,3,1); }
  { const p=P(1,9,Z+2); g.fillStyle="#f2c230"; g.fillRect(p[0]-1,p[1]-6,4,4); g.fillStyle="#2b2c2f"; g.fillRect(p[0],p[1]-12,2,6); g.fillStyle="#e04b3c"; g.fillRect(p[0],p[1]-9,2,3); g.fillRect(p[0],p[1]-4,2,2); }
  // painter + roller + paint bucket
  bigPerson(g,P,3.2,6.6,Z,"#3b82c4","#2b2c2f","#f2f2f2"); { const a=P(3.7,6.4,Z+8), b=P(3.4,6.2,Z); g.fillStyle="#7d838b"; for(let t=0;t<1;t+=.1) g.fillRect(Math.round(a[0]+(b[0]-a[0])*t),Math.round(a[1]+(b[1]-a[1])*t),1,1); }
  box(2.8,6,4,6.3,Z,.6,"#ffffff","#f2f2f2","#d9d9d9",{hl:false}); box(4.4,7,4.9,7.5,Z,1.6,"#ffffff","#e9ecef","#cfd5da",{hl:false}); flat(4.5,7.1,4.8,7.4,Z+1.6,"#f7f7f2");
  // rooftop life: 장독대 jars, clothesline, water tank, chair, pots
  [[1,1.2,1.1],[1.8,1,1.4],[1.4,1.9,.9],[2.5,1.6,1.2]].forEach(([x,y,s])=>{ const p=P(x,y,Z); const w=Math.round(5*s), h=Math.round(6*s); g.fillStyle="#6b3e22"; for(let dy=0;dy<h;dy++){ const ww=Math.round(w*(1-Math.abs(dy-h*.55)/h*.7)); g.fillRect(p[0]-ww,p[1]-dy,ww*2,1);} g.fillStyle="#8a5434"; g.fillRect(p[0]-w+1,p[1]-h,w*2-2,1); g.fillStyle="#a8714a"; g.fillRect(p[0]-w+2,p[1]-h+2,2,2); });
  L([3.6,.8,Z],[3.6,.8,Z+9],"#7d838b"); L([3.6,4.6,Z],[3.6,4.6,Z+9],"#7d838b"); L([3.6,.8,Z+9],[3.6,4.6,Z+9],"#9aa0a6");
  [[1.2,"#ffffff"],[2,"#f0a3b5"],[2.8,"#5b8bb8"],[3.6,"#f2c230"]].forEach(([y,c])=>Q([[3.6,y,Z+9],[3.6,y+.6,Z+9],[3.6,y+.6,Z+4.4],[3.6,y,Z+4.4]],c));
  box(4.4,.6,5.2,1.8,Z,6,"#3b82c4","#4a90c8","#2f6aa3"); L([4.4,1.8,Z+3],[5.2,1.8,Z+3],"#285a8b");
  [[4.7,3.6,0],[4.7,4.4,2]].forEach(([x,y,k])=>{ box(x-.25,y-.25,x+.25,y+.25,Z,1.6,"#c97a5c","#b5654a","#9a4f39",{hl:false}); dot(x,y,Z+2.6,k?C.red:"#4f9a48",3,2); dot(x+.1,y,Z+3.6,"#79bd5a",2,1); });
  box(7,10.2,7.4,10.6,0,3,"#d9534f","#c9453f","#a83a35",{hl:false}); D.bench(.6,10.4);
  { const c=P(6.5,4.4,0); g.fillStyle="#2b2c2f"; g.fillRect(c[0]-4,c[1]-3,3,3); g.fillRect(c[0]+2,c[1]-3,3,3); g.fillStyle="#3b82c4"; g.fillRect(c[0]-2,c[1]-5,5,1); g.fillRect(c[0],c[1]-4,1,2); }
  D.car(6.1,1.6,'y',"#f2c230");
  // ---- house B: gable roof with solar water heater ----
  Q([[7.4,1,0],[13,1,0],[13,9.4,0],[7.4,9.4,0]],C.shadow); const r=house(7.4,1,12.6,9.4,22,16,[C.wT,C.wL,C.wR,1],"#c45a4a","#a8473a","#e07a68");
  winY(8,9.6,9.4,7,15); winY(10.6,12,9.4,7,15); doorX(12.6,2,3.6,13); winX(12.6,5.4,7.4,7,15);
  planter(8.1,9.4,6.6,"y"); planter(10.7,9.4,6.6,"y");
  // collector panels on the front slope (black tubes) + tank on the ridge
  const zr=r.zr, zt=r.zt, m=r.m, y1=9.4+r.e;
  const slope=t=>[m+(y1-m)*t, zr-(zr-zt)*t];
  const [ya,za]=slope(.12), [yb,zb]=slope(.78);
  Q([[8.2,ya,za],[11.6,ya,za],[11.6,yb,zb],[8.2,yb,zb]],"#2b2c2f"); L([8.2,ya,za],[11.6,ya,za],"#cfd5da"); L([8.2,yb,zb],[11.6,yb,zb],"#cfd5da"); L([8.2,ya,za],[8.2,yb,zb],"#cfd5da"); L([11.6,ya,za],[11.6,yb,zb],"#cfd5da");
  for(let x=8.45;x<11.5;x+=.32) L([x,ya,za],[x,yb,zb],"#4a4f57");
  L([8.4,ya+.3,za-.5],[11.4,ya+.3,za-.5],"rgba(255,255,255,.5)");
  box(8.3,m-1.2,11.5,m-.1,zr-1,4,"#eef2f5","#f6f8fa","#c9d3da"); L([8.3,m-.1,zr+1],[11.5,m-.1,zr+1],"#b9c0c6"); dot(8.6,m-.1,zr+2.2,"#e04b3c",2,1);
  L([8.4,m-.6,zr-1],[8.4,m-.6,zr-4],"#7d838b"); L([11.4,m-.6,zr-1],[11.4,m-.6,zr-4],"#7d838b");
  L([11.7,m,zr-.5],[12.8,m+.4,zt+4],"#9aa0a6"); L([12.8,m+.4,zt+4],[12.8,m+.4,4],"#9aa0a6");
  // sun with rays
  { const c=[352,40]; g.fillStyle="#f6d35a"; g.beginPath(); g.arc(c[0],c[1],9,0,7); g.fill(); g.fillStyle="#f2c230"; g.beginPath(); g.arc(c[0],c[1],6,0,7); g.fill();
    g.fillStyle="rgba(242,194,48,.7)"; [[-16,0],[16,0],[0,-16],[0,16],[-11,-11],[11,11],[-11,11],[11,-11]].forEach(([dx,dy])=>g.fillRect(c[0]+dx-1,c[1]+dy-1,3,3)); }
  // yard props
  tree(12.9,10.2,0,3.2,3); bush(7,10.3); bush(5.9,10.6,C.leafL); flowers(7,9.9,12.6,10.8,24,81);
  flowers(-.4,10.2,5.6,10.9,30,82);
  { const c=P(6.6,8.6,0); g.fillStyle="#f4f1e8"; g.fillRect(c[0]-3,c[1]-3,6,3); g.fillRect(c[0]+2,c[1]-5,2,2); g.fillStyle="#2b2c2f"; g.fillRect(c[0]+3,c[1]-4,1,1); }
  return {P:D.P, W:HOUSE.W, H:HOUSE.H};
}
/* ---------------- appliance store interior + repair corner ---------------- */
const SHOP_ITEMS=[
  {id:"grade",   name:"에너지 소비 효율 등급 제품 고르기", at:[1.3,3.3,33], href:"energy-01.html"},
  {id:"battery", name:"충전식 건전지 사용하기", at:[6.4,8.2,17], href:"mineral-02.html"},
  {id:"repair",  name:"고쳐 쓰기 쉬운 제품 고르기", at:[10.6,1.6,22], href:"mineral-03.html"}
];
function drawShop(canvas,sky){
  const g=setup(canvas,HOUSE.W,HOUSE.H,sky), D=Painter(g,180,112,16,1.34);
  const {P,Q,L,dot,flat,box,tree,bush,person}=D;
  const R=rng(71);
  box(-.5,-.5,12.6,10,-6,6,"#d8d4cc","#c9c4ba","#b5afa4",{hl:false});
  // floors: glossy showroom tiles, repair corner grey
  flat(0,0,8.8,10,0,"#eef0f2"); for(let x=0;x<8.8;x+=1.1) L([x,0,0],[x,10,0],"#dfe3e6"); for(let y=1.1;y<10;y+=1.1) L([0,y,0],[8.8,y,0],"#dfe3e6");
  for(let i=0;i<30;i++){ const x=R()*8.6,y=R()*9.8; L([x,y,0],[x+.3,y+.15,0],"#ffffff"); }
  flat(8.8,0,12.6,10,0,"#b9bec2"); for(let x=9.4;x<12.6;x+=.6) L([x,0,0],[x,10,0],"#aab0b5");
  flat(1.6,8.8,8.8,9.4,0,"#1f4f8f");
  // walls
  box(-.5,-.5,12.6,0,0,64,"#bfb6a3","#f4f5f6","#d6dadf",{hl:false});
  box(-.5,0,0,10,0,64,"#bfb6a3","#eceef0","#e9e2d1",{hl:false});
  Q([[8.8,0,0],[12.6,0,0],[12.6,0,64],[8.8,0,64]],"#e7e2d6");
  L([-.5,-.5,64],[12.6,-.5,64]); L([12.6,-.5,64],[12.6,0,64]); L([12.6,0,64],[0,0,64]); L([0,0,64],[0,10,64]); L([0,10,64],[-.5,10,64]); L([-.5,10,64],[-.5,-.5,64]);
  L([12.6,0,0],[12.6,0,64]); L([0,10,0],[0,10,64]);
  // brand band on the walls
  Q([[0,0,54],[8.8,0,54],[8.8,0,60],[0,0,60]],"#1f4f8f"); Q([[0,0,54],[0,10,54],[0,10,60],[0,0,60]],"#1a4479"); L([0,0,59],[8.8,0,59],"#f2c230"); L([0,0,59],[0,10,59],"#f2c230");
  // TV wall on y=0
  const TVC=["#e26d5c","#f2c230","#59b36b","#4a90c8","#a98bd6","#f0a3b5","#3fb0a8"];
  for(let r=0;r<2;r++) for(let k=0;k<4;k++){ const x=.6+k*2, z=28+r*12, w=1.7, hh=9;
    Q([[x,0,z],[x+w,0,z],[x+w,0,z+hh],[x,0,z+hh]],"#1d1f23"); Q([[x+.1,0,z+.6],[x+w-.1,0,z+.6],[x+w-.1,0,z+hh-.5],[x+.1,0,z+hh-.5]],TVC[(r*4+k)%7]);
    Q([[x+.1,0,z+.6],[x+w-.1,0,z+.6],[x+w-.1,0,z+3.6],[x+.1,0,z+3.6]],TVC[(r*4+k+3)%7]); dot(x+.4,0,z+7,"#ffffff",2,1); }
  box(.4,0,8.4,1.2,0,10,"#ffffff","#f4f5f6","#d6dadf"); for(let x=2.4;x<8.4;x+=2) L([x,1.2,1],[x,1.2,9],"#cfd5da");
  [[1,"#3a3d42"],[3.2,"#ffffff"],[5.4,"#3a3d42"]].forEach(([x,c])=>{ box(x,.2,x+1.3,.9,10,1,"#c4c8cc","#9aa0a6","#7d838b",{hl:false}); box(x+.1,.4,x+1.2,.6,11,6,c,c,"rgba(0,0,0,.3)",{hl:false}); });
  // fridges on x=0 wall with yellow energy labels
  for(let k=0;k<3;k++){ const y=1.6+k*2.6; box(0,y,1.3,y+2.1,0,32,k===1?"#c9ced3":"#ffffff",k===1?"#d6dadf":"#f6f7f8",k===1?"#b5bbc1":"#d9dde1");
    L([1.3,y+1.05,2],[1.3,y+1.05,30],"#b9c0c6"); L([1.3,y+.85,16],[1.3,y+.85,22],"#7d838b"); L([1.3,y+1.25,16],[1.3,y+1.25,22],"#7d838b");
    Q([[1.3,y+1.45,20],[1.3,y+1.95,20],[1.3,y+1.95,30],[1.3,y+1.45,30]],"#f2c230");
    ["#2e9a48","#8cc63f","#f2c230","#f39a2d","#e04b3c"].forEach((c,i)=>Q([[1.3,y+1.5,28.6-i*1.4],[1.3,y+1.55+.08*(5-i),28.6-i*1.4],[1.3,y+1.55+.08*(5-i),27.8-i*1.4],[1.3,y+1.5,27.8-i*1.4]],c));
    dot(1.3,y+1.85,29.8,"#1d1f23"); }
  // floor: washer row, aircon stands, display table with small appliances
  for(let k=0;k<3;k++){ const x=3+k*1.6, y=3.6; box(x,y,x+1.3,y+1.3,0,10,"#ffffff","#f4f5f6","#d6dadf"); const p=P(x+.65,y+1.3,5); g.fillStyle="#9aa0a6"; g.fillRect(p[0]-4,p[1]-4,8,8); g.fillStyle="#bfe3f4"; g.fillRect(p[0]-3,p[1]-3,6,6); g.fillStyle="#e4f4fb"; g.fillRect(p[0]-2,p[1]-2,2,2);
    Q([[x+.15,y+1.3,8.4],[x+.55,y+1.3,8.4],[x+.55,y+1.3,9.6],[x+.15,y+1.3,9.6]],"#f2c230"); dot(x+1,y+1.3,9,"#3cc45a"); }
  [[7.6,3.6],[7.6,5.6]].forEach(([x,y])=>{ box(x,y,x+.8,y+.8,0,24,"#ffffff","#f4f5f6","#d6dadf"); for(let z=14;z<23;z+=1.4) L([x+.1,y+.8,z],[x+.7,y+.8,z],"#c9ced3"); dot(x+.2,y+.8,10,"#4a90c8",3,1); Q([[x+.1,y+.8,3],[x+.5,y+.8,3],[x+.5,y+.8,6],[x+.1,y+.8,6]],"#f2c230"); });
  box(3,6.4,6.6,7.6,0,8,"#e8e2d6","#f6f2ea","#d9d2c4"); box(3.3,6.6,4.1,7.3,8,2.4,"#d9534f","#c9453f","#a83a35",{hl:false}); box(4.5,6.7,5.2,7.2,8,3,"#ffffff","#eeeeee","#cfd5da",{hl:false}); box(5.6,6.6,6.3,7.3,8,1.8,"#3a3d42","#4a4f57","#2f3339",{hl:false}); dot(5.8,6.9,10,"#3cc45a");
  // checkout counter with rechargeable-battery display + charger
  box(4.6,8.2,8.4,9.2,0,10,"#1f4f8f","#2a5ea6","#163a6b"); flat(4.6,8.2,8.4,9.2,10,"#f4f5f6"); L([4.6,9.2,8],[8.4,9.2,8],"#f2c230");
  box(4.9,8.3,5.6,8.9,10,4,"#24262b","#24262b","#3a3d42",{hl:false}); Q([[5,8.9,10.6],[5.5,8.9,10.6],[5.5,8.9,13.4],[5,8.9,13.4]],"#59b36b");
  box(6,8.3,7.2,8.7,10,5,"#ffffff","#f2f2f2","#d4d4d4",{hl:false}); for(let k=0;k<4;k++){ const x=6.1+k*.27; Q([[x,8.7,11],[x+.18,8.7,11],[x+.18,8.7,14],[x,8.7,14]],k%2?"#3b82c4":"#4f9a48"); dot(x+.05,8.7,14.4,"#c4c8cc"); }
  box(7.4,8.4,8.1,8.9,10,1.4,"#3a3d42","#4a4f57","#2f3339",{hl:false}); [7.5,7.7,7.9].forEach(x=>{ box(x,8.5,x+.13,8.8,11.4,2,"#3b82c4","#3b82c4","#285a8b",{hl:false,ol:false}); }); dot(8,8.9,11,"#3cc45a");
  bigPerson(g,P,6.6,9.8,0,"#f2c230","#6b4a2e"); bigPerson(g,P,3.4,5.8,0,"#e04b3c"); bigPerson(g,P,2.4,8.2,0,"#a98bd6"); bigPerson(g,P,6.2,7.9,0,"#1f4f8f");
  // repair corner: low partition, workbench with opened phone, pegboard, parts drawers, technician
  box(8.6,0,8.9,10,0,10,"#e9ecef","#f6f7f8","#d6dadf"); Q([[8.9,4,10],[8.9,6,10],[8.9,6,14],[8.9,4,14]],"#e0a91b");
  Q([[9.2,0,24],[12.2,0,24],[12.2,0,44],[9.2,0,44]],"#c4a477"); for(let x=9.5;x<12.2;x+=.35) for(let z=25;z<44;z+=2.4) dot(x,0,z,"#9c7f56");
  L([9.6,0,40],[9.6,0,34],"#7d838b"); L([10.2,0,41],[10.6,0,35],"#d9534f"); L([11,0,40],[11,0,33],"#f2c230"); L([11.6,0,41],[11.8,0,35],"#3b82c4");
  box(9.2,.2,12.2,2,0,12,"#a87f53","#c49a6c","#8b6643"); flat(9.4,.3,12,1.9,12,"#3f7f5a");
  box(10,.9,10.8,1.5,12,.5,"#24262b","#24262b","#3a3d42",{hl:false}); flat(10.1,1,10.7,1.4,12.5,"#5d9a62"); box(10.9,.9,11.6,1.4,12,.4,"#9aa0a6","#9aa0a6","#7d838b",{hl:false}); flat(11,1,11.5,1.3,12.4,"#3b82c4");
  [[9.6,1.2],[9.75,1.5],[11.8,1.6]].forEach(([x,y])=>dot(x,y,12,"#d6dade",2,1)); L([9.5,1.7,12],[9.9,1.6,12],"#d9534f");
  box(9.3,2.4,10.2,3.4,0,18,"#5f6870","#6f777e","#4a5158"); for(let z=2;z<18;z+=2.6) L([9.3,3.4,z],[10.2,3.4,z],"#3a3d42"); for(let z=3;z<18;z+=2.6) dot(9.6,3.4,z,"#f2c230",2,1);
  box(11.8,4,12.5,7.4,0,18,"#e9ecef","#f6f7f8","#d6dadf"); for(let z=.6;z<18;z+=6){ L([11.8,4,z],[11.8,7.4,z],"#b9c0c6"); [[4.2,"#ffffff",1.6],[5,"#3a3d42",1.4],[5.8,"#e8893a",1.2],[6.6,"#5b8bb8",1.4]].forEach(([y,c,h])=>box(11.85,y,12.4,y+.6,z,h*2,c,c,"rgba(0,0,0,.2)",{hl:false,ol:false})); }
  box(10.1,3,10.7,3.5,0,5,"#3a3d42","#4a4f57","#2f3339",{hl:false}); bigPerson(g,P,10.3,4.3,0,"#5b8bb8","#2b2c2f");
  box(9.6,6.2,11,7.4,0,4,"#c7b38f","#b9a37b","#a08a63"); box(9.8,6.3,10.8,7.1,4,3,"#c7b38f","#b9a37b","#a08a63"); L([9.8,7.1,6],[10.8,7.1,6],"#8b6643");
  Q([[8.8,0,46],[12.6,0,46],[12.6,0,52],[8.8,0,52]],"#e0a91b"); { const p=P(10.7,0,49.6); g.fillStyle="#2b2c2f"; [[0,0],[1,0],[1,1],[2,2],[3,3],[4,4],[3,4]].forEach(([dx,dy])=>g.fillRect(p[0]+dx-3,p[1]+dy-2,1,1)); }
  // entrance plant + mat
  box(.4,9,1,9.6,0,3,"#c97a5c","#b5654a","#9a4f39"); tree(.7,9.3,3,4,1);
  return {P:D.P, W:HOUSE.W, H:HOUSE.H};
}
/* close-up person (2x the map figure) for interior scenes */
function bigPerson(g,P,x,y,z,shirt,hair="#3a2a20",hat){
  const [px,py]=P(x,y,z||0); const f=(c,a,b,w,h)=>{g.fillStyle=c; g.fillRect(px+a,py+b,w,h);};
  f("rgba(0,0,0,.18)",-4,-1,10,2); f("#3b3f46",-2,-9,2,9); f("#3b3f46",1,-9,2,9); f("#2b2c2f",-2,-1,2,1); f("#2b2c2f",1,-1,2,1);
  f(shirt,-3,-17,7,8); f("rgba(0,0,0,.15)",2,-17,2,8); f("#f2c7a5",-4,-14,1,4); f("#f2c7a5",4,-14,1,4);
  f("#f2c7a5",-2,-22,5,5); f(hair,-2,-23,5,2); f(hair,-3,-22,1,3); f("#2b2c2f",1,-20,1,1);
  if(hat){ f(hat,-3,-25,7,3); f(hat,-4,-23,9,1); }
}
/* ---------------- recycling center: sorting line + e-waste (urban mine) corner ---------------- */
const RECYCLE_ITEMS=[
  {id:"urbanmine", name:"안 쓰는 휴대폰 수거함에 넣기", at:[3.6,7.6,16], href:"mineral-01.html"},
  {id:"can",       name:"알루미늄 캔 분리배출하기", at:[10.6,4.8,18], href:"mineral-04.html"}
];
function drawRecycle(canvas,sky){
  const g=setup(canvas,HOUSE.W,HOUSE.H,sky), D=Painter(g,180,112,16,1.34);
  const {P,Q,L,dot,flat,box}=D;
  const R=rng(83), BP=(x,y,s,h,hat)=>bigPerson(g,P,x,y,0,s,h,hat);
  box(-.5,-.5,12.6,10,-6,6,"#b5b0a6","#a39e94","#8f8a82",{hl:false});
  flat(0,0,12.6,10,0,"#b9bcb8"); for(let i=0;i<160;i++) dot(R()*12.4,R()*9.8,0,R()<.5?"#c6c9c5":"#aeb1ad");
  flat(0,5.4,12.6,5.7,0,"#f2c230"); for(let x=.3;x<12.6;x+=.8) flat(x,5.4,x+.4,5.7,0,"#2b2c2f");
  // walls: corrugated panels, high windows, roll-up door, signs
  box(-.5,-.5,12.6,0,0,64,"#9fb096","#d9e0d3","#b9c4b0",{hl:false});
  box(-.5,0,0,10,0,64,"#9fb096","#c7d3bd","#c7d3bd",{hl:false});
  for(let x=.4;x<12.6;x+=.6) L([x,0,0],[x,0,64],"#c7d0c0"); for(let y=.4;y<10;y+=.6) L([0,y,0],[0,y,64],"#b4c2a9");
  for(let x=.8;x<10.5;x+=2.2) Q([[x,0,46],[x+1.6,0,46],[x+1.6,0,56],[x,0,56]],"#a9cde4");
  Q([[0,6.2,0],[0,9.4,0],[0,9.4,30],[0,6.2,30]],"#7f8c77"); for(let z=2;z<30;z+=2) L([0,6.2,z],[0,9.4,z],"#6d7a66"); Q([[0,6.2,30],[0,9.4,30],[0,9.4,33],[0,6.2,33]],"#5f6870");
  Q([[0,1.4,36],[0,5,36],[0,5,44],[0,1.4,44]],"#4f9a48"); { const p=P(0,3.2,40); g.fillStyle="#ffffff"; [[0,-3],[1,-3],[2,-2],[-2,-2],[-3,0],[3,0],[-2,2],[2,2],[0,3],[1,3]].forEach(([dx,dy])=>g.fillRect(p[0]+dx,p[1]+dy,1,1)); g.fillRect(p[0]+2,p[1]-3,2,1); g.fillRect(p[0]-4,p[1]+1,2,1); }
  L([-.5,-.5,64],[12.6,-.5,64]); L([12.6,-.5,64],[12.6,0,64]); L([12.6,0,64],[0,0,64]); L([0,0,64],[0,10,64]); L([0,10,64],[-.5,10,64]); L([-.5,10,64],[-.5,-.5,64]); L([12.6,0,0],[12.6,0,64]); L([0,10,0],[0,10,64]);
  // ---- sorting line: hopper -> conveyor -> magnet (steel) -> eddy current (aluminium) ----
  box(.4,2.4,2,4.6,0,18,"#5f6870","#6f777e","#4a5158"); Q([[.2,2.2,18],[2.2,2.2,18],[2.2,4.8,22],[.2,4.8,22]],"#7d838b"); flat(.5,2.6,1.9,4.4,18,"#3a3d42");
  [[.7,3],[1.2,3.6],[1.5,2.9],[.9,4]].forEach(([x,y],i)=>dot(x,y,18.4,["#c4c8cc","#d9534f","#4f9a48","#e8e8e8"][i],2,2));
  for(let x=2.6;x<9;x+=1.6){ L([x,3.2,0],[x,3.2,9],"#5f6870"); L([x,4.2,0],[x,4.2,9],"#4a5158"); }
  box(2,3,9.4,4.4,9,1.2,"#3a3d42","#4a4f57","#2f3339"); for(let x=2.3;x<9.4;x+=.5) L([x,3.05,10.2],[x,4.35,10.2],"#4a4f57");
  [[2.6,"#c4c8cc",0],[3.3,"#d9534f",1],[4,"#e8e8e8",0],[5.8,"#c4c8cc",1],[6.6,"#4f9a48",0],[7.4,"#e8e8e8",1],[8.3,"#c4c8cc",0]].forEach(([x,c,t])=>{ box(x,3.4+t*.4,x+.35,3.7+t*.4,10.2,1.4,c,c,"rgba(0,0,0,.25)",{hl:false,ol:false}); });
  // overhead magnet with steel cans stuck to it, steel bin below
  L([4.4,3.7,30],[4.4,3.7,22],"#7d838b"); box(3.7,3,5.3,4.4,17,4,"#d9534f","#c9453f","#a83a35"); flat(3.9,3.2,5.1,4.2,21,"#e26d5c");
  [[3.9,4.4],[4.5,4.4],[5,4.4]].forEach(([x,y])=>{ const p=P(x,y,16.4); g.fillStyle="#9aa0a6"; g.fillRect(p[0]-1,p[1],3,4); g.fillStyle="#c4c8cc"; g.fillRect(p[0]-1,p[1],1,4); });
  box(3.6,4.8,5.4,6.2,0,6,"#7d838b","#8f979e","#5f6870"); flat(3.8,5,5.2,6,6,"#5f6870"); dot(4.2,5.4,6.2,"#c4c8cc",2,2); dot(4.7,5.6,6.2,"#9aa0a6",2,2);
  // eddy-current separator at the end, aluminium cans flying into the bin
  box(9.4,2.8,10.6,4.6,0,11,"#3b82c4","#4a90c8","#2f6aa3"); box(9.5,3,10.4,4.4,11,.6,"#1f4f8f","#285a8b","#163a6b",{hl:false});
  for(let k=0;k<4;k++){ const p=P(10.8+k*.35,3.6+k*.12,12-k*1.6); g.fillStyle="#c4c8cc"; g.fillRect(p[0],p[1],2,3); g.fillStyle="#e8e8e8"; g.fillRect(p[0],p[1],1,3); }
  box(10.8,3,12.4,5,0,7,"#c4c8cc","#d6dadf","#9aa0a6"); flat(11,3.2,12.2,4.8,7,"#7d838b"); for(let i=0;i<10;i++) dot(11.1+R()*1,3.3+R()*1.4,7,R()<.5?"#e8e8e8":"#c4c8cc",2,1);
  // bales of crushed aluminium cans
  [[9.6,.3,0],[10.9,.3,0],[9.6,.3,4.4],[10.9,1.6,0]].forEach(([x,y,z])=>{ box(x,y,x+1.2,y+1.2,z,4.4,"#c9ced3","#d9dde1","#aeb4ba");
     for(let k=0;k<6;k++) dot(x+.15+R()*.9,y+1.2,z+.6+R()*3.4,["#d9534f","#3b82c4","#f2c230","#4f9a48","#ffffff"][k%5],2,1); L([x,y+1.2,z+1.4],[x+1.2,y+1.2,z+1.4],"#7d838b"); L([x,y+1.2,z+3],[x+1.2,y+1.2,z+3],"#7d838b"); });
  // ---- e-waste corner: phone collection box, dismantling table, sorted parts bins ----
  box(.6,6.4,1.6,7.4,0,9,"#3b82c4","#4a90c8","#2f6aa3"); Q([[.8,7.4,6],[1.4,7.4,6],[1.4,7.4,6.6],[.8,7.4,6.6]],"#1d1f23"); Q([[.75,7.4,2],[1.45,7.4,2],[1.45,7.4,4.6],[.75,7.4,4.6]],"#ffffff");
  { const p=P(1.1,7.4,4); g.fillStyle="#2b2c2f"; g.fillRect(p[0]-1,p[1]-3,3,5); g.fillStyle="#9be0ff"; g.fillRect(p[0],p[1]-2,1,3); }
  box(2.2,6.8,5.2,8.4,0,8,"#a87f53","#c49a6c","#8b6643"); flat(2.4,6.9,5,8.3,8,"#4a5158");
  box(2.6,7.1,3.4,7.7,8,.4,"#24262b","#24262b","#3a3d42",{hl:false}); flat(2.7,7.2,3.3,7.6,8.4,"#2e7d4f"); [[2.8,7.3],[3,7.45],[3.15,7.3]].forEach(([x,y])=>dot(x,y,8.4,"#f2c230"));
  box(3.6,7.2,4.1,7.9,8,.3,"#1d1f23","#1d1f23","#3a3d42",{hl:false}); box(4.3,7.1,4.8,7.8,8,.3,"#c4c8cc","#9aa0a6","#7d838b",{hl:false}); dot(4.4,7.3,8.3,"#e8893a",2,1);
  [[5.6,"#2e7d4f"],[6.6,"#e8893a"],[7.6,"#f2c230"],[8.6,"#5f6870"]].forEach(([x,c])=>{ box(x,7,x+.8,7.8,0,4,"#7d838b","#8f979e","#5f6870"); flat(x+.1,7.1,x+.7,7.7,4,c); for(let k=0;k<3;k++) dot(x+.15+R()*.5,7.15+R()*.5,4,"rgba(255,255,255,.6)"); });
  { const p=P(7.95,7.4,4.2); g.fillStyle="#f6d35a"; g.fillRect(p[0]-2,p[1]-2,3,2); g.fillStyle="#fff3b0"; g.fillRect(p[0]-1,p[1]-2,1,1); }
  BP(3.6,9,"#e8893a","#2b2c2f","#f2c230"); BP(6.6,5,"#3f7f39","#3a2a20","#f2c230"); BP(10,6.6,"#3b82c4","#6b4a2e","#ffffff");
  // pallet of collected appliances
  box(8.6,8.4,11.8,9.8,0,.8,"#c49a6c","#a87f53","#8b6643",{hl:false}); box(8.8,8.6,10,9.6,.8,6,"#ffffff","#f2f2f2","#d4d4d4"); box(10.2,8.7,11.6,9.6,.8,3,"#3a3d42","#4a4f57","#2f3339"); box(10.4,8.8,11.2,9.4,3.8,3,"#e8e2d6","#f6f2ea","#d9d2c4");
  return {P:D.P, W:HOUSE.W, H:HOUSE.H};
}
/* ---------------- forest + woodshop: FSC-certified wood/paper storeroom, sawdust -> pellet mill -> pellet boiler ---------------- */
const FOREST_ITEMS=[
  {id:"fsc",    name:"FSC 인증 종이 고르기", at:[.8,3.2,34], href:"forest-01.html"},
  {id:"pellet", name:"목재 펠릿으로 난방하기", at:[4.9,1.2,24], href:"forest-03.html"}
];
function drawForest(canvas,sky){
  const g=setup(canvas,HOUSE.W,HOUSE.H,sky), D=Painter(g,180,112,16,1.34);
  const {P,Q,L,dot,flat,box,tree,pine,birch,bush,rock,stump,mushroom,flowers,path}=D;
  const R=rng(121), BP=(x,y,s,h,hat)=>bigPerson(g,P,x,y,0,s,h,hat);
  const fsc=(x,y,z,face)=>{ const p=P(x,y,z); g.fillStyle="#2e7d4f"; g.fillRect(p[0]-2,p[1]-2,5,5); g.fillStyle="#ffffff"; g.fillRect(p[0],p[1]-1,1,3); g.fillRect(p[0]-1,p[1],3,1); g.fillRect(p[0],p[1]-2,1,1); };
  [[40,30,44],[250,18,40],[330,52,30]].forEach(([x,y,w])=>{ g.fillStyle="#ffffff"; g.fillRect(x,y,w,6); g.fillRect(x+6,y-4,w-14,4); });
  // ground: forest floor on the right, packed dirt yard in front of the shop
  box(-.6,-.6,12.8,10.2,-6,6,C.grass,"#8a6040","#74502f",{hl:false});
  for(let i=0;i<260;i++) dot(-.5+R()*13.2,-.5+R()*10.6,0,R()<.5?C.grassL:C.grassD);
  for(let i=0;i<40;i++) dot(7.6+R()*5,-.4+R()*10.4,0,R()<.5?"#b8843f":"#9c6a35",2,1);
  flat(0,5.6,7.4,7.4,0,"#c9a878"); for(let i=0;i<60;i++) dot(R()*7.4,5.6+R()*1.8,0,R()<.5?"#b8946a":"#dcc29a");
  path([[7.4,6.4],[9,6.8],[10.4,8.4],[11.4,10.2]],1,"#c9a878","#b8946a");
  // ---- woodshop (cut away): back walls of timber boards ----
  box(-.5,-.5,7.4,0,0,42,"#8a6040","#e3c08e","#c49a6c",{hl:false});
  box(-.5,0,0,5.6,0,42,"#8a6040","#d9b07a","#d9b07a",{hl:false});
  for(let x=.5;x<7.4;x+=.5) L([x,0,0],[x,0,42],"#c9a272"); for(let y=.5;y<5.6;y+=.5) L([0,y,0],[0,y,42],"#c49a6c");
  L([-.5,-.5,42],[7.4,-.5,42]); L([7.4,-.5,42],[7.4,0,42]); L([7.4,0,42],[0,0,42]); L([0,0,42],[0,5.6,42]); L([0,5.6,42],[-.5,5.6,42]); L([-.5,5.6,42],[-.5,-.5,42]); L([7.4,0,0],[7.4,0,42]); L([0,5.6,0],[0,5.6,42]);
  flat(0,0,7.4,5.6,0,"#cdb48e"); for(let x=.6;x<7.4;x+=.6) L([x,0,0],[x,5.6,0],"#bea37b");
  // back-wall windows and pegboard of hand tools
  [[1.6,3.2],[5.9,7]].forEach(([a,b])=>{ Q([[a,0,24],[b,0,24],[b,0,36],[a,0,36]],"#8b6643"); Q([[a+.12,0,25],[b-.12,0,25],[b-.12,0,35],[a+.12,0,35]],"#a9cde4"); L([(a+b)/2,0,25],[(a+b)/2,0,35],"#8b6643"); Q([[a+.12,0,31],[a+.5,0,35],[a+.12,0,35]],"#d6ecf6"); });
  Q([[3.5,0,14],[5.6,0,14],[5.6,0,24],[3.5,0,24]],"#e8d2a8"); for(let x=3.7;x<5.6;x+=.3) for(let z=15;z<24;z+=1.5) dot(x,0,z,"#b8946a");
  { const s=P(3.9,0,22); g.fillStyle="#7d838b"; g.fillRect(s[0],s[1],7,4); g.fillStyle="#c49a6c"; g.fillRect(s[0]+6,s[1]-1,3,6);
    const h=P(4.6,0,21); g.fillStyle="#5f6870"; g.fillRect(h[0],h[1],5,2); g.fillStyle="#a87f53"; g.fillRect(h[0]+2,h[1]+2,1,6);
    const c=P(5.2,0,20); g.fillStyle="#e04b3c"; g.fillRect(c[0],c[1],2,7); g.fillStyle="#5f6870"; g.fillRect(c[0],c[1]+7,2,3); }
  // ---- storeroom on the left wall: FSC-labelled timber and paper ----
  for(let y of [.5,2.3,4.1]) box(.05,y,1.5,y+.18,0,40,"#6b4a2e","#7a5232","#8b6643",{hl:false});
  [6,14,22,30].forEach((z,si)=>{ box(.05,.5,1.5,4.3,z,.5,"#8b6643","#7a5232","#a87f53",{hl:false});
    if(si<2){ for(let k=0;k<3;k++){ const zz=z+.5+k*1.6; box(.15,.6,1.4,4.2,zz,1.5,"#e3c08e","#c49a6c","#d9b07a",{hl:false}); L([1.4,.6,zz],[1.4,4.2,zz],"#a87f53"); for(let y=.9;y<4.2;y+=.9) dot(1.4,y,zz+.9,"#b8843f"); }
      fsc(1.4,1.2,z+3.4); fsc(1.4,3.4,z+2); }
    else if(si===2){ for(let k=0;k<4;k++){ const y=.65+k*.9; box(.2,y,1.3,y+.8,z+.5,4.6,"#ffffff","#f4f6f8","#e6e9ec",{hl:false}); Q([[1.3,y+.1,z+2.2],[1.3,y+.7,z+2.2],[1.3,y+.7,z+3.6],[1.3,y+.1,z+3.6]],k%2?"#3b82c4":"#4f9a48"); fsc(1.3,y+.4,z+1.4); } }
    else { [[.7,"#f2c230"],[1.4,"#e8893a"],[2.1,"#3b82c4"],[2.8,"#4f9a48"],[3.5,"#d9534f"]].forEach(([y,c])=>{ box(.4,y,1.2,y+.5,z+.5,5.2,c,c,"rgba(0,0,0,.2)",{hl:false}); fsc(1.2,y+.25,z+4); }); }
  });
  box(1.6,4.5,3,5.4,0,4,"#c49a6c","#a87f53","#8b6643"); flat(1.7,4.6,2.9,5.3,4,"#e3c08e"); fsc(3,4.95,2.4); fsc(2.3,5.4,2.4);
  // ---- workbench with circular saw, sawdust on the floor, woodworker ----
  box(2.2,1.4,3.8,3,0,9,"#c49a6c","#a87f53","#8b6643"); flat(2.3,1.5,3.7,2.9,9,"#e3c08e");
  box(2.6,1.7,3.4,2.6,9,1.2,"#5f6870","#6f777e","#4a5158",{hl:false}); { const p=P(3,2.15,10.6); g.fillStyle="#c4c8cc"; g.fillRect(p[0]-3,p[1]-3,7,3); g.fillStyle="#e8e8e8"; g.fillRect(p[0]-1,p[1]-3,2,1); }
  box(2.3,2.2,3.7,2.6,10.2,.6,"#f0d9ae","#d9b07a","#c49a6c",{hl:false});
  for(let i=0;i<70;i++){ const a=R()*6.28, r=R()*1.3; dot(3.1+Math.cos(a)*r*1.1,3.6+Math.sin(a)*r*.7,0,R()<.5?"#f0d9ae":"#e3c08e",2,1); }
  BP(3.9,3.6,"#3f7f39","#3a2a20","#f2c230");
  // sawdust sack + pellet mill: hopper on top, pellets out of the chute into a bag
  box(3.8,.3,4.4,.9,0,5,"#e8e2d6","#f0e8d6","#d9cfb8",{hl:false}); flat(3.85,.35,4.35,.85,5,"#f0d9ae");
  box(4.6,.4,5.8,1.6,0,13,"#4f9a48","#5aa85a","#3f7f39"); for(let z=3;z<13;z+=3) L([4.6,1.6,z],[5.8,1.6,z],"#3f7f39");
  Q([[4.3,.1,18],[6.1,.1,18],[5.6,.7,13],[4.8,.7,13]],"#7d838b"); Q([[4.8,1.3,13],[5.6,1.3,13],[6.1,1.9,18],[4.3,1.9,18]],"#9aa0a6"); Q([[6.1,.1,18],[6.1,1.9,18],[5.6,1.3,13],[5.6,.7,13]],"#6f777e");
  flat(4.3,.1,6.1,1.9,18,"#5f6870"); flat(4.45,.25,5.95,1.75,18,"#f0d9ae"); for(let i=0;i<18;i++) dot(4.5+R()*1.4,.3+R()*1.4,18,"#d9b07a");
  Q([[5,1.6,6],[5.4,1.6,6],[5.4,2.4,3],[5,2.4,3]],"#7d838b");
  box(4.8,2.4,5.7,3.2,0,3.6,"#c49a6c","#d9b07a","#b8946a",{hl:false}); flat(4.9,2.5,5.6,3.1,3.6,"#a87f53"); for(let i=0;i<20;i++) dot(4.95+R()*.6,2.55+R()*.5,3.6,R()<.5?"#8b6643":"#c49a6c");
  for(let k=0;k<3;k++) dot(5.2,2.3,4.6+k*.8,"#a87f53",2,1);
  // pellet boiler with flame window; flue pipe up the back wall
  box(6.1,.4,7.2,1.6,0,12,"#e9ecef","#f4f6f8","#cfd5da"); Q([[6.4,1.6,3],[6.9,1.6,3],[6.9,1.6,6.5],[6.4,1.6,6.5]],"#2b2c2f"); dot(6.55,1.6,4.6,"#e8893a",3,2); dot(6.6,1.6,5.4,"#f2c230",2,1);
  Q([[7.2,.6,8],[7.2,1.4,8],[7.2,1.4,11],[7.2,.6,11]],"#d9534f"); dot(7.2,1,9.6,"#ffffff",2,1);
  box(6.5,.15,6.8,.45,12,30,"#7d838b","#9aa0a6","#6f777e",{hl:false});
  // stacked pellet bags
  [[5.6,3.6,0],[6.5,3.6,0],[5.6,4.6,0],[6.5,4.6,0],[5.9,3.9,2.2],[6.4,4.8,2.2]].forEach(([x,y,z])=>{ box(x,y,x+.85,y+.95,z,2.2,"#e6cf9f","#d9bc85","#c4a36a",{hl:false}); Q([[x+.15,y+.95,z+.6],[x+.7,y+.95,z+.6],[x+.7,y+.95,z+1.6],[x+.15,y+.95,z+1.6]],"#4f9a48"); dot(x+.42,y+.95,z+1.2,"#ffffff"); });
  // ---- outside: log pile (stamped ends), sorted by depth with the forest ----
  const objs=[];
  const add=(x,y,f)=>objs.push([x+y,f]);
  add(9.4,2.4,()=>{ for(let r=0;r<3;r++) for(let k=0;k<4-r;k++){ const x=8.4+k*.6+r*.3, z=r*3.6; box(x,.6,x+.55,2.6,z,3.6,"#8a6040","#8a6040","#6b4a2e",{hl:false,ol:false});
     L([x+.1,.6,z+3.6],[x+.1,2.6,z+3.6],"#a87f53"); const p=P(x+.27,2.6,z+1.8); g.fillStyle="#5e3f27"; g.fillRect(p[0]-4,p[1]-4,9,8); g.fillStyle="#e3c08e"; g.fillRect(p[0]-3,p[1]-3,7,6); g.fillRect(p[0]-4,p[1]-2,9,4);
     g.fillStyle="#c49a6c"; g.fillRect(p[0]-1,p[1]-1,3,2); if((k+r)%2===0){ g.fillStyle="#2e7d4f"; g.fillRect(p[0]+1,p[1]-3,2,2);} } });
  // forest trees (varied species and sizes)
  const T=[[8.2,-.3,"p",4.4],[9.6,-.2,"t",6.5,1],[11,-.3,"p",5],[12.4,-.2,"t",6,0],[12.4,1.6,"b",3.4],[11.4,1.4,"p",4.6],[11.2,3.2,"t",6.5,0],[12.4,4.2,"p",4.2],[10.2,6,"t",5.5,2],[12.2,6.2,"t",6,1],[11.4,7.4,"p",3.6],[12.3,8.4,"b",3.8],[10.2,9.6,"t",4.6,1],[8.4,9.6,"b",3]];
  { const F=rng(5); for(let i=0;i<140;i++){ const x=7.9+F()*4.9, y=-.4+F()*10.6; if(x<10.6&&y>.2&&y<3.4) continue; if(Math.abs(y-(6.4+(x-7.4)*1.0))<.8&&y>6) continue; if(x-y<3.4) continue; if(x-y<6.6&&x+y<13.5) continue; if(T.some(t=>Math.hypot(t[0]-x,t[1]-y)<.75)) continue; const k=F(); T.push(k<.4?[x,y,"p",3+F()*2]: k<.55?[x,y,"b",2.6+F()*1.4]:[x,y,"t",5.5+F()*3,F()<.6?1:(F()<.5?0:2)]); }
    [[-.2,6.6,"t",6,1],[.2,8,"p",3.6],[-.3,9.4,"t",5.5,0],[.6,10,"b",2.8]].forEach(t=>T.push(t)); }
  T.forEach(([x,y,k,s,v])=>add(x,y,()=> k==="p"?pine(x,y,s): k==="b"?birch(x,y,s): tree(x,y,0,s,v)));
  [[8.6,8.4],[10.2,4],[8.2,3.6],[12.4,7.2],[9.6,7.4]].forEach(([x,y])=>add(x,y,()=>bush(x,y)));
  [[11,7.2],[9.4,9.6]].forEach(([x,y])=>add(x,y,()=>rock(x,y,1.6)));
  [[10.6,6.8],[11.6,9.2],[9,7.6]].forEach(([x,y])=>add(x,y,()=>mushroom(x,y)));
  // replanting area in front: stumps next to staked saplings, forester planting a tree
  const sap=(x,y)=>{ const p=P(x,y,0); g.fillStyle="#8a6040"; g.fillRect(p[0]+3,p[1]-12,1,12); g.fillStyle="#7a5232"; g.fillRect(p[0],p[1]-7,1,7); g.fillStyle="#3f8a4a"; g.fillRect(p[0]-3,p[1]-11,7,3); g.fillStyle="#5aa85a"; g.fillRect(p[0]-2,p[1]-13,5,3); g.fillStyle="#86c76f"; g.fillRect(p[0]-1,p[1]-14,2,1); g.fillStyle="#6b4a2e"; g.fillRect(p[0]-3,p[1],7,1); };
  const stumpBig=(x,y)=>{ const p=P(x,y,0); g.fillStyle="#7a5232"; g.fillRect(p[0]-4,p[1]-5,9,5); g.fillStyle="#5e3f27"; g.fillRect(p[0]+2,p[1]-5,3,5); g.fillStyle="#e3c08e"; g.fillRect(p[0]-4,p[1]-7,9,2); g.fillStyle="#c49a6c"; g.fillRect(p[0]-1,p[1]-7,3,1); };
  [[1,8.2],[3.4,9.4],[5.6,8.4]].forEach(([x,y])=>add(x,y,()=>stumpBig(x,y)));
  [[2,8],[1.8,9.6],[4.4,8.4],[4.8,9.8],[6.6,9.4],[.6,9.6],[3,8.8]].forEach(([x,y])=>add(x,y,()=>sap(x,y)));
  add(6,7.2,()=>{ BP(6,7.2,"#e8893a","#2b2c2f","#4f9a48"); const p=P(6.5,7.4,0); g.fillStyle="#7d838b"; g.fillRect(p[0],p[1]-16,1,16); g.fillStyle="#5f6870"; g.fillRect(p[0]-2,p[1]-2,5,3); });
  add(7,8.2,()=>{ box(6.8,8,7.6,8.5,0,2,"#a87f53","#8b6643","#7a5232",{hl:false}); sap(7.1,8.2); });
  // forest sign: green board with tree-check mark
  add(8.4,7.2,()=>{ const X=8.4; L([X,6.6,0],[X,6.6,10],"#5e3f27"); L([X,7.8,0],[X,7.8,10],"#5e3f27"); Q([[X+.05,6.4,7],[X+.05,8,7],[X+.05,8,12],[X+.05,6.4,12]],"#2e7d4f"); fsc(X+.05,7.2,10.4); Q([[X+.05,6.6,8],[X+.05,7.8,8],[X+.05,7.8,8.4],[X+.05,6.6,8.4]],"#f2f4f6"); });
  // hand cart with offcuts heading to the pellet mill
  add(7.6,4.6,()=>{ box(7.2,4.2,8.4,5,1,1.6,"#8b6643","#a87f53","#7a5232",{hl:false}); for(let i=0;i<8;i++) dot(7.3+R()*1,4.3+R()*.6,2.7,R()<.5?"#e3c08e":"#c49a6c",2,1); dot(7.5,5,.6,"#2b2c2f",3,3); dot(8.1,5,.6,"#2b2c2f",3,3); L([7.2,4.6,2.4],[6.6,4.6,4],"#5e3f27"); });
  flowers(8,6.2,12.4,9.8,30,31); flowers(0,7.6,7,10,14,32);
  objs.sort((a,b)=>a[0]-b[0]).forEach(o=>o[1]());
  return {P:D.P, W:HOUSE.W, H:HOUSE.H};
}
const SCENES={
  home:{name:"우리 집", draw:drawHouse, W:HOUSE.W, H:HOUSE.H, items:HOUSE_ITEMS, hint:"욕실, 부엌, 거실, 현관을 둘러보세요."},
  apt:{name:"아파트", draw:drawApt, W:HOUSE.W, H:HOUSE.H, items:APT_ITEMS, hint:"현관, 거실, 베란다를 둘러보세요."},
  school:{name:"학교", draw:drawSchool, W:HOUSE.W, H:HOUSE.H, items:SCHOOL_ITEMS, hint:"교실과 학교 텃밭을 둘러보세요."},
  tower:{name:"큰 건물", draw:drawTower, W:TOWER.W, H:TOWER.H, items:TOWER_ITEMS, hint:"지하 기계실, 사무실, 옥상 정원을 둘러보세요."},
  roofs:{name:"주택가 지붕", draw:drawRoofs, W:HOUSE.W, H:HOUSE.H, items:ROOFS_ITEMS},
  shop:{name:"가전 매장과 수리점", draw:drawShop, W:HOUSE.W, H:HOUSE.H, items:SHOP_ITEMS},
  recycle:{name:"재활용 센터", draw:drawRecycle, W:HOUSE.W, H:HOUSE.H, items:RECYCLE_ITEMS},
  forest:{name:"숲과 목공소", draw:drawForest, W:HOUSE.W, H:HOUSE.H, items:FOREST_ITEMS}
};
MAP_PLACES.forEach(p=>p.ready=!!SCENES[p.id]);
window.Village={MapAnim,drawMap,drawHouse,MAP_PLACES,HOUSE_ITEMS,ROOMS,MAP,HOUSE,SCENES};
})();
