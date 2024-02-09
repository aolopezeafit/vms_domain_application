function generateJson(graphModel) {   
        if (!graphModel) {
            return null;
        } 
        let obj={};
        obj.name=graphModel.name; 
        return JSON.stringify(obj); 
} 

//export methods
module.exports = {
    generateJson
};