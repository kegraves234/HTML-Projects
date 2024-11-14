function showTab(tabId) {
    // Hide all tab content sections
    document.querySelectorAll('.tab-content').forEach(section => {
        section.style.display = 'none';
    });

    // Show the selected tab content
    document.getElementById(tabId).style.display = 'block';
}
