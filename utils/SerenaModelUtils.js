function createSERENAModel(name) {
    let model = {
        id: generateUUID(),
        name: name,
        type: 'SERENA',
        elements: [],
        relationships: []
    }
    return model;
}
function createCriteriaModel(name) {
    let model = {
        id: generateUUID(),
        name: name,
        type: 'SERENACriteriaModel',
        elements: [],
        relationships: [],
        constraints:''
    }
    return model;
}
function createRiskModel(name) {
    let model = {
        id: generateUUID(),
        name: name,
        type: 'SERENARiskModel',
        elements: [],
        relationships: [],
        constraints:''
    }
    return model;
}

function createTreatmentModel(name) {
    let model = {
        id: generateUUID(),
        name: name,
        type: 'SERENATreatmentModel',
        elements: [],
        relationships: [],
        constraints:''
    }
    return model;
}
function createGoalModel(name) {
    let model = {
        id: generateUUID(),
        name: name,
        type: 'SERENAGoalModel',
        elements: [],
        relationships: [],
        constraints:''
    }
    return model;
}
function createGoal(name, x, y, w, h) {
    let goal = createElement("Goal", name, x, y, w, h);
    return goal;
}

function createAsset(name, x, y, w, h) {
    let asset = createElement("Asset", name, x, y, w, h);
    return asset;
}

function createClaim(name, x, y, w, h) {
    let claim = createElement("Claim", name, x, y, w, h);
    return claim;
}
function createSecurityClaim(name, x, y, w, h) {
    let claim = createElement("SecurityClaim", name, x, y, w, h);
    return claim;
}
function createThreat(name, x, y, w, h) {
    let threat = createElement("Threat", name, x, y, w, h);
    return threat;
}
function createContext(name, x, y, w, h) {
    let context = createElement("Context", name, x, y, w, h);
    return context;
}
function createSoftGoal(name, x, y, w, h) {
    let softGoal = createElement("SoftGoal", name, x, y, w, h);
    return softGoal;
}
function createCardinality(name, x, y, w, h) {
    let cardinality = createElement("Cardinality", name, x, y, w, h);
    return cardinality;
}
function createSoftInfluence(name, x, y, w, h) {
    let softInfluence = createElement("SoftInfluence", name, x, y, w, h);
    return softInfluence;
}
function createVulnerability(name, x, y, w, h) {
    let vulnerability = createElement("Vulnerability", name, x, y, w, h);
    return vulnerability;
}
function createContextVariable(name, x, y, w, h) {
    let contextVariable = createElement("ContextVariable", name, x, y, w, h);
    return contextVariable;
}
function createSecurityMechanism(name, x, y, w, h) {
    let securityMechanism = createElement("SecurityMechanism", name, x, y, w, h);
    return securityMechanism;
}

function createOperationalization(name, x, y, w, h) {
    let operationalization = createElement("Operationalization", name, x, y, w, h);
    return operationalization;
}
function createOperationalization(name, x, y, w, h) {
    let operationalization = createElement("Operationalization", name, x, y, w, h);
    return operationalization;
}
function createDataCollectionGroup(name, x, y, w, h) {
    let dataCollectionGroup = createElement("DataCollectionGroup", name, x, y, w, h);
    return dataCollectionGroup;
}
function createDataCollectionPoint(name, x, y, w, h) {
    let dataCollectionPoint = createElement("DataCollectionPoint", name, x, y, w, h);
    return dataCollectionPoint;
}


function createElement(type, name, x, y, w, h) {
    let element = {
        "id": generateUUID(),
        "name": name,
        "type": type,
        "x": x,
        "y": y,
        "width": w,
        "height": h,
        "parentId": null,
        "properties": [
           
        ]
    }
    return element;
} 

function createRelationship(source, target, type,possibleValues,name,value) {
    let relationship = {
        "id": generateUUID(),
        "type": source.type +"_"+target.type,
        "name": source.name+"_"+target.name,
        "sourceId": source.id,
        "targetId": target.id,
        "points": [],
        "min": 0,
        "max": 9999999,
        "properties": [
            {
                "id": generateUUID(),
                "name": name,
                "value": value,
                "type": type,
                "custom": false,
                "display": true,
                "possibleValues": possibleValues
            }
        ]
    }
    return relationship;
}

function createProperty(name, type, value, possibleValues){
  let property=  {
        "id": generateUUID(),
        "name": name,
        "type": type,
        "value": value,
        "options": null,
        "linked_property": null,
        "linked_value": null,
        "custom": true,
        "display": true,
        "comment": "",
        "possibleValues": possibleValues,
        "possibleValuesLinks": {},
        "minCardinality": "",
        "maxCardinality": ""
    };
    return property;
}


function generateUUID() {
    var d = new Date().getTime();//Timestamp
    var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16;//random number between 0 and 16
        if (d > 0) {//Use timestamp until depleted
            r = (d + r) % 16 | 0;
            d = Math.floor(d / 16);
        } else {//Use microseconds since page-load if supported
            r = (d2 + r) % 16 | 0;
            d2 = Math.floor(d2 / 16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

//export methods
module.exports = {
    createGoal, createAsset, createClaim, createThreat,createContext,createContextVariable,createCardinality,createOperationalization,createRelationship,
    createProperty, createSecurityMechanism,createSoftGoal,createSoftInfluence,createThreat,createVulnerability,createDataCollectionGroup,createDataCollectionPoint, createSERENAModel,createCriteriaModel,
    createRiskModel, createSecurityClaim,createTreatmentModel,createGoalModel
};