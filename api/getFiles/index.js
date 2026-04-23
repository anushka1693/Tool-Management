const { TableClient } = require("@azure/data-tables");

module.exports = async function (context, req) {

  try {

    const connectionString = process.env.STORAGE_CONNECTION_STRING;

    const tableClient = TableClient.fromConnectionString(
      connectionString,
      "ToolFiles"
    );

    const toolId = req.query.toolId;

    const entities = [];

    for await (const entity of tableClient.listEntities({
      queryOptions: {
        filter: `PartitionKey eq '${toolId}'`
      }
    })) {
      entities.push(entity);
    }

    context.res = {
      status: 200,
      body: entities
    };

  } catch (err) {

    context.res = {
      status: 500,
      body: err.message
    };

  }

};
