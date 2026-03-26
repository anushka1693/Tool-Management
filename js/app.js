let tools = JSON.parse(localStorage.getItem("tools")) || [];
let selectedToolType = "new";
let filter = "all";
let currentToolIndex = null;

const stepsList = [
  "Tool Decision","Demo","Vendor Questionnaire + NDA","IT Clearance","Partner Approval",
  "Pilot","DT Clearance","Tool Memo","QC Clearance","MSA","Rollout"
];

// =======================
// OPEN / CLOSE FORM
// =======================

function addTool() {
  currentToolIndex = null;

  document.getElementById("toolDetailsSection").classList.remove("hidden");
  document.getElementById("dashboardSection").style.display = "none";

  updateSections(0);
}

function closeToolForm() {
  document.getElementById("toolDetailsSection").classList.add("hidden");
  document.getElementById("dashboardSection").style.display = "block";
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

  const type = selectedToolType;

  // NEW TOOL
  if (currentToolIndex === null) {
    tools.push({
      name,
      company,
      requestor,
      practice,
      type,
      step: 0
    });

    // ✅ IMPORTANT FIX
    currentToolIndex = tools.length - 1;
  } 
  // UPDATE EXISTING
  else {
    tools[currentToolIndex].name = name;
    tools[currentToolIndex].company = company;
    tools[currentToolIndex].requestor = requestor;
    tools[currentToolIndex].practice = practice;
  }

  localStorage.setItem("tools", JSON.stringify(tools));

  alert("Saved successfully!");
}

// =======================
// FILTER
// =======================

function setFilter(f) {
  filter = f;

  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.classList.remove("ring-2", "ring-[#800000]");
  });

  if (event?.target) {
    event.target.classList.add("ring-2", "ring-[#800000]");
  }

  render();
}

// =======================
// STATUS + PROGRESS
// =======================

function getStatusClass(step) {
  if (step === 0) return "bg-gray-400";
  if (step < 10) return "bg-[#800000]";
  return "bg-green-600";
}

function getProgress(step) {
  return Math.round((step / 10) * 100);
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

// =======================
// OPEN TOOL (VIEW)
// =======================

function openTool(index) {

  currentToolIndex = index;
  const tool = tools[index];

  document.getElementById("toolDetailsSection").classList.remove("hidden");
  document.getElementById("dashboardSection").style.display = "none";

  // pre-fill
  document.getElementById("toolName").value = tool.name || "";
  document.getElementById("companyName").value = tool.company || "";
  document.getElementById("requestorName").value = tool.requestor || "";
  document.getElementById("practiceArea").value = tool.practice || "";

  updateSections(tool.step);
}

// =======================
// SECTION CONTROL (NEW LOGIC)
// =======================

function updateSections(step) {

  const sections = [
    document.getElementById("section1"),
    document.getElementById("section2"),
    document.getElementById("section3"),
    document.getElementById("section4")
  ];

  sections.forEach((sec, index) => {

    sec.classList.remove("active-section", "disabled-section", "completed-section");

    if (index < step) {
      sec.classList.add("completed-section");
    }
    else if (index === step) {
      sec.classList.add("active-section");

      // scroll to active section
      sec.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    else {
      sec.classList.add("disabled-section");
    }

  });
}

// =======================
// NEXT STEP
// =======================

function nextStep() {

  if (currentToolIndex === null) {
    alert("Please save the tool first");
    return;
  }

  if (tools[currentToolIndex].step < 10) {
    tools[currentToolIndex].step++;
  }

  localStorage.setItem("tools", JSON.stringify(tools));

  updateSections(tools[currentToolIndex].step);
  render();
}

// =======================
// DROPDOWN
// =======================

window.toggleAddMenu = function () {
  document.getElementById("addToolMenu").classList.toggle("hidden");
};

window.selectToolType = function (type) {
  selectedToolType = type;

  addTool();

  document.getElementById("addToolMenu").classList.add("hidden");
};

document.addEventListener("click", function (e) {
  const menu = document.getElementById("addToolMenu");

  if (!e.target.closest(".relative")) {
    menu.classList.add("hidden");
  }
});

// =======================
// IT CHECKLIST
// =======================

const itQuestions = [
  { section: "Access Control", q: "Does the tool support RBAC?" },
  { section: "Access Control", q: "Is least privilege enforced?" },
  { section: "Authentication", q: "Is MFA enforced?" },
  { section: "Authentication", q: "Is SSO enabled?" },
  { section: "Security", q: "Has VAPT been performed?" },
  { section: "Security", q: "Are logs monitored?" }
];

function renderITChecklist() {

  document.getElementById("itChecklist").innerHTML =
    itQuestions.map(item => `
      <tr class="border-b">
        <td class="p-2">${item.section}</td>
        <td class="p-2">${item.q}</td>

        <td class="p-2">
          <select class="border p-1 w-full">
            <option>Yes</option>
            <option>No</option>
            <option>N/A</option>
          </select>
        </td>

        <td class="p-2">
          <input type="file">
        </td>

        <td class="p-2">
          <input class="border p-1 w-full">
        </td>

        <td class="p-2">
          <select class="border p-1 w-full">
            <option>Open</option>
            <option>Closed</option>
          </select>
        </td>
      </tr>
    `).join("");
}

// =======================
// INIT
// =======================

render();
renderITChecklist();
