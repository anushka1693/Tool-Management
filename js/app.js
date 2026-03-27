// =======================
// GLOBAL STATE
// =======================

let tools = JSON.parse(localStorage.getItem("tools")) || [];
let selectedToolType = "new";
let filter = "all";
let currentToolIndex = null;

// =======================
// WORKFLOW STEPS
// =======================

const stepsList = [
  "Tool Details","Demo","Vendor Questionnaire","IT Clearance",
  "Partner Approval","Pilot","DT Clearance","Tool Memo",
  "QC Clearance","MSA","Rollout"
];

// =======================
// OPEN / CLOSE FORM
// =======================

function addTool() {
  currentToolIndex = null;

  document.getElementById("toolDetailsSection").classList.remove("hidden");
  document.getElementById("dashboardSection").style.display = "none";
  document.getElementById("workflowSidebar").classList.remove("hidden");

  showSection(0);
}

function closeToolForm() {
  document.getElementById("toolDetailsSection").classList.add("hidden");
  document.getElementById("dashboardSection").style.display = "block";
  document.getElementById("workflowSidebar").classList.add("hidden");
}

// =======================
// SAVE TOOL
// =======================

function saveToolDetails() {

  const name = document.getElementById("toolName").value;
  const company = document.getElementById("companyName").value;
  const requestor = document.getElementById("requestorName").value;
  const practice = document.getElementById("practiceArea").value;

  if (!name) {
    alert("Tool Name is required");
    return;
  }

  if (currentToolIndex === null) {
    tools.push({
      name,
      company,
      requestor,
      practice,
      type: selectedToolType,
      step: 0
    });
  } else {
    tools[currentToolIndex] = {
      ...tools[currentToolIndex],
      name,
      company,
      requestor,
      practice
    };
  }

  localStorage.setItem("tools", JSON.stringify(tools));

  render();
  alert("Saved successfully!");
}

// =======================
// RENDER TABLE
// =======================

function render() {

  let filtered = tools.filter(t => {
    if (filter === "all") return true;
    if (filter === "completed") return t.step === 10;
    if (filter === "progress") return t.step > 0 && t.step < 10;
    if (filter === "new") return t.step === 0;
  });

  document.getElementById("table").innerHTML =
    filtered.map((t, i) => {

      let percent = Math.round((t.step / 10) * 100);

      return `
      <tr class="border-b">
        <td class="p-2"><b>${t.name}</b></td>
        <td class="p-2">${t.type}</td>
        <td class="p-2">${stepsList[t.step]}</td>

        <td class="p-2">
          <div class="w-full bg-gray-200 h-3 rounded">
            <div class="bg-[#800000] h-3 rounded" style="width:${percent}%"></div>
          </div>
        </td>

        <td class="p-2">${percent}%</td>

        <td class="p-2">
          <button onclick="openTool(${i})" class="btn-primary px-2 py-1">View</button>
        </td>
      </tr>
      `;
    }).join("");
}

// =======================
// OPEN TOOL
// =======================

function openTool(index) {

  currentToolIndex = index;
  const tool = tools[index];

  document.getElementById("toolDetailsSection").classList.remove("hidden");
  document.getElementById("dashboardSection").style.display = "none";
  document.getElementById("workflowSidebar").classList.remove("hidden");

  document.getElementById("toolName").value = tool.name || "";
  document.getElementById("companyName").value = tool.company || "";
  document.getElementById("requestorName").value = tool.requestor || "";
  document.getElementById("practiceArea").value = tool.practice || "";

  showSection(tool.step);
}

// =======================
// SECTION CONTROL
// =======================

function showSection(step) {

  for (let i = 1; i <= 11; i++) {
    let el = document.getElementById("section" + i);
    if (el) el.style.display = "none";
  }

  let current = document.getElementById("section" + (step + 1));
  if (current) current.style.display = "block";

  updateWorkflowUI(step);
  updateMiniDonuts(step);
}

// =======================
// NEXT STEP
// =======================

function nextStep() {

  if (currentToolIndex === null) return;

  if (tools[currentToolIndex].step < 10) {
    tools[currentToolIndex].step++;
  }

  localStorage.setItem("tools", JSON.stringify(tools));

  showSection(tools[currentToolIndex].step);
  render();
}

// =======================
// CLICK SIDE STEP
// =======================

function goToStep(step) {

  if (currentToolIndex === null) return;

  tools[currentToolIndex].step = step;

  localStorage.setItem("tools", JSON.stringify(tools));

  showSection(step);
  render();
}

// =======================
// WORKFLOW UI
// =======================

function updateWorkflowUI(step) {

  for (let i = 0; i <= 10; i++) {
    let el = document.getElementById("step-" + i);
    if (!el) continue;

    el.classList.remove("workflow-active", "workflow-complete");

    if (i < step) el.classList.add("workflow-complete");
    else if (i === step) el.classList.add("workflow-active");
  }
}

// =======================
// MINI DONUTS
// =======================

function updateMiniDonuts(step) {

  for (let i = 0; i <= 10; i++) {

    let donut = document.getElementById("donut-" + i);
    if (!donut) continue;

    let percent = 0;

    if (i < step) percent = 100;
    else if (i === step) percent = 50;
    else percent = 0;

    donut.innerText = percent + "%";

    donut.style.background =
      `conic-gradient(#800000 ${percent}%, #e5e5e5 ${percent}%)`;
  }
}

// =======================
// DROPDOWN
// =======================

function toggleAddMenu() {
  document.getElementById("addToolMenu").classList.toggle("hidden");
}

function selectToolType(type) {
  selectedToolType = type;
  addTool();
  document.getElementById("addToolMenu").classList.add("hidden");
}

// =======================
// FILTER
// =======================

function setFilter(f) {
  filter = f;
  render();
}

// =======================
// IT CHECKLIST
// =======================

function renderITChecklist() {
  document.getElementById("itChecklist").innerHTML =
    Array.from({ length: 20 }).map((_, i) => `
      <tr class="border-b">
        <td class="p-2">IT Question ${i+1}</td>
        <td class="p-2"><select class="border w-full"><option>Yes</option><option>No</option></select></td>
      </tr>
    `).join("");
}

// =======================
// DT CHECKLIST
// =======================

function renderDTChecklist() {
  document.getElementById("dtChecklist").innerHTML =
    Array.from({ length: 15 }).map((_, i) => `
      <tr class="border-b">
        <td class="p-2">DT Question ${i+1}</td>
        <td class="p-2"><select class="border w-full"><option>Yes</option><option>No</option></select></td>
      </tr>
    `).join("");
}

// =======================
// INIT
// =======================

render();
renderITChecklist();
renderDTChecklist();
updateMiniDonuts(0);
