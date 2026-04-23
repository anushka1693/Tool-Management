const { TableClient } = require("@azure/data-tables");

module.exports = async function (context, req) {

  try {
    const connectionString = process.env.STORAGE_CONNECTION_STRING;

    const tableClient = TableClient.fromConnectionString(
      connectionString,
      "AuditLogs"
    );

    const body = typeof req.body === "string"
      ? JSON.parse(req.body)
      : req.body;

    const entity = {
      partitionKey: body.toolId,
      rowKey: new Date().getTime().toString(),
      step: body.step,
      action: body.action,
      details: body.details || "",
      user: body.user || "Unknown",
      timestamp: new Date().toISOString()
    };

    await tableClient.createEntity(entity);

    context.res = {
      status: 200,
      body: { success: true }
    };

  } catch (error) {

    context.res = {
      status: 500,
      body: error.message
    };

  }

};
