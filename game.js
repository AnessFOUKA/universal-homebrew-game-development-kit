import * as UHGDK from "./UHGDK.js";
(async()=>{
    const game=new UHGDK.Game(480,360,"pixelated",["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"],"gameCanvas");
    game.centralMemoryManager.addGenMemElement("test",new UHGDK.gameEvent((eventvar)=>console.log(eventvar),0,1,1,false))
    document.body.appendChild(game.HTMLCanvas);
    await game.gameLoop();
    game.addItem(new UHGDK.itemHandler([],[],["test"]))
})()