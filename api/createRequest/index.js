const { TableClient } = require("@azure/data-tables");

module.exports = async function (context, req) {

  try {

    const connectionString = process.env.STORAGE_CONNECTION_STRING;
    if (!connectionString) {
  throw new Error("STORAGE_CONNECTION_STRING is missing");
}

    const tableClient = TableClient.fromConnectionString(
      connectionString,
      "ToolRequests"
    );

   const body = typeof req.body === "string"
  ? JSON.parse(req.body)
  : req.body;

    const entity = {
      partitionKey: "tools",
      rowKey: Date.now().toString(),

      toolName: body.toolName || "",
      companyName: body.companyName || "",
      requestorName: body.requestorName || "",
      practiceArea: body.practiceArea || "",

      createdBy: body.createdBy || "",
      createdDate: new Date().toISOString()
    };

    await tableClient.createEntity(entity);

    context.res = {
      status: 200,
      body: {
        message: "Request saved successfully",
        data: entity
      }
    };

  } catch (error) {

    context.res = {
      status: 500,
      body: {
        error: error.message
      }
    };

  }

};
