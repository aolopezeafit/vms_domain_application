var addReq=require ("./additionalRequirements");
async function suggest(req) {
    let project = req.body.data.project;
    let modelId = req.body.data.modelSelectedId;
   // console.log(modelId)
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
    

    if (!model) {
        return project;
    }

    for (let i = 0; i < req.body.data.selectedElementsIds.length; i++) {
        let selectedElementId = req.body.data.selectedElementsIds[i];
        for (let m = 0; m < model.elements.length; m++) {
            let element = model.elements[m];
           // console.log(selectedElementId)
            if (element.id == selectedElementId) {
                let parentRequirement = element;
               
                await createRelatedRequirements(model, parentRequirement,domain);
                console.log(model)
                break;
            }
        }
    }
 
    return project;
}

async function createRelatedRequirements(model, parentRequirement,domain) {
    let x = parentRequirement.x; //position x on the diagram
    let y = parentRequirement.y; //position x on the diagram
    let w = parentRequirement.width; //width on the diagram
    let h = parentRequirement.height; //height on the diagram
    let dy = h + 50;
    let dx = - (w + 50);
    console.log("here")
    var reqs=await addReq.additionalRequirementsSuggest({"body":{"input":parentRequirement.properties.find(prop => prop.name === "Description").value,"domain":domain}})
    console.log(reqs)
    for (let i=0;i<reqs.additionalReq.length;i++){
        let relatedRequirement = await createRelatedRequirement(parentRequirement, i, reqs.additionalReq[i]);
        if((relatedRequirement.x+dx)>=0) relatedRequirement.x += dx;
        else relatedRequirement.x=0
        if((relatedRequirement.y+dy)>=0) relatedRequirement.y += dy;
        else relatedRequirement.y=0
        
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
    relatedRequirement.name = "Related security requirement " + (index+1);
    relatedRequirement.properties[0].value = parentRequirement.properties[0].value + "_" + (index+1);
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
        properties: [{id: generateUUID,
        name:"Type",
        value:"Refinement",
        type:"String",
        custom: false,
        display: true,
        possibleValues:"Generalization,Refinement,Evolution,Interactivity,Overlap,Conflicting,Rationalization,Contribution"
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
module.exports = { suggest };