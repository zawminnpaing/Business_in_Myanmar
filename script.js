// ==========================================
// CONFIGURATION 
// ==========================================

// Google Sheets CSV Link
const GOOGLE_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQxbrYOn2kLEAJLY9SXaNfHpLnkJ1nfE_iA1rA7OZ25yrTsXqS5iDRiSUBmt_Ewpxy4kIbYnUwm4nhJ/pub?gid=1858866772&single=true&output=csv"; 

// Credentials
const WHATSAPP_VIBER_NUM = "959974500087"; 
const TELEGRAM_NUM = "959793155856";
const CONTACT_EMAIL = "zawminn.p@gmail.com";

let pendingProductName = "";

// ==========================================
// INITIALIZATION & MOBILE MENU
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    if(GOOGLE_SHEET_CSV_URL && GOOGLE_SHEET_CSV_URL !== "") {
        Papa.parse(GOOGLE_SHEET_CSV_URL, {
            download: true,
            header: true,
            complete: function(results) {
                buildProductsHTML(results.data);
            },
            error: function(error) {
                document.getElementById('dynamic-products').innerHTML = "<p class='text-center'>Error loading catalog. Please try again later.</p>";
                console.error("PapaParse Error:", error);
            }
        });
    }
});

// Mobile Hamburger Logic
function toggleMenu() {
    document.querySelector('.main-nav').classList.toggle('active');
}
function closeMenu() {
    document.querySelector('.main-nav').classList.remove('active');
}

// ==========================================
// BUILD B2B PRODUCT CARDS
// ==========================================
function buildProductsHTML(data) {
    const container = document.getElementById('dynamic-products');
    container.innerHTML = ""; 

    let validProducts = data.filter(row => row.product_name && row.product_name.trim() !== "");

    if(validProducts.length === 0) {
        container.innerHTML = "<p class='text-center'>Catalog is currently being updated.</p>";
        return;
    }

    validProducts.forEach((product) => {
        let specsHTML = "";
        for(let i=1; i<=5; i++) {
            let specKey = `spec_${i}`;
            if(product[specKey] && product[specKey].trim() !== "") {
                let specParts = product[specKey].split(":");
                if(specParts.length > 1) {
                    specsHTML += `<li><strong>${specParts[0]}:</strong> <span>${specParts[1]}</span></li>`;
                } else {
                    specsHTML += `<li><i class="fas fa-check text-green"></i> <span>${product[specKey]}</span></li>`;
                }
            }
        }

        const imgSrc = product.image_url ? product.image_url : "https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=800&auto=format&fit=crop";

        const card = document.createElement('div');
        card.className = "prod-card";
        card.innerHTML = `
            <img src="${imgSrc}" alt="${product.product_name}" class="prod-img" loading="lazy">
            <div class="prod-body">
                <h3>${product.product_name}</h3>
                <span class="prod-tag">${product.tagline || ""}</span>
                <p class="prod-desc">${product.description || ""}</p>
                <ul class="prod-specs">
                    ${specsHTML}
                </ul>
                <button class="btn btn-inquire" onclick="openProductModal('${product.product_name}')">
                    <i class="fas fa-comment-dots"></i> Inquire About This
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

// ==========================================
// DIRECT CHAT MODAL ROUTING LOGIC
// ==========================================
function openGeneralContactModal() {
    pendingProductName = "Custom Sourcing / General Inquiry";
    document.getElementById("modal-context-text").innerText = "Connect with Zaw Min Paing directly to discuss custom sourcing requirements and live pricing.";
    document.getElementById("inquiry-modal").classList.add("show");
}

function openProductModal(productName) {
    pendingProductName = productName;
    document.getElementById("modal-context-text").innerText = `Connect directly to request live pricing and availability for: ${productName}.`;
    document.getElementById("inquiry-modal").classList.add("show");
}

function closeModal() {
    document.getElementById("inquiry-modal").classList.remove("show");
}

function dispatchMessage(platform) {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    let message = "";
    if(pendingProductName === "Custom Sourcing / General Inquiry") {
        message = `Hello Zaw Min Paing, I am interested in sourcing agricultural commodities from Myanmar. I would like to discuss capabilities and pricing.`;
    } else {
        message = `Hello Zaw Min Paing, I would like to request a quote and current availability for: ${pendingProductName}.`;
    }
    
    const encodedText = encodeURIComponent(message);

    if (platform === 'whatsapp') {
        window.open(`https://wa.me/${WHATSAPP_VIBER_NUM}?text=${encodedText}`, '_blank');
    } 
    else if (platform === 'telegram') {
        if (isMobile) window.open(`https://t.me/+${TELEGRAM_NUM}?text=${encodedText}`, '_blank');
        else window.open(`tg://resolve?phone=${TELEGRAM_NUM}&text=${encodedText}`, '_self');
    } 
    else if (platform === 'viber') {
        if (isMobile) window.open(`viber://chat?number=%2B${WHATSAPP_VIBER_NUM}&draft=${encodedText}`, '_blank');
        else window.open(`viber://chat?number=%2B${WHATSAPP_VIBER_NUM}&draft=${encodedText}`, '_self');
    }
    else if (platform === 'email') {
        const subject = encodeURIComponent(`Inquiry: ${pendingProductName}`);
        window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${encodedText}`;
    }
    
    closeModal();
}

function dispatchGeneralMessage(platform) {
    pendingProductName = "Custom Sourcing / General Inquiry";
    dispatchMessage(platform);
}

window.onclick = function(event) {
    if (event.target === document.getElementById('inquiry-modal')) {
        closeModal();
    }
};
