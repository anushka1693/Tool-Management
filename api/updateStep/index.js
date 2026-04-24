const { TableClient } = require("@azure/data-tables");

module.exports = async function (context, req) {

  try {

    const { partitionKey, rowKey, step } = req.body;

    if (!partitionKey || !rowKey) {
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

    // ✅ SIMPLE & SAFE UPDATE
    await client.updateEntity({
      partitionKey,
      rowKey,
      step
    }, "Merge");

    context.res = {
      status: 200,
      body: "Step updated"
    };

  } catch (err) {

    context.log.error("UPDATE STEP ERROR:", err);

    context.res = {
      status: 500,
      body: err.message
    };
  }

};
