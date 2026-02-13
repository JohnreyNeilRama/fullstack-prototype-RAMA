document.addEventListener("DOMContentLoaded", function () {
    attachEventListeners();
    updateNavbar();
});

/* =========================
   Attach Event Listeners
========================= */
function attachEventListeners() {

    // Login Click (Simulated)
    const loginLink = document.getElementById("loginLink");
    if (loginLink) {
        loginLink.addEventListener("click", function (e) {
            e.preventDefault();

            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("username", "Admin");
            localStorage.setItem("role", "admin"); // change to "user" to test
            localStorage.setItem("email", "admin@example.com");

            updateNavbar();
        });
    }

    // Logout Click
    document.addEventListener("click", function (e) {
        if (e.target && e.target.id === "logoutBtn") {
            e.preventDefault();
            localStorage.clear();
            updateNavbar();
        }
    });

    // Profile Click
    const profileLink = document.querySelector(".dropdown-item");
    if (profileLink) {
        profileLink.addEventListener("click", function (e) {
            e.preventDefault();
            loadProfilePage();
        });
    }
}

/* =========================
   Update Navbar
========================= */
function updateNavbar() {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const role = localStorage.getItem("role");
    const username = localStorage.getItem("username");

    const guestLinks = document.getElementById("guestLinks");
    const userDropdown = document.getElementById("userDropdown");
    const usernameDisplay = document.getElementById("usernameDisplay");

    if (isLoggedIn === "true") {

        // Show user dropdown
        guestLinks.classList.add("d-none");
        userDropdown.classList.remove("d-none");
        usernameDisplay.textContent = username || "User";

        // Role-based links
        const adminLinks = document.querySelectorAll(".role-admin");
        adminLinks.forEach(link => {
            if (role === "admin") {
                link.classList.remove("d-none");
            } else {
                link.classList.add("d-none");
            }
        });

        loadProfilePage(); // Load profile by default after login

    } else {

        // Show guest links
        guestLinks.classList.remove("d-none");
        userDropdown.classList.add("d-none");

        loadHomePage();
    }
}

/* =========================
   HOME PAGE CONTENT
========================= */
function loadHomePage() {
    const main = document.getElementById("mainContent");

    main.innerHTML = `
        <h1 class="fw-bold">Welcome to Full-Stack App</h1>
        <p class="lead">
            A static prototype before backend integration. Simulates:
        </p>

        <ul>
            <li>Email registration + fake verification</li>
            <li>Login with JWT-like token simulation</li>
            <li>Role-based UI (Admin/User)</li>
            <li>CRUD for Employees, Departments, Requests</li>
        </ul>

        <div class="alert alert-info mt-4">
            ⚠️ <strong>Note:</strong> All data is stored in 
            <span class="text-danger">localStorage</span>. Refresh to reset.
        </div>

        <button class="btn btn-primary">
            Get Started →
        </button>
    `;
}

/* =========================
   PROFILE PAGE CONTENT
========================= */
function loadProfilePage() {
    const main = document.getElementById("mainContent");
    const username = localStorage.getItem("username");
    const role = localStorage.getItem("role");
    const email = localStorage.getItem("email");

    main.innerHTML = `
        <h2 class="fw-bold mb-4">My Profile</h2>

        <div class="card p-4">
            <h5>${username}</h5>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Role:</strong> ${role}</p>

            <button class="btn btn-outline-primary btn-sm">
                Edit Profile
            </button>
        </div>
    `;
}
