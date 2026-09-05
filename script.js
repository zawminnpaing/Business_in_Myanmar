// ==========================================
// CONFIGURATION 
// ==========================================

// Google Sheets CSV Link
const GOOGLE_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQxbrYOn2kLEAJLY9SXaNfHpLnkJ1nfE_iA1rA7OZ25yrTsXqS5iDRiSUBmt_Ewpxy4kIbYnUwm4nhJ/pub?gid=1858866772&single=true&output=csv"; 

// Contact Credentials
const WHATSAPP_NUMBER = "959974500087"; 
const TELEGRAM_NUMBER = "959793155856";
const CONTACT_EMAIL = "zawminn.p@gmail.com";

// ==========================================
// LOGIC & FUNCTIONALITY
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
                document.getElementById('dynamic-products').innerHTML = "<p class='text-center'>Error loading products. Please try again later.</p>";
                console.error("PapaParse Error:", error);
            }
        });
    } else {
        document.getElementById('dynamic-products').innerHTML = "<p class='text-center'>Database link not configured.</p>";
    }
});

function buildProductsHTML(data) {
    const container = document.getElementById('dynamic-products');
    container.innerHTML = ""; // clear spinner

    let validProducts = data.filter(row => row.product_name && row.product_name.trim() !== "");

    if(validProducts.length === 0) {
        container.innerHTML = "<p class='text-center'>No products currently available.</p>";
        return;
    }

    validProducts.forEach((product, index) => {
        const isReverse = index % 2 !== 0;
        const rowClass = isReverse ? "product-row reverse reveal-right" : "product-row reveal-left";

        let specsHTML = "";
        for(let i=1; i<=5; i++) {
            let specKey = `spec_${i}`;
            if(product[specKey] && product[specKey].trim() !== "") {
                specsHTML += `<li><i class="fas fa-check text-green-600" style="color: var(--primary-green); margin-right: 8px;"></i> ${product[specKey]}</li>`;
            }
        }

        const imgSrc = product.image_url ? product.image_url : "https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=800&auto=format&fit=crop";

        const article = document.createElement('article');
        article.className = rowClass;
        article.innerHTML = `
            <div class="product-img">
                <img src="${imgSrc}" alt="${product.product_name}" loading="lazy">
            </div>
            <div class="product-text">
                <h3>${product.product_name}</h3>
                <h4>${product.tagline || ""}</h4>
                <p>${product.description || ""}</p>
                <ul class="specs">
                    ${specsHTML}
                </ul>
                <button class="btn btn-primary" onclick="prefillQuote('${product.product_name}')">Inquire About This</button>
            </div>
        `;
        container.appendChild(article);
    });

    observeDynamicElements();
}

function observeDynamicElements() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if(e.isIntersecting) {
                e.target.classList.add("active");
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll(".reveal-left, .reveal-right").forEach(el => observer.observe(el));
}

function prefillQuote(productName) {
    const contactSection = document.getElementById("contact");
    contactSection.scrollIntoView({ behavior: "smooth" });
    const messageField = document.getElementById("buyerMessage");
    messageField.value = `Hello, I am interested in sourcing: ${productName}.\n\nMy required quantity is: \nRequired Specs: \nTarget Price: `;
    messageField.focus();
}

function sendInquiry(method) {
    const name = document.getElementById('buyerName').value.trim();
    const country = document.getElementById('buyerCountry').value.trim();
    const message = document.getElementById('buyerMessage').value.trim();

    if(!name || !country || !message) {
        alert("Please fill out all fields before sending.");
        return;
    }

    const formattedText = `New Sourcing Inquiry from MyExpoBiz\n\n*Buyer/Company:* ${name}\n*Destination:* ${country}\n\n*Requirements:*\n${message}`;

    if(method === 'whatsapp') {
        const encodedText = encodeURIComponent(formattedText);
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedText}`, '_blank');
    } 
    else if(method === 'telegram') {
        const encodedText = encodeURIComponent(formattedText);
        window.open(`https://t.me/+${TELEGRAM_NUMBER}?text=${encodedText}`, '_blank');
    }
    else if (method === 'email') {
        const subject = encodeURIComponent(`Sourcing Inquiry from ${name} - ${country}`);
        const body = encodeURIComponent(formattedText);
        window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    }
}

const navItems = document.querySelectorAll(".nav-item");
window.addEventListener("scroll", () => {
    let current = "";
    document.querySelectorAll("section").forEach(sec => {
        if (scrollY >= sec.offsetTop - 200) current = sec.id;
    });
    navItems.forEach(item => {
        item.classList.remove("active");
        if (item.getAttribute("href") === `#${current}`) {
            item.classList.add("active");
        }
    });
});
