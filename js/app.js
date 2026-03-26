let tools = JSON.parse(localStorage.getItem("tools")) || [];
let selectedToolType = "new";
let filter = "all";

const stepsList = [
  "Tool Decision","Demo","Vendor Questionnaire + NDA","IT Clearance","Partner Approval",
  "Pilot","DT Clearance","Tool Memo","QC Clearance","MSA","Rollout"
];

// OPEN FORM
function addTool() {
  document.getElementById("toolDetailsSection").classList.remove("hidden");
  document.getElementById("dashboardSection").style.display = "none";
}

// CLOSE FORM
function closeToolForm() {
  document.getElementById("toolDetailsSection").classList.add("hidden");
  document.getElementById("dashboardSection").style.display = "block";
}

// SAVE TOOL
function saveToolDetails() {

  const name = document.getElementById("toolName").value;
  const company = document.getElementById("companyName").value;
  const requestor = document.getElementById("requestorName").value;
  const practice = document.getElementById("practiceArea").value;

  if (!name) {
    alert("Tool Name is required");
    return;
  }

  const type = selectedToolType;

  tools.push({
    name,
    company,
    requestor,
    practice,
    type,
    step: 0,
    flow: null,
    documents: [],
    audit: []
  });

  localStorage.setItem("tools", JSON.stringify(tools));

  closeToolForm();

  // clear inputs
  document.getElementById("toolName").value = "";
  document.getElementById("companyName").value = "";
  document.getElementById("requestorName").value = "";
  document.getElementById("practiceArea").value = "";

  render();

  alert("Tool added successfully!");
}

// FILTER
function setFilter(f) {
  filter = f;

  // highlight active button
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.classList.remove("ring-2", "ring-[#800000]");
  });

  if (event?.target) {
    event.target.classList.add("ring-2", "ring-[#800000]");
  }

  render();
}

// STATUS
function getStatusClass(step) {
  if (step === 0) return "bg-gray-400";
  if (step < 10) return "bg-[#800000]";
  return "bg-green-600";
}

// PROGRESS
function getProgress(step) {
  return Math.round((step / 10) * 100);
}

// RENDER TABLE
function render() {

  let filtered = tools.filter(t => {
    if (filter === "all") return true;
    if (filter === "completed") return t.step === 10;
    if (filter === "progress") return t.step > 0 && t.step < 10;
    if (filter === "new") return t.step === 0;
  });

  document.getElementById("table").innerHTML =
    filtered.map((t, i) => {

      let percent = getProgress(t.step);

      return `
      <tr class="border-b">
        <td class="p-2">
          <div><b>${t.name}</b></div>
          <div class="text-xs text-gray-500">${t.company || ""}</div>
        </td>

        <td class="p-2">${t.type}</td>

        <td class="p-2">
          <span class="${getStatusClass(t.step)} text-white px-2 py-1 rounded">
            ${stepsList[t.step]}
          </span>
        </td>

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

// ✅ DROPDOWN (FIXED GLOBAL FUNCTIONS)

window.toggleAddMenu = function () {
  document.getElementById("addToolMenu").classList.toggle("hidden");
};

window.selectToolType = function (type) {
  selectedToolType = type;

  addTool();

  document.getElementById("addToolMenu").classList.add("hidden");
};

// ✅ CLOSE DROPDOWN ON OUTSIDE CLICK
document.addEventListener("click", function (e) {
  const menu = document.getElementById("addToolMenu");

  if (!e.target.closest(".relative")) {
    menu.classList.add("hidden");
  }
});

// INITIAL LOAD
render();
