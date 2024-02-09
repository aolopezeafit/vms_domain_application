var projectUtils = require('../utils/projectUtils');
var graphModelUtils = require('../utils/graphModelUtils');
var textUtils = require('../utils/textUtils');

async function generateJSON(req) {
    let project = req.body.data.project;
    let modelId = req.body.data.modelSelectedId;
    let graphModel = projectUtils.findModel(project, modelId); 
    if (!graphModel) {
        return null;
    } 
    let obj={
        name: graphModel.name,
        nodes:[],
        edges:[]
    }; 

    for (let m = 0; m < graphModel.elements.length; m++) {
        let element = graphModel.elements[m]; 
        if (element.type == "Node") {
            let node={
                id:element.id,
                name:element.name
            } 
            obj.nodes.push(node);
        }
    }

     for (let r = 0; r < graphModel.relationships.length; r++) {
        const relationship = graphModel.relationships[r];
        let edge={
            sourceNodeId:relationship.sourceId,
            targetNodeId:relationship.targetId
        } 
        obj.edges.push(edge); 
    }
 
    return JSON.stringify(obj, null, 2);  
} 
 
module.exports = { generateJSON };