module.exports = async function (context, req) {

  const body = req.body;

  // 🔥 Replace later with DB / SharePoint
  context.res = {
    body: {
      message: "Request created",
      data: body
    }
  };
};
