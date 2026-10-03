const COLS = 10;
const ROWS = 20;
const COLORS = {
  I: '#61eaf2', J: '#4d75f6', L: '#ff9f43', O: '#ffd84d',
  S: '#55df7d', T: '#b66cff', Z: '#ff5277', G: '#586176'
};
const THEMES = {
  neon: {name:'霓虹經典',I:'#61eaf2',J:'#4d75f6',L:'#ff9f43',O:'#ffd84d',S:'#55df7d',T:'#b66cff',Z:'#ff5277',G:'#586176'},
  arcade: {name:'街機糖果',I:'#ff79c6',J:'#7aa2ff',L:'#ff8f5a',O:'#ffe66d',S:'#8be28b',T:'#c792ea',Z:'#ff5f6d',G:'#604f67'},
  ice: {name:'冰晶藍',I:'#b8f3ff',J:'#74a9ff',L:'#89d6ff',O:'#e9fbff',S:'#62d6e8',T:'#9fa8ff',Z:'#4f8fff',G:'#40546f'},
  mono: {name:'黑白極簡',I:'#f7f7f7',J:'#c9c9c9',L:'#e0e0e0',O:'#ffffff',S:'#b7b7b7',T:'#d8d8d8',Z:'#a8a8a8',G:'#555555'}
};
const SHAPES = {
  I: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
  J: [[1,0,0],[1,1,1],[0,0,0]], L: [[0,0,1],[1,1,1],[0,0,0]],
  O: [[1,1],[1,1]], S: [[0,1,1],[1,1,0],[0,0,0]],
  T: [[0,1,0],[1,1,1],[0,0,0]], Z: [[1,1,0],[0,1,1],[0,0,0]]
};
const PIECES = Object.keys(SHAPES);
const $ = (id) => document.getElementById(id);
const ui = Object.fromEntries(['auth','lobby','waiting','arena','hostBtn','joinBtn','matchBtn','rankedMatchBtn','practiceBtn','guestPracticeBtn','aiDifficulty','roomInput','lobbyMessage','roomCode','copyCode','waitingTitle','waitingText','cancelWait','backBtn','pauseBtn','matchMode','matchRoom','networkStatus','userMenu','userAvatar','userName','settingsBtn','signOutBtn','loginTab','signupTab','authForm','accountInput','passwordInput','authSubmit','authMessage','profileAvatar','profileName','profilePlayerId','profileWins','profileLosses','profileWinrate','profileThemeName','profileRank','profileRating','profileEditBtn','profileModal','settingsProfileAvatar','settingsProfileName','settingsProfileId','settingsProfileRank','settingsProfileRating','profileRankWinrate','profileRankMatches','profileRankRecord','profileCasualWinrate','profileCasualMatches','profileCasualRecord','avatarOptions','themeSelect','saveProfileBtn','closeProfileBtn','friendCount','friendNotice','friendSearchInput','friendSearchBtn','friendMessage','requestSection','incomingList','friendsList','lobbyHome','leaderboardPanel','friendsPanel','globalLeaderboard','friendLeaderboard','playerModal','closePlayerBtn','viewPlayerAvatar','viewPlayerName','viewPlayerId','viewPlayerRank','viewPlayerRating','viewRankWinrate','viewRankMatches','viewRankRecord','viewCasualWinrate','viewCasualMatches','viewCasualRecord','viewPlayerExtra','addPlayerFriendBtn','inviteBanner','inviteAvatar','inviteName','acceptInviteBtn','declineInviteBtn','localAvatar','rivalAvatar','gameCanvas','holdCanvas','nextCanvas','rivalCanvas','score','lines','rivalScore','rivalLines','rivalName','rivalBadge','localBadge','attackMeter','gameOverlay','overlayTitle','overlayText','countdown','resultModal','resultTitle','resultText','resultScore','resultLines','resultRatingBox','resultRating','resultSettlement','againBtn','lobbyBtn','toast'].map(k => [k, $(k)]));
const ctx = ui.gameCanvas.getContext('2d');
const holdCtx = ui.holdCanvas.getContext('2d');
const nextCtx = ui.nextCanvas.getContext('2d');
const rivalCtx = ui.rivalCanvas.getContext('2d');

let board, current, queue, holdPiece, canHold, score, lines, level, dropMs, lastDrop, raf, lockTimer=null, lockResetCount=0;
let running = false, paused = false, gameEnded = false, pendingGarbage = 0, roomMode = 'practice';
let peer = null, connection = null, isHost = false, activeRoom = '', lastStateSent = 0;
let peerReady = false, remoteReady = false, rematchRequested = false;
let db = null, session = null, playerName = 'PLAYER', authMode = 'login';
let currentRoomId = null, matchPoll = null, matchmaking = false, matchmakingMode = 'normal';
let playerProfile = {avatar:'⚡',block_theme:'neon',wins:0,losses:0,rating:1000,ranked_wins:0,ranked_losses:0}, rivalTheme='neon', socialPoll=null, pendingInvite=null, selectedAvatar='⚡';
let aiBoard = null, aiTimer = null, aiTicks = 0, aiDifficulty = 'normal', aiQueue = [], aiScore = 0, aiLines = 0;
let leaderboardPlayers = new Map(), viewedPlayer = null, socialFriendNames = new Set();
const AI_LEVELS = {easy:{name:'簡單',tick:2600,choice:12},normal:{name:'普通',tick:2050,choice:7},hard:{name:'困難',tick:1550,choice:3},expert:{name:'專家',tick:1150,choice:1}};
const RANKS = [{min:0,name:'新星'},{min:900,name:'青銅'},{min:1100,name:'白銀'},{min:1300,name:'黃金'},{min:1500,name:'白金'},{min:1750,name:'鑽石'},{min:2000,name:'大師'}];
const LOCK_DELAY_MS = 520, MAX_LOCK_RESETS = 15;

function emptyBoard() { return Array.from({length: ROWS}, () => Array(COLS).fill(null)); }
function shuffledBag() {
  const bag = [...PIECES];
  for (let i = bag.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [bag[i], bag[j]] = [bag[j], bag[i]]; }
  return bag;
}
function fillQueue() { while (queue.length < 8) queue.push(...shuffledBag()); }
function cloneShape(type) { return SHAPES[type].map(row => [...row]); }
function spawn(type = queue.shift()) {
  clearLockDelay(true);
  fillQueue();
  current = { type, shape: cloneShape(type), x: Math.floor((COLS - SHAPES[type][0].length) / 2), y: -1 };
  canHold = true;
  if (collides(current.x, current.y, current.shape)) endGame(false, '方塊堆到了頂端');
  drawSidePanels();
}
function collides(x, y, shape) {
  return shape.some((row, py) => row.some((cell, px) => cell && (x + px < 0 || x + px >= COLS || y + py >= ROWS || (y + py >= 0 && board[y + py][x + px]))));
}
function isGrounded() { return Boolean(current)&&collides(current.x,current.y+1,current.shape); }
function clearLockDelay(resetCount=false) { if(lockTimer){clearTimeout(lockTimer);lockTimer=null;}if(resetCount)lockResetCount=0; }
function scheduleLockDelay() {
  if(lockTimer||!running||paused||gameEnded||!isGrounded())return;
  lockTimer=setTimeout(()=>{lockTimer=null;if(running&&!paused&&!gameEnded&&isGrounded())lockPiece();},LOCK_DELAY_MS);
}
function refreshLockDelay() {
  if(!isGrounded()){clearLockDelay();return;}
  if(lockTimer&&lockResetCount<MAX_LOCK_RESETS){clearLockDelay();lockResetCount++;}
  scheduleLockDelay();
}
function rotateMatrix(matrix) { return matrix[0].map((_, i) => matrix.map(row => row[i]).reverse()); }
function rotate() {
  if (!running || paused) return;
  const next = rotateMatrix(current.shape);
  for (const kick of [0,-1,1,-2,2]) if (!collides(current.x + kick, current.y, next)) { current.x += kick; current.shape = next; refreshLockDelay(); break; }
  draw();
}
function move(dx, dy) {
  if (!running || paused) return false;
  if (!collides(current.x + dx, current.y + dy, current.shape)) { current.x += dx; current.y += dy;if(dx!==0)refreshLockDelay();else if(isGrounded())scheduleLockDelay();else clearLockDelay();draw(); return true; }
  if (dy > 0) scheduleLockDelay();
  return false;
}
function hardDrop() {
  if (!running || paused) return;
  let distance = 0; while (!collides(current.x, current.y + 1, current.shape)) { current.y++; distance++; }
  score += distance * 2; clearLockDelay(); lockPiece();
}
function hold() {
  if (!running || paused || !canHold) return;
  const old = holdPiece; holdPiece = current.type;
  if (old) spawn(old); else spawn();
  canHold = false; drawSidePanels(); draw();
}
function lockPiece() {
  clearLockDelay();
  current.shape.forEach((row, py) => row.forEach((cell, px) => { if (cell && current.y + py >= 0) board[current.y + py][current.x + px] = current.type; }));
  clearLines();
  if (pendingGarbage > 0) { addGarbage(pendingGarbage); pendingGarbage = 0; updateAttackMeter(); }
  spawn(); updateStats(); sendState(true); draw();
}
function clearLines() {
  const full = [];
  board.forEach((row, i) => { if (row.every(Boolean)) full.push(i); });
  if (!full.length) return;
  full.forEach(i => board.splice(i, 1));
  while (board.length < ROWS) board.unshift(Array(COLS).fill(null));
  const n = full.length;
  lines += n; level = Math.floor(lines / 10) + 1; dropMs = Math.max(90, 820 - (level - 1) * 62);
  score += [0, 100, 300, 500, 800][n] * level;
  const attack = [0, 0, 1, 2, 4][n];
  if (attack && roomMode === 'online') send({type: 'attack', lines: attack});
  if (attack && roomMode === 'ai') attackAi(attack);
  if (attack) toast(`${n} 行連消 · 攻擊 ${attack}`);
}
function addGarbage(amount) {
  for (let n = 0; n < amount; n++) {
    board.shift(); const gap = Math.floor(Math.random() * COLS);
    board.push(Array.from({length: COLS}, (_, i) => i === gap ? null : 'G'));
  }
  if (board[0].some(Boolean)) endGame(false, '對手的攻擊讓你出局');
}
function receiveAttack(amount) { pendingGarbage = Math.min(12, pendingGarbage + amount); updateAttackMeter(); toast(`警告：${amount} 行攻擊接近`); }
function updateAttackMeter() { ui.attackMeter.firstElementChild.style.height = `${Math.min(100, pendingGarbage / 12 * 100)}%`; }

function drawCell(target, x, y, color, size, alpha = 1) {
  target.globalAlpha = alpha; target.fillStyle = color; target.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
  target.fillStyle = 'rgba(255,255,255,.18)'; target.fillRect(x * size + 2, y * size + 2, size - 4, 2); target.globalAlpha = 1;
}
function themeColor(type, theme=playerProfile.block_theme) { return (THEMES[theme]||THEMES.neon)[type]||COLORS.G; }
function drawGrid(target, source, width = 300, height = 600, theme=playerProfile.block_theme) {
  target.clearRect(0, 0, width, height); target.fillStyle = '#080c16'; target.fillRect(0,0,width,height);
  const size = width / COLS;
  target.strokeStyle = 'rgba(120,155,205,.07)'; target.lineWidth = 1;
  for (let x=0;x<=COLS;x++){target.beginPath();target.moveTo(x*size,0);target.lineTo(x*size,height);target.stroke();}
  for (let y=0;y<=ROWS;y++){target.beginPath();target.moveTo(0,y*size);target.lineTo(width,y*size);target.stroke();}
  source.forEach((row,y)=>row.forEach((cell,x)=>{if(cell) drawCell(target,x,y,themeColor(cell,theme),size);}));
}
function ghostY() { let y = current.y; while (!collides(current.x, y + 1, current.shape)) y++; return y; }
function draw() {
  drawGrid(ctx, board);
  if (!current) return;
  const gy = ghostY();
  current.shape.forEach((row,py)=>row.forEach((cell,px)=>{if(cell && gy+py>=0) drawCell(ctx,current.x+px,gy+py,themeColor(current.type),30,.16);}));
  current.shape.forEach((row,py)=>row.forEach((cell,px)=>{if(cell && current.y+py>=0) drawCell(ctx,current.x+px,current.y+py,themeColor(current.type),30);}));
}
function drawMini(target, types, canvasWidth, canvasHeight) {
  target.clearRect(0,0,canvasWidth,canvasHeight); target.fillStyle='#0a0f1b'; target.fillRect(0,0,canvasWidth,canvasHeight);
  types.forEach((type,index)=>{ if(!type)return; const shape=SHAPES[type], size=18, ox=(canvasWidth-shape[0].length*size)/2, oy=index*76+13;
    shape.forEach((row,y)=>row.forEach((cell,x)=>{if(cell){target.fillStyle=themeColor(type);target.fillRect(ox+x*size+1,oy+y*size+1,size-2,size-2);}}));
  });
}
function drawSidePanels() { drawMini(holdCtx,[holdPiece],100,100); drawMini(nextCtx,queue.slice(0,3),100,250); }
function drawRival(remoteBoard) { drawGrid(rivalCtx, remoteBoard || emptyBoard(),300,600,rivalTheme); }
function updateStats() { ui.score.textContent = score.toLocaleString(); ui.lines.textContent = lines; }

function resetGame() {
  cancelAnimationFrame(raf); clearLockDelay(true); clearInterval(aiTimer); aiTimer=null; board = emptyBoard(); queue = []; holdPiece = null; score = 0; lines = 0; level = 1; dropMs = 820; lastDrop = performance.now(); pendingGarbage = 0; gameEnded = false; paused = false; running = false; canHold = true;
  if(roomMode==='ai'){aiBoard=emptyBoard();aiQueue=[];aiTicks=0;aiScore=0;aiLines=0;ui.rivalScore.textContent='0';ui.rivalLines.textContent='0';drawRival(aiBoard);}
  fillQueue(); spawn(); updateStats(); updateAttackMeter(); ui.gameOverlay.classList.add('hidden'); ui.resultModal.classList.add('hidden'); ui.localBadge.textContent = 'READY'; draw(); drawRival();
}
async function countdownAndStart() {
  resetGame(); ui.countdown.classList.remove('hidden');
  for (const value of ['3','2','1','GO']) { ui.countdown.textContent = value; await new Promise(r=>setTimeout(r, value==='GO'?500:700)); }
  ui.countdown.classList.add('hidden'); running = true; ui.localBadge.textContent = 'LIVE'; lastDrop = performance.now(); raf = requestAnimationFrame(loop); sendState(true);
  if(roomMode==='ai') startAiLoop();
}
function loop(now) {
  if (!running) return;
  if (!paused && now - lastDrop > dropMs) { move(0,1); lastDrop = now; }
  if (roomMode === 'online' && now - lastStateSent > 180) sendState();
  raf = requestAnimationFrame(loop);
}
function togglePause() {
  if (!running || gameEnded) return;
  if (roomMode === 'online') { toast('線上對戰不能暫停'); return; }
  paused = !paused;if(paused)clearLockDelay();else if(isGrounded())scheduleLockDelay();ui.gameOverlay.classList.toggle('hidden', !paused); ui.overlayTitle.textContent = paused ? '暫停' : ''; ui.overlayText.textContent = '按 P 繼續';
}
function endGame(won, reason) {
  if (gameEnded) return; gameEnded = true; running = false; clearLockDelay(); stopAllHeld(); cancelAnimationFrame(raf); clearInterval(aiTimer); aiTimer=null; ui.localBadge.textContent = won ? 'WIN' : 'KO';
  if (!won && roomMode === 'online') send({type:'gameover'});
  showResult(won, reason);
  if (roomMode === 'online' && db && session) {
    ui.resultSettlement.textContent='正在更新線上戰績…';
    callRpc('record_match_result',{p_won:won,p_ranked:matchmakingMode==='ranked'}).then(result=>{
      playerProfile={...playerProfile,...result}; renderProfile();
      ui.resultRating.textContent=matchmakingMode==='ranked'?`${result.rating_change>0?'+':''}${result.rating_change} RP`:'不影響 RP';
      ui.resultSettlement.textContent=`結算完成 · ${result.wins} 勝 ${result.losses} 敗 · 目前 ${result.rating} RP`;
      refreshSocial();refreshLeaderboards();
    }).catch(()=>{ui.resultSettlement.textContent='戰績同步失敗，請回到大廳後重試。';});
  }
}
function showResult(won, reason) {
  ui.resultTitle.textContent = roomMode === 'practice' ? '本局結束' : (won ? '勝利' : '落敗');
  ui.resultText.textContent = reason || (won ? '對手已經到達極限。' : '調整節奏，再戰一次。');
  ui.resultScore.textContent = score.toLocaleString(); ui.resultLines.textContent = lines; ui.resultRating.textContent=roomMode==='online'&&matchmakingMode==='ranked'?'結算中…':'—'; ui.resultSettlement.textContent=roomMode==='ai'?`AI：${aiScore.toLocaleString()} 分 · ${aiLines} 行`:''; ui.resultModal.classList.remove('hidden');
}

function showSection(section) { ['auth','lobby','waiting','arena'].forEach(k=>ui[k].classList.toggle('hidden', k!==section)); }
function startPractice() { disconnect(false); roomMode='practice'; ui.matchMode.textContent='單人練習'; ui.matchRoom.textContent=''; ui.rivalName.textContent='你的紀錄'; ui.rivalBadge.textContent='SOLO'; ui.rivalBadge.classList.add('muted'); showSection('arena'); countdownAndStart(); }
function startAiBattle() {
  disconnect(false); roomMode='ai'; aiDifficulty=ui.aiDifficulty?.value||'normal'; aiBoard=emptyBoard(); aiQueue=[]; aiTicks=0; aiScore=0; aiLines=0;
  ui.matchMode.textContent=`AI 對戰 · ${AI_LEVELS[aiDifficulty].name}`; ui.matchRoom.textContent='SOLO BATTLE'; ui.rivalName.textContent=`${AI_LEVELS[aiDifficulty].name} AI`; ui.rivalAvatar.textContent='🤖'; ui.rivalBadge.textContent=aiDifficulty.toUpperCase(); ui.rivalBadge.classList.remove('muted'); ui.rivalScore.textContent='0'; ui.rivalLines.textContent='0';
  showSection('arena'); drawRival(aiBoard); countdownAndStart();
}
function startAiLoop() { clearInterval(aiTimer); aiTimer=setInterval(aiTurn,AI_LEVELS[aiDifficulty].tick); }
function aiCollides(target,x,y,shape) { return shape.some((row,py)=>row.some((cell,px)=>cell&&(x+px<0||x+px>=COLS||y+py>=ROWS||(y+py>=0&&target[y+py][x+px])))); }
function aiBagPiece() { if(!aiQueue.length)aiQueue=shuffledBag();return aiQueue.shift(); }
function simulateAiPlacement(type,shape,x) {
  let y=-2; while(!aiCollides(aiBoard,x,y+1,shape))y++;
  if(shape.some((row,py)=>row.some((cell,px)=>cell&&y+py<0)))return null;
  const test=aiBoard.map(row=>[...row]); shape.forEach((row,py)=>row.forEach((cell,px)=>{if(cell)test[y+py][x+px]=type;}));
  let cleared=0; for(let row=test.length-1;row>=0;row--){if(test[row].every(Boolean)){test.splice(row,1);test.unshift(Array(COLS).fill(null));cleared++;row++;}}
  const heights=[],holes=[]; for(let x2=0;x2<COLS;x2++){let first=ROWS,holeCount=0,seen=false;for(let y2=0;y2<ROWS;y2++){if(test[y2][x2]){if(!seen)first=y2;seen=true;}else if(seen)holeCount++;}heights.push(ROWS-first);holes.push(holeCount);}
  const aggregate=heights.reduce((a,b)=>a+b,0), bump=heights.slice(1).reduce((sum,h,i)=>sum+Math.abs(h-heights[i]),0), maxHeight=Math.max(...heights);
  return {board:test,cleared,drop:y+2,quality:cleared*8-aggregate*.34-holes.reduce((a,b)=>a+b,0)*4-bump*.24-maxHeight*.3};
}
function aiChoices(type) {
  const choices=[]; let shape=cloneShape(type); const seen=new Set();
  for(let rotation=0;rotation<4;rotation++){const key=JSON.stringify(shape);if(!seen.has(key)){seen.add(key);for(let x=-2;x<COLS;x++){const move=simulateAiPlacement(type,shape,x);if(move)choices.push(move);}}shape=rotateMatrix(shape);}
  return choices.sort((a,b)=>b.quality-a.quality);
}
function aiTurn() {
  if(!running||paused||gameEnded||roomMode!=='ai')return;
  aiTicks++; const config=AI_LEVELS[aiDifficulty], type=aiBagPiece(), choices=aiChoices(type);
  if(!choices.length){endGame(true,'AI 的方塊已經堆到頂端。');return;}
  const pool=choices.slice(0,Math.min(config.choice,choices.length)); const move=pool[Math.floor(Math.random()*pool.length)]; aiBoard=move.board;
  aiLines+=move.cleared; const aiLevel=Math.floor(aiLines/10)+1; aiScore+=move.drop*2+[0,100,300,500,800][move.cleared]*aiLevel;
  const attack=[0,0,1,2,4][move.cleared]; if(attack)receiveAttack(attack);
  ui.rivalLines.textContent=aiLines; ui.rivalScore.textContent=aiScore.toLocaleString(); drawRival(aiBoard);
}
function attackAi(amount) {
  if(!aiBoard)return; for(let n=0;n<amount;n++){const overflow=aiBoard.shift();if(overflow.some(Boolean)){endGame(true,'你的攻擊讓 AI 出局。');return;}const gap=Math.floor(Math.random()*COLS);aiBoard.push(Array.from({length:COLS},(_,i)=>i===gap?null:'G'));} drawRival(aiBoard);
}
function setLobbyMessage(message='') { ui.lobbyMessage.textContent=message; }
function setNetwork(message, ok=true) { ui.networkStatus.textContent=message; document.querySelector('.status-dot').style.background=ok?'var(--cyan)':'var(--pink)'; }

function createPeer(id) {
  if (typeof Peer === 'undefined') { setLobbyMessage('連線模組載入失敗，請檢查網路後重試。'); return null; }
  return new Peer(id, {debug: 1});
}
function requireLogin() {
  if (session) return true;
  setLobbyMessage('請先登入才能使用線上對戰。'); showSection('auth'); return false;
}
function preparePeer(onOpen) {
  disconnect(false); peer=createPeer(); if(!peer)return;
  peer.on('open',()=>onOpen(peer.id));
  peer.on('connection', conn=>{ if(connection?.open){conn.close();return;} setupConnection(conn); });
  peer.on('error', handlePeerError);
}
async function callRpc(name, params={}) {
  const {data,error}=await db.rpc(name,params); if(error)throw error; return data;
}
function showWaiting(type, code='') {
  matchmaking=type==='match'; ui.waitingTitle.textContent=matchmaking?(matchmakingMode==='ranked'?'正在尋找牌位對手':'正在尋找對手'):'等待對手加入';
  ui.waitingText.textContent=matchmaking?(matchmakingMode==='ranked'?`目前 ${rankFor(playerProfile.rating).name} · 系統優先配對相近 RP`:'系統正在配對另一位線上玩家'):'把這組代碼傳給朋友';
  ui.copyCode.classList.toggle('hidden',matchmaking); ui.roomCode.textContent=code||'------'; showSection('waiting');
}
function beginPolling() {
  clearInterval(matchPoll); matchPoll=setInterval(async()=>{
    try { const room=await callRpc('get_match_status'); if(room?.state==='matched') handleMatchedRoom(room); }
    catch(error){ console.warn('Match status unavailable',error.message); }
  },1400);
}
async function hostRoom() {
  if(!requireLogin())return; setLobbyMessage('正在建立私人房間…');
  preparePeer(async peerId=>{ try { const room=await callRpc('create_private_room',{p_peer_id:peerId}); isHost=true; currentRoomId=room.room_id; activeRoom=room.code; showWaiting('private',activeRoom); setNetwork('私人房間上線'); beginPolling(); } catch(error){ onlineError(error); } });
}
async function findOpponent(mode='normal') {
  if(!requireLogin())return; setLobbyMessage('正在加入配對佇列…');
  matchmakingMode=mode;
  preparePeer(async peerId=>{ try { const room=await callRpc('find_match_mode',{p_peer_id:peerId,p_mode:mode}); showWaiting('match'); setNetwork(mode==='ranked'?'正在搜尋牌位對手':'正在搜尋玩家'); if(room?.state==='matched') handleMatchedRoom(room); else beginPolling(); } catch(error){ onlineError(error); } });
}
async function joinRoom() {
  if(!requireLogin())return; const code=ui.roomInput.value.trim().toUpperCase(); if(code.length!==6){setLobbyMessage('請輸入 6 位房間碼。');return;}
  setLobbyMessage('正在加入私人房間…');
  preparePeer(async peerId=>{ try { const room=await callRpc('join_private_room',{p_code:code,p_peer_id:peerId}); handleMatchedRoom(room); } catch(error){ onlineError(error); } });
}
function handleMatchedRoom(room) {
  if(currentRoomId===room.room_id && (connection?.open || roomMode==='online'))return;
  clearInterval(matchPoll); currentRoomId=room.room_id; activeRoom=room.code; isHost=room.host_id===session.user.id; matchmaking=!room.is_private; matchmakingMode=room.is_private?'normal':(room.match_mode||matchmakingMode||'normal');
  if(room.opponent_name) ui.rivalName.textContent=room.opponent_name;
  setNetwork('找到對手，正在連線');
  if(!isHost && !connection) setupConnection(peer.connect(room.host_peer_id,{reliable:true}));
  else if(isHost) { showWaiting(matchmaking?'match':'private',activeRoom); ui.waitingTitle.textContent='找到對手'; ui.waitingText.textContent='正在建立即時連線…'; }
}
function onlineError(error) {
  console.error(error); setLobbyMessage(error.message||'線上服務暫時無法使用。'); setNetwork('線上服務錯誤',false); disconnect(false); showSection('lobby');
}
function setupConnection(conn) {
  connection=conn;
  conn.on('open',()=>{ peerReady=true; setNetwork('對手已連線'); beginOnlineMatch(); send({type:'hello',username:playerName,avatar:playerProfile.avatar,theme:playerProfile.block_theme,wins:playerProfile.wins,losses:playerProfile.losses,rating:playerProfile.rating}); });
  conn.on('data',handleData);
  conn.on('close',()=>{ peerReady=false; setNetwork('對手已離線',false); if(running) endGame(true,'對手離開了房間。'); });
  conn.on('error',()=>toast('連線發生問題'));
}
function beginOnlineMatch() {
  roomMode='online'; ui.matchMode.textContent=matchmaking?(matchmakingMode==='ranked'?'牌位競技':'一般配對'):'私人對戰'; ui.matchRoom.textContent=`ROOM ${activeRoom}`; if(ui.rivalName.textContent==='等待中')ui.rivalName.textContent='對手'; ui.rivalBadge.textContent=matchmakingMode==='ranked'?'RANKED':'ONLINE'; ui.rivalBadge.classList.remove('muted'); showSection('arena'); countdownAndStart();
}
function handleData(data) {
  if(!data || !data.type)return;
  if(data.type==='hello' && data.username){ ui.rivalName.textContent=data.username; ui.rivalAvatar.textContent=data.avatar||'?'; rivalTheme=data.theme||'neon'; ui.rivalBadge.textContent=matchmakingMode==='ranked'?rankFor(data.rating).name:`${winrate(data.wins,data.losses)}% WIN`; drawRival(); }
  if(data.type==='state'){ drawRival(data.board); ui.rivalScore.textContent=(data.score||0).toLocaleString(); ui.rivalLines.textContent=data.lines||0; }
  if(data.type==='attack') receiveAttack(data.lines||0);
  if(data.type==='gameover') endGame(true,'對手已經到達極限。');
  if(data.type==='rematch'){ remoteReady=true; if(rematchRequested || isHost){ rematchRequested=false; remoteReady=false; send({type:'start'}); countdownAndStart(); } else toast('對手想再來一場'); }
  if(data.type==='start'){ rematchRequested=false; remoteReady=false; countdownAndStart(); }
}
function send(data){ if(connection?.open) connection.send(data); }
function sendState(force=false){ const now=performance.now(); if(!force && now-lastStateSent<170)return; lastStateSent=now; send({type:'state',board,score,lines}); }
function handlePeerError(error){ const known={'unavailable-id':'這個房間碼已被使用，請重新建立。','peer-unavailable':'找不到房間，請確認代碼是否正確。',network:'連線服務暫時無法使用。'}; setLobbyMessage(known[error.type]||'無法建立連線，請稍後再試。'); setNetwork('連線失敗',false); showSection('lobby'); }
function disconnect(notifyBackend=true){ clearLockDelay(true);stopAllHeld();clearInterval(matchPoll); clearInterval(aiTimer); matchPoll=null; aiTimer=null; if(notifyBackend&&db&&session)callRpc('leave_online',{p_room_id:currentRoomId}).catch(()=>{}); if(connection){connection.close();connection=null;} if(peer){peer.destroy();peer=null;} peerReady=false; activeRoom=''; currentRoomId=null; cancelAnimationFrame(raf); running=false; }
function backToLobby(){ disconnect(); ui.resultModal.classList.add('hidden'); showSection(session?'lobby':'auth'); ui.roomInput.value=''; setLobbyMessage(); setNetwork('連線服務待命'); }
function toast(message){ ui.toast.textContent=message; ui.toast.classList.add('show'); clearTimeout(toast.timer); toast.timer=setTimeout(()=>ui.toast.classList.remove('show'),1800); }

function escapeHtml(value='') { return String(value).replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char])); }
function winrate(wins=0,losses=0) { const total=wins+losses; return total?Math.round(wins/total*100):0; }
function rankFor(rating=1000) { return [...RANKS].reverse().find(rank=>Number(rating||1000)>=rank.min)||RANKS[0]; }
function shortPlayerId(id='') { const clean=String(id).replace(/-/g,'').toUpperCase();return `#${clean.slice(0,6)||'------'}`; }
function profileRecords(profile={}) {
  const rankedWins=profile.ranked_wins||0,rankedLosses=profile.ranked_losses||0;
  const casualWins=Math.max(0,(profile.wins||0)-rankedWins),casualLosses=Math.max(0,(profile.losses||0)-rankedLosses);
  return {rankedWins,rankedLosses,rankedMatches:rankedWins+rankedLosses,rankedRate:winrate(rankedWins,rankedLosses),casualWins,casualLosses,casualMatches:casualWins+casualLosses,casualRate:winrate(casualWins,casualLosses)};
}
function renderProfile() {
  const p=playerProfile, rate=winrate(p.wins,p.losses),records=profileRecords(p),playerId=shortPlayerId(p.id||session?.user?.id);
  ui.userAvatar.textContent=p.avatar; ui.localAvatar.textContent=p.avatar; ui.profileAvatar.textContent=p.avatar; ui.profileName.textContent=playerName;
  ui.profileWins.textContent=p.wins||0; ui.profileLosses.textContent=p.losses||0; ui.profileWinrate.textContent=`${rate}%`; ui.profileThemeName.textContent=(THEMES[p.block_theme]||THEMES.neon).name;
  ui.profilePlayerId.textContent=playerId;ui.profileRank.textContent=rankFor(p.rating).name; ui.profileRating.textContent=`${p.rating||1000} RP`;
  ui.settingsProfileAvatar.textContent=p.avatar;ui.settingsProfileName.textContent=playerName;ui.settingsProfileId.textContent=playerId;ui.settingsProfileRank.textContent=rankFor(p.rating).name;ui.settingsProfileRating.textContent=`${p.rating||1000} RP`;
  ui.profileRankWinrate.textContent=`${records.rankedRate}%`;ui.profileRankMatches.textContent=records.rankedMatches;ui.profileRankRecord.textContent=`${records.rankedWins} 勝 ${records.rankedLosses} 敗`;
  ui.profileCasualWinrate.textContent=`${records.casualRate}%`;ui.profileCasualMatches.textContent=records.casualMatches;ui.profileCasualRecord.textContent=`${records.casualWins} 勝 ${records.casualLosses} 敗`;
  document.documentElement.dataset.blockTheme=p.block_theme; draw(); drawSidePanels();
}
function leaderboardMarkup(players=[]) {
  if(!players.length)return '<p class="empty-state">目前還沒有排行資料。</p>';
  return players.map((p,index)=>`<div class="leaderboard-row ${p.username===playerName?'me':''}" data-player-id="${p.id}"><span class="leaderboard-pos">${String(index+1).padStart(2,'0')}</span><span class="leaderboard-avatar">${escapeHtml(p.avatar||'⚡')}</span><span class="leaderboard-player"><strong>${escapeHtml(p.username)}</strong><small>${winrate(p.wins,p.losses)}% 勝率 · ${p.wins||0} 勝</small></span><span class="leaderboard-rank">${rankFor(p.rating).name}</span><span class="leaderboard-rating">${p.rating||1000} RP</span><button class="leaderboard-view" data-player-id="${p.id}">查看</button></div>`).join('');
}
async function refreshLeaderboards() {
  if(!db||!session)return;
  try { const data=await callRpc('get_leaderboards'),players=[...(data.global||[]),...(data.friends||[])]; leaderboardPlayers=new Map(players.map(player=>[String(player.id),player])); ui.globalLeaderboard.innerHTML=leaderboardMarkup(data.global||[]); ui.friendLeaderboard.innerHTML=leaderboardMarkup(data.friends||[]); }
  catch(error){ui.globalLeaderboard.innerHTML='<p class="empty-state">排行榜暫時無法載入。</p>';console.warn('Leaderboard unavailable',error.message);}
}
function openPlayerProfile(id) {
  const p=leaderboardPlayers.get(String(id)); if(!p)return; viewedPlayer=p;const records=profileRecords(p);
  ui.viewPlayerAvatar.textContent=p.avatar||'⚡';ui.viewPlayerName.textContent=p.username;ui.viewPlayerId.textContent=shortPlayerId(p.id);ui.viewPlayerRank.textContent=rankFor(p.rating).name;ui.viewPlayerRating.textContent=`${p.rating||1000} RP`;
  ui.viewRankWinrate.textContent=`${records.rankedRate}%`;ui.viewRankMatches.textContent=records.rankedMatches;ui.viewRankRecord.textContent=`${records.rankedWins} 勝 ${records.rankedLosses} 敗`;
  ui.viewCasualWinrate.textContent=`${records.casualRate}%`;ui.viewCasualMatches.textContent=records.casualMatches;ui.viewCasualRecord.textContent=`${records.casualWins} 勝 ${records.casualLosses} 敗`;
  ui.viewPlayerExtra.textContent=`方塊造型 ${(THEMES[p.block_theme]||THEMES.neon).name}`;
  const self=p.username===playerName,friend=socialFriendNames.has(p.username.toLocaleLowerCase());ui.addPlayerFriendBtn.classList.toggle('hidden',self);ui.addPlayerFriendBtn.disabled=friend;ui.addPlayerFriendBtn.textContent=friend?'已是好友':'加入好友';ui.playerModal.classList.remove('hidden');
}
async function addViewedPlayerFriend() {
  if(!viewedPlayer)return;ui.addPlayerFriendBtn.disabled=true;
  try{await callRpc('send_friend_request',{p_username:viewedPlayer.username});ui.addPlayerFriendBtn.textContent='邀請已送出';toast(`已向 ${viewedPlayer.username} 送出好友邀請`);await refreshSocial();}
  catch(error){ui.addPlayerFriendBtn.disabled=false;toast(error.message||'無法送出好友邀請');}
}
function switchLobbyView(view) {
  ui.lobbyHome.classList.toggle('hidden',view!=='home'); ui.leaderboardPanel.classList.toggle('hidden',view!=='leaderboard'); ui.friendsPanel.classList.toggle('hidden',view!=='friends');
  document.querySelectorAll('[data-lobby-view]').forEach(button=>button.classList.toggle('active',button.dataset.lobbyView===view));
  if(view==='leaderboard')refreshLeaderboards(); if(view==='profile')openProfileSettings();
}
function openProfileSettings() {
  selectedAvatar=playerProfile.avatar; ui.themeSelect.value=playerProfile.block_theme;
  ui.avatarOptions.querySelectorAll('button').forEach(button=>button.classList.toggle('selected',button.dataset.avatar===selectedAvatar));
  ui.profileModal.classList.remove('hidden');
}
async function saveProfileSettings() {
  ui.saveProfileBtn.disabled=true;
  try { const next=await callRpc('save_profile',{p_avatar:selectedAvatar,p_block_theme:ui.themeSelect.value}); playerProfile={...playerProfile,...next}; renderProfile(); ui.profileModal.classList.add('hidden'); toast('個人設定已儲存'); await refreshSocial(); }
  catch(error){toast(error.message||'無法儲存設定');} finally {ui.saveProfileBtn.disabled=false;}
}
function renderSocial(state) {
  if(state.profile){ playerProfile={...playerProfile,...state.profile}; playerName=state.profile.username||playerName; ui.userName.textContent=playerName; renderProfile(); }
  const friends=state.friends||[], requests=state.requests||[];
  socialFriendNames=new Set(friends.map(friend=>friend.username.toLocaleLowerCase()));
  ui.friendCount.textContent=`${friends.length} 位好友`;
  ui.friendNotice.classList.toggle('hidden',!requests.length&&!(state.invites||[]).length);
  ui.requestSection.classList.toggle('hidden',!requests.length);
  ui.incomingList.innerHTML=requests.map(item=>`<div class="player-row"><span class="row-avatar">${escapeHtml(item.avatar||'⚡')}</span><div><strong>${escapeHtml(item.username)}</strong><small>想加你為好友</small></div><div class="row-actions"><button data-action="accept-friend" data-id="${item.friendship_id}">接受</button><button class="danger" data-action="decline-friend" data-id="${item.friendship_id}">略過</button></div></div>`).join('');
  ui.friendsList.innerHTML=friends.length?friends.map(friend=>`<div class="player-row"><span class="row-avatar">${escapeHtml(friend.avatar||'⚡')}</span><div><strong>${escapeHtml(friend.username)}</strong><small class="${friend.online?'online-dot':''}">${friend.online?'● 線上 · ':''}${rankFor(friend.rating).name} · ${winrate(friend.wins,friend.losses)}% 勝率</small></div><div class="row-actions"><button data-action="invite-friend" data-id="${friend.id}">邀請對戰</button></div></div>`).join(''):'<p class="empty-state">還沒有好友，搜尋角色帳號加入。</p>';
  const invite=(state.invites||[])[0];
  if(invite && invite.id!==pendingInvite?.id){pendingInvite=invite;ui.inviteAvatar.textContent=invite.avatar||'⚡';ui.inviteName.textContent=invite.username;ui.inviteBanner.classList.remove('hidden');}
}
async function refreshSocial() {
  if(!db||!session)return;
  try { renderSocial(await callRpc('get_social_state')); } catch(error){console.warn('Social state unavailable',error.message);}
}
async function sendFriendRequest() {
  const username=ui.friendSearchInput.value.trim(); if(!username){ui.friendMessage.textContent='請輸入角色帳號。';return;}
  ui.friendSearchBtn.disabled=true;
  try { await callRpc('send_friend_request',{p_username:username}); ui.friendMessage.textContent='好友邀請已送出。'; ui.friendSearchInput.value=''; await refreshSocial(); }
  catch(error){ui.friendMessage.textContent=error.message||'找不到這位玩家。';} finally {ui.friendSearchBtn.disabled=false;}
}
async function respondFriend(id,accept) { try{await callRpc('respond_friend_request',{p_friendship_id:id,p_accept:accept});await refreshSocial();}catch(error){toast(error.message);} }
async function inviteFriend(friendId) {
  if(!requireLogin())return; setLobbyMessage('正在建立好友對戰房間…');
  preparePeer(async peerId=>{ try { const room=await callRpc('create_private_room',{p_peer_id:peerId}); await callRpc('send_battle_invite',{p_friend_id:friendId,p_room_code:room.code}); isHost=true; currentRoomId=room.room_id; activeRoom=room.code; showWaiting('private',activeRoom); ui.waitingText.textContent='好友邀請已送出'; setNetwork('等待好友接受邀請'); beginPolling(); } catch(error){onlineError(error);} });
}
async function respondBattleInvite(accept) {
  if(!pendingInvite)return;
  try { const result=await callRpc('respond_battle_invite',{p_invite_id:pendingInvite.id,p_accept:accept}); ui.inviteBanner.classList.add('hidden'); const invite=pendingInvite; pendingInvite=null; if(accept&&result?.room_code){ui.roomInput.value=result.room_code;await joinRoom();}else{toast(`已略過 ${invite.username} 的邀請`);} await refreshSocial(); }
  catch(error){toast(error.message||'邀請已失效');ui.inviteBanner.classList.add('hidden');pendingInvite=null;}
}

function selectAuthMode(mode) {
  authMode=mode; const signup=mode==='signup'; ui.loginTab.classList.toggle('active',!signup); ui.signupTab.classList.toggle('active',signup); ui.loginTab.setAttribute('aria-selected',String(!signup)); ui.signupTab.setAttribute('aria-selected',String(signup)); ui.passwordInput.autocomplete=signup?'new-password':'current-password'; ui.authSubmit.firstElementChild.textContent=signup?'創建帳號':'登入'; ui.authMessage.textContent='';
}
async function accountEmail(account) {
  const normalized=account.trim().normalize('NFKC').toLocaleLowerCase('zh-TW');
  if(normalized.includes('@'))return normalized;
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(`blockstorm:${normalized}`));
  const id=Array.from(new Uint8Array(digest),byte=>byte.toString(16).padStart(2,'0')).join('').slice(0,48);
  return `${id}@players.blockstorm.local`;
}
async function submitAuth(event) {
  event.preventDefault(); if(!db){ui.authMessage.textContent='線上服務尚未設定，請完成 README 的 Supabase 設定。';return;}
  const username=ui.accountInput.value.trim(), password=ui.passwordInput.value; ui.authSubmit.disabled=true; ui.authMessage.textContent=authMode==='signup'?'正在建立角色…':'正在登入…';
  try {
    if(username.length<2)throw new Error('角色帳號至少需要 2 個字元。');
    const email=await accountEmail(username);
    if(authMode==='signup'){
      const {data,error}=await db.auth.signUp({email,password,options:{data:{username}}}); if(error)throw error;
      ui.authMessage.textContent=data.session?'角色建立完成，已自動登入。':'角色建立完成，請直接登入。';
    } else { const {error}=await db.auth.signInWithPassword({email,password}); if(error)throw error; }
  } catch(error){ui.authMessage.textContent=translateAuthError(error.message);} finally {ui.authSubmit.disabled=false;}
}
function translateAuthError(message='') {
  if(/invalid login credentials/i.test(message))return '角色帳號或密碼不正確。'; if(/already registered|user already registered/i.test(message))return '這個角色帳號已被使用。'; if(/password/i.test(message)&&/characters/i.test(message))return '密碼至少需要 8 個字元。'; return message;
}
async function applySession(nextSession) {
  session=nextSession; clearInterval(socialPoll); socialPoll=null; if(!session){ui.userMenu.classList.add('hidden');ui.inviteBanner.classList.add('hidden');showSection('auth');return;}
  const {data}=await db.from('profiles').select('username,avatar,block_theme,wins,losses,rating,ranked_wins,ranked_losses').eq('id',session.user.id).single(); playerName=data?.username||session.user.user_metadata?.username||'PLAYER'; playerProfile={...playerProfile,...data,id:session.user.id}; ui.userName.textContent=playerName; ui.userMenu.classList.remove('hidden'); ui.rivalName.textContent='等待中'; showSection('lobby'); switchLobbyView('home'); setNetwork('玩家大廳已連線'); renderProfile(); await refreshSocial(); socialPoll=setInterval(refreshSocial,4000);
}
async function initOnlineServices() {
  const config=window.BLOCKSTORM_CONFIG||{}; if(!config.supabaseUrl||!config.supabaseAnonKey||!window.supabase){showSection('auth');ui.authMessage.textContent='尚未連接線上服務；目前仍可使用離線練習。';setNetwork('等待後端設定',false);return;}
  db=window.supabase.createClient(config.supabaseUrl,config.supabaseAnonKey); const {data}=await db.auth.getSession(); await applySession(data.session); db.auth.onAuthStateChange((_event,next)=>setTimeout(()=>applySession(next),0));
}

ui.hostBtn.addEventListener('click',hostRoom); ui.joinBtn.addEventListener('click',joinRoom); ui.matchBtn.addEventListener('click',()=>findOpponent('normal')); ui.rankedMatchBtn.addEventListener('click',()=>findOpponent('ranked')); ui.practiceBtn.addEventListener('click',startAiBattle); ui.guestPracticeBtn.addEventListener('click',startPractice);
ui.roomInput.addEventListener('input',e=>e.target.value=e.target.value.toUpperCase().replace(/[^A-Z2-9]/g,'')); ui.roomInput.addEventListener('keydown',e=>{if(e.key==='Enter')joinRoom();});
ui.copyCode.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(activeRoom);toast('房間碼已複製');}catch{toast(`房間碼：${activeRoom}`);}});
ui.cancelWait.addEventListener('click',backToLobby); ui.backBtn.addEventListener('click',backToLobby); ui.pauseBtn.addEventListener('click',togglePause); ui.lobbyBtn.addEventListener('click',backToLobby);
ui.againBtn.addEventListener('click',()=>{ ui.resultModal.classList.add('hidden'); if(roomMode==='practice'||roomMode==='ai')countdownAndStart(); else {rematchRequested=true;send({type:'rematch'});toast('等待對手準備…');} });
ui.loginTab.addEventListener('click',()=>selectAuthMode('login')); ui.signupTab.addEventListener('click',()=>selectAuthMode('signup')); ui.authForm.addEventListener('submit',submitAuth); ui.signOutBtn.addEventListener('click',async()=>{disconnect();await db?.auth.signOut();});
ui.settingsBtn.addEventListener('click',openProfileSettings); ui.profileEditBtn.addEventListener('click',openProfileSettings); ui.closeProfileBtn.addEventListener('click',()=>{ui.profileModal.classList.add('hidden');renderProfile();}); ui.saveProfileBtn.addEventListener('click',saveProfileSettings);
ui.avatarOptions.addEventListener('click',event=>{const button=event.target.closest('button[data-avatar]');if(!button)return;selectedAvatar=button.dataset.avatar;ui.settingsProfileAvatar.textContent=selectedAvatar;ui.avatarOptions.querySelectorAll('button').forEach(item=>item.classList.toggle('selected',item===button));});
ui.friendSearchBtn.addEventListener('click',sendFriendRequest); ui.friendSearchInput.addEventListener('keydown',event=>{if(event.key==='Enter')sendFriendRequest();});
ui.incomingList.addEventListener('click',event=>{const button=event.target.closest('button[data-action]');if(!button)return;respondFriend(button.dataset.id,button.dataset.action==='accept-friend');});
ui.friendsList.addEventListener('click',event=>{const button=event.target.closest('button[data-action="invite-friend"]');if(button)inviteFriend(button.dataset.id);});
ui.acceptInviteBtn.addEventListener('click',()=>respondBattleInvite(true)); ui.declineInviteBtn.addEventListener('click',()=>respondBattleInvite(false));
document.querySelector('.lobby-dock').addEventListener('click',event=>{const button=event.target.closest('[data-lobby-view]');if(button)switchLobbyView(button.dataset.lobbyView);});
document.querySelector('.panel-tabs').addEventListener('click',event=>{const button=event.target.closest('[data-rank-tab]');if(!button)return;document.querySelectorAll('[data-rank-tab]').forEach(item=>item.classList.toggle('active',item===button));ui.globalLeaderboard.classList.toggle('hidden',button.dataset.rankTab!=='global');ui.friendLeaderboard.classList.toggle('hidden',button.dataset.rankTab!=='friends');});
[ui.globalLeaderboard,ui.friendLeaderboard].forEach(list=>list.addEventListener('click',event=>{const row=event.target.closest('[data-player-id]');if(row)openPlayerProfile(row.dataset.playerId);}));
ui.closePlayerBtn.addEventListener('click',()=>ui.playerModal.classList.add('hidden'));ui.addPlayerFriendBtn.addEventListener('click',addViewedPlayerFriend);

const actions={left:()=>move(-1,0),right:()=>move(1,0),down:()=>move(0,1),rotate,drop:hardDrop,hold};
const heldControls=new Map();
function stopHeld(id) { const state=heldControls.get(id);if(!state)return;clearTimeout(state.delay);clearInterval(state.repeat);heldControls.delete(id); }
function stopAllHeld() { [...heldControls.keys()].forEach(stopHeld); }
function startHeld(id,action,delay=120,rate=38) {
  if(heldControls.has(id))return;
  action();const state={delay:null,repeat:null};heldControls.set(id,state);
  state.delay=setTimeout(()=>{action();state.repeat=setInterval(action,rate);},delay);
}
document.querySelectorAll('.mobile-controls button').forEach(btn=>{
  const action=btn.dataset.action,isRepeatable=['left','right','down'].includes(action),id=`touch-${action}`;
  btn.addEventListener('pointerdown',event=>{event.preventDefault();if(isRepeatable)startHeld(id,actions[action],110,action==='down'?55:42);else actions[action]?.();});
  ['pointerup','pointercancel','pointerleave'].forEach(type=>btn.addEventListener(type,()=>stopHeld(id)));
});
document.addEventListener('keydown',e=>{
  if(e.target.closest('input,select,textarea,[contenteditable="true"]'))return;
  if(['ArrowLeft','ArrowRight','ArrowDown','ArrowUp','Space'].includes(e.code))e.preventDefault();
  const held={ArrowLeft:{id:'key-left',opposite:'key-right',action:actions.left,delay:120,rate:38},ArrowRight:{id:'key-right',opposite:'key-left',action:actions.right,delay:120,rate:38},ArrowDown:{id:'key-down',action:actions.down,delay:80,rate:45}};
  if(held[e.code]){if(e.repeat)return;const control=held[e.code];if(control.opposite)stopHeld(control.opposite);startHeld(control.id,control.action,control.delay,control.rate);return;}
  if(e.repeat)return;const once={ArrowUp:rotate,Space:hardDrop,KeyC:hold,KeyP:togglePause};once[e.code]?.();
});
document.addEventListener('keyup',e=>{const ids={ArrowLeft:'key-left',ArrowRight:'key-right',ArrowDown:'key-down'};if(ids[e.code])stopHeld(ids[e.code]);});
window.addEventListener('blur',stopAllHeld);window.addEventListener('beforeunload',disconnect);

board=emptyBoard(); queue=[]; fillQueue(); current={type:'T',shape:cloneShape('T'),x:3,y:3}; draw(); drawRival(); drawSidePanels();
selectAuthMode('login');
initOnlineServices().catch(error=>{console.error(error);showSection('auth');ui.authMessage.textContent='無法連接帳號服務，請稍後再試。';});
