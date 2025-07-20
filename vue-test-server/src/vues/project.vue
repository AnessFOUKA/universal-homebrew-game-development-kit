<template>
    <div id="interface">
        <div id="gameScreen"></div>
        <div id="avaliableItems">
            <p id="avaliableItemsSection">avaliable items</p>
            <ul>
                <li v-if="ready==true" v-for="(item,index) in game.objectsDEV.elements" :key="index"><p>{{ item.idList.join(';') }}</p><section><button @click="deleteDevObject(index)">remove</button></section></li>
            </ul>
            <button id="addItem" @click="workMode='create'">add item</button>
        </div>
        <div id="buttons">
            <button @click="workMode='saveMap'">save</button>
            <button @click="workMode='loadMap'">load</button>
        </div>
        <div id="createObjectForm" v-if="workMode=='create'">
            <p>create animatedImage</p>
            <section id="fields">
                <section class="field" v-for="i of ['spritesheet','imageCoords','imageCoordsIndex','animationSpeed','id list','game events IDs']">
                    <label>{{ i }}:</label>
                    <input type="text" v-model="formData[i]">
                </section>
                <button v-for="i of [['create',addItem],['cancel',()=>workMode='read']]" @click="i[1]()">{{ i[0] }}</button>
            </section>
        </div>
        <div id="loadForm" v-if="workMode=='loadMap'">
            <p>load map</p>
            <section id="fields">
                <section class="field">
                    <label>filename:</label>
                    <input type="text" v-model="filename">
                </section>
                <button @click="openMap(filename,game.getInstanceByID('mainMap')[0],game.objectsDEV)">open map</button>
                <button @click="workMode='read'">cancel</button>
            </section>
        </div>
        <div id="saveForm" v-if="workMode=='saveMap'">
            <p>save map</p>
            <section id="fields">
                <section class="field">
                    <label>filename:</label>
                    <input type="text" v-model="filename">
                </section>
                <button @click="saveMap(game.getInstanceByID('mainMap')[0],filename,true)">submit for work</button>
                <button @click="saveMap(game.getInstanceByID('mainMap')[0],filename)">submit for publish</button> 
                <button @click="workMode='read'">cancel</button>
            </section>
        </div>
    </div>
</template>

<script setup>
    //i must add an addObject and modifyObject form
    import * as UHGDK from "../../UHGDK.js"
    import { ref,onMounted } from "vue";
    const fs=require('fs/promises');

    class debugGame extends UHGDK.Game{
        constructor(width,height,imageRendering,keys=[],HTMLResponsive=false,HTMLId=null){
            super(width,height,imageRendering,keys,HTMLResponsive,HTMLId)
            this.objectsDEV=new UHGDK.itemHandler([]);
            this.objectsDEV.mother=this
            this.index=0;
        }
        addItem(item,container=this){
            if(item.spritesheet!=undefined){
                this.gameDataPipeline.push(async ()=>{
                    if(!Object.keys(this.centralMemoryManager.imgMem).includes(item.spritesheet))await this.centralMemoryManager.addImg(item.spritesheet);
                    const imgData=this.centralMemoryManager.getImg(item.spritesheet)
                    imgData[1]=imgData[1]+1;
                });
            }
            item.debug=true;
            item.mother=container;
            item.gameInstance=item.mother;
            while(!(item.gameInstance instanceof UHGDK.Game)){
                item.gameInstance=item.gameInstance.mother
            }
            container.elements.push(item)
        }
    }

    const formData=ref({
        "spritesheet":"",
        "imageCoords":"",
        "imageCoordsIndex":"",
        "animationSpeed":"",
        "id list":"",
        "game events IDs":""
    })

    function elementInBracket(index,text){
        let inBrackets=0;
        if(index>=0&&index<text.length){
            for(let i=0;i<text.length;i++){
                for(let j of [["[",1],["]",-1]]){
                    if(text[i]==j[0]){
                        inBrackets+=j[1];
                    }
                }
                if(i==index){
                    return inBrackets!=0;
                }
            }
        }
        return null;
    }

    function customSplit(text){
        const finalList=[];
        for(let i=0;i<text.length;i++){
            if((text[i]==","&&!elementInBracket(i,text))||i==text.length-1){
                let beginIndex;
                let endIndex=i;
                for(let j=i-1;j>=0;j--){
                    if((text[j]==","&&!elementInBracket(j,text))||j==0){
                        beginIndex=j==0?j:j+1;
                        break;
                    }
                }
                beginIndex=beginIndex==undefined?0:beginIndex;
                finalList.push(text.substring(beginIndex,endIndex==text.length-1?endIndex+1:endIndex))
            }
        }
        return finalList
    }

    function customLoads(text){
        const finalList=[];
        const splitedText=customSplit(text);
        for(let i of splitedText){
            if(i.startsWith("[")&&i.endsWith("]")){
                finalList.push(customLoads(i.substring(1,i.length-1)))
            }else if(i.startsWith('"')&&i.endsWith('"')){
                finalList.push(i.substring(1,i.length-1))
            }else if(!isNaN(i)){
                finalList.push(Number(i))
            }else if(i=="null"){
                finalList.push(null)
            }
        }
        return finalList
    }

    function addItem(){
        const finalFormData={}
        for(let i of ["spritesheet","imageCoordsIndex","animationSpeed"]){
            finalFormData[i]=i=="spritesheet"?formData.value[i]:Number(formData.value[i])
        }
        for(let i of ["imageCoords","id list","game events IDs"]){
            console.log(formData.value[i])
            console.log(customLoads(formData.value[i]))
            finalFormData[i]=customLoads(formData.value[i])
        }
        console.log(finalFormData);
        game.value.addItem(new UHGDK.animatedImage(finalFormData["spritesheet"],0,0,finalFormData["imageCoords"],finalFormData["imageCoordsIndex"],finalFormData["animationSpeed"],finalFormData["id list"],finalFormData["game events IDs"]),game.value.objectsDEV)
        workMode.value="read";
    }

    const game=ref(new debugGame(0,0,"pixelated",["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","x","z","q","s","d","w","a","e"],false,"gameCanvas"));
    const ready=ref(false);
    const workMode=ref("read");

    function compareArrays(array1,array2){
        return JSON.stringify(array1)==JSON.stringify(array2);
    }

    function enhancedIncludes(array,data){
        const studiedList=[];
        for(let i of array){
            studiedList.push(JSON.stringify(i))
        }
        return studiedList.includes(JSON.stringify(data));
    }

    function deleteDevObject(index){
        const mainContainer=game.value.getInstanceByID("mainMap")[0]
        for(let i=mainContainer.elements.length-1;i>=0;i--){
            console.log(game.value.objectsDEV.elements[index])
            if(mainContainer.elements[i].idList.includes(game.value.objectsDEV.elements[index].idList[0])){
                game.value.removeItem(i,mainContainer)
            }
        }
        game.value.removeItem(index,game.value.objectsDEV)
        console.log(game.value.centralMemoryManager)
    }
    function createItemHandlerDict(itemHandler){
        const dict={};
        for(let i of itemHandler.elements){
            const objectCaracteristics=`"${i.spritesheet}",${JSON.stringify(i.imageCoords)},${i.imageCoordsIndex},${i.animationSpeed},${JSON.stringify(i.idList)},${i.eventIDs.length>0?JSON.stringify(i.eventIDs):"null"}`;
            if(dict[objectCaracteristics]==undefined){
                dict[objectCaracteristics]=[];
                for(let j=0;j<=higherLayer;j++){
                    dict[objectCaracteristics].push([])
                }
            }
            dict[objectCaracteristics][i.layer].push([i.x,i.y])
        }
        return dict;
    }

    function getCoordsValues(coordsList){
        const values=[[],[]];
        for(let i of coordsList){
            if(!enhancedIncludes(values[0],i[0])){
                values[0].push(i[0])
            }
            if(!enhancedIncludes(values[1],i[1])){
                values[1].push(i[1])
            }
        }
        return values;
    }

    function compressCoords(coordsList){
        const avaliableCoords=getCoordsValues(coordsList)[0];
        const coordsFirstCompression=[];
        for(let avaliableCoordX of avaliableCoords){
            coordsFirstCompression.push([[avaliableCoordX],[]])
            for(let coords of coordsList){
                if(coords[0]==avaliableCoordX){
                    coordsFirstCompression[coordsFirstCompression.length-1][1].push(coords[1])
                }
            }
            coordsFirstCompression[coordsFirstCompression.length-1][1]=coordsFirstCompression[coordsFirstCompression.length-1][1].sort((a,b)=>a-b)
        }
        const coordsSecondCompression=[];
        const avaliableCoords2=getCoordsValues(coordsFirstCompression)[1];
        for(let yCoordsList of avaliableCoords2){
            coordsSecondCompression.push([[],yCoordsList])
            for(let coords of coordsFirstCompression){
                if(compareArrays(coords[1],yCoordsList)){
                    coordsSecondCompression[coordsSecondCompression.length-1][0].push(coords[0][0])
                }
            }
        }
        return coordsSecondCompression;
    }

    function compressItemHandlerDict(itemHandler){
        const itemHandlerDict=createItemHandlerDict(itemHandler);
        const finalDict={};
        for(let item in itemHandlerDict){
            finalDict[item]=[];
            for(let layer of itemHandlerDict[item]){
                finalDict[item].push([...compressCoords(layer)]);
            }
        }
        return finalDict;
    }
    async function saveMap(itemHandler,filename="test.mpf",work=false){
        let mapFile="";
        const itemHandlerDict=compressItemHandlerDict(itemHandler);
        if(work){
            mapFile=mapFile.concat("MAP_METADATA\n")
            for(let i in game.value.objectsDEV.elements){
                const objectCaracteristics=`"${game.value.objectsDEV.elements[i].spritesheet}",${JSON.stringify(game.value.objectsDEV.elements[i].imageCoords)},${game.value.objectsDEV.elements[i].imageCoordsIndex},${game.value.objectsDEV.elements[i].animationSpeed},${JSON.stringify(game.value.objectsDEV.elements[i].idList)},${game.value.objectsDEV.elements[i].eventIDs.length>0?JSON.stringify(game.value.objectsDEV.elements[i].eventIDs):"null"}`;
                mapFile=mapFile.concat(`${objectCaracteristics}\n`);
            }
            mapFile=mapFile.concat("END")
            if(Object.keys(itemHandlerDict).length>0)mapFile=mapFile.concat("\n");
        }
        for(let i=0;i<Object.keys(itemHandlerDict).length;i++){
            mapFile=mapFile.concat(`${Object.keys(itemHandlerDict)[i]},${JSON.stringify(itemHandlerDict[Object.keys(itemHandlerDict)[i]])}`);
            if(i<Object.keys(itemHandlerDict).length-1)mapFile=mapFile.concat("\n");
        }
        await fs.writeFile(filename,mapFile);
        workMode.value="read"
    }

    async function openMap(filename,itemHandler,debugItemHandler=null){
        const file=await fs.readFile(filename,{encoding:"utf-8"});
        let begin;
        let end;
        let workItem=false
        itemHandler.elements=[];
        debugItemHandler.elements=[];
        for(let i=0;i<file.length;i++){
            if(i==0||file[i]=="\n"){
                begin=i!=0?i+1:i
                for(let j=i+1;j<file.length;j++){
                    if(j==file.length-1||file[j]=="\n"){
                        end=j==file.length-1?file.length:j
                        break;
                    }
                }
                const line=file.substring(begin,end)
                if(line=="MAP_METADATA"){
                    workItem=true;
                }else if(line=="END"){
                    workItem=false;
                }else{
                    if(workItem==true){
                        const lineList=customLoads(line);
                        if(debugItemHandler!=null)game.value.addItem(new UHGDK.animatedImage(lineList[0],0,0,lineList[1],lineList[2],lineList[3],lineList[4],lineList[5]!=null?lineList[5]:[]),debugItemHandler)
                    }else{
                        const lineList=customLoads(line);
                        for(let arrayID=0;arrayID<lineList[6].length;arrayID++){
                            for(let coords of lineList[6][arrayID]){
                                for(let xCoord of coords[0]){
                                    for(let yCoord of coords[1]){
                                        const instance=new UHGDK.animatedImage(lineList[0],xCoord,yCoord,lineList[1],lineList[2],lineList[3],lineList[4],lineList[5]!=null?lineList[5]:[])
                                        instance.layer=arrayID;
                                        game.value.addItem(instance,itemHandler)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        if(debugItemHandler!=null){
            workMode.value="read";
        }
    }

    let higherLayer=0
    const filename=ref("");
    onMounted(async()=>{
        game.value.centralMemoryManager.addGenMemElement("mainMapScript",new UHGDK.gameEvent((eventvar)=>{
            if(eventvar.index==0){
                eventvar.mother.autodraw=false;
                eventvar.mother.camera=new UHGDK.Camera(0,0,0,0,game.value.HTMLCanvas.width,game.value.HTMLCanvas.height,game.value)
                eventvar.eventSpeed=0;
                eventvar.index+=1;
            }
            eventvar.mother.camera.width=game.value.HTMLCanvas.width;
            eventvar.mother.camera.height=game.value.HTMLCanvas.height;
            eventvar.mother.camera.showZone();
            if(game.value.objectsDEV.elements.length!=0){
                const slowMove=game.value.keys.checkPressed("w");
                for(let i of [["ArrowLeft",slowMove?-1:-5,0],["ArrowUp",0,slowMove?-1:-5],["ArrowDown",0,slowMove?1:5],["ArrowRight",slowMove?1:5,0]]){
                    if((game.value.keys.checkPressed(i[0])&&!slowMove)||(game.value.keys.checkClicked(i[0])&&slowMove)){
                        game.value.objectsDEV.elements[game.value.index].x+=i[1];
                        game.value.objectsDEV.elements[game.value.index].y+=i[2];
                    }
                }
                for(let i of [["q",-5,0],["z",0,-5],["s",0,5],["d",5,0]]){
                    if(game.value.keys.checkPressed(i[0])){
                        eventvar.mother.camera.cameraX+=i[1];
                        eventvar.mother.camera.cameraY+=i[2];
                    }
                }
                if(game.value.keys.checkClicked("x")){
                    const newItem=new UHGDK.animatedImage(
                        game.value.objectsDEV.elements[game.value.index].spritesheet,
                        game.value.objectsDEV.elements[game.value.index].x,
                        game.value.objectsDEV.elements[game.value.index].y,
                        game.value.objectsDEV.elements[game.value.index].imageCoords,
                        game.value.objectsDEV.elements[game.value.index].imageCoordsIndex,
                        game.value.objectsDEV.elements[game.value.index].animationSpeed,
                        game.value.objectsDEV.elements[game.value.index].idList,
                        game.value.objectsDEV.elements[game.value.index].eventIDs
                    )
                    newItem.layer=0
                    for(let i=game.value.getInstanceByID("mainMap")[0].elements.length-1;i>=0;i--){
                        const testedItem=game.value.getInstanceByID("mainMap")[0].elements[i]
                        if(UHGDK.detectInbound(newItem,testedItem.x,testedItem.y,testedItem.imageCoords[testedItem.imageCoordsIndex][2],testedItem.imageCoords[testedItem.imageCoordsIndex][3])){
                            newItem.layer=game.value.getInstanceByID("mainMap")[0].elements[i].layer+1
                            break;
                        }
                    }
                    if(newItem.layer>higherLayer)higherLayer=newItem.layer
                    game.value.addItem(newItem,game.value.getInstanceByID("mainMap")[0]) 
                }
                if(game.value.keys.checkClicked("a") && game.value.index>0){
                    game.value.index-=1
                }
                if(game.value.keys.checkClicked("e") && game.value.index<game.value.objectsDEV.elements.length-1){
                    game.value.index+=1
                }
                eventvar.mother.camera.showItem(game.value.objectsDEV.elements[game.value.index]);
            }
        },0,2,1,true))
        const coords=ref(document.getElementById("gameScreen").getBoundingClientRect());
        document.getElementById("gameScreen").appendChild(game.value.HTMLCanvas);
        await game.value.gameLoop();
        const resize = () => {
            const rect = document.getElementById("gameScreen").getBoundingClientRect();
            game.value.HTMLCanvas.width = rect.width;
            game.value.HTMLCanvas.height = rect.height;
        };
        resize();
        window.addEventListener('resize', resize);
        game.value.addItem(new UHGDK.itemHandler([],["mainMap"],["mainMapScript"]))
        game.value.getInstanceByID("mainMap")[0].debug=false;
        ready.value=true
    })
    let a=[]
    /*
        functionalitites to add:
            -gestion avancée des itemHandlers(possibilité d'ajout de plusieurs itemHandlers par scène, sauvegarde des itemHandlers(métadonnées et contenu))
    */
</script>

<style scoped>
    #interface{
        width: 100vw;
        height: 100vh;
        display: grid;
        grid-template-columns: repeat(5,20%);
        grid-template-rows: repeat(5,20%);
        background-color: rgb(30, 30, 30);
    }
    #gameScreen{
        grid-column: 1/4;
        grid-row: 1/-1;
        width: 100%;
        height: 100%;
        display: block;
    }
    #avaliableItems{
        grid-column: 4/-1;
        grid-row: 1/-2;
        border-bottom: 2px solid var(--borderColor);
        display: flex;
        flex-direction: column;
        list-style: none;
        color: white;
        font-family: "arial";
        border-left: 2px solid var(--borderColor);
        border-right: 2px solid var(--borderColor);
        width: 100%;
        height: 100%;
        overflow-y: auto;
    }

    #avaliableItems #addItem{
        background-color: transparent;
        border: 0px;
        border-top: 2px solid var(--borderColor);
        padding-bottom: 10px;
        padding-top: 10px;
        width: 100%;
        color: white;
    }

    #avaliableItemsSection{
        text-align: center;
        border-bottom: 2px solid var(--borderColor);
        padding-top: 5px;
        padding-bottom: 5px;
    }

    #avaliableItems ul{
        width: 100%;
        height: 100%;
        overflow-y: auto;
    }    

    #buttons{
        grid-column: 4/-1;
        grid-row: -1/-2;
        border-left: 2px solid var(--borderColor);
        display: flex;
        flex-direction: column;
    }

    #buttons button{
        background-color: transparent;
        border: 0px;
        border-bottom: 2px solid var(--borderColor);
        padding-bottom: 10px;
        padding-top: 10px;
        width: 100%;
        color: white;
    }

    button{
        color: white;
    }

    #avaliableItems ul li p{
        padding-top: 5px;
        padding-bottom: 5px;
    }
    #avaliableItems ul li{
        border-bottom: 2px solid var(--borderColor);
        display: flex;
        justify-content: space-between;
    }

    #avaliableItems ul li button{
        height: 30px;
        width: 60px;
        border: 0px;
        background-color: transparent;
        border-left: 2px solid var(--borderColor);
    } 

    #createObjectForm{
        grid-column: 2/-2;
        grid-row: 2/-2;
        border: 2px solid var(--borderColor);
        border-radius: 5px;
        background-color: rgb(30, 30, 30);
        display: flex;
        flex-direction: column;
        color: white;
        font-family: "arial";
    }

    #createObjectForm p{
        text-align: center;
        padding-top: 5px;
        padding-bottom: 5px;
        border-bottom: 2px solid var(--borderColor);
    }

    .field{
        display: flex;
        flex-direction: column;
        padding-left: 10%;
        padding-right: 10%;
    }

    .field input{
        background-color: var(--inputBackgroundColor);
        border: 2px solid var(--borderColor);
        border-radius: 5px;
        height: 17px;
        color: white;
    }

    #fields{
        padding-top: 20px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        overflow-y: auto;
        padding-bottom: 20px;
    }

    #fields button{
        border: 2px solid var(--borderColor);
        background-color: rgb(51, 51, 51);
        margin-left: 10%;
        margin-right: 10%;
        border-radius: 5px;
    }

    #saveForm,#loadForm{
        grid-column: 2/-2;
        grid-row: 3/-3;
        border: 2px solid var(--borderColor);
        background-color: rgb(30, 30, 30);
        border-radius: 5px;
        font-family: "arial";
        display: flex;
        flex-direction: column;
        color: white;
        font-family: "arial";
    }

    #saveForm p,#loadForm p{
        border-bottom: 2px solid var(--borderColor);
        padding-top: 5px;
        padding-bottom: 5px;
        text-align: center;
    }

</style>