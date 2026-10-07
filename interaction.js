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
