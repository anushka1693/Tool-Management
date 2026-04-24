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
  
let oldEntity = {};

try {
  oldEntity = await client.getEntity(
    body.partitionKey,
    body.rowKey
  );
} catch (err) {
  oldEntity = {};
}

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
    
 await client.updateEntity({
  ...oldEntity,   // keep existing data
  ...body         // ⭐ THIS SAVES ALL FIELDS (including IT)
}, "Merge");

    // Save audit logs AFTER update
for (const change of changes) {
  await auditClient.createEntity(change);
}

    context.res = {
  status: 200,
  body: {
    message: "Updated successfully"
  }
};

  } catch (err) {

    context.log.error(err);

    context.res = {
      status: 500,
      body: err.message
    };
  }

};
