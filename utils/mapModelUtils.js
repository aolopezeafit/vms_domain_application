function createMapModel(name) {
    let model = {
        id: generateUUID(),
        name: name,
        type: 'Map',
        elements: [],
        relationships: []
    }
    return model;
}

function createStartIntention(name, x, y, w, h) { 
    let properties=[];
    let intention = createIntentionWithProperties("StartIntention", name, x, y, w, h, properties);
    return intention;
}

function createStopIntention(name, x, y, w, h) {
    let properties=[];
    let intention = createIntentionWithProperties("StopIntention", name, x, y, w, h, properties);
    return intention; 
} 

function createIntention(name, x, y, w, h) {
    let properties=[
        {
            "id": generateUUID(),
            "name": "Selected",
            "value": "Undefined",
            "type": "String",
            "custom": false,
            "display": true,
            "comment": "Selected",
            "possibleValues": "Undefined,Selected,Unselected"
        }
    ]
    let intention = createIntentionWithProperties("Intention", name, x, y, w, h, properties);
    return intention; 
} 

function createIntentionWithProperties(type, name, x, y, w, h, properties) {
    let intention = {
        "id": generateUUID(),
        "name": name,
        "type": type,
        "x": x,
        "y": y,
        "width": w,
        "height": h,
        "parentId": null,
        "properties": properties
    }
    return intention;
} 

function createRelationshipMap_Map(source, target, type) {
    let relationship = {
        "id": generateUUID(),
        "type": source.type + "_Map",
        "name": "_",
        "sourceId": source.id,
        "targetId": target.id,
        "points": [],
        "min": 0,
        "max": 9999999,
        "properties": [
            {
                "id": generateUUID(),
                "name": "Type",
                "value": type,
                "type": "String",
                "custom": false,
                "display": true,
                "possibleValues": "Mandatory,Optional,Includes,Excludes,IndividualCardinality"
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
    createMapModel, createStartIntention, createStopIntention, createIntention, createProperty,
    createRelationshipMap_Map
};