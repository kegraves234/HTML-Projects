document.addEventListener('DOMContentLoaded', () => {
    const resetButton = document.getElementById('resetProgress');
    const toggleButton = document.getElementById('dark-mode-toggle');
    const homeElement = document.querySelector('.home');
    const calendarElement = document.querySelector('.calendar');

    // Reset Progress
    if (resetButton) {
        resetButton.addEventListener('click', resetProgress);
    }

    // Dark Mode Toggle
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

    // Function to load lessons dynamically
    async function loadLessons(containerId, csvFile) {
        const lessonContainer = document.getElementById(containerId);
        if (!lessonContainer) {
            console.error(`Lesson container (${containerId}) not found!`);
            return;
        }

        try {
            const response = await fetch(csvFile);
            const csvData = await response.text();
            const lessons = parseCSV(csvData); // Function to parse CSV

            const unitMap = {}; // Map to track Units and Chapters

            lessons.forEach(({ Unit, Chapter, Section, Filename }) => {
                // Ensure Unit
                if (!unitMap[Unit]) {
                    const unitDiv = document.createElement('div');
                    unitDiv.className = 'unit';

                    const unitHeader = document.createElement('h3');
                    unitHeader.textContent = Unit;
                    unitHeader.innerHTML += `<span class="toggle-icon">▼</span>`;
                    unitHeader.addEventListener('click', () => toggleSection(unitHeader));
                    unitDiv.appendChild(unitHeader);

                    const chapterContainer = document.createElement('div');
                    chapterContainer.className = 'chapters-container';
                    chapterContainer.style.display = 'none';
                    unitDiv.appendChild(chapterContainer);

                    unitMap[Unit] = { unitDiv, chapters: {}, chapterContainer };
                    lessonContainer.appendChild(unitDiv);
                }

                const { chapters, chapterContainer } = unitMap[Unit];

                // Ensure Chapter
                if (!chapters[Chapter]) {
                    const chapterDiv = document.createElement('div');
                    chapterDiv.className = 'chapter';

                    const chapterHeader = document.createElement('h4');
                    chapterHeader.textContent = Chapter;
                    chapterHeader.innerHTML += `<span class="toggle-icon">▼</span>`;
                    chapterHeader.addEventListener('click', () => toggleSection(chapterHeader));
                    chapterDiv.appendChild(chapterHeader);

                    const sectionsContainer = document.createElement('div');
                    sectionsContainer.className = 'sections-container';
                    sectionsContainer.style.display = 'none';
                    chapterDiv.appendChild(sectionsContainer);

                    chapters[Chapter] = { chapterDiv, sectionsContainer };
                    chapterContainer.appendChild(chapterDiv);
                }

                const { sectionsContainer } = chapters[Chapter];

                // Ensure Section
                let sectionDiv = sectionsContainer.querySelector(`.section[data-section="${Section}"]`);
                if (!sectionDiv) {
                    sectionDiv = document.createElement('div');
                    sectionDiv.className = 'section';
                    sectionDiv.setAttribute('data-section', Section);

                    const sectionHeader = document.createElement('h5');
                    sectionHeader.textContent = Section;
                    sectionHeader.innerHTML += `<span class="toggle-icon">▼</span>`;
                    sectionHeader.addEventListener('click', () => toggleSection(sectionHeader));
                    sectionDiv.appendChild(sectionHeader);

                    const filesContainer = document.createElement('div');
                    filesContainer.className = 'files-container';
                    filesContainer.style.display = 'none';
                    sectionDiv.appendChild(filesContainer);

                    sectionsContainer.appendChild(sectionDiv);
                }

                const filesContainer = sectionDiv.querySelector('.files-container');

                // Add File
                const fileLink = document.createElement('a');
                fileLink.href = encodeURI(Filename.trim());
                fileLink.textContent = Filename.split('/').pop(); // Display the file name
                fileLink.target = '_blank';
                filesContainer.appendChild(fileLink);
            });
        } catch (error) {
            console.error(`Error loading lessons from ${csvFile}:`, error);
        }
    }

    // Utility to toggle sections
    function toggleSection(header) {
        const section = header.nextElementSibling;
        if (section) {
            const isCollapsed = section.style.display === 'none' || section.style.display === '';
            section.style.display = isCollapsed ? 'block' : 'none';
        }
    }

    // Utility to parse CSV
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

    // Load Python lessons dynamically
    loadLessons('lessons-list-python', './pythoncsv/Python_Lessons.csv');
});
