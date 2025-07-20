import {createRouter,createWebHistory} from "vue-router";
import home from "./vues/home.vue";
import project from "./vues/project.vue";

const router=createRouter({
    routes:[
        {path:"/home",component:home,name:"home"},
        {path:"/project",component:project,name:"project"}
    ],
    history:createWebHistory()
});

export default router;