var projectUtils = require('../utils/projectUtils');
var serenaModelUtils = require('../utils/SerenaModelUtils');
var textUtils = require('../utils/textUtils');
var modelUtils = require('../utils/modelUtils');

async function generateFeatureComponentBindingModelFromFeatureModelWithoutAttributes(req) {
    return generateFeatureComponentBindingModelFromFeatureModel(req);
}

async function generateFeatureComponentBindingModelFromFeatureModel(req) {
    let project = req.body.data.project;
    let modelId = req.body.data.modelSelectedId;
    let productLine = projectUtils.findProductLine(project, modelId);

    let featureModel = projectUtils.findModel(project, modelId);
    let componentModel = projectUtils.findDomainModelByType(productLine, "Domain component model");
    let softGoalModel = projectUtils.findDomainModelByType(productLine, "SoftGoal model");
    let featureOperationalizationModel = createFeatureOperationalizationModel(featureModel, componentModel, softGoalModel);
    createFeatureOperationalizationModelElements(featureOperationalizationModel, featureModel, componentModel, softGoalModel);

    productLine.domainEngineering.models.push(featureOperationalizationModel);
    return project;
}

function createFeatureOperationalizationModel(featureModel, componentModel, softGoalModel) {
    let model = {};
    model.name = "Feature operationalization";
    model.type = "Feature operationalization";
    model.id = generateId();
    model.sourceModelIds = [featureModel.id, componentModel.id, softGoalModel.id];
    model.elements = [];
    model.relationships = [];
    return model;
}

function createFeatureOperationalizationModelElements(featureOperationalizationModel, featureModel, componentModel, softGoalModel) {
    let x = 50;
    let y = 50;
    let dy = 60;
    let features = getFeatures(featureModel);
    for (let e = features.length - 1; e >= 0; e--) {
        let feature = features[e];

        let goal = {
            id: generateId(),
            type: "Goal",
            name: feature.name,
            x: x,
            y: y,
            width: 100,
            height: 50,
            parentId: null,
            instanceOfId: null,
            properties: [],
            sourceModelElements: [{
                modelId: featureModel.id,
                elementId: feature.id
            }]
        }

        let bundle = {
            id: generateId(),
            type: "Bundle",
            name: "Bundle " + feature.name,
            x: x + 150,
            y: y,
            width: 50,
            height: 50,
            parentId: null,
            instanceOfId: null,
            properties: [{
                id: generateId(),
                name: "Type",
                value: "Range",
                type: "String",
                options: "Range,And,Or,Xor",
                custom: false,
                display: true,
                possibleValues: "Range,And,Or,Xor",
                defaultValue: "Range"

            },
            {
                id: generateId(),
                name: "RangeMin",
                value: "1",
                type: "String",
                custom: false,
                display: true,
                linked_property: "Type",
                linked_value: "Range",
                defaultValue: "1"

            },
            {
                id: generateId(),
                name: "RangeMax",
                value: "1",
                type: "String",
                custom: false,
                display: true,
                linked_property: "Type",
                linked_value: "Range",
                defaultValue: "1"

            }],
            sourceModelElements: []
        }

        let relationship = {
            id: generateId(),
            type: "Goal_Bundle",
            name: goal.name + '_' + bundle.name,
            sourceId: goal.id,
            targetId: bundle.id,
            points: [],
            min: 0,
            max: 999999,
            properties: [],
        }

        y += dy;

        featureOperationalizationModel.elements.push(goal);
        featureOperationalizationModel.elements.push(bundle);

        featureOperationalizationModel.relationships.push(relationship);


        // let property={
        //     name: 'Core',
        //     value: true,
        //     custom: false,
        //     visible: false
        // }
        // element.properties.push(property);
    }

    x = 250;
    y = 50;
    dy = 60;

    let components = getDomainComponents(componentModel)
    for (let e = components.length - 1; e >= 0; e--) {
        const componentModelElement = components[e];

        // let bind = {
        //     id: generateId(),
        //     type: "Bind",
        //     name: "Bind_" + componentModelElement.name,
        //     x: x,
        //     y: y,
        //     width: 33,
        //     height: 33,
        //     parentId: null,
        //     instanceOfId: null,
        //     properties: [{
        //         id: generateId(),
        //         name: "Selected",
        //         value: "Undefined",
        //         type: "String",
        //         options: "Undefined,Selected,Unselected",
        //         custom: false,
        //         display: true,
        //         possibleValues: "Undefined,Selected,Unselected",
        //         defaultValue: "Undefined"

        //     }],
        //     sourceModelElements: []
        // }

        let component = {
            id: generateId(),
            type: componentModelElement.type,
            name: componentModelElement.name,
            x: x + 150,
            y: y,
            width: 200,
            height: 50,
            parentId: null,
            instanceOfId: null,
            properties: [],
            sourceModelElements: [{
                modelId: componentModel.id,
                elementId: componentModelElement.id
            }]
        }

        // let relationship = {
        //     id: generateId(),
        //     type: "Bind_Component",
        //     name: bind.name + '_' + component.name,
        //     sourceId: bind.id,
        //     targetId: component.id,
        //     points: [],
        //     min: 0,
        //     max: 999999,
        //     properties: [],
        // }

        y += dy;

        // featureOperationalizationModel.elements.push(bind);
        featureOperationalizationModel.elements.push(component);
        // featureOperationalizationModel.relationships.push(relationship);
    }



    x = 750;
    y = 50;
    dy = 90;

    let softGoals = getSoftGoals(softGoalModel);
    for (let e = softGoals.length - 1; e >= 0; e--) {
        const softGoalParent = softGoals[e];

        let claim = {
            id: generateId(),
            type: "Claim",
            name: "C" + e,
            x: x,
            y: y,
            width: 100,
            height: 50,
            parentId: null,
            instanceOfId: null,
            properties: [],
            sourceModelElements: []
        }

        let softGoal = {
            id: generateId(),
            type: "SoftGoal",
            name: softGoalParent.name,
            x: x + 150,
            y: y,
            width: 100,
            height: 50,
            parentId: null,
            instanceOfId: null,
            properties: [],
            sourceModelElements: [{
                modelId: softGoalModel.id,
                elementId: softGoalParent.id
            }]
        }

        let relationship = {
            id: generateId(),
            type: "Claim_SoftGoal",
            name: claim.name + '_' + softGoal.name,
            sourceId: claim.id,
            targetId: softGoal.id,
            points: [],
            min: 0,
            max: 999999,
            properties: [],
        }

        y += dy;

        featureOperationalizationModel.elements.push(claim);
        featureOperationalizationModel.elements.push(softGoal);
        featureOperationalizationModel.relationships.push(relationship);
    }
}

function getFeatures(featureModel) {
    let ret = [];
    let dicRelationships = [];
    for (let r = 0; r < featureModel.relationships.length; r++) {
        const relationship = featureModel.relationships[r];
        if ((["ConcreteFeature_Bundle", "ConcreteFeature_Feature"].includes(relationship.type))) {
            dicRelationships.push(relationship.sourceId);
        }
    }
    for (let e = featureModel.elements.length - 1; e >= 0; e--) {
        const element = featureModel.elements[e];
        if ((["ConcreteFeature"].includes(element.type))) {
            if (!dicRelationships.includes(element.id)) {
                ret.push(element);
            }
        }
    }
    return ret;
}

function getDomainComponents(componentModel) {
    let ret = [];
    for (let e = componentModel.elements.length - 1; e >= 0; e--) {
        const element = componentModel.elements[e];
        if (!(["Component", "AIComponent", "AIMonitorComponent", "AIUpdaterComponent"].includes(element.type))) {
            continue;
        }
        ret.push(element);
    }
    return ret;
}

function getSoftGoals(softGoalModel) {
    let ret = [];
    let dicRelationships = [];
    for (let r = 0; r < softGoalModel.relationships.length; r++) {
        const relationship = softGoalModel.relationships[r];
        if ((["SoftGoal_SoftGoal"].includes(relationship.type))) {
            dicRelationships.push(relationship.targetId);
        }
    }
    for (let e = softGoalModel.elements.length - 1; e >= 0; e--) {
        const element = softGoalModel.elements[e];
        if ((["SoftGoal"].includes(element.type))) {
            if (!dicRelationships.includes(element.id)) {
                ret.push(element);
            }
        } 
    }
    return ret;
} 



function generateId() {
    var dt = new Date().getTime();
    var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        function (c) {
            var r = (dt + Math.random() * 16) % 16 | 0;
            dt = Math.floor(dt / 16);
            return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
        }
    );
    return uuid;
}

//export methods
module.exports = { generateFeatureComponentBindingModelFromFeatureModel, generateFeatureComponentBindingModelFromFeatureModelWithoutAttributes };