export class memoryManager{
    constructor(){
        this.imgMem={};
        this.sndMem={};
        this.genMem={};
    }

    //image memory gestion
    
    getImg(imgIndex){
        return this.imgMem[imgIndex];
    }

    async addImg(filename){
        try{
            await new Promise((resolve,reject)=>{
                this.imgMem[filename]=new Image();
                this.imgMem[filename].src=filename;
                this.imgMem[filename].onload=()=>resolve();
                this.imgMem[filename].onerror=()=>reject(`failed to load image ${filename}. please check if she's truly existing
                    and if she's not corruped`);
            })
        }catch(error){
            console.error(error);
        }
    }

    removeImg(imgIndex){
        this.imgMem[imgIndex].src="";
        delete this.imgMem[imgIndex];
    }

    clearImgMem(){
        for(let i in this.imgMem){
            this.removeImg(i);
        }
    }

    //sound memory gestion

    getSnd(sndIndex){
        return this.sndMem[sndIndex];
    }

    async addSnd(filename){
        try{
            await new Promise((resolve,reject)=>{
                this.sndMem[filename]=new Audio();
                this.sndMem[filename].src=filename;
                this.sndMem[filename].onload=()=>resolve();
                this.sndMem[filename].onerror=()=>reject(`failed to load audio file ${filename}. please check if she's truly existing
                    and if she's not corruped`);
            })
        }catch(error){
            console.error(error);
        }
    }

    removeSnd(sndIndex){
        this.sndMem[sndIndex].src="";
        delete this.sndMem[sndIndex];
    }

    clearSndMem(){
        for(let i in this.sndMem){
            this.removeSnd(i);
        }
    }

    //general memory gestion
    getGenMemElement(elemIndex){
        return this.genMem[elemIndex];
    }

    addGenMemElement(elemIndex,value){
        this.genMem[elemIndex]=value;
    }

    removeGenMemElement(elemIndex){
        delete this.genMem[elemIndex];
    }

    clearGenMemElement(){
        for(let i in this.genMem){
            this.removeGenMemElement(i);
        }
    }
}

export class Game{
    constructor(width,height,imageRendering,id=null){
        this.HTMLCanvas=document.createElement("canvas");
        this.HTMLCanvas.width=width;
        this.HTMLCanvas.height=height;
        this.HTMLCanvas.style.imageRendering=imageRendering;
        if(id!=null){
            this.HTMLCanvas.id=id;
        }
        this.ctx=this.HTMLCanvas.getContext("2d");
        this.centralMemoryManager=new memoryManager();
        this.elements=[];
        this.orders=[];
        this.inputManager=new inputManager(["ArrowLeft"]);
    }
    async gameLoop(){
        await (async ()=>{
            this.orders.reverse();
            for(let i=this.orders.length-1;i>=0;i--){
                await this.orders[i]();
                this.orders.splice(i,1);
            }
            for(let i in this.centralMemoryManager.imgMem){
                if(this.checkIfImageUsed(i)==0){
                    this.centralMemoryManager.removeImg(i)
                }
            }
        })()
        await (async ()=>{
            this.ctx.fillStyle="black";
            this.ctx.fillRect(0,0,this.HTMLCanvas.width,this.HTMLCanvas.height);
            if(this.inputManager.checkClicked("ArrowLeft")){
                console.log("testeefg")
            }
            for(let i=0;i<this.elements.length;i++){
                this.elements[i].arrayID=i;
                if(this.elements[i].isJustCreated){
                    this.elements[i].create();
                    this.elements[i].isJustCreated=false;
                }

                this.elements[i].step();
                this.elements[i].draw();
            }
            requestAnimationFrame(()=>this.gameLoop());
        })();
    }

    getTargetMap(instance){
        const targetMap=[]
        let container=instance;
        while(!(container instanceof Game)){
            targetMap.push(container.arrayID);
            container=container.mother;
        }
        return targetMap;
    }

    checkIfImageUsed(imgIndex,elements=this.elements){
        let imageUsingElements=[];
        for(let i of elements){
            if(i instanceof itemHandler){
                imageUsingElements.push(...this.checkIfImageUsed(imgIndex,i.elements))
            }else{
                if(i instanceof animatedImage&&i.spritesheet==imgIndex){
                    imageUsingElements.push(i)
                }
            }
        }
        return imageUsingElements;
    }
    getTargetMapFromID(id,elements=this.elements,previousTargetMap=[]){
        for(let i=0;i<elements.length;i++){
            if(elements[i].idList.includes(id)){
                return [...previousTargetMap,i]
            }else if(elements[i] instanceof itemHandler){
                const functionResponse=this.getTargetMapFromID(id,elements[i].elements,[...previousTargetMap,i])
                if(functionResponse) return functionResponse
            }
        }
        return null
    }
    
    addItem(item,targetMapList=null){
        this.orders.push(async()=>{
            if(item.spritesheet!=undefined){
                await this.centralMemoryManager.addImg(item.spritesheet);
            }
            item.mother=this
            item.arrayID=this.elements.length
            if(targetMapList!=null){
                for(let targetMap of targetMapList){
                    const finalTargetMap=typeof targetMap=="string"?this.getTargetMapFromID(targetMap):targetMap;
                    let targetedItemHandler=this;
                    for(let i of finalTargetMap){
                        targetedItemHandler=targetedItemHandler.elements[i];
                    }
                    item.mother=targetedItemHandler
                    targetedItemHandler.elements.push(item)
                }
            }else{
                this.elements.push(item)
            }
        })
    }
    removeItem(targetMapList){
        this.orders.push(async()=>{
            for(let targetMap of targetMapList){
                const finalTargetMap=typeof targetMap=="string"?this.getTargetMapFromID(targetMap):targetMap;
                let targetedItemHandler=this;
                for(let i of finalTargetMap){
                    targetedItemHandler=targetedItemHandler.elements[i];
                }
                targetedItemHandler.mother.elements.splice(finalTargetMap[finalTargetMap.length-1],1)    
            }
        })
    }
}

export class itemHandler{
    constructor(elements,idList=[],gameEventsIDs=[]){
        this.elements=elements;
        this.idList=idList;
        this.isJustCreated=true;
        this.gameEventsIDs=gameEventsIDs;
        this.events=[];
    }
    create(){
        this.gameInstance=this.mother;
        while(!(this.gameInstance instanceof Game)){
            this.gameInstance=this.gameInstance.mother
        }
        for(let i of this.gameEventsIDs){
            const gotEvent=this.gameInstance.centralMemoryManager.getGenMemElement(i);
            const objectEvent=new gameEvent(gotEvent.eventFunction,gotEvent.index,gotEvent.endIndex,gotEvent.eventSpeed,gotEvent.idList)
            objectEvent.mother=this;
            this.events.push(objectEvent);
        }
    }
    step(){
        for(let i=0;i<this.elements.length;i++){
            this.elements[i].arrayID=i;
            if(this.elements[i].isJustCreated){
                this.elements[i].create();
                this.elements[i].isJustCreated=false;
            }
            this.elements[i].step();
            this.elements[i].draw();
        }
        for(let i of this.events){
            i.step();
        }
    }
    draw(){}
}

export class animatedImage{
    constructor(spritesheet,x,y,imageCoords,imageCoordsIndex,animationSpeed,idList=[],gameEventsIDs=[]){
        this.spritesheet=spritesheet;
        this.x=x;
        this.y=y;
        this.imageCoords=imageCoords;
        this.imageCoordsIndex=imageCoordsIndex;
        this.animationSpeed=animationSpeed;
        this.idList=idList;
        this.isJustCreated=true;
        this.gameEventsIDs=gameEventsIDs;
        this.events=[];
    }
    create(){
        this.gameInstance=this.mother;
        while(!(this.gameInstance instanceof Game)){
            this.gameInstance=this.gameInstance.mother
        }
        for(let i of this.gameEventsIDs){
            const gotEvent=this.gameInstance.centralMemoryManager.getGenMemElement(i);
            const objectEvent=new gameEvent(gotEvent.eventFunction,gotEvent.index,gotEvent.endIndex,gotEvent.eventSpeed,gotEvent.idList)
            objectEvent.mother=this;
            this.events.push(objectEvent);
        }
    }
    step(){
        for(let i of this.events){
            i.step();
        }
    }
    draw(){
        if(this.imageCoordsIndex<this.imageCoords.length){
            this.gameInstance.ctx.drawImage(this.gameInstance.centralMemoryManager.getImg(this.spritesheet),this.imageCoords[Math.floor(this.imageCoordsIndex)][0],this.imageCoords[Math.floor(this.imageCoordsIndex)][1],this.imageCoords[Math.floor(this.imageCoordsIndex)][2],this.imageCoords[Math.floor(this.imageCoordsIndex)][3],this.x,this.y,this.imageCoords[Math.floor(this.imageCoordsIndex)][2],this.imageCoords[Math.floor(this.imageCoordsIndex)][3])
            this.imageCoordsIndex+=this.animationSpeed;
        }else{
            this.imageCoordsIndex=0;
        }
    }
}

export class gameEvent{
    constructor(eventFunction,index,endIndex,eventSpeed,idList=[]){
        this.isJustCreated=true;
        this.eventFunction=eventFunction;
        this.index=index;
        this.endIndex=endIndex;
        this.eventSpeed=eventSpeed;
        this.idList=idList;
    }
    create(){
        this.gameInstance=this.mother;
        while(!(this.gameInstance instanceof Game)){
            this.gameInstance=this.gameInstance.mother
        }
    }
    step(){
        if(this.index<this.endIndex){
            this.eventFunction(this);
            this.index+=this.eventSpeed;
        }else{
            if((this.mother instanceof itemHandler || this.mother instanceof Game)&&this.mother.elements.some(a=>a===this)){
                /*const targetMap=[];
                let container=this;
                while(!(container instanceof Game)){
                    targetMap.push(container.arrayID);
                    container=container.mother;
                }*/
                this.gameInstance.removeItem([this.gameInstance.getTargetMap(this)])
            }
        }
    }
    draw(){}
}

class inputManager{
    constructor(keys=[]){
        this.keys=this.setControls(keys);
        this.pressable={};
        for(let i in this.pressable){
            this.pressable[i]=true
        }
    }
    setControls(keysList){
        const finalKeys={}
        for(let i of keysList){
            finalKeys[i]=false;
            document.addEventListener("keydown",(event)=>{
                if(event.key==i){
                    finalKeys[i]=true;
                }
            })
            document.addEventListener("keyup",(event)=>{
                if(event.key==i){
                    finalKeys[i]=false;
                }
            })
        }
        return finalKeys;
    }
    checkPressed(key){
        return this.keys[key]
    }
    checkClicked(key){
        const pressedKey=this.checkPressed(key);
        if(pressedKey&&this.pressable[key]){
            this.pressable[key]=false;
            return true;
        }
        this.pressable[key]=!pressedKey;
        return false;
    }
}