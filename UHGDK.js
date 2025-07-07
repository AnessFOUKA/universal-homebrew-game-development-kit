export function detectInbound(element,x,y,width,height){
    //return((element.x>=x&&element.x<=x+width)||(element.x+element.width>=x&&element.x+element.width<=x+width)||(element.x<x&&element.x+element.width))&&()
}

//verifié !
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
                this.imgMem[filename]=[new Image(),0];
                this.imgMem[filename][0].src=filename;
                this.imgMem[filename][0].onload=()=>resolve();
                this.imgMem[filename][0].onerror=()=>reject(`failed to load image ${filename}. please check if she's truly existing
                    and if she's not corruped`);
            })
        }catch(error){
            console.error(error);
        }
    }

    removeImg(imgIndex){
        this.imgMem[imgIndex][0].src="";
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

//verifié
export class animatedImage{
    constructor(spritesheet,x,y,imageCoords,imageCoordsIndex,animationSpeed,idList=[],eventIDs=[]){
        this.spritesheet=spritesheet;
        this.x=x;
        this.y=y;
        this.imageCoords=imageCoords;
        this.imageCoordsIndex=imageCoordsIndex;
        this.animationSpeed=animationSpeed;
        this.idList=idList;
        this.isJustCreated=true;
        this.eventIDs=eventIDs;
        this.events=[];
    }
    create(){
        this.gameInstance=this.mother;
        while(!(this.gameInstance instanceof Game)){
            this.gameInstance=this.gameInstance.mother
        }
        for(let i of this.eventIDs){
            const assignedEvent=this.gameInstance.centralMemoryManager.getGenMemElement(i);
            const addedEvent=new gameEvent(assignedEvent.eventFunction,assignedEvent.index,assignedEvent.endIndex,assignedEvent.eventSpeed,assignedEvent.loop,assignedEvent.idList);
            addedEvent.gameInstance=this.gameInstance;
            addedEvent.mother=this;
            this.events.push(addedEvent);
        }
    }
    step(){
        for(let i of this.events){
            i.step();
        }
    }
    draw(x=this.x,y=this.y,width=this.imageCoords[Math.floor(this.imageCoordsIndex)][2],height=this.imageCoords[Math.floor(this.imageCoordsIndex)][3],sx=this.imageCoords[Math.floor(this.imageCoordsIndex)][0],sy=this.imageCoords[Math.floor(this.imageCoordsIndex)][1]){
        if(this.imageCoordsIndex<this.imageCoords.length){
            let imageX=sx
            let imageY=sy
            let imageWidth=width
            let imageHeigth=height

            this.gameInstance.ctx.drawImage(this.gameInstance.centralMemoryManager.getImg(this.spritesheet)[0],imageX,imageY,imageWidth,imageHeigth,x,y,imageWidth,imageHeigth)
            this.imageCoordsIndex+=this.animationSpeed;
        }else{
            this.imageCoordsIndex=0;
        }
    }
}

//verifié
export class itemHandler{
    constructor(elements,idList=[],eventIDs=[]){
        this.elements=elements;
        this.idList=idList;
        this.isJustCreated=true;
        this.eventIDs=eventIDs;
        this.events=[];
        this.autodraw=true;
    }
    create(){
        this.gameInstance=this.mother;
        while(!(this.gameInstance instanceof Game)){
            this.gameInstance=this.gameInstance.mother
        }
        for(let i of this.eventIDs){
            const assignedEvent=this.gameInstance.centralMemoryManager.getGenMemElement(i);
            const addedEvent=new gameEvent(assignedEvent.eventFunction,assignedEvent.index,assignedEvent.endIndex,assignedEvent.eventSpeed,assignedEvent.loop,assignedEvent.idList);
            addedEvent.gameInstance=this.gameInstance;
            addedEvent.mother=this;
            this.events.push(addedEvent);
        }
    }
    step(){
        let array=0;
        for(let element of this.elements){
            element.mother=this;
            element.arrayID=array;
            if(element.isJustCreated){
                element.create();
                element.isJustCreated=false;
            }
            element.step();
            if(this.autodraw)element.draw();
            array+=1;
        }
        for(let i of this.events){
            i.step();
        }
    }
    draw(){}
}
//vérifié
export class gameEvent{
    constructor(eventFunction,index,endIndex,eventSpeed,loop=false,idList=[]){
        this.isJustCreated=true;
        this.eventFunction=eventFunction;
        this.baseIdex=index;
        this.index=index;
        this.endIndex=endIndex;
        this.eventSpeed=eventSpeed;
        this.idList=idList;
        this.loop=loop
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
            if(this.loop){
                this.index=this.baseIdex;
            }
            if(this.arrayID!=undefined){
                this.gameInstance.removeItem(this.arrayID,this.mother)
            }
            
            /*
            if((this.mother instanceof itemHandler || this.mother instanceof Game)&&this.mother.elements.some(a=>a===this)){
                this.gameInstance.removeItem([this.gameInstance.getTargetMap(this)])
            }*/
        }
    }
    draw(){}
}
//vérifié
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

export class Camera {
    constructor(renderX, renderY, cameraX, cameraY, width, height, linkedItemHandler) {
        this.renderX = renderX;
        this.renderY = renderY;
        this.cameraX = cameraX;
        this.cameraY = cameraY;
        this.width = width;
        this.height = height;
        this.linkedItemHandler = linkedItemHandler;
    }

    showZone() {
        for (let i of this.linkedItemHandler.elements) {
            let imageX = i.imageCoords[Math.floor(i.imageCoordsIndex)][0];
            let imageY = i.imageCoords[Math.floor(i.imageCoordsIndex)][1];
            let imageWidth = i.imageCoords[Math.floor(i.imageCoordsIndex)][2];
            let imageHeight = i.imageCoords[Math.floor(i.imageCoordsIndex)][3];

            let worldX = i.x;
            let worldY = i.y;

            let cropLeft = 0;
            let cropTop = 0;

            if (worldX < this.cameraX) {
                cropLeft = this.cameraX - worldX;
                imageX += cropLeft;
                imageWidth -= cropLeft;
                worldX = this.cameraX; 
            }

            if (worldY < this.cameraY) {
                cropTop = this.cameraY - worldY;
                imageY += cropTop;
                imageHeight -= cropTop;
                worldY = this.cameraY; 
            }

            if (worldX + imageWidth > this.cameraX + this.width) {
                const overflow = (worldX + imageWidth) - (this.cameraX + this.width);
                imageWidth -= overflow;
            }

            if (worldY + imageHeight > this.cameraY + this.height) {
                const overflow = (worldY + imageHeight) - (this.cameraX + this.height);
                imageHeight -= overflow;
            }

            const destX = worldX - this.cameraX + this.renderX;
            const destY = worldY - this.cameraY + this.renderY;

            i.draw(destX, destY, imageWidth, imageHeight, imageX, imageY);
        }
    }
}
//vérifié
export class Game{
    constructor(width,height,imageRendering,keys=[],HTMLId=null){
        this.HTMLCanvas=document.createElement("canvas");
        this.HTMLCanvas.width=width;
        this.HTMLCanvas.height=height;
        this.HTMLCanvas.style.imageRendering=imageRendering;
        this.ctx=this.HTMLCanvas.getContext("2d");
        this.centralMemoryManager=new memoryManager();
        if(HTMLId!=null){
            this.HTMLCanvas.id=HTMLId;
        }
        this.elements=[];
        this.gameDataPipeline=[];
        this.keys=new inputManager(keys)
        this.autodraw=true;
    }
    async gameLoop(){
        while(this.gameDataPipeline.length>0){
            await this.gameDataPipeline[0]();
            this.gameDataPipeline.splice(0,1);
        }
        this.ctx.fillStyle="black";
        this.ctx.fillRect(0,0,this.HTMLCanvas.width,this.HTMLCanvas.height);
        let array=0;
        for(let element of this.elements){
            /*
            for(let i of [["ArrowLeft",-5,0],["ArrowRight",5,0],["ArrowUp",0,-5],["ArrowDown",0,5]]){
                if(this.keys.checkPressed(i[0])){
                    element.x+=i[1];
                    element.y+=i[2];
                }
            }*/
            element.mother=this;
            element.arrayID=array;
            if(element.isJustCreated){
                element.create();
                element.isJustCreated=false;
            }
            element.step();
            if(this.autodraw)element.draw();
            array+=1;
        }

        requestAnimationFrame(()=>this.gameLoop())
    }
    addItem(item,container=this){
        if(item.spritesheet!=undefined){
            this.gameDataPipeline.push(async ()=>{
                if(!Object.keys(this.centralMemoryManager.imgMem).includes(item.spritesheet))await this.centralMemoryManager.addImg(item.spritesheet);
                const imgData=this.centralMemoryManager.getImg(item.spritesheet)
                imgData[1]=imgData[1]+1;
            });
        }
        container.elements.push(item)
    }
    flushContainer(container){
        for(let i=container.elements.length-1;i>=0;i--){
            if(container.elements[i] instanceof itemHandler){
                this.flushContainer(container.elements[i])
            }else if(container.elements[i] instanceof animatedImage){
                const itemSpritesheet=container.elements[i].spritesheet;
                container.elements.splice(i,1);
                if(this.centralMemoryManager.getImg(itemSpritesheet)[1]==1){
                    this.centralMemoryManager.removeImg(itemSpritesheet)
                }else{
                    this.centralMemoryManager.getImg(itemSpritesheet)[1]-=1;
                }
            }else{
                container.elements.splice(i,1);
            }
        }
    }
    removeItem(itemIndex,container=this){
        if(container.elements[itemIndex] instanceof animatedImage){
            const itemSpritesheet=container.elements[itemIndex].spritesheet;
            container.elements.splice(itemIndex,1);
            this.gameDataPipeline.push(async ()=>{
            if(this.centralMemoryManager.getImg(itemSpritesheet)[1]==1){
                this.centralMemoryManager.removeImg(itemSpritesheet)
            }else{
                this.centralMemoryManager.getImg(itemSpritesheet)[1]-=1;
            }})
        }else if(container.elements[itemIndex] instanceof itemHandler){
            this.flushContainer(container)
            container.elements.splice(itemIndex,1);
        }else{
            container.elements.splice(itemIndex,1);
        }
    }
    getInstanceByID(id,container=this){
        const returnedInstances=[];
        for(let i of container.elements){
            if(i.idList.includes(id)){
                returnedInstances.push(i)
            }else if(i instanceof itemHandler){
                returnedInstances.push(...this.getInstanceByID(id,i))
            }
        }
        return returnedInstances; 
    }
    getInstanceIndexByID(id,container=this){
        const returnedIndexes=[];
        for(let i=0;i<container.elements.length;i++){
            if(container.elements[i].idList.includes(id)){
                returnedIndexes.push(i);
            }
        }
        return returnedIndexes; 
    }
}

/*
future objectives: 
    -create a function to access to an object and to modify it using one of its id s. --
    -create a function to access to the arrayID of an object using one of its id s. --
*/ 