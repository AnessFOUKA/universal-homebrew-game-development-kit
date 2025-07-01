import * as UHGDK from "./UHGDK.js";

const game=new UHGDK.Game(960,544,"pixelated","gameCanvas");

document.body.appendChild(game.HTMLCanvas);

(async ()=>{
    await game.gameLoop();
    game.addItem(new UHGDK.itemHandler([],[]));
    game.addItem(new UHGDK.itemHandler([],[]),[[0]]);
    game.addItem(new UHGDK.animatedImage("s.png",200,0,[[0,0,32,32]],0,0),[[0,0]]);
    game.addItem(new UHGDK.animatedImage("s.png",0,0,[[0,0,32,32]],0,0));
    game.removeItem([[0,0,0]])
})()