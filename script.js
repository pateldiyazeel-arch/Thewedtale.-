/* =========================================================
   THE WED TALE GUJARAT
   SCRIPT.JS
   Supabase + Vanilla JavaScript
   ========================================================= */

/* =========================================================
   SUPABASE CONFIG
   ========================================================= */

const SUPABASE_URL = "https://tfdzcmmLUXwAXZcmvsuk.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_ulKNYzcEkfVG_y2Bh0w0hw_PLG80nSK";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

const STORAGE_BUCKET = "vendor-images";

console.log("The Wed Tale Gujarat loaded.");
console.log("Supabase connected:", !!supabaseClient);


/* =========================================================
   GLOBAL STATE
   ========================================================= */

let currentUser = null;
let currentProfile = null;
let currentVendor = null;
let allVendors = [];
let currentPage = "home";

const categories = [
    "Photographers",
    "Videographers",
    "Makeup Artists",
    "Mehendi Artists",
    "Decorators",
    "Wedding Venues",
    "Bridal Wear",
    "Jewellery"
];

const cities = [
    "Ahmedabad",
    "Vadodara",
    "Surat",
    "Rajkot",
    "Gandhinagar",
    "Anand",
    "Bhavnagar",
    "Jamnagar",
    "Junagadh",
    "Vapi",
    "Bharuch",
    "Mehsana",
    "Other"
];


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
    setupCategoryUI();
    setupMobileMenu();
    setupGlobalEvents();

    await checkSession();
    await loadVendors();

    renderHome();
});


/* =========================================================
   AUTH SESSION
   ========================================================= */

async function checkSession() {
    try {
        const {
            data: { session },
            error
        } = await supabaseClient.auth.getSession();

        if (error) {
            console.error("Session error:", error);
            return;
        }

        if (session && session.user) {
            currentUser = session.user;
            await loadCurrentProfile();
        } else {
            currentUser = null;
            currentProfile = null;
        }

        updateNavigation();

    } catch (error) {
        console.error("checkSession error:", error);
    }

    supabaseClient.auth.onAuthStateChange(async (_event, session) => {
        currentUser = session?.user || null;

        if (currentUser) {
            await loadCurrentProfile();
        } else {
            currentProfile = null;
        }

        updateNavigation();
    });
}


/* =========================================================
   PROFILE
   ========================================================= */

async function loadCurrentProfile() {
    if (!currentUser) return;

    try {
        const { data, error } = await supabaseClient
            .from("profiles")
            .select("*")
            .eq("id", currentUser.id)
            .maybeSingle();

        if (error) {
            console.error("Profile loading error:", error);
            return;
        }

        currentProfile = data;
    } catch (error) {
        console.error(error);
    }
}


/* =========================================================
   NAVIGATION
   ========================================================= */

function updateNavigation() {
    const nav = document.getElementById("navActions");

    if (!nav) return;

    if (currentUser) {
        nav.innerHTML = `
            <button class="text-btn" onclick="showPage('dashboard')">
                Dashboard
            </button>

            <button class="dark-btn small" onclick="logout()">
                Logout
            </button>
        `;
    } else {
        nav.innerHTML = `
            <button class="text-btn" onclick="openAuth('login')">
                Login
            </button>

            <button class="dark-btn small" onclick="openAuth('signup')">
                Join
            </button>
        `;
    }
}


function showPage(page) {
    const pages = document.querySelectorAll(".page");

    pages.forEach(section => {
        section.classList.remove("active");
    });

    const target = document.getElementById(page + "Page");

    if (target) {
        target.classList.add("active");
    }

    currentPage = page;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    if (page === "home") {
        renderHome();
    }

    if (page === "vendors") {
        loadVendors();
    }

    if (page === "categories") {
        renderCategoriesPage();
    }

    if (page === "favorites") {
        renderFavorites();
    }

    if (page === "dashboard") {
        renderDashboard();
    }
}


/* =========================================================
   MOBILE MENU
   ========================================================= */

function toggleMobileMenu() {
    const menu = document.getElementById("mobileMenu");

    if (!menu) return;

    menu.classList.toggle("open");
}

function setupMobileMenu() {
    const menu = document.getElementById("mobileMenu");

    if (!menu) return;

    menu.addEventListener("click", event => {
        if (event.target.tagName === "A") {
            menu.classList.remove("open");
        }
    });
}


/* =========================================================
   GLOBAL EVENTS
   ========================================================= */

function setupGlobalEvents() {
    document.addEventListener("click", event => {
        const modal = event.target.closest(".modal");

        if (modal && event.target === modal) {
            modal.classList.remove("open");
        }
    });
}


/* =========================================================
   AUTH MODAL
   ========================================================= */

function openAuth(mode = "login", accountType = "viewer") {
    const modal = document.getElementById("authModal");
    const content = document.getElementById("authContent");

    if (!modal || !content) return;

    if (mode === "signup") {
        content.innerHTML = signupHTML(accountType);
    } else {
        content.innerHTML = loginHTML();
    }

    modal.classList.add("open");
}


function signupHTML(accountType = "viewer") {
    return `
        <h2>Join The Wed Tale.</h2>

        <p class="auth-subtitle">
            Choose how you'll use the platform.
        </p>

        <form onsubmit="handleSignup(event)">

            <input
                type="text"
                id="signupName"
                placeholder="Full name"
                required
            >

            <input
                type="email"
                id="signupEmail"
                placeholder="Email address"
                required
            >

            <input
                type="password"
                id="signupPassword"
                placeholder="Password"
                minlength="6"
                required
            >

            <select id="signupAccountType">
                <option value="viewer"
                    ${accountType === "viewer" ? "selected" : ""}>
                    Wedding Guest / Couple
                </option>

                <option value="vendor"
                    ${accountType === "vendor" ? "selected" : ""}>
                    Wedding Vendor
                </option>
            </select>

            <button
                type="submit"
                class="dark-btn full"
                id="signupSubmitBtn">
                Create Account
            </button>

        </form>

        <p class="auth-switch">
            Already have an account?
            <button onclick="openAuth('login')">
                Login
            </button>
        </p>
    `;
}


function loginHTML() {
    return `
        <h2>Welcome back.</h2>

        <p class="auth-subtitle">
            Login to continue to The Wed Tale.
        </p>

        <form onsubmit="handleLogin(event)">

            <input
                type="email"
                id="loginEmail"
                placeholder="Email address"
                required
            >

            <input
                type="password"
                id="loginPassword"
                placeholder="Password"
                required
            >

            <button
                type="submit"
                class="dark-btn full"
                id="loginSubmitBtn">
                Login
            </button>

        </form>

        <p class="auth-switch">
            Don't have an account?
            <button onclick="openAuth('signup')">
                Create one
            </button>
        </p>
    `;
}


/* =========================================================
   SIGNUP
   ========================================================= */

async function handleSignup(event) {
    event.preventDefault();

    const name = document.getElementById("signupName")?.value.trim();
    const email = document.getElementById("signupEmail")?.value.trim();
    const password = document.getElementById("signupPassword")?.value;
    const accountType =
        document.getElementById("signupAccountType")?.value || "viewer";

    const button = document.getElementById("signupSubmitBtn");

    if (!name || !email || !password) {
        showToast("Please fill all fields.");
        return;
    }

    if (password.length < 6) {
        showToast("Password must be at least 6 characters.");
        return;
    }

    if (button) {
        button.disabled = true;
        button.textContent = "Creating...";
    }

    try {
        const {
            data,
            error
        } = await supabaseClient.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                    account_type: accountType
                }
            }
        });

        if (error) {
            console.error(error);
            showToast(error.message);
            return;
        }

        /*
         * Supabase may require email confirmation.
         * If confirmation is enabled, session can be null here.
         */

        if (data.user) {
            const { error: profileError } = await supabaseClient
                .from("profiles")
                .upsert({
                    id: data.user.id,
                    full_name: name,
                    email: email,
                    account_type: accountType
                });

            if (profileError) {
                console.error("Profile creation error:", profileError);
            }
        }

        closeModal("authModal");

        if (data.session) {
            currentUser = data.user;
            await loadCurrentProfile();
            updateNavigation();

            showToast("Account created successfully.");

            if (accountType === "vendor") {
                showPage("dashboard");
            }
        } else {
            showToast(
                "Account created. Please check your email and confirm your account."
            );
        }

    } catch (error) {
        console.error(error);
        showToast("Something went wrong.");

    } finally {
        if (button) {
            button.disabled = false;
            button.textContent = "Create Account";
        }
    }
}


/* =========================================================
   LOGIN
   ========================================================= */

async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail")?.value.trim();
    const password = document.getElementById("loginPassword")?.value;

    const button = document.getElementById("loginSubmitBtn");

    if (!email || !password) {
        showToast("Enter your email and password.");
        return;
    }

    if (button) {
        button.disabled = true;
        button.textContent = "Logging in...";
    }

    try {
        const {
            data,
            error
        } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            console.error(error);
            showToast(error.message);
            return;
        }

        currentUser = data.user;

        await loadCurrentProfile();
        updateNavigation();
        closeModal("authModal");

        showToast("Welcome back.");

        showPage("dashboard");

    } catch (error) {
        console.error(error);
        showToast("Login failed.");

    } finally {
        if (button) {
            button.disabled = false;
            button.textContent = "Login";
        }
    }
}


/* =========================================================
   LOGOUT
   ========================================================= */

async function logout() {
    try {
        await supabaseClient.auth.signOut();

        currentUser = null;
        currentProfile = null;

        updateNavigation();

        showToast("Logged out.");

        showPage("home");

    } catch (error) {
        console.error(error);
        showToast("Could not log out.");
    }
}


/* =========================================================
   MODALS
   ========================================================= */

function closeModal(id) {
    const modal = document.getElementById(id);

    if (modal) {
        modal.classList.remove("open");
    }
}


/* =========================================================
   TOAST
   ========================================================= */

let toastTimer;

function showToast(message) {
    const toast = document.getElementById("toast");

    if (!toast) {
        alert(message);
        return;
    }

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 3500);
}


/* =========================================================
   CATEGORY UI
   ========================================================= */

function setupCategoryUI() {
    const filter = document.getElementById("categoryFilter");

    if (filter) {
        filter.innerHTML =
            `<option value="">All Categories</option>` +
            categories.map(category => `
                <option value="${escapeHTML(category)}">
                    ${escapeHTML(category)}
                </option>
            `).join("");
    }

    renderCategoriesPage();
}


function renderCategoriesPage() {
    const container = document.getElementById("allCategories");

    if (!container) return;

    container.innerHTML = categories.map((category, index) => `
        <div
            class="category-card"
            onclick="filterByCategory('${escapeJS(category)}')"
        >
            <span class="category-number">
                ${String(index + 1).padStart(2, "0")}
            </span>

            <h3>${escapeHTML(category)}</h3>

            <p>
                Explore ${escapeHTML(category.toLowerCase())}
                across Gujarat.
            </p>
        </div>
    `).join("");
}


function filterByCategory(category) {
    showPage("vendors");

    const filter = document.getElementById("categoryFilter");

    if (filter) {
        filter.value = category;
    }

    filterVendors();
}


/* =========================================================
   LOAD VENDORS
   ========================================================= */

async function loadVendors() {
    try {
        const {
            data,
            error
        } = await supabaseClient
            .from("vendors")
            .select("*")
            .eq("is_approved", true)
            .order("created_at", {
                ascending: false
            });

        if (error) {
            console.error("Vendor loading error:", error);
            return;
        }

        allVendors = data || [];

        renderVendorGrid(allVendors);
        renderFeaturedVendors(allVendors);
        populateCityFilter(allVendors);

    } catch (error) {
        console.error(error);
    }
}


/* =========================================================
   CITY FILTER
   ========================================================= */

function populateCityFilter(vendors) {
    const select = document.getElementById("cityFilter");

    if (!select) return;

    const uniqueCities = [
        ...new Set(
            vendors
                .map(v => v.city)
                .filter(Boolean)
        )
    ].sort();

    select.innerHTML = `
        <option value="">All Cities</option>
        ${uniqueCities.map(city => `
            <option value="${escapeHTML(city)}">
                ${escapeHTML(city)}
            </option>
        `).join("")}
    `;
}


/* =========================================================
   VENDOR FILTER
   ========================================================= */

function filterVendors() {
    const search =
        document.getElementById("vendorSearch")?.value
            .toLowerCase()
            .trim() || "";

    const category =
        document.getElementById("categoryFilter")?.value || "";

    const city =
        document.getElementById("cityFilter")?.value || "";

    const filtered = allVendors.filter(vendor => {

        const searchable = [
            vendor.business_name,
            vendor.category,
            vendor.city,
            vendor.description
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        const matchesSearch =
            !search || searchable.includes(search);

        const matchesCategory =
            !category || vendor.category === category;

        const matchesCity =
            !city || vendor.city === city;

        return (
            matchesSearch &&
            matchesCategory &&
            matchesCity
        );
    });

    renderVendorGrid(filtered);
}


/* =========================================================
   VENDOR GRID
   ========================================================= */

function renderVendorGrid(vendors) {
    const grid = document.getElementById("vendorGrid");

    if (!grid) return;

    const count = document.getElementById("resultCount");

    if (count) {
        count.textContent =
            `${vendors.length} vendor${vendors.length === 1 ? "" : "s"}`;
    }

    if (!vendors.length) {
        grid.innerHTML = `
            <div class="empty-state">
                <h3>No vendors found.</h3>
                <p>
                    Try another search, category or city.
                </p>
            </div>
        `;
        return;
    }

    grid.innerHTML = vendors.map(createVendorCard).join("");
}


function renderFeaturedVendors(vendors) {
    const container = document.getElementById("featuredVendors");

    if (!container) return;

    const featured = vendors.slice(0, 6);

    if (!featured.length) {
        container.innerHTML = `
            <div class="empty-state">
                <p>
                    Featured vendors will appear here soon.
                </p>
            </div>
        `;
        return;
    }

    container.innerHTML =
        featured.map(createVendorCard).join("");
}


function createVendorCard(vendor) {
    const image = vendor.cover_image;

    return `
        <article
            class="vendor-card"
            onclick="openVendorProfile('${escapeJS(vendor.id)}')"
        >

            <div class="vendor-card-image">
                ${
                    image
                        ? `<img
                            src="${escapeHTML(image)}"
                            alt="${escapeHTML(vendor.business_name || "Vendor")}"
                            loading="lazy"
                        >`
                        : `
                            <div class="image-placeholder">
                                THE WED TALE
                            </div>
                        `
                }
            </div>

            <div class="vendor-card-content">

                <p class="vendor-category">
                    ${escapeHTML(vendor.category || "Wedding Vendor")}
                </p>

                <h3>
                    ${escapeHTML(vendor.business_name || "Untitled Vendor")}
                </h3>

                <p class="vendor-location">
                    ${escapeHTML(vendor.city || "Gujarat")}
                </p>

                ${
                    vendor.starting_price
                        ? `
                            <p class="vendor-price">
                                Starting from ${escapeHTML(
                                    formatPrice(vendor.starting_price)
                                )}
                            </p>
                        `
                        : ""
                }

            </div>
        </article>
    `;
}


/* =========================================================
   HOME
   ========================================================= */

function renderHome() {
    const container =
        document.getElementById("homeCategories");

    if (container) {
        container.innerHTML = categories
            .map((category, index) => `
                <div
                    class="category-card"
                    onclick="filterByCategory('${escapeJS(category)}')"
                >
                    <span class="category-number">
                        ${String(index + 1).padStart(2, "0")}
                    </span>

                    <h3>
                        ${escapeHTML(category)}
                    </h3>

                    <p>
                        Discover trusted professionals.
                    </p>
                </div>
            `)
            .join("");
    }

    renderFeaturedVendors(allVendors);
}


function homeSearchKey(event) {
    if (event.key === "Enter") {
        searchFromHome();
    }
}


function searchFromHome() {
    const value =
        document.getElementById("homeSearch")?.value
            .trim() || "";

    showPage("vendors");

    const searchInput =
        document.getElementById("vendorSearch");

    if (searchInput) {
        searchInput.value = value;
    }

    filterVendors();
}


/* =========================================================
   VENDOR PROFILE
   ========================================================= */

async function openVendorProfile(vendorId) {
    showPage("profile");

    const container =
        document.getElementById("profileContent");

    if (!container) return;

    container.innerHTML = `
        <div class="loading-state">
            Loading vendor...
        </div>
    `;

    try {
        const {
            data: vendor,
            error
        } = await supabaseClient
            .from("vendors")
            .select("*")
            .eq("id", vendorId)
            .single();

        if (error) {
            console.error(error);

            container.innerHTML = `
                <div class="empty-state">
                    <h2>Vendor not found.</h2>
                    <button
                        class="dark-btn"
                        onclick="showPage('vendors')">
                        Back to vendors
                    </button>
                </div>
            `;

            return;
        }

        currentVendor = vendor;

        await renderVendorProfile(vendor);

    } catch (error) {
        console.error(error);
    }
}


async function renderVendorProfile(vendor) {
    const container =
        document.getElementById("profileContent");

    if (!container) return;

    /* =====================================================
       IMPORTANT:
       Portfolio images come ONLY from vendor_images.
       cover_image is used ONLY for the banner.
       ===================================================== */

    const {
        data: portfolio,
        error
    } = await supabaseClient
        .from("vendor_images")
        .select("*")
        .eq("vendor_id", vendor.id)
        .order("created_at", {
            ascending: false
        });

    if (error) {
        console.error("Portfolio loading error:", error);
    }

    const portfolioImages = portfolio || [];

    const isFavourite =
        currentUser
            ? await checkFavourite(vendor.id)
            : false;

    container.innerHTML = `

        <div class="profile-back">
            <button
                class="arrow-btn"
                onclick="showPage('vendors')">
                ← Back to vendors
            </button>
        </div>

        <div class="vendor-profile">

            <div class="profile-cover">

                ${
                    vendor.cover_image
                        ? `
                            <img
                                src="${escapeHTML(vendor.cover_image)}"
                                alt="${escapeHTML(vendor.business_name)}"
                            >
                        `
                        : `
                            <div class="profile-cover-placeholder">
                                THE WED TALE
                            </div>
                        `
                }

            </div>

            <div class="profile-info">

                <p class="eyebrow">
                    ${escapeHTML(vendor.category || "WEDDING VENDOR")}
                </p>

                <h1>
                    ${escapeHTML(vendor.business_name || "")}
                </h1>

                <p class="profile-location">
                    ${escapeHTML(vendor.city || "Gujarat")}
                </p>

                <p class="profile-description">
                    ${escapeHTML(
                        vendor.description ||
                        "A wedding professional listed on The Wed Tale Gujarat."
                    )}
                </p>

                <div class="profile-details">

                    ${
                        vendor.starting_price
                            ? `
                                <div>
                                    <span>Starting price</span>
                                    <strong>
                                        ${escapeHTML(
                                            formatPrice(
                                                vendor.starting_price
                                            )
                                        )}
                                    </strong>
                                </div>
                            `
                            : ""
                    }

                    <div>
                        <span>Location</span>
                        <strong>
                            ${escapeHTML(vendor.city || "Gujarat")}
                        </strong>
                    </div>

                </div>

                <div class="profile-actions">

                    ${
                        vendor.phone || vendor.whatsapp
                            ? `
                                <button
                                    class="dark-btn"
                                    onclick="contactVendor('${escapeJS(vendor.id)}')">
                                    Contact Vendor
                                </button>
                            `
                            : ""
                    }

                    <button
                        class="outline-btn"
                        onclick="toggleFavourite('${escapeJS(vendor.id)}')">

                        ${isFavourite ? "♥ Saved" : "♡ Save Vendor"}

                    </button>

                    ${
                        vendor.instagram
                            ? `
                                <button
                                    class="outline-btn"
                                    onclick="openExternal('${escapeJS(normalizeUrl(vendor.instagram))}')">
                                    Instagram
                                </button>
                            `
                            : ""
                    }

                </div>

            </div>

        </div>

        <!-- =================================================
             PORTFOLIO
             ================================================= -->

        <section class="profile-portfolio">

            <div class="section-heading">
                <div>
                    <p class="eyebrow">
                        WORK
                    </p>

                    <h2>
                        Portfolio
                    </h2>
                </div>
            </div>

            ${
                portfolioImages.length
                    ? `
                        <div class="portfolio-grid">

                            ${portfolioImages.map(image => `
                                <div class="portfolio-item">

                                    <img
                                        src="${escapeHTML(image.image_url)}"
                                        alt="${escapeHTML(vendor.business_name || "Portfolio image")}"
                                        loading="lazy"
                                    >

                                </div>
                            `).join("")}

                        </div>
                    `
                    : `
                        <div class="empty-state">
                            <p>
                                Portfolio images will appear here.
                            </p>
                        </div>
                    `
            }

        </section>
    `;
}


/* =========================================================
   CONTACT VENDOR
   ========================================================= */

async function contactVendor(vendorId) {
    const vendor =
        allVendors.find(v => v.id === vendorId);

    if (!vendor) {
        const {
            data
        } = await supabaseClient
            .from("vendors")
            .select("*")
            .eq("id", vendorId)
            .single();

        if (data) {
            contactVendorData(data);
        }

        return;
    }

    contactVendorData(vendor);
}


function contactVendorData(vendor) {
    if (vendor.whatsapp) {
        const number =
            String(vendor.whatsapp)
                .replace(/[^\d]/g, "");

        if (number) {
            openExternal(`https://wa.me/${number}`);
            return;
        }
    }

    if (vendor.phone) {
        window.location.href =
            `tel:${vendor.phone}`;
        return;
    }

    showToast("Contact details are not available.");
}


/* =========================================================
   FAVOURITES
   ========================================================= */

async function checkFavourite(vendorId) {
    if (!currentUser) return false;

    const {
        data,
        error
    } = await supabaseClient
        .from("favourites")
        .select("id")
        .eq("user_id", currentUser.id)
        .eq("vendor_id", vendorId)
        .maybeSingle();

    if (error) {
        console.error(error);
        return false;
    }

    return !!data;
}


async function toggleFavourite(vendorId) {
    if (!currentUser) {
        openAuth("login");
        showToast("Please login to save vendors.");
        return;
    }

    const existing = await checkFavourite(vendorId);

    if (existing) {
        const {
            error
        } = await supabaseClient
            .from("favourites")
            .delete()
            .eq("user_id", currentUser.id)
            .eq("vendor_id", vendorId);

        if (error) {
            console.error(error);
            showToast("Could not remove favourite.");
            return;
        }

        showToast("Removed from favourites.");

    } else {
        const {
            error
        } = await supabaseClient
            .from("favourites")
            .insert({
                user_id: currentUser.id,
                vendor_id: vendorId
            });

        if (error) {
            console.error(error);
            showToast("Could not save vendor.");
            return;
        }

        showToast("Vendor saved.");
    }

    if (currentVendor) {
        await renderVendorProfile(currentVendor);
    }
}


async function renderFavorites() {
    const grid =
        document.getElementById("favoritesGrid");

    if (!grid) return;

    if (!currentUser) {
        grid.innerHTML = `
            <div class="empty-state">
                <h3>Login to see your favourites.</h3>

                <button
                    class="dark-btn"
                    onclick="openAuth('login')">
                    Login
                </button>
            </div>
        `;

        return;
    }

    const {
        data,
        error
    } = await supabaseClient
        .from("favourites")
        .select(`
            id,
            vendor_id,
            vendors (*)
        `)
        .eq("user_id", currentUser.id)
        .order("created_at", {
            ascending: false
        });

    if (error) {
        console.error(error);

        grid.innerHTML = `
            <div class="empty-state">
                <p>Could not load favourites.</p>
            </div>
        `;

        return;
    }

    const vendors =
        (data || [])
            .map(item => item.vendors)
            .filter(Boolean);

    if (!vendors.length) {
        grid.innerHTML = `
            <div class="empty-state">
                <h3>No saved vendors yet.</h3>
                <p>
                    Save vendors while exploring.
                </p>
            </div>
        `;

        return;
    }

    grid.innerHTML =
        vendors.map(createVendorCard).join("");
}


/* =========================================================
   DASHBOARD
   ========================================================= */

async function renderDashboard() {
    const container =
        document.getElementById("dashboardContent");

    if (!container) return;

    if (!currentUser) {
        container.innerHTML = `
            <div class="empty-state">
                <h2>Login required.</h2>
                <p>
                    Login to access your dashboard.
                </p>

                <button
                    class="dark-btn"
                    onclick="openAuth('login')">
                    Login
                </button>
            </div>
        `;

        return;
    }

    await loadCurrentProfile();

    const {
        data: vendor,
        error
    } = await supabaseClient
        .from("vendors")
        .select("*")
        .eq("user_id", currentUser.id)
        .maybeSingle();

    if (error) {
        console.error(error);
    }

    currentVendor = vendor || null;

    container.innerHTML = dashboardHTML(vendor);

    await loadDashboardPortfolio(vendor);
}


/* =========================================================
   DASHBOARD HTML
   ========================================================= */

function dashboardHTML(vendor) {
    return `

        <div class="page-header">
            <p class="eyebrow">
                VENDOR DASHBOARD
            </p>

            <h1>
                ${
                    vendor
                        ? "Manage your business."
                        : "List your business."
                }
            </h1>

            <p>
                Add your business details and showcase
                your work to couples across Gujarat.
            </p>
        </div>

        <div class="dashboard-wrapper">

            <form
                id="vendorForm"
                onsubmit="saveVendor(event)"
            >

                <input
                    type="hidden"
                    id="vendorId"
                    value="${vendor?.id || ""}"
                >

                <!-- BUSINESS INFORMATION -->

                <div class="dashboard-card">

                    <h2>
                        Business information
                    </h2>

                    <label>
                        Business name
                    </label>

                    <input
                        type="text"
                        id="businessName"
                        placeholder="e.g. Azura Lakeside"
                        value="${escapeHTML(vendor?.business_name || "")}"
                        required
                    >

                    <label>
                        Category
                    </label>

                    <select id="businessCategory" required>

                        <option value="">
                            Select category
                        </option>

                        ${categories.map(category => `
                            <option
                                value="${escapeHTML(category)}"
                                ${
                                    vendor?.category === category
                                        ? "selected"
                                        : ""
                                }
                            >
                                ${escapeHTML(category)}
                            </option>
                        `).join("")}

                    </select>

                    <label>
                        City
                    </label>

                    <select id="businessCity" required>

                        <option value="">
                            Select city
                        </option>

                        ${cities.map(city => `
                            <option
                                value="${escapeHTML(city)}"
                                ${
                                    vendor?.city === city
                                        ? "selected"
                                        : ""
                                }
                            >
                                ${escapeHTML(city)}
                            </option>
                        `).join("")}

                    </select>

                    <label>
                        Description
                    </label>

                    <textarea
                        id="businessDescription"
                        rows="5"
                        placeholder="Tell couples about your business..."
                    >${escapeHTML(vendor?.description || "")}</textarea>

                    <label>
                        Starting price
                    </label>

                    <input
                        type="text"
                        id="startingPrice"
                        placeholder="e.g. ₹25,000 onwards"
                        value="${escapeHTML(vendor?.starting_price || "")}"
                    >

                </div>


                <!-- CONTACT -->

                <div class="dashboard-card">

                    <h2>
                        Contact details
                    </h2>

                    <label>
                        Phone
                    </label>

                    <input
                        type="tel"
                        id="businessPhone"
                        placeholder="+91..."
                        value="${escapeHTML(vendor?.phone || "")}"
                    >

                    <label>
                        WhatsApp
                    </label>

                    <input
                        type="tel"
                        id="businessWhatsapp"
                        placeholder="+91..."
                        value="${escapeHTML(vendor?.whatsapp || "")}"
                    >

                    <label>
                        Instagram
                    </label>

                    <input
                        type="text"
                        id="businessInstagram"
                        placeholder="@yourbusiness"
                        value="${escapeHTML(vendor?.instagram || "")}"
                    >

                    <label>
                        Website
                    </label>

                    <input
                        type="text"
                        id="businessWebsite"
                        placeholder="https://..."
                        value="${escapeHTML(vendor?.website || "")}"
                    >

                </div>


                <!-- =================================================
                     COVER IMAGE
                     =================================================

                     THIS IMAGE IS ONLY THE PROFILE BANNER.

                     IMPORTANT:
                     It is uploaded to vendors.cover_image.

                     It is NEVER inserted into vendor_images.
                     ================================================= -->

                <div class="dashboard-card">

                    <h2>
                        Cover image
                    </h2>

                    <p class="form-help">
                        This image will appear as the main banner
                        on your vendor profile.
                    </p>

                    ${
                        vendor?.cover_image
                            ? `
                                <div class="current-cover-preview">

                                    <img
                                        src="${escapeHTML(vendor.cover_image)}"
                                        alt="Current cover image"
                                    >

                                </div>
                            `
                            : ""
                    }

                    <label>
                        Upload cover image
                    </label>

                    <input
                        type="file"
                        id="coverImage"
                        accept="image/*"
                    >

                    <p class="form-help">
                        Upload one main image for your profile banner.
                    </p>

                </div>


                <!-- =================================================
                     PORTFOLIO IMAGES
                     =================================================

                     THESE ARE COMPLETELY SEPARATE FROM THE COVER.

                     They go into:
                     vendor_images.image_url

                     They NEVER update:
                     vendors.cover_image
                     ================================================= -->

                <div class="dashboard-card">

                    <h2>
                        Portfolio
                    </h2>

                    <p class="form-help">
                        Upload photos of your work.
                        These will appear only in your portfolio.
                    </p>

                    <label>
                        Add portfolio images
                    </label>

                    <input
                        type="file"
                        id="portfolioImages"
                        accept="image/*"
                        multiple
                    >

                    <p class="form-help">
                        You can select multiple images at once.
                    </p>

                    <div
                        id="dashboardPortfolio"
                        class="dashboard-portfolio-grid">
                    </div>

                </div>


                <button
                    type="submit"
                    class="dark-btn full"
                    id="saveVendorButton"
                >
                    ${
                        vendor
                            ? "Save Changes"
                            : "Create Business Listing"
                    }
                </button>

            </form>

        </div>
    `;
}


/* =========================================================
   SAVE VENDOR
   ========================================================= */

async function saveVendor(event) {
    event.preventDefault();

    if (!currentUser) {
        showToast("Please login first.");
        return;
    }

    const button =
        document.getElementById("saveVendorButton");

    if (button) {
        button.disabled = true;
        button.textContent = "Saving...";
    }

    try {

        /* =====================================================
           BASIC DATA
           ===================================================== */

        const vendorId =
            document.getElementById("vendorId")?.value || null;

        const businessName =
            document.getElementById("businessName")?.value.trim();

        const category =
            document.getElementById("businessCategory")?.value;

        const city =
            document.getElementById("businessCity")?.value;

        const description =
            document.getElementById("businessDescription")?.value.trim();

        const startingPrice =
            document.getElementById("startingPrice")?.value.trim();

        const phone =
            document.getElementById("businessPhone")?.value.trim();

        const whatsapp =
            document.getElementById("businessWhatsapp")?.value.trim();

        const instagram =
            document.getElementById("businessInstagram")?.value.trim();

        const website =
            document.getElementById("businessWebsite")?.value.trim();

        if (!businessName || !category || !city) {
            showToast(
                "Business name, category and city are required."
            );

            return;
        }


        /* =====================================================
           EXISTING VENDOR
           ===================================================== */

        let existingVendor = null;

        if (vendorId) {
            const {
                data
            } = await supabaseClient
                .from("vendors")
                .select("*")
                .eq("id", vendorId)
                .eq("user_id", currentUser.id)
                .single();

            existingVendor = data;
        } else {
            const {
                data
            } = await supabaseClient
                .from("vendors")
                .select("*")
                .eq("user_id", currentUser.id)
                .maybeSingle();

            existingVendor = data;
        }


        /* =====================================================
           COVER IMAGE
           ===================================================== */

        let coverImageUrl =
            existingVendor?.cover_image || null;

        const coverFile =
            document.getElementById("coverImage")?.files?.[0];

        /*
         * IMPORTANT:
         *
         * Only this section can update cover_image.
         *
         * Portfolio upload NEVER reaches this variable.
         */

        if (coverFile) {

            coverImageUrl =
                await uploadImage(
                    coverFile,
                    currentUser.id,
                    "covers"
                );

            if (!coverImageUrl) {
                showToast("Cover image upload failed.");
                return;
            }
        }


        /* =====================================================
           SAVE VENDOR
           ===================================================== */

        const vendorData = {
            user_id: currentUser.id,
            business_name: businessName,
            category: category,
            city: city,
            description: description,
            phone: phone,
            whatsapp: whatsapp,
            instagram: instagram,
            website: website,
            starting_price: startingPrice,
            cover_image: coverImageUrl,
            is_approved: existingVendor?.is_approved ?? true,
            updated_at: new Date().toISOString()
        };

        let savedVendor;

        if (existingVendor) {

            const {
                data,
                error
            } = await supabaseClient
                .from("vendors")
                .update(vendorData)
                .eq("id", existingVendor.id)
                .eq("user_id", currentUser.id)
                .select()
                .single();

            if (error) {
                throw error;
            }

            savedVendor = data;

        } else {

            const {
                data,
                error
            } = await supabaseClient
                .from("vendors")
                .insert(vendorData)
                .select()
                .single();

            if (error) {
                throw error;
            }

            savedVendor = data;
        }


        /* =====================================================
           PORTFOLIO UPLOAD
           =====================================================

           NOTICE:

           We do NOT modify savedVendor.cover_image here.

           Every portfolio image gets its own
           vendor_images record.
           ===================================================== */

        const portfolioFiles =
            Array.from(
                document.getElementById("portfolioImages")
                    ?.files || []
            );

        if (portfolioFiles.length) {

            for (const file of portfolioFiles) {

                const imageUrl =
                    await uploadImage(
                        file,
                        currentUser.id,
                        "portfolio"
                    );

                if (!imageUrl) {
                    console.error(
                        "Portfolio image upload failed:",
                        file.name
                    );

                    continue;
                }

                const {
                    error
                } = await supabaseClient
                    .from("vendor_images")
                    .insert({
                        vendor_id: savedVendor.id,
                        image_url: imageUrl
                    });

                if (error) {
                    console.error(
                        "Portfolio database error:",
                        error
                    );
                }
            }
        }


        currentVendor = savedVendor;

        await loadVendors();

        showToast(
            existingVendor
                ? "Business listing updated."
                : "Business listing created."
        );

        renderDashboard();

    } catch (error) {

        console.error("Save vendor error:", error);

        showToast(
            error.message ||
            "Could not save business listing."
        );

    } finally {

        if (button) {
            button.disabled = false;
            button.textContent = "Save Changes";
        }
    }
}


/* =========================================================
   IMAGE UPLOAD
   ========================================================= */

async function uploadImage(file, userId, folder) {

    if (!file || !userId) {
        return null;
    }

    try {

        const safeName =
            file.name
                .toLowerCase()
                .replace(/[^a-z0-9.-]/g, "-");

        const extension =
            safeName.includes(".")
                ? safeName.split(".").pop()
                : "jpg";

        const fileName =
            `${Date.now()}-${Math.random()
                .toString(36)
                .substring(2, 10)}.${extension}`;

        const filePath =
            `${folder}/${userId}/${fileName}`;


        /* =====================================================
           UPLOAD TO SUPABASE STORAGE
           ===================================================== */

        const {
            error: uploadError
        } = await supabaseClient.storage
            .from(STORAGE_BUCKET)
            .upload(
                filePath,
                file,
                {
                    cacheControl: "3600",
                    upsert: false,
                    contentType: file.type
                }
            );

        if (uploadError) {
            console.error(
                "Storage upload error:",
                uploadError
            );

            throw uploadError;
        }


        /* =====================================================
           GET PUBLIC URL
           ===================================================== */

        const {
            data
        } = supabaseClient.storage
            .from(STORAGE_BUCKET)
            .getPublicUrl(filePath);

        return data?.publicUrl || null;

    } catch (error) {

        console.error(
            "uploadImage error:",
            error
        );

        return null;
    }
}


/* =========================================================
   DASHBOARD PORTFOLIO
   ========================================================= */

async function loadDashboardPortfolio(vendor) {

    const container =
        document.getElementById("dashboardPortfolio");

    if (!container) return;

    if (!vendor) {
        container.innerHTML = "";
        return;
    }

    const {
        data,
        error
    } = await supabaseClient
        .from("vendor_images")
        .select("*")
        .eq("vendor_id", vendor.id)
        .order("created_at", {
            ascending: false
        });

    if (error) {
        console.error(error);

        container.innerHTML = `
            <p>
                Could not load portfolio.
            </p>
        `;

        return;
    }

    if (!data?.length) {
        container.innerHTML = `
            <p class="form-help">
                No portfolio images uploaded yet.
            </p>
        `;

        return;
    }

    container.innerHTML =
        data.map(image => `
            <div class="dashboard-portfolio-item">

                <img
                    src="${escapeHTML(image.image_url)}"
                    alt="Portfolio"
                    loading="lazy"
                >

                <button
                    type="button"
                    class="portfolio-delete-btn"
                    onclick="deletePortfolioImage('${escapeJS(image.id)}')">
                    ×
                </button>

            </div>
        `).join("");
}


/* =========================================================
   DELETE PORTFOLIO IMAGE
   ========================================================= */

async function deletePortfolioImage(imageId) {

    if (!currentUser) {
        showToast("Please login first.");
        return;
    }

    const confirmed =
        confirm("Delete this portfolio image?");

    if (!confirmed) return;

    try {

        const {
            data: image,
            error: fetchError
        } = await supabaseClient
            .from("vendor_images")
            .select("*")
            .eq("id", imageId)
            .single();

        if (fetchError) {
            throw fetchError;
        }

        const {
            data: vendor
        } = await supabaseClient
            .from("vendors")
            .select("id")
            .eq("id", image.vendor_id)
            .eq("user_id", currentUser.id)
            .single();

        if (!vendor) {
            showToast("You cannot delete this image.");
            return;
        }


        /* Delete database record */

        const {
            error: deleteError
        } = await supabaseClient
            .from("vendor_images")
            .delete()
            .eq("id", imageId);

        if (deleteError) {
            throw deleteError;
        }

        showToast("Portfolio image deleted.");

        renderDashboard();

    } catch (error) {

        console.error(error);

        showToast(
            "Could not delete portfolio image."
        );
    }
}


/* =========================================================
   PROFILE / PORTFOLIO HELPERS
   ========================================================= */

function formatPrice(price) {

    if (!price) return "";

    const value = String(price).trim();

    if (
        value.includes("₹") ||
        value.toLowerCase().includes("starting") ||
        value.toLowerCase().includes("onwards")
    ) {
        return value;
    }

    return `₹${value}`;
}


/* =========================================================
   EXTERNAL LINKS
   ========================================================= */

function normalizeUrl(url) {

    if (!url) return "";

    url = url.trim();

    if (!url) return "";

    if (
        url.startsWith("http://") ||
        url.startsWith("https://")
    ) {
        return url;
    }

    if (url.startsWith("@")) {
        return `https://instagram.com/${url.substring(1)}`;
    }

    if (url.includes("instagram.com")) {
        return `https://${url}`;
    }

    return `https://${url}`;
}


function openExternal(url) {

    if (!url) return;

    window.open(
        url,
        "_blank",
        "noopener,noreferrer"
    );
}


/* =========================================================
   SEARCH
   ========================================================= */

function searchVendors(value) {

    const input =
        document.getElementById("vendorSearch");

    if (input) {
        input.value = value;
    }

    showPage("vendors");

    filterVendors();
}


/* =========================================================
   HTML SAFETY
   ========================================================= */

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function escapeJS(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r");
}


/* =========================================================
   CATEGORY QUICK ACCESS
   ========================================================= */

function openCategory(category) {
    showPage("vendors");

    const select =
        document.getElementById("categoryFilter");

    if (select) {
        select.value = category;
    }

    filterVendors();
}


/* =========================================================
   LOADING HELPERS
   ========================================================= */

function showLoading(container, text = "Loading...") {

    if (!container) return;

    container.innerHTML = `
        <div class="loading-state">
            ${escapeHTML(text)}
        </div>
    `;
}


/* =========================================================
   ERROR HELPERS
   ========================================================= */

function showError(container, message) {

    if (!container) return;

    container.innerHTML = `
        <div class="empty-state">
            <h3>Something went wrong.</h3>

            <p>
                ${escapeHTML(message)}
            </p>
        </div>
    `;
}


/* =========================================================
   WINDOW EXPORTS
   =========================================================

   Because the HTML uses inline onclick=""
   handlers, functions need to be available globally.
   ========================================================= */

window.showPage = showPage;
window.toggleMobileMenu = toggleMobileMenu;

window.openAuth = openAuth;
window.closeModal = closeModal;

window.handleSignup = handleSignup;
window.handleLogin = handleLogin;
window.logout = logout;

window.filterVendors = filterVendors;
window.filterByCategory = filterByCategory;

window.searchFromHome = searchFromHome;
window.homeSearchKey = homeSearchKey;

window.openVendorProfile = openVendorProfile;

window.toggleFavourite = toggleFavourite;
window.contactVendor = contactVendor;

window.renderFavorites = renderFavorites;

window.renderDashboard = renderDashboard;
window.saveVendor = saveVendor;

window.deletePortfolioImage =
    deletePortfolioImage;

window.openExternal = openExternal;
window.openCategory = openCategory;


/* =========================================================
   FINAL
   ========================================================= */

console.log(
    "The Wed Tale Gujarat script initialized successfully."
);