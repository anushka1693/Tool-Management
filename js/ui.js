function applyRoleAccess(role) {

  // Hide Add Tool for non-partner
  const addBtn = document.getElementById("btnAddTool");
  if (role !== "Partner") addBtn.style.display = "none";

  // Example controls
  document.querySelectorAll(".it-only").forEach(el => {
    el.style.display = role === "IT" ? "block" : "none";
  });

  document.querySelectorAll(".dt-only").forEach(el => {
    el.style.display = role === "DT" ? "block" : "none";
  });

  document.querySelectorAll(".qc-only").forEach(el => {
    el.style.display = role === "QC" ? "block" : "none";
  });

  document.querySelectorAll(".partner-only").forEach(el => {
    el.style.display = role === "Partner" ? "block" : "none";
  });

}
