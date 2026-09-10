/* Orca Dark Launcher — skin only; no printer commands or network requests. */
(() => {
  if (!['0','2'].includes(new URLSearchParams(location.search).get('path'))) return;
  window.__orcaDarkActive = true;
  const placeholderHashes = new Set([
    '51fe8e06f8b022fbbe67d6795c567f7a775899cc0a9d9ef2790fddc44ae81a53',
    '657d8376b518b7a184776f36d540808aa338ec48777330523a4b4b7f9f0a1d39',
    '84821b1969d672398d374277cf30d897460e3b1027529cdd0d3abbf6345d8362',
    '85e12fcd1674b4e62a8494e4e405271826252a6bc15150782677da551b5a6e52',
    '410ea32abc2618fe488efa8d80f11522ededafdbd6e13f1c054f2febc9fa6653'
  ]);
  const placeholderSizes = new Set([2746,40054,72717,8930,14241]);
  const placeholderURLs = new Set();
  const createURL = URL.createObjectURL;
  URL.createObjectURL = function(blob) {
    const url = createURL.call(this, blob);
    if (blob instanceof Blob && placeholderSizes.has(blob.size) && crypto.subtle) {
      blob.arrayBuffer().then(b=>crypto.subtle.digest('SHA-256',b)).then(b=>{
        const digest=[...new Uint8Array(b)].map(n=>n.toString(16).padStart(2,'0')).join('');
        if(placeholderHashes.has(digest)) {placeholderURLs.add(url);document.dispatchEvent(new Event('orca-dark-placeholder-ready'));}
      }).catch(()=>{});
    }
    return url;
  };
  const revokeURL=URL.revokeObjectURL;
  URL.revokeObjectURL=function(url){placeholderURLs.delete(url);return revokeURL.call(this,url);};
  const css = `
    .orca-dark-placeholder {filter:invert(.86) hue-rotate(180deg)}
    .orca-dark-text {color:#e5e5e4 !important}
    .orca-dark-accent {color:#80bdff !important}
    .orca-dark-header-icon {filter:brightness(0) invert(.82)}
    flt-span[style*="color: rgb(0, 0, 0)"],
    flt-span[style*="color: rgb(36, 36, 36)"],
    flt-span[style*="color: rgb(51, 51, 51)"] {color:#efeff0 !important}
    flt-span[style*="color: rgb(102, 102, 102)"],
    flt-span[style*="color: rgb(153, 153, 153)"],
    flt-span[style*="color: rgba(0, 0, 0,"] {color:#b3b3b5 !important}
    draw-rect[style*="background-color: rgb(255, 255, 255)"],
    draw-rrect[style*="background-color: rgb(255, 255, 255)"] {background-color:#2d2d31 !important}
    draw-rect[style*="background-color: rgb(232, 232, 232)"],
    draw-rrect[style*="background-color: rgb(232, 232, 232)"] {background-color:#36363c !important}
    draw-rect[style*="background-color: rgb(217, 217, 217)"],
    draw-rrect[style*="background-color: rgb(217, 217, 217)"] {background-color:#4a4a51 !important}
    draw-rect[style*="background-color: rgb(245, 245, 245)"],
    draw-rrect[style*="background-color: rgb(245, 245, 245)"] {background-color:#242428 !important}
  `;
  const install = root => {
    if (root.querySelector('#orca-dark-skin')) return;
    const style = document.createElement('style');
    style.id = 'orca-dark-skin'; style.textContent = css; root.appendChild(style);
    let queued = false;
    const refresh = () => {
      queued = false;
      root.querySelectorAll('flt-span').forEach(e => {
        const rgb = e.style.color.match(/rgba?\((\d+), (\d+), (\d+)/);
        const neutral = rgb && Math.max(+rgb[1],+rgb[2],+rgb[3])-Math.min(+rgb[1],+rgb[2],+rgb[3]) < 35 && +rgb[1] < 195;
        const blue = rgb && +rgb[1]<110 && +rgb[2]<165 && +rgb[3]>+rgb[2]*1.25 && +rgb[3]>100;
        if(e.classList.contains('orca-dark-accent')!==!!blue)e.classList.toggle('orca-dark-accent',!!blue);
        if (e.classList.contains('orca-dark-text') !== !!neutral) e.classList.toggle('orca-dark-text', !!neutral);
      });
      root.querySelectorAll('img').forEach(e=>e.classList.toggle('orca-dark-placeholder',placeholderURLs.has(e.src)));
      const headers = [...root.querySelectorAll('draw-rrect')].filter(e => e.style.backgroundColor === 'rgb(232, 232, 232)' && parseFloat(e.style.width)>100 && parseFloat(e.style.height)<=48).map(e=>e.getBoundingClientRect());
      root.querySelectorAll('canvas').forEach(e => {
        const r=e.getBoundingClientRect();
        const inHeader = r.width<=48 && r.height<=48 && headers.some(h=>r.left>=h.left && r.right<=h.right && r.top>=h.top && r.bottom<=h.bottom+2);
        if(e.classList.contains('orca-dark-header-icon')!==inHeader)e.classList.toggle('orca-dark-header-icon',inHeader);
      });
    };
    new MutationObserver(() => { if (!queued) {queued=true;requestAnimationFrame(refresh);} }).observe(root,{subtree:true,childList:true,attributes:true,attributeFilter:['style']});
    document.addEventListener('orca-dark-placeholder-ready',()=>{if(!queued){queued=true;requestAnimationFrame(refresh);}});
    requestAnimationFrame(refresh);
  };
  const original = Element.prototype.attachShadow;
  Element.prototype.attachShadow = function(options) {
    const root = original.call(this, options);
    if (this.localName === 'flt-glass-pane') install(root);
    return root;
  };
  document.querySelectorAll('flt-glass-pane').forEach(e => e.shadowRoot && install(e.shadowRoot));
  document.documentElement.style.backgroundColor = '#2d2d31';
})();
