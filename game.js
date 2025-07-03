import * as UHGDK from "./UHGDK.js";
(async()=>{
    const game=new UHGDK.Game(480,360,"pixelated",["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"],"gameCanvas");
    document.body.appendChild(game.HTMLCanvas);
    await game.gameLoop();
    game.addItem(new UHGDK.itemHandler([],[]))
    game.addItem(new UHGDK.gameEvent(()=>console.log("aaa"),0,1,1,true))
})()