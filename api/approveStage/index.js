module.exports = async function (context, req) {

  const { requestId, stage, approver, role } = req.body;

  const log = {
    action: "APPROVED",
    stage,
    approver,
    role,
    timestamp: new Date().toISOString()
  };

  context.res = {
    body: {
      message: "Approved",
      log
    }
  };
};
