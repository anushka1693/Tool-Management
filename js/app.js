let tools = JSON.parse(localStorage.getItem("tools")) || [];
let selectedToolType = "new";
let filter = "all";
let currentToolIndex = null;

const stepsList = [
  "Tool Details","Demo","Vendor Questionnaire","IT Clearance"
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

  const type = selectedToolType;

  if (currentToolIndex === null) {
    tools.push({
      name,
      company,
      requestor,
      practice,
      type,
      step: 0
    });

    currentToolIndex = tools.length - 1;
  } else {
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
  render();
}

// =======================
// TABLE RENDER
// =======================

function render() {

  let filtered = tools.filter(t => {
    if (filter === "all") return true;
    if (filter === "completed") return t.step === 3;
    if (filter === "progress") return t.step > 0 && t.step < 3;
    if (filter === "new") return t.step === 0;
  });

  document.getElementById("table").innerHTML =
    filtered.map((t, i) => {

      let percent = Math.round((t.step / 3) * 100);

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
// SECTION CONTROL (MAIN LOGIC)
// =======================

function showSection(step) {

  // hide all
  document.querySelectorAll(".section").forEach(sec => {
    sec.classList.add("hidden");
  });

  // show selected
  document.getElementById("section" + (step + 1)).classList.remove("hidden");

  // update sidebar UI
  document.querySelectorAll("[id^='step-']").forEach((el, index) => {

    let circle = el.querySelector("div");

    circle.classList.remove("bg-green-600", "bg-gray-400", "bg-[#800000]");

    if (index < step) {
      circle.classList.add("bg-green-600");
    }
    else if (index === step) {
      circle.classList.add("bg-[#800000]");
    }
    else {
      circle.classList.add("bg-gray-400");
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

  if (tools[currentToolIndex].step < 3) {
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
    alert("Please open a tool first");
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
// INIT
// =======================

render();
