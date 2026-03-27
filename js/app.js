let tools = JSON.parse(localStorage.getItem("tools")) || [];
let selectedToolType = "new";
let filter = "all";
let currentToolIndex = null;

// ✅ ALL 11 STEPS
const stepsList = [
  "Tool Details","Demo","Vendor Questionnaire","IT Clearance",
  "Partner Clearance","Pilot","DT Clearance","Tool Memo",
  "QC Clearance","MSA","Rollout"
];

// =======================
// OPEN / CLOSE
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
      name, company, requestor, practice,
      type: selectedToolType,
      step: 0
    });

    currentToolIndex = tools.length - 1;
  } else {
    tools[currentToolIndex] = {
      ...tools[currentToolIndex],
      name, company, requestor, practice
    };
  }

  localStorage.setItem("tools", JSON.stringify(tools));
  alert("Saved successfully!");
}

// =======================
// FILTER
// =======================

function setFilter(f) {
  filter = f;
  render();
}

// =======================
// TABLE RENDER
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
        <td class="p-2">
          <b>${t.name}</b><br>
          <span class="text-xs text-gray-500">${t.company || ""}</span>
        </td>

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

  document.querySelectorAll("[id^='section']").forEach(sec => {
    sec.classList.add("hidden");
  });

  let target = document.getElementById("section" + (step + 1));
  if (target) target.classList.remove("hidden");

  updateWorkflowUI(step);
}

// =======================
// WORKFLOW UI
// =======================

function updateWorkflowUI(step) {

  document.querySelectorAll("[id^='step-']").forEach((el, index) => {

    el.classList.remove("text-green-600", "text-[#800000]", "text-gray-400");

    if (index < step) {
      el.classList.add("text-green-600");
    }
    else if (index === step) {
      el.classList.add("text-[#800000]");
    }
    else {
      el.classList.add("text-gray-400");
    }
  });
}

// =======================
// NEXT STEP
// =======================

function nextStep() {

  if (currentToolIndex === null) {
    saveToolDetails();
  }

  if (tools[currentToolIndex].step < 10) {
    tools[currentToolIndex].step++;
  }

  localStorage.setItem("tools", JSON.stringify(tools));

  showSection(tools[currentToolIndex].step);
  render();
}

// =======================
// CLICK STEP
// =======================

function goToStep(step) {

  if (currentToolIndex === null) {
    alert("Open a tool first");
    return;
  }

  tools[currentToolIndex].step = step;

  localStorage.setItem("tools", JSON.stringify(tools));

  showSection(step);
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

// =======================
// CHECKLIST DATA
// =======================

const itQuestions = [
  { section:"Access Control", q:"Does the tool support RBAC?" },
  { section:"Authentication", q:"Is MFA enforced?" },
  { section:"Security", q:"Has VAPT been performed?" }
];

const dtQuestions = [
  { section:"Architecture", q:"Is the tool scalable?" },
  { section:"Integration", q:"Does it integrate with systems?" }
];

// =======================
// CHECKLIST RENDER
// =======================

function renderChecklist(data, elementId) {
  document.getElementById(elementId).innerHTML =
    data.map(item => `
      <tr>
        <td class="p-2">${item.section}</td>
        <td class="p-2">${item.q}</td>

        <td class="p-2">
          <select class="border w-full">
            <option>Yes</option>
            <option>No</option>
          </select>
        </td>

        <td class="p-2"><input type="file"></td>
        <td class="p-2"><input class="border w-full"></td>

        <td class="p-2">
          <select class="border w-full">
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
renderChecklist(itQuestions, "itChecklist");
renderChecklist(dtQuestions, "dtChecklist");
