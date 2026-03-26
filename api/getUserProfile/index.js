const fetch = require("node-fetch");

module.exports = async function (context, req) {

  const user = req.headers["x-ms-client-principal"];

  if (!user) {
    context.res = { status: 401 };
    return;
  }

  const decoded = JSON.parse(Buffer.from(user, 'base64').toString());

  const accessToken = decoded.accessToken;

  // 🔥 Call Microsoft Graph
  const graphRes = await fetch("https://graph.microsoft.com/v1.0/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  const graphData = await graphRes.json();

  context.res = {
    body: {
      role: "Partner", // temp (replace later)
      designation: graphData.jobTitle || "NA",
      practice: graphData.department || "NA"
    }
  };
};
