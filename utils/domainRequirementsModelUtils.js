var projectUtils = require('../utils/projectUtils');

function findTargetRequirements(domainRequirementsModel, sourceRequirementId, relationshipType, propertyType){
    let requirements=[]
    for (let r = 0; r < domainRequirementsModel.relationships.length; r++) {
        const relationship = domainRequirementsModel.relationships[r];
        if (relationship.sourceId!=sourceRequirementId) {
            continue;
        }
        if (relationship.type == relationshipType) {
            let type = projectUtils.findElementProperty(relationship, "Type").value;
            if (type == propertyType) {
                let requirement = projectUtils.findModelElement(domainRequirementsModel, relationship.targetId);
                requirements.push(requirement);
            }
        }
    }
    return requirements;
}


//export methods
module.exports = {
    findTargetRequirements
};