import * as UHGDK from "./UHGDK.js";
(async()=>{
    const game=new UHGDK.Game(960,540,"pixelated",["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"],"gameCanvas");
    game.centralMemoryManager.addGenMemElement("commander",new UHGDK.gameEvent((eventvar)=>{
        eventvar.mother.moving=false;
        for(let i of [["ArrowLeft",-5,0],["ArrowRight",5,0],["ArrowUp",0,-5],["ArrowDown",0,5]]){
            if(game.keys.checkPressed(i[0])){
                eventvar.mother.x+=i[1];
                eventvar.mother.y+=i[2];
                console.log(8*eventvar.mother.folowers.length)
                console.log(eventvar.mother.positions)
                eventvar.mother.positions.push([eventvar.mother.x,eventvar.mother.y])
            }
        }
        if(eventvar.mother.positions.length>=(8*eventvar.mother.folowers.length)){
            eventvar.mother.positions.slice(eventvar.mother.positions.length-(8*eventvar.mother.folowers.length),eventvar.mother.positions.length)
        }
    },0,1,0,false))

    document.body.appendChild(game.HTMLCanvas);
    await game.gameLoop();
    const follower=new UHGDK.animatedImage("s.png",0,0,[[0,0,32,32]],0,0)
    const follower2=new UHGDK.animatedImage("s.png",0,0,[[0,0,32,32]],0,0)
    const follower3=new UHGDK.animatedImage("s.png",0,0,[[0,0,32,32]],0,0)
    const follower4=new UHGDK.animatedImage("s.png",0,0,[[0,0,32,32]],0,0)
    const follower5=new UHGDK.animatedImage("s.png",0,0,[[0,0,32,32]],0,0)
    const follower6=new UHGDK.animatedImage("s.png",0,0,[[0,0,32,32]],0,0)
    const follower7=new UHGDK.animatedImage("s.png",0,0,[[0,0,32,32]],0,0)
    const follower8=new UHGDK.animatedImage("s.png",0,0,[[0,0,32,32]],0,0)
    const follower9=new UHGDK.animatedImage("s.png",0,0,[[0,0,32,32]],0,0)
    const follower10=new UHGDK.animatedImage("s.png",0,0,[[0,0,32,32]],0,0)
    const follower11=new UHGDK.animatedImage("s.png",0,0,[[0,0,32,32]],0,0)
    const follower12=new UHGDK.animatedImage("s.png",0,0,[[0,0,32,32]],0,0)
    const commander=new UHGDK.animatedImage("s.png",0,0,[[0,0,32,32]],0,0,[],["commander"]);
    commander.positions=[];
    commander.moving=false;
    //,follower2,follower3,follower4,follower5,follower6,follower7,follower8,follower9,follower10,follower11,follower12
    commander.folowers=[];
    game.addItem(commander);
    game.addItem(follower);
    game.removeItem(1);
    console.log(game.elements)
})()