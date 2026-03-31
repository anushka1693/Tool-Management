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
  "Partner Approval","Pilot","DT Clearance", "AI Clearance", "Tool Memo",
  "QC Clearance","MSA","Rollout"
];

// =======================
// OPEN / CLOSE FORM
// =======================

function addTool() {
  currentToolIndex = null;

  document.getElementById("toolDetailsSection").classList.remove("hidden");
  document.getElementById("dashboardSection").classList.add("hidden");
  document.getElementById("workflowSidebar").classList.remove("hidden");

  showSection(0);
}

function closeToolForm() {

  document.getElementById("toolDetailsSection").classList.add("hidden");
  document.getElementById("workflowSidebar").classList.add("hidden");
  document.getElementById("dashboardSection").classList.remove("hidden");

  render(); // ← add this line
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

  tools = JSON.parse(localStorage.getItem("tools")) || [];

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
  document.getElementById("dashboardSection").classList.add("hidden");
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

  for (let i = 1; i <= 12; i++) {
    let el = document.getElementById("section" + i);
    if (el) el.style.display = "none";
  }

  let current = document.getElementById("section" + (step + 1));
  if (current) current.style.display = "block";

  if (step === 7) loadAIChecklist();
  if (step === 9) loadQCChecklist();

  updateWorkflowUI(step);
  updateMiniDonuts(step);
}

// =======================
// NEXT STEP
// =======================

function nextStep() {

  if (currentToolIndex === null) return;

  if (tools[currentToolIndex].step < 11) {
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
// WORKFLOW UI (FIXED)
// =======================

function updateWorkflowUI(step) {

  for (let i = 0; i <= 11; i++) {
    let el = document.getElementById("step-" + i);
    if (!el) continue;

    el.classList.remove("active", "completed", "inprogress");

    if (i < step) {
      el.classList.add("completed");
    } else if (i === step) {
      el.classList.add("active", "inprogress");
    }
  }
}

// =======================
// MINI DONUTS (FIXED)
// =======================

function updateMiniDonuts(step) {

  const donuts = document.querySelectorAll(".donut");

  donuts.forEach((donut, i) => {

    let percent = 0;

    if (i < step) percent = 100;
    else if (i === step) percent = 50;
    else percent = 0;

    donut.innerText = percent + "%";

    donut.style.background =
      `conic-gradient(#800000 ${percent}%, #e5e5e5 ${percent}%)`;

    donut.style.transition = "all 0.4s ease";
  });
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
// IT CHECKLIST DATA
// =======================

const itChecklistData = [
  { section: "Access Control", team: "IT", question: "Does the tool support role-based access control (RBAC)?" },
  { section: "Access Control", team: "IT", question: "Is least privilege access enforced?" },
  { section: "Access Controls", team: "IT", question: "Are user roles formally defined?" },
  { section: "Access Controls", team: "IT", question: "Is there periodic user access review (quarterly)?" },
  { section: "Access Controls", team: "IT", question: "Can access be revoked immediately upon termination?" },
  { section: "Access Controls", team: "IT", question: "Does the system support SSO (Azure AD)?" },
  { section: "Authentication", team: "IT", question: "Is SSO (Azure AD) enabled?" },
  { section: "Authentication", team: "IT", question: "Is MFA enforced?" },
  { section: "Authentication & Identity", team: "IT", question: "Is authentication handled via enterprise identity provider?" },
  { section: "Authentication & Identity", team: "IT", question: "Are passwords stored securely (hashed + salted)?" },
  { section: "Authentication & Identity", team: "IT", question: "Are there controls for failed login attempts / lockout?" },
  { section: "Authentication & Identity", team: "IT", question: "Is session timeout configured?" },
  { section: "Change Management", team: "IT", question: "Is there a formal change management process?" },
  { section: "Change Management", team: "IT", question: "Are deployments approved before production?" },
  { section: "Change Management", team: "IT", question: "Is version control used (Git)?" },
  { section: "Change Management", team: "IT", question: "Are rollback mechanisms available?" },
  { section: "Infrastructure", team: "IT", question: "Is data encrypted at rest and in transit?" },
  { section: "Infrastructure & Hosting", team: "IT", question: "Where is the tool hosted? (Azure / AWS / SaaS)" },
  { section: "Infrastructure & Hosting", team: "IT", question: "Is data encrypted at rest?" },
  { section: "Infrastructure & Hosting", team: "IT", question: "Is data encrypted in transit (HTTPS)?" },
  { section: "Infrastructure & Hosting", team: "IT", question: "Are backups enabled?" },
  { section: "Infrastructure & Hosting", team: "IT", question: "What is the RPO / RTO?" },
  { section: "Security", team: "IT", question: "Has VAPT been performed?" },
  { section: "Security & Vulnerability", team: "IT", question: "Has the tool undergone VAPT / penetration testing?" },
  { section: "Security & Vulnerability", team: "IT", question: "Are vulnerabilities tracked and remediated?" },
  { section: "Security & Vulnerability", team: "IT", question: "Is antivirus / endpoint protection used?" },
  { section: "Security & Vulnerability", team: "IT", question: "Are logs monitored for suspicious activity?" }
];

// =======================
// FUNCTION TO LOAD IT CHECKLIST
// =======================

function loadITChecklist() {
  const tbody = document.getElementById("itChecklist");
  tbody.innerHTML = ""; // Clear existing rows

  itChecklistData.forEach((item, index) => {
    const tr = document.createElement("tr");
    tr.classList.add(index % 2 === 0 ? "bg-white" : "bg-gray-50"); // Zebra stripes

    tr.innerHTML = `
      <td class="p-2 border">${item.section}</td>
      <td class="p-2 border">${item.team}</td>
      <td class="p-2 border">${item.question}</td>
      <td class="p-2 border"><input type="text" placeholder="Answer" class="w-full border rounded p-1"></td>
      <td class="p-2 border"><input type="file" class="w-full"></td>
      <td class="p-2 border"><input type="text" placeholder="Owner" class="w-full border rounded p-1"></td>
      <td class="p-2 border">
        <select class="w-full border rounded p-1">
          <option value="">Select Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// =======================
// CALL IT ON PAGE LOAD
// =======================
window.addEventListener('DOMContentLoaded', loadITChecklist);

// =======================
// DT CHECKLIST
// =======================

const dtChecklistData = [
  { section: "Architecture", team: "DT", question: "Is the tool scalable?" },
  { section: "Architecture", team: "DT", question: "Does it support API-based integration?" },
  { section: "Architecture", team: "DT", question: "Is the architecture documented?" },
  { section: "Automation", team: "DT", question: "Can workflows be automated?" },
  { section: "Automation", team: "DT", question: "Can approvals be tracked digitally?" },
  { section: "Automation", team: "DT", question: "Does it support Power Automate / APIs?" },
  { section: "Business Fit", team: "DT", question: "What business problem does this tool solve?" },
  { section: "Business Fit", team: "DT", question: "Is this tool replacing an existing system?" },
  { section: "Business Fit", team: "DT", question: "Is there duplication with existing tools?" },
  { section: "Data Flow", team: "DT", question: "Is data classified (PII/confidential)?" },
  { section: "Data Flow", team: "DT", question: "What data is captured?" },
  { section: "Data Flow", team: "DT", question: "Where is data stored?" },
  { section: "Data Flow", team: "DT", question: "Is there data classification (PII / confidential)?" },
  { section: "Integration", team: "DT", question: "Does it integrate with enterprise systems?" },
  { section: "Integration", team: "DT", question: "Does the tool integrate with:\nAzure AD\nSharePoint\nERP / CRM systems" },
  { section: "Integration", team: "DT", question: "Are APIs secure (OAuth / tokens)?" },
  { section: "Master Checklist", team: "DT", question: "All approvals completed (IT / DT / QC)" },
  { section: "Master Checklist", team: "DT", question: "Audit logs available" },
  { section: "Master Checklist", team: "DT", question: "Access controls verified" },
  { section: "Master Checklist", team: "DT", question: "Change management documented" },
  { section: "Master Checklist", team: "DT", question: "Risk assessment completed" },
  { section: "Master Checklist", team: "DT", question: "Data protection validated" },
  { section: "Master Checklist", team: "DT", question: "Contracts (MSA / NDA) signed" },
  { section: "Master Checklist", team: "DT", question: "Tool memo prepared" }
];

// =======================
// AI CHECKLIST DATA
// =======================

const aiChecklistData = [
  { section: "AI Governance", team: "AI", question: "Is the model explainable?" },
  { section: "AI Governance", team: "AI", question: "Is client data protected?" },
  { section: "AI Governance", team: "AI", question: "Is human oversight implemented?" },

  { section: "Bias & Ethics", team: "AI", question: "Has bias testing been performed?" },
  { section: "Bias & Ethics", team: "AI", question: "Are outputs monitored for fairness?" },

  { section: "Data Usage", team: "AI", question: "What data is used for training?" },
  { section: "Data Usage", team: "AI", question: "Is client data used?" },
  { section: "Data Usage", team: "AI", question: "Is data anonymized?" },

  { section: "Governance", team: "AI", question: "Is there human oversight?" },
  { section: "Governance", team: "AI", question: "Are AI decisions reviewed?" },
  { section: "Governance", team: "AI", question: "Is there an approval workflow?" },

  { section: "Model Transparency", team: "AI", question: "Is the AI model explainable?" },
  { section: "Model Transparency", team: "AI", question: "Are outputs auditable?" },

  { section: "Security", team: "AI", question: "Is prompt data stored?" },
  { section: "Security", team: "AI", question: "Is there risk of data leakage (LLM risk)?" },
  { section: "Security", team: "AI", question: "Are inputs/outputs logged?" }
];

// =======================
// QC CHECKLIST DATA
// =======================

const qcChecklistData = [
  { section: "Audit Trail", team: "QC", question: "Are logs timestamped and user-specific?" },
  { section: "Audit Trail", team: "QC", question: "Does the system maintain audit logs?" },
  { section: "Audit Trail", team: "QC", question: "Are logs: Immutable / Timestamped / User-specific?" },
  { section: "Audit Trail", team: "QC", question: "Can logs be exported?" },

  { section: "Compliance", team: "QC", question: "Is the tool SOC compliant?" },
  { section: "Compliance", team: "QC", question: "Is the tool compliant with: SOC 1 / SOC 2 / ITGC?" },
  { section: "Compliance", team: "QC", question: "Are control owners defined?" },

  { section: "Data Retention", team: "QC", question: "What is the data retention policy?" },
  { section: "Data Retention", team: "QC", question: "Can data be archived?" },
  { section: "Data Retention", team: "QC", question: "Is deletion controlled?" },

  { section: "Evidence & Documentation", team: "QC", question: "Are approvals documented?" },
  { section: "Evidence & Documentation", team: "QC", question: "Are documents version-controlled?" },
  { section: "Evidence & Documentation", team: "QC", question: "Is there evidence of: IT / DT / Partner approval?" },

  { section: "Final Review", team: "QC", question: "All approvals completed?" },
  { section: "Final Review", team: "QC", question: "Documents (NDA/MSA) signed?" },

  { section: "Risk", team: "QC", question: "Is risk assessment completed?" },

  { section: "Risk Assessment", team: "QC", question: "Has a risk assessment been performed?" },
  { section: "Risk Assessment", team: "QC", question: "Is there a risk rating (Low / Medium / High)?" },
  { section: "Risk Assessment", team: "QC", question: "Are mitigation steps documented?" }
];

// =======================
// FUNCTION TO LOAD QC CHECKLIST
// =======================

function loadQCChecklist() {
  const tbody = document.getElementById("qcChecklist");
  if (!tbody) return;

  tbody.innerHTML = qcChecklistData.map(item => `
    <tr class="border-b">
      <td class="p-2">${item.section}</td>
      <td class="p-2">${item.team}</td>
      <td class="p-2">${item.question}</td>
      <td class="p-2"><input type="text" placeholder="Answer" class="w-full border rounded p-1"></td>
      <td class="p-2"><input type="file" class="w-full"></td>
      <td class="p-2"><input type="text" placeholder="Owner" class="w-full border rounded p-1"></td>
      <td class="p-2">
        <select class="w-full border rounded p-1">
          <option value="">Select Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </td>
    </tr>
  `).join("");
}


// =======================
// FUNCTION TO LOAD AI CHECKLIST
// =======================

function loadAIChecklist() {
  const tbody = document.getElementById("aiChecklist");
  if (!tbody) return;

  tbody.innerHTML = "";

  aiChecklistData.forEach((item, index) => {
    const tr = document.createElement("tr");
    tr.classList.add(index % 2 === 0 ? "bg-white" : "bg-gray-50");

    tr.innerHTML = `
      <td class="p-2 border">${item.section}</td>
      <td class="p-2 border">${item.team}</td>
      <td class="p-2 border">${item.question}</td>
      <td class="p-2 border"><input type="text" placeholder="Answer" class="w-full border rounded p-1"></td>
      <td class="p-2 border"><input type="file" class="w-full"></td>
      <td class="p-2 border"><input type="text" placeholder="Owner" class="w-full border rounded p-1"></td>
      <td class="p-2 border">
        <select class="w-full border rounded p-1">
          <option value="">Select Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// =======================
// RENDER DT CHECKLIST
// =======================

function renderDTChecklist() {
  const tbody = document.getElementById("dtChecklist");
  tbody.innerHTML = dtChecklistData.map(item => `
    <tr class="border-b">
      <td class="p-2">${item.section}</td>
      <td class="p-2">${item.team}</td>
      <td class="p-2">${item.question}</td>
      <td class="p-2"><input type="text" placeholder="Answer" class="w-full border rounded p-1"></td>
      <td class="p-2"><input type="file" class="w-full"></td>
      <td class="p-2"><input type="text" placeholder="Owner" class="w-full border rounded p-1"></td>
      <td class="p-2">
        <select class="w-full border rounded p-1">
          <option value="">Select Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </td>
    </tr>
  `).join("");
}
// =======================
// INIT
// =======================

render();             // Dashboard table
loadITChecklist();    // Populate IT Checklist
renderDTChecklist();  // DT Checklist
loadAIChecklist();
loadQCChecklist();
updateMiniDonuts(0);  // Workflow donuts
