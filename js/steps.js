function nextStep() {

  const role = window.currentRole;
  const step = tools[current].step;

  // 🔒 RULES
  if (step === 3 && role !== "IT") {
    alert("Only IT can approve IT Clearance");
    return;
  }

  if (step === 6 && role !== "DT") {
    alert("Only DT can approve DT Clearance");
    return;
  }

  if (step === 8 && role !== "QC") {
    alert("Only QC can approve QC Clearance");
    return;
  }

  tools[current].step++;
  renderSteps();
  render();
}

function prevStep() {
  tools[current].step--;
  renderSteps();
}
