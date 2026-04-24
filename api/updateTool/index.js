const { TableClient } = require("@azure/data-tables");

module.exports = async function (context, req) {

  try {

    const body = req.body;

    if (!body.partitionKey || !body.rowKey) {
      context.res = {
        status: 400,
        body: "Missing keys"
      };
      return;
    }

    const client = TableClient.fromConnectionString(
      process.env.STORAGE_CONNECTION_STRING,
      "ToolRequests"
    );

    const auditClient = TableClient.fromConnectionString(
    process.env.STORAGE_CONNECTION_STRING,
    "AuditLogs"
  );
  
  const oldEntity = await client.getEntity(
    body.partitionKey,
    body.rowKey
  );

    const changes = [];

function trackChange(field, oldVal, newVal) {
  if ((oldVal || "") !== (newVal || "")) {
    changes.push({
      partitionKey: "audit",
      rowKey: Date.now().toString() + Math.random(),

      toolId: body.rowKey,
      step: body.step ?? oldEntity.step ?? "",

      field: field,
      oldValue: oldVal || "",
      newValue: newVal || "",

      changedBy: body.createdBy || oldEntity.createdBy || "User",
      changedAt: new Date().toISOString()
    });
  }
}

trackChange("Tool Name", oldEntity.toolName, body.toolName);
trackChange("Company", oldEntity.companyName, body.companyName);
trackChange("Requestor", oldEntity.requestorName, body.requestorName);
trackChange("Practice Area", oldEntity.practiceArea, body.practiceArea);

trackChange("NDA Expiry", oldEntity.ndaExpiryDate, body.ndaExpiryDate);
trackChange("MSA Expiry", oldEntity.msaExpiryDate, body.msaExpiryDate);

trackChange("Step", oldEntity.step, body.step);

for (const change of changes) {
  await auditClient.createEntity(change);
}
    
    await client.updateEntity({
      partitionKey: body.partitionKey,
      rowKey: body.rowKey,

      toolName: body.toolName,
      companyName: body.companyName,
      requestorName: body.requestorName,
      practiceArea: body.practiceArea,
      toolType: body.toolType,
      requestedDate: body.requestedDate,
      step: body.step,
      createdBy: body.createdBy,

      ndaExpiryDate: body.ndaExpiryDate || "",
      msaExpiryDate: body.msaExpiryDate || ""
    }, "Merge");

    context.res = {
      status: 200,
      body: "Updated successfully"
    };

  } catch (err) {

    context.log.error(err);

    context.res = {
      status: 500,
      body: err.message
    };
  }

};
