const { TableClient } = require("@azure/data-tables");

module.exports = async function (context, req) {

  try {

    const connectionString = process.env.STORAGE_CONNECTION_STRING;

    const tableClient = TableClient.fromConnectionString(
      connectionString,
      "ToolFiles"
    );

    const body = req.body;

    const entity = {
      partitionKey: body.toolId,
      rowKey: Date.now().toString(),
      fileName: body.fileName,
      step: body.step,
      user: body.user,
      timestamp: new Date().toISOString()
    };

    await tableClient.createEntity(entity);

    context.res = {
      status: 200,
      body: "Saved"
    };

  } catch (err) {

    context.res = {
      status: 500,
      body: err.message
    };

  }

};
