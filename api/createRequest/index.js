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

    // ✅ CREATE UNIQUE ID (IMPORTANT FIX)
    const uniqueId = Date.now().toString();

    const entity = {
      partitionKey: "tools",
      rowKey: uniqueId,   // ✅ FIXED (NO OVERWRITE)

      toolName: body.toolName || "",
      companyName: body.companyName || "",
      requestorName: body.requestorName || "",
      practiceArea: body.practiceArea || "",

      createdBy: body.createdBy || "",

      requestedDate: body.requestedDate || "",
      step: body.step || 0,
      toolType: body.toolType || "New"
    };

    // ✅ INSERT (NOT UPSERT)
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
