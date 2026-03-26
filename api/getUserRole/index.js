module.exports = async function (context, req) {

  const email = (req.query.email || "").toLowerCase();

  let role = "User";

  // 🔥 DEBUG LOG
  context.log("Incoming email:", email);

  if (email.includes("partner")) role = "Partner";
  else if (email.includes("it")) role = "IT";
  else if (email.includes("dt")) role = "DT";
  else if (email.includes("qc")) role = "QC";

  context.res = {
    status: 200,
    body: { role }
  };
};
