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
      createdBy: body.createdBy

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
