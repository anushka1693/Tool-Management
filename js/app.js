let loggedInUser = "";

// =======================
// GLOBAL STATE
// =======================

let tools = [];
let selectedToolType = "new";
let filter = "all";
let currentToolIndex = null;

// =======================
// SECTION PROGRESS LOGIC
// =======================

const sectionFieldMap = {

  toolDetailsSection: [
    "toolName",
    "companyName",
    "requestorName",
    "practiceArea"
  ],

  demoSection: [
    "demoLink",
    "demoOwner"
  ],

  questionnaireSection: [
    "dtClearance"
  ],

  itClearanceSection: [
    // optional: skip for now OR define key fields
  ],

  partnerClearanceSection: [
    "partnerDecision"
  ],

  pilotSection: [
    // dynamic → leave for now
  ],

  dtClearanceSection: [
    // can refine later
  ],

  aiClearanceSection: [
    // can refine later
  ],

  toolMemoSection: [
    // add if needed
  ],

  qcClearanceSection: [
    // add later
  ],

  msaSection: [
    "sowType"
  ],

  rolloutSection: [
    // optional
  ]
};

function calculateSectionProgress(sectionId) {

  let inputs = [];
  
if (sectionFieldMap[sectionId] && sectionFieldMap[sectionId].length > 0) {

  inputs = sectionFieldMap[sectionId]
    .map(id => document.getElementById(id))
    .filter(el => el !== null);

} else {

  const section = document.getElementById(sectionId);
  if (!section) return 0;

  inputs = section.querySelectorAll("input, textarea, select");
}

  const total = inputs.length;

  if (total === 0) return 0;

  let filled = 0;

  inputs.forEach(input => {

    if (!input) return;

    if (input.type === "file") {
      if (input.files.length > 0) filled++;
    } else if (input.value && input.value.trim() !== "") {
      filled++;
    }

  });

  return Math.round((filled / total) * 100);
}

function updateSectionProgress(sectionId, stepIndex) {

  const percent = calculateSectionProgress(sectionId);

  const step = document.getElementById("step-" + stepIndex);

  if (!step) return;

  const donut = step.querySelector(".donut");

  if (donut) {

    donut.innerText = percent + "%";

    let color = "#800000";

    if (percent === 100) {
      color = "#2e7d32";   // green when completed
    } else if (percent > 50) {
      color = "#c62828";   // lighter red
    }

    donut.style.background =
      `conic-gradient(${color} ${percent}%, #e5e5e5 ${percent}%)`;

    if (percent > 50) {
      donut.style.color = "#ffffff";
    } else {
      donut.style.color = "#800000";
    }

  }

}

function attachProgressTracking(sectionId, stepIndex) {

  const section = document.getElementById(sectionId);

  if (!section) return;

  const inputs = section.querySelectorAll("input, textarea, select");

  inputs.forEach(input => {
  input.addEventListener("input", () => {
  updateSectionProgress(sectionId, stepIndex);
});

input.addEventListener("change", () => {
  updateSectionProgress(sectionId, stepIndex);
});

  });

}

// =======================
// WORKFLOW STEPS
// =======================

const stepsList = [
  "Tool Details","Demo","Vendor Questionnaire","IT Clearance",
  "Partner Approval","Pilot","DT Clearance", "AI Clearance", "Tool Memo",
  "QC Clearance","NDA / MSA / SOW","Rollout"
];

// =======================
// PILOT TEST CASES
// =======================

let testCaseCount = 0;

function addTestCase() {
  testCaseCount++;

  const container = document.getElementById('testCasesContainer');
  if (!container) return;

  const div = document.createElement('div');
  div.className = "border p-4 rounded bg-gray-50";

  div.innerHTML = `
    <h4 class="font-semibold mb-3">Test Case ${testCaseCount}</h4>

    <input type="text" 
      class="w-full border p-2 mb-2" 
      placeholder="Pilot Team Member Names">

    <div class="mb-2">
      <label class="text-sm font-medium">Raw Data Used</label>
      <input type="file" class="w-full text-sm border p-1">
    </div>

    <div class="mb-2">
      <label class="text-sm font-medium">Output Files</label>
      <input type="file" class="w-full text-sm border p-1">
    </div>

    <textarea class="w-full border p-2 mb-2" 
      placeholder="Recommendation / Feedback"></textarea>

    <textarea class="w-full border p-2" 
      placeholder="Other Comments"></textarea>
  `;

  container.appendChild(div);
}

function loadPilotSection() {
  const container = document.getElementById('testCasesContainer');
  if (!container) return;

  // prevent duplicate loading
  if (container.children.length > 0) return;

  testCaseCount = 0;   // RESET COUNTER

  for (let i = 0; i < 3; i++) {
    addTestCase();
  }
}

// =======================
// PARTNER APPROVAL OPTIONS
// =======================

function updatePartnerDecisionOptions() {

  const dropdown = document.getElementById("partnerDecision");
  if (!dropdown) return;

  dropdown.innerHTML = "";

  if (selectedToolType === "request") {

    dropdown.innerHTML = `
      <option value="">Select Decision</option>
      <option>Procure the Tool</option>
      <option>Get the Quotation</option>
      <option>Not Approved</option>
    `;

  } else if (selectedToolType === "new") {

    dropdown.innerHTML = `
      <option value="">Select Decision</option>
      <option>Develop the Tool</option>
      <option>Further Evaluation Required</option>
      <option>Not Approved</option>
    `;

  }
}


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

async function saveToolDetails() {

  const name = document.getElementById("toolName").value;
  const company = document.getElementById("companyName").value;
  const requestor = document.getElementById("requestorName").value;
  const practice = document.getElementById("practiceArea").value;

  if (!name) {
    alert("Tool Name is required");
    return;
  }

  const toolData = {
    toolName: name,
    companyName: company,
    requestorName: requestor,
    practiceArea: practice,
    createdBy: loggedInUser
  };

  try {

    const res = await fetch("/api/createRequest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(toolData)
    });

    let result = null;

if (res.ok) {
  result = await res.json();
} else {
  const text = await res.text();
  console.error("API error:", text);
}

console.log("Saved:", result);

// ADD TOOL TO DASHBOARD STATE
tools.push({
  name: name,
  company: company,
  requestor: requestor,
  practice: practice,
  type: selectedToolType,
  step: 0
});

// SAVE TO LOCAL STORAGE
localStorage.setItem("tools", JSON.stringify(tools));

// REFRESH DASHBOARD
render();

alert("Tool saved successfully!");

closeToolForm();

  } catch (err) {

    console.error(err);
    alert("Error saving tool");

  }

}

// =======================
// RENDER TABLE
// =======================

async function loadTools() {

  try {

    const res = await fetch("/api/getTools");

    // ✅ ADD THIS SAFETY CHECK
    if (!res.ok) {
      console.warn("API not available, skipping...");
      return;
    }

    const data = await res.json();

    tools = data.map(t => ({
  name: t.toolName,
  company: t.companyName,
  requestor: t.requestorName,
  practice: t.practiceArea,
  type: t.toolType || "New",
  step: t.step || 0
}));

    render();

  } catch (err) {

    console.error("Error loading tools:", err);

  }

}


// Dashboard rendering
function render() {

  let filtered = tools.filter(t => {
    if (filter === "all") return true;
    if (filter === "completed") return t.step === 10;
    if (filter === "progress") return t.step > 0 && t.step < 10;
    if (filter === "new") return t.step === 0;
  });

  document.getElementById("table").innerHTML =
    filtered.map((t, i) => {

      let percent = Math.round((t.step / (stepsList.length - 1)) * 100);

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
// TOOL MEMO GENERATION
// =======================

function generateToolMemo() {

  const getVal = (id) => document.getElementById(id)?.value || "";
  const today = new Date().toLocaleDateString();
  
const memo = `
<div style="
  font-family: Cambria, Georgia, serif;
  color:#2c2c2c;
  line-height:1.8;
  font-size:15px;
  padding:20px 10px;
">

  <h2 style="text-align:center; font-weight:600; margin-bottom:25px;">
    KNAV – TOOL CLEARANCE MEMORANDUM
  </h2>

  <p><b>Date:</b> ${today}</p>
  <p><b>Prepared By:</b> ${getVal("requestorName")}</p>
  <p><b>Practice Area:</b> ${getVal("practiceArea")}</p>

  <hr style="margin:30px 0; border-top:1px solid #e5e5e5;">

 <h3 style="margin-top:25px; margin-bottom:10px; font-weight:600;">
  1. Tool Overview
</h3>
  <p>• <b>Tool Name:</b> ${getVal("toolName")}</p>
  <p>• <b>Vendor / Company:</b> ${getVal("companyName")}</p>
  <p>• <b>Tool Type:</b> ${selectedToolType === "new" ? "In-house" : "External"}</p>
  <p>• <b>Purpose of Tool:</b> Not Available</p>
  <p>• <b>Business Use Case:</b> Not Available</p>

 <hr style="margin:30px 0; border-top:1px solid #e5e5e5;">

  <h3 style="margin-top:25px; margin-bottom:10px; font-weight:600;">
  2. Request Details
</h3>
  <p>• <b>Request Initiated By:</b> ${getVal("requestorName")}</p>
  <p>• <b>Request Type:</b> ${selectedToolType === "new" ? "New Development" : "External Tool Onboarding"}</p>
  <p>• <b>Date of Request:</b> ${today}</p>

  <hr style="margin:30px 0; border-top:1px solid #e5e5e5;">

 <h3 style="margin-top:25px; margin-bottom:10px; font-weight:600;">
  3. Evaluation and Review Summary
</h3>

<h4 style="margin-top:15px; margin-bottom:5px; font-weight:600;">
  3.1 Demo Conducted
</h4>
  <p>• <b>Status:</b> ${getVal("demoLink") ? "Completed" : "Pending"}</p>
  <p>• <b>Key Observations:</b><br>Not Available</p>

  <h4 style="margin-top:10px;">3.2 Vendor Assessment</h4>
  <p>• <b>Vendor Questionnaire Completed:</b> ${getVal("dtClearance") || "Pending"}</p>
  <p>• <b>Data Security Measures:</b> Not Available</p>
  <p>• <b>Hosting Location:</b> Not Available</p>
  <p>• <b>Compliance Certifications:</b> Not Available</p>

  <hr style="margin:30px 0; border-top:1px solid #e5e5e5;">

  <h3>4. Risk & Compliance Review</h3>

  <h4>4.1 IT Clearance</h4>
  <p>• <b>Status:</b> Pending</p>
  <p>• <b>Comments:</b> Not Available</p>

  <h4>4.2 Data Security & Privacy</h4>
  <p>• <b>PII / Sensitive Data:</b> Not Available</p>
  <p>• <b>Data Residency Impact:</b> Not Available</p>
  <p>• <b>Encryption Controls:</b> Not Available</p>

  <h4>4.3 Legal Documentation</h4>
  <p>• <b>NDA:</b> Not Available</p>
  <p>• <b>MSA:</b> Not Available</p>
  <p>• <b>SOW:</b> ${getVal("sowType") || "Not Available"}</p>

  <hr style="margin:30px 0; border-top:1px solid #e5e5e5;">

  <h3>5. Business Approval</h3>
  <p>• <b>Status:</b> ${getVal("partnerDecision") || "Pending"}</p>
  <p>• <b>Approving Partner:</b> Not Available</p>
  <p>• <b>Approval Date:</b> Not Available</p>

<hr style="margin:30px 0; border-top:1px solid #e5e5e5;">

  <h3>6. Pilot Testing</h3>
  <p>• <b>Pilot Conducted:</b> Not Available</p>
  <p>• <b>Number of Test Cases:</b> Not Available</p>

  <p><b>Pilot Summary</b><br>Not Available</p>
  <p><b>Key Observations</b><br>Not Available</p>

  <hr style="margin:30px 0; border-top:1px solid #e5e5e5;">

  <h3>7. Internal Clearances</h3>

  <table style="width:100%; border-collapse: collapse; margin-top:10px;">
    <tr>
      <th style="border:1px solid #ccc; padding:8px;">Function</th>
      <th style="border:1px solid #ccc; padding:8px;">Status</th>
      <th style="border:1px solid #ccc; padding:8px;">Comments</th>
    </tr>
    <tr>
      <td style="border:1px solid #ccc; padding:8px;">Digital Transformation</td>
      <td style="border:1px solid #ccc; padding:8px;">Pending</td>
      <td style="border:1px solid #ccc; padding:8px;">-</td>
    </tr>
    <tr>
      <td style="border:1px solid #ccc; padding:8px;">AI Team</td>
      <td style="border:1px solid #ccc; padding:8px;">Pending</td>
      <td style="border:1px solid #ccc; padding:8px;">-</td>
    </tr>
    <tr>
      <td style="border:1px solid #ccc; padding:8px;">IT Team</td>
      <td style="border:1px solid #ccc; padding:8px;">Pending</td>
      <td style="border:1px solid #ccc; padding:8px;">-</td>
    </tr>
    <tr>
      <td style="border:1px solid #ccc; padding:8px;">QC Team</td>
      <td style="border:1px solid #ccc; padding:8px;">Pending</td>
      <td style="border:1px solid #ccc; padding:8px;">-</td>
    </tr>
  </table>

  <hr style="margin:30px 0; border-top:1px solid #e5e5e5;">

  <h3>8. Exceptions / Deviations</h3>
  <p>None</p>

<hr style="margin:30px 0; border-top:1px solid #e5e5e5;">

  <h3>9. Final Decision</h3>
  <p>• <b>Status:</b> Pending</p>
  <p>• <b>Conditions:</b> None</p>

  <hr style="margin:30px 0; border-top:1px solid #e5e5e5;">

  <h3>10. Rollout Plan</h3>
  <p>• <b>Status:</b> Not Started</p>
  <p>• <b>Users:</b> Not Available</p>
  <p>• <b>Go-Live Date:</b> Not Available</p>

 <hr style="margin:30px 0; border-top:1px solid #e5e5e5;">

  <h3>11. Audit Trail</h3>
  <p>• <b>Completion:</b> Not Calculated</p>
  <p>• <b>All Steps Completed:</b> No</p>

 <hr style="margin:30px 0; border-top:1px solid #e5e5e5;">

  <h3>12. Declaration</h3>
  <p>
    This memo confirms that the tool has undergone required evaluation and approvals.
  </p>

  <br><br>

  <p><b>Prepared By:</b><br>${getVal("requestorName")}</p>

  <br><br>

  <p><b>Reviewed & Approved By:</b><br>Pending</p>

</div>
`;

const container = document.getElementById("toolMemoContent");

if (!container) return;

// prevent accidental overwrite issues
container.innerHTML = "";
container.insertAdjacentHTML("beforeend", memo);
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

// ✅ FIX: don't show hidden sections
if (current && !current.classList.contains("hidden-by-type")) {
  current.style.display = "block";
}

  if (step === 4) {
  updatePartnerDecisionOptions();
}

  if (step === 5) {
    loadPilotSection();
  }

if (step === 7) {
  loadAIChecklist();
}

if (step === 8) {
  generateToolMemo();
} 

if (step === 9) {
  loadQCChecklist();
}

  updateWorkflowUI(step);
}

// =======================
// NEXT STEP
// =======================

function nextStep() {

  let currentStep = 0;

  // detect current visible section
  for (let i = 1; i <= 12; i++) {
    let el = document.getElementById("section" + i);
    if (el && el.style.display === "block") {
      currentStep = i - 1;
      break;
    }
  }

  // move to next step
do {
  currentStep++;
  var nextSection = document.getElementById("section" + (currentStep + 1));
} while (
  currentStep < 11 &&
  nextSection &&
  nextSection.classList.contains("hidden-by-type")
);

  // update tool state if exists
  if (currentToolIndex !== null) {
    tools[currentToolIndex].step = currentStep;
    localStorage.setItem("tools", JSON.stringify(tools));
  }

  // show next section
  showSection(currentStep);
  render();
}

// =======================
// CLICK SIDE STEP
// =======================

function goToStep(step) {

  if (currentToolIndex === null) {
    showSection(step);
    updateWorkflowUI(step);
    return;
  }

  tools[currentToolIndex].step = step;

  localStorage.setItem("tools", JSON.stringify(tools));

  showSection(step);

  // LOAD PILOT TEST CASES
  if (step === 5) {
    loadPilotSection();
  }
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
  else if (i === step) percent = 0;
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

  document.getElementById("addToolMenu").classList.add("hidden");

  const vendorSection = document.getElementById("section3");
  const nda = document.getElementById("ndaSection");
  const msa = document.getElementById("msaSubSection");
  const sow = document.getElementById("sowMainSection");

  // ⭐ ADD THIS (sidebar step)
  const vendorStep = document.getElementById("step-2");

  // Reset all
  [vendorSection, nda, msa, sow].forEach(el => {
    if (el) el.classList.remove("hidden-by-type");
  });

  if (type === "new") {

    // Hide Vendor everywhere
    vendorSection?.classList.add("hidden-by-type");
    nda?.classList.add("hidden-by-type");
    msa?.classList.add("hidden-by-type");

    // ⭐ Hide sidebar step
    if (vendorStep) vendorStep.style.display = "none";

  } 
  else if (type === "existing") {

    // Show Vendor again
    sow?.classList.add("hidden-by-type");

    // ⭐ Show sidebar step
    if (vendorStep) vendorStep.style.display = "flex";
  }

  addTool();
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
      <td class="p-2 border">

      <input
      type="file"
      multiple
      onchange="handleFileUpload(this)"
      class="w-full text-sm">
      
      <div class="file-list text-xs mt-2 space-y-1"></div>
      
      </td>
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
// DT SIGN OFF FUNCTION
// =======================

function signOff(button) {

const userName = loggedInUser;// replace later with logged-in user

  const initials = userName
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase();

  const cell = button.parentElement;

  cell.innerHTML = `<span class="font-semibold text-green-700">${initials}</span>`;
}

// =======================
// ENABLE / DISABLE ROLLOUT ROW
// =======================

function toggleRolloutRow(checkbox) {

  const row = checkbox.closest("tr");

  const fields = row.querySelectorAll(".rollout-field");
  const inputs = row.querySelectorAll("input, textarea");
  const signOffCell = row.querySelector("td:last-child");

  fields.forEach(field => {

    field.disabled = !checkbox.checked;

    if (checkbox.checked) {
      field.classList.remove("bg-gray-200");
    } else {
      field.classList.add("bg-gray-200");
    }

  });

  // ⭐ RESET ENTIRE ROW IF UNCHECKED
  if (!checkbox.checked) {

    inputs.forEach(input => {

      if (input.type === "checkbox") return;

      if (input.type === "date" || input.type === "text") {
        input.value = "";
      }

      if (input.tagName === "TEXTAREA") {
        input.value = "";
      }

    });

    // Reset sign off button
    signOffCell.innerHTML = `
      <button onclick="signOff(this)"
        class="bg-green-600 text-white px-2 py-1 rounded text-xs rollout-field"
        disabled>
        Sign Off
      </button>
    `;
  }

}

function handleFileUpload(input){

  const container = input.parentElement.querySelector(".file-list");

  Array.from(input.files).forEach(file => {

    const url = URL.createObjectURL(file);

    const row = document.createElement("div");

    row.className = "flex items-center gap-2";

    row.innerHTML = `
      <span>${file.name}</span>

      <a href="${url}" target="_blank" class="text-blue-600 underline">
        Open
      </a>

      <a href="${url}" download class="text-green-600 underline">
        Download
      </a>

      <button onclick="this.parentElement.remove()" class="text-red-600 underline">
        Remove
      </button>
    `;

    container.appendChild(row);

  });

}

// =======================
// INIT
// =======================

loadITChecklist();    // Populate IT Checklist
renderDTChecklist();  // DT Checklist
loadAIChecklist();
loadQCChecklist();
updateMiniDonuts(0);  // Workflow donuts
loadPilotSection();  

// =======================
// ATTACH PROGRESS TRACKING
// =======================

attachProgressTracking("toolDetailsSection", 0);
attachProgressTracking("demoSection", 1);
attachProgressTracking("questionnaireSection", 2);
attachProgressTracking("itClearanceSection", 3);
attachProgressTracking("partnerClearanceSection", 4);
attachProgressTracking("pilotSection", 5);
attachProgressTracking("dtClearanceSection", 6);
attachProgressTracking("aiClearanceSection", 7);
attachProgressTracking("toolMemoSection", 8);
attachProgressTracking("qcClearanceSection", 9);
attachProgressTracking("msaSection", 10);
attachProgressTracking("rolloutSection", 11);

// ======================
// Load Logged-in User
// ======================
async function loadUser() {
  try {
    const res = await fetch("/.auth/me");

    if (!res.ok) {
      throw new Error("Auth API failed");
    }

    const data = await res.json();
    console.log("AUTH RESPONSE:", data);

    let user = null;

    // ✅ Handle BOTH formats safely
    if (Array.isArray(data)) {
      if (data.length > 0 && data[0].clientPrincipal) {
        user = data[0].clientPrincipal;
      }
    } else if (data && data.clientPrincipal) {
      user = data.clientPrincipal;
    }

    // ✅ SAFETY CHECK (this was missing earlier)
    if (!user) {
      document.getElementById("userName").innerText = "No User";
      return;
    }

    // ✅ Display Name (fallback to email)
    let displayName = user.userDetails || "User";

    if (user.claims && user.claims.length > 0) {
      const nameClaim = user.claims.find(c => c.typ === "name");
      if (nameClaim && nameClaim.val) {
        displayName = nameClaim.val;
      }
    }

   let name = displayName;

// Convert email style to name if needed
if (name.includes("@")) {
  name = name.split("@")[0];
}

name = name.replace(".", " ");
name = name.replace(/\b\w/g, l => l.toUpperCase());

loggedInUser = name;
document.getElementById("userName").innerText = name;

// Generate initials for avatar
const initials = name
  .split(" ")
  .map(n => n[0])
  .join("")
  .toUpperCase();

document.getElementById("userAvatar").innerText = initials;

  } catch (err) {
    console.error("User load error:", err);
    document.getElementById("userName").innerText = "Error";
  }
}

// ======================
// Toggle User Menu
// ======================
function toggleUserMenu() {

  const menu = document.getElementById("profileMenu");

  if (menu.classList.contains("hidden")) {
    menu.classList.remove("hidden");
  } else {
    menu.classList.add("hidden");
  }

}

// ======================
// Logout Function
// ======================
function logout() {
  window.location.href = "/.auth/logout";
}

// ======================
// Run on Page Load
// ======================
window.onload = function () {
  loadUser();
  loadTools(); // keep this here

  // ✅ SHOW DASHBOARD BY DEFAULT
  const dashboard = document.getElementById("dashboardSection");
  const toolForm = document.getElementById("toolDetailsSection");
  const sidebar = document.getElementById("workflowSidebar");

  if (dashboard) dashboard.style.display = "block";
  if (toolForm) toolForm.classList.add("hidden");
  if (sidebar) sidebar.classList.add("hidden");

  // SOW logic
const dropdown = document.getElementById("sowType");
const sowSection = document.getElementById("sowSection");

if (dropdown && sowSection) {
  function toggleSOW() {
    sowSection.classList.toggle("hidden", dropdown.value !== "yes");
  }
  dropdown.addEventListener("change", toggleSOW);
  toggleSOW();
}
};
