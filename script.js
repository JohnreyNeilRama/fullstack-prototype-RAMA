// ========================
// GLOBAL STATE + DATABASE
// ========================

const STORAGE_KEY = "ipt_demo_v1";

let currentUser = null;

window.db = {
  accounts: [],
  departments: [],
  employees: [],
  requests: []
};

// --------------------------
// STORAGE SYSTEM
// --------------------------

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) throw new Error("No storage");

    const parsed = JSON.parse(raw);

    if (!parsed.accounts || !parsed.departments)
      throw new Error("Invalid structure");

    window.db = parsed;

  } catch (e) {
    console.warn("Seeding fresh database...");

    window.db = {
      accounts: [
        {
          firstName: "Admin",
          lastName: "User",
          email: "admin@gmail.com",
          password: "admin123",
          role: "Admin",
          verified: true
        }
      ],
      departments: [
        { name: "Engineering", description: "Software Development" },
        { name: "HR", description: "Human Resources" }
      ],
      employees: [],
      requests: []
    };

    saveToStorage();
  }
}

function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(window.db));
}

// ========================
// INITIALIZATION
// ========================

window.addEventListener("load", () => {

  loadFromStorage();

  const token = localStorage.getItem("auth_token");
  if (token) {
    const user = window.db.accounts.find(acc => acc.email === token);
    if (user) setAuthState(true, user);
  }

  if (!window.location.hash) navigateTo("");
  handleRouting();
});

// ========================
// AUTH STATE MANAGEMENT
// ========================

function setAuthState(isAuth, user = null) {

  if (isAuth && user) {

    currentUser = {
      name: user.firstName + " " + user.lastName,
      email: user.email,
      role: user.role
    };

    localStorage.setItem("auth_token", user.email);

    document.body.className =
      user.role === "Admin"
        ? "authenticated is-admin"
        : "authenticated";

    updateProfileUI(user);

  } else {

    currentUser = null;
    localStorage.removeItem("auth_token");
    document.body.className = "not-authenticated";

    if (document.getElementById("userRole"))
      document.getElementById("userRole").innerText = "Guest";
  }
}

function updateProfileUI(user) {
  if (document.getElementById("userRole"))
    document.getElementById("userRole").innerText = user.role;

  if (document.getElementById("profileName"))
    document.getElementById("profileName").innerText =
      "Name: " + user.firstName + " " + user.lastName;

  if (document.getElementById("profileEmail"))
    document.getElementById("profileEmail").innerText =
      "Email: " + user.email;

  if (document.getElementById("profileRole"))
    document.getElementById("profileRole").innerText =
      "Role: " + user.role;
}

// ========================
// ROUTING
// ========================

function navigateTo(path) {
  window.location.hash = "#/" + path;
}

function handleRouting() {

  let hash = window.location.hash || "#/";
  let route = hash.replace("#/", "");
  let pageId = route ? route + "-page" : "dashboard-page";

  document.querySelectorAll(".page")
    .forEach(p => p.classList.remove("active"));

  if (!currentUser) {
    if (["profile","employees","accounts","departments","requests"]
      .includes(route)) {
      navigateTo("login");
      pageId = "login-page";
    }
  } else {
    if (currentUser.role !== "Admin" &&
        ["employees","accounts","departments"]
        .includes(route)) {
      navigateTo("profile");
      pageId = "profile-page";
    }
  }

  const page = document.getElementById(pageId);
  if (page) page.classList.add("active");

  // Render profile on profile page
  if (route === "profile") renderProfile();

  if (route === "accounts") renderAccounts();
  if (route === "employees") renderEmployees();
  if (route === "departments") renderDepartments();
  if (route === "requests") renderRequestsTable();
}

window.addEventListener("hashchange", handleRouting);

// ========================
// LOGOUT
// ========================

function logout() {
  setAuthState(false);
  navigateTo("");
}

// ========================
// REGISTER
// ========================

document.getElementById("registerForm")
.addEventListener("submit", function(e) {

  e.preventDefault();

  const firstName = registerFirstName.value.trim();
  const lastName = registerLastName.value.trim();
  const email = registerEmail.value.trim();
  const password = registerPassword.value;

  if (password.length < 6) {
    alert("Password must be at least 6 characters!");
    return;
  }

  if (window.db.accounts.some(acc => acc.email === email)) {
    alert("Email already exists!");
    return;
  }

  window.db.accounts.push({
    firstName,
    lastName,
    email,
    password,
    role: "User",
    verified: false
  });

  saveToStorage();

  localStorage.setItem("unverified_email", email);
  navigateTo("verify");
});

// ========================
// VERIFY EMAIL
// ========================

function simulateVerification() {
  const email = localStorage.getItem("unverified_email");
  if (!email) return;

  const account = window.db.accounts.find(acc => acc.email === email);

  if (account) {
    account.verified = true;
    saveToStorage();
  }

  localStorage.removeItem("unverified_email");

  // Show success message
  const successAlert = document.getElementById("verificationSuccess");
  if (successAlert) {
    successAlert.classList.remove("d-none");
  }

  // Wait 1.5 seconds before navigating to login
  setTimeout(() => {
    navigateTo("login");
  }, 3000);
}

// ========================
// LOGIN
// ========================

document.getElementById("loginForm")
.addEventListener("submit", function(e) {

  e.preventDefault();

  const email = loginEmail.value.trim();
  const password = loginPassword.value;

  const user = window.db.accounts.find(acc =>
    acc.email === email &&
    acc.password === password &&
    acc.verified
  );

  if (!user) {
    alert("Invalid credentials or account not verified!");
    return;
  }

  setAuthState(true, user);
  navigateTo("profile");
});

// ========================
// PHASE 5: PROFILE PAGE
// ========================

// Render profile information on Profile page
function renderProfile() {
  if (!currentUser) return;

  const account = window.db.accounts.find(acc => acc.email === currentUser.email);
  if (!account) return;

  document.getElementById("profileName").innerText = "Name: " + account.firstName + " " + account.lastName;
  document.getElementById("profileEmail").innerText = "Email: " + account.email;
  document.getElementById("profileRole").innerText = "Role: " + account.role;

  // Show view mode
  document.getElementById("profileView").style.display = "block";
  document.getElementById("profileEditForm").style.display = "none";
}

// Enable edit mode
function enableProfileEdit() {
  const account = window.db.accounts.find(acc => acc.email === currentUser.email);
  if (!account) return;

  document.getElementById("editFirstName").value = account.firstName;
  document.getElementById("editLastName").value = account.lastName;
  document.getElementById("editPassword").value = account.password;

  document.getElementById("profileView").style.display = "none";
  document.getElementById("profileEditForm").style.display = "block";
}

// Cancel profile editing
function cancelProfileEdit() {
  document.getElementById("profileEditForm").style.display = "none";
  document.getElementById("profileView").style.display = "block";
}

// Submit profile changes
document.getElementById("profileEditForm")
.addEventListener("submit", function(e){

  e.preventDefault();

  const firstName = editFirstName.value;
  const lastName = editLastName.value;
  const password = editPassword.value;

  const account = window.db.accounts.find(acc => acc.email === currentUser.email);
  if (!account) return;

  account.firstName = firstName;
  account.lastName = lastName;
  account.password = password;

  saveToStorage();
  setAuthState(true, account); // update currentUser and UI

  alert("Profile updated successfully!");
  renderProfile();
});

// ========================
// ACCOUNTS Phase 6
// ========================

function renderAccounts() {
  const tbody = document.getElementById("accountTableBody");
  tbody.innerHTML = "";

  if (!window.db.accounts || window.db.accounts.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center">No accounts</td></tr>`;
    return;
  }

  window.db.accounts.forEach(acc => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${acc.firstName} ${acc.lastName}</td>
      <td>${acc.email}</td>
      <td>${acc.role}</td>
      <td>${acc.verified ? "✔" : "✖"}</td>
      <td>
        <button class="btn btn-sm btn-primary2 me-1" onclick="editAccount('${acc.email}')">Edit</button>
        <button class="btn btn-sm btn-warning me-1" onclick="resetAccountPassword('${acc.email}')">Reset Password</button>
        <button class="btn btn-sm btn-danger" onclick="deleteAccount('${acc.email}')">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// ------------------------
// Show Add Account Form
// ------------------------
function showAccountForm() {
  const wrapper = document.getElementById("accountForm");
  const form = document.getElementById("accountFormFields");

  wrapper.dataset.editEmail = "";
  form.reset();
  wrapper.style.display = "block";
}


// ------------------------
// Hide Account Form
// ------------------------
function hideAccountForm() {
  const wrapper = document.getElementById("accountForm");
  const form = document.getElementById("accountFormFields");

  form.reset();
  wrapper.style.display = "none";
}

// ------------------------
// Edit Account
// ------------------------
function editAccount(email) {
  const acc = window.db.accounts.find(a => a.email === email);
  if (!acc) return;

  document.getElementById("accFirstName").value = acc.firstName;
  document.getElementById("accLastName").value = acc.lastName;
  document.getElementById("accEmail").value = acc.email;
  document.getElementById("accPassword").value = acc.password;
  document.getElementById("accRole").value = acc.role;
  document.getElementById("accVerified").checked = acc.verified;

  const form = document.getElementById("accountForm");
  form.dataset.editEmail = acc.email; // track editing
  form.style.display = "block";
}

// ------------------------
// Delete Account
// ------------------------
function deleteAccount(email) {
  if (email === currentUser.email) {
    alert("Cannot delete your own account.");
    return;
  }

  if (!confirm("Are you sure you want to delete this account?")) return;

  window.db.accounts = window.db.accounts.filter(acc => acc.email !== email);
  saveToStorage();
  renderAccounts();
}

// ------------------------
// Reset Password
// ------------------------
function resetAccountPassword(email) {
  const acc = window.db.accounts.find(a => a.email === email);
  if (!acc) return;

  const newPassword = prompt("Enter new password (min 6 chars):");
  if (!newPassword || newPassword.length < 6) {
    alert("Password must be at least 6 characters");
    return;
  }

  acc.password = newPassword;
  saveToStorage();
  alert("Password reset successfully!");
}

// ------------------------
// Submit Add/Edit Account
// ------------------------
document.getElementById("accountFormFields").addEventListener("submit", function(e) {
  e.preventDefault();

  const firstName = document.getElementById("accFirstName").value.trim();
  const lastName = document.getElementById("accLastName").value.trim();
  const email = document.getElementById("accEmail").value.trim();
  const password = document.getElementById("accPassword").value.trim();
  const role = document.getElementById("accRole").value;
  const verified = document.getElementById("accVerified").checked;

  if (!firstName || !lastName || !email || !password || !role) {
    alert("All fields are required!");
    return;
  }

  if (password.length < 6) {
    alert("Password must be at least 6 characters!");
    return;
  }

  const form = this.closest("#accountForm");
  const editEmail = form.dataset.editEmail;

  if (editEmail) {
    // Update existing account
    const acc = window.db.accounts.find(a => a.email === editEmail);
    if (!acc) return;

    acc.firstName = firstName;
    acc.lastName = lastName;
    acc.email = email; // allow email edit
    acc.password = password;
    acc.role = role;
    acc.verified = verified;

    form.dataset.editEmail = "";
  } else {
    // Add new account
    if (window.db.accounts.some(a => a.email === email)) {
      alert("Email already exists!");
      return;
    }

    window.db.accounts.push({ firstName, lastName, email, password, role, verified });
  }

  saveToStorage();
  renderAccounts();
  hideAccountForm();
});

// ------------------------
// Initial Render
// ------------------------
window.addEventListener("load", () => {
  renderAccounts();
});

// ========================
// Employees Functions
// ========================

function renderEmployees() {
  const tbody = document.getElementById("employeeTableBody");
  tbody.innerHTML = "";

  const employees = window.db.employees || [];

  if (employees.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center">No employees</td></tr>`;
    return;
  }

  employees.forEach(emp => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${emp.id}</td>
      <td>${emp.email}</td>
      <td>${emp.position}</td>
      <td>${emp.department}</td>
      <td>
        <button class="btn btn-sm btn-warning" onclick="editEmployee('${emp.id}')">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteEmployee('${emp.id}')">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function showEmployeeForm() {
  document.getElementById("employeeForm").style.display = "block";
}

function hideEmployeeForm() {
  const form = document.getElementById("employeeFormFields");
  if (form) form.reset();

  document.getElementById("empId").disabled = false;
  document.getElementById("employeeForm").style.display = "none";
}

function deleteEmployee(id) {
  if (!confirm("Are you sure you want to delete this employee?")) return;

  window.db.employees = (window.db.employees || []).filter(emp => emp.id !== id);
  saveToStorage();
  renderEmployees();
}

function editEmployee(id) {
  const emp = (window.db.employees || []).find(e => e.id === id);
  if (!emp) return;

  document.getElementById("empId").value = emp.id;
  document.getElementById("empId").disabled = true; // Prevent editing ID
  document.getElementById("empEmail").value = emp.email;
  document.getElementById("empPosition").value = emp.position;
  document.getElementById("empDept").value = emp.department;
  document.getElementById("empHireDate").value = emp.hireDate || "";

  showEmployeeForm();
}

// Attach event listener after DOM loaded
window.addEventListener("load", () => {
  populateDepartmentDropdown();
  renderEmployees();

  const employeeForm = document.getElementById("employeeFormFields");

  if (employeeForm) {
    employeeForm.addEventListener("submit", function(e) {
      e.preventDefault();

      const id = document.getElementById("empId").value.trim();
      const email = document.getElementById("empEmail").value.trim();
      const position = document.getElementById("empPosition").value.trim();
      const department = document.getElementById("empDept").value;
      const hireDate = document.getElementById("empHireDate").value.trim();

      // Basic required field validation
      if (!id || !email || !position || !department) {
        alert("Please fill in all required fields");
        return;
      }

      // ==========================================
      // ✅ REQUIRED UPDATE:
      // Validate email exists in Accounts
      // ==========================================
      const accountExists = (window.db.accounts || []).some(acc =>
        acc.email.toLowerCase() === email.toLowerCase()
      );

      if (!accountExists) {
        alert("User email does not exist. Please use a registered account email.");
        return;
      }
      // ==========================================

      const existingIndex = (window.db.employees || []).findIndex(emp => emp.id === id);

      if (existingIndex >= 0) {
        // Update existing employee
        window.db.employees[existingIndex] = { id, email, position, department, hireDate };
      } else {
        // Add new employee
        window.db.employees = window.db.employees || [];
        window.db.employees.push({ id, email, position, department, hireDate });
      }

      saveToStorage();
      renderEmployees();
      this.reset();
      hideEmployeeForm();
    });
  }
});

// ========================
// DEPARTMENTS MANAGEMENT
// ========================

// Render all departments into the table
function renderDepartments() {
  const tbody = document.getElementById("deptTableBody");
  tbody.innerHTML = "";

  const departments = window.db.departments || [];

  if (departments.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" class="text-center">No departments</td></tr>`;
    return;
  }

  departments.forEach((dept, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${dept.name}</td>
      <td>${dept.description}</td>
      <td>
        <button class="btn btn-sm btn-primary2 me-1" onclick="editDepartment(${index})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteDepartment(${index})">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Show the department form and clear edit index if adding new
function showDeptForm() {
  const deptForm = document.getElementById("deptForm");
  deptForm.style.display = "block";

  // Only clear fields if not editing (no edit index set)
  if (!deptForm.dataset.editIndex) {
    document.getElementById("deptName").value = "";
    document.getElementById("deptDesc").value = "";
  }
}

// Hide the form and clear fields and edit index
function hideDeptForm() {
  const deptForm = document.getElementById("deptForm");
  deptForm.style.display = "none";
  deptForm.dataset.editIndex = "";
  document.getElementById("deptName").value = "";
  document.getElementById("deptDesc").value = "";
}

// Edit department: populate form and set edit index
function editDepartment(index) {
  const departments = window.db.departments || [];
  if (!departments[index]) return;

  document.getElementById("deptName").value = departments[index].name;
  document.getElementById("deptDesc").value = departments[index].description;

  const deptForm = document.getElementById("deptForm");
  deptForm.dataset.editIndex = index; // mark form as editing this index

  showDeptForm();
}

// Delete department by index
function deleteDepartment(index) {
  if (!confirm("Are you sure you want to delete this department?")) return;

  window.db.departments.splice(index, 1);
  saveToStorage();
  renderDepartments();
  populateDepartmentDropdown();
}

// Handle form submission for adding/updating department
document.getElementById("deptFormFields").addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("deptName").value.trim();
  const description = document.getElementById("deptDesc").value.trim();
  const deptForm = document.getElementById("deptForm");
  const editIndex = deptForm.dataset.editIndex;

  if (!name || !description) {
    alert("Please fill in all required fields");
    return;
  }

  const departments = window.db.departments || [];

  // Check duplicate names except current if editing
  const isDuplicate = departments.some((d, i) => d.name.toLowerCase() === name.toLowerCase() && i != editIndex);
  if (isDuplicate) {
    alert("A department with this name already exists.");
    return;
  }

  if (editIndex !== undefined && editIndex !== "") {
    // Update existing
    window.db.departments[editIndex] = { name, description };
  } else {
    // Add new department
    window.db.departments.push({ name, description });
  }

  saveToStorage();
  renderDepartments();
  populateDepartmentDropdown();
  hideDeptForm();
});

// Show form to add a new department (clear edit index)
function showAddDepartmentForm() {
  const deptForm = document.getElementById("deptForm");
  deptForm.dataset.editIndex = ""; // clear edit index for new
  showDeptForm();
}

// Populate department dropdown for other forms (like employee form)
function populateDepartmentDropdown() {
  const deptSelect = document.getElementById("empDept");
  if (!deptSelect) return;

  deptSelect.innerHTML = '<option value="">-- Select Department --</option>';

  (window.db.departments || []).forEach(dept => {
    const option = document.createElement("option");
    option.value = dept.name;
    option.textContent = dept.name;
    deptSelect.appendChild(option);
  });
}
// ========================
// PHASE 7: USER REQUESTS (FINAL CLEAN VERSION)
// ========================

// Add dynamic item row
function addItemRow(name = "", qty = "") {
  const container = document.getElementById("itemsContainer");

  const div = document.createElement("div");
  div.classList.add("d-flex", "mb-2");

  div.innerHTML = `
    <input type="text" class="form-control me-2 item-name" placeholder="Item name" value="${name}" required>
    <input type="number" class="form-control me-2 item-qty" placeholder="Qty" min="1" value="${qty}" required>
    <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.remove()">×</button>
  `;

  container.appendChild(div);
}

// Show modal
function showRequestModal() {
  const modalEl = document.getElementById("newRequestModal");
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  modal.show();

  if (document.getElementById("itemsContainer").children.length === 0) {
    addItemRow();
  }
}

// Hide modal
function hideRequestModal() {
  const modalEl = document.getElementById("newRequestModal");
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  modal.hide();
}

// Submit request
document.getElementById("requestForm").addEventListener("submit", function(e) {
  e.preventDefault();

  if (!currentUser) {
    alert("Please login first.");
    return;
  }

  const type = document.getElementById("reqType").value;
  const itemNames = document.querySelectorAll(".item-name");
  const itemQtys = document.querySelectorAll(".item-qty");

  if (!type) {
    alert("Please select a request type.");
    return;
  }

  if (itemNames.length === 0) {
    alert("Add at least one item.");
    return;
  }

  const items = [];

  for (let i = 0; i < itemNames.length; i++) {
    const name = itemNames[i].value.trim();
    const qty = parseInt(itemQtys[i].value);

    if (!name || qty <= 0) {
      alert("Invalid item name or quantity.");
      return;
    }

    items.push({ name, qty });
  }

  const newRequest = {
    type,
    items,
    status: "Pending",
    date: new Date().toLocaleDateString(),
    employeeEmail: currentUser.email
  };

  window.db.requests.push(newRequest);
  saveToStorage();
  renderRequestsTable();

  this.reset();
  document.getElementById("itemsContainer").innerHTML = "";
  hideRequestModal();
});

// Render table (ADMIN + USER)
function renderRequestsTable() {
  const tbody = document.getElementById("requestTableBody");
  tbody.innerHTML = "";

  if (!currentUser) return;

  let requests;

  // Admin sees ALL requests
  if (currentUser.role === "Admin") {
    requests = window.db.requests;
  } 
  // User sees only their own
  else {
    requests = window.db.requests.filter(
      req => req.employeeEmail === currentUser.email
    );
  }

  if (!requests || requests.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center">No requests</td></tr>`;
    return;
  }

  requests.forEach((req, index) => {

    const itemsFormatted = req.items
      .map(i => `${i.name} (x${i.qty})`)
      .join("<br>");

    let badgeClass = "bg-warning";
    if (req.status === "Approved") badgeClass = "bg-success";
    if (req.status === "Rejected") badgeClass = "bg-danger";

    let actions = "";

    if (currentUser.role === "Admin") {
      actions = `
        <button class="btn btn-sm btn-success me-1"
          onclick="updateRequestStatus(${index}, 'Approved')">
          Approve
        </button>
        <button class="btn btn-sm btn-danger"
          onclick="updateRequestStatus(${index}, 'Rejected')">
          Reject
        </button>
      `;
    } else {
      actions = `
        <button class="btn btn-sm btn-danger"
          onclick="deleteRequest(${index})">
          Delete
        </button>
      `;
    }

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${req.employeeEmail}</td>
      <td>${req.type}</td>
      <td>${itemsFormatted}</td>
      <td>${req.date}</td>
      <td><span class="badge ${badgeClass}">${req.status}</span></td>
      <td>${actions}</td>
    `;

    tbody.appendChild(row);
  });
}

// Admin approve/reject
function updateRequestStatus(index, newStatus) {
  if (currentUser.role !== "Admin") return;

  window.db.requests[index].status = newStatus;
  saveToStorage();
  renderRequestsTable();
}

// Delete (User only)
function deleteRequest(index) {
  if (!confirm("Are you sure you want to delete this request?")) return;

  if (currentUser.role === "Admin") return;

  const userRequests = window.db.requests.filter(
    req => req.employeeEmail === currentUser.email
  );

  const reqToDelete = userRequests[index];
  if (!reqToDelete) return;

  window.db.requests = window.db.requests.filter(r => r !== reqToDelete);
  saveToStorage();
  renderRequestsTable();
}

// Auto render
window.addEventListener("load", renderRequestsTable);
window.addEventListener("hashchange", renderRequestsTable);


