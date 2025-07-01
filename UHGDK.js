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
            for(let i of this.elements){
                if(i.isJustCreated){
                    i.create();
                    i.isJustCreated=false;
                }
                i.step();
                i.draw();
            }
            requestAnimationFrame(()=>this.gameLoop());
        })();
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

    addItem(item,targetMapList=null){
        this.orders.push(async()=>{
            if(item.spritesheet!=undefined){
                await this.centralMemoryManager.addImg(item.spritesheet);
            }
            item.mother=this
            if(targetMapList!=null){
                for(let targetMap of targetMapList){
                    let targetedItemHandler=this;
                    for(let i of targetMap){
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
                let targetedItemHandler=this;
                for(let i of targetMap){
                    targetedItemHandler=targetedItemHandler.elements[i];
                }
                console.log(targetMap[targetMap.length-1])
                targetedItemHandler.mother.elements.splice(targetMap[targetMap.length-1],1)    
            }
        })
    }
}

export class itemHandler{
    constructor(elements,idList){
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
        for(let i of this.elements){
            if(i.isJustCreated){
                i.create();
                i.isJustCreated=false;
            }
            i.step();
            i.draw();
        }
    }
    draw(){}
}

export class animatedImage{
    constructor(spritesheet,x,y,imageCoords,imageCoordsIndex,animationSpeed,idList){
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
            this.gameInstance.ctx.drawImage(this.gameInstance.centralMemoryManager.getImg(this.spritesheet),this.imageCoords[Math.floor(this.imageCoordsIndex)][0],this.imageCoords[Math.floor(this.imageCoordsIndex)][1],this.imageCoords[Math.floor(this.imageCoordsIndex)][2],this.imageCoords[Math.floor(this.imageCoordsIndex)][3],this.x,this.y,this.imageCoords[Math.floor(this.imageCoordsIndex)][2],this.imageCoords[Math.floor(this.imageCoordsIndex)][3])
            this.imageCoordsIndex+=this.animationSpeed;
        }else{
            this.imageCoordsIndex=0;
        }
    }
}