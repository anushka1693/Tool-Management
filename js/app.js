// ================= TOGGLE AUDIT =================
function toggleAuditIT() {
  const el = document.getElementById("auditITContainer");

  if (!el) {
    console.log("Audit container not found ❌");
    return;
  }

  el.style.display = el.style.display === "none" ? "block" : "none";
}

// ================= ADD AUDIT =================
function addAuditEntry(question, action) {
  const tbody = document.getElementById("auditITBody");
  if (!tbody) return;

  const user = document.getElementById("userAvatar")?.innerText || "NA";
  const now = new Date().toLocaleString();

  const row = `
    <tr>
      <td class="border p-1">${now}</td>
      <td class="border p-1">${user}</td>
      <td class="border p-1">${action}</td>
      <td class="border p-1">${question}</td>
    </tr>
  `;

  tbody.innerHTML = row + tbody.innerHTML;
}

// ================= SIGN OFF ROW =================
function signOffRow(btn, question) {

  const row = btn.closest("tr");
  const ownerInput = row.querySelector(".owner-input");
  const user = document.getElementById("userAvatar")?.innerText || "NA";

  const isSigned = btn.classList.contains("signed");

  if (isSigned) {
    // 🔁 UNDO
    btn.classList.remove("signed");
    btn.innerText = "Sign Off";

    row.querySelectorAll("input, select").forEach(el => el.disabled = false);
    row.style.backgroundColor = "";

  } else {
    // ✅ SIGN
    btn.classList.add("signed");

    if (!ownerInput.value) {
      ownerInput.value = user;
    }

    row.querySelectorAll("input, select").forEach(el => el.disabled = true);

    btn.innerText = "✔ Signed";
    row.style.backgroundColor = "#e6fffa";

    addAuditEntry(question, "Signed Off");
    addAuditLog({
  step: getCurrentStepName(),
  question,
  action: "Signed Off",
  value: user
});
  }
}

let loggedInUser = "";

// =======================
// GLOBAL STATE
// =======================

let tools = [];
let auditTrail = [];
let selectedToolType = "new";
let filter = "all";

function getExpiryAlert(dateString, type) {
  if (!dateString) return "";

  const today = new Date();
  const expiry = new Date(dateString);

  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return `❌ ${type} expired`;
  }

  if (diffDays <= 10) {
    return `🚨 ${type} due in ${diffDays} days`;
  }

  if (diffDays <= 15) {
    return `⚠️ ${type} due in ${diffDays} days`;
  }

  return "";
}


  // TOOL DETAILS
  check(tool.name);
  check(tool.company);
  check(tool.requestor);
  check(tool.practice);

  // NDA / MSA
  check(tool.ndaExpiryDate);
  check(tool.msaExpiryDate);

  if (total === 0) return 0;

  return Math.round((filled / total) * 100);
}

let currentToolIndex = null;

// =======================
// USER HELPERS
// =======================

function getUserInitials() {
  if (!loggedInUser) return "NA";

  return loggedInUser
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase();
}

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

    if (currentToolIndex !== null) {

  const tool = tools[currentToolIndex];

  fetch("/api/updateTool", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      partitionKey: tool.partitionKey,
      rowKey: tool.rowKey,
      step: stepIndex,
      [`progress_section${stepIndex + 1}`]: percent
    })
  }).catch(() => {});
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

const today = new Date().toLocaleDateString();

const isEdit = currentToolIndex !== null;
const existingTool = isEdit ? tools[currentToolIndex] : null;
  
const toolData = {
  toolName: name,
  companyName: company,
  requestorName: requestor,
  practiceArea: practice,
  createdBy: loggedInUser,

  requestedDate: today,
step: existingTool?.step ?? 0,
  toolType: selectedToolType
};

const url = isEdit ? "/api/updateTool" : "/api/createRequest";
  
  try {

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
     body: JSON.stringify({
  ...toolData,
  partitionKey: existingTool?.partitionKey,
  rowKey: existingTool?.rowKey
})
    });

    let result = null;

if (res.ok){
  const text = await res.text();
  console.log("API response:", text);
} else {
  const text = await res.text();
  console.error("API error:", text);
  alert("Error saving tool");
  return;
}

console.log("Saved:", result);

// ADD TOOL TO DASHBOARD STATE

const today = new Date().toLocaleDateString(); 
await loadTools();

alert("Tool saved successfully!");

closeToolForm();

  } catch (err) {

    console.error(err);
    alert("Error saving tool");

  }

}

// =======================
// SAVE NDA / MSA DATA
// =======================
async function saveNDAData() {

  if (currentToolIndex === null) {
    alert("No tool selected");
    return;
  }

  const tool = tools[currentToolIndex];

  const ndaExpiryDate = document.getElementById("ndaValidityTo")?.value || "";
  const msaExpiryDate = document.getElementById("msaValidityTo")?.value || "";

  try {

   const res = await fetch("/api/updateTool", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    partitionKey: tool.partitionKey,
    rowKey: tool.rowKey,
    ndaExpiryDate: ndaExpiryDate,
    msaExpiryDate: msaExpiryDate,
    step: 10
  })
});

if (!res.ok) {
  const text = await res.text();
  console.error("Save error:", text);
  alert("Error saving NDA/MSA");
  return;
}

    alert("NDA/MSA saved");

    await loadTools();

  } catch (err) {
    console.error(err);
    alert("Save failed");
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
  step: t.step || 0,
  requestedDate: t.requestedDate || "-",

  ndaExpiryDate: t.ndaExpiryDate || "",
  msaExpiryDate: t.msaExpiryDate || "",

  // ⭐ ADD THIS (IMPORTANT)
  progress_section1: t.progress_section1 || 0,
  progress_section2: t.progress_section2 || 0,
  progress_section3: t.progress_section3 || 0,
  progress_section4: t.progress_section4 || 0,
  progress_section5: t.progress_section5 || 0,
  progress_section6: t.progress_section6 || 0,
  progress_section7: t.progress_section7 || 0,
  progress_section8: t.progress_section8 || 0,
  progress_section9: t.progress_section9 || 0,
  progress_section10: t.progress_section10 || 0,
  progress_section11: t.progress_section11 || 0,
  progress_section12: t.progress_section12 || 0,

  partitionKey: t.partitionKey,
  rowKey: t.rowKey
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

  document.getElementById("tableBody").innerHTML =
    filtered.map((t, i) => {

    let percent = calculateOverallProgress(t);

      return `
      <tr class="border-b">
        <td class="p-2">
        <b>${t.name}</b><br/>
      
        <span style="color:red; font-size:12px;">
          ${getExpiryAlert(t.ndaExpiryDate, "NDA")}
        </span><br/>
      
        <span style="color:orange; font-size:12px;">
         ${getExpiryAlert(t.msaExpiryDate, "MSA")}
        </span>
      </td>
        <td class="p-2">${t.type}</td>
        <td class="p-2">${t.requestedDate || "-"}</td>
        <td class="p-2">${stepsList[t.step]}</td>

        <td class="p-2">
          <div class="w-full bg-gray-200 h-3 rounded">
            <div class="bg-[#800000] h-3 rounded" style="width:${percent}%"></div>
          </div>
        </td>

        <td class="p-2">${percent}%</td>

        <td class="p-2">
  <select onchange="handleAction(this.value, ${i})"
  class="border px-2 py-1 rounded">

  <option value="">Select</option>
  <option value="view">View</option>
  <option value="audit">Audit Log</option>
  <option value="dump">Data Folder</option>
  <option value="delete">Delete</option>

</select>
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

  document.getElementById("ndaValidityTo").value = tool.ndaExpiryDate || "";
  document.getElementById("msaValidityTo").value = tool.msaExpiryDate || "";

  goToStep(tool.step || 0);

setTimeout(() => {
  updateMiniDonuts(tool.step || 0);

  // 🔥 ADD THIS LOOP
  for (let i = 0; i < 12; i++) {
    updateSectionProgress("section" + (i + 1), i);
  }

}, 300);
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
  line-height:1.9;
  font-size:15px;
  padding:25px 20px;
">

  <!-- HEADER WITH LOGO -->
  <div style="
    display:flex;
    justify-content:space-between;
    align-items:center;
    margin-bottom:15px;
  ">
    
    <img src="/css/knav-logo.png" 
         style="height:45px; object-fit:contain;" />

    <div style="text-align:right;">
      <div style="font-size:18px; font-weight:600;">KNAV</div>
      <div style="font-size:12px; color:#666;">
        Tool Governance Framework
      </div>
    </div>

  </div>

  <hr style="margin:15px 0 25px 0; border:0.5px solid #ccc;">

  <!-- TITLE -->
  <h2 style="
    text-align:center;
    font-weight:600;
    margin-bottom:30px;
    letter-spacing:0.5px;
  ">
   KNAV - TOOL CLEARANCE MEMORANDUM
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

 <h4 style="margin-top:15px; margin-bottom:5px; font-weight:600;">
  3.2 Vendor Assessment
</h4>
  <p>• <b>Vendor Questionnaire Completed:</b> ${getVal("dtClearance") || "Pending"}</p>
  <p>• <b>Data Security Measures:</b> Not Available</p>
  <p>• <b>Hosting Location:</b> Not Available</p>
  <p>• <b>Compliance Certifications:</b> Not Available</p>

  <hr style="margin:30px 0; border-top:1px solid #e5e5e5;">

  <h3 style="margin-top:25px; margin-bottom:10px; font-weight:600;">
  4. Risk & Compliance Overview
</h3>

 <h4 style="margin-top:15px; margin-bottom:5px; font-weight:600;">
  4.1 IT Clearance
</h4>
 <p style="margin-left:15px;">• <b>Status:</b> Pending</p>
 <p style="margin-left:15px;">• <b>Comments:</b> Not available</p>

  <h4 style="margin-top:15px; margin-bottom:5px; font-weight:600;">
  4.2 Data Security & Privacy
</h4>
  <p style="margin-left:15px;">• <b>PII / Sensitive Data:</b> Not available</p>
  <p style="margin-left:15px;">• <b>Data Residency Impact:</b> Not available</p>
  <p style="margin-left:15px;">• <b>Encryption Controls:</b> Not available</p>

 <h4 style="margin-top:15px; margin-bottom:5px; font-weight:600;">
  4.3 Legal Documentation
</h4>
  <p style="margin-left:15px;">• <b>NDA:</b> Not available</p>
  <p style="margin-left:15px;">• <b>MSA:</b> Not available</p>
  <p style="margin-left:15px;">• <b>SOW:</b> Not available</p>

  <hr style="margin:30px 0; border-top:1px solid #e5e5e5;">

 <h3 style="margin-top:25px; margin-bottom:10px; font-weight:600;">
  5. Business Approval
</h3>
  <p>• <b>Status:</b> ${getVal("partnerDecision") || "Pending"}</p>
  <p>• <b>Approving Partner:</b> Not Available</p>
  <p>• <b>Approval Date:</b> Not Available</p>

<hr style="margin:30px 0; border-top:1px solid #e5e5e5;">

  <h3 style="margin-top:25px; margin-bottom:10px; font-weight:600;">
  6. Pilot Testing
</h3>
  <p>• <b>Pilot Conducted:</b> Not Available</p>
  <p>• <b>Number of Test Cases:</b> Not Available</p>

  <p><b>Pilot Summary</b><br>Not Available</p>
  <p><b>Key Observations</b><br>Not Available</p>

  <hr style="margin:30px 0; border-top:1px solid #e5e5e5;">

 <h3 style="margin-top:25px; margin-bottom:10px; font-weight:600;">
  7. Internal Clearances
</h3>

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

 <h3 style="margin-top:25px; margin-bottom:10px; font-weight:600;">
  8. Exceptions/Deviations
</h3>
  <p>None</p>

<hr style="margin:30px 0; border-top:1px solid #e5e5e5;">

 <h3 style="margin-top:25px; margin-bottom:10px; font-weight:600;">
  9. Final Decision
</h3>
  <p>• <b>Status:</b> Pending</p>
  <p>• <b>Conditions:</b> None</p>

  <hr style="margin:30px 0; border-top:1px solid #e5e5e5;">

 <h3 style="margin-top:25px; margin-bottom:10px; font-weight:600;">
  10. Roll out Plan
</h3>
  <p>• <b>Status:</b> Not Started</p>
  <p>• <b>Users:</b> Not Available</p>
  <p>• <b>Go-Live Date:</b> Not Available</p>

 <hr style="margin:30px 0; border-top:1px solid #e5e5e5;">

<h3 style="margin-top:25px; margin-bottom:10px; font-weight:600;">
  11. Audit Trail
</h3>
  <p>• <b>Completion:</b> Not Calculated</p>
  <p>• <b>All Steps Completed:</b> No</p>

 <hr style="margin:30px 0; border-top:1px solid #e5e5e5;">

 <h3 style="margin-top:25px; margin-bottom:10px; font-weight:600;">
  12. Declaration
</h3>
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

const sectionId = "section" + (step + 1);
  
attachProgressTracking(sectionId, step);
updateSectionProgress(sectionId, step);

  if (step === 4) {
  updatePartnerDecisionOptions();
}

  if (step === 5) {
    loadPilotSection();
     attachProgressTracking("section6", 5);
} 

if (step === 7) {
  loadAIChecklist();
}

if (step === 8) {
  setTimeout(() => {
    try {
      generateToolMemo();
    } catch (e) {
      console.error("Memo error:", e);
    }
  }, 100);
}

if (step === 9) {
  loadQCChecklist();
}

  updateWorkflowUI(step);
}

// =======================
// NEXT STEP
// =======================

async function nextStep() {

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
while (currentStep < 11) {
  currentStep++;

  const nextSection = document.getElementById("section" + (currentStep + 1));

  if (!nextSection || !nextSection.classList.contains("hidden-by-type")) {
    break;
  }
}

  // update tool state if exists
if (currentToolIndex !== null) {

  const tool = tools[currentToolIndex];

  try {
    await fetch("/api/updateTool", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        partitionKey: tool.partitionKey,
        rowKey: tool.rowKey,
        step: currentStep
      })
    });

  } catch (err) {
    console.error("Step update failed:", err);
  }
}

  // show next section
  showSection(currentStep);
  render();
}

// =======================
// CLICK SIDE STEP
// =======================

async function goToStep(step) {

  if (currentToolIndex === null) {
    showSection(step);
    updateWorkflowUI(step);
    return;
  }

const tool = tools[currentToolIndex];

try {
  await fetch("/api/updateTool", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      partitionKey: tool.partitionKey,
      rowKey: tool.rowKey,
      step: step
    })
  });

} catch (err) {
  console.error("Step update failed:", err);
}

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

const tool = tools[currentToolIndex];

if (tool && tool[`progress_section${i+1}`] !== undefined) {
  percent = tool[`progress_section${i+1}`];
} else {
  percent = 0;
}

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
  { section: "Access Control", team: "IT", question: "Are user roles and permissions formally documented and approved?" },
  { section: "Access Control", team: "IT", question: "Is periodic user access review performed (e.g., quarterly)?" },
  { section: "Access Control", team: "IT", question: "Can user access be revoked immediately upon employee termination?" },

  { section: "Authentication", team: "IT", question: "Does the tool support Single Sign-On (SSO) via Azure AD or enterprise identity provider?" },
  { section: "Authentication", team: "IT", question: "Is session timeout configured for inactive users?" },

  { section: "Change Management", team: "IT", question: "Is there a documented change management process for system updates?" },
  { section: "Change Management", team: "IT", question: "Are changes tested and approved before deployment to production?" },
  { section: "Change Management", team: "IT", question: "Is version control used for source code management (e.g., Git)?" },
  { section: "Change Management", team: "IT", question: "Are rollback or recovery mechanisms available for failed deployments?" },

  { section: "Infrastructure & Hosting", team: "IT", question: "Where is the tool hosted (Azure, AWS, on-premise, or SaaS)?" },
  { section: "Infrastructure & Hosting", team: "IT", question: "Is data encrypted both at rest and in transit?" },
  { section: "Infrastructure & Hosting", team: "IT", question: "Are system backups performed regularly?" },
  { section: "Infrastructure & Hosting", team: "IT", question: "What are the defined Recovery Point Objective (RPO) and Recovery Time Objective (RTO)?" },

  { section: "Security & Monitoring", team: "IT", question: "Has the tool undergone vulnerability assessment and penetration testing (VAPT)?" },
  { section: "Security & Monitoring", team: "IT", question: "Are identified vulnerabilities tracked and remediated?" },
  { section: "Security & Monitoring", team: "IT", question: "Are system and access logs monitored for suspicious activity?" },
  { section: "Security & Monitoring", team: "IT", question: "Is endpoint protection or antivirus implemented where applicable?" }

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
      <td class="p-2 border">
      <input type="text" placeholder="Answer" class="answer-input w-full border rounded p-1">
    </td>
      <td class="p-2 border">

      <input
      type="file"
      multiple
      onchange="handleFileUpload(this)"
      class="w-full text-sm">
      
      <div class="file-list text-xs mt-2 space-y-1"></div>
      
      </td>
      <td class="p-2 border">
  <div style="display:flex; gap:6px; align-items:center;">
    
    <input 
      type="text" 
      placeholder="Owner" 
      class="owner-input border rounded p-1 w-20"
    >

<button 
  onclick="signOffRow(this, '${item.question.replace(/'/g, "")}')"
  class="bg-green-600 text-white px-2 py-1 rounded text-xs">
  Sign Off
</button>

  </div>
</td>
      <td class="p-2 border">
        <select class="status-select w-full border rounded p-1">
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

attachITAuditListeners();

function attachITAuditListeners() {

  const rows = document.querySelectorAll("#itChecklist tr");

  rows.forEach(row => {

    const question = row.children[2]?.innerText;

    const answer = row.querySelector(".answer-input");
    const owner = row.querySelector(".owner-input");
    const status = row.querySelector(".status-select");

    if (answer) {
      answer.addEventListener("change", () => {
        addAuditLog({
          step: getCurrentStepName(),
          question,
          action: "Answer Updated",
          value: answer.value
        });
      });
    }

    if (owner) {
      owner.addEventListener("change", () => {
        addAuditLog({
          step: getCurrentStepName(),
          question,
          action: "Owner Updated",
          value: owner.value
        });
      });
    }

    if (status) {
      status.addEventListener("change", () => {
        addAuditLog({
         step: getCurrentStepName(),
          question,
          action: "Status Updated",
          value: status.value
        });
      });
    }

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

  { section: "Business Fit", team: "DT", question: "What business problem or process does this tool address?" },
  { section: "Business Fit", team: "DT", question: "Which teams or functions will use this tool?" },
  { section: "Business Fit", team: "DT", question: "Will this tool replace an existing system or manual process?" },
  { section: "Business Fit", team: "DT", question: "Does this tool duplicate functionality available in existing systems?" },

  { section: "Architecture", team: "DT", question: "Is the tool cloud-based or on-premise?" },
  { section: "Architecture", team: "DT", question: "Is the system architecture documented?" },
  { section: "Architecture", team: "DT", question: "Can the tool scale to support future users and data growth?" },

  { section: "Integration & Automation", team: "DT", question: "Does the tool support automation through APIs or platforms such as Power Automate?" },
  { section: "Integration & Automation", team: "DT", question: "Which enterprise systems does it integrate with (e.g., Azure AD, SharePoint, ERP, CRM)?" },
  { section: "Integration & Automation", team: "DT", question: "Are APIs available for integration with other systems?" },

  { section: "Data & Security", team: "DT", question: "What type of data will be captured or processed by the tool?" },
  { section: "Data & Security", team: "DT", question: "Does the tool process sensitive or confidential data (e.g., PII)?" },
  { section: "Data & Security", team: "DT", question: "Where will the data be stored or hosted (region/cloud provider)?" }

];

// =======================
// AI CHECKLIST DATA
// =======================

const aiChecklistData = [

  { section: "Governance & Oversight", team: "AI", question: "Is there human oversight for AI-generated outputs or decisions?" },
  { section: "Governance & Oversight", team: "AI", question: "Are AI outputs reviewed or validated before use in critical processes?" },
  { section: "Governance & Oversight", team: "AI", question: "Is there an approval process for deploying or using AI models?" },
  { section: "Governance & Oversight", team: "AI", question: "Are policies in place governing responsible AI usage?" },

  { section: "Bias & Fairness", team: "AI", question: "Has bias testing been conducted on the AI model?" },
  { section: "Bias & Fairness", team: "AI", question: "Are AI outputs monitored to detect bias or unfair outcomes?" },
  { section: "Bias & Fairness", team: "AI", question: "Are mitigation controls implemented if bias is detected?" },

  { section: "Data Usage & Privacy", team: "AI", question: "What datasets are used to train or fine-tune the AI model?" },
  { section: "Data Usage & Privacy", team: "AI", question: "Is client or confidential data used for training or inference?" },
  { section: "Data Usage & Privacy", team: "AI", question: "Is sensitive data anonymized or masked before use?" },
  { section: "Data Usage & Privacy", team: "AI", question: "Are data usage policies defined for AI inputs and outputs?" },

  { section: "Transparency & Explainability", team: "AI", question: "Is the AI model explainable or interpretable where required?" },
  { section: "Transparency & Explainability", team: "AI", question: "Are AI-generated outputs traceable and auditable?" },
  { section: "Transparency & Explainability", team: "AI", question: "Is documentation available describing model behavior and limitations?" },

  { section: "Security & Risk", team: "AI", question: "Are AI prompts, inputs, and outputs logged securely?" },
  { section: "Security & Risk", team: "AI", question: "Is there a risk of sensitive data leakage through prompts or responses (LLM risk)?" },
  { section: "Security & Risk", team: "AI", question: "Are controls in place to prevent unauthorized use of AI models?" }

];

// =======================
// QC CHECKLIST DATA
// =======================

const qcChecklistData = [

  { section: "Audit Trail", team: "QC", question: "Does the system maintain audit logs for user actions?" },
  { section: "Audit Trail", team: "QC", question: "Are audit logs immutable and protected from modification?" },
  { section: "Audit Trail", team: "QC", question: "Can audit logs be exported for review or investigation?" },

  { section: "Compliance & Controls", team: "QC", question: "Is the tool compliant with applicable standards (e.g., SOC 1 / SOC 2 / ITGC)?" },
  { section: "Compliance & Controls", team: "QC", question: "Are internal controls documented and monitored?" },

  { section: "Data Retention", team: "QC", question: "What is the defined data retention policy for the tool?" },
  { section: "Data Retention", team: "QC", question: "Can data be archived according to retention policies?" },
  { section: "Data Retention", team: "QC", question: "Are data deletion processes controlled and documented?" },

  { section: "Documentation & Evidence", team: "QC", question: "Are approvals and key decisions documented?" },
  { section: "Documentation & Evidence", team: "QC", question: "Are system documents and policies version-controlled?" },
  { section: "Documentation & Evidence", team: "QC", question: "Is there evidence of IT approval, DT approval, and Partner approval?" },

  { section: "Risk Management", team: "QC", question: "Has a risk assessment been performed for the tool?" },
  { section: "Risk Management", team: "QC", question: "Is a risk rating assigned (Low / Medium / High)?" },
  { section: "Risk Management", team: "QC", question: "Are mitigation actions defined for identified risks?" },

  { section: "Final Review", team: "QC", question: "Have all required approvals been completed?" },
  { section: "Final Review", team: "QC", question: "Are contractual documents (e.g., NDA / MSA) signed and stored?" }

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

function signOffIT() {

  const initials = getUserInitials();

  const rows = document.querySelectorAll("#itChecklist tr");

  rows.forEach(row => {

    const owner = row.querySelector(".owner-input");
    const question = row.children[2]?.innerText;

    if (owner && !owner.value) {
      owner.value = initials;

      addAuditLog({
        step: "IT Clearance",
        question,
        action: "Signed Off",
        value: initials
      });
    }

  });

  alert("IT Clearance Signed Off");
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

async function addAuditLog({ step, question, action, value }) {

  try {

    const toolId =
      tools[currentToolIndex]?.name ||
      document.getElementById("toolName")?.value ||
      "unknown";

    await fetch("/api/logAudit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        toolId,
        step,
        action,
        details: `${question || ""} ${value || ""}`,
        user: getUserInitials()
      })
    });

  } catch (err) {
    console.error("Audit failed:", err);
  }
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

attachProgressTracking("section1", 0);
attachProgressTracking("section2", 1);
attachProgressTracking("section3", 2);
attachProgressTracking("section4", 3);
attachProgressTracking("section5", 4);
attachProgressTracking("section6", 5);
attachProgressTracking("section7", 6);
attachProgressTracking("section8", 7);
attachProgressTracking("section9", 8);
attachProgressTracking("section10", 9);
attachProgressTracking("section11", 10);
attachProgressTracking("section12", 11);

// ======================
// Load Logged-in User
// ======================
async function loadUser() {
  try {
    const res = await fetch("/.auth/me");

if (!res.ok) {
  console.error("API failed");

  document.getElementById("tableBody").innerHTML =
    "<tr><td colspan='7'>Failed to load data</td></tr>";

  return;
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

async function handleAction(action, index) {

  if (!action) return;

  const tool = tools[index];

  if (action === "view") {
    openTool(index);
  }

  if (action === "audit") {
    showAudit(tool.name);
  }

  if (action === "dump") {
    showDataDump(tool.name);
  }

  if (action === "delete") {

    const confirmDelete = confirm(`Delete "${tool.name}"?`);
    if (!confirmDelete) return;

    try {

      await fetch("/api/deleteTool", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          partitionKey: tool.partitionKey,
          rowKey: tool.rowKey
        })
      });

      alert("Deleted successfully");

      await loadTools(); // reload from backend

    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  }
}

async function showAudit(toolId) {

  try {
    const res = await fetch(`/api/getAudit?toolId=${toolId}`);
    const data = await res.json();

    if (!data.length) {
      alert("No audit records found");
      return;
    }

    // GROUP BY STEP
    const grouped = {};

    data.forEach(item => {
      if (!grouped[item.step]) {
        grouped[item.step] = [];
      }
      grouped[item.step].push(item);
    });

    let html = `<h2 style="font-weight:bold;">Audit Trail</h2>`;

    Object.keys(grouped).forEach(step => {

      html += `<h3 style="margin-top:15px; color:#800000;">${step}</h3>`;

      grouped[step].forEach(item => {
        html += `
          <div style="border-bottom:1px solid #ddd; padding:8px;">
            <b>${item.action}</b><br/>
            ${item.details || ""}
            <br/>
            <small>
              ${item.user} | ${new Date(item.timestamp).toLocaleString()}
            </small>
          </div>
        `;
      });

    });

    const win = window.open("", "Audit", "width=600,height=500");
    win.document.write(html);

  } catch (err) {
    console.error(err);
    alert("Error loading audit");
  }
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

function downloadPDF() {
  const element = document.getElementById("toolMemoContent");

  if (!element) {
    alert("Memo not found");
    return;
  }

  html2pdf()
    .from(element)
    .save("Tool_Memo.pdf");
}

function downloadWord() {
  const element = document.getElementById("toolMemoContent");

  if (!element) return;

  const html = `
    <html>
      <head><meta charset="UTF-8"></head>
      <body>${element.innerHTML}</body>
    </html>
  `;

  const blob = new Blob(['\ufeff', html], {
    type: 'application/msword'
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "Tool_Memo.doc";
  link.click();
}

function renderITAuditTrail() {

  const tbody = document.getElementById("auditITBody");
  if (!tbody) return;

  tbody.innerHTML = "";

  const itLogs = auditTrail.filter(log => log.step === "IT Clearance");

  itLogs.forEach(log => {

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td class="p-2 border">${log.timestamp}</td>
      <td class="p-2 border font-semibold">${log.user}</td>
      <td class="p-2 border">${log.action}</td>
      <td class="p-2 border">${log.question || "-"}</td>
    `;

    tbody.appendChild(tr);
  });
}

