/* One shared account bar, semantic whole-card controls and bounded pending states. */
(() => {
 const header=document.querySelector('.site-header');
 const actions=document.querySelector('.header-actions');
 const playerBar=document.querySelector('.player-bar');
 function mergeHeader(){
   const lobby=document.body.dataset.section==='lobby';
   (lobby?playerBar:header).append(actions);
 }
 new MutationObserver(mergeHeader).observe(document.body,{attributes:true,attributeFilter:['data-section']});
 mergeHeader();
 const dock=document.querySelector('.lobby-dock');
 const items=[...dock.querySelectorAll('button')];
 let pinned=null,lastX=null,lastY=null;
 const emphasize=button=>{dock.classList.toggle('has-emphasis',!!button);items.forEach(item=>item.classList.toggle('dock-expanded',item===button));};
 dock.addEventListener('pointermove',event=>{
   if(event.pointerType==='touch'||!matchMedia('(min-width:681px)').matches)return;
   if(event.clientX===lastX&&event.clientY===lastY)return;
   lastX=event.clientX;lastY=event.clientY;
   const button=event.target.closest('button');if(items.includes(button))emphasize(button);
 });
 dock.addEventListener('pointerleave',()=>{lastX=null;lastY=null;emphasize(pinned);});
 items.forEach(button=>{
   button.addEventListener('click',()=>{pinned=button;emphasize(button);});
   button.addEventListener('focus',()=>{if(button.matches(':focus-visible'))emphasize(button);});
 });
 dock.addEventListener('focusout',event=>{if(!dock.contains(event.relatedTarget))emphasize(pinned);});
 document.querySelectorAll('.game-mode-card').forEach(card=>{
   const button=card.querySelector('.mode-play');
   button.setAttribute('aria-label',card.querySelector('h3').textContent+(card.classList.contains('private-mode')?'：建立房間':''));
   button.addEventListener('click',event=>{
     if(button.dataset.pending){event.preventDefault();event.stopImmediatePropagation();return;}
     button.dataset.pending='true';card.classList.add('pending');button.disabled=true;button.setAttribute('aria-busy','true');
     const release=()=>{delete button.dataset.pending;button.disabled=false;button.removeAttribute('aria-busy');card.classList.remove('pending');};
     setTimeout(release,1500);
   },{capture:true});
 });
})();
