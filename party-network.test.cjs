const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('game.js','utf8');
const names=['setupPartyConnection','broadcastParty','connectionFor','handlePartyData','choosePartyTarget','routePartyAttack','partyLinksReady','ensurePartyLink'];
const functions=names.map(name=>{const start=source.search(new RegExp('(?:async )?function '+name+'\\('));const rest=source.slice(start);const end=rest.slice(1).search(/\n(?:async )?function /);return end<0?rest:rest.slice(0,end+1);}).join('\n');
const members=['h','a','b'].map(id=>({id,peer_id:'peer-'+id}));
function client(id){const c={isHost:id==='h',session:{user:{id}},partyState:{host_id:'h',host_peer_id:'peer-h',members,settings:{target_mode:'rotate'}},connections:new Map(),opponents:new Map(),eliminatedPlayers:new Set(),targetCursor:0,roomMode:'online',roomChat:[],running:true,gameEnded:false,peerReady:false,connection:null,Date,Set,Math,received:[],emptyBoard:()=>[],partyHello:()=>({type:'party-hello',userId:id}),renderOpponentBoards(){},renderPartyRoom(){},renderRoomChat(){},sendState(){},checkPartyWinner(){},toast(){},receiveAttack(n){c.received.push(n)},refreshPartyRoom:async()=>{c.partyState.members=members}};vm.createContext(c);vm.runInContext(functions,c);return c;}
function link(host,guest){const make=(peer,id)=>({peer,metadata:{userId:id},open:true,events:{},on(n,fn){this.events[n]=fn},close(){this.open=false;this.events.close?.()}});const h=make('peer-'+guest.session.user.id,guest.session.user.id),g=make('peer-h','h');h.send=d=>guest.handlePartyData(d,g);g.send=d=>host.handlePartyData(d,h);host.setupPartyConnection(h);guest.setupPartyConnection(g);return {h,g};}
(async()=>{
 const h=client('h'),a=client('a'),b=client('b');const A=link(h,a),B=link(h,b);
 assert.equal(h.partyLinksReady(),false);
 // Guest can join before host's database poll sees it.
 h.partyState={...h.partyState,members:[members[0]]};
 await h.handlePartyData({type:'party-hello',userId:'a'},A.h);
 await h.handlePartyData({type:'party-hello',userId:'b'},B.h);
 await a.handlePartyData({type:'party-hello',userId:'h'},A.g);
 await b.handlePartyData({type:'party-hello',userId:'h'},B.g);
 assert.equal(h.partyLinksReady(),true);
 await h.handlePartyData({type:'state',userId:'spoof',board:[[1]],score:90},A.h);
 assert.equal(h.opponents.get('a').score,90);assert.equal(b.opponents.get('a').score,90);assert.equal(h.opponents.has('spoof'),false);
 h.broadcastParty({type:'state',userId:'h',board:[[2]],score:120});assert.equal(a.opponents.get('h').score,120);assert.equal(b.opponents.get('h').score,120);
 await h.handlePartyData({type:'attack',lines:2},A.h);assert.deepEqual(h.received,[2]);
 await h.handlePartyData({type:'attack',lines:3},A.h);assert.deepEqual(b.received,[3]);
 h.targetCursor=0;h.routePartyAttack('h',4);assert.deepEqual(a.received,[4]);
 // A repeated hello preserves the last visible board.
 await h.handlePartyData({type:'party-hello',userId:'a'},A.h);assert.equal(h.opponents.get('a').score,90);
 A.g.close();assert.equal(a.opponents.get('h').score,120);
 let reconnects=0;a.peer={connect(){reconnects++;return {peer:'peer-h',open:false,on(){},close(){}}}};
 a.ensurePartyLink();a.ensurePartyLink();assert.equal(reconnects,1);
 console.log('PASS: three-player board relay, sender identity, host/guest attacks, readiness, late join handshake, preserved boards and reconnect throttling');
})().catch(e=>{console.error(e);process.exit(1)});
