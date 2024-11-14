function showTab(tabId, url) {
    // Hide all tab content sections
    document.querySelectorAll('.tab-content').forEach(section => {
        section.style.display = 'none';
    });

    // Show the selected tab content
    document.getElementById(tabId).style.display = 'block';

    // Navigate to the new page
    if (url) {
        window.location.href = url;
    }
}
function toggleSection(header) {
    const section = header.nextElementSibling;
    const icon = header.querySelector(".toggle-icon");

    // Toggle visibility of the section
    if (section.style.display === "none" || section.style.display === "") {
        section.style.display = "block";
        icon.textContent = "▲"; // Change icon to an up arrow when expanded
    } else {
        section.style.display = "none";
        icon.textContent = "▼"; // Change icon back to a down arrow when collapsed
    }
}
