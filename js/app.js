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

  for (let i = 1; i <= 10; i++) {
    let el = document.getElementById("section" + i);
    if (el) el.style.display = "none";
  }

  let current = document.getElementById("section" + step);
  if (current) current.style.display = "block";

  updateWorkflowUI(step);
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
// WORKFLOW UI UPDATE
// =======================

function updateWorkflowUI(step) {

  for (let i = 0; i <= 10; i++) {
    let el = document.getElementById("step-" + i);
    if (!el) continue;

    el.classList.remove("text-green-600","text-red-800","font-bold");

    if (i < step) {
      el.classList.add("text-green-600");
    } else if (i === step) {
      el.classList.add("text-red-800","font-bold");
    }
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

const itQuestions = [
  {section:"Access Control", q:"Does the tool support role-based access control (RBAC)?"},
  {section:"Access Control", q:"Is least privilege access enforced?"},
  {section:"Access Controls", q:"Are user roles formally defined?"},
  {section:"Access Controls", q:"Is there periodic user access review (quarterly)?"},
  {section:"Access Controls", q:"Can access be revoked immediately upon termination?"},
  {section:"Access Controls", q:"Does the system support SSO (Azure AD)?"},
  {section:"Authentication", q:"Is SSO (Azure AD) enabled?"},
  {section:"Authentication", q:"Is MFA enforced?"},
  {section:"Authentication & Identity", q:"Is authentication handled via enterprise identity provider?"},
  {section:"Authentication & Identity", q:"Are passwords stored securely (hashed + salted)?"},
  {section:"Authentication & Identity", q:"Are there controls for failed login attempts / lockout?"},
  {section:"Authentication & Identity", q:"Is session timeout configured?"},
  {section:"Change Management", q:"Is there a formal change management process?"},
  {section:"Change Management", q:"Are deployments approved before production?"},
  {section:"Change Management", q:"Is version control used (Git)?"},
  {section:"Change Management", q:"Are rollback mechanisms available?"},
  {section:"Infrastructure", q:"Is data encrypted at rest and in transit?"},
  {section:"Infrastructure & Hosting", q:"Where is the tool hosted? (Azure / AWS / SaaS)"},
  {section:"Infrastructure & Hosting", q:"Is data encrypted at rest?"},
  {section:"Infrastructure & Hosting", q:"Is data encrypted in transit (HTTPS)?"},
  {section:"Infrastructure & Hosting", q:"Are backups enabled?"},
  {section:"Infrastructure & Hosting", q:"What is the RPO / RTO?"},
  {section:"Security", q:"Has VAPT been performed?"},
  {section:"Security & Vulnerability", q:"Has the tool undergone VAPT / penetration testing?"},
  {section:"Security & Vulnerability", q:"Are vulnerabilities tracked and remediated?"},
  {section:"Security & Vulnerability", q:"Is antivirus / endpoint protection used?"},
  {section:"Security & Vulnerability", q:"Are logs monitored for suspicious activity?"}
];

function renderITChecklist() {
  document.getElementById("itChecklist").innerHTML =
    itQuestions.map(item => `
      <tr class="border-b">
        <td class="p-2">${item.section}</td>
        <td class="p-2">${item.q}</td>
        <td class="p-2"><select class="border w-full"><option>Yes</option><option>No</option><option>N/A</option></select></td>
        <td class="p-2"><input type="file"></td>
        <td class="p-2"><input class="border w-full"></td>
        <td class="p-2"><select class="border w-full"><option>Open</option><option>Closed</option></select></td>
      </tr>
    `).join("");
}

// =======================
// DT CHECKLIST
// =======================

const dtQuestions = [
  {section:"Architecture", q:"Is the tool scalable?"},
  {section:"Architecture", q:"Does it support API-based integration?"},
  {section:"Architecture", q:"Is the architecture documented?"},
  {section:"Automation", q:"Can workflows be automated?"},
  {section:"Automation", q:"Can approvals be tracked digitally?"},
  {section:"Automation", q:"Does it support Power Automate / APIs?"},
  {section:"Business Fit", q:"What business problem does this tool solve?"},
  {section:"Business Fit", q:"Is this tool replacing an existing system?"},
  {section:"Business Fit", q:"Is there duplication with existing tools?"},
  {section:"Data Flow", q:"Is data classified (PII/confidential)?"},
  {section:"Data Flow", q:"What data is captured?"},
  {section:"Data Flow", q:"Where is data stored?"},
  {section:"Data Flow", q:"Is there data classification (PII / confidential)?"},
  {section:"Integration", q:"Does it integrate with enterprise systems?"},
  {section:"Integration", q:"Does the tool integrate with Azure AD / SharePoint / ERP systems?"},
  {section:"Integration", q:"Are APIs secure (OAuth / tokens)?"},
  {section:"Master Checklist", q:"All approvals completed"},
  {section:"Master Checklist", q:"Audit logs available"},
  {section:"Master Checklist", q:"Access controls verified"},
  {section:"Master Checklist", q:"Change management documented"},
  {section:"Master Checklist", q:"Risk assessment completed"},
  {section:"Master Checklist", q:"Data protection validated"},
  {section:"Master Checklist", q:"Contracts signed"},
  {section:"Master Checklist", q:"Tool memo prepared"}
];

function renderDTChecklist() {
  document.getElementById("dtChecklist").innerHTML =
    dtQuestions.map(item => `
      <tr class="border-b">
        <td class="p-2">${item.section}</td>
        <td class="p-2">${item.q}</td>
        <td class="p-2"><select class="border w-full"><option>Yes</option><option>No</option><option>N/A</option></select></td>
        <td class="p-2"><input type="file"></td>
        <td class="p-2"><input class="border w-full"></td>
        <td class="p-2"><select class="border w-full"><option>Open</option><option>Closed</option></select></td>
      </tr>
    `).join("");
}

// =======================
// INIT
// =======================

render();
renderITChecklist();
renderDTChecklist();
