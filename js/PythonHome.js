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
            const lessons = parseCSV(csvData); // Parse CSV data

            const unitMap = {}; // Map to track Units and Chapters

            lessons.forEach(({ Unit, Chapter, Section, Filename }) => {
                console.log(`Processing: Unit=${Unit}, Chapter=${Chapter}, Section=${Section}, Filename=${Filename}`); // Debug

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
                    console.log(`Added Unit: ${Unit}`); // Debug
                }

                const { chapters, chapterContainer } = unitMap[Unit];

                // Ensure Chapter (including Unit Projects as a Chapter)
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
                    console.log(`Added Chapter: ${Chapter} under Unit: ${Unit}`); // Debug
                }

                const { sectionsContainer } = chapters[Chapter];

                // Check for Sub-Chapters if Chapter is "Unit Projects"
                if (Chapter === "Unit Projects") {
                    let subChapterDiv = sectionsContainer.querySelector(`.sub-chapter[data-section="${Section}"]`);
                    if (!subChapterDiv) {
                        subChapterDiv = document.createElement('div');
                        subChapterDiv.className = 'sub-chapter';
                        subChapterDiv.setAttribute('data-section', Section);

                        const subChapterHeader = document.createElement('h5');
                        subChapterHeader.textContent = Section;
                        subChapterHeader.innerHTML += `<span class="toggle-icon">▼</span>`;
                        subChapterHeader.addEventListener('click', () => toggleSection(subChapterHeader));
                        subChapterDiv.appendChild(subChapterHeader);

                        const filesContainer = document.createElement('div');
                        filesContainer.className = 'files-container';
                        filesContainer.style.display = 'none';
                        subChapterDiv.appendChild(filesContainer);

                        sectionsContainer.appendChild(subChapterDiv);
                        console.log(`Added Sub-Chapter: ${Section}`); // Debug
                    }

                    const filesContainer = subChapterDiv.querySelector('.files-container');
                    addFileLink(Filename, filesContainer);
                } else {
                    // Regular Sections
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
                        console.log(`Added Section: ${Section}`); // Debug
                    }

                    const filesContainer = sectionDiv.querySelector('.files-container');
                    addFileLink(Filename, filesContainer);
                }
            });
        } catch (error) {
            console.error(`Error loading lessons from ${csvFile}:`, error);
        }
    }

    // Helper function to add a file link
    function addFileLink(Filename, container) {
        const fileLink = document.createElement('a');
        fileLink.href = encodeURI(Filename.trim());
        fileLink.textContent = Filename.split('/').pop(); // Display the file name
        fileLink.target = '_blank';
        container.appendChild(fileLink);
        console.log(`Added File: ${Filename}`); // Debug
    }



    // Utility to toggle sections
    function toggleSection(header) {
        console.log('Toggling section:', header.textContent);

        const section = header.nextElementSibling; // Get the next sibling
        if (!section) {
            console.error('No next sibling section found for header:', header.textContent);
            return;
        }

        // Debug: Log the section being toggled
        console.log('Next sibling element:', section);

        // Check the current display state and toggle
        const isCollapsed = section.style.display === 'none' || section.style.display === '';
        section.style.display = isCollapsed ? 'block' : 'none';

        // Update the toggle icon
        const toggleIcon = header.querySelector('.toggle-icon');
        if (toggleIcon) {
            toggleIcon.textContent = isCollapsed ? '▲' : '▼';
        }

        // Debug: Confirm the new display state
        console.log('New display state:', section.style.display);
    }



    // Utility to parse CSV
    function parseCSV(csvData) {
        const rows = csvData.split('\n');
        const headers = rows[0].split(',').map(header => header.trim());
        const parsedData = rows.slice(1).map(row => {
            const values = row.split(',').map(value => value.trim());
            const lessonObj = {};
            headers.forEach((header, index) => {
                lessonObj[header] = values[index] || ''; // Default to an empty string if undefined
            });
            return lessonObj;
        });
        return parsedData.filter(lesson => lesson.Unit && lesson.Chapter && lesson.Section && lesson.Filename); // Filter out incomplete entries
    }


    // Load Python lessons dynamically
    loadLessons('lessons-list-python', './uploads/Python/pythoncsv/Python_Lessons.csv')
});
