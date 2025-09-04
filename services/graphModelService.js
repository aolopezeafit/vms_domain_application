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
    let obj = {
        name: graphModel.name,
        nodes: [],
        edges: []
    };

    for (let m = 0; m < graphModel.elements.length; m++) {
        let element = graphModel.elements[m];
        if (element.type == "Node") {
            let tag = null;
            let propertyTag=projectUtils.findElementProperty(element, "Tag");
            if (propertyTag) {
                tag=propertyTag.value;
            }
            let node = {
                id: element.id,
                name: element.name,
                tag: tag
            }
            obj.nodes.push(node);
        }
    }

    for (let r = 0; r < graphModel.relationships.length; r++) {
        const relationship = graphModel.relationships[r];
        let edge = {
            sourceNodeId: relationship.sourceId,
            targetNodeId: relationship.targetId,
            weight:0
        }
        for (let index = 0; index < relationship.properties.length; index++) {
            const property = relationship.properties[index];
            if(property.name=="Weight"){
                edge.weight=parseFloat(property.value);
                break;
            }
        }
        obj.edges.push(edge);
    }

    return JSON.stringify(obj, null, 2);
}

module.exports = { generateJSON };