const { TableClient } = require("@azure/data-tables");

module.exports = async function (context, req) {

  try {

    const { partitionKey, rowKey } = req.body;

    if (!partitionKey || !rowKey) {
      context.res = {
        status: 400,
        body: "Missing keys"
      };
      return;
    }

    const connectionString = process.env.STORAGE_CONNECTION_STRING;

    const tableClient = TableClient.fromConnectionString(
      connectionString,
      "ToolRequests"
    );

    // ✅ DELETE ENTITY
    await tableClient.deleteEntity(partitionKey, rowKey);

    context.res = {
      status: 200,
      body: "Deleted successfully"
    };

  } catch (err) {
    context.log.error(err);

    context.res = {
      status: 500,
      body: "Delete failed"
    };
  }
};
