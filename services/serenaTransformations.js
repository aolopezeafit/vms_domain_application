var projectUtils = require('../utils/projectUtils');
var serenaModelUtils = require('../utils/SerenaModelUtils');
var textUtils = require('../utils/textUtils');

async function generateCriteriaModel(req) {
    
    let project = req.body.data.project;
    let modelId = req.body.data.modelSelectedId;
    let appRequirementsModel = projectUtils.findApplicationModel(project, modelId);
    
    if (!appRequirementsModel) {
        return project;
    }

    let fw = 100;
    let fh = 66;
    let fy = 80;
    let fdx = 25;
    let fdy = 100;
    let fi=0
    let criteriaModel = serenaModelUtils.createCriteriaModel('SERENACriteriaModel');
    
    let dicRequirementElement=[];
    let requirementsOfAttributes=[];

    for (let r = 0; r < appRequirementsModel.relationships.length; r++) {
        const relationship = appRequirementsModel.relationships[r];
        var sourceSecurityCriteria;
        var targetSecurityCriteria;
        if (relationship.type=="SecurityRequirement_SecurityRequirement") {
            let type=projectUtils.findElementProperty(relationship, "Type").value;
            if (type=="Refinement" || type=="Contribution" || type=="Generalization" || type=="Conflicting" || type=="Overlaping") {
                let sourcerequirement=projectUtils.findModelElement(appRequirementsModel, relationship.sourceId);
                //console.log(sourcerequirement)
                if (sourcerequirement.type == "SecurityRequirement"){
                    if(dicRequirementElement.hasOwnProperty(sourcerequirement.id)){ 
                        sourceSecurityCriteria=dicRequirementElement[sourcerequirement.id];
                     }
                    else {
                        sourceSecurityCriteria= serenaModelUtils.createSoftGoal(projectUtils.findElementProperty(sourcerequirement,"Description").metadata.secret.securityCriteria,520+(r*50),fy+(r*50),fw,fh);                       
                        sourceSecurityCriteria.metadata={'sourceRequirementId':relationship.sourceId};                       
                        criteriaModel.elements.push(sourceSecurityCriteria);
                        //requirementsOfAttributes.push(sourcerequirement);
                        dicRequirementElement[sourcerequirement.id]=sourceSecurityCriteria;
                        //console.log(sourceSecurityCriteria)
                         
                                                         
                    }
                     
                }
                let targetrequirement=projectUtils.findModelElement(appRequirementsModel, relationship.targetId);
                //console.log(targetrequirement)
                if (targetrequirement.type == "SecurityRequirement"){

                    if(dicRequirementElement.hasOwnProperty(targetrequirement.id)){
                            targetSecurityCriteria=dicRequirementElement[targetrequirement.id];
                        }
                    else {              
                        targetSecurityCriteria= serenaModelUtils.createSoftGoal(projectUtils.findElementProperty(targetrequirement,"Description").metadata.secret.securityCriteria,620+(r*50),fy+(r*50),fw,fh);
                        targetSecurityCriteria.metadata={'sourceRequirementId':relationship.targetId};
                        criteriaModel.elements.push(targetSecurityCriteria);
                        //requirementsOfAttributes.push(targetrequirement);
                        dicRequirementElement[targetrequirement.id]=targetSecurityCriteria;
                        //console.log(targetSecurityCriteria)
                    }

                 }
                if (sourcerequirement.type == "SecurityRequirement" && targetrequirement.type == "SecurityRequirement"){
                    if(type=="Refinement" || type=="Contribution"){
                        let priority=projectUtils.findElementProperty(sourcerequirement,"Description").metadata.secret.priority;
                        //console.log(priority)
                        var value;
                        if(priority=="shall") value="++";
                        else if(priority=="should") value="+";
                        else value="=";
                        let relationship=serenaModelUtils.createRelationship(sourceSecurityCriteria,targetSecurityCriteria,"String","--,-,=,+,++","Effect",value)
                        ////console.log(relationship)
                        criteriaModel.relationships.push(relationship);
                        //console.log(criteriaModel)
                    }
                    else if (type=="Generalization"){
                        let priority=projectUtils.findElementProperty(targetrequirementrequirement,"Description").metadata.secret.priority;
                        var value;
                        if(priority=="shall") value="++";
                        else if(priority=="should") value="+";
                        else value="=";
                        let relationship=serenaModelUtils.createRelationship(targetSecurityCriteria,sourceSecurityCriteria,"String","--,-,=,+,++","Effect",value)
                        criteriaModel.relationships.push(relationship);
                    }
                    else if(type=="Conflicting"){
                        let priority=projectUtils.findElementProperty(sourcerequirement,"Description").metadata.secret.priority;
                        var value;
                        if(priority=="shall") value="--";
                        else if(priority=="should") value="-";
                        else value="=";
                        let relationship=serenaModelUtils.createRelationship(sourceSecurityCriteria,targetSecurityCriteria,"String","--,-,=,+,++","Effect",value)
                        criteriaModel.relationships.push(relationship);
                    }
                    else{
                        value="=";
                        let relationship=serenaModelUtils.createRelationship(sourceSecurityCriteria,targetSecurityCriteria,"String","--,-,=,+,++","Effect",value)
                        criteriaModel.relationships.push(relationship);                   
                    }
                }
            }
        }
    }
    
    for (let e = 0; e < appRequirementsModel.elements.length; e++) {
    const element = appRequirementsModel.elements[e];
    if (element.type == "SecurityRequirement"){
        if(!dicRequirementElement.hasOwnProperty(element.id)){
            //console.log(projectUtils.findElementProperty(element,"Description").metadata.secret.securityCriteria)
            securityCriteria= serenaModelUtils.createSoftGoal(projectUtils.findElementProperty(element,"Description").metadata.secret.securityCriteria,620+(e*50),fy+(e*50),fw,fh);
            //console.log(securityCriteria);
            securityCriteria.metadata={'sourceRequirementId':element.id};
            criteriaModel.elements.push(securityCriteria);
            //console.log(criteriaModel)
            //requirementsOfAttributes.push(targetrequirement);
            dicRequirementElement[element.id]=securityCriteria;
        }

    }
    
    }
    //console.log(criteriaModel)
    //console.log(project.productLines[0].applicationEngineering.applications.find(application => {
    //    return application.id === projectUtils.findApplicationId(project,modelId)
    //  }))
    project.productLines[0].applicationEngineering.applications.find(application => {
        return application.id === projectUtils.findApplicationId(project,modelId)
      }).models.push(criteriaModel);
    return project;
}
async function generateGoalModel(req) {
    
    let project = req.body.data.project;
    let modelId = req.body.data.modelSelectedId;
    let appRequirementsModel = projectUtils.findApplicationModel(project, modelId);
    
    if (!appRequirementsModel) {
        return project;
    }
    

    let fw = 100;
    let fh = 66;
    let fy = 80;
    let fdx = 25;
    let fdy = 100;
    let fi=0;
    let goalModel = serenaModelUtils.createGoalModel('SERENAGoalModel');
    //console.log(riskModel)
    let dicRequirementElement=[];
    let requirementsOper=[];
    let i=1;
    try {
        for (let r = 0; r < appRequirementsModel.relationships.length; r++) {
            const rel = appRequirementsModel.relationships[r];
            var sourceGoal;
            var targetGoal;
            if(rel.type=="FunctionalRequirement_FunctionalRequirement"){
                let type=projectUtils.findElementProperty(rel, "Type").value;
                if(type=="Refinement" || type=="Contribution" || type=="Generalization" || type=="Dependency"){
                    let sourcerequirement=projectUtils.findModelElement(appRequirementsModel, rel.sourceId);
                    //console.log(sourcerequirement)
                    if (sourcerequirement.type == "FunctionalRequirement"){
                        if(dicRequirementElement.hasOwnProperty(sourcerequirement.id)){ 
                            sourceGoal=dicRequirementElement[sourcerequirement.id];
                         }
                        else {
                            sourceGoal= serenaModelUtils.createGoal(projectUtils.findElementProperty(sourcerequirement,"Description").metadata.secret.activity+" "+projectUtils.findElementProperty(sourcerequirement,"Description").metadata.secret.asset,520+(i*fdx),fy+(i*fdy),fw,fh);                       
                            sourceGoal.metadata={'sourceRequirementId':rel.sourceId};                       
                            goalModel.elements.push(sourceGoal);
                            //requirementsOfAttributes.push(sourcerequirement);
                            dicRequirementElement[sourcerequirement.id]=sourceGoal;
                            //console.log(sourceSecurityCriteria)
                             i++;
                                                             
                        }      
                }
                let targetrequirement=projectUtils.findModelElement(appRequirementsModel, rel.targetId);
                //console.log(targetrequirement)
                if (targetrequirement.type == "FunctionalRequirement"){

                    if(dicRequirementElement.hasOwnProperty(targetrequirement.id)){
                            targetGoal=dicRequirementElement[targetrequirement.id];
                        }
                    else {              
                        targetGoal= serenaModelUtils.createGoal(projectUtils.findElementProperty(targetrequirement,"Description").metadata.secret.activity+" "+projectUtils.findElementProperty(targetrequirement,"Description").metadata.secret.asset,620+(i*fdx),fy+(i*fdy),fw,fh);
                        targetGoal.metadata={'sourceRequirementId':rel.targetId};
                        goalModel.elements.push(targetGoal);
                        //requirementsOfAttributes.push(targetrequirement);
                        dicRequirementElement[targetrequirement.id]=targetGoal;
                        //console.log(targetSecurityCriteria)
                        i++;
                    }

                 }
                 if (sourcerequirement.type == "FunctionalRequirement" && targetrequirement.type == "FunctionalRequirement"){
                    if(type=="Refinement" || type=="Contribution" || type=="Dependency"){
                        
                        let relationship=serenaModelUtils.createRelationship(sourceGoal,targetGoal,"String","","","")
                        ////console.log(relationship)
                        goalModel.relationships.push(relationship);
                        //console.log(criteriaModel)
                    }
                    else if (type=="Generalization"){
                     
                        let relationship=serenaModelUtils.createRelationship(targetGoal,sourceGoal,"String","","","")
                        goalModel.relationships.push(relationship);
                    }
                 }
                }
            }
            else if(rel.type=="FunctionalRequirement_SecurityRequirement"){
                console.log("here")
                let type=projectUtils.findElementProperty(rel, "Type").value;
                let oper;
                if(type=="Operationalization"){
                    let sourcerequirement=projectUtils.findModelElement(appRequirementsModel, rel.sourceId);
                    if (sourcerequirement.type == "FunctionalRequirement"){
                        if(dicRequirementElement.hasOwnProperty(sourcerequirement.id)){ 
                            sourceGoal=dicRequirementElement[sourcerequirement.id];
                         }
                        if(requirementsOper.hasOwnProperty(sourcerequirement.id)){ 
                            oper=requirementsOper[sourcerequirement.id];
                         }
                        else {
                            sourceGoal= serenaModelUtils.createGoal(projectUtils.findElementProperty(sourcerequirement,"Description").metadata.secret.activity+" "+projectUtils.findElementProperty(sourcerequirement,"Description").metadata.secret.asset,520+(i*fdx),fy+(i*fdy),fw,fh);                       
                            sourceGoal.metadata={'sourceRequirementId':rel.sourceId};                       
                            goalModel.elements.push(sourceGoal);
                            i++;
                            cardinality= serenaModelUtils.createCardinality("Cardinality",520+(i*fdx),fy+(i*fdy),fw,fh)
                            cardinality.metadata={'sourceRequirementId':rel.sourceId};
                            property= serenaModelUtils.createProperty("From","String","1");
                            cardinality.properties.push(property);
                            property= serenaModelUtils.createProperty("To","String","1");
                            cardinality.properties.push(property);
                            goalModel.elements.push(cardinality);
                            i++;
                            let relationship=serenaModelUtils.createRelationship(cardinality,sourceGoal,"String","","","")
                            goalModel.relationships.push(relationship);
                            oper=serenaModelUtils.createOperationalization(projectUtils.findElementProperty(sourcerequirement,"Description").metadata.secret.additionalObjectDetails,520+(i*fdx),fy+(i*fdy),fw,fh)
                            oper.metadata={'sourceRequirementId':rel.sourceId};  
                            goalModel.elements.push(oper);
                            i++
                            relationship=serenaModelUtils.createRelationship(oper,cardinality,"String","","","")
                            goalModel.relationships.push(relationship);
                            //requirementsOfAttributes.push(sourcerequirement);
                            dicRequirementElement[sourcerequirement.id]=sourceGoal;
                            requirementsOper[sourcerequirement.id]=oper;
                            //console.log(sourceSecurityCriteria)
                             
                                                             
                        }      
                }
                

                }

            }
        }
        for (let e = 0; e < appRequirementsModel.elements.length; e++) {
            const element = appRequirementsModel.elements[e];
            if(element.type=="FunctionalRequirement"){
             if(!dicRequirementElement.hasOwnProperty(element.id)){
                let goal= securityCriteria= serenaModelUtils.createGoal(projectUtils.findElementProperty(element,"Description").metadata.secret.activity+" "+projectUtils.findElementProperty(element,"Description").metadata.secret.asset,420+(i*50),fy+(i*50),fw,fh);
                goal.metadata={'sourceRequirementId':element.id};
                goalModel.elements.push(goal);
                dicRequirementElement[element.id]=goal;
             }
            }
            
        }
        
    } catch (error) {
        console.log(error)
    }
    console.log(goalModel)
    //console.log(project.productLines[0].applicationEngineering.applications.find(application => {
    //    return application.id === projectUtils.findApplicationId(project,modelId)
    //  }))
    project.productLines[0].applicationEngineering.applications.find(application => {
        return application.id === projectUtils.findApplicationId(project,modelId)
      }).models.push(goalModel);
    return project;
}
async function generateTreatmentModel(req) {
    
    let project = req.body.data.project;
    let modelId = req.body.data.modelSelectedId;
    let appRequirementsModel = projectUtils.findApplicationModel(project, modelId);
    if (!appRequirementsModel) {
        return project;
    }
    let riskSerenaModel;
    try{
    riskSerenaModel=projectUtils.findModelByType(project,"SERENARiskModel");
    
   
    if(!riskSerenaModel){
        throw "No SERENARiskModel! Generate the Risk Model."
        return;
    }
    if(riskSerenaModel instanceof Array && riskSerenaModel.length>1){
        throw "You can have a maximum of one SERENA Risk Model"
        return;
    }
    //console.log(riskSerenaModel)
   }catch(e){
        throw e;
   }
    let fw = 100;
    let fh = 66;
    let fy = 80;
    let fdx = 25;
    let fdy = 100;
    let fi=0
    let treatmentModel = serenaModelUtils.createTreatmentModel('SERENATreatmentModel');
    //console.log(riskModel)
    let dicRequirementElement=[];
    let requirementsOfAttributes=[];
    let i=1;
    try {
        for (let e = 0; e < riskSerenaModel.elements.length; e++) {
            const element = riskSerenaModel.elements[e];
            treatmentModel.elements.push(element);
            dicRequirementElement[element.id]=element;
        }
        for (let r = 0; r < riskSerenaModel.relationships.length; r++) {
            const rel = riskSerenaModel.relationships[r];
            if(rel.type!="Threat_SecurityClaim"){
                treatmentModel.relationships.push(rel);
            }
        }
        riskSerenaModel.elements.forEach((element) => {
            if(element.type=="SoftGoal"){
                req=projectUtils.findModelElement(appRequirementsModel,element.metadata.sourceRequirementId);
                securityMechanism= projectUtils.findElementProperty(req,"Description").metadata.secret.securityMechanism;
                if(securityMechanism){
                    sm=serenaModelUtils.createSecurityMechanism(securityMechanism, 430,20+(i*200),fw,fh)
                    sm.metadata={'sourceRequirementId':req.id};
                    treatmentModel.elements.push(sm);
                    dicRequirementElement[req.id]=sm;
                    let securityClaims=[];
                    //console.log(req.id)
                    i++;
                    //console.log(element)
                    securityClaim=riskSerenaModel.elements.find(obj => {
                        return (obj.type==="SecurityClaim" && obj.metadata.sourceRequirementId === req.id)
                      });
                    console.log(securityClaim)
                    securityClaims[securityClaim.id]=securityClaim;
                    
                    //calculate the value from threat and security mechanism
                    //let value;
                    //let threatVal=projectUtils.findElementProperty(threat,"Value").value;
                    let securityVal;
                    let priority=projectUtils.findElementProperty(req,"Description").metadata.secret.priority;
                        //console.log(priority)
                      
                    if(priority=="shall") securityVal="++";
                    else if(priority=="should") securityVal="+";
                    //else if(priority=="could") securityVal="++";
                    //else if(priority=="will") securityVal="+";
                    else securityVal="=";

                    //if(threatVal=="=") value=securityVal;
                    //else if(threatVal=="-") value =securityVal-1;
                    //else if(threatVal=="--") value =securityVal-2;
                    //else if(threatVal=="---") value =securityVal-3;
                    //else if(threatVal=="----") value =securityVal-4;
                    rel=serenaModelUtils.createRelationship(sm,securityClaim,"String"," ,++,+,=","Value",securityVal);
                    treatmentModel.relationships.push(rel);
                    riskSerenaModel.elements.forEach((el) => {
                        if(el.type=="SecurityClaim" && !securityClaims.hasOwnProperty(el.id)){
                            rel=serenaModelUtils.createRelationship(sm,el,"String"," ,++,+,=","Value"," ");
                            treatmentModel.relationships.push(rel);
                        }
                    });
                    operationalized=appRequirementsModel.relationships.some(rel =>{
                        return (rel.type=="FunctionalRequirement_SecurityRequirement" && projectUtils.findElementProperty(rel, "Type").value=="Operationalization" && rel.targetId==req.id)
                    });
                    //console.log(operationalized)
                    threatRel=riskSerenaModel.relationships.find(obj => {
                        if(operationalized)
                            return (obj.type==="Threat_SecurityClaim" && obj.targetId === securityClaim.id)
                      });
                    
                    if(threatRel){
                         console.log(threatRel)
                         console.log(projectUtils.findModelElement(riskSerenaModel, threatRel.sourceId))
                         rel=serenaModelUtils.createRelationship(sm,projectUtils.findModelElement(riskSerenaModel, threatRel.sourceId),"String","","","");
                         treatmentModel.relationships.push(rel)
                    }
                    
                    console.log(securityClaim);
                }
                
            }

        });
    } catch (error) {
        console.log(error)
    }
    //console.log(treatmentModel)
    //console.log(project.productLines[0].applicationEngineering.applications.find(application => {
    //    return application.id === projectUtils.findApplicationId(project,modelId)
    //  }))
    project.productLines[0].applicationEngineering.applications.find(application => {
        return application.id === projectUtils.findApplicationId(project,modelId)
      }).models.push(treatmentModel);
    return project;
}

async function generateRiskModel(req) {
    
    let project = req.body.data.project;
    let modelId = req.body.data.modelSelectedId;
    let appRequirementsModel = projectUtils.findApplicationModel(project, modelId);
    let goalSerenaModel;
    
    if (!appRequirementsModel) {
        return project;
    }
    try{
    goalSerenaModel=projectUtils.findModelByType(project,"SERENAGoalModel");
    if(!goalSerenaModel){
        throw "No SERENAGoalModel! Generate the Goal Model."
        return;
    }
    if(goalSerenaModel instanceof Array && goalSerenaModel.length>1){
        throw "You can have a maximum of one SERENA Goal Model"
        return;
    }
    }
    catch(e){
        throw e;
    }

    let fw = 100;
    let fh = 66;
    let fy = 80;
    let fdx = 25;
    let fdy = 100;
    let fi=0
    let riskModel = serenaModelUtils.createRiskModel('SERENARiskModel');
    //console.log(riskModel)
    let dicRequirementElement=[];
    let requirementsOper=[];
    let i=1;
try{

    for (let e = 0,k=1; e < goalSerenaModel.elements.length; e++) {
        const element = goalSerenaModel.elements[e];
        if(element.type=="Operationalization"){
        oper= {...element};
        oper.x=20;
        oper.y=fy+(k*200);
        k++;
        riskModel.elements.push(oper);
        //to link the oper to the security requirement later
        //console.log(element)
        if(element.metadata) dicRequirementElement[element.metadata.sourceRequirementId]=element;
        else dicRequirementElement[element.id]=element;
        
        }
    }
     for (let r = 0; r < appRequirementsModel.relationships.length; r++) {
        const rel = appRequirementsModel.relationships[r];
        var oper;
        var targetSecurityCriteria;
        if (rel.type=="FunctionalRequirement_SecurityRequirement") {
            let type=projectUtils.findElementProperty(rel, "Type").value;
            if (type=="Operationalization") {
    
                let sourcerequirement=projectUtils.findModelElement(appRequirementsModel, rel.sourceId);
                
             
                if (sourcerequirement.type == "FunctionalRequirement"){
                    //console.log(dicRequirementElement.hasOwnProperty(sourcerequirement.id))
                    if(dicRequirementElement.hasOwnProperty(sourcerequirement.id)){ 
                        oper=dicRequirementElement[sourcerequirement.id];
                      
                        
                     }
                    else {
                        oper= serenaModelUtils.createOperationalization(projectUtils.findElementProperty(sourcerequirement,"Description").metadata.secret.additionalObjectDetails,20,fy+(i*100),fw,fh);                      
                        oper.metadata={'sourceRequirementId':rel.sourceId};                       
                        riskModel.elements.push(oper);
                        //requirementsOfAttributes.push(sourcerequirement);
                        dicRequirementElement[sourcerequirement.id]=oper;
                        
                        
                        
                         
                                                         
                    }
                     
                }
                let targetrequirement=projectUtils.findModelElement(appRequirementsModel, rel.targetId);
                //console.log(targetrequirement)
                if (targetrequirement.type == "SecurityRequirement"){

                    if(dicRequirementElement.hasOwnProperty(targetrequirement.id)){
                            targetSecurityCriteria=dicRequirementElement[targetrequirement.id];
                        }
                    else {              
                        targetSecurityCriteria= serenaModelUtils.createSoftGoal(projectUtils.findElementProperty(targetrequirement,"Description").metadata.secret.securityCriteria,820,5+(i*150),fw,fh);
                        targetSecurityCriteria.metadata={'sourceRequirementId':rel.targetId};
                        riskModel.elements.push(targetSecurityCriteria);
                        //requirementsOfAttributes.push(targetrequirement);
                        dicRequirementElement[targetrequirement.id]=targetSecurityCriteria;
                        //console.log(targetSecurityCriteria)
                    }
                }
                vuln= serenaModelUtils.createVulnerability("Vulnerability "+ (i), 170,20+(i*100),fw,fh);
                vuln.metadata={'sourceRequirementId':rel.sourceId};   
                riskModel.elements.push(vuln);
                let relationship=serenaModelUtils.createRelationship(vuln,oper,"String","","","")
                riskModel.relationships.push(relationship);
                threat= serenaModelUtils.createThreat("Threat "+ (i), 320,20+(i*200),fw,fh);
                threat.metadata={'sourceRequirementId':rel.sourceId};   
                riskModel.elements.push(threat);
                relationship=serenaModelUtils.createRelationship(threat,vuln,"String","","","")
                riskModel.relationships.push(relationship);
                securityClaim= serenaModelUtils.createSecurityClaim("SecurityClaim "+ projectUtils.findElementProperty(targetrequirement,"Description").metadata.secret.securityCriteria, 650,(i*150),fw,fh);
                securityClaim.metadata={'sourceRequirementId':rel.targetId};   
                riskModel.elements.push(securityClaim);
                //relationship=serenaModelUtils.createRelationship(threat,securityClaim,"String"," ,----,---,--,-,=","Value","")
                //riskModel.relationships.push(relationship);
                relationship=serenaModelUtils.createRelationship(securityClaim,targetSecurityCriteria,"String","","","")
                riskModel.relationships.push(relationship);
                i=i+1;
                requirementsOper[oper.id]=oper;
                
            }
                
        }
    } 
    for (let e = 0; e < appRequirementsModel.elements.length; e++) {
    const element = appRequirementsModel.elements[e];
    if (element.type == "SecurityRequirement"){
        if(!dicRequirementElement.hasOwnProperty(element.id)){
            //console.log(projectUtils.findElementProperty(element,"Description").metadata.secret.securityCriteria)
            securityCriteria= serenaModelUtils.createSoftGoal(projectUtils.findElementProperty(element,"Description").metadata.secret.securityCriteria,820,5+(i*150),fw,fh);
            //console.log(securityCriteria);
            securityCriteria.metadata={'sourceRequirementId':element.id};
            riskModel.elements.push(securityCriteria);
            securityClaim= serenaModelUtils.createSecurityClaim("SecurityClaim "+ projectUtils.findElementProperty(element,"Description").metadata.secret.securityCriteria, 650,5+(i*150),fw,fh);
            securityClaim.metadata={'sourceRequirementId':element.id};   
            riskModel.elements.push(securityClaim);
            let relationship=serenaModelUtils.createRelationship(securityClaim,securityCriteria,"String","","","")
            riskModel.relationships.push(relationship);
            /*
            riskModel.elements.forEach((element) => {
                if(element.type=="Threat"){
                    relationship=serenaModelUtils.createRelationship(element,securityClaim,"String"," ,----,---,--,-,=","Value","")
                    riskModel.relationships.push(relationship);
                }

            });
            */
            //oper= serenaModelUtils.createOperationalization("Operationalization"+i,20,fy+(i*100),fw,fh);                      
            //oper.metadata={'sourceRequirementId':element.id};                       
            //riskModel.elements.push(oper);
            //vuln= serenaModelUtils.createVulnerability("Vulnerability "+ (i), 220,50+(i*100),fw,fh);
            //vuln.metadata={'sourceRequirementId':element.id};   
            //riskModel.elements.push(vuln);
            //relationship=serenaModelUtils.createRelationship(vuln,oper,"String","","","")
            //riskModel.relationships.push(relationship);
            //threat= serenaModelUtils.createThreat("Threat "+ (i), 420,50+(i*100),fw,fh);
            //threat.metadata={'sourceRequirementId':element.id};   
            //riskModel.elements.push(threat);
            //relationship=serenaModelUtils.createRelationship(threat,vuln,"String","","","")
            //riskModel.relationships.push(relationship);
            //relationship=serenaModelUtils.createRelationship(threat,securityClaim,"String"," ,----,---,--,-,=","Value","")
            //riskModel.relationships.push(relationship);
            //console.log(riskModel)
            //requirementsOfAttributes.push(targetrequirement);
            dicRequirementElement[element.id]=securityCriteria;
            i=i+1;
            
        }

    }
    
    }
    //console.log(dicRequirementElement)
    //console.log(requirementsOper)
    Object.values(dicRequirementElement).forEach((element) => {
        
        sourceId=Object.keys(dicRequirementElement).find(key => dicRequirementElement[key] === element)
        if(element.type=="Operationalization"){
           //console.log(requirementsOper)
           console.log(element);
            if(!requirementsOper.hasOwnProperty(element.id)){
                
                vuln= serenaModelUtils.createVulnerability("Vulnerability "+ (i), 170,20+(i*50),fw,fh);
                vuln.metadata={'sourceRequirementId':sourceId};   
                riskModel.elements.push(vuln);
                let relationship=serenaModelUtils.createRelationship(vuln,element,"String","","","")
                riskModel.relationships.push(relationship);
                threat= serenaModelUtils.createThreat("Threat "+ (i), 320,20+(i*100),fw,fh);
                threat.metadata={'sourceRequirementId':sourceId};   
                riskModel.elements.push(threat);
                relationship=serenaModelUtils.createRelationship(threat,vuln,"String","","","")
                riskModel.relationships.push(relationship);
                //dupilcates the relationships needs to be fixed
                riskModel.elements.forEach((el) => {
                    if(el.type=="Threat"){
                        //console.log(el)
                        riskModel.elements.forEach((elm) => {
                            if(elm.type=="SecurityClaim"){
                                //console.log(elm)
                                relationship=serenaModelUtils.createRelationship(el,elm,"String"," ,--,-,=","Value","")
                                riskModel.relationships.push(relationship);
                            }
                        });
                    }
    
                });
                
                i=i+1;
                //requirementsOper[oper.id]=oper;
            }
        }

    });
    //console.log(requirementsOper)
}catch(e){
    console.log(e)
}
    //console.log(riskModel)
    //console.log(project.productLines[0].applicationEngineering.applications.find(application => {
    //    return application.id === projectUtils.findApplicationId(project,modelId)
    //  }))
    project.productLines[0].applicationEngineering.applications.find(application => {
        return application.id === projectUtils.findApplicationId(project,modelId)
      }).models.push(riskModel);
    return project;
}


async function generateSerenaModel(req) {
    
    let project = req.body.data.project;
    let modelId = req.body.data.modelSelectedId;
    let appRequirementsModel = projectUtils.findApplicationModel(project, modelId);
    if (!appRequirementsModel) {
        return project;
    }
    let treatmentSerenaModel;
    let goalSerenaModel;
    let riskSerenaModel;
    try{
    treatmentSerenaModel=projectUtils.findModelByType(project,"SERENATreatmentModel");
    riskSerenaModel=projectUtils.findModelByType(project,"SERENARiskModel");
    goalSerenaModel=projectUtils.findModelByType(project,"SERENAGoalModel");
    
   
    if(!treatmentSerenaModel){
        throw "No SERENATreatmentModel! Generate the Treatment Model."
        return;
    }
    if(!riskSerenaModel){
        throw "No SERENARiskModel! Generate the Risk Model."
        return;
    }
    if(!goalSerenaModel){
        throw "No SERENAGoalModel! Generate the Goal Model."
        return;
    }
    if(treatmentSerenaModel instanceof Array && treatmentSerenaModel.length>1){
        throw "You can have a maximum of one SERENA Treatment Model"
        return;
    }
    if(riskSerenaModel instanceof Array && riskSerenaModel.length>1){
        throw "You can have a maximum of one SERENA Risk Model"
        return;
    }
    if(goalSerenaModel instanceof Array && goalSerenaModel.length>1){
        throw "You can have a maximum of one SERENA Goal Model"
        return;
    }
    //console.log(riskSerenaModel)
   }catch(e){
        throw e;
   }
    let fw = 100;
    let fh = 66;
    let fy = 80;
    let fdx = 25;
    let fdy = 100;
    let fi=0
    let serenaModel = serenaModelUtils.createSERENAModel('SERENAModel');
    //console.log(riskModel)
    let dicRequirementElement=[];
    let requirementsOfAttributes=[];
    let i=1;
    let rootGoal;
    let dx;
    let dy;
    try {
        /* for (let e = 0,dx=2,dy=2; e < goalSerenaModel.elements.length; e++) {
            const element = goalSerenaModel.elements[e];
            if(element.type=="Goal"){
                goal={...element};
                let isRootGoal=goalSerenaModel.relationships.every(rel =>{
                    return (rel.sourceId!=goal.id)
                });
                //console.log(isRootGoal)
                if(isRootGoal){
                    goal.x=20;
                    goal.y=250;
                    rootGoal=goal;
                } 
                else{
                    goal.x=150+(10*dx);
                    goal.y=100+(50*dy);
                    dy+=2;
                }
                
                serenaModel.elements.push(goal);
                
            }
            else if(element.type=="Operationalization"){
                //dx++;
                oper={...element};
                oper.x=150+(170*dx);
                oper.y=(25*dy);
                serenaModel.elements.push(oper);
                dy+=2;
            }
            else if(element.type=="Cardinality"){
                //dx++;
                car={...element};
                car.x=130+(100*dx);
                car.y=10+(35*dy);
                serenaModel.elements.push(car);
                dy++;
            }
            //serenaModel.elements.push(element)
            dicRequirementElement[element.id]=element;
        } */
        for (let r = 0,x=1,y=1,i=0; r < goalSerenaModel.relationships.length; r++) {
            const rel = goalSerenaModel.relationships[r];
            if(rel.type=="Goal_Goal"){
                let rel1={...rel};
                rel1.type="SubGoal";
                serenaModel.relationships.push(rel1);
                let targetGoal={...projectUtils.findModelElement(goalSerenaModel,rel1.targetId)};
                let sourceGoal={...projectUtils.findModelElement(goalSerenaModel,rel1.sourceId)};
                if(!dicRequirementElement.hasOwnProperty(targetGoal.id)){
                    let isRootGoal=goalSerenaModel.relationships.every(rel =>{
                    return (rel.sourceId!=targetGoal.id)
                    });
                    //console.log(isRootGoal)
                     if(isRootGoal){
                         targetGoal.x=20;
                         targetGoal.y=350;
                         rootGoal=targetGoal;
                        
                    } 
                    else{
                        targetGoal.x=150+(10*x);
                        targetGoal.y=110+(50*y);
                        y+=3;
                    }
                    let sourceReq=projectUtils.findModelElement(appRequirementsModel,targetGoal.metadata.sourceRequirementId);
                         if(sourceReq){

                          asset=projectUtils.findElementProperty(sourceReq,"Description").metadata.secret.asset;
                          if(asset) 
                          {
                            assetElement=serenaModelUtils.createAsset(asset,targetGoal.x,targetGoal.y-80,fw,fh);
                            assetElement.metadata={'sourceRequirementId':sourceReq.id};
                            serenaModel.elements.push(assetElement);
                            relationship=serenaModelUtils.createRelationship(assetElement,targetGoal,"String","","","")
                            serenaModel.relationships.push(relationship);
                            
                          }

                         }
                    serenaModel.elements.push(targetGoal);
                    dicRequirementElement[targetGoal.id]=targetGoal;
                }
                if(!dicRequirementElement.hasOwnProperty(sourceGoal.id)){
                    sourceGoal.x=150+(20*x);
                    sourceGoal.y=110+(50*y);
                    y+=3;
                    let sourceReq=projectUtils.findModelElement(appRequirementsModel,sourceGoal.metadata.sourceRequirementId);
                    if(sourceReq){

                     asset=projectUtils.findElementProperty(sourceReq,"Description").metadata.secret.asset;
                     if(asset) 
                     {
                       assetElement=serenaModelUtils.createAsset(asset,sourceGoal.x,sourceGoal.y-80,fw,fh);
                       assetElement.metadata={'sourceRequirementId':sourceReq.id};
                       serenaModel.elements.push(assetElement);
                       relationship=serenaModelUtils.createRelationship(assetElement,sourceGoal,"String","","","")
                       //console.log(relationship)
                       serenaModel.relationships.push(relationship);
                       
                     }

                    }
                    
                    serenaModel.elements.push(sourceGoal);
                    dicRequirementElement[sourceGoal.id]=sourceGoal;
                }
            }
            else if(rel.type=='Cardinality_Goal'){
                let rel1={...rel};
                serenaModel.relationships.push(rel1);
                let targetGoal={...projectUtils.findModelElement(goalSerenaModel,rel1.targetId)};
                let sourceCar={...projectUtils.findModelElement(goalSerenaModel,rel1.sourceId)};
                if(!dicRequirementElement.hasOwnProperty(targetGoal.id)){
                    let isRootGoal=goalSerenaModel.relationships.every(rel =>{
                    return (rel.sourceId!=targetGoal.id)
                    });
                    //console.log(isRootGoal)
                     if(isRootGoal){
                         targetGoal.x=20;
                         targetGoal.y=350;
                         rootGoal=targetGoal;
                    } 
                    else{
                        targetGoal.x=150+(10*x);
                        targetGoal.y=110+(50*y);
                        y+=3;
                    }
                    let sourceReq=projectUtils.findModelElement(appRequirementsModel,targetGoal.metadata.sourceRequirementId);
                         if(sourceReq){

                          asset=projectUtils.findElementProperty(sourceReq,"Description").metadata.secret.asset;
                          if(asset) 
                          {
                            assetElement=serenaModelUtils.createAsset(asset,targetGoal.x,targetGoal.y-80,fw,fh);
                            assetElement.metadata={'sourceRequirementId':sourceReq.id};
                            serenaModel.elements.push(assetElement);
                            relationship=serenaModelUtils.createRelationship(assetElement,targetGoal,"String","","","")
                            serenaModel.relationships.push(relationship);
                            
                          }

                         }
                    serenaModel.elements.push(targetGoal);
                    dicRequirementElement[targetGoal.id]=targetGoal;
                }
                else targetGoal=dicRequirementElement[targetGoal.id];
                if(!dicRequirementElement.hasOwnProperty(sourceCar.id)){
                    sourceCar.x=targetGoal.x+150;
                    sourceCar.y=targetGoal.y;
                     
                    //y+=3;
                    serenaModel.elements.push(sourceCar);
                    dicRequirementElement[sourceCar.id]=sourceCar;
                }
            }
            else if(rel.type=='Operationalization_Cardinality'){
                let rel1={...rel};
                rel1.type="Operationalization_Claim_Goal";
                serenaModel.relationships.push(rel1);
                let targetCar={...projectUtils.findModelElement(goalSerenaModel,rel1.targetId)};
                let sourceOp={...projectUtils.findModelElement(goalSerenaModel,rel1.sourceId)};
                targetCar=dicRequirementElement[targetCar.id];
                if(!dicRequirementElement.hasOwnProperty(sourceOp.id)){
                    sourceOp.x=targetCar.x+150;
                    sourceOp.y=-135+targetCar.y+(i*300);
                    i++;
                    //y+=3;
                    serenaModel.elements.push(sourceOp);
                    dicRequirementElement[sourceOp.id]=sourceOp;
                }
            }
            else{
                serenaModel.relationships.push(rel);
            }
        }
        //console.log(rootGoal);
        //do not re-add the operationalization, they have the same id in both models, so we can use the relationship directly
       /*  for (let e = 0; e < treatmentSerenaModel.elements.length; e++) {
            const element = treatmentSerenaModel.elements[e];
            if(element.type!="Operationalization"){
                if(element.type=="SecurityClaim"){
                    el={...element};
                    el.type="Claim";
                    serenaModel.elements.push(el);
                    dicRequirementElement[el.id]=el;
                }
                else{
                    //if(element)
                    el={...element};
                    el.x=
                    serenaModel.elements.push(element);
                    dicRequirementElement[element.id]=element;
                }
            }
        
        } */
        //break the relationship between the security mechanism and the claim
        let op=null;
        for (let r = 0,i=0; r < treatmentSerenaModel.relationships.length; r++) {
            const rel = treatmentSerenaModel.relationships[r];
            if(rel.type!="SecurityMechanism_SecurityClaim"){
                if(rel.type=="Vulnerability_Operationalization"){
                    console.log(rel)
                    let rel1={...rel};
                    serenaModel.relationships.push(rel1);
                    let targetOp={...projectUtils.findModelElement(treatmentSerenaModel,rel1.targetId)};
                    console.log(targetOp)
                    let sourceVul={...projectUtils.findModelElement(treatmentSerenaModel,rel1.sourceId)};
                    console.log(sourceVul)
                    if(dicRequirementElement.hasOwnProperty(targetOp.id)) targetOp=dicRequirementElement[targetOp.id];
                    if(!dicRequirementElement.hasOwnProperty(sourceVul.id)){
                        if(op!=targetOp){
                            op=targetOp;
                            i=0;
                        }
                        sourceVul.x=-100+targetOp.x+(i*100);
                        sourceVul.y=-70+targetOp.y;
                        i++;
                        //y+=3;
                        serenaModel.elements.push(sourceVul);
                        dicRequirementElement[sourceVul.id]=sourceVul;
                    }
                    
                }
                let vul=null;
                if(rel.type=="Threat_Vulnerability"){
                    let rel1={...rel};
                    serenaModel.relationships.push(rel1);
                    let targetVul={...projectUtils.findModelElement(treatmentSerenaModel,rel1.targetId)};
                    //console.log(targetVul)
                    let sourceThreat={...projectUtils.findModelElement(treatmentSerenaModel,rel1.sourceId)};
                    if(dicRequirementElement.hasOwnProperty(targetVul.id))targetVul=dicRequirementElement[targetVul.id];
                    //console.log(targetVul)
                   // console.log(sourceThreat)
                    if(!dicRequirementElement.hasOwnProperty(sourceThreat.id) && targetVul!=undefined){
                        if(vul!=targetVul){
                            vul=targetVul;
                            i=0;
                        }
                        sourceThreat.x=-100+targetVul.x+(i*100);
                        sourceThreat.y=-70+targetVul.y;
                        i++;
                        //y+=3;
                        serenaModel.elements.push(sourceThreat);
                        dicRequirementElement[sourceThreat.id]=sourceThreat;
                    }
                    
                }
                let threat=null;
                if(rel.type=="SecurityMechanism_Threat"){
                    let rel1={...rel};
                    serenaModel.relationships.push(rel1);
                    let targetThreat={...projectUtils.findModelElement(treatmentSerenaModel,rel1.targetId)};
                    let sourceSM={...projectUtils.findModelElement(treatmentSerenaModel,rel1.sourceId)};
                    if(dicRequirementElement.hasOwnProperty(targetThreat.id))targetThreat=dicRequirementElement[targetThreat.id];
                    if(!dicRequirementElement.hasOwnProperty(sourceSM.id) && targetThreat!=undefined){
                        if(threat!=targetThreat){
                            threat=targetThreat;
                            i=0;
                        }
                        sourceSM.x=-100+targetThreat.x+(i*100);
                        sourceSM.y=-55+targetThreat.y;
                        i++;
                        //y+=3;
                        serenaModel.elements.push(sourceSM);
                        dicRequirementElement[sourceSM.id]=sourceSM;
                    }
                    
                }
                else if(rel.type=="SecurityClaim_SoftGoal"){
                    let rel1={...rel};
                    //rel1.type="Claim_SoftGoal";
                    //serenaModel.relationships.push(rel1);
                    let targetSC={...projectUtils.findModelElement(treatmentSerenaModel,rel1.targetId)};

                    serenaModel.elements.push(targetSC);
                    if(dicRequirementElement.hasOwnProperty(targetSC.id))dicRequirementElement[targetSC.id]=targetSC;
                    
                }
                
                else serenaModel.relationships.push(rel);
            }

        }
        for (let e = 0; e < appRequirementsModel.elements.length; e++) {
            const element = appRequirementsModel.elements[e];
            if (element.type == "NonFunctionalRequirement"){
                if(!dicRequirementElement.hasOwnProperty(element.id)){
                    //console.log(projectUtils.findElementProperty(element,"Description").metadata.secret.securityCriteria)
                    type=projectUtils.findElementProperty(element,"Type").value;
                    if(type!="Constraint" && type!="External interfaces" && type!="Logical database requirements" && type!="Design constraints"
                    && type!="Software system attributes" && type!="Supporting information" && type!="System interface" && type!="System operations"
                    && type!="System modes and states" && type!="Physical characteristics" && type!="Environmental conditions" && type!="Information management"
                    && type!="Policies and regulations" && type!="System life cycle sustainment" && type!="Packaging handling shipping and transportation"){
                        softGoal= serenaModelUtils.createSoftGoal(type,1000+(e*50),fy+(e*50),fw,fh);
                        //console.log(securityCriteria);
                        softGoal.metadata={'sourceRequirementId':element.id};
                        serenaModel.elements.push(softGoal);
                        //console.log(criteriaModel)
                        //requirementsOfAttributes.push(targetrequirement);
                        dicRequirementElement[element.id]=softGoal;
                    }
                    else if (type=="Constraint" || type=="Design constraints"){
                        appRequirementsModel.relationships.forEach(rel  =>{
                            if(rel.type=="NonFunctionalRequirement_FunctionalRequirement" && rel.sourceId==element.id){
                                let targetGoal=serenaModel.elements.find(el => (el.type=="Goal" && el.metadata.sourceRequirementId==rel.targetId));
                                
                                let asset_goal=serenaModel.relationships.find(rel1 => (rel1.type=="Asset_Goal" && rel1.targetId==targetGoal.id));

                                let asset ={...projectUtils.findModelElement(serenaModel,asset_goal.sourceId)};
                                let property=serenaModelUtils.createProperty("Constraint","String",projectUtils.findElementProperty(element,"Description").metadata.secret.asset+" "+projectUtils.findElementProperty(element,"Description").metadata.secret.additionalObjectDetails,"")
                                asset.properties.push(property);

                            }
                        })
                    }
                    else if(type=="Software system attributes" && type=="Supporting information" && type!="System operations"
                    && type=="System modes and states" && type=="Physical characteristics" && type=="Environmental conditions" && type=="Information management"
                    && type!="Policies and regulations" && type=="System life cycle sustainment")
                    {
                        //To be determined.
                        softGoal= serenaModelUtils.createSoftGoal(projectUtils.findElementProperty(element,"Description").metadata.secret.asset,1000+(e*50),fy+(e*50),fw,fh);
                        //console.log(securityCriteria);
                        softGoal.metadata={'sourceRequirementId':element.id};
                        serenaModel.elements.push(softGoal);
                        //console.log(criteriaModel)
                        //requirementsOfAttributes.push(targetrequirement);
                        dicRequirementElement[element.id]=softGoal;
                    }
                }
        
            }
        }
        let opers=serenaModel.elements.filter(x => x.type === "Operationalization");
        let softGoals=serenaModel.elements.filter(x => x.type === "SoftGoal");
        i=0;
        serenaModel.elements.forEach((elm) => {
           
            if(elm.type=="Cardinality"){
                softGoals.forEach(sg =>{
                    //console.log(sg)

                    let claim=serenaModelUtils.createClaim("C"+(i+1),750,fy+(i*100),fw,fh);
                    serenaModel.elements.push(claim);
                    let relationship=serenaModelUtils.createRelationship(claim,sg,"String","","","")
                    serenaModel.relationships.push(relationship);
                    opers.forEach(op => {
                        if (serenaModel.relationships.some((rel) => (rel.type=="Operationalization_Claim_Goal" && rel.sourceId==op.id && rel.targetId==elm.id))){

                            let relationship=serenaModelUtils.createRelationship(claim,sg,"String","","","")
                            serenaModel.relationships.push(relationship);
                        }
                        //console.log((treatmentSerenaModel.elements.some(x => x.type=="SoftGoal" && x.id==sg.id)))
                        if(treatmentSerenaModel.elements.some(x => x.type=="SoftGoal" && x.id==sg.id) && serenaModel.relationships.some((rel) => (rel.type=="Operationalization_Claim_Goal" && rel.sourceId==op.id && rel.targetId==elm.id))){
                            let vuln_oper = treatmentSerenaModel.relationships.filter(rel1 => (rel1.type=="Vulnerability_Operationalization" && rel1.targetId==op.id));
                            //console.log(vuln_oper)
                            let threat_vuln = treatmentSerenaModel.relationships.filter(rel1 => (rel1.type=="Threat_Vulnerability" && vuln_oper.some( vo=>( vo.sourceId===rel1.targetId))));
                            //console.log(threat_vuln);
                            let sm_threat=treatmentSerenaModel.relationships.filter(rel1 => (rel1.type=="SecurityMechanism_Threat" && threat_vuln.some( tv=>( tv.sourceId===rel1.targetId))));
                            //console.log(sm_threat);
                            //get sc where sg is the target
                            let sc_sg=treatmentSerenaModel.relationships.filter(rel1 => (rel1.type=="SecurityClaim_SoftGoal" && rel1.targetId==sg.id));
                            //console.log(sc_sg);
                            let sm_sc=treatmentSerenaModel.relationships.filter(rel1 => (rel1.type=="SecurityMechanism_SecurityClaim" && sm_threat.some( st=>( st.sourceId===rel1.sourceId)) && sc_sg.some( ss=>( ss.sourceId===rel1.targetId))));
                            //console.log(sm_sc);
                            let security = 0;
                            sm_sc.forEach(ss => {
                                val=projectUtils.findElementProperty(ss,"Value").value;
                                switch (val){
                                    case "++": security+=2; break;
                                    case "+": security+=1; break;
                                    default: break;
                                
                                }
                            })
                            vuln_oper = riskSerenaModel.relationships.filter(rel1 => (rel1.type=="Vulnerability_Operationalization" && rel1.targetId==op.id));
                            //console.log(vuln_oper)
                            threat_vuln = riskSerenaModel.relationships.filter(rel1 => (rel1.type=="Threat_Vulnerability" && vuln_oper.some( vo=>( vo.sourceId===rel1.targetId))));
                            //console.log(threat_vuln);
                            sc_sg=riskSerenaModel.relationships.filter(rel1 => (rel1.type=="SecurityClaim_SoftGoal" && rel1.targetId==sg.id));
                            //console.log(sc_sg);
                            let threat_sc=riskSerenaModel.relationships.filter(rel1 => (rel1.type=="Threat_SecurityClaim" && threat_vuln.some( tv=>( tv.sourceId===rel1.sourceId)) && sc_sg.some( ss=>( ss.sourceId===rel1.targetId))));
                            //console.log(threat_sc);
                            let threat = 0;
                            threat_sc.forEach(ts => {
                                val=projectUtils.findElementProperty(ts,"Value").value;
                                switch (val){
                                    case "--": threat-=2; break;
                                    case "-": threat-=1; break;
                                    default: break;
                                
                                }
                            })
                            overall_val=security+threat;
                            overall="";
                            if(overall_val>=2) overall="++";
                            else if(overall_val==1) overall="+";
                            else if(overall_val==0) overall="=";
                            else if(overall_val==-1) overall="-";
                            else if(overall_val<=-2) overall="--";

                            let relationship=serenaModelUtils.createRelationship(op,claim,"String","--,-,=,+,++","Value",overall)
                            relationship.type="Operationalization_Claim_Goal";
                            serenaModel.relationships.push(relationship);
                            
                        }

                    });

                    i++;


                });

                //console.log(elm)
                //relationship=serenaModelUtils.createRelationship(el,elm,"String"," ,----,---,--,-,=","Value","")
                //riskModel.relationships.push(relationship);
            }
        });
        let contextVariable=serenaModelUtils.createContextVariable("Context Variable", 1500,350,fw,fh);
        serenaModel.elements.push(contextVariable)
        //console.log(serenaModel)
       /*  riskSerenaModel.elements.forEach((element) => {
            if(element.type=="SoftGoal"){
                req=projectUtils.findModelElement(appRequirementsModel,element.metadata.sourceRequirementId);
                securityMechanism= projectUtils.findElementProperty(req,"Description").metadata.secret.securityMechanism;
                if(securityMechanism){
                    sm=serenaModelUtils.createSecurityMechanism(securityMechanism, 430,20+(i*200),fw,fh)
                    sm.metadata={'sourceRequirementId':req.id};
                    treatmentModel.elements.push(sm);
                    dicRequirementElement[req.id]=sm;
                    let securityClaims=[];
                    //console.log(req.id)
                    i++;
                    //console.log(element)
                    securityClaim=riskSerenaModel.elements.find(obj => {
                        return (obj.type==="SecurityClaim" && obj.metadata.sourceRequirementId === req.id)
                      });
                    console.log(securityClaim)
                    securityClaims[securityClaim.id]=securityClaim;
                    
                    //calculate the value from threat and security mechanism
                    //let value;
                    //let threatVal=projectUtils.findElementProperty(threat,"Value").value;
                    let securityVal;
                    let priority=projectUtils.findElementProperty(req,"Description").metadata.secret.priority;
                        //console.log(priority)
                      
                    if(priority=="shall") securityVal="++++";
                    else if(priority=="should") securityVal="+++";
                    else if(priority=="could") securityVal="++";
                    else if(priority=="will") securityVal="+";
                    else securityVal="=";

                    //if(threatVal=="=") value=securityVal;
                    //else if(threatVal=="-") value =securityVal-1;
                    //else if(threatVal=="--") value =securityVal-2;
                    //else if(threatVal=="---") value =securityVal-3;
                    //else if(threatVal=="----") value =securityVal-4;
                    rel=serenaModelUtils.createRelationship(sm,securityClaim,"String"," ,++++,+++,++,+,=","Value",securityVal);
                    treatmentModel.relationships.push(rel);
                    riskSerenaModel.elements.forEach((el) => {
                        if(el.type=="SecurityClaim" && !securityClaims.hasOwnProperty(el.id)){
                            rel=serenaModelUtils.createRelationship(sm,el,"String"," ,++++,+++,++,+,=","Value"," ");
                            treatmentModel.relationships.push(rel);
                        }
                    });
                    operationalized=appRequirementsModel.relationships.some(rel =>{
                        return (rel.type=="FunctionalRequirement_SecurityRequirement" && projectUtils.findElementProperty(rel, "Type").value=="Operationalization" && rel.targetId==req.id)
                    });
                    //console.log(operationalized)
                    threatRel=riskSerenaModel.relationships.find(obj => {
                        if(operationalized)
                            return (obj.type==="Threat_SecurityClaim" && obj.targetId === securityClaim.id)
                      });
                    
                    if(threatRel){
                         console.log(threatRel)
                         console.log(projectUtils.findModelElement(riskSerenaModel, threatRel.sourceId))
                         rel=serenaModelUtils.createRelationship(sm,projectUtils.findModelElement(riskSerenaModel, threatRel.sourceId),"String","","","");
                         treatmentModel.relationships.push(rel)
                    }
                    
                    console.log(securityClaim);
                }
                
            }

        }); */
    } catch (error) {
        console.log(error)
    }
    //console.log(treatmentModel)
    //console.log(project.productLines[0].applicationEngineering.applications.find(application => {
    //    return application.id === projectUtils.findApplicationId(project,modelId)
    //  }))
    project.productLines[0].applicationEngineering.applications.find(application => {
        return application.id === projectUtils.findApplicationId(project,modelId)
      }).models.push(serenaModel);
    return project;
}

//export methods
module.exports = { generateCriteriaModel,generateRiskModel,generateTreatmentModel,generateGoalModel,generateSerenaModel };