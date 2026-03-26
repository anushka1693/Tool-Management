function openTool(i) {
  window.current = i;
  document.getElementById("modal").classList.remove("hidden");
  renderSteps();
}

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
}

function closePreview() {
  document.getElementById("preview").classList.add("hidden");
}
