function uploadFile(e, type) {
  const file = e.target.files[0];
  if (!file) return;

  let docs = tools[current].documents;
  let version = docs.filter(d => d.name === file.name).length + 1;

  docs.push({ name: file.name, type, version });

  tools[current].audit.push(type + " uploaded");

  renderSteps();
}

function renderDocs() {
  document.getElementById("docs").innerHTML =
    tools[current].documents.map(d => `
    <div class="border p-2 mb-2 cursor-pointer" onclick="preview('${d.name}')">
    ${d.name} v${d.version}
    </div>
    `).join("");
}

function preview(name) {
  document.getElementById("preview").classList.remove("hidden");
  document.getElementById("previewTitle").innerText = name;
}
