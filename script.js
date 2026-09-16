/* =========================================================
   THE WED TALE GUJARAT
   SUPABASE VERSION
   =========================================================

   This version uses:

   Supabase Auth
   → Real user accounts

   Supabase Database
   → Profiles
   → Vendors
   → Favourites
   → Vendor images

   Supabase Storage
   → Vendor portfolio images

   No localStorage is used for users, vendors or favourites.

========================================================= */

"use strict";


/* =========================================================
   SUPABASE CONNECTION
========================================================= */

const SUPABASE_URL =
    "https://tfdzcmmluxwaxzcmvsuk.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_ulkNYzcEkfVG_y2BhOwOhw_PLG80nSK";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );

console.log(
    "Supabase connected:",
    !!supabaseClient
);


/* =========================================================
   CONSTANTS
========================================================= */

const STORAGE_BUCKET = "vendor-images";


const categories = [
    {
        name: "Photographers",
        description: "Frames that tell your story."
    },
    {
        name: "Videographers",
        description: "Films you'll want to replay."
    },
    {
        name: "Makeup Artists",
        description: "Beauty made personal."
    },
    {
        name: "Mehendi Artists",
        description: "Art for your hands."
    },
    {
        name: "Decorators",
        description: "Spaces made unforgettable."
    },
    {
        name: "Wedding Venues",
        description: "The place where it begins."
    },
    {
        name: "Bridal Wear",
        description: "For your main character moment."
    },
    {
        name: "Jewellery",
        description: "The finishing details."
    },
    {
        name: "Groom Wear",
        description: "Modern looks for the groom."
    },
    {
        name: "Caterers",
        description: "Food worth remembering."
    },
    {
        name: "DJs & Music",
        description: "Set the mood."
    },
    {
        name: "Choreographers",
        description: "Make your celebration move."
    },
    {
        name: "Wedding Planners",
        description: "Your vision, beautifully managed."
    },
    {
        name: "Invitations",
        description: "The first chapter."
    },
    {
        name: "Cakes",
        description: "Sweet details."
    }
];


const cities = [
    "Ahmedabad",
    "Vadodara",
    "Surat",
    "Rajkot",
    "Gandhinagar",
    "Udaipur",
    "Anand",
    "Mehsana",
    "Bhavnagar",
    "Junagadh"
];


/* =========================================================
   DEMO VENDORS
========================================================= */

const demoVendors = [
    {
        id: "demo-1",
        user_id: null,
        business_name: "Aarohi Frames",
        category: "Photographers",
        city: "Ahmedabad",
        starting_price: 80000,
        phone: "",
        whatsapp: "",
        instagram: "",
        website: "",
        description:
            "Contemporary wedding photography focused on honest emotions, editorial portraits and timeless celebrations.",
        cover_image:
            "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=85",
        is_approved: true
    },

    {
        id: "demo-2",
        user_id: null,
        business_name: "Maison Mehendi",
        category: "Mehendi Artists",
        city: "Vadodara",
        starting_price: 15000,
        phone: "",
        whatsapp: "",
        instagram: "",
        website: "",
        description:
            "Fine-line bridal mehendi with contemporary compositions and personalised details.",
        cover_image:
            "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=900&q=85",
        is_approved: true
    },

    {
        id: "demo-3",
        user_id: null,
        business_name: "The Ivory House",
        category: "Wedding Venues",
        city: "Ahmedabad",
        starting_price: 250000,
        phone: "",
        whatsapp: "",
        instagram: "",
        website: "",
        description:
            "A refined celebration space designed for intimate weddings, receptions and elegant gatherings.",
        cover_image:
            "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=900&q=85",
        is_approved: true
    },

    {
        id: "demo-4",
        user_id: null,
        business_name: "Studio Nysa",
        category: "Makeup Artists",
        city: "Surat",
        starting_price: 25000,
        phone: "",
        whatsapp: "",
        instagram: "",
        website: "",
        description:
            "Modern bridal beauty with skin-focused makeup and polished editorial finishes.",
        cover_image:
            "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=85",
        is_approved: true
    },

    {
        id: "demo-5",
        user_id: null,
        business_name: "Atelier Baraat",
        category: "Decorators",
        city: "Rajkot",
        starting_price: 150000,
        phone: "",
        whatsapp: "",
        instagram: "",
        website: "",
        description:
            "Modern wedding environments combining architecture, florals, texture and light.",
        cover_image:
            "https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=900&q=85",
        is_approved: true
    },

    {
        id: "demo-6",
        user_id: null,
        business_name: "Noor Bridal Studio",
        category: "Bridal Wear",
        city: "Ahmedabad",
        starting_price: 60000,
        phone: "",
        whatsapp: "",
        instagram: "",
        website: "",
        description:
            "Contemporary bridal silhouettes with intricate craftsmanship and modern styling.",
        cover_image:
            "https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=900&q=85",
        is_approved: true
    }
];


/* =========================================================
   CURRENT USER STATE
========================================================= */

let currentUser = null;
let currentProfile = null;


/* =========================================================
   UTILITY
========================================================= */

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function showToast(message) {

    const toast =
        document.getElementById("toast");

    if (!toast) {
        alert(message);
        return;
    }

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 2800);
}


function generateId(prefix = "id") {

    return (
        prefix +
        "-" +
        Date.now() +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 9)
    );
}


function formatPrice(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "Price on request";
    }

    const number =
        Number(value);

    if (Number.isNaN(number)) {
        return String(value);
    }

    return (
        "₹" +
        number.toLocaleString("en-IN") +
        " onwards"
    );
}


/* =========================================================
   ERROR HANDLER
========================================================= */

function handleSupabaseError(error, fallbackMessage) {

    console.error(
        "Supabase error:",
        error
    );

    showToast(
        error?.message ||
        fallbackMessage ||
        "Something went wrong."
    );
}


/* =========================================================
   PROFILE
========================================================= */

async function loadCurrentProfile() {

    if (!currentUser) {

        currentProfile = null;

        return null;
    }


    const {
        data,
        error
    } = await supabaseClient
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .maybeSingle();


    if (error) {

        console.error(
            "Profile loading error:",
            error
        );

        currentProfile = null;

        return null;
    }


    currentProfile = data;

    return data;
}


async function ensureCurrentProfile() {

    if (!currentUser) {
        return null;
    }


    let profile =
        await loadCurrentProfile();


    if (profile) {
        return profile;
    }


    const metadata =
        currentUser.user_metadata || {};


    const name =
        metadata.full_name ||
        metadata.name ||
        currentUser.email
            ?.split("@")[0] ||
        "User";


    const role =
        metadata.account_type === "vendor"
            ? "vendor"
            : "viewer";


    const {
        data,
        error
    } = await supabaseClient
        .from("profiles")
        .insert({
            id: currentUser.id,
            full_name: name,
            email: currentUser.email,
            account_type: role
        })
        .select()
        .single();


    if (error) {

        console.error(
            "Profile creation error:",
            error
        );

        return null;
    }


    currentProfile = data;

    return data;
}


/* =========================================================
   AUTH STATE
========================================================= */

async function loadAuthState() {

    const {
        data,
        error
    } = await supabaseClient
        .auth
        .getSession();


    if (error) {

        console.error(
            "Session error:",
            error
        );

        return;
    }


    currentUser =
        data.session?.user || null;


    if (currentUser) {

        await ensureCurrentProfile();

    } else {

        currentProfile = null;
    }


    updateNavigation();
}


/* =========================================================
   AUTH STATE LISTENER
========================================================= */

supabaseClient
    .auth
    .onAuthStateChange(
        (event, session) => {

            currentUser =
                session?.user || null;

            /*
             * Delay database work slightly so that
             * Supabase finishes its auth state update.
             */
            setTimeout(async () => {

                if (currentUser) {

                    await ensureCurrentProfile();

                } else {

                    currentProfile = null;
                }

                updateNavigation();

            }, 0);

        }
    );


/* =========================================================
   PAGE NAVIGATION
========================================================= */

function showPage(pageName) {

    const pages =
        document.querySelectorAll(".page");


    pages.forEach(page => {

        page.classList.remove("active");

    });


    const target =
        document.getElementById(
            pageName + "Page"
        );


    if (!target) {
        return;
    }


    target.classList.add("active");


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    if (pageName === "home") {

        renderHome();

    }


    if (pageName === "vendors") {

        prepareFilters();

        filterVendors();

    }


    if (pageName === "categories") {

        renderCategories();

    }


    if (pageName === "favorites") {

        renderFavorites();

    }


    if (pageName === "dashboard") {

        renderDashboard();

    }


    updateNavigation();
}


/* =========================================================
   MOBILE MENU
========================================================= */

function toggleMobileMenu() {

    const menu =
        document.getElementById(
            "mobileMenu"
        );

    if (!menu) return;

    menu.classList.toggle("active");
}


/* =========================================================
   NAVIGATION
========================================================= */

function updateNavigation() {

    const actions =
        document.getElementById(
            "navActions"
        );


    if (!actions) {
        return;
    }


    if (!currentUser) {

        actions.innerHTML = `

            <button
                class="text-btn"
                onclick="openAuth('login')">

                Login

            </button>

            <button
                class="dark-btn small"
                onclick="openAuth('signup')">

                Join

            </button>

        `;

        return;
    }


    const role =
        currentProfile?.account_type ||
        currentUser.user_metadata?.account_type ||
        "viewer";


    if (role === "vendor") {

        actions.innerHTML = `

            <button
                class="text-btn"
                onclick="showPage('dashboard')">

                Dashboard

            </button>

            <button
                class="dark-btn small"
                onclick="logout()">

                Logout

            </button>

        `;

    } else {

        actions.innerHTML = `

            <button
                class="text-btn"
                onclick="showPage('favorites')">

                Saved

            </button>

            <button
                class="dark-btn small"
                onclick="logout()">

                Logout

            </button>

        `;
    }
}


/* =========================================================
   HOME
========================================================= */

async function renderHome() {

    renderHomeCategories();

    await renderFeaturedVendors();

    updateNavigation();
}


function renderHomeCategories() {

    const container =
        document.getElementById(
            "homeCategories"
        );


    if (!container) return;


    container.innerHTML =
        categories
            .slice(0, 8)
            .map(
                (category, index) => {

                    return `

                        <div
                            class="category-card"
                            onclick="openCategory('${escapeHTML(category.name)}')">

                            <span class="category-number">
                                ${String(index + 1).padStart(2, "0")}
                            </span>

                            <h3>
                                ${escapeHTML(category.name)}
                            </h3>

                            <p>
                                ${escapeHTML(category.description)}
                            </p>

                        </div>

                    `;

                }
            )
            .join("");
}


async function renderFeaturedVendors() {

    const container =
        document.getElementById(
            "featuredVendors"
        );


    if (!container) return;


    const vendors =
        await fetchVendors();


    renderVendorCards(
        vendors.slice(0, 6),
        container
    );
}


/* =========================================================
   FETCH VENDORS FROM SUPABASE
========================================================= */

async function fetchVendors() {

    let query =
        supabaseClient
            .from("vendors")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    /*
     * Visitors only see approved vendors.
     *
     * Logged-in vendors can also see their own
     * listing even if it is awaiting approval.
     */

    if (currentUser) {

        query =
            query.or(
                `is_approved.eq.true,user_id.eq.${currentUser.id}`
            );

    } else {

        query =
            query.eq(
                "is_approved",
                true
            );
    }


    const {
        data,
        error
    } = await query;


    if (error) {

        handleSupabaseError(
            error,
            "Could not load vendors."
        );

        return [];
    }


    return data || [];
}


/* =========================================================
   VENDOR CARDS
========================================================= */

async function renderVendorCards(
    vendors,
    container
) {

    if (!container) {
        return;
    }


    if (!vendors.length) {

        container.innerHTML = `

            <div class="empty-state">

                <h3>
                    No vendors found.
                </h3>

                <p>
                    Try another search or category.
                </p>

            </div>

        `;

        return;
    }


    let favoriteIds = [];


    if (currentUser) {

        favoriteIds =
            await getFavoriteIds();
    }


    container.innerHTML =
        vendors
            .map(
                vendor => {

                    const isFavorite =
                        favoriteIds.includes(
                            vendor.id
                        );


                    return `

                        <article class="vendor-card">

                            <div class="vendor-image">

                                <img
                                    src="${escapeHTML(
                                        vendor.cover_image ||
                                        "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80"
                                    )}"
                                    alt="${escapeHTML(vendor.business_name)}"
                                    loading="lazy"
                                    onerror="this.src='https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80'"
                                >

                                <button
                                    class="favorite-btn ${isFavorite ? "active" : ""}"
                                    onclick="toggleFavorite('${vendor.id}', event)"
                                    aria-label="Save vendor">

                                    ${isFavorite ? "♥" : "♡"}

                                </button>

                            </div>


                            <div class="vendor-info">

                                <span class="vendor-category">
                                    ${escapeHTML(vendor.category)}
                                </span>

                                <h3>
                                    ${escapeHTML(vendor.business_name)}
                                </h3>

                                <p class="vendor-location">
                                    ${escapeHTML(vendor.city)}
                                </p>

                                <p class="vendor-price">
                                    ${escapeHTML(
                                        formatPrice(
                                            vendor.starting_price
                                        )
                                    )}
                                </p>

                                <button
                                    class="view-profile"
                                    onclick="openVendor('${vendor.id}')">

                                    View profile →

                                </button>

                            </div>

                        </article>

                    `;

                }
            )
            .join("");
}


/* =========================================================
   FILTERS
========================================================= */

function prepareFilters() {

    const categorySelect =
        document.getElementById(
            "categoryFilter"
        );

    const citySelect =
        document.getElementById(
            "cityFilter"
        );


    if (categorySelect) {

        const currentValue =
            categorySelect.value;


        categorySelect.innerHTML =
            `<option value="">All Categories</option>` +
            categories
                .map(
                    category => `

                        <option value="${escapeHTML(category.name)}">
                            ${escapeHTML(category.name)}
                        </option>

                    `
                )
                .join("");


        categorySelect.value =
            currentValue;
    }


    if (citySelect) {

        const currentValue =
            citySelect.value;


        citySelect.innerHTML =
            `<option value="">All Cities</option>` +
            cities
                .map(
                    city => `

                        <option value="${escapeHTML(city)}">
                            ${escapeHTML(city)}
                        </option>

                    `
                )
                .join("");


        citySelect.value =
            currentValue;
    }
}


async function filterVendors() {

    const searchInput =
        document.getElementById(
            "vendorSearch"
        );


    const categorySelect =
        document.getElementById(
            "categoryFilter"
        );


    const citySelect =
        document.getElementById(
            "cityFilter"
        );


    const grid =
        document.getElementById(
            "vendorGrid"
        );


    if (!grid) {
        return;
    }


    const search =
        searchInput?.value
            ?.toLowerCase()
            .trim() || "";


    const category =
        categorySelect?.value || "";


    const city =
        citySelect?.value || "";


    let vendors =
        await fetchVendors();


    vendors =
        vendors.filter(
            vendor => {

                const businessName =
                    (
                        vendor.business_name ||
                        ""
                    ).toLowerCase();


                const vendorCategory =
                    (
                        vendor.category ||
                        ""
                    ).toLowerCase();


                const vendorCity =
                    (
                        vendor.city ||
                        ""
                    ).toLowerCase();


                const matchesSearch =
                    !search ||
                    businessName.includes(search) ||
                    vendorCategory.includes(search) ||
                    vendorCity.includes(search);


                const matchesCategory =
                    !category ||
                    vendor.category === category;


                const matchesCity =
                    !city ||
                    vendor.city === city;


                return (
                    matchesSearch &&
                    matchesCategory &&
                    matchesCity
                );

            }
        );


    const countElement =
        document.getElementById(
            "resultCount"
        );


    if (countElement) {

        countElement.textContent =
            `${vendors.length} vendor${
                vendors.length === 1
                    ? ""
                    : "s"
            }`;

    }


    await renderVendorCards(
        vendors,
        grid
    );
}


/* =========================================================
   HOME SEARCH
========================================================= */

function homeSearchKey(event) {

    if (
        event.key === "Enter"
    ) {

        searchFromHome();

    }
}


function searchFromHome() {

    const input =
        document.getElementById(
            "homeSearch"
        );


    const value =
        input?.value.trim() || "";


    showPage("vendors");


    const vendorSearch =
        document.getElementById(
            "vendorSearch"
        );


    if (vendorSearch) {

        vendorSearch.value =
            value;

    }


    filterVendors();
}


/* =========================================================
   CATEGORIES
========================================================= */

function openCategory(category) {

    showPage("vendors");


    const select =
        document.getElementById(
            "categoryFilter"
        );


    if (select) {

        select.value =
            category;

    }


    filterVendors();
}


async function renderCategories() {

    const container =
        document.getElementById(
            "allCategories"
        );


    if (!container) {
        return;
    }


    const vendors =
        await fetchVendors();


    container.innerHTML =
        categories
            .map(
                (category, index) => {

                    const count =
                        vendors.filter(
                            vendor =>
                                vendor.category ===
                                category.name
                        ).length;


                    return `

                        <div
                            class="category-card"
                            onclick="openCategory('${escapeHTML(category.name)}')">

                            <span class="category-number">
                                ${String(index + 1).padStart(2, "0")}
                            </span>

                            <h3>
                                ${escapeHTML(category.name)}
                            </h3>

                            <p>
                                ${escapeHTML(category.description)}
                            </p>

                            <p>
                                ${count}
                                vendor${count === 1 ? "" : "s"}
                            </p>

                        </div>

                    `;

                }
            )
            .join("");
}


/* =========================================================
   FAVOURITES
========================================================= */

async function getFavoriteIds() {

    if (!currentUser) {
        return [];
    }


    const {
        data,
        error
    } = await supabaseClient
        .from("favourites")
        .select("vendor_id")
        .eq(
            "user_id",
            currentUser.id
        );


    if (error) {

        console.error(
            "Favourite loading error:",
            error
        );

        return [];
    }


    return (
        data || []
    ).map(
        item =>
            item.vendor_id
    );
}


async function toggleFavorite(
    vendorId,
    event
) {

    if (event) {

        event.stopPropagation();

    }


    if (!currentUser) {

        showToast(
            "Please log in to save vendors."
        );

        openAuth("login");

        return;
    }


    const favoriteIds =
        await getFavoriteIds();


    if (
        favoriteIds.includes(
            vendorId
        )
    ) {

        const {
            error
        } = await supabaseClient
            .from("favourites")
            .delete()
            .eq(
                "user_id",
                currentUser.id
            )
            .eq(
                "vendor_id",
                vendorId
            );


        if (error) {

            handleSupabaseError(
                error,
                "Could not remove saved vendor."
            );

            return;
        }


        showToast(
            "Removed from saved vendors."
        );

    } else {

        const {
            error
        } = await supabaseClient
            .from("favourites")
            .insert({
                user_id:
                    currentUser.id,
                vendor_id:
                    vendorId
            });


        if (error) {

            handleSupabaseError(
                error,
                "Could not save vendor."
            );

            return;
        }


        showToast(
            "Vendor saved."
        );
    }


    const activePage =
        document.querySelector(
            ".page.active"
        );


    if (
        activePage?.id ===
        "vendorsPage"
    ) {

        await filterVendors();

    } else if (
        activePage?.id ===
        "favoritesPage"
    ) {

        await renderFavorites();

    } else {

        await renderHome();

    }
}


async function renderFavorites() {

    const container =
        document.getElementById(
            "favoritesGrid"
        );


    if (!container) {
        return;
    }


    if (!currentUser) {

        container.innerHTML = `

            <div class="empty-state">

                <h3>
                    Your saved vendors are waiting.
                </h3>

                <p>
                    Log in to create your collection.
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


    const favoriteIds =
        await getFavoriteIds();


    if (!favoriteIds.length) {

        container.innerHTML = `

            <div class="empty-state">

                <h3>
                    No saved vendors yet.
                </h3>

                <p>
                    Explore vendors and save the ones you love.
                </p>

                <button
                    class="dark-btn"
                    onclick="showPage('vendors')">

                    Explore Vendors

                </button>

            </div>

        `;

        return;
    }


    const {
        data,
        error
    } = await supabaseClient
        .from("vendors")
        .select("*")
        .in(
            "id",
            favoriteIds
        );


    if (error) {

        handleSupabaseError(
            error,
            "Could not load saved vendors."
        );

        return;
    }


    await renderVendorCards(
        data || [],
        container
    );
}


/* =========================================================
   VENDOR PROFILE
========================================================= */

async function openVendor(id) {

    const {
        data: vendor,
        error
    } = await supabaseClient
        .from("vendors")
        .select("*")
        .eq(
            "id",
            id
        )
        .single();


    if (error || !vendor) {

        handleSupabaseError(
            error,
            "Vendor not found."
        );

        return;
    }


    const container =
        document.getElementById(
            "profileContent"
        );


    if (!container) {
        return;
    }


    let isFavorite = false;


    if (currentUser) {

        const {
            data
        } = await supabaseClient
            .from("favourites")
            .select("id")
            .eq(
                "user_id",
                currentUser.id
            )
            .eq(
                "vendor_id",
                vendor.id
            )
            .maybeSingle();


        isFavorite =
            !!data;
    }


    const {
        data: gallery
    } = await supabaseClient
        .from("vendor_images")
        .select("*")
        .eq(
            "vendor_id",
            vendor.id
        )
        .order(
            "created_at",
            {
                ascending: true
            }
        );


    const galleryImages =
        gallery || [];


    container.innerHTML = `

        <div class="profile-wrapper">

            <button
                class="profile-back"
                onclick="showPage('vendors')">

                ← Back to vendors

            </button>


            <div class="profile-hero">

                <div class="profile-main-image">

                    <img
                        src="${escapeHTML(
                            vendor.cover_image ||
                            "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80"
                        )}"
                        alt="${escapeHTML(vendor.business_name)}"
                    >

                </div>


                <div class="profile-details">

                    <span class="vendor-category">
                        ${escapeHTML(vendor.category)}
                    </span>

                    <h1>
                        ${escapeHTML(vendor.business_name)}
                    </h1>

                    <p class="location">
                        ${escapeHTML(vendor.city)}, Gujarat
                    </p>

                    <p class="profile-description">
                        ${escapeHTML(vendor.description)}
                    </p>


                    <div class="profile-meta">

                        <div>

                            <span>
                                Starting price
                            </span>

                            <strong>
                                ${escapeHTML(
                                    formatPrice(
                                        vendor.starting_price
                                    )
                                )}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Location
                            </span>

                            <strong>
                                ${escapeHTML(vendor.city)}
                            </strong>

                        </div>

                    </div>


                    <div class="profile-actions">

                        <button
                            class="dark-btn"
                            onclick="contactVendor('${vendor.id}')">

                            Contact Vendor

                        </button>

                        <button
                            class="outline-btn"
                            onclick="toggleFavorite('${vendor.id}')">

                            ${
                                isFavorite
                                    ? "♥ Saved"
                                    : "♡ Save Vendor"
                            }

                        </button>

                    </div>

                </div>

            </div>


            ${
                galleryImages.length
                    ? `

                        <div class="vendor-gallery">

                            <h2>
                                Portfolio
                            </h2>

                            <div class="gallery-grid">

                                ${galleryImages
                                    .map(
                                        image => `

                                            <img
                                                src="${escapeHTML(image.image_url)}"
                                                alt="${escapeHTML(vendor.business_name)} portfolio image"
                                                loading="lazy"
                                            >

                                        `
                                    )
                                    .join("")}

                            </div>

                        </div>

                    `
                    : ""
            }

        </div>

    `;


    showPage("profile");
}


/* =========================================================
   CONTACT VENDOR
========================================================= */

async function contactVendor(id) {

    const {
        data: vendor
    } = await supabaseClient
        .from("vendors")
        .select("*")
        .eq(
            "id",
            id
        )
        .single();


    if (!vendor) {
        return;
    }


    if (vendor.whatsapp) {

        let number =
            vendor.whatsapp
                .replace(/\D/g, "");


        if (
            number.length === 10
        ) {

            number =
                "91" + number;

        }


        window.open(
            "https://wa.me/" + number,
            "_blank"
        );

        return;
    }


    if (vendor.phone) {

        window.location.href =
            "tel:" +
            vendor.phone;

        return;
    }


    if (vendor.instagram) {

        let url =
            vendor.instagram.trim();


        if (
            !url.startsWith("http")
        ) {

            url =
                "https://instagram.com/" +
                url.replace("@", "");

        }


        window.open(
            url,
            "_blank"
        );

        return;
    }


    showToast(
        "This vendor hasn't added contact details yet."
    );
}


/* =========================================================
   AUTH MODAL
========================================================= */

function openAuth(
    mode = "login",
    role = ""
) {

    renderAuth(
        mode,
        role
    );


    const modal =
        document.getElementById(
            "authModal"
        );


    if (modal) {

        modal.classList.add(
            "active"
        );

    }
}


function closeModal(id) {

    const modal =
        document.getElementById(
            id
        );


    if (modal) {

        modal.classList.remove(
            "active"
        );

    }
}


/* =========================================================
   AUTH UI
========================================================= */

function renderAuth(
    mode,
    role = ""
) {

    const container =
        document.getElementById(
            "authContent"
        );


    if (!container) {
        return;
    }


    if (mode === "login") {

        container.innerHTML = `

            <h2 class="auth-title">
                Welcome back.
            </h2>

            <p class="auth-subtitle">
                Log in to your Wed Tale account.
            </p>


            <form
                class="auth-form"
                onsubmit="login(event)">

                <input
                    type="email"
                    id="loginEmail"
                    placeholder="Email address"
                    autocomplete="email"
                    required
                >


                <input
                    type="password"
                    id="loginPassword"
                    placeholder="Password"
                    autocomplete="current-password"
                    required
                >


                <button
                    class="dark-btn"
                    type="submit">

                    Login

                </button>

            </form>


            <div class="auth-switch">

                Don't have an account?

                <button
                    onclick="renderAuth('signup')">

                    Create one

                </button>

            </div>

        `;

        return;
    }


    container.innerHTML = `

        <h2 class="auth-title">
            Join The Wed Tale.
        </h2>

        <p class="auth-subtitle">
            Choose how you'll use the platform.
        </p>


        <form
            class="auth-form"
            onsubmit="signup(event)">


            <input
                type="text"
                id="signupName"
                placeholder="Your name"
                autocomplete="name"
                required
            >


            <input
                type="email"
                id="signupEmail"
                placeholder="Email address"
                autocomplete="email"
                required
            >


            <input
                type="password"
                id="signupPassword"
                placeholder="Create password"
                autocomplete="new-password"
                minlength="6"
                required
            >


            <select
                id="signupRole"
                required>

                <option value="">
                    Choose account type
                </option>

                <option
                    value="viewer"
                    ${
                        role === "viewer"
                            ? "selected"
                            : ""
                    }>

                    Couple / Viewer

                </option>

                <option
                    value="vendor"
                    ${
                        role === "vendor"
                            ? "selected"
                            : ""
                    }>

                    Wedding Vendor

                </option>

            </select>


            <button
                class="dark-btn"
                type="submit">

                Create Account

            </button>


        </form>


        <div class="auth-switch">

            Already have an account?

            <button
                onclick="renderAuth('login')">

                Login

            </button>

        </div>

    `;
}


/* =========================================================
   SIGN UP
========================================================= */

async function signup(event) {

    event.preventDefault();


    const name =
        document.getElementById(
            "signupName"
        ).value.trim();


    const email =
        document.getElementById(
            "signupEmail"
        ).value.trim()
        .toLowerCase();


    const password =
        document.getElementById(
            "signupPassword"
        ).value;


    const role =
        document.getElementById(
            "signupRole"
        ).value;


    if (!role) {

        showToast(
            "Please choose an account type."
        );

        return;
    }


    const button =
        event.target.querySelector(
            'button[type="submit"]'
        );


    if (button) {

        button.disabled = true;

        button.textContent =
            "Creating account...";

    }


    try {

        /*
         * The role and name are stored in
         * Supabase Auth user metadata.
         *
         * This is useful because your project currently
         * has email confirmation enabled.
         */

            const { data, error } = await supabaseClient.auth.signUp({
    email: email,
    password: password,
    options: {
        emailRedirectTo: window.location.origin + "/index.html",
        data: {
            full_name: name,
            account_type: role
        }
    }
});


        if (error) {

            throw error;

        }


        /*
         * If email confirmation is enabled,
         * Supabase may return a user without
         * an active session.
         */

        if (
            data.user &&
            data.session
        ) {

            currentUser =
                data.user;


            await ensureCurrentProfile();


            closeModal(
                "authModal"
            );


            showToast(
                "Account created successfully."
            );


            if (
                role === "vendor"
            ) {

                showPage(
                    "dashboard"
                );

            } else {

                showPage(
                    "home"
                );

            }

        } else {

            closeModal(
                "authModal"
            );


            showToast(
                "Account created. Check your email to confirm it, then log in."
            );

        }

    } catch (error) {

        handleSupabaseError(
            error,
            "Could not create your account."
        );

    } finally {

        if (button) {

            button.disabled = false;

            button.textContent =
                "Create Account";

        }

    }
}


/* =========================================================
   LOGIN
========================================================= */

async function login(event) {

    event.preventDefault();


    const email =
        document.getElementById(
            "loginEmail"
        ).value.trim()
        .toLowerCase();


    const password =
        document.getElementById(
            "loginPassword"
        ).value;


    const button =
        event.target.querySelector(
            'button[type="submit"]'
        );


    if (button) {

        button.disabled = true;

        button.textContent =
            "Logging in...";

    }


    try {

        const {
            data,
            error
        } = await supabaseClient
            .auth
            .signInWithPassword({

                email,

                password

            });


        if (error) {

            throw error;

        }


        currentUser =
            data.user;


        await ensureCurrentProfile();


        closeModal(
            "authModal"
        );


        const name =
            currentProfile?.full_name ||
            currentUser.email
                ?.split("@")[0] ||
            "there";


        showToast(
            "Welcome back, " +
            name +
            "."
        );


        const role =
            currentProfile?.account_type ||
            currentUser.user_metadata
                ?.account_type ||
            "viewer";


        if (
            role === "vendor"
        ) {

            showPage(
                "dashboard"
            );

        } else {

            showPage(
                "home"
            );

        }

    } catch (error) {

        handleSupabaseError(
            error,
            "Incorrect email or password."
        );

    } finally {

        if (button) {

            button.disabled = false;

            button.textContent =
                "Login";

        }

    }
}


/* =========================================================
   LOGOUT
========================================================= */

async function logout() {

    const {
        error
    } = await supabaseClient
        .auth
        .signOut();


    if (error) {

        handleSupabaseError(
            error,
            "Could not log out."
        );

        return;
    }


    currentUser = null;

    currentProfile = null;


    showToast(
        "You've been logged out."
    );


    showPage(
        "home"
    );
}


/* =========================================================
   VENDOR DASHBOARD
========================================================= */

async function renderDashboard() {

    const container =
        document.getElementById(
            "dashboardContent"
        );


    if (!container) {
        return;
    }


    if (!currentUser) {

        container.innerHTML = `

            <div class="dashboard">

                <div class="empty-state">

                    <h3>
                        Vendor dashboard
                    </h3>

                    <p>
                        Log in with a vendor account
                        to manage your business.
                    </p>

                    <button
                        class="dark-btn"
                        onclick="openAuth('login')">

                        Login

                    </button>

                </div>

            </div>

        `;

        return;
    }


    const role =
        currentProfile?.account_type ||
        currentUser.user_metadata
            ?.account_type;


    if (role !== "vendor") {

        container.innerHTML = `

            <div class="dashboard">

                <div class="empty-state">

                    <h3>
                        Vendor access only.
                    </h3>

                    <p>
                        This dashboard is for wedding vendors.
                    </p>

                </div>

            </div>

        `;

        return;
    }


    const {
        data: myListings,
        error
    } = await supabaseClient
        .from("vendors")
        .select("*")
        .eq(
            "user_id",
            currentUser.id
        )
        .order(
            "created_at",
            {
                ascending: false
            }
        );


    if (error) {

        handleSupabaseError(
            error,
            "Could not load your listings."
        );

        return;
    }


    const listings =
        myListings || [];


    container.innerHTML = `

        <div class="dashboard">

            <div class="dashboard-header">

                <div>

                    <p class="eyebrow">
                        VENDOR STUDIO
                    </p>

                    <h1>
                        Welcome,
                        ${escapeHTML(
                            currentProfile?.full_name ||
                            currentUser.email
                        )}.
                    </h1>

                </div>


                <button
                    class="dark-btn"
                    onclick="openListingForm()">

                    + Add Listing

                </button>

            </div>


            <div class="dashboard-grid">

                <div class="stat-card">

                    <span>
                        YOUR LISTINGS
                    </span>

                    <strong>
                        ${listings.length}
                    </strong>

                </div>


                <div class="stat-card">

                    <span>
                        SAVED BY USERS
                    </span>

                    <strong>
                        —
                    </strong>

                </div>


                <div class="stat-card">

                    <span>
                        PROFILE STATUS
                    </span>

                    <strong>
                        ${
                            listings.length
                                ? "LIVE"
                                : "—"
                        }
                    </strong>

                </div>

            </div>


            <div class="dashboard-card">

                <h2>
                    Your listings
                </h2>


                ${
                    listings.length
                        ?

                        listings
                            .map(
                                vendor => `

                                    <div class="listing-row">

                                        <div>

                                            <h3>
                                                ${escapeHTML(
                                                    vendor.business_name
                                                )}
                                            </h3>

                                            <span>
                                                ${escapeHTML(
                                                    vendor.category
                                                )}

                                                ·

                                                ${escapeHTML(
                                                    vendor.city
                                                )}
                                            </span>

                                        </div>


                                        <div class="listing-actions">

                                            <button
                                                class="small-outline"
                                                onclick="openVendor('${vendor.id}')">

                                                View

                                            </button>


                                            <button
                                                class="small-outline"
                                                onclick="openListingForm('${vendor.id}')">

                                                Edit

                                            </button>


                                            <button
                                                class="small-danger"
                                                onclick="deleteListing('${vendor.id}')">

                                                Delete

                                            </button>

                                        </div>

                                    </div>

                                `
                            )
                            .join("")

                        :

                        `

                            <div class="empty-state">

                                <h3>
                                    Your business isn't listed yet.
                                </h3>

                                <p>
                                    Create your first vendor profile
                                    to appear in the directory.
                                </p>

                                <button
                                    class="dark-btn"
                                    onclick="openListingForm()">

                                    Create Listing

                                </button>

                            </div>

                        `
                }

            </div>

        </div>

    `;
}


/* =========================================================
   LISTING FORM
========================================================= */

async function openListingForm(
    editId = null
) {

    if (!currentUser) {

        openAuth(
            "login"
        );

        return;
    }


    const role =
        currentProfile?.account_type ||
        currentUser.user_metadata
            ?.account_type;


    if (role !== "vendor") {

        showToast(
            "Only vendor accounts can create listings."
        );

        return;
    }


    let existing = null;


    if (editId) {

        const {
            data,
            error
        } = await supabaseClient
            .from("vendors")
            .select("*")
            .eq(
                "id",
                editId
            )
            .eq(
                "user_id",
                currentUser.id
            )
            .single();


        if (error) {

            handleSupabaseError(
                error,
                "Could not load this listing."
            );

            return;
        }


        existing =
            data;
    }


    const container =
        document.getElementById(
            "dashboardContent"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="form-wrapper">

            <button
                class="profile-back"
                onclick="renderDashboard()">

                ← Back to dashboard

            </button>


            <p class="eyebrow">
                VENDOR PROFILE
            </p>


            <h1>
                ${
                    existing
                        ? "Edit your listing."
                        : "Tell Gujarat about your work."
                }
            </h1>


            <form
                onsubmit="saveListing(event, '${
                    existing
                        ? existing.id
                        : ""
                }')">


                <div class="form-grid">


                    <div class="form-field">

                        <label>
                            Business Name *
                        </label>

                        <input
                            id="businessName"
                            type="text"
                            value="${
                                existing
                                    ? escapeHTML(
                                        existing.business_name
                                    )
                                    : ""
                            }"
                            placeholder="e.g. Studio Nysa"
                            required
                        >

                    </div>


                    <div class="form-field">

                        <label>
                            Category *
                        </label>

                        <select
                            id="businessCategory"
                            required>

                            <option value="">
                                Select category
                            </option>

                            ${
                                categories
                                    .map(
                                        category => `

                                            <option
                                                value="${escapeHTML(
                                                    category.name
                                                )}"
                                                ${
                                                    existing &&
                                                    existing.category ===
                                                        category.name
                                                        ? "selected"
                                                        : ""
                                                }>

                                                ${escapeHTML(
                                                    category.name
                                                )}

                                            </option>

                                        `
                                    )
                                    .join("")
                            }

                        </select>

                    </div>


                    <div class="form-field">

                        <label>
                            City *
                        </label>

                        <select
                            id="businessCity"
                            required>

                            <option value="">
                                Select city
                            </option>

                            ${
                                cities
                                    .map(
                                        city => `

                                            <option
                                                value="${escapeHTML(city)}"
                                                ${
                                                    existing &&
                                                    existing.city === city
                                                        ? "selected"
                                                        : ""
                                                }>

                                                ${escapeHTML(city)}

                                            </option>

                                        `
                                    )
                                    .join("")
                            }

                        </select>

                    </div>


                    <div class="form-field">

                        <label>
                            Starting Price
                        </label>

                        <input
                            id="businessPrice"
                            type="number"
                            min="0"
                            value="${
                                existing &&
                                existing.starting_price !== null
                                    ? escapeHTML(
                                        existing.starting_price
                                    )
                                    : ""
                            }"
                            placeholder="50000"
                        >

                    </div>


                    <div class="form-field">

                        <label>
                            Phone
                        </label>

                        <input
                            id="businessPhone"
                            type="tel"
                            value="${
                                existing
                                    ? escapeHTML(
                                        existing.phone
                                    )
                                    : ""
                            }"
                            placeholder="+91..."
                        >

                    </div>


                    <div class="form-field">

                        <label>
                            WhatsApp
                        </label>

                        <input
                            id="businessWhatsapp"
                            type="tel"
                            value="${
                                existing
                                    ? escapeHTML(
                                        existing.whatsapp
                                    )
                                    : ""
                            }"
                            placeholder="+91..."
                        >

                    </div>


                    <div class="form-field">

                        <label>
                            Instagram
                        </label>

                        <input
                            id="businessInstagram"
                            type="text"
                            value="${
                                existing
                                    ? escapeHTML(
                                        existing.instagram
                                    )
                                    : ""
                            }"
                            placeholder="@yourhandle"
                        >

                    </div>


                    <div class="form-field">

                        <label>
                            Website
                        </label>

                        <input
                            id="businessWebsite"
                            type="url"
                            value="${
                                existing
                                    ? escapeHTML(
                                        existing.website
                                    )
                                    : ""
                            }"
                            placeholder="https://..."
                        >

                    </div>


                    <div class="form-field full">

                        <label>
                            Portfolio Image URL
                        </label>

                        <input
                            id="businessImage"
                            type="url"
                            value="${
                                existing
                                    ? escapeHTML(
                                        existing.cover_image
                                    )
                                    : ""
                            }"
                            placeholder="https://..."
                        >

                    </div>


                    <div class="form-field full">

                        <label>
                            Or Upload Portfolio Image
                        </label>

                        <input
                            id="businessImageFile"
                            type="file"
                            accept="image/*"
                        >

                        <small>
                            JPG, PNG or WebP. Keep images reasonably sized.
                        </small>

                    </div>


                    <div class="form-field full">

                        <label>
                            About Your Business *
                        </label>

                        <textarea
                            id="businessDescription"
                            placeholder="Tell couples about your style, experience and services..."
                            required>${
                                existing
                                    ? escapeHTML(
                                        existing.description
                                    )
                                    : ""
                            }</textarea>

                    </div>


                </div>


                <div class="form-buttons">

                    <button
                        type="submit"
                        class="dark-btn">

                        ${
                            existing
                                ? "Update Listing"
                                : "Publish Listing"
                        }

                    </button>


                    <button
                        type="button"
                        class="outline-btn"
                        onclick="renderDashboard()">

                        Cancel

                    </button>

                </div>


            </form>

        </div>

    `;
}


/* =========================================================
   UPLOAD IMAGE
========================================================= */

async function uploadVendorImage(
    file,
    vendorId
) {

    if (!file) {
        return null;
    }


    if (!file.type.startsWith("image/")) {

        throw new Error(
            "Please select an image file."
        );

    }


    /*
     * Keep browser uploads reasonably small.
     */

    if (
        file.size >
        6 * 1024 * 1024
    ) {

        throw new Error(
            "Please use an image smaller than 6 MB."
        );

    }


    const extension =
        file.name
            .split(".")
            .pop()
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "");


    const fileName =
        `${vendorId}-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 8)}.${extension}`;


    /*
     * IMPORTANT:
     * First folder is the authenticated user's UUID.
     *
     * This matches the Storage RLS policies
     * you created earlier.
     */

    const filePath =
        `${currentUser.id}/${fileName}`;


    const {
        data,
        error
    } = await supabaseClient
        .storage
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


    if (error) {

        throw error;

    }


    /*
     * This requires the vendor-images bucket
     * to be PUBLIC.
     */

    const {
        data: publicData
    } = supabaseClient
        .storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(
            data.path
        );


    return publicData.publicUrl;
}


/* =========================================================
   SAVE LISTING
========================================================= */

async function saveListing(
    event,
    editId
) {

    event.preventDefault();


    if (!currentUser) {

        showToast(
            "Please log in first."
        );

        return;
    }


    const businessName =
        document.getElementById(
            "businessName"
        ).value.trim();


    const category =
        document.getElementById(
            "businessCategory"
        ).value;


    const city =
        document.getElementById(
            "businessCity"
        ).value;


    const priceInput =
        document.getElementById(
            "businessPrice"
        ).value.trim();


    const phone =
        document.getElementById(
            "businessPhone"
        ).value.trim();


    const whatsapp =
        document.getElementById(
            "businessWhatsapp"
        ).value.trim();


    const instagram =
        document.getElementById(
            "businessInstagram"
        ).value.trim();


    const website =
        document.getElementById(
            "businessWebsite"
        ).value.trim();


    const imageUrl =
        document.getElementById(
            "businessImage"
        ).value.trim();


    const imageFile =
        document.getElementById(
            "businessImageFile"
        )?.files?.[0] || null;


    const description =
        document.getElementById(
            "businessDescription"
        ).value.trim();


    const price =
        priceInput
            ? Number(priceInput)
            : null;


    const submitButton =
        event.target.querySelector(
            'button[type="submit"]'
        );


    if (submitButton) {

        submitButton.disabled =
            true;

        submitButton.textContent =
            "Publishing...";

    }


    try {

        let vendorId =
            editId;


        /*
         * =====================================================
         * CREATE LISTING
         * =====================================================
         */

        if (!editId) {

            const {
                data,
                error
            } = await supabaseClient
                .from("vendors")
                .insert({

                    user_id:
                        currentUser.id,

                    business_name:
                        businessName,

                    category,

                    city,

                    description,

                    phone,

                    whatsapp,

                    instagram,

                    website,

                    starting_price:
                        price,

                    cover_image:
                        imageUrl ||
                        null,

                    /*
                     * For now, vendor listings go live
                     * immediately because we haven't built
                     * an admin approval dashboard yet.
                     */
                    is_approved:
                        true

                })
                .select()
                .single();


            if (error) {

                throw error;

            }


            vendorId =
                data.id;


            /*
             * If the vendor uploaded a file,
             * upload it after the vendor row exists.
             */

            if (imageFile) {

                const uploadedUrl =
                    await uploadVendorImage(
                        imageFile,
                        vendorId
                    );


                const {
                    error:
                        updateError
                } = await supabaseClient
                    .from("vendors")
                    .update({
                        cover_image:
                            uploadedUrl
                    })
                    .eq(
                        "id",
                        vendorId
                    )
                    .eq(
                        "user_id",
                        currentUser.id
                    );


                if (updateError) {

                    throw updateError;

                }


                await saveVendorImageRecord(
                    vendorId,
                    uploadedUrl
                );
            }


            showToast(
                "Your listing is now live."
            );

        }


        /*
         * =====================================================
         * UPDATE LISTING
         * =====================================================
         */

        else {

            const updateData = {

                business_name:
                    businessName,

                category,

                city,

                description,

                phone,

                whatsapp,

                instagram,

                website,

                starting_price:
                    price

            };


            /*
             * If URL supplied, use URL.
             * If a new file is uploaded, the file
             * will replace the cover image.
             */

            if (imageUrl) {

                updateData.cover_image =
                    imageUrl;

            }


            const {
                data,
                error
            } = await supabaseClient
                .from("vendors")
                .update(
                    updateData
                )
                .eq(
                    "id",
                    editId
                )
                .eq(
                    "user_id",
                    currentUser.id
                )
                .select()
                .single();


            if (error) {

                throw error;

            }


            if (imageFile) {

                const uploadedUrl =
                    await uploadVendorImage(
                        imageFile,
                        editId
                    );


                const {
                    error:
                        imageUpdateError
                } = await supabaseClient
                    .from("vendors")
                    .update({

                        cover_image:
                            uploadedUrl,

                        updated_at:
                            new Date()
                                .toISOString()

                    })
                    .eq(
                        "id",
                        editId
                    )
                    .eq(
                        "user_id",
                        currentUser.id
                    );


                if (imageUpdateError) {

                    throw imageUpdateError;

                }


                await saveVendorImageRecord(
                    editId,
                    uploadedUrl
                );

            }


            showToast(
                "Listing updated."
            );
        }


        await renderDashboard();


    } catch (error) {

        handleSupabaseError(
            error,
            "Could not save your listing."
        );

    } finally {

        if (submitButton) {

            submitButton.disabled =
                false;

            submitButton.textContent =
                editId
                    ? "Update Listing"
                    : "Publish Listing";

        }

    }
}


/* =========================================================
   SAVE VENDOR IMAGE RECORD
========================================================= */

async function saveVendorImageRecord(
    vendorId,
    imageUrl
) {

    if (!imageUrl) {
        return;
    }


    const {
        error
    } = await supabaseClient
        .from("vendor_images")
        .insert({

            vendor_id:
                vendorId,

            image_url:
                imageUrl

        });


    if (error) {

        console.error(
            "Vendor image record error:",
            error
        );

    }
}


/* =========================================================
   DELETE LISTING
========================================================= */

async function deleteListing(id) {

    if (!currentUser) {
        return;
    }


    const confirmed =
        confirm(
            "Delete this vendor listing?"
        );


    if (!confirmed) {
        return;
    }


    /*
     * First get images so that we can also
     * remove them from Storage.
     */

    const {
        data: imageRecords
    } = await supabaseClient
        .from("vendor_images")
        .select("image_url")
        .eq(
            "vendor_id",
            id
        );


    const {
        error
    } = await supabaseClient
        .from("vendors")
        .delete()
        .eq(
            "id",
            id
        )
        .eq(
            "user_id",
            currentUser.id
        );


    if (error) {

        handleSupabaseError(
            error,
            "Could not delete listing."
        );

        return;
    }


    /*
     * The vendor_images rows are automatically
     * deleted because vendor_id has ON DELETE CASCADE.
     *
     * Storage files need separate deletion.
     */

    if (
        imageRecords &&
        imageRecords.length
    ) {

        const paths =
            imageRecords
                .map(
                    item =>
                        getStoragePathFromUrl(
                            item.image_url
                        )
                )
                .filter(Boolean);


        if (paths.length) {

            const {
                error:
                    storageError
            } = await supabaseClient
                .storage
                .from(STORAGE_BUCKET)
                .remove(paths);


            if (storageError) {

                console.warn(
                    "Storage cleanup warning:",
                    storageError
                );

            }
        }
    }


    showToast(
        "Listing deleted."
    );


    await renderDashboard();
}


/* =========================================================
   GET STORAGE PATH FROM PUBLIC URL
========================================================= */

function getStoragePathFromUrl(
    url
) {

    if (!url) {
        return null;
    }


    const marker =
        `/storage/v1/object/public/${STORAGE_BUCKET}/`;


    const index =
        url.indexOf(marker);


    if (index === -1) {

        return null;

    }


    return decodeURIComponent(
        url.substring(
            index + marker.length
        )
    );
}


/* =========================================================
   CLOSE AUTH MODAL
========================================================= */

const authModal =
    document.getElementById(
        "authModal"
    );


if (authModal) {

    authModal.addEventListener(
        "click",
        function(event) {

            if (
                event.target ===
                this
            ) {

                closeModal(
                    "authModal"
                );

            }

        }
    );

}


/* =========================================================
   SEARCH INPUT EVENTS
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const vendorSearch =
            document.getElementById(
                "vendorSearch"
            );


        const categoryFilter =
            document.getElementById(
                "categoryFilter"
            );


        const cityFilter =
            document.getElementById(
                "cityFilter"
            );


        if (vendorSearch) {

            vendorSearch.addEventListener(
                "input",
                () => {

                    filterVendors();

                }
            );

        }


        if (categoryFilter) {

            categoryFilter.addEventListener(
                "change",
                () => {

                    filterVendors();

                }
            );

        }


        if (cityFilter) {

            cityFilter.addEventListener(
                "change",
                () => {

                    filterVendors();

                }
            );

        }

    }
);


/* =========================================================
   START APPLICATION
========================================================= */

async function startApp() {

    try {

        console.log(
            "Starting The Wed Tale Gujarat..."
        );


        await loadAuthState();


        prepareFilters();


        await renderHome();


        updateNavigation();


        console.log(
            "The Wed Tale Gujarat is ready."
        );


    } catch (error) {

        console.error(
            "Application startup error:",
            error
        );

        showToast(
            "Website could not finish loading."
        );

    }
}


/* =========================================================
   START
========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        startApp
    );

} else {

    startApp();

}