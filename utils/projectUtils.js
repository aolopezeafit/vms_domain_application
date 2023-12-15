function findModel(project, modelId){
    var domain ='';
    let model = null;
    for (let p = 0; p < project.productLines.length; p++) {
        const productLine = project.productLines[p];
        for (let m = 0; m < productLine.domainEngineering.models.length; m++) {
            let plmodel = productLine.domainEngineering.models[m];
            //console.log(plmodel.id)
            if (plmodel.id == modelId) {
                model = plmodel;
                m = productLine.domainEngineering.models.length;
                p = project.productLines.length;
                domain= productLine.domain;
                console.log(domain)
            }
        }
    }
    return model;
}
function findApplicationModel(project, modelId){
    var domain ='';
    let model = null;
    for (let p = 0; p < project.productLines.length; p++) {
        const productLine = project.productLines[p];
        productLine.applicationEngineering.applications.forEach(application => {
            for (let m = 0; m < application.models.length; m++) {
                let plmodel = application.models[m];
                if (plmodel.id == modelId) {
                    model = plmodel;
                    m = application.models.length;
                    p = project.productLines.length;
                    pl=productLine;
                    domain= productLine.domain;
                    console.log(domain)
                }
            }
            
        });
    }
    return model;
}
function findApplicationId(project, modelId){
    var domain ='';
    let appId = null;
    for (let p = 0; p < project.productLines.length; p++) {
        const productLine = project.productLines[p];
        productLine.applicationEngineering.applications.forEach(application => {
            for (let m = 0; m < application.models.length; m++) {
                let plmodel = application.models[m];
                if (plmodel.id == modelId) {
                    appId = application.id;
                    m = application.models.length;
                    p = project.productLines.length;
                    pl=productLine;
                    domain= productLine.domain;
                    console.log(domain)
                }
            }
            
        });
    }
    return appId;
}
function findModelByType(project, modelType){
  
    let model = null;
    let count=0;
    for (let p = 0; p < project.productLines.length; p++) {
        const productLine = project.productLines[p];
        productLine.applicationEngineering.applications.forEach(application => {
            for (let m = 0; m < application.models.length; m++) {
                let plmodel = application.models[m];
                if (plmodel.type == modelType) {
                    count=count+1;
                    model = plmodel;
                    //m = application.models.length;
                    //p = project.productLines.length;
                    //pl=productLine;
                    //console.log(domain)
                    
                }
            }
            
        });
    }
    console.log(count)
    if(count>1) throw "You can have a maximum of one "+modelType;
    return model;
}
function findModelElement(model, elementId){
    for (let e = 0; e < model.elements.length; e++) {
        const element = model.elements[e];
        if (element.id == elementId) {
            return element;
        }
    }
    return null;
}

function removeModelElement(model, elementId){
    for (let e = 0; e < model.elements.length; e++) {
        const element = model.elements[e];
        if (element.id == elementId) {
            model.elements.splice(e, 1);
            break;
        }
    }
    for (let r = 0; r < model.relationships.length; r++) {
        const relationship = model.relationships[r];
        if (relationship.sourceId == elementId || relationship.targetId == elementId) {
            model.relationships.splice(r, 1); 
        }
    }
}

function findElementProperty(element, propertyName){  
    for (let m = 0; m < element.properties.length; m++) {
        let property = element.properties[m]; 
        if (property.name == propertyName) {
            return property;
        }
    }
    return null;
}

//export methods
module.exports = { findModel, findModelElement, removeModelElement, findElementProperty , findApplicationModel, findApplicationId, findModelByType};