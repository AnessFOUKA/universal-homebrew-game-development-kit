import * as UHGDK from "./UHGDK.js";
(async()=>{
    const game=new UHGDK.Game(960,540,"pixelated",["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","x"],"gameCanvas");
    game.centralMemoryManager.addGenMemElement("commander",new UHGDK.gameEvent((eventvar)=>{
        eventvar.mother.moving=false;
        if(game.keys.checkClicked("x")){
            const addedfollower=new UHGDK.animatedImage("s.png",0,0,[[0,0,32,32]],0,0,[],["follower"]);
            addedfollower.positions=[];
            addedfollower.commander=previous;
            previous=addedfollower;
            game.addItem(addedfollower,game.elements[0])
            
        }
        for(let i of [["ArrowLeft",-5,0],["ArrowRight",5,0],["ArrowUp",0,-5],["ArrowDown",0,5]]){
            if(game.keys.checkPressed(i[0])){
                eventvar.mother.moving=true;
                eventvar.mother.x+=i[1];
                eventvar.mother.y+=i[2];
                if(eventvar.mother.positions.length<100){
                    eventvar.mother.positions.push([eventvar.mother.x,eventvar.mother.y]);
                }else{
                    eventvar.mother.positions=[...eventvar.mother.positions.slice(eventvar.mother.positions.length-7,eventvar.mother.positions.length),[eventvar.mother.x,eventvar.mother.y]]
                }
            }
        }
    },0,1,0,false))

    game.centralMemoryManager.addGenMemElement("follower",new UHGDK.gameEvent((eventvar)=>{
        eventvar.mother.moving=false;
        if(eventvar.mother.commander.positions.length>=8){
            if(eventvar.mother.commander.moving){
                eventvar.mother.moving=true;
                eventvar.mother.x=eventvar.mother.commander.positions[eventvar.mother.commander.positions.length-8][0]
                eventvar.mother.y=eventvar.mother.commander.positions[eventvar.mother.commander.positions.length-8][1]
                if(eventvar.mother.positions.length<100){
                    eventvar.mother.positions.push([eventvar.mother.x,eventvar.mother.y]);
                }else{
                    eventvar.mother.positions=[...eventvar.mother.positions.slice(eventvar.mother.positions.length-7,eventvar.mother.positions.length),[eventvar.mother.x,eventvar.mother.y]]
                }
            }
        }
    },0,1,0,false))

    game.centralMemoryManager.addGenMemElement("itemHandler1",new UHGDK.gameEvent((eventvar)=>{
        if(eventvar.index==0){
            eventvar.mother.autodraw=false;
            eventvar.mother.camera=new UHGDK.Camera(0,100,0,0,480,360,eventvar.mother)
            eventvar.mother.camera2=new UHGDK.Camera(481,100,0,0,480,360,eventvar.mother)
            eventvar.eventSpeed=0;
            eventvar.index+=1;
        }else{
            eventvar.mother.camera.showZone();
            eventvar.mother.camera2.showZone();
        }
    },0,2,1,false))

    document.body.appendChild(game.HTMLCanvas);
    await game.gameLoop();
    const commander=new UHGDK.animatedImage("s.png",0,0,[[0,0,32,32]],0,0,[],["commander"]);
    commander.positions=[];

    const follower=new UHGDK.animatedImage("s.png",0,0,[[0,0,32,32]],0,0,[],["follower"]);
    follower.positions=[];
    follower.commander=commander;
    
    let previous=follower;
    //,follower2,follower3,follower4,follower5,follower6,follower7,follower8,follower9,follower10,follower11,follower12
    game.addItem(new UHGDK.itemHandler([],[],["itemHandler1"]))
    game.addItem(commander,game.elements[0]);
    game.addItem(follower,game.elements[0]);
    console.log(game.elements)
})()