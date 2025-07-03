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
    constructor(spritesheet,x,y,imageCoords,imageCoordsIndex,animationSpeed,idList=[]){
        this.spritesheet=spritesheet;
        this.x=x;
        this.y=y;
        this.imageCoords=imageCoords;
        this.imageCoordsIndex=imageCoordsIndex;
        this.animationSpeed=animationSpeed;
        this.idList=idList;
        this.isJustCreated=true;
    }
    create(){
        this.gameInstance=this.mother;
        while(!(this.gameInstance instanceof Game)){
            this.gameInstance=this.gameInstance.mother
        }
    }
    step(){}
    draw(){
        if(this.imageCoordsIndex<this.imageCoords.length){
            this.gameInstance.ctx.drawImage(this.gameInstance.centralMemoryManager.getImg(this.spritesheet)[0],this.imageCoords[Math.floor(this.imageCoordsIndex)][0],this.imageCoords[Math.floor(this.imageCoordsIndex)][1],this.imageCoords[Math.floor(this.imageCoordsIndex)][2],this.imageCoords[Math.floor(this.imageCoordsIndex)][3],this.x,this.y,this.imageCoords[Math.floor(this.imageCoordsIndex)][2],this.imageCoords[Math.floor(this.imageCoordsIndex)][3])
            this.imageCoordsIndex+=this.animationSpeed;
        }else{
            this.imageCoordsIndex=0;
        }
    }
}

//verifié
export class itemHandler{
    constructor(elements,idList=[]){
        this.elements=elements;
        this.idList=idList;
        this.isJustCreated=true;
    }
    create(){
        this.gameInstance=this.mother;
        while(!(this.gameInstance instanceof Game)){
            this.gameInstance=this.gameInstance.mother
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
            element.draw();
            array+=1;
        }
    }
    draw(){}
}

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
            element.mother=this;
            element.arrayID=array;
            if(element.isJustCreated){
                element.create();
                element.isJustCreated=false;
            }
            element.step();
            element.draw();
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
                console.log(imgData)
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
            if(this.centralMemoryManager.getImg(itemSpritesheet)[1]==1){
                this.centralMemoryManager.removeImg(itemSpritesheet)
            }else{
                this.centralMemoryManager.getImg(itemSpritesheet)[1]-=1;
            }
        }else if(container.elements[itemIndex] instanceof itemHandler){
            this.flushContainer(container)
            container.elements.splice(itemIndex,1);
        }else{
            container.elements.splice(itemIndex,1);
        }
    }
}

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
            console.log(this.arrayID)
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