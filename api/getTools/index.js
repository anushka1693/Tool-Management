const { TableClient } = require("@azure/data-tables");

module.exports = async function (context, req) {

  try {

    const connectionString = process.env.STORAGE_CONNECTION_STRING;

    const tableClient = TableClient.fromConnectionString(
      connectionString,
      "ToolRequests"
    );

    const entities = [];

    for await (const entity of tableClient.listEntities()) {
      entities.push(entity);
    }

    context.res = {
      status: 200,
      body: entities
    };

  } catch (error) {

    context.res = {
      status: 500,
      body: { error: error.message }
    };

  }

};
