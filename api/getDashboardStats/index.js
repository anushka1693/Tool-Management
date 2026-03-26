module.exports = async function (context, req) {

  context.res = {
    body: {
      total: 25,
      pendingIT: 5,
      pendingDT: 3,
      pendingQC: 2,
      pendingPartner: 4,
      completed: 11
    }
  };
};
