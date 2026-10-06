const COLS = 10;
const ROWS = 20;
const COLORS = {
  I: '#61eaf2', J: '#4d75f6', L: '#ff9f43', O: '#ffd84d',
  S: '#55df7d', T: '#b66cff', Z: '#ff5277', G: '#586176'
};
const THEMES = {
  neon: {name:'霓虹經典',price:0,rarity:'免費',pattern:'glow',I:'#61eaf2',J:'#4d75f6',L:'#ff9f43',O:'#ffd84d',S:'#55df7d',T:'#b66cff',Z:'#ff5277',G:'#586176'},
  arcade: {name:'街機糖果',price:0,rarity:'免費',pattern:'pixel',I:'#ff79c6',J:'#7aa2ff',L:'#ff8f5a',O:'#ffe66d',S:'#8be28b',T:'#c792ea',Z:'#ff5f6d',G:'#604f67'},
  ice: {name:'冰晶藍',price:400,rarity:'稀有',pattern:'crystal',I:'#b8f3ff',J:'#74a9ff',L:'#89d6ff',O:'#e9fbff',S:'#62d6e8',T:'#9fa8ff',Z:'#4f8fff',G:'#40546f'},
  mono: {name:'黑白極簡',price:450,rarity:'稀有',pattern:'line',I:'#f7f7f7',J:'#c9c9c9',L:'#e0e0e0',O:'#ffffff',S:'#b7b7b7',T:'#d8d8d8',Z:'#a8a8a8',G:'#555555'},
  sunset: {name:'落日餘暉',price:550,rarity:'史詩',pattern:'sunset',I:'#ffcf8b',J:'#e47aff',L:'#ff713e',O:'#ffe170',S:'#ff9f68',T:'#c071ff',Z:'#ff4775',G:'#69435f'},
  forest: {name:'翡翠森林',price:550,rarity:'史詩',pattern:'leaf',I:'#94f5d5',J:'#4ca98b',L:'#d4c47a',O:'#f0e68c',S:'#50df83',T:'#8bcf7b',Z:'#d96b72',G:'#38584a'},
  magma: {name:'熔岩核心',price:700,rarity:'傳說',pattern:'crack',I:'#ffd36c',J:'#ff7a45',L:'#ff9b28',O:'#fff08a',S:'#f26d3d',T:'#e64d75',Z:'#ff3548',G:'#67332d'},
  royal: {name:'皇家星塵',price:800,rarity:'傳說',pattern:'star',I:'#9ff4ff',J:'#7386ff',L:'#f3b4ff',O:'#fff4a8',S:'#82e4c8',T:'#c68cff',Z:'#ff82bc',G:'#514a77'},
  pearl: {name:'奶霜珍珠',price:600,rarity:'史詩',pattern:'pearl',I:'#bfe7e8',J:'#b9c7e8',L:'#e8c8ad',O:'#f1dfad',S:'#b9d8bd',T:'#d4bedf',Z:'#e4b7bd',G:'#817c78'},
  sakura: {name:'櫻花和菓',price:650,rarity:'史詩',pattern:'petal',I:'#acdce1',J:'#9eaed5',L:'#eeb795',O:'#f2d899',S:'#acd0ae',T:'#d6acd1',Z:'#e99eaa',G:'#765d68'},
  ocean: {name:'深海微光',price:700,rarity:'史詩',pattern:'wave',I:'#79e1df',J:'#527fc4',L:'#73b6d1',O:'#d1e8a5',S:'#61c7aa',T:'#8f9fd5',Z:'#7598c5',G:'#365267'},
  lavender: {name:'薰衣草霧',price:750,rarity:'傳說',pattern:'mist',I:'#c8e4ed',J:'#909fd2',L:'#d8b8cf',O:'#e9dca9',S:'#afcfbd',T:'#b999d4',Z:'#d89ab4',G:'#5e5872'},
  copper: {name:'赤銅工坊',price:850,rarity:'傳說',pattern:'brushed',I:'#b9d8cf',J:'#7f9caf',L:'#d39062',O:'#e1bb70',S:'#86ad86',T:'#ad829b',Z:'#c47468',G:'#584c47'},
  mint: {name:'薄荷玻璃',price:650,rarity:'史詩',pattern:'glass',I:'#a6eee7',J:'#83bace',L:'#b7d2ae',O:'#e7e1a1',S:'#8bd9b0',T:'#a9b9d9',Z:'#dca8ad',G:'#49645f'}
};
const BACKGROUNDS = {
  void:{name:'深空競技場',price:0,rarity:'免費',colors:['#080c16','#10192a'],pattern:'grid'},
  aurora:{name:'極光脈衝',price:450,rarity:'稀有',colors:['#071a22','#163044'],pattern:'aurora'},
  glacier:{name:'冰晶宮殿',price:600,rarity:'史詩',colors:['#071521','#164464'],pattern:'crystal'},
  sunsetCity:{name:'暮色都市',price:650,rarity:'史詩',colors:['#1b0d27','#59253d'],pattern:'city'},
  forestRuins:{name:'翡翠遺跡',price:650,rarity:'史詩',colors:['#071912','#18382c'],pattern:'leaves'},
  magmaCore:{name:'熔岩地心',price:800,rarity:'傳說',colors:['#170807','#4c1710'],pattern:'magma'},
  royalNebula:{name:'皇家星雲',price:950,rarity:'傳說',colors:['#0c0922','#31205b'],pattern:'stars'},
  linen:{name:'亞麻棋盤',price:400,rarity:'稀有',colors:['#252a2d','#394044'],pattern:'linen'},
  paperGarden:{name:'紙境庭園',price:550,rarity:'史詩',colors:['#17241e','#354b3c'],pattern:'garden'},
  rainWindow:{name:'雨夜窗景',price:650,rarity:'史詩',colors:['#101c28','#294356'],pattern:'rain'},
  dune:{name:'暮色沙丘',price:700,rarity:'史詩',colors:['#261916','#704739'],pattern:'dunes'},
  moonLake:{name:'月下靜湖',price:850,rarity:'傳說',colors:['#101526','#303b58'],pattern:'moon'}
};
const TASKS = [
  {id:'daily_match',category:'daily',title:'完成一場對戰',desc:'任意完成一場單人或線上對戰',metric:'daily_matches',target:1,coins:80,gems:0},
  {id:'daily_lines',category:'daily',title:'消除 10 行',desc:'今日累積消除 10 行',metric:'daily_lines',target:10,coins:100,gems:0},
  {id:'daily_score',category:'daily',title:'今日累積 5,000 分',desc:'所有完成的對戰分數都會累積',metric:'daily_score',target:5000,coins:120,gems:0},
  {id:'daily_win',category:'daily',title:'贏得一場對戰',desc:'擊敗 AI 或線上玩家',metric:'daily_wins',target:1,coins:0,gems:2},
  {id:'main_first',category:'main',title:'踏入風暴',desc:'完成生涯第一場對戰',metric:'total_matches',target:1,coins:150,gems:0},
  {id:'main_lines_20',category:'main',previous:'main_first',title:'開始整理',desc:'生涯累積消除 20 行',metric:'total_lines',target:20,coins:180,gems:0},
  {id:'main_score_10k',category:'main',previous:'main_lines_20',title:'分數起飛',desc:'生涯累積獲得 10,000 分',metric:'total_score',target:10000,coins:220,gems:1},
  {id:'main_wins_3',category:'main',previous:'main_score_10k',title:'初露鋒芒',desc:'生涯累積贏得 3 場',metric:'total_wins',target:3,coins:280,gems:2},
  {id:'main_lines_100',category:'main',previous:'main_wins_3',title:'方塊清道夫',desc:'生涯累積消除 100 行',metric:'total_lines',target:100,coins:400,gems:2},
  {id:'main_combo_3',category:'main',previous:'main_lines_100',title:'掌握節奏',desc:'單局達成 3 COMBO',metric:'best_combo',target:3,coins:450,gems:3},
  {id:'main_tetris_5',category:'main',previous:'main_combo_3',title:'四行攻勢',desc:'生涯完成 5 次 TETRIS',metric:'total_tetrises',target:5,coins:520,gems:4},
  {id:'main_score_100k',category:'main',previous:'main_tetris_5',title:'六位數玩家',desc:'生涯累積獲得 100,000 分',metric:'total_score',target:100000,coins:650,gems:5},
  {id:'main_wins_10',category:'main',previous:'main_score_100k',title:'十勝之路',desc:'生涯累積贏得 10 場',metric:'total_wins',target:10,coins:800,gems:8},
  {id:'main_perfect',category:'main',previous:'main_wins_10',title:'風暴之眼',desc:'完成一次 PERFECT CLEAR',metric:'perfect_clears',target:1,coins:1000,gems:12},
  {id:'ach_score_5k',category:'achievement',title:'分數萌芽',desc:'單局達到 5,000 分',metric:'best_score',target:5000,coins:120,gems:1},
  {id:'ach_score_10k',category:'achievement',title:'分數突破 I',desc:'單局達到 10,000 分',metric:'best_score',target:10000,coins:200,gems:3},
  {id:'ach_score_25k',category:'achievement',title:'分數突破 II',desc:'單局達到 25,000 分',metric:'best_score',target:25000,coins:350,gems:5},
  {id:'ach_score_50k',category:'achievement',title:'分數突破 III',desc:'單局達到 50,000 分',metric:'best_score',target:50000,coins:500,gems:8},
  {id:'ach_combo_2',category:'achievement',title:'接續消除',desc:'單局達成 2 COMBO',metric:'best_combo',target:2,coins:120,gems:1},
  {id:'ach_combo_3',category:'achievement',title:'連鎖反應',desc:'單局達成 3 COMBO',metric:'best_combo',target:3,coins:200,gems:3},
  {id:'ach_combo_5',category:'achievement',title:'風暴連鎖',desc:'單局達成 5 COMBO',metric:'best_combo',target:5,coins:400,gems:6},
  {id:'ach_combo_8',category:'achievement',title:'無間連鎖',desc:'單局達成 8 COMBO',metric:'best_combo',target:8,coins:700,gems:10},
  {id:'ach_tetris_1',category:'achievement',title:'第一次四消',desc:'完成第一次 TETRIS',metric:'total_tetrises',target:1,coins:150,gems:2},
  {id:'ach_tetris_5',category:'achievement',title:'四行專家',desc:'生涯累積完成 5 次 TETRIS',metric:'total_tetrises',target:5,coins:300,gems:5},
  {id:'ach_tetris_20',category:'achievement',title:'四行大師',desc:'生涯累積完成 20 次 TETRIS',metric:'total_tetrises',target:20,coins:800,gems:12},
  {id:'ach_perfect',category:'achievement',title:'完美無瑕',desc:'完成一次 PERFECT CLEAR',metric:'perfect_clears',target:1,coins:500,gems:10},
  {id:'ach_perfect_3',category:'achievement',title:'完美主義',desc:'生涯完成 3 次 PERFECT CLEAR',metric:'perfect_clears',target:3,coins:1000,gems:16},
  {id:'ach_matches_10',category:'achievement',title:'熟悉戰場',desc:'生涯完成 10 場對戰',metric:'total_matches',target:10,coins:300,gems:3},
  {id:'ach_matches_50',category:'achievement',title:'百戰前夕',desc:'生涯完成 50 場對戰',metric:'total_matches',target:50,coins:900,gems:10}
];
const SHAPES = {
  I: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
  J: [[1,0,0],[1,1,1],[0,0,0]], L: [[0,0,1],[1,1,1],[0,0,0]],
  O: [[1,1],[1,1]], S: [[0,1,1],[1,1,0],[0,0,0]],
  T: [[0,1,0],[1,1,1],[0,0,0]], Z: [[1,1,0],[0,1,1],[0,0,0]]
};
const PIECES = Object.keys(SHAPES);
const $ = (id) => document.getElementById(id);
const ui = Object.fromEntries(['auth','lobby','waiting','partyRoom','arena','hostBtn','joinBtn','matchBtn','rankedMatchBtn','practiceBtn','guestPracticeBtn','aiDifficulty','roomInput','lobbyMessage','roomCode','copyCode','waitingTitle','waitingText','cancelWait','partyRoomTitle','partyCode','leavePartyBtn','partyCount','partyMembers','partyInviteToggleBtn','partyInvitePanel','partyInviteList','partyMaxPlayers','partyTargetMode','partyGarbageDelay','partyHostNote','partyStatus','partyReadyBtn','partyStartBtn','roomChatMessages','roomChatForm','roomChatInput','lobbyChatMessages','lobbyChatForm','lobbyChatInput','lobbyChatToast','lobbyChatToastAvatar','lobbyChatToastName','lobbyChatToastMessage','chatPanel','backBtn','pauseBtn','matchMode','matchRoom','networkStatus','userMenu','userAvatar','userName','settingsBtn','signOutBtn','themeModeBtn','matchmakingToast','matchmakingToastTitle','matchmakingToastText','cancelMatchBtn','loginTab','signupTab','authForm','accountInput','passwordInput','authSubmit','authMessage','profileAvatar','profileName','profilePlayerId','profileWins','profileLosses','profileWinrate','profileThemeName','profileRank','profileRating','profileEditBtn','profileModal','settingsProfileAvatar','settingsProfileName','settingsProfileId','settingsProfileRank','settingsProfileRating','profileRankWinrate','profileRankMatches','profileRankRecord','profileCasualWinrate','profileCasualMatches','profileCasualRecord','avatarOptions','themeSelect','backgroundSelect','saveProfileBtn','closeProfileBtn','friendCount','friendNotice','friendSearchInput','friendSearchBtn','friendMessage','requestSection','incomingList','friendsList','lobbyHome','leaderboardPanel','friendsPanel','shopPanel','tasksPanel','taskTabs','taskSummary','taskList','claimAllTasksBtn','shopGrid','coinBalance','gemBalance','shopCoinBalance','shopGemBalance','dailyMission','dailyMissionTitle','dailyMissionProgress','globalLeaderboard','friendLeaderboard','playerModal','closePlayerBtn','viewPlayerAvatar','viewPlayerName','viewPlayerId','viewPlayerRank','viewPlayerRating','viewRankWinrate','viewRankMatches','viewRankRecord','viewCasualWinrate','viewCasualMatches','viewCasualRecord','viewPlayerExtra','addPlayerFriendBtn','inviteBanner','inviteAvatar','inviteName','acceptInviteBtn','declineInviteBtn','localAvatar','rivalAvatar','gameCanvas','holdCanvas','nextCanvas','score','lines','opponentGrid','rivalCanvas','rivalScore','rivalLines','rivalName','rivalBadge','localBadge','attackMeter','gameOverlay','overlayTitle','overlayText','countdown','clearFeedback','battleSocial','battleChatFeed','resultModal','resultTitle','resultText','resultScore','resultLines','resultRatingBox','resultRating','resultSettlement','againBtn','lobbyBtn','toast'].map(k => [k, $(k)]));
const ctx = ui.gameCanvas.getContext('2d');
const holdCtx = ui.holdCanvas.getContext('2d');
const nextCtx = ui.nextCanvas.getContext('2d');
let rivalCtx = ui.rivalCanvas.getContext('2d');

let board, current, queue, holdPiece, canHold, score, lines, level, dropMs, lastDrop, raf, lockTimer=null, lockResetCount=0;
let running = false, paused = false, gameEnded = false, pendingGarbage = 0, garbageQueue=[], roomMode = 'practice', combo=-1, backToBack=false,b2bChain=0,lastActionRotation=false,lastRotationKickIndex=0, bestComboThisGame=0, tetrisesThisGame=0, perfectClearsThisGame=0;
let peer = null, connection = null, connections = new Map(), isHost = false, activeRoom = '', lastStateSent = 0;
let peerReady = false, remoteReady = false, rematchRequested = false;
let db = null, session = null, playerName = 'PLAYER', authMode = 'login';
let currentRoomId = null, matchPoll = null, matchmaking = false, matchmakingMode = 'normal';
let partyState=null,partyReady=false,partyPoll=null,lobbyChatPoll=null,lockedRows=0,targetCursor=0;
let lastLobbyMessageId=0,lobbyChatInitialized=false,lobbyChatNoticeTimer=null;
let opponents=new Map(),eliminatedPlayers=new Set(),roomChat=[];
let playerProfile = {avatar:'⚡',block_theme:'neon',battle_background:'void',wins:0,losses:0,rating:1000,ranked_wins:0,ranked_losses:0}, rivalTheme='neon',rivalBackground='void', socialPoll=null, pendingInvite=null, selectedAvatar='⚡',socialFriends=[];
let aiBoard = null, aiTimer = null, aiTicks = 0, aiDifficulty = 'normal', aiQueue = [], aiScore = 0, aiLines = 0;
let leaderboardPlayers = new Map(), viewedPlayer = null, socialFriendNames = new Set();
let shopState={coins:0,gems:0,owned:['neon','arcade'],ownedBackgrounds:['void']},ownedThemes=new Set(['neon','arcade']),ownedBackgrounds=new Set(['void']),shopCategory='block';
let progressionState={progress:{},claims:[]},taskCategory='daily';
const AI_LEVELS = {easy:{name:'簡單',tick:2600,choice:12},normal:{name:'普通',tick:2050,choice:7},hard:{name:'困難',tick:1550,choice:3},expert:{name:'專家',tick:1150,choice:1}};
const RANKS = [{min:0,name:'新星'},{min:900,name:'青銅'},{min:1100,name:'白銀'},{min:1300,name:'黃金'},{min:1500,name:'白金'},{min:1750,name:'鑽石'},{min:2000,name:'大師'}];
const LOCK_DELAY_MS = 520, MAX_LOCK_RESETS = 15, GARBAGE_DELAY_MS = 1200;
const COMBO_ATTACK=[0,0,1,1,2,2,3,3,4,4,5,5,6];

function setUiTheme(theme){
  const next=theme==='dark'?'dark':'light';document.documentElement.dataset.uiTheme=next;ui.themeModeBtn.textContent=next==='dark'?'☀':'☾';ui.themeModeBtn.title=next==='dark'?'切換亮色模式':'切換深色模式';localStorage.setItem('blockstorm-ui-theme',next);
}
setUiTheme(localStorage.getItem('blockstorm-ui-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'));

function emptyBoard() { return Array.from({length: ROWS}, () => Array(COLS).fill(null)); }
function applyLockedFloor(target=board,count=lockedRows){
  const rows=Math.max(0,Math.min(6,Number(count)||0));
  for(let y=ROWS-rows;y<ROWS;y++)target[y]=Array(COLS).fill('X');
  return target;
}
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
  current = { type, shape: cloneShape(type), rotation:0, x: Math.floor((COLS - SHAPES[type][0].length) / 2), y: -1 };
  lastActionRotation=false;lastRotationKickIndex=0;
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
const JLSTZ_KICKS={
  '0>1':[[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],'1>2':[[0,0],[1,0],[1,-1],[0,2],[1,2]],
  '2>3':[[0,0],[1,0],[1,1],[0,-2],[1,-2]],'3>0':[[0,0],[-1,0],[-1,-1],[0,2],[-1,2]]
};
const I_KICKS={
  '0>1':[[0,0],[-2,0],[1,0],[-2,-1],[1,2]],'1>2':[[0,0],[-1,0],[2,0],[-1,2],[2,-1]],
  '2>3':[[0,0],[2,0],[-1,0],[2,1],[-1,-2]],'3>0':[[0,0],[1,0],[-2,0],[1,-2],[-2,1]]
};
function rotationKicks(type,from,to){
  const table=type==='I'?I_KICKS:JLSTZ_KICKS,key=`${from}>${to}`;
  if(table[key])return table[key];
  return (table[`${to}>${from}`]||[[0,0]]).map(([dx,dy])=>[-dx,-dy]);
}
function rotate(direction=1) {
  if (!running || paused || current.type==='O') return;
  const next=direction>0?rotateMatrix(current.shape):rotateMatrix(rotateMatrix(rotateMatrix(current.shape)));
  const from=current.rotation,to=(from+(direction>0?1:3))%4,kicks=rotationKicks(current.type,from,to);
  for (let index=0;index<kicks.length;index++){const [dx,dyUp]=kicks[index];if (!collides(current.x+dx,current.y-dyUp,next)) { current.x+=dx;current.y-=dyUp;current.shape=next;current.rotation=to;lastActionRotation=true;lastRotationKickIndex=index;refreshLockDelay();break; }}
  draw();
}
function rotateCCW(){rotate(-1);}
function move(dx, dy) {
  if (!running || paused) return false;
  if (!collides(current.x + dx, current.y + dy, current.shape)) { current.x += dx; current.y += dy;lastActionRotation=false;if(dx!==0)refreshLockDelay();else if(isGrounded())scheduleLockDelay();else clearLockDelay();draw(); return true; }
  if (dy > 0) scheduleLockDelay();
  return false;
}
function hardDrop() {
  if (!running || paused) return;
  let distance = 0; while (!collides(current.x, current.y + 1, current.shape)) { current.y++; distance++; }
  score += distance * 2;if(distance>0)lastActionRotation=false;clearLockDelay(); lockPiece();
}
function softDrop(){if(move(0,1)){score+=1;updateStats();return true;}return false;}
function hold() {
  if (!running || paused || !canHold) return;
  const old = holdPiece; holdPiece = current.type;
  if (old) spawn(old); else spawn();
  canHold = false; drawSidePanels(); draw();
}
function tSpinType() {
  if(current?.type!=='T'||!lastActionRotation)return false;
  const cx=current.x+1,cy=current.y+1;
  const occupied=([dx,dy])=>cx+dx<0||cx+dx>=COLS||cy+dy>=ROWS||cy+dy<0||Boolean(board[cy+dy]?.[cx+dx]);
  const corners=[[-1,-1],[1,-1],[1,1],[-1,1]],filled=corners.filter(occupied).length;if(filled<3)return false;
  const frontByRotation=[[[ -1,-1],[1,-1]],[[1,-1],[1,1]],[[-1,1],[1,1]],[[-1,-1],[-1,1]]];
  const front=frontByRotation[current.rotation]||frontByRotation[0];return front.every(occupied)||lastRotationKickIndex===4?'full':'mini';
}
function lockPiece() {
  clearLockDelay();
  const tSpin=tSpinType();
  current.shape.forEach((row, py) => row.forEach((cell, px) => { if (cell && current.y + py >= 0) board[current.y + py][current.x + px] = current.type; }));
  clearLines(tSpin);
  applyReadyGarbage();
  if(gameEnded)return;
  spawn(); updateStats(); sendState(true); draw();
}
function clearLines(tSpin=false) {
  const full = [];
  board.forEach((row, i) => { if (row.every(Boolean)&&!row.includes('X')) full.push(i); });
  if (!full.length) {combo=-1;if(tSpin){score+=(tSpin==='mini'?100:400)*level;showClearFeedback(tSpin==='mini'?'T-SPIN MINI':'T-SPIN','旋轉技巧');}return;}
  full.forEach(i => board.splice(i, 1));
  while (board.length < ROWS) board.unshift(Array(COLS).fill(null));
  const n = full.length,perfectClear=lockedRows===0&&board.every(row=>row.every(cell=>!cell));
  lines += n; level = Math.floor(lines / 10) + 1; dropMs = Math.max(90, 820 - (level - 1) * 62);
  combo++;
  bestComboThisGame=Math.max(bestComboThisGame,combo);
  const mini=tSpin==='mini'&&n===1,difficult=Boolean(tSpin)||n===4,b2bBonus=difficult&&backToBack,previousB2B=b2bChain,base=mini?200:tSpin?[0,800,1200,1600][n]:[0,100,300,500,800][n];
  score+=Math.floor(base*(b2bBonus?1.5:1))*level+Math.max(0,combo)*50*level+(perfectClear?2000*level:0);
  let attack=mini?0:tSpin?[0,2,4,6][n]:[0,0,1,2,4][n];
  if(b2bBonus)attack+=1;
  attack+=COMBO_ATTACK[Math.min(combo,12)]||0;
  if(difficult){b2bChain=backToBack?b2bChain+1:1;backToBack=true;}else{const surge=previousB2B>=4?Math.min(5,Math.max(1,Math.floor((previousB2B-2)/2))):0;attack+=surge;b2bChain=0;backToBack=false;}
  if(perfectClear){attack+=3;b2bChain+=2;backToBack=true;}
  if(n===4)tetrisesThisGame++;
  if(perfectClear)perfectClearsThisGame++;
  let result=dispatchAttack(attack);
  if(difficult&&result.cancelled){const pressure=dispatchAttack(1);result={generated:result.generated+1,cancelled:result.cancelled+pressure.cancelled,sent:result.sent+pressure.sent};}
  score+=result.cancelled*75*level;
  const names=mini?['','T-SPIN MINI SINGLE']:tSpin?['','T-SPIN SINGLE','T-SPIN DOUBLE','T-SPIN TRIPLE']:['','SINGLE','DOUBLE','TRIPLE','TETRIS'];
  const surgeReleased=!difficult&&previousB2B>=4?Math.min(5,Math.max(1,Math.floor((previousB2B-2)/2))):0;
  const badges=[b2bBonus?`B2B ×${b2bChain}`:'',combo>0?`${combo} COMBO`:'',perfectClear?'PERFECT CLEAR +3':'',surgeReleased?`SURGE +${surgeReleased}`:'',result.cancelled?`抵銷 ${result.cancelled}`:'',result.sent?`攻擊 ${result.sent}`:''].filter(Boolean).join(' · ');
  showClearFeedback(names[n],badges||`${n} 行消除`,Math.min(4,n+(difficult?1:0)));
  if(result.sent||result.cancelled)toast([result.cancelled?`抵銷 ${result.cancelled} 行`:'',result.sent?`送出 ${result.sent} 行`:'' ].filter(Boolean).join(' · '));
}
function dispatchAttack(amount){
  if(!amount)return {generated:0,cancelled:0,sent:0};
  const {remaining,cancelled}=cancelPendingGarbage(amount);
  if(remaining&&roomMode==='online')send({type:'attack',lines:remaining,from:session?.user?.id});
  if(remaining&&roomMode==='ai')setTimeout(()=>{if(!gameEnded&&roomMode==='ai')attackAi(remaining);},650);
  return {generated:amount,cancelled,sent:remaining};
}
function addGarbage(amount) {
  const gap = Math.floor(Math.random() * COLS);
  for (let n = 0; n < amount; n++) {
    board.shift();
    const row=Array.from({length: COLS}, (_, i) => i === gap ? null : 'G');
    if(lockedRows){board.splice(ROWS-lockedRows,0,row);board.pop();}else board.push(row);
  }
  if (board[0].some(Boolean)) endGame(false, '對手的攻擊讓你出局');
}
function receiveAttack(amount) {
  const accepted=Math.min(amount,Math.max(0,12-pendingGarbage));if(!accepted)return;
  const delay=roomMode==='online'&&partyState?Number(partyState.settings?.garbage_delay||1200):GARBAGE_DELAY_MS;
  garbageQueue.push({lines:accepted,readyAt:performance.now()+delay});pendingGarbage+=accepted;updateAttackMeter();setTimeout(updateAttackMeter,delay+20);toast(`警告：${accepted} 行攻擊，${(delay/1000).toFixed(1)} 秒後生效`);
}
function cancelPendingGarbage(amount){
  let left=amount,cancelled=0;
  while(left>0&&garbageQueue.length){const item=garbageQueue[0],cancel=Math.min(left,item.lines);item.lines-=cancel;left-=cancel;cancelled+=cancel;pendingGarbage-=cancel;if(item.lines<=0)garbageQueue.shift();}
  updateAttackMeter();return {remaining:left,cancelled};
}
function applyReadyGarbage(){
  const now=performance.now();let ready=0;
  while(garbageQueue.length&&garbageQueue[0].readyAt<=now){const item=garbageQueue.shift();ready+=item.lines;pendingGarbage-=item.lines;}
  if(ready)addGarbage(ready);updateAttackMeter();
}
function updateAttackMeter() { ui.attackMeter.firstElementChild.style.height = `${Math.min(100,pendingGarbage/12*100)}%`;ui.attackMeter.classList.toggle('danger',garbageQueue.some(item=>item.readyAt<=performance.now())); }
function showClearFeedback(title,detail='',power=1){
  const frame=ui.gameCanvas.closest('.board-frame'),impact=Math.max(1,Math.min(4,Number(power)||1));ui.clearFeedback.innerHTML=`<strong>${title}</strong><span>${detail}</span>`;ui.clearFeedback.classList.remove('show');frame.classList.remove('clear-pulse','clear-shake','clear-impact-3','clear-impact-4');void ui.clearFeedback.offsetWidth;ui.clearFeedback.classList.add('show');frame.classList.add('clear-pulse','clear-shake');if(impact>=3)frame.classList.add(`clear-impact-${impact}`);if(navigator.vibrate)navigator.vibrate(impact>=4?[24,20,32]:impact>=3?22:14);clearTimeout(showClearFeedback.timer);showClearFeedback.timer=setTimeout(()=>{ui.clearFeedback.classList.remove('show');frame.classList.remove('clear-pulse','clear-shake','clear-impact-3','clear-impact-4');},1050);
}

function drawCell(target, x, y, color, size, alpha = 1, themeId=playerProfile.block_theme) {
  const px=x*size+1,py=y*size+1,w=size-2,theme=THEMES[themeId]||THEMES.neon;
  target.save();target.globalAlpha=alpha;target.shadowColor='rgba(0,0,0,.2)';target.shadowBlur=Math.max(1,size*.055);target.shadowOffsetY=1;target.fillStyle=color;target.fillRect(px,py,w,w);target.shadowBlur=0;target.shadowOffsetY=0;
  const shine=target.createLinearGradient(px,py,px+w,py+w);shine.addColorStop(0,'rgba(255,255,255,.26)');shine.addColorStop(.48,'rgba(255,255,255,.025)');shine.addColorStop(1,'rgba(22,29,35,.13)');target.fillStyle=shine;target.fillRect(px,py,w,w);
  target.strokeStyle='rgba(255,255,255,.25)';target.lineWidth=Math.max(.65,size/28);
  if(theme.pattern==='crystal'){target.beginPath();target.moveTo(px+w*.08,py+w*.7);target.lineTo(px+w*.48,py+w*.28);target.lineTo(px+w*.91,py+w*.62);target.moveTo(px+w*.48,py+w*.28);target.lineTo(px+w*.56,py+w*.92);target.stroke();}
  else if(theme.pattern==='pixel'){const q=w/5;target.fillStyle='rgba(255,255,255,.13)';target.fillRect(px+q,py+q,q,q);target.fillRect(px+q*3,py+q*3,q,q);}
  else if(theme.pattern==='line'){target.strokeStyle='rgba(255,255,255,.2)';target.strokeRect(px+w*.18,py+w*.18,w*.64,w*.64);}
  else if(theme.pattern==='sunset'){target.strokeStyle='rgba(255,245,201,.28)';target.beginPath();target.arc(px+w*.66,py+w*.46,w*.2,Math.PI,Math.PI*2);target.stroke();}
  else if(theme.pattern==='leaf'){target.beginPath();target.ellipse(px+w*.52,py+w*.52,w*.24,w*.105,-.62,0,Math.PI*2);target.stroke();target.beginPath();target.moveTo(px+w*.35,py+w*.66);target.lineTo(px+w*.69,py+w*.37);target.stroke();}
  else if(theme.pattern==='crack'){target.strokeStyle='rgba(255,241,170,.34)';target.beginPath();target.moveTo(px+w*.55,py+w*.06);target.lineTo(px+w*.46,py+w*.4);target.lineTo(px+w*.68,py+w*.57);target.lineTo(px+w*.52,py+w*.94);target.stroke();}
  else if(theme.pattern==='star'){target.fillStyle='rgba(255,255,255,.58)';target.fillRect(px+w*.26,py+w*.27,1.5,1.5);target.fillRect(px+w*.7,py+w*.62,1.5,1.5);target.fillRect(px+w*.48,py+w*.78,1,1);}
  else if(theme.pattern==='pearl'){const pearl=target.createRadialGradient(px+w*.38,py+w*.32,0,px+w*.48,py+w*.48,w*.55);pearl.addColorStop(0,'rgba(255,255,255,.3)');pearl.addColorStop(.5,'rgba(255,255,255,.05)');pearl.addColorStop(1,'rgba(116,92,101,.1)');target.fillStyle=pearl;target.fillRect(px,py,w,w);}
  else if(theme.pattern==='petal'){target.fillStyle='rgba(255,255,255,.18)';target.beginPath();target.ellipse(px+w*.43,py+w*.43,w*.18,w*.09,-.65,0,Math.PI*2);target.ellipse(px+w*.62,py+w*.58,w*.16,w*.075,-.65,0,Math.PI*2);target.fill();}
  else if(theme.pattern==='wave'){target.strokeStyle='rgba(220,252,255,.27)';target.beginPath();target.moveTo(px,py+w*.58);target.bezierCurveTo(px+w*.25,py+w*.38,px+w*.45,py+w*.77,px+w*.72,py+w*.53);target.bezierCurveTo(px+w*.82,py+w*.45,px+w*.9,py+w*.44,px+w,py+w*.5);target.stroke();}
  else if(theme.pattern==='mist'){const mist=target.createLinearGradient(px,py,px+w,py);mist.addColorStop(0,'transparent');mist.addColorStop(.48,'rgba(255,255,255,.2)');mist.addColorStop(.7,'rgba(255,255,255,.04)');mist.addColorStop(1,'transparent');target.fillStyle=mist;target.fillRect(px,py+w*.25,w,w*.5);}
  else if(theme.pattern==='brushed'){target.strokeStyle='rgba(255,244,220,.2)';for(let i=.22;i<.9;i+=.22){target.beginPath();target.moveTo(px+w*.12,py+w*i);target.lineTo(px+w*.88,py+w*(i-.07));target.stroke();}}
  else if(theme.pattern==='glass'){target.fillStyle='rgba(255,255,255,.16)';target.beginPath();target.moveTo(px,py);target.lineTo(px+w*.72,py);target.lineTo(px+w*.27,py+w);target.lineTo(px,py+w);target.fill();}
  else {target.fillStyle='rgba(255,255,255,.16)';target.fillRect(px+1,py+1,w-2,Math.max(1.5,size*.065));}
  target.restore();
}
function themeColor(type, theme=playerProfile.block_theme) { return type==='X'?'#5b5853':(THEMES[theme]||THEMES.neon)[type]||COLORS.G; }
function drawBackdrop(target,width,height,backgroundId='void'){
  const bg=BACKGROUNDS[backgroundId]||BACKGROUNDS.void,gradient=target.createLinearGradient(0,0,width,height);gradient.addColorStop(0,bg.colors[0]);gradient.addColorStop(1,bg.colors[1]);target.fillStyle=gradient;target.fillRect(0,0,width,height);
  target.save();target.globalAlpha=.065;
  if(bg.pattern==='aurora'){target.globalCompositeOperation='screen';target.globalAlpha=.16;for(let i=0;i<3;i++){const ribbon=target.createLinearGradient(0,0,width,0);ribbon.addColorStop(0,'rgba(89,221,217,0)');ribbon.addColorStop(.3,i===1?'#9f88ed':'#67d8cb');ribbon.addColorStop(.72,i===2?'#e09bcc':'#8bb5ee');ribbon.addColorStop(1,'rgba(120,180,220,0)');target.strokeStyle=ribbon;target.lineWidth=12-i*2;target.shadowColor=i===1?'#9f88ed':'#67d8cb';target.shadowBlur=12;target.beginPath();target.moveTo(-25,70+i*125);target.bezierCurveTo(width*.24,15+i*120,width*.66,145+i*92,width+30,65+i*120);target.stroke();}target.shadowBlur=0;target.globalCompositeOperation='source-over';}
  else if(bg.pattern==='crystal'){target.strokeStyle='#b8efff';for(let x=-height;x<width;x+=75){target.beginPath();target.moveTo(x,0);target.lineTo(x+height,height);target.stroke();target.beginPath();target.moveTo(x+35,0);target.lineTo(x-height*.35,height*.35);target.stroke();}}
  else if(bg.pattern==='city'){target.fillStyle='#ff86ae';for(let x=0;x<width;x+=28){const h=50+(x*17)%120;target.fillRect(x,height-h,20,h);}}
  else if(bg.pattern==='leaves'){target.strokeStyle='#7de1a9';for(let y=30;y<height;y+=80)for(let x=15;x<width;x+=65){target.beginPath();target.ellipse(x,y,18,7,-.6,0,Math.PI*2);target.stroke();}}
  else if(bg.pattern==='magma'){target.strokeStyle='#ff743d';target.lineWidth=3;for(let x=15;x<width;x+=60){target.beginPath();target.moveTo(x,0);for(let y=0;y<height;y+=70)target.lineTo(x+(y/70%2?24:-10),y);target.stroke();}}
  else if(bg.pattern==='stars'){target.fillStyle='#fff';for(let i=0;i<55;i++){const x=(i*73)%width,y=(i*137)%height,s=i%9===0?2:1;target.fillRect(x,y,s,s);}}
  else if(bg.pattern==='linen'){target.strokeStyle='#d8cbb6';target.lineWidth=.7;for(let x=0;x<width;x+=8){target.beginPath();target.moveTo(x,0);target.lineTo(x,height);target.stroke();}for(let y=0;y<height;y+=8){target.beginPath();target.moveTo(0,y);target.lineTo(width,y);target.stroke();}}
  else if(bg.pattern==='garden'){target.strokeStyle='#c5ddb9';for(let y=45;y<height;y+=95)for(let x=20;x<width;x+=78){target.beginPath();target.ellipse(x,y,22,8,-.55,0,Math.PI*2);target.stroke();target.beginPath();target.moveTo(x-17,y+10);target.lineTo(x+17,y-10);target.stroke();}}
  else if(bg.pattern==='rain'){target.strokeStyle='#acd5e8';target.lineWidth=1;for(let i=0;i<75;i++){const x=(i*47)%width,y=(i*79)%height;target.beginPath();target.moveTo(x,y);target.lineTo(x-5,y+18);target.stroke();}}
  else if(bg.pattern==='dunes'){target.strokeStyle='#efc3a6';target.lineWidth=16;for(let y=110;y<height;y+=150){target.beginPath();target.moveTo(-20,y);target.bezierCurveTo(width*.25,y-70,width*.55,y+45,width+25,y-25);target.stroke();}}
  else if(bg.pattern==='moon'){const moon=target.createRadialGradient(width*.72,height*.2,0,width*.72,height*.2,width*.34);moon.addColorStop(0,'rgba(225,235,255,.75)');moon.addColorStop(.3,'rgba(177,195,229,.23)');moon.addColorStop(1,'transparent');target.fillStyle=moon;target.fillRect(0,0,width,height);target.strokeStyle='#bacde7';for(let y=height*.62;y<height;y+=24){target.beginPath();target.moveTo(width*.18,y);target.lineTo(width*.82,y);target.stroke();}}
  target.restore();
}
function drawGrid(target, source, width = 300, height = 600, theme=playerProfile.block_theme,background=playerProfile.battle_background||'void') {
  target.clearRect(0, 0, width, height);drawBackdrop(target,width,height,background);
  const size = width / COLS;
  target.strokeStyle = 'rgba(120,155,205,.07)'; target.lineWidth = 1;
  for (let x=0;x<=COLS;x++){target.beginPath();target.moveTo(x*size,0);target.lineTo(x*size,height);target.stroke();}
  for (let y=0;y<=ROWS;y++){target.beginPath();target.moveTo(0,y*size);target.lineTo(width,y*size);target.stroke();}
  source.forEach((row,y)=>row.forEach((cell,x)=>{if(cell) drawCell(target,x,y,themeColor(cell,theme),size,1,theme);}));
}
function ghostY() { let y = current.y; while (!collides(current.x, y + 1, current.shape)) y++; return y; }
function draw() {
  drawGrid(ctx, board);
  if (!current) return;
  const gy = ghostY();
  current.shape.forEach((row,py)=>row.forEach((cell,px)=>{if(cell && gy+py>=0) drawCell(ctx,current.x+px,gy+py,themeColor(current.type),30,.16,playerProfile.block_theme);}));
  current.shape.forEach((row,py)=>row.forEach((cell,px)=>{if(cell && current.y+py>=0) drawCell(ctx,current.x+px,current.y+py,themeColor(current.type),30,1,playerProfile.block_theme);}));
}
function drawMini(target, types, canvasWidth, canvasHeight) {
  target.clearRect(0,0,canvasWidth,canvasHeight); target.fillStyle='#0a0f1b'; target.fillRect(0,0,canvasWidth,canvasHeight);
  types.forEach((type,index)=>{ if(!type)return; const shape=SHAPES[type], size=18, ox=(canvasWidth-shape[0].length*size)/2, oy=index*76+13;
    shape.forEach((row,y)=>row.forEach((cell,x)=>{if(cell)drawCell(target,(ox/size)+x,(oy/size)+y,themeColor(type),size,1,playerProfile.block_theme);}));
  });
}
function drawSidePanels() { drawMini(holdCtx,[holdPiece],100,100); drawMini(nextCtx,queue.slice(0,3),100,250); }
function drawRival(remoteBoard) { drawGrid(rivalCtx, remoteBoard || emptyBoard(),300,600,rivalTheme,rivalBackground); }
function liveBoard(){const next=board.map(row=>[...row]);if(current)current.shape.forEach((row,py)=>row.forEach((cell,px)=>{const y=current.y+py,x=current.x+px;if(cell&&y>=0&&y<ROWS&&x>=0&&x<COLS)next[y][x]=current.type;}));return next;}
function updateStats() { ui.score.textContent = score.toLocaleString(); ui.lines.textContent = lines; }

function resetGame() {
  cancelAnimationFrame(raf); clearLockDelay(true); clearInterval(aiTimer); aiTimer=null; board = applyLockedFloor(emptyBoard(),lockedRows); queue = []; holdPiece = null; score = 0; lines = 0; level = 1; dropMs = 820; lastDrop = performance.now(); pendingGarbage = 0;garbageQueue=[];combo=-1;backToBack=false;b2bChain=0;lastActionRotation=false;bestComboThisGame=0;tetrisesThisGame=0;perfectClearsThisGame=0; gameEnded = false; paused = false; running = false; canHold = true;
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
function endGame(won, reason, suppressNetwork=false) {
  if (gameEnded) return; gameEnded = true; running = false; clearLockDelay(); stopAllHeld(); cancelAnimationFrame(raf); clearInterval(aiTimer); aiTimer=null; ui.localBadge.textContent = won ? 'WIN' : 'KO';
  if (!won && roomMode === 'online'&&!suppressNetwork){if(partyState)reportPartyKO();else send({type:'gameover'});}
  showResult(won, reason);
  if(session&&(roomMode==='online'||roomMode==='ai'))recordGameProgress(won);
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
  ui.resultScore.textContent = score.toLocaleString(); ui.resultLines.textContent = lines; ui.resultRating.textContent=roomMode==='online'&&matchmakingMode==='ranked'?'結算中…':'—'; ui.resultSettlement.textContent=roomMode==='ai'?`AI：${aiScore.toLocaleString()} 分 · ${aiLines} 行`:partyState?'好友房間採最後存活者獲勝。':'';ui.againBtn.textContent=partyState?'結束並回大廳':'再來一場'; ui.resultModal.classList.remove('hidden');
}

function showSection(section) { ['auth','lobby','waiting','partyRoom','arena'].forEach(k=>ui[k].classList.toggle('hidden', k!==section)); }
function ensureSingleOpponent(){
  if(ui.opponentGrid.querySelector('#rivalCanvas'))return;
  ui.opponentGrid.classList.remove('multi');ui.opponentGrid.dataset.players='';ui.opponentGrid.innerHTML='<article class="player-zone rival-zone" data-opponent-slot="0"><div class="player-head"><span id="rivalAvatar" class="player-avatar rival-avatar">?</span><div><small>PLAYER 02</small><strong id="rivalName">等待中</strong></div><span id="rivalBadge" class="badge muted">OFFLINE</span></div><div class="rival-wrap"><div class="board-frame rival-frame"><canvas id="rivalCanvas" width="300" height="600" aria-label="對手的遊戲盤面"></canvas></div><div class="rival-stats"><span>SCORE <b id="rivalScore">0</b></span><span>LINES <b id="rivalLines">0</b></span></div></div></article>';
  ['rivalAvatar','rivalName','rivalBadge','rivalCanvas','rivalScore','rivalLines'].forEach(id=>ui[id]=$(id));rivalCtx=ui.rivalCanvas.getContext('2d');
}
function startPractice() { disconnect(false);ensureSingleOpponent(); roomMode='practice'; ui.matchMode.textContent='單人練習'; ui.matchRoom.textContent=''; ui.rivalName.textContent='你的紀錄'; ui.rivalBadge.textContent='SOLO'; ui.rivalBadge.classList.add('muted'); showSection('arena'); countdownAndStart(); }
function startAiBattle() {
  disconnect(false);ensureSingleOpponent(); roomMode='ai'; aiDifficulty=ui.aiDifficulty?.value||'normal'; aiBoard=emptyBoard(); aiQueue=[]; aiTicks=0; aiScore=0; aiLines=0;
  ui.matchMode.textContent=`單人模式 · ${AI_LEVELS[aiDifficulty].name}`; ui.matchRoom.textContent='SOLO BATTLE'; ui.rivalName.textContent=`${AI_LEVELS[aiDifficulty].name} AI`; ui.rivalAvatar.textContent='🤖'; ui.rivalBadge.textContent=aiDifficulty.toUpperCase(); ui.rivalBadge.classList.remove('muted'); ui.rivalScore.textContent='0'; ui.rivalLines.textContent='0';
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
  peer.on('connection', conn=>{ if(partyState||currentRoomId&&!matchmaking)setupPartyConnection(conn);else{if(connection?.open){conn.close();return;}setupConnection(conn);} });
  peer.on('error', handlePeerError);
}
async function callRpc(name, params={}) {
  const {data,error}=await db.rpc(name,params); if(error)throw error; return data;
}
function showWaiting(type, code='') {
  matchmaking=type==='match';
  if(matchmaking){showSection('lobby');ui.matchmakingToastTitle.textContent=matchmakingMode==='ranked'?'正在尋找牌位對手':'正在尋找對手';ui.matchmakingToastText.textContent=matchmakingMode==='ranked'?`目前 ${rankFor(playerProfile.rating).name} · 優先搜尋相近 RP`:'系統正在搜尋線上玩家…';ui.matchmakingToast.classList.remove('hidden');return;}
  ui.waitingTitle.textContent='等待對手加入';ui.waitingText.textContent='把這組代碼傳給朋友';ui.copyCode.classList.remove('hidden');ui.roomCode.textContent=code||'------';showSection('waiting');
}
function beginPolling() {
  clearInterval(matchPoll); matchPoll=setInterval(async()=>{
    try { const room=await callRpc('get_match_status'); if(room?.state==='matched') handleMatchedRoom(room); }
    catch(error){ console.warn('Match status unavailable',error.message); }
  },1400);
}
async function hostRoom() {
  if(!requireLogin())return; setLobbyMessage('正在建立私人房間…');
  preparePeer(async peerId=>{ try { const room=await callRpc('create_party_room',{p_peer_id:peerId}); isHost=true;matchmaking=false;gameEnded=false; currentRoomId=room.room_id; activeRoom=room.code; partyState=room;showPartyRoom();setNetwork('好友房間已建立');beginPartyPolling(); } catch(error){ onlineError(error); } });
}
async function findOpponent(mode='normal') {
  if(!requireLogin())return; setLobbyMessage('正在加入配對佇列…');
  matchmakingMode=mode;
  preparePeer(async peerId=>{ try { const room=await callRpc('find_match_mode',{p_peer_id:peerId,p_mode:mode}); showWaiting('match'); setNetwork(mode==='ranked'?'正在搜尋牌位對手':'正在搜尋玩家'); if(room?.state==='matched') handleMatchedRoom(room); else beginPolling(); } catch(error){ onlineError(error); } });
}
async function joinRoom() {
  if(!requireLogin())return; const code=ui.roomInput.value.trim().toUpperCase(); if(code.length!==6){setLobbyMessage('請輸入 6 位房間碼。');return;}
  setLobbyMessage('正在加入私人房間…');
  preparePeer(async peerId=>{ try { const room=await callRpc('join_party_room',{p_code:code,p_peer_id:peerId});isHost=false;matchmaking=false;gameEnded=false;currentRoomId=room.room_id;activeRoom=room.code;partyState=room;showPartyRoom();setupPartyConnection(peer.connect(room.host_peer_id,{reliable:true,metadata:{userId:session.user.id}}));setNetwork('已加入好友房間');beginPartyPolling(); } catch(error){ onlineError(error); } });
}
function handleMatchedRoom(room) {
  if(currentRoomId===room.room_id && (connection?.open || roomMode==='online'))return;
  clearInterval(matchPoll); currentRoomId=room.room_id; activeRoom=room.code; isHost=room.host_id===session.user.id; matchmaking=!room.is_private; matchmakingMode=room.is_private?'normal':(room.match_mode||matchmakingMode||'normal');
  if(room.opponent_name) ui.rivalName.textContent=room.opponent_name;
  setNetwork('找到對手，正在連線');
  if(matchmaking){ui.matchmakingToastTitle.textContent='找到對手';ui.matchmakingToastText.textContent='正在建立即時連線…';ui.matchmakingToast.classList.remove('hidden');}
  if(!isHost && !connection) setupConnection(peer.connect(room.host_peer_id,{reliable:true}));
  else if(isHost&&!matchmaking) { showWaiting('private',activeRoom); ui.waitingTitle.textContent='找到對手'; ui.waitingText.textContent='正在建立即時連線…'; }
}
function onlineError(error) {
  console.error(error); setLobbyMessage(error.message||'線上服務暫時無法使用。'); setNetwork('線上服務錯誤',false); disconnect(false); showSection('lobby');
}
function setupConnection(conn) {
  connection=conn;
  conn.on('open',()=>{ peerReady=true;ui.matchmakingToast.classList.add('hidden'); setNetwork('對手已連線'); beginOnlineMatch(); send({type:'hello',username:playerName,avatar:playerProfile.avatar,theme:playerProfile.block_theme,background:playerProfile.battle_background,wins:playerProfile.wins,losses:playerProfile.losses,rating:playerProfile.rating}); });
  conn.on('data',handleData);
  conn.on('close',()=>{ peerReady=false; setNetwork('對手已離線',false); if(running) endGame(true,'對手離開了房間。'); });
  conn.on('error',()=>toast('連線發生問題'));
}
function partyHello(){return {type:'party-hello',userId:session.user.id,username:playerName,avatar:playerProfile.avatar,theme:playerProfile.block_theme,background:playerProfile.battle_background,rating:playerProfile.rating};}
function setupPartyConnection(conn){
  const tempKey=conn.metadata?.userId||conn.peer;connections.set(tempKey,conn);
  if(!connection&&!isHost)connection=conn;
  conn.on('open',()=>{peerReady=true;conn.send(partyHello());if(isHost)conn.send({type:'party-sync',party:partyState,chat:roomChat});});
  conn.on('data',data=>handlePartyData(data,conn));
  conn.on('close',()=>{for(const [id,item] of connections)if(item===conn){connections.delete(id);opponents.delete(id);}renderOpponentBoards();if(running&&isHost)checkPartyWinner();});
  conn.on('error',()=>toast('有玩家連線發生問題'));
}
function broadcastParty(data,except=null){connections.forEach(conn=>{if(conn!==except&&conn.open)conn.send(data);});}
function connectionFor(userId){return connections.get(userId)||[...connections.values()].find(conn=>conn.memberId===userId);}
function handlePartyData(data,conn){
  if(!data?.type)return;
  if(data.type==='party-hello'){
    conn.memberId=data.userId;connections.delete(conn.peer);connections.set(data.userId,conn);opponents.set(data.userId,{...data,board:emptyBoard(),score:0,lines:0,alive:true});renderOpponentBoards();
    if(isHost){conn.send({type:'party-sync',party:partyState,chat:roomChat});broadcastParty({type:'party-player',player:data},conn);}
  }
  if(data.type==='party-sync'){partyState=data.party||partyState;roomChat=data.chat||roomChat;renderPartyRoom();renderRoomChat();}
  if(data.type==='party-player'&&data.player?.userId){opponents.set(data.player.userId,{...data.player,board:emptyBoard(),score:0,lines:0,alive:true});renderOpponentBoards();}
  if(data.type==='state'){
    const id=data.userId||conn.memberId;if(id&&id!==session.user.id){opponents.set(id,{...(opponents.get(id)||{}),...data,alive:!eliminatedPlayers.has(id)});renderOpponentBoards();if(isHost)broadcastParty({...data,userId:id},conn);}
  }
  if(data.type==='attack'){if(isHost)routePartyAttack(data.from||conn.memberId,data.lines||0);}
  if(data.type==='attack-target')receiveAttack(data.lines||0);
  if(data.type==='party-chat'){if(isHost){appendRoomChat(data);broadcastParty(data);}else appendRoomChat(data);}
  if(data.type==='reaction'){if(isHost)broadcastParty(data);showReaction(data);}
  if(data.type==='party-start'){partyState=data.party||partyState;startPartyMatch();}
  if(data.type==='party-ko'){if(isHost){eliminatedPlayers.add(data.userId);broadcastParty(data);checkPartyWinner();}else{eliminatedPlayers.add(data.userId);markOpponentEliminated(data.userId);}}
  if(data.type==='party-winner'){if(data.userId===session.user.id&&!gameEnded)endGame(true,'你是最後存活的玩家！',true);else if(!gameEnded)endGame(false,`${data.username||'對手'} 成為最後存活者。`,true);}
}
function choosePartyTarget(from){
  const candidates=(partyState?.members||[]).map(m=>m.id).filter(id=>id!==from&&!eliminatedPlayers.has(id));if(!candidates.length)return null;
  if(partyState?.settings?.target_mode==='rotate')return candidates[targetCursor++%candidates.length];
  return candidates[Math.floor(Math.random()*candidates.length)];
}
function routePartyAttack(from,amount){const target=choosePartyTarget(from);if(!target||!amount)return;if(target===session.user.id)receiveAttack(amount);else connectionFor(target)?.send({type:'attack-target',lines:amount,from});}
function checkPartyWinner(){const alive=(partyState?.members||[]).filter(m=>!eliminatedPlayers.has(m.id));if(alive.length===1){const winner=alive[0];broadcastParty({type:'party-winner',userId:winner.id,username:winner.username});if(winner.id===session.user.id&&!gameEnded)endGame(true,'你是最後存活的玩家！',true);}}
function reportPartyKO(){if(eliminatedPlayers.has(session?.user?.id))return;eliminatedPlayers.add(session.user.id);if(isHost){broadcastParty({type:'party-ko',userId:session.user.id});checkPartyWinner();}else connection?.send({type:'party-ko',userId:session.user.id});}
function markOpponentEliminated(userId){const item=opponents.get(userId);if(item)item.alive=false;renderOpponentBoards();}
function renderOpponentBoards(){
  if(roomMode!=='online'||!partyState)return;
  const players=(partyState.members||[]).filter(m=>m.id!==session.user.id).slice(0,3),signature=players.map(member=>member.id).join('|');ui.opponentGrid.classList.toggle('multi',players.length>1);
  if(ui.opponentGrid.dataset.players!==signature){ui.opponentGrid.dataset.players=signature;ui.opponentGrid.innerHTML=players.map((member,index)=>`<article class="player-zone rival-zone" data-player-id="${member.id}"><div class="player-head"><span class="player-avatar rival-avatar">${escapeHtml(member.avatar||'?')}</span><div><small>PLAYER ${String(index+2).padStart(2,'0')}</small><strong>${escapeHtml(member.username)}</strong></div><span class="badge" data-role="status">LIVE</span></div><div class="rival-wrap"><div class="board-frame rival-frame"><canvas width="300" height="600" aria-label="${escapeHtml(member.username)} 的盤面"></canvas></div><div class="rival-stats"><span>SCORE <b data-role="score">0</b></span><span>LINES <b data-role="lines">0</b></span></div></div></article>`).join('');}
  players.forEach(member=>{const card=ui.opponentGrid.querySelector(`[data-player-id="${member.id}"]`),state=opponents.get(member.id),out=eliminatedPlayers.has(member.id);if(!card)return;card.classList.toggle('eliminated',out);card.querySelector('[data-role="status"]').textContent=out?'KO':'LIVE';card.querySelector('[data-role="score"]').textContent=Number(state?.score||0).toLocaleString();card.querySelector('[data-role="lines"]').textContent=state?.lines||0;const canvas=card.querySelector('canvas');drawGrid(canvas.getContext('2d'),state?.board||emptyBoard(),300,600,state?.theme||'neon',state?.background||'void');});
}
function beginOnlineMatch() {
  ensureSingleOpponent();roomMode='online'; ui.matchMode.textContent=matchmaking?(matchmakingMode==='ranked'?'牌位競技':'一般配對'):'私人對戰'; ui.matchRoom.textContent=`ROOM ${activeRoom}`; if(ui.rivalName.textContent==='等待中')ui.rivalName.textContent='對手'; ui.rivalBadge.textContent=matchmakingMode==='ranked'?'RANKED':'ONLINE'; ui.rivalBadge.classList.remove('muted'); showSection('arena'); countdownAndStart();
}
function handleData(data) {
  if(!data || !data.type)return;
  if(data.type==='hello' && data.username){ ui.rivalName.textContent=data.username; ui.rivalAvatar.textContent=data.avatar||'?'; rivalTheme=data.theme||'neon';rivalBackground=data.background||'void'; ui.rivalBadge.textContent=matchmakingMode==='ranked'?rankFor(data.rating).name:`${winrate(data.wins,data.losses)}% WIN`; drawRival(); }
  if(data.type==='state'){ drawRival(data.board); ui.rivalScore.textContent=(data.score||0).toLocaleString(); ui.rivalLines.textContent=data.lines||0; }
  if(data.type==='attack') receiveAttack(data.lines||0);
  if(data.type==='gameover') endGame(true,'對手已經到達極限。');
  if(data.type==='rematch'){ remoteReady=true; if(rematchRequested || isHost){ rematchRequested=false; remoteReady=false; send({type:'start'}); countdownAndStart(); } else toast('對手想再來一場'); }
  if(data.type==='start'){ rematchRequested=false; remoteReady=false; countdownAndStart(); }
}
function send(data){if(partyState&&roomMode==='online'){if(isHost){if(data.type==='attack')routePartyAttack(data.from||session.user.id,data.lines||0);else broadcastParty(data);}else if(connection?.open)connection.send(data);return;}if(connection?.open) connection.send(data);}
function sendState(force=false){ const now=performance.now(); if(!force && now-lastStateSent<170)return; lastStateSent=now;const data={type:'state',userId:session?.user?.id,board:liveBoard(),score,lines,theme:playerProfile.block_theme,background:playerProfile.battle_background};if(partyState&&roomMode==='online'){if(isHost)broadcastParty(data);else send(data);}else send(data); }
function showPartyRoom(){showSection('partyRoom');ui.partyCode.textContent=activeRoom;renderPartyRoom();}
function renderPartyRoom(){
  if(!partyState)return;const members=partyState.members||[],hostId=partyState.host_id,settings=partyState.settings||{};ui.partyCount.textContent=`${members.length} / ${partyState.max_players||4}`;ui.partyCode.textContent=partyState.code||activeRoom;
  ui.partyMaxPlayers.value=String(partyState.max_players||4);ui.partyTargetMode.value=settings.target_mode||'random';ui.partyGarbageDelay.value=String(settings.garbage_delay||1200);
  [ui.partyMaxPlayers,ui.partyTargetMode,ui.partyGarbageDelay].forEach(control=>control.disabled=!isHost);ui.partyHostNote.textContent=isHost?'你是房主，可調整每位玩家':'等待房主設定';
  ui.partyMembers.innerHTML=members.map(member=>{const host=member.id===hostId,self=member.id===session.user.id,disabled=!isHost;return `<div class="party-member" data-member-id="${member.id}"><span class="member-avatar">${escapeHtml(member.avatar||'⚡')}</span><div><strong>${escapeHtml(member.username)}${host?' · 房主':''}${self?'（你）':''}</strong><small>${rankFor(member.rating).name} · ${member.rating||1000} RP</small></div><span class="ready-state ${member.ready?'ready':''}">${member.ready?'已準備':'未準備'}</span><label class="handicap-control">鎖定列 <select data-handicap-id="${member.id}" ${disabled?'disabled':''}>${Array.from({length:7},(_,i)=>`<option value="${i}" ${Number(member.handicap_rows||0)===i?'selected':''}>${i}</option>`).join('')}</select></label></div>`;}).join('');
  renderPartyInviteList();
  const self=members.find(member=>member.id===session.user.id);partyReady=Boolean(self?.ready);ui.partyReadyBtn.classList.toggle('hidden',isHost);ui.partyReadyBtn.textContent=partyReady?'取消準備':'我已準備';ui.partyStartBtn.classList.toggle('hidden',!isHost);ui.partyStartBtn.disabled=members.length<2||members.some(member=>!member.ready);ui.partyStatus.textContent=members.length<2?'至少還需要一位玩家。':members.some(member=>!member.ready)?'等待所有玩家準備。':'所有玩家已準備，可以開始遊戲。';
}
async function refreshPartyRoom(){if(!currentRoomId||!partyState)return;try{const next=await callRpc('get_party_room',{p_room_id:currentRoomId});partyState=next;renderPartyRoom();if(next.state==='playing'&&!running&&!gameEnded)startPartyMatch();}catch(error){console.warn('Party room unavailable',error.message);}}
function beginPartyPolling(){clearInterval(partyPoll);partyPoll=setInterval(refreshPartyRoom,1300);}
async function savePartySettings(){
  if(!isHost||!partyState)return;const members=partyState.members||[],handicaps={};
  members.forEach(member=>{const select=ui.partyMembers.querySelector(`[data-handicap-id="${member.id}"]`);handicaps[member.id]=Number(select?.value??member.handicap_rows??0);});
  try{partyState=await callRpc('update_party_settings',{p_room_id:currentRoomId,p_max_players:Number(ui.partyMaxPlayers.value),p_settings:{balance:false,target_mode:ui.partyTargetMode.value,garbage_delay:Number(ui.partyGarbageDelay.value)},p_handicaps:handicaps});renderPartyRoom();broadcastParty({type:'party-sync',party:partyState,chat:roomChat});}catch(error){toast(error.message||'無法更新房間設定');}
}
async function togglePartyReady(){try{partyState=await callRpc('set_party_ready',{p_room_id:currentRoomId,p_ready:!partyReady});renderPartyRoom();}catch(error){toast(error.message||'無法更新準備狀態');}}
async function startPartyRoom(){try{await savePartySettings();partyState=await callRpc('start_party_room',{p_room_id:currentRoomId});clearInterval(partyPoll);broadcastParty({type:'party-start',party:partyState});startPartyMatch();}catch(error){toast(error.message||'目前還不能開始');}}
function startPartyMatch(){if(running||ui.countdown&&!ui.countdown.classList.contains('hidden'))return;clearInterval(partyPoll);roomMode='online';matchmaking=false;lockedRows=Number((partyState?.members||[]).find(member=>member.id===session.user.id)?.handicap_rows||0);eliminatedPlayers.clear();opponents.clear();(partyState?.members||[]).filter(member=>member.id!==session.user.id).forEach(member=>opponents.set(member.id,{...member,userId:member.id,board:emptyBoard(),score:0,lines:0,theme:'neon',background:'void',alive:true}));ui.matchMode.textContent='好友多人對戰';ui.matchRoom.textContent=`ROOM ${activeRoom} · ${partyState.members.length}P`;showSection('arena');ui.battleSocial.classList.remove('hidden');renderOpponentBoards();countdownAndStart();}
async function leavePartyRoom(){backToLobby();}
function renderPartyInviteList(){
  if(!ui.partyInviteList)return;const memberIds=new Set((partyState?.members||[]).map(member=>member.id)),available=socialFriends.filter(friend=>!memberIds.has(friend.id));
  ui.partyInviteList.innerHTML=available.length?available.map(friend=>`<div class="party-invite-row"><span>${escapeHtml(friend.avatar||'⚡')}</span><div><b>${escapeHtml(friend.username)}</b><small>${friend.online?'● 線上':'離線也可收到邀請'}</small></div><button data-party-invite-id="${friend.id}" type="button">邀請</button></div>`).join(''):'<p class="empty-state">目前沒有可邀請的好友。</p>';
}
async function inviteFriendToCurrentRoom(friendId){
  if(!partyState||!activeRoom)return;const button=ui.partyInviteList.querySelector(`[data-party-invite-id="${friendId}"]`);if(button)button.disabled=true;
  try{await callRpc('send_battle_invite',{p_friend_id:friendId,p_room_code:activeRoom});toast('房間邀請已送出');if(button){button.textContent='已邀請';}}
  catch(error){toast(error.message||'無法送出邀請');if(button)button.disabled=false;}
}
function appendRoomChat(message){roomChat.push({username:message.username||'PLAYER',message:String(message.message||'').slice(0,120)});roomChat=roomChat.slice(-40);renderRoomChat();if(roomMode==='online')showBattleBubble(`${message.username}: ${message.message}`);}
function renderRoomChat(){ui.roomChatMessages.innerHTML=roomChat.length?roomChat.map(item=>`<div class="chat-message"><b>${escapeHtml(item.username)}</b><span>${escapeHtml(item.message)}</span></div>`).join(''):'<p class="empty-state">房間內還沒有訊息。</p>';ui.roomChatMessages.scrollTop=ui.roomChatMessages.scrollHeight;}
function sendRoomChat(event){event.preventDefault();const message=ui.roomChatInput.value.trim();if(!message)return;const data={type:'party-chat',username:playerName,message};ui.roomChatInput.value='';if(isHost){appendRoomChat(data);broadcastParty(data);}else connection?.send(data);}
function showBattleBubble(text){const item=document.createElement('div');item.className='battle-bubble';item.textContent=text;ui.battleChatFeed.append(item);setTimeout(()=>item.remove(),4200);}
function sendReaction(reaction){const data={type:'reaction',reaction,username:playerName};if(isHost){showReaction(data);broadcastParty(data);}else connection?.send(data);}
function showReaction(data){const item=document.createElement('div');item.className='floating-reaction';item.textContent=data.reaction;document.body.append(item);showBattleBubble(`${data.username}：${data.reaction}`);setTimeout(()=>item.remove(),1900);}
function hideLobbyChatNotice(){clearTimeout(lobbyChatNoticeTimer);ui.lobbyChatToast.classList.add('hidden');}
function showLobbyChatNotice(message){if(!ui.lobby||ui.lobby.classList.contains('hidden')||!ui.chatPanel.classList.contains('hidden'))return;ui.lobbyChatToastAvatar.textContent=message.avatar||'💬';ui.lobbyChatToastName.textContent=message.username||'PLAYER';ui.lobbyChatToastMessage.textContent=message.message||'';ui.lobbyChatToast.classList.remove('hidden');clearTimeout(lobbyChatNoticeTimer);lobbyChatNoticeTimer=setTimeout(hideLobbyChatNotice,4800);}
async function refreshLobbyChat(){if(!db||!session)return;try{const messages=await callRpc('get_lobby_messages'),newestId=Math.max(0,...messages.map(item=>Number(item.id)||0));if(lobbyChatInitialized){const incoming=messages.filter(item=>(Number(item.id)||0)>lastLobbyMessageId&&item.user_id!==session.user.id);if(incoming.length)showLobbyChatNotice(incoming[incoming.length-1]);}else lobbyChatInitialized=true;lastLobbyMessageId=Math.max(lastLobbyMessageId,newestId);ui.lobbyChatMessages.innerHTML=messages.length?messages.map(item=>`<div class="chat-message"><b>${escapeHtml(item.username)}</b><span>${escapeHtml(item.message)}</span></div>`).join(''):'<p class="empty-state">還沒有訊息，來打聲招呼吧。</p>';ui.lobbyChatMessages.scrollTop=ui.lobbyChatMessages.scrollHeight;}catch(error){console.warn('Lobby chat unavailable',error.message);}}
async function sendLobbyChat(event){event.preventDefault();const message=ui.lobbyChatInput.value.trim();if(!message)return;ui.lobbyChatInput.value='';try{await callRpc('send_lobby_message',{p_message:message});await refreshLobbyChat();}catch(error){toast(error.message||'訊息傳送失敗');}}
function handlePeerError(error){ const known={'unavailable-id':'這個房間碼已被使用，請重新建立。','peer-unavailable':'找不到房間，請確認代碼是否正確。',network:'連線服務暫時無法使用。'}; setLobbyMessage(known[error.type]||'無法建立連線，請稍後再試。'); setNetwork('連線失敗',false); showSection('lobby'); }
function disconnect(notifyBackend=true){ clearLockDelay(true);stopAllHeld();clearInterval(matchPoll);clearInterval(partyPoll); clearInterval(aiTimer); matchPoll=null;partyPoll=null; aiTimer=null;ui.matchmakingToast.classList.add('hidden');ui.battleSocial.classList.add('hidden');if(notifyBackend&&db&&session&&currentRoomId){const rpc=partyState?'leave_party_room':'leave_online';callRpc(rpc,{p_room_id:currentRoomId}).catch(()=>{});}connections.forEach(conn=>conn.close());connections.clear();if(connection){connection.close();connection=null;} if(peer){peer.destroy();peer=null;} peerReady=false; activeRoom=''; currentRoomId=null;matchmaking=false;partyState=null;opponents.clear();eliminatedPlayers.clear();roomChat=[];lockedRows=0; cancelAnimationFrame(raf); running=false; }
function cancelMatchmaking(){disconnect();showSection('lobby');switchLobbyView('home');setLobbyMessage('已停止配對。');setNetwork('玩家大廳已連線');}
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
  document.documentElement.dataset.blockTheme=p.block_theme;document.documentElement.dataset.battleBackground=p.battle_background||'void'; draw(); drawSidePanels();drawRival();
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
  ui.viewPlayerExtra.textContent=`方塊造型 ${(THEMES[p.block_theme]||THEMES.neon).name} · 背板 ${(BACKGROUNDS[p.battle_background]||BACKGROUNDS.void).name}`;
  const self=p.username===playerName,friend=socialFriendNames.has(p.username.toLocaleLowerCase());ui.addPlayerFriendBtn.classList.toggle('hidden',self);ui.addPlayerFriendBtn.disabled=friend;ui.addPlayerFriendBtn.textContent=friend?'已是好友':'加入好友';ui.playerModal.classList.remove('hidden');
}
async function addViewedPlayerFriend() {
  if(!viewedPlayer)return;ui.addPlayerFriendBtn.disabled=true;
  try{await callRpc('send_friend_request',{p_username:viewedPlayer.username});ui.addPlayerFriendBtn.textContent='邀請已送出';toast(`已向 ${viewedPlayer.username} 送出好友邀請`);await refreshSocial();}
  catch(error){ui.addPlayerFriendBtn.disabled=false;toast(error.message||'無法送出好友邀請');}
}
function switchLobbyView(view) {
  ui.lobbyHome.classList.toggle('hidden',view!=='home'); ui.leaderboardPanel.classList.toggle('hidden',view!=='leaderboard'); ui.friendsPanel.classList.toggle('hidden',view!=='friends');ui.shopPanel.classList.toggle('hidden',view!=='shop');ui.tasksPanel.classList.toggle('hidden',view!=='tasks');ui.chatPanel.classList.toggle('hidden',view!=='chat');
  document.querySelectorAll('[data-lobby-view]').forEach(button=>button.classList.toggle('active',button.dataset.lobbyView===view));
  if(view==='leaderboard')refreshLeaderboards();if(view==='shop')refreshShop();if(view==='tasks')refreshProgression();if(view==='chat'){hideLobbyChatNotice();refreshLobbyChat();}if(view==='profile')openProfileSettings();
}
function renderEconomy(){
  ui.coinBalance.textContent=Number(shopState.coins||0).toLocaleString();ui.gemBalance.textContent=Number(shopState.gems||0).toLocaleString();ui.shopCoinBalance.textContent=Number(shopState.coins||0).toLocaleString();ui.shopGemBalance.textContent=Number(shopState.gems||0).toLocaleString();
  ownedThemes=new Set([...(shopState.owned||[]),'neon','arcade']);ownedBackgrounds=new Set([...(shopState.ownedBackgrounds||[]),'void']);renderCosmeticSelects();renderShop();renderTasks();
}
function renderCosmeticSelects(){
  const selected=playerProfile.block_theme||'neon';ui.themeSelect.innerHTML=[...ownedThemes].filter(id=>THEMES[id]).map(id=>`<option value="${id}">${escapeHtml(THEMES[id].name)}</option>`).join('');ui.themeSelect.value=ownedThemes.has(selected)?selected:'neon';
  const background=playerProfile.battle_background||'void';ui.backgroundSelect.innerHTML=[...ownedBackgrounds].filter(id=>BACKGROUNDS[id]).map(id=>`<option value="${id}">${escapeHtml(BACKGROUNDS[id].name)}</option>`).join('');ui.backgroundSelect.value=ownedBackgrounds.has(background)?background:'void';
}
function themeSwatches(theme){return ['I','J','L','O','S','T','Z'].map(key=>`<i style="--swatch:${theme[key]}"></i>`).join('');}
function backgroundPreview(background){return `<div class="background-preview bg-${background.pattern}" style="--bg-a:${background.colors[0]};--bg-b:${background.colors[1]}"><i></i><i></i><i></i></div>`;}
function renderShop(){
  const catalog=shopCategory==='block'?THEMES:BACKGROUNDS,ownedSet=shopCategory==='block'?ownedThemes:ownedBackgrounds,equippedId=shopCategory==='block'?playerProfile.block_theme:playerProfile.battle_background;
  ui.shopGrid.innerHTML=Object.entries(catalog).map(([id,item])=>{const owned=ownedSet.has(id),equipped=equippedId===id,preview=shopCategory==='block'?`<div class="theme-swatch pattern-${item.pattern}">${themeSwatches(item)}</div>`:backgroundPreview(item);return `<article class="shop-item ${equipped?'equipped':''}">${preview}<small>${escapeHtml(item.rarity)}</small><h3>${escapeHtml(item.name)}</h3><p>${owned?'已永久擁有':shopCategory==='block'?'帶有專屬紋理與光影':'套用到你的遊戲盤面'}</p><button data-cosmetic-id="${id}" data-cosmetic-kind="${shopCategory}" data-shop-action="${owned?'equip':'buy'}" ${equipped?'disabled':''}>${equipped?'使用中':owned?'套用造型':`● ${item.price.toLocaleString()}`}</button></article>`;}).join('');
}
async function refreshShop(){
  if(!db||!session){renderEconomy();return;}try{const state=await callRpc('get_shop_state');shopState={...shopState,...state};renderEconomy();}catch(error){console.warn('Shop unavailable',error.message);renderEconomy();}
}
async function buyTheme(id){
  const theme=THEMES[id];if(!theme||ownedThemes.has(id))return;try{const state=await callRpc('buy_theme',{p_theme_id:id});shopState={...shopState,...state};renderEconomy();toast(`${theme.name} 已加入收藏`);}catch(error){toast(error.message||'無法購買造型');}
}
async function buyBackground(id){
  const background=BACKGROUNDS[id];if(!background||ownedBackgrounds.has(id))return;try{const state=await callRpc('buy_background',{p_background_id:id});shopState={...shopState,...state};renderEconomy();toast(`${background.name} 已加入收藏`);}catch(error){toast(error.message||'無法購買背板');}
}
async function equipTheme(id){
  if(!ownedThemes.has(id))return;try{const next=await callRpc('save_profile',{p_avatar:playerProfile.avatar,p_block_theme:id,p_battle_background:playerProfile.battle_background||'void'});playerProfile={...playerProfile,...next};renderProfile();renderEconomy();toast(`已套用 ${THEMES[id].name}`);await refreshSocial();}catch(error){toast(error.message||'無法套用造型');}
}
async function equipBackground(id){
  if(!ownedBackgrounds.has(id))return;try{const next=await callRpc('save_profile',{p_avatar:playerProfile.avatar,p_block_theme:playerProfile.block_theme,p_battle_background:id});playerProfile={...playerProfile,...next};renderProfile();renderEconomy();toast(`已套用 ${BACKGROUNDS[id].name}`);await refreshSocial();}catch(error){toast(error.message||'無法套用背板');}
}
function taskProgress(task){return Math.max(0,Number(progressionState.progress?.[task.metric]||0));}
function taskClaimed(task){return (progressionState.claims||[]).includes(task.id);}
function taskUnlocked(task){return task.category!=='main'||!task.previous||taskClaimed(TASKS.find(item=>item.id===task.previous)||{});}
function rewardLabel(task){return [task.coins?`● ${task.coins}`:'',task.gems?`◆ ${task.gems}`:''].filter(Boolean).join('　');}
function renderTasks(){
  if(!ui.taskList)return;
  const daily=TASKS.filter(task=>task.category==='daily'),dailyDone=daily.filter(task=>taskClaimed(task)).length,claimable=TASKS.filter(task=>taskUnlocked(task)&&!taskClaimed(task)&&taskProgress(task)>=task.target).length;
  ui.dailyMission.classList.toggle('completed',dailyDone===daily.length);ui.dailyMissionTitle.textContent=dailyDone===daily.length?'今日任務全部完成':`今日還有 ${daily.length-dailyDone} 項任務`;ui.dailyMissionProgress.textContent=claimable?`${claimable} 項獎勵可領取 →`:'查看任務中心 →';
  ui.claimAllTasksBtn.disabled=claimable===0;
  ui.taskSummary.innerHTML=`<span><small>可領取</small><strong>${claimable}</strong></span><span><small>生涯分數</small><strong>${Number(progressionState.progress?.total_score||0).toLocaleString()}</strong></span><span><small>最高連擊</small><strong>${Number(progressionState.progress?.best_combo||0)}</strong></span>`;
  const tasks=TASKS.filter(task=>task.category===taskCategory);
  ui.taskList.innerHTML=tasks.map((task,index)=>{const progress=taskProgress(task),claimed=taskClaimed(task),unlocked=taskUnlocked(task),complete=unlocked&&progress>=task.target,percent=unlocked?Math.min(100,progress/task.target*100):0,label=task.category==='main'?`主線 ${String(index+1).padStart(2,'0')}`:task.category==='daily'?'每日任務':'成就';return `<article class="task-card ${!unlocked?'locked':claimed?'claimed':complete?'complete':''}"><span class="task-icon">${!unlocked?'🔒':task.category==='achievement'?'★':task.category==='main'?'◆':'✓'}</span><div class="task-copy"><small>${label}</small><h3>${escapeHtml(task.title)}</h3><p>${unlocked?escapeHtml(task.desc):'完成並領取上一章獎勵後解鎖'}</p><div class="task-progress"><i style="width:${percent}%"></i></div><b>${unlocked?`${Math.min(progress,task.target).toLocaleString()} / ${task.target.toLocaleString()}`:'尚未解鎖'}</b></div><div class="task-reward"><span>${rewardLabel(task)}</span><button data-claim-task="${task.id}" ${!complete||claimed?'disabled':''}>${!unlocked?'未解鎖':claimed?'已領取':complete?'領取':'進行中'}</button></div></article>`;}).join('');
}
async function refreshProgression(){
  if(!db||!session){renderTasks();return;}try{progressionState=await callRpc('get_progression_state');if(progressionState.wallet)shopState={...shopState,...progressionState.wallet};renderEconomy();}catch(error){console.warn('Progression unavailable',error.message);renderTasks();}
}
async function recordGameProgress(won){
  if(!db||!session)return;try{progressionState=await callRpc('record_game_progress',{p_score:score,p_lines:lines,p_best_combo:bestComboThisGame,p_tetrises:tetrisesThisGame,p_perfect_clears:perfectClearsThisGame,p_won:Boolean(won),p_mode:roomMode});renderTasks();}catch(error){console.warn('Game progress unavailable',error.message);}
}
async function claimTask(id){
  const task=TASKS.find(item=>item.id===id);if(!task)return;try{const result=await callRpc('claim_task',{p_task_id:id});progressionState=result.progression;shopState={...shopState,...result.shop};renderEconomy();toast(`獎勵已領取 · ${rewardLabel(task)}`);}catch(error){toast(error.message||'目前無法領取獎勵');}
}
async function claimAllTasks(){
  if(ui.claimAllTasksBtn.disabled)return;ui.claimAllTasksBtn.disabled=true;let claimed=0;
  try{while(true){const task=TASKS.find(item=>taskUnlocked(item)&&!taskClaimed(item)&&taskProgress(item)>=item.target);if(!task)break;const result=await callRpc('claim_task',{p_task_id:task.id});progressionState=result.progression;shopState={...shopState,...result.shop};claimed+=1;}renderEconomy();toast(claimed?`已一鍵領取 ${claimed} 項獎勵`:'目前沒有可領取的獎勵');}
  catch(error){renderEconomy();toast(claimed?`已領取 ${claimed} 項，其餘獎勵稍後再試`:error.message||'目前無法領取獎勵');}
}
function openProfileSettings() {
  selectedAvatar=playerProfile.avatar;renderCosmeticSelects();ui.themeSelect.value=ownedThemes.has(playerProfile.block_theme)?playerProfile.block_theme:'neon';ui.backgroundSelect.value=ownedBackgrounds.has(playerProfile.battle_background)?playerProfile.battle_background:'void';
  ui.avatarOptions.querySelectorAll('button').forEach(button=>button.classList.toggle('selected',button.dataset.avatar===selectedAvatar));
  ui.profileModal.classList.remove('hidden');
}
async function saveProfileSettings() {
  ui.saveProfileBtn.disabled=true;
  try { const next=await callRpc('save_profile',{p_avatar:selectedAvatar,p_block_theme:ui.themeSelect.value,p_battle_background:ui.backgroundSelect.value}); playerProfile={...playerProfile,...next}; renderProfile(); ui.profileModal.classList.add('hidden'); toast('個人設定已儲存'); await refreshSocial(); }
  catch(error){toast(error.message||'無法儲存設定');} finally {ui.saveProfileBtn.disabled=false;}
}
function renderSocial(state) {
  if(state.profile){ playerProfile={...playerProfile,...state.profile}; playerName=state.profile.username||playerName; ui.userName.textContent=playerName; renderProfile(); }
  const friends=state.friends||[], requests=state.requests||[];socialFriends=friends;
  socialFriendNames=new Set(friends.map(friend=>friend.username.toLocaleLowerCase()));
  ui.friendCount.textContent=`${friends.length} 位好友`;
  ui.friendNotice.classList.toggle('hidden',!requests.length&&!(state.invites||[]).length);
  ui.requestSection.classList.toggle('hidden',!requests.length);
  ui.incomingList.innerHTML=requests.map(item=>`<div class="player-row"><span class="row-avatar">${escapeHtml(item.avatar||'⚡')}</span><div><strong>${escapeHtml(item.username)}</strong><small>想加你為好友</small></div><div class="row-actions"><button data-action="accept-friend" data-id="${item.friendship_id}">接受</button><button class="danger" data-action="decline-friend" data-id="${item.friendship_id}">略過</button></div></div>`).join('');
  ui.friendsList.innerHTML=friends.length?friends.map(friend=>`<div class="player-row"><span class="row-avatar">${escapeHtml(friend.avatar||'⚡')}</span><div><strong>${escapeHtml(friend.username)}</strong><small class="${friend.online?'online-dot':''}">${friend.online?'● 線上 · ':''}${rankFor(friend.rating).name} · ${winrate(friend.wins,friend.losses)}% 勝率</small></div><div class="row-actions"><button data-action="invite-friend" data-id="${friend.id}">邀請對戰</button></div></div>`).join(''):'<p class="empty-state">還沒有好友，搜尋角色帳號加入。</p>';
  if(partyState)renderPartyInviteList();
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
  preparePeer(async peerId=>{ try { const room=await callRpc('create_party_room',{p_peer_id:peerId}); await callRpc('send_battle_invite',{p_friend_id:friendId,p_room_code:room.code}); isHost=true;matchmaking=false;gameEnded=false;currentRoomId=room.room_id;activeRoom=room.code;partyState=room;showPartyRoom();setNetwork('好友邀請已送出');beginPartyPolling(); } catch(error){onlineError(error);} });
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
  session=nextSession; clearInterval(socialPoll);clearInterval(lobbyChatPoll); socialPoll=null;lobbyChatPoll=null; if(!session){ui.userMenu.classList.add('hidden');ui.inviteBanner.classList.add('hidden');showSection('auth');return;}
  lobbyChatInitialized=false;lastLobbyMessageId=0;hideLobbyChatNotice();
  const {data}=await db.from('profiles').select('username,avatar,block_theme,battle_background,wins,losses,rating,ranked_wins,ranked_losses').eq('id',session.user.id).single(); playerName=data?.username||session.user.user_metadata?.username||'PLAYER'; playerProfile={...playerProfile,...data,id:session.user.id}; ui.userName.textContent=playerName; ui.userMenu.classList.remove('hidden'); ui.rivalName.textContent='等待中'; showSection('lobby'); switchLobbyView('home'); setNetwork('玩家大廳已連線'); renderProfile(); await Promise.all([refreshSocial(),refreshShop(),refreshProgression(),refreshLobbyChat()]); socialPoll=setInterval(refreshSocial,4000);lobbyChatPoll=setInterval(refreshLobbyChat,3500);
}
async function initOnlineServices() {
  const config=window.BLOCKSTORM_CONFIG||{}; if(!config.supabaseUrl||!config.supabaseAnonKey||!window.supabase){showSection('auth');ui.authMessage.textContent='尚未連接線上服務；目前仍可使用離線練習。';setNetwork('等待後端設定',false);return;}
  db=window.supabase.createClient(config.supabaseUrl,config.supabaseAnonKey); const {data}=await db.auth.getSession(); await applySession(data.session); db.auth.onAuthStateChange((_event,next)=>setTimeout(()=>applySession(next),0));
}

ui.hostBtn.addEventListener('click',hostRoom); ui.joinBtn.addEventListener('click',joinRoom); ui.matchBtn.addEventListener('click',()=>findOpponent('normal')); ui.rankedMatchBtn.addEventListener('click',()=>findOpponent('ranked')); ui.practiceBtn.addEventListener('click',startAiBattle); ui.guestPracticeBtn.addEventListener('click',startPractice);
ui.themeModeBtn.addEventListener('click',()=>setUiTheme(document.documentElement.dataset.uiTheme==='dark'?'light':'dark'));ui.cancelMatchBtn.addEventListener('click',cancelMatchmaking);
ui.partyCode.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(activeRoom);toast('房間碼已複製');}catch{toast(`房間碼：${activeRoom}`);}});ui.leavePartyBtn.addEventListener('click',leavePartyRoom);ui.partyReadyBtn.addEventListener('click',togglePartyReady);ui.partyStartBtn.addEventListener('click',startPartyRoom);[ui.partyMaxPlayers,ui.partyTargetMode,ui.partyGarbageDelay].forEach(control=>control.addEventListener('change',savePartySettings));ui.partyMembers.addEventListener('change',event=>{if(event.target.matches('[data-handicap-id]'))savePartySettings();});ui.roomChatForm.addEventListener('submit',sendRoomChat);ui.lobbyChatForm.addEventListener('submit',sendLobbyChat);ui.lobbyChatToast.addEventListener('click',()=>switchLobbyView('chat'));document.querySelector('.reaction-bar').addEventListener('click',event=>{const button=event.target.closest('[data-reaction]');if(button)sendReaction(button.dataset.reaction);});
ui.partyInviteToggleBtn.addEventListener('click',()=>{ui.partyInvitePanel.classList.toggle('hidden');renderPartyInviteList();});ui.partyInviteList.addEventListener('click',event=>{const button=event.target.closest('[data-party-invite-id]');if(button&&!button.disabled)inviteFriendToCurrentRoom(button.dataset.partyInviteId);});
ui.roomInput.addEventListener('input',e=>e.target.value=e.target.value.normalize('NFKC').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6)); ui.roomInput.addEventListener('keydown',e=>{if(e.key==='Enter')joinRoom();});
ui.copyCode.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(activeRoom);toast('房間碼已複製');}catch{toast(`房間碼：${activeRoom}`);}});
ui.cancelWait.addEventListener('click',backToLobby); ui.backBtn.addEventListener('click',backToLobby); ui.pauseBtn.addEventListener('click',togglePause); ui.lobbyBtn.addEventListener('click',backToLobby);
ui.againBtn.addEventListener('click',()=>{ ui.resultModal.classList.add('hidden');if(partyState){backToLobby();return;} if(roomMode==='practice'||roomMode==='ai')countdownAndStart(); else {rematchRequested=true;send({type:'rematch'});toast('等待對手準備…');} });
ui.loginTab.addEventListener('click',()=>selectAuthMode('login')); ui.signupTab.addEventListener('click',()=>selectAuthMode('signup')); ui.authForm.addEventListener('submit',submitAuth); ui.signOutBtn.addEventListener('click',async()=>{disconnect();await db?.auth.signOut();});
ui.settingsBtn.addEventListener('click',openProfileSettings); ui.profileEditBtn.addEventListener('click',openProfileSettings); ui.closeProfileBtn.addEventListener('click',()=>{ui.profileModal.classList.add('hidden');renderProfile();}); ui.saveProfileBtn.addEventListener('click',saveProfileSettings);
document.querySelectorAll('[data-open-shop]').forEach(button=>button.addEventListener('click',()=>switchLobbyView('shop')));
ui.shopGrid.addEventListener('click',event=>{const button=event.target.closest('button[data-cosmetic-id]');if(!button)return;const id=button.dataset.cosmeticId,kind=button.dataset.cosmeticKind,buy=button.dataset.shopAction==='buy';if(kind==='block')buy?buyTheme(id):equipTheme(id);else buy?buyBackground(id):equipBackground(id);});
ui.shopPanel.querySelector('.panel-tabs').addEventListener('click',event=>{const button=event.target.closest('[data-shop-category]');if(!button)return;shopCategory=button.dataset.shopCategory;ui.shopPanel.querySelectorAll('[data-shop-category]').forEach(item=>item.classList.toggle('active',item===button));renderShop();});
ui.taskTabs.addEventListener('click',event=>{const button=event.target.closest('[data-task-category]');if(!button)return;taskCategory=button.dataset.taskCategory;ui.taskTabs.querySelectorAll('button').forEach(item=>item.classList.toggle('active',item===button));renderTasks();});
ui.taskList.addEventListener('click',event=>{const button=event.target.closest('[data-claim-task]');if(button&&!button.disabled)claimTask(button.dataset.claimTask);});
ui.claimAllTasksBtn.addEventListener('click',claimAllTasks);
ui.dailyMission.addEventListener('click',()=>switchLobbyView('tasks'));
ui.avatarOptions.addEventListener('click',event=>{const button=event.target.closest('button[data-avatar]');if(!button)return;selectedAvatar=button.dataset.avatar;ui.settingsProfileAvatar.textContent=selectedAvatar;ui.avatarOptions.querySelectorAll('button').forEach(item=>item.classList.toggle('selected',item===button));});
ui.friendSearchBtn.addEventListener('click',sendFriendRequest); ui.friendSearchInput.addEventListener('keydown',event=>{if(event.key==='Enter')sendFriendRequest();});
ui.incomingList.addEventListener('click',event=>{const button=event.target.closest('button[data-action]');if(!button)return;respondFriend(button.dataset.id,button.dataset.action==='accept-friend');});
ui.friendsList.addEventListener('click',event=>{const button=event.target.closest('button[data-action="invite-friend"]');if(button)inviteFriend(button.dataset.id);});
ui.acceptInviteBtn.addEventListener('click',()=>respondBattleInvite(true)); ui.declineInviteBtn.addEventListener('click',()=>respondBattleInvite(false));
document.querySelector('.lobby-dock').addEventListener('click',event=>{const button=event.target.closest('[data-lobby-view]');if(button)switchLobbyView(button.dataset.lobbyView);});
ui.leaderboardPanel.querySelector('.panel-tabs').addEventListener('click',event=>{const button=event.target.closest('[data-rank-tab]');if(!button)return;ui.leaderboardPanel.querySelectorAll('[data-rank-tab]').forEach(item=>item.classList.toggle('active',item===button));ui.globalLeaderboard.classList.toggle('hidden',button.dataset.rankTab!=='global');ui.friendLeaderboard.classList.toggle('hidden',button.dataset.rankTab!=='friends');});
[ui.globalLeaderboard,ui.friendLeaderboard].forEach(list=>list.addEventListener('click',event=>{const row=event.target.closest('[data-player-id]');if(row)openPlayerProfile(row.dataset.playerId);}));
ui.closePlayerBtn.addEventListener('click',()=>ui.playerModal.classList.add('hidden'));ui.addPlayerFriendBtn.addEventListener('click',addViewedPlayerFriend);

const actions={left:()=>move(-1,0),right:()=>move(1,0),down:softDrop,rotate,drop:hardDrop,hold};
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
  if(e.repeat)return;const once={ArrowUp:rotate,KeyX:rotate,KeyZ:rotateCCW,Space:hardDrop,KeyC:hold,KeyP:togglePause};once[e.code]?.();
});
document.addEventListener('keyup',e=>{const ids={ArrowLeft:'key-left',ArrowRight:'key-right',ArrowDown:'key-down'};if(ids[e.code])stopHeld(ids[e.code]);});
window.addEventListener('blur',stopAllHeld);window.addEventListener('beforeunload',disconnect);

board=emptyBoard(); queue=[]; fillQueue(); current={type:'T',shape:cloneShape('T'),x:3,y:3}; draw(); drawRival(); drawSidePanels();
selectAuthMode('login');
initOnlineServices().catch(error=>{console.error(error);showSection('auth');ui.authMessage.textContent='無法連接帳號服務，請稍後再試。';});
