import * as UHGDK from "./UHGDK.js";

(async ()=>{
    const game=new UHGDK.Game(960,544,"pixelated",["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"],"gameCanvas");

    document.body.appendChild(game.HTMLCanvas);
    
    await game.gameLoop();
    game.centralMemoryManager.addGenMemElement("character",new UHGDK.gameEvent((eventVar)=>{
        for(let i of [["ArrowLeft",-10,0],["ArrowRight",10,0],["ArrowUp",0,-10],["ArrowDown",0,10]]){
            if(game.inputManager.checkPressed(i[0])){
                eventVar.mother.x+=i[1];
                eventVar.mother.y+=i[2];
            }
        }
    },0,1,1,true))

    game.addItem(new UHGDK.itemHandler([],["concernedItemHandler"]))
    
    game.addItem(new UHGDK.animatedImage("s.png",0,0,[[0,0,32,32]],0,0,[],["character"]),["concernedItemHandler"])
})()