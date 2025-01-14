document.addEventListener('DOMContentLoaded', () => {
    const resetButton = document.getElementById('resetProgress');
    const toggleButton = document.getElementById('dark-mode-toggle');
    const homeElement = document.querySelector('.home');
    const calendarElement = document.querySelector('.calendar');
    const headers = document.querySelectorAll('.unit h3, .chapter h4, .lesson h5');

    if (resetButton) {
        resetButton.addEventListener('click', resetProgress);
    }
    headers.forEach(header => {
        header.addEventListener('click', () => toggleSection(header));
    });

    if (toggleButton) {
        if (localStorage.getItem('dark-mode') === 'enabled') {
            document.body.classList.add('dark-mode');
            homeElement?.classList.add('dark-mode');
            calendarElement?.classList.add('dark-mode');
            toggleButton.textContent = 'Disable Dark Mode';
        }

        toggleButton.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            homeElement?.classList.toggle('dark-mode');
            calendarElement?.classList.toggle('dark-mode');

            if (document.body.classList.contains('dark-mode')) {
                localStorage.setItem('dark-mode', 'enabled');
                toggleButton.textContent = 'Disable Dark Mode';
            } else {
                localStorage.setItem('dark-mode', 'disabled');
                toggleButton.textContent = 'Enable Dark Mode';
            }
        });
    }



    async function loadPythonLessons(containerId, csvFile) {
        const lessonContainer = document.getElementById(containerId);
        if (!lessonContainer) {
            console.error(`Lesson container (${containerId}) not found!`);
            return;
        }

        try {
            const response = await fetch(csvFile);
            const csvData = await response.text();
            const lessons = parseCSV(csvData);

            const unitMap = {}; // Map to store units, chapters, and sections

            lessons.forEach(lesson => {
                // Create or find the unit
                if (!unitMap[lesson.Unit]) {
                    const unitDiv = document.createElement('div');
                    unitDiv.className = 'unit';

                    const unitHeader = document.createElement('h3');
                    unitHeader.textContent = lesson.Unit;
                    unitHeader.innerHTML += `<span class="toggle-icon">▼</span>`;
                    unitHeader.onclick = () => toggleSection(unitHeader);
                    unitDiv.appendChild(unitHeader);

                    const chapterContainer = document.createElement('div');
                    chapterContainer.className = 'chapters-container';
                    chapterContainer.style.display = 'none'; // Initially collapsed
                    unitDiv.appendChild(chapterContainer);

                    unitMap[lesson.Unit] = { unitDiv, chapters: {}, chapterContainer };
                    lessonContainer.appendChild(unitDiv);
                }

                const { chapterContainer, chapters } = unitMap[lesson.Unit];

                // Create or find the chapter
                if (!chapters[lesson.Chapter]) {
                    const chapterDiv = document.createElement('div');
                    chapterDiv.className = 'chapter';

                    const chapterHeader = document.createElement('h4');
                    chapterHeader.textContent = lesson.Chapter;
                    chapterHeader.innerHTML += `<span class="toggle-icon">▼</span>`;
                    chapterHeader.onclick = () => toggleSection(chapterHeader);
                    chapterDiv.appendChild(chapterHeader);

                    const sectionContainer = document.createElement('div');
                    sectionContainer.className = 'sections-container';
                    sectionContainer.style.display = 'none'; // Initially collapsed
                    chapterDiv.appendChild(sectionContainer);

                    chapters[lesson.Chapter] = { chapterDiv, sections: {}, sectionContainer };
                    chapterContainer.appendChild(chapterDiv);
                }

                const { sectionContainer, sections } = chapters[lesson.Chapter];

                // Create or find the section
                if (!sections[lesson.Section]) {
                    const sectionDiv = document.createElement('div');
                    sectionDiv.className = 'section';

                    const sectionHeader = document.createElement('h5');
                    sectionHeader.textContent = lesson.Section;
                    sectionHeader.innerHTML += `<span class="toggle-icon">▼</span>`;
                    sectionHeader.onclick = () => toggleSection(sectionHeader);
                    sectionDiv.appendChild(sectionHeader);

                    const fileContainer = document.createElement('div');
                    fileContainer.className = 'files-container';
                    fileContainer.style.display = 'none'; // Initially collapsed
                    sectionDiv.appendChild(fileContainer);

                    sections[lesson.Section] = { sectionDiv, fileContainer };
                    sectionContainer.appendChild(sectionDiv);
                }

                const { fileContainer } = sections[lesson.Section];

                // Add the file to the section
                const fileLink = document.createElement('a');
                fileLink.href = `./uploads/Python/${lesson.Unit}/${lesson.Chapter}/${lesson.Section}/${lesson.Filename}`;
                fileLink.textContent = lesson.Filename;
                fileLink.target = '_blank';
                fileLink.style.display = 'block'; // Each file link on a new line
                fileContainer.appendChild(fileLink);
            });
        } catch (error) {
            console.error(`Error loading lessons from ${csvFile}:`, error);
        }
    }

    function toggleSection(header) {
        const section = header.nextElementSibling; // The container to show/hide
        const icon = header.querySelector('.toggle-icon'); // The toggle icon (▼/▲)
    
        if (!section) return; // Exit if no section is found
    
        const isCollapsed = section.style.display === 'none' || section.style.display === ''; // Check current state
        section.style.display = isCollapsed ? 'block' : 'none'; // Toggle display
    
        if (icon) {
            icon.textContent = isCollapsed ? '▲' : '▼'; // Update the icon
        }
    }
    

    function resetProgress() {
        if (confirm("Are you sure you want to reset all progress? This cannot be undone.")) {
            localStorage.clear();
            const checkboxes = document.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => checkbox.checked = false);
            alert("Progress has been reset.");
        }
    }

    function parseCSV(csv) {
        const rows = csv.trim().split('\n');
        const headers = rows[0].split(',');

        return rows.slice(1).map(row => {
            const values = row.split(',');
            const lesson = {};
            headers.forEach((header, index) => {
                lesson[header.trim()] = values[index]?.trim() || '';
            });
            return lesson;
        });
    }

    loadPythonLessons('lessons-list-python', './uploads/Python/pythoncsv/Python_Lessons.csv');
});

