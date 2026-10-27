async function loadComponent(elementId, componentPath, basePath) {
    const placeholder = document.getElementById(elementId);
    if (!placeholder) return;

    try {
        const response = await fetch(componentPath);
        let html = await response.text();
        
        // Replace {{BASE_PATH}} with actual base path
        html = html.replace(/{{BASE_PATH}}/g, basePath);
        
        placeholder.outerHTML = html;
        
        // Post-load initialization
        if (elementId === 'header-placeholder') {
            initMenu();
            highlightActiveLink();
            moveUtilitySlot();
        }
    } catch (error) {
        console.error(`Error loading component from ${componentPath}:`, error);
    }
}

function initMenu() {
    const menuToggle = document.querySelector(".menu-toggle");
    const navContainer = document.querySelector(".nav-container");
    const navOverlay = document.querySelector("#navOverlay");

    if (!menuToggle || !navContainer || !navOverlay) return;

    const openNav = () => {
        menuToggle.classList.add("is-active");
        menuToggle.setAttribute("aria-expanded", "true");
        navContainer.classList.add("is-active");
        navContainer.setAttribute("aria-hidden", "false");
        navOverlay.classList.add("is-active");
        navOverlay.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    };

    const closeNav = () => {
        menuToggle.classList.remove("is-active");
        menuToggle.setAttribute("aria-expanded", "false");
        navContainer.classList.remove("is-active");
        navContainer.setAttribute("aria-hidden", "true");
        navOverlay.classList.remove("is-active");
        navOverlay.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    };

    menuToggle.addEventListener("click", () => {
        navContainer.classList.contains("is-active") ? closeNav() : openNav();
    });

    navOverlay.addEventListener("click", closeNav);
    
    document.querySelectorAll(".nav-item a").forEach(link => {
        link.addEventListener("click", closeNav);
    });

    // Mobile Search toggle
    const searchArea = document.querySelector(".search");
    if (searchArea) {
        searchArea.addEventListener("click", function(e) {
            if (window.innerWidth <= 650) {
                this.classList.toggle("active");
                const input = this.querySelector("input");
                if (this.classList.contains("active")) {
                    input.focus();
                }
            }
        });
    }
}

function highlightActiveLink() {
    const currentPath = window.location.pathname.toLowerCase();
    const navLinks = document.querySelectorAll(".nav-menu a, .converter-link");
    
    navLinks.forEach(link => {
        const page = link.getAttribute('data-page') || (link.getAttribute('href') && link.getAttribute('href').toLowerCase().includes('converter.html') ? 'converter' : null);
        if (page && currentPath.includes(page.toLowerCase())) {
            link.classList.add('active');
        } else if (page === 'index' && (currentPath.endsWith('/') || currentPath.endsWith('index.html') || currentPath.endsWith('nk_coinhub-/') || currentPath.endsWith('nk_coinhub-'))) {
            link.classList.add('active');
        }
    });
}

function moveUtilitySlot() {
    const slot = document.getElementById('header-extra-slot');
    const source = document.querySelector('.header-utility-source');
    if (slot && source) {
        const utility = source.querySelector('.utility');
        if (utility) {
            slot.appendChild(utility);
            // Re-run search toggle init if it's new
            const searchArea = utility.querySelector(".search");
            if (searchArea) {
                searchArea.addEventListener("click", function(e) {
                    if (window.innerWidth <= 650) {
                        this.classList.toggle("active");
                        const input = this.querySelector("input");
                        if (this.classList.contains("active")) {
                            input.focus();
                        }
                    }
                });
            }
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // Determine base path based on location
    const isSubDir = window.location.pathname.toLowerCase().includes('/html/');
    const basePath = isSubDir ? '..' : '.';
    
    loadComponent('header-placeholder', `${basePath}/components/header.html`, basePath);
    loadComponent('footer-placeholder', `${basePath}/components/footer.html`, basePath);
});
