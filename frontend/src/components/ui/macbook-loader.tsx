'use client';

import React from 'react';

interface MacbookLoaderProps {
  message?: string;
}

function buildSrcdoc(msg?: string): string {
  const messageHtml = msg
    ? `<p style="position:absolute;bottom:18%;left:50%;transform:translateX(-50%);color:rgba(255,255,255,0.85);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;font-weight:500;animation:pulse 1.5s ease-in-out infinite">${msg}</p>`
    : '';

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
*,*::before,*::after{margin:0;padding:0;box-sizing:content-box}
html,body{width:100%;height:100%;overflow:hidden;background:transparent}
body{display:flex;justify-content:center;align-items:center}
.macbook{position:relative;width:228px;height:260px}
.macbook__topBord{position:absolute;z-index:0;top:34px;left:0;width:128px;height:116px;border-radius:6px;transform-origin:center;background:linear-gradient(-135deg,#c8c9c9 52%,#8c8c8c 56%);transform:scale(0) skewY(-30deg);animation:topBord .35s .3s ease-out forwards}
.macbook__topBord::before{content:"";position:absolute;z-index:2;top:8px;left:6px;width:100%;height:100%;border-radius:6px;background:#000}
.macbook__topBord::after{content:"";position:absolute;z-index:1;bottom:-7px;left:8px;width:168px;height:12px;transform-origin:left bottom;transform:rotate(-42deg) skew(-4deg);background:linear-gradient(-135deg,#c8c9c9 52%,#8c8c8c 56%)}
.macbook__display{position:absolute;z-index:2;top:17px;left:12px;width:calc(100% - 12px);height:calc(100% - 18px);background:linear-gradient(45deg,#135bec,#f5820b)}
.macbook__display::before{content:"";position:absolute;z-index:5;top:-9px;left:-6px;width:calc(100% + 12px);height:calc(100% + 18px);border-radius:6px;background:linear-gradient(60deg,rgba(255,255,255,0) 60%,rgba(255,255,255,.3) 60%)}
.macbook__load{position:relative;width:100%;height:100%;background:#222}
.macbook__load::before{content:"";position:absolute;top:0;left:0;right:0;bottom:0;margin:auto;width:80px;height:6px;border-radius:3px;box-sizing:border-box;border:1px solid #fff}
.macbook__load::after{content:"";position:absolute;top:0;left:18px;bottom:0;margin:auto;width:0;height:6px;border-radius:3px;background:#fff;animation:loadBar 1.8s .6s ease-in-out infinite both}
.macbook__underBord{position:relative;left:42px;bottom:-145px;width:150px;height:90px;border-radius:6px;transform-origin:center;transform:rotate(-30deg) skew(30deg);background:linear-gradient(-45deg,#c8c9c9 61%,#8c8c8c 66%);opacity:0;animation:modal .4s .05s ease-out forwards}
.macbook__underBord::before{content:"";position:absolute;z-index:3;top:-8px;left:8px;width:100%;height:100%;border-radius:6px;background:#dcdede}
.macbook__underBord::after{content:"";position:absolute;z-index:2;top:-8px;left:12px;width:170px;height:15px;transform-origin:top left;background:linear-gradient(-45deg,#c8c9c9 61%,#8c8c8c 66%);transform:rotate(31deg) skew(-16deg)}
.macbook__keybord{position:relative;top:0;left:16px;z-index:3;border-radius:3px;width:calc(100% - 16px);height:45px;background:#c8c9c9}
.macbook__keybord::before{content:"";position:absolute;bottom:-30px;left:0;right:0;margin:0 auto;width:40px;height:25px;border-radius:3px;background:#c8c9c9}
.keybord{position:relative;top:2px;left:2px;display:flex;flex-direction:column;width:calc(100% - 3px);height:calc(100% - 4px)}
.keybord__touchbar{width:100%;height:6px;border-radius:3px;background:#000}
.keybord__keyBox{display:grid;grid-template-rows:3fr 1fr;grid-template-columns:repeat(11,1fr);width:100%;height:24px;margin:1px 0 0;padding:0 0 0 1px;box-sizing:border-box;list-style:none}
.keybord__key{position:relative;width:8px;height:7px;margin:1px;background:#000}
.keybord__keyBox .keybord__key{transform:translate(60px,-60px);opacity:0;animation:key0 .15s .2s ease-out forwards}
.keybord__keyBox .keybord__key::before,.keybord__keyBox .keybord__key::after{content:"";position:absolute;left:0;width:100%;height:100%;background:#000}
.keybord__key::before{top:8px;transform:translate(20px,-20px);animation:key1 .15s .25s ease-out forwards}
.keybord__key::after{top:16px;transform:translate(40px,-40px);animation:key2 .15s .3s ease-out forwards}
.keybord__keyBox .key--12::before{width:10px}
.keybord__keyBox .key--13::before{height:10px}
.key--01{grid-row:1/2;grid-column:1/2}.key--02{grid-row:1/2;grid-column:2/3}.key--03{grid-row:1/2;grid-column:3/4}.key--04{grid-row:1/2;grid-column:4/5}.key--05{grid-row:1/2;grid-column:5/6}.key--06{grid-row:1/2;grid-column:6/7}.key--07{grid-row:1/2;grid-column:7/8}.key--08{grid-row:1/2;grid-column:8/9}.key--09{grid-row:1/2;grid-column:9/10}.key--10{grid-row:1/2;grid-column:10/11}.key--11{grid-row:1/2;grid-column:11/12}.key--12{grid-row:1/2;grid-column:12/13}.key--13{grid-row:1/2;grid-column:13/14}
.keybord__keyBox--under{margin:0;padding:0 0 0 1px;box-sizing:border-box;list-style:none;display:flex}
.keybord__keyBox--under .keybord__key{transform:translate(80px,-80px);opacity:0;animation:key3 .2s .3s linear forwards}
.key--19{width:28px}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
@keyframes topBord{0%{transform:scale(0) skewY(-30deg)}30%{transform:scale(1.1) skewY(-30deg)}45%{transform:scale(.9) skewY(-30deg)}60%{transform:scale(1.05) skewY(-30deg)}75%{transform:scale(.95) skewY(-30deg)}90%{transform:scale(1.02) skewY(-30deg)}100%{transform:scale(1) skewY(-30deg)}}
@keyframes loadBar{0%{width:0}20%{width:40px}40%{width:40px}60%{width:60px}80%{width:75px}95%{width:80px}100%{width:0}}
@keyframes modal{0%{transform:scale(0) rotate(-30deg) skew(30deg);opacity:0}30%{transform:scale(1.1) rotate(-30deg) skew(30deg);opacity:1}45%{transform:scale(.9) rotate(-30deg) skew(30deg);opacity:1}60%{transform:scale(1.05) rotate(-30deg) skew(30deg);opacity:1}75%{transform:scale(.95) rotate(-30deg) skew(30deg);opacity:1}90%{transform:scale(1.02) rotate(-30deg) skew(30deg);opacity:1}100%{transform:scale(1) rotate(-30deg) skew(30deg);opacity:1}}
@keyframes key0{0%{transform:translate(60px,-60px);opacity:0}100%{transform:translate(0,0);opacity:1}}
@keyframes key1{0%{transform:translate(20px,-20px);opacity:0}100%{transform:translate(0,0);opacity:1}}
@keyframes key2{0%{transform:translate(40px,-40px);opacity:0}100%{transform:translate(0,0);opacity:1}}
@keyframes key3{0%{transform:translate(80px,-80px);opacity:0}100%{transform:translate(0,0);opacity:1}}
</style></head><body>
<div class="macbook">
<div class="macbook__topBord"><div class="macbook__display"><div class="macbook__load"></div></div></div>
<div class="macbook__underBord"><div class="macbook__keybord"><div class="keybord">
<div class="keybord__touchbar"></div>
<ul class="keybord__keyBox"><li class="keybord__key key--01"></li><li class="keybord__key key--02"></li><li class="keybord__key key--03"></li><li class="keybord__key key--04"></li><li class="keybord__key key--05"></li><li class="keybord__key key--06"></li><li class="keybord__key key--07"></li><li class="keybord__key key--08"></li><li class="keybord__key key--09"></li><li class="keybord__key key--10"></li><li class="keybord__key key--11"></li><li class="keybord__key key--12"></li><li class="keybord__key key--13"></li></ul>
<ul class="keybord__keyBox--under"><li class="keybord__key key--14"></li><li class="keybord__key key--15"></li><li class="keybord__key key--16"></li><li class="keybord__key key--17"></li><li class="keybord__key key--18"></li><li class="keybord__key key--19"></li><li class="keybord__key key--20"></li><li class="keybord__key key--21"></li><li class="keybord__key key--22"></li><li class="keybord__key key--23"></li><li class="keybord__key key--24"></li></ul>
</div></div></div>
</div>
${messageHtml}
</body></html>`;
}

export function MacbookLoader({ message }: MacbookLoaderProps) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(0, 0, 0, 0.78)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      <iframe
        srcDoc={buildSrcdoc(message)}
        title="Loading"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          background: 'transparent',
        }}
      />
    </div>
  );
}
