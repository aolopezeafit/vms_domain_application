var projectUtils = require('../utils/projectUtils');
var serenaModelUtils = require('../utils/SerenaModelUtils');
var textUtils = require('../utils/textUtils');
var modelUtils = require('../utils/modelUtils');

async function generateApplicationFromFeatureModel(req) {
    let project = req.body.data.project;
    let modelId = req.body.data.modelSelectedId;
    let productLine = projectUtils.findProductLine(project, modelId);
    let suffix=1; 
    while (true) {
       let application=projectUtils.findApplicationByName(project, "Application " + suffix);
       if (!application) {
         break;
       }else{
         suffix+=1;
       }
    }
    let applicationName="Application " + suffix;
    let application = projectUtils.createApplication(applicationName);
    productLine.applicationEngineering.applications.push(application);

    let fm = projectUtils.findModel(project, modelId);
    let fmApplication = createApplicationFeatureModel(fm);
    application.models.push(fmApplication);
    return project;
}

function createApplicationFeatureModel(domainFeatureModel) {
    let applicationFeatureModel = modelUtils.cloneModel(domainFeatureModel);
    applicationFeatureModel.name = "Application feature tree";
    applicationFeatureModel.type = "Application feature tree";
    applicationFeatureModel.id = generateId();
    applicationFeatureModel.sourceModelIds=[domainFeatureModel.id];
    let dicElements = [];
    for (let e = applicationFeatureModel.elements.length - 1; e >= 0; e--) {
        const element = applicationFeatureModel.elements[e];
        element.sourceModelElements=[
            {
                modelId: domainFeatureModel.id,
                elementId: element.id
            }
        ]
        for (let p = 0; p < element.properties.length; p++) {
            const property = element.properties[p];
            if (property.name == "Selected") {
                if (property.value == "Selected" || property.value == "SelectedForced") {
                    element.properties.splice(p, 1);
                    dicElements[element.id] = element.type;
                } else {
                    applicationFeatureModel.elements.splice(e, 1);
                    break;
                }
            }
        }
    }
    for (let e = applicationFeatureModel.elements.length - 1; e >= 0; e--) {
        const element = applicationFeatureModel.elements[e];
        for (let p = 0; p < element.properties.length; p++) {
            const property = element.properties[p];
            if (property.possibleValues && property.possibleValues != "") {
                if (property.constraint && property.constraint != "") {
                    property.constraint = "";
                    if (property.value == "Undefined") {
                        property.possibleValues = '';
                    } else {
                        let newPossibleValues = property.value.join(',');
                        property.possibleValues = newPossibleValues;
                        property.value = "Undefined";
                    }
                } else {
                    if (property.value == "Undefined") {
                        property.possibleValues = '';
                    } else {
                        let newPossibleValues = property.value;
                        property.possibleValues = newPossibleValues;
                    }
                }
            }
        }
    }
    for (let e = applicationFeatureModel.relationships.length - 1; e >= 0; e--) {
        const relationship = applicationFeatureModel.relationships[e];
        for (let p = relationship.properties.length - 1; p >= 0; p--) {
            const property = relationship.properties[p];
            if (["Type"].includes(property.name)) {
                if (["Undefined", "Includes", "Excludes"].includes(property.value)) {
                    applicationFeatureModel.relationships.splice(e, 1);
                }
            }
            if (["Type", "Constraint", "MaxValue", "MinValue"].includes(property.name)) {
                relationship.properties.splice(p, 1);
            }
        }
    }

    for (let e = applicationFeatureModel.elements.length - 1; e >= 0; e--) {
        const element = applicationFeatureModel.elements[e];
        if (element.type == "Bundle") {
            let sourceId;
            for (let r = applicationFeatureModel.relationships.length - 1; r >= 0; r--) {
                const relationship = applicationFeatureModel.relationships[r];
                if (relationship.targetId == element.id) {
                    sourceId = relationship.sourceId;
                    break;
                }
            }
            for (let r = applicationFeatureModel.relationships.length - 1; r >= 0; r--) {
                const relationship = applicationFeatureModel.relationships[r];
                if (relationship.sourceId == element.id) {
                    relationship.sourceId = sourceId;
                    relationship.type = dicElements[relationship.sourceId] + "_Feature";
                }
            }
            applicationFeatureModel.elements.splice(e, 1);
        }
    }



    return applicationFeatureModel;
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
module.exports = { generateApplicationFromFeatureModel };