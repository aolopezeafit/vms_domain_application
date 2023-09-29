var projectUtils = require('../utils/projectUtils');
var featuresModelUtils = require('../utils/featuresModelUtils');
var textUtils = require('../utils/textUtils');

async function generateFeaturesModel(req) {
    let project = req.body.data.project;
    let modelId = req.body.data.modelSelectedId;
    let domainRequirementsModel = projectUtils.findModel(project, modelId);
    if (!domainRequirementsModel) {
        return project;
    }

    let fw = 100;
    let fh = 66;
    let fy = 80;
    let fdx = 25;
    let fdy = 100;
    let fi=0

    let dicRequirementFeature=[];
    let requirementsOfAttributes=[];

    for (let r = 0; r < domainRequirementsModel.relationships.length; r++) {
        const relationship = domainRequirementsModel.relationships[r];
        if (relationship.type=="FunctionalRequirement_FunctionalRequirement") {
            let type=projectUtils.findElementProperty(relationship, "Type").value;
            if (type=="Refinement") {
                let requirement=projectUtils.findModelElement(domainRequirementsModel, relationship.sourceId);
                if (requirement.type == "FunctionalRequirement") {
                    let description= projectUtils.findElementProperty(requirement, "Description").value; 
                    let words=textUtils.getTextBetweenWords(description, "The", "attribute");
                    if (words.length==1) {
                        requirementsOfAttributes.push(requirement);
                    } 
                }
            }
        }
    }

    let rootRequirementId=null;
    
    let featuresModel = featuresModelUtils.createFeatureModel("Features extended");
    let rootFeature = featuresModelUtils.createRootFeature("Root feature", 520, fy, fw, fh);
    for (let m = 0; m < domainRequirementsModel.elements.length; m++) {
        let element = domainRequirementsModel.elements[m];
        if (element.type == "FunctionalRequirement" && !requirementsOfAttributes.includes(element)) {
            let identifier= projectUtils.findElementProperty(element, "Identifier").value;
            if (identifier=="FR0") {
                rootRequirementId=element.id;
                rootFeature = featuresModelUtils.createRootFeature(element.name, 520, fy, fw, fh);
                dicRequirementFeature[element.id]=rootFeature;
            }
        }
    }
    featuresModel.elements.push(rootFeature);
  
    for (let m = 0; m < domainRequirementsModel.elements.length; m++) {
        let element = domainRequirementsModel.elements[m];
        if (element.id==rootRequirementId) {
            continue;
        }
        if (element.type == "FunctionalRequirement" && !requirementsOfAttributes.includes(element)) {
            let description= projectUtils.findElementProperty(element, "Description").value;
            let type="Optional";
            if (description.startsWith("All ")) {
                type="Mandatory";
            } 
            let feature = featuresModelUtils.createConcreteFeature(element.name, (fi * (fw + fdx)) + fdx , fy + fh + fdy, fw, fh);
            featuresModel.elements.push(feature);
            let relationship=featuresModelUtils.createRelationshipFeature_Feature(rootFeature, feature, type);
            featuresModel.relationships.push(relationship);
            dicRequirementFeature[element.id]=feature;
            fi++;
        }
    }

    for (let r = 0; r < domainRequirementsModel.relationships.length; r++) {
        const relationship = domainRequirementsModel.relationships[r];
        if (relationship.type=="FunctionalRequirement_FunctionalRequirement") {
            let type=projectUtils.findElementProperty(relationship, "Type").value;
            if (type=="Dependency") {
                let sourceFeature=dicRequirementFeature[relationship.sourceId];
                let targetFeature=dicRequirementFeature[relationship.targetId]; 
                let includesRelationship=featuresModelUtils.createRelationshipFeature_Feature(sourceFeature, targetFeature, "Includes");
                featuresModel.relationships.push(includesRelationship);
            } 
        }
    }

    for (let r = 0; r < domainRequirementsModel.relationships.length; r++) {
        const relationship = domainRequirementsModel.relationships[r];
        if (relationship.type=="FunctionalRequirement_FunctionalRequirement") {
            let type=projectUtils.findElementProperty(relationship, "Type").value;
            if (type=="Refinement") {
                let requirement=projectUtils.findModelElement(domainRequirementsModel, relationship.sourceId);
                let description= projectUtils.findElementProperty(requirement, "Description").value; 
                let words=textUtils.getTextBetweenWords(description, "The", "attribute");
                if (words.length==1) {
                    let attribute=words[0];
                    let attributeType="String";
                    let possibleValues=null;
                    words=textUtils.getTextBetweenWords(description, "options", "end"); 
                    if (words.length==1) {
                        attributeType="String";
                        possibleValues=words[0];
                    }
                    let targetFeature=dicRequirementFeature[relationship.targetId]; 
                    let property=featuresModelUtils.createProperty(attribute, attributeType, null, possibleValues);
                    targetFeature.properties.push(property); 
                } 
            }
        }
    }

    project.productLines[0].domainEngineering.models.push(featuresModel);
    return project;
}



//borrar esto 
async function createRelatedRequirements(model, parentRequirement, domain) {
    let x = parentRequirement.x; //position x on the diagram
    let y = parentRequirement.y; //position x on the diagram
    let w = parentRequirement.width; //width on the diagram
    let h = parentRequirement.height; //height on the diagram
    let dy = h + 50;
    let dx = - (w + 50);
    console.log("here")
    var reqs = await addReq.additionalRequirementsSuggest({ "body": { "input": parentRequirement.properties.find(prop => prop.name === "Description").value, "domain": domain } })
    console.log(reqs)
    for (let i = 0; i < reqs.additionalReq.length; i++) {
        let relatedRequirement = await createRelatedRequirement(parentRequirement, i, reqs.additionalReq[i]);
        if ((relatedRequirement.x + dx) >= 0) relatedRequirement.x += dx;
        else relatedRequirement.x = 0
        if ((relatedRequirement.y + dy) >= 0) relatedRequirement.y += dy;
        else relatedRequirement.y = 0

        model.elements.push(relatedRequirement);
        let relationship = createRelationship(parentRequirement, relatedRequirement);
        model.relationships.push(relationship);


        dx += w + 50;
    }

    /*  for (let i = 1; i <= 3; i++) {
          let relatedRequirement = createRelatedRequirement(parentRequirement, i);
          relatedRequirement.x += dx;
          relatedRequirement.y += dy;
          model.elements.push(relatedRequirement);
          let relationship = createRelationship(parentRequirement, relatedRequirement);
          model.relationships.push(relationship);
  
          dx += w + 50;
      } */
}

function createRelatedRequirement(parentRequirement, index, newReq) {
    let json = JSON.stringify(parentRequirement);
    let relatedRequirement = JSON.parse(json);
    relatedRequirement.id = generateUUID();
    relatedRequirement.name = "Related security requirement " + (index + 1);
    relatedRequirement.properties[0].value = parentRequirement.properties[0].value + "_" + (index + 1);
    relatedRequirement.properties.find(prop => prop.name === "Version").value = 1;
    relatedRequirement.properties.find(prop => prop.name === "Description").value = newReq.requirement;
    relatedRequirement.properties.find(prop => prop.name === "StakeholderPriority").value = newReq.priority;


    return relatedRequirement;
}

/* function createRelatedRequirement(parentRequirement, index) {
    let json = JSON.stringify(parentRequirement);
    let relatedRequirement = JSON.parse(json);
    relatedRequirement.id = generateUUID();
    relatedRequirement.name = "Related requirement " + index;
    relatedRequirement.properties[0].value = parentRequirement.properties[0].value + "_" + index;
    relatedRequirement.properties[2].value = "The system must ... " + index;

    return relatedRequirement;
}
 */
function createRelationship(parentRequirement, relatedRequirement) {
    let relationship = {
        id: generateUUID(),
        name: "-",
        type: "SecurityRequirement_SecurityRequirement",
        sourceId: relatedRequirement.id,
        targetId: parentRequirement.id,
        min: 0,
        max: 99999,
        points: [],
        properties: [{
            id: generateUUID,
            name: "Type",
            value: "Refinement",
            type: "String",
            custom: false,
            display: true,
            possibleValues: "Generalization,Refinement,Evolution,Interactivity,Overlap,Conflicting,Rationalization,Contribution"
        }]
    }
    return relationship;
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
module.exports = { generateFeaturesModel };