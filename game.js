import * as UHGDK from "./UHGDK.js";

const game=new UHGDK.Game(960,544,"pixelated","gameCanvas");

document.body.appendChild(game.HTMLCanvas);

(async ()=>{
    await game.gameLoop();
    game.centralMemoryManager.addGenMemElement("test",new UHGDK.gameEvent((eventvar)=>console.log(eventvar.mother),0,1,1))
    game.addItem(new UHGDK.animatedImage("s.png",0,0,[[0,0,32,32]],0,0,["i"]));
    game.addItem(new UHGDK.gameEvent((eventvar)=>console.log("ttt"),0,1,1))
})()