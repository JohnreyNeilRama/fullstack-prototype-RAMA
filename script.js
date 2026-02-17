document.addEventListener("DOMContentLoaded", function () {

    const homeSection = document.getElementById("homeSection");
    const registerSection = document.getElementById("registerSection");
    const verifySection = document.getElementById("verifySection");

    const registerLink = document.getElementById("registerLink");
    const cancelRegister = document.getElementById("cancelRegister");
    const registerForm = registerSection.querySelector("form");

    const verifyEmailText = document.getElementById("verifyEmailText");
    const simulateVerify = document.getElementById("simulateVerify");
    const goToLogin = document.getElementById("goToLogin");
    const verificationSuccess = document.getElementById("verificationSuccess");
    const loginSection = document.getElementById("loginSection");

    const loginLink = document.getElementById("loginLink");
    const loginForm = document.getElementById("loginForm");
    const cancelLogin = document.getElementById("cancelLogin");
    const loginSuccessMsg = document.getElementById("loginSuccessMsg");
    
    const navGuest = document.getElementById("navGuest");
    const navUser = document.getElementById("navUser");
    const navUsername = document.getElementById("navUsername");
    const logoutBtn = document.getElementById("logoutBtn");
    const profileLink = document.getElementById("profileLink");
    const profileSection = document.getElementById("profileSection");

    // Employees
    const employeesLink = document.getElementById("employeesLink");
    const employeesSection = document.getElementById("employeesSection");
    const addEmployeeBtn = document.getElementById("addEmployeeBtn");
    const employeeFormCard = document.getElementById("employeeFormCard");
    const employeeForm = document.getElementById("employeeForm");
    const cancelEmployeeBtn = document.getElementById("cancelEmployeeBtn");
    const employeesTableBody = document.getElementById("employeesTableBody");

    // Departments
    const departmentsLink = document.getElementById("departmentsLink");
    const departmentsSection = document.getElementById("departmentsSection");
    const addDepartmentBtn = document.getElementById("addDepartmentBtn");
    const departmentsTableBody = document.getElementById("departmentsTableBody");
    // Add/Edit Departments
    const departmentFormCard = document.getElementById("departmentFormCard");
    const departmentForm = document.getElementById("departmentForm");
    const cancelDepartmentBtn = document.getElementById("cancelDepartmentBtn");
    const departmentName = document.getElementById("departmentName");
    const departmentDescription = document.getElementById("departmentDescription");
    const editDepartmentIndex = document.getElementById("editDepartmentIndex");

    // Accounts
    const accountsLink = document.getElementById("accountsLink");
    const accountsSection = document.getElementById("accountsSection");
    const addAccountBtn = document.getElementById("addAccountBtn");
    const accountsTableBody = document.getElementById("accountsTableBody");

    const accountFormCard = document.getElementById("accountFormCard");
    const accountForm = document.getElementById("accountForm");
    const cancelAccountBtn = document.getElementById("cancelAccountBtn");

    const accountFirstName = document.getElementById("accountFirstName");
    const accountLastName = document.getElementById("accountLastName");
    const accountEmail = document.getElementById("accountEmail");
    const accountPassword = document.getElementById("accountPassword");
    const accountRole = document.getElementById("accountRole");
    const accountVerified = document.getElementById("accountVerified");
    const editAccountIndex = document.getElementById("editAccountIndex");




      
  // Seed Default Admin (only once)
  if (!localStorage.getItem("accountsSeeded")) {
    const defaultAdmin = {
        firstName: "Admin",
        lastName: "User",
        email: "admin@example.com",
        password: "admin123",
        role: "admin",
        verified: true
    };
    localStorage.setItem("accounts", JSON.stringify([defaultAdmin]));
    localStorage.setItem("accountsSeeded", "true");
}


  // Seed default departments (only once)
if (!localStorage.getItem("departmentsSeeded")) {

    const defaultDepartments = [
        { name: "Engineering", description: "Software team" },
        { name: "HR", description: "Human Resources" }
    ];

    localStorage.setItem("departments", JSON.stringify(defaultDepartments));
    localStorage.setItem("departmentsSeeded", "true");
}



    // Hide sections on load
    registerSection.style.display = "none";
    verifySection.style.display = "none";
    verificationSuccess.style.display = "none"; // hide success message
    loginSection.style.display = "none";
    loginSuccessMsg.style.display = "none";


    // Show Register
    registerLink.addEventListener("click", function (e) {
        e.preventDefault();
        hideAllSections();
        registerSection.style.display = "block";
    });

    // Cancel Register
    cancelRegister.addEventListener("click", function () {
    hideAllSections();
    homeSection.style.display = "block";
    });


    // Handle Registration
    registerForm.addEventListener("submit", function (e) {
    e.preventDefault();

    // Collect input values
    const newUserAccount = {
        firstName: document.getElementById("registerFirstName").value,
        lastName: document.getElementById("registerLastName").value,
        email: document.getElementById("registerEmail").value,
        password: document.getElementById("registerPassword").value,
        role: "user",
        verified: false
    };

    // Save to accounts
    let accounts = JSON.parse(localStorage.getItem("accounts")) || [];
    accounts.push(newUserAccount);
    localStorage.setItem("accounts", JSON.stringify(accounts));

    // Clear the form
    registerForm.reset();

    // Hide register, show verification
    hideAllSections();
    verifySection.style.display = "block";

    // Show the email in verification section
    verifyEmailText.textContent = newUserAccount.email;
});

    

    // Simulate Verification
    simulateVerify.addEventListener("click", function () {
        let accounts = JSON.parse(localStorage.getItem("accounts")) || [];

        // Find the last unverified user
        const lastUnverifiedIndex = accounts.map(acc => acc.verified).lastIndexOf(false);

        if (lastUnverifiedIndex >= 0) {
            accounts[lastUnverifiedIndex].verified = true;
            localStorage.setItem("accounts", JSON.stringify(accounts));
            verificationSuccess.style.display = "block";
            alert(`User ${accounts[lastUnverifiedIndex].email} verified!`);
        } else {
            alert("No unverified users found.");
        }
    });


    // Go to Login (for now Home)
    // Show Login
 loginLink.addEventListener("click", function (e) {
    e.preventDefault();
    hideAllSections();
    loginSection.style.display = "block";
});



    goToLogin.addEventListener("click", function () {
    verifySection.style.display = "none";
    loginSection.style.display = "block";
    loginSuccessMsg.style.display = "block"; // show green success message
  });

  cancelLogin.addEventListener("click", function () {
    hideAllSections();
    homeSection.style.display = "block";
});

// Login logic - check accounts array
loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = loginEmail.value;
    const password = loginPassword.value;
    const accounts = JSON.parse(localStorage.getItem("accounts")) || [];

    const foundAccount = accounts.find(acc => acc.email === email && acc.password === password);

    if (!foundAccount) {
        alert("Invalid credentials.");
        return;
    }

    if (!foundAccount.verified) {
        alert("Please verify your email first.");
        return;
    }

    localStorage.setItem("currentUser", JSON.stringify(foundAccount));

    updateNavbar();
    showProfile();

    loginSection.style.display = "none";
    loginForm.reset();
});

function updateNavbar() {

    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (currentUser) {

        navGuest.classList.add("d-none");
        navUser.classList.remove("d-none");

        navUsername.textContent = currentUser.firstName;

        const adminLinks = document.querySelectorAll(".role-admin");

        adminLinks.forEach(link => {
            if (currentUser.role === "admin") {
                link.style.display = "block";
            } else {
                link.style.display = "none";
            }
        });

    } else {
        navGuest.classList.remove("d-none");
        navUser.classList.add("d-none");
    }
}

function showProfile() {

    const user = JSON.parse(localStorage.getItem("currentUser"));

    hideAllSections();
    profileSection.style.display = "block";

    document.getElementById("profileName").textContent =
        user.firstName + " " + (user.lastName || "");

    document.getElementById("profileEmail").textContent = user.email;
    document.getElementById("profileRole").textContent =
        user.role.charAt(0).toUpperCase() + user.role.slice(1);
}


profileLink.addEventListener("click", function (e) {
    e.preventDefault();
    showProfile();
});

logoutBtn.addEventListener("click", function (e) {
    e.preventDefault();

    localStorage.removeItem("currentUser");
    hideAllSections();       // Hide everything (including accounts section)
    profileSection.style.display = "none";
    homeSection.style.display = "block";

    updateNavbar();
});

// Auto login if session exists
updateNavbar();

if (localStorage.getItem("currentUser")) {
    showProfile();
}

employeesLink.addEventListener("click", function (e) {
    e.preventDefault();

    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (!currentUser || currentUser.role !== "admin") {
        alert("Access denied. Admin only.");
        return;
    }

    showEmployees();
});

departmentsLink.addEventListener("click", function (e) {
    e.preventDefault();

    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (!currentUser || currentUser.role !== "admin") {
        alert("Access denied. Admin only.");
        return;
    }

    showDepartments();
});


function showEmployees() {
    hideAllSections();
    employeesSection.style.display = "block";
    employeeFormCard.style.display = "none";
    renderEmployees();
}

function showDepartments() {
    hideAllSections();
    departmentsSection.style.display = "block";
    renderDepartments();
}



addEmployeeBtn.addEventListener("click", function () {
    employeeForm.reset();
    employeeFormCard.style.display = "block";
});

cancelEmployeeBtn.addEventListener("click", function () {
    employeeFormCard.style.display = "none";
});

employeeForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const employee = {
        id: document.getElementById("employeeId").value,
        email: document.getElementById("employeeEmail").value,
        position: document.getElementById("employeePosition").value,
        department: document.getElementById("employeeDepartment").value,
        hireDate: document.getElementById("employeeHireDate").value
    };

    let employees = JSON.parse(localStorage.getItem("employees")) || [];

    employees.push(employee);

    localStorage.setItem("employees", JSON.stringify(employees));

    employeeFormCard.style.display = "none";
    employeeForm.reset();

    renderEmployees();
});

function renderEmployees() {

    let employees = JSON.parse(localStorage.getItem("employees")) || [];

    employeesTableBody.innerHTML = "";

    if (employees.length === 0) {
        employeesTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted">
                    No employees.
                </td>
            </tr>
        `;
        return;
    }

    employees.forEach((emp, index) => {

        employeesTableBody.innerHTML += `
            <tr>
                <td>${emp.id}</td>
                <td>${emp.email}</td>
                <td>${emp.position}</td>
                <td>${emp.department}</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="deleteEmployee(${index})">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    });
}

function hideAllSections() {
    homeSection.style.display = "none";
    registerSection.style.display = "none";
    verifySection.style.display = "none";
    loginSection.style.display = "none";
    profileSection.style.display = "none";
    employeesSection.style.display = "none";
    departmentsSection.style.display = "none";
    accountsSection.style.display = "none"; 
}

function renderDepartments() {

    let departments = JSON.parse(localStorage.getItem("departments")) || [];

    departmentsTableBody.innerHTML = "";

    if (departments.length === 0) {
        departmentsTableBody.innerHTML = `
            <tr>
                <td colspan="3" class="text-center text-muted">
                    No departments.
                </td>
            </tr>
        `;
        return;
    }

    departments.forEach((dept, index) => {

        departmentsTableBody.innerHTML += `
            <tr>
                <td>${dept.name}</td>
                <td>${dept.description}</td>
                <td>
                    <button class="btn btn-outline-primary btn-sm me-1"
                    onclick="editDepartment(${index})">
                        Edit
                    </button>

                    <button class="btn btn-outline-danger btn-sm" onclick="deleteDepartment(${index})">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    });
}

window.editDepartment = function (index) {

    let departments = JSON.parse(localStorage.getItem("departments")) || [];

    index = parseInt(index); // ensure number

    const dept = departments[index];

    if (!dept) return;

    departmentName.value = dept.name;
    departmentDescription.value = dept.description;

    editDepartmentIndex.value = index;

    departmentFormCard.style.display = "block";
};

window.deleteDepartment = function (index) {

    let departments = JSON.parse(localStorage.getItem("departments")) || [];

    index = parseInt(index);

    departments.splice(index, 1);

    localStorage.setItem("departments", JSON.stringify(departments));

    renderDepartments(); // immediately update UI
};



addDepartmentBtn.addEventListener("click", function () {
    departmentForm.reset();
    editDepartmentIndex.value = "";
    departmentFormCard.style.display = "block";
});

cancelDepartmentBtn.addEventListener("click", function () {
    departmentFormCard.style.display = "none";
});

departmentForm.addEventListener("submit", function (e) {
    e.preventDefault();

    let departments = JSON.parse(localStorage.getItem("departments")) || [];

    const departmentData = {
        name: departmentName.value.trim(),
        description: departmentDescription.value.trim()
    };

    const index = editDepartmentIndex.value;

    if (index !== "") {
        // EDIT
        departments[parseInt(index)] = departmentData;
    } else {
        // ADD
        departments.push(departmentData);
    }

    localStorage.setItem("departments", JSON.stringify(departments));

    // Reset everything properly
    departmentForm.reset();
    editDepartmentIndex.value = "";
    departmentFormCard.style.display = "none";

    renderDepartments();
});


accountsLink.addEventListener("click", function (e) {
  e.preventDefault();

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if (!currentUser || currentUser.role !== "admin") {
    alert("Access denied. Admin only.");
    return;
  }

  showAccounts();
});

function showAccounts() {
  hideAllSections();
  accountsSection.style.display = "block";
  accountFormCard.style.display = "none";
  renderAccounts();
}


function renderAccounts() {
  let accounts = JSON.parse(localStorage.getItem("accounts")) || [];

  accountsTableBody.innerHTML = "";

  if (accounts.length === 0) {
    accountsTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center text-muted">No accounts.</td>
      </tr>
    `;
    return;
  }

  accounts.forEach((acc, index) => {
    accountsTableBody.innerHTML += `
      <tr>
        <td>${acc.firstName} ${acc.lastName}</td>
        <td>${acc.email}</td>
        <td>${capitalize(acc.role)}</td>
        <td class="text-center">${acc.verified ? "✔️" : ""}</td>
        <td>
          <button class="btn btn-outline-primary btn-sm me-1" onclick="editAccount(${index})">Edit</button>
          <button class="btn btn-outline-warning btn-sm me-1" onclick="resetPassword(${index})">Reset Password</button>
          <button class="btn btn-outline-danger btn-sm" onclick="deleteAccount(${index})">Delete</button>
        </td>
      </tr>
    `;
  });
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

addAccountBtn.addEventListener("click", function () {
  accountForm.reset();
  editAccountIndex.value = "";
  accountFormCard.style.display = "block";
});

cancelAccountBtn.addEventListener("click", function () {
  accountFormCard.style.display = "none";
});


accountForm.addEventListener("submit", function (e) {
  e.preventDefault();

  let accounts = JSON.parse(localStorage.getItem("accounts")) || [];

  const accountData = {
    firstName: accountFirstName.value.trim(),
    lastName: accountLastName.value.trim(),
    email: accountEmail.value.trim(),
    password: accountPassword.value,
    role: accountRole.value,
    verified: accountVerified.checked
  };

  const index = editAccountIndex.value;

  if (index !== "") {
    // Update existing account
    accounts[parseInt(index)] = accountData;
  } else {
    // Add new account
    accounts.push(accountData);
  }

  localStorage.setItem("accounts", JSON.stringify(accounts));

  accountForm.reset();
  editAccountIndex.value = "";
  accountFormCard.style.display = "none";

  renderAccounts();
});


window.editAccount = function (index) {
  let accounts = JSON.parse(localStorage.getItem("accounts")) || [];

  index = parseInt(index);
  const acc = accounts[index];

  if (!acc) return;

  accountFirstName.value = acc.firstName;
  accountLastName.value = acc.lastName;
  accountEmail.value = acc.email;
  accountPassword.value = acc.password;
  accountRole.value = acc.role;
  accountVerified.checked = acc.verified;

  editAccountIndex.value = index;
  accountFormCard.style.display = "block";
};

window.deleteAccount = function (index) {
  let accounts = JSON.parse(localStorage.getItem("accounts")) || [];
  index = parseInt(index);

  if (index < 0 || index >= accounts.length) return;

  accounts.splice(index, 1);
  localStorage.setItem("accounts", JSON.stringify(accounts));
  renderAccounts();
};

window.resetPassword = function (index) {
  // For demo, just alert the admin
  let accounts = JSON.parse(localStorage.getItem("accounts")) || [];
  index = parseInt(index);

  if (index < 0 || index >= accounts.length) return;

  alert(`Password reset requested for ${accounts[index].email}`);
};




});

function deleteEmployee(index) {

    let employees = JSON.parse(localStorage.getItem("employees")) || [];

    employees.splice(index, 1);

    localStorage.setItem("employees", JSON.stringify(employees));

}





