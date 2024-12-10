document.addEventListener('DOMContentLoaded', () => {
    // Dark Mode Toggle
    const toggleButton = document.getElementById('dark-mode-toggle');
    const homeElement = document.querySelector('.home');
    const calendarElement = document.querySelector('.calendar');
    const headers = document.querySelectorAll('.unit h3, .chapter h4, .lesson h5');
    const resetButton = document.getElementById('resetProgress');
    if (resetButton) {
        resetButton.addEventListener('click', resetProgress);
    }

    function resetProgress() {
        if (confirm("Are you sure you want to reset all progress? This cannot be undone.")) {
            // Clear localStorage
            localStorage.clear();

            // Uncheck all checkboxes on the page
            const checkboxes = document.querySelectorAll('.lesson-details input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
            });

            alert("Progress has been reset.");
        }
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
    async function loadLessons(containerId, csvFile) {
        const lessonContainer = document.getElementById(containerId);
        if (!lessonContainer) {
            console.error(`Lesson container (${containerId}) not found!`);
            return;
        }

        try {
            const response = await fetch(csvFile);
            const csvData = await response.text();
            const lessons = parseCSV(csvData);

            const unitMap = {}; // Map to store units and their chapters

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

                    const lessonsContainer = document.createElement('div');
                    lessonsContainer.className = 'lessons-container';
                    lessonsContainer.style.display = 'none'; // Initially collapsed
                    chapterDiv.appendChild(lessonsContainer);

                    chapters[lesson.Chapter] = { chapterDiv, lessonsContainer };
                    chapterContainer.appendChild(chapterDiv);
                }

                const { lessonsContainer } = chapters[lesson.Chapter];

                // Create a lesson
                // Create a lesson
                const lessonDiv = document.createElement('div');
                lessonDiv.className = 'lesson';

                const lessonHeader = document.createElement('h5');
                lessonHeader.textContent = lesson.Lesson;
                lessonHeader.innerHTML += `<span class="toggle-icon">▼</span>`;
                lessonHeader.onclick = () => toggleSection(lessonHeader);
                lessonDiv.appendChild(lessonHeader);

                const lessonDetails = document.createElement('div');
                lessonDetails.className = 'lesson-details';
                lessonDetails.style.display = 'none';

                // Add a checkbox
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = `${lesson.Unit}-${lesson.Chapter}-${lesson.Lesson}`;
                checkbox.checked = localStorage.getItem(checkbox.id) === 'true';
                checkbox.addEventListener('change', saveProgress);

                const label = document.createElement('label');
                label.textContent = lesson.Description;
                label.style.marginLeft = '10px'; // Add spacing
                lessonDetails.appendChild(checkbox);
                lessonDetails.appendChild(label);

                // Add materials if provided
                
                if (lesson.Assignments) {
                    const assignmentsHeader = document.createElement('h6');
                    assignmentsHeader.textContent = 'Assignments:';
                    lessonDetails.appendChild(assignmentsHeader);
                
                    const assignments = lesson.Assignments.split(';'); // Ensure correct column
                    assignments.forEach((assignment, index) => {
                        const assignmentLink = document.createElement('a');
                        assignmentLink.href = encodeURI(assignment.trim());; // Properly encode the URL
                        assignmentLink.textContent = `Download Assignment ${index + 1}`;
                        assignmentLink.target = '_blank';
                        assignmentLink.style.display = 'block';
                        lessonDetails.appendChild(assignmentLink);
                    });
                }
                
                if (lesson.Notes) {
                    const assignmentsHeader = document.createElement('h6');
                    assignmentsHeader.textContent = 'Lesson Notes:';
                    lessonDetails.appendChild(assignmentsHeader);
                
                    const assignments = lesson.Notes.split(';'); // Ensure correct column
                    assignments.forEach((assignment, index) => {
                        const assignmentLink = document.createElement('a');
                        assignmentLink.href = encodeURI(assignment.trim());; // Properly encode the URL
                        assignmentLink.textContent = `Lesson Slides ${index + 1}`;
                        assignmentLink.target = '_blank';
                        assignmentLink.style.display = 'block';
                        lessonDetails.appendChild(assignmentLink);
                    });
                }
                if (lesson.Videos) {
                    const assignmentsHeader = document.createElement('h6');
                    assignmentsHeader.textContent = 'Lesson Videos:';
                    lessonDetails.appendChild(assignmentsHeader); 

                    const assignments = lesson.Videos.split(';');
                    assignments.forEach((assignment, index) => {
                        const assignmentLink = document.createElement('a');
                        assignmentLink.href = assignment.trim();
                        assignmentLink.textContent = `Video: ${index + 1}`;
                        assignmentLink.target = '_blank';
                        assignmentLink.style.display = 'block'; // Display on new line
                        lessonDetails.appendChild(assignmentLink);
                    });
                }

                // Append lesson details to the lesson div
                lessonDiv.appendChild(lessonDetails);

                // Append the lesson div to the lessons container
                lessonsContainer.appendChild(lessonDiv);

            });
        } catch (error) {
            console.error(`Error loading lessons from ${csvFile}:`, error);
        }
    }

    function toggleSection(header) {
        const section = header.nextElementSibling;
        const icon = header.querySelector('.toggle-icon');

        if (!section) return;

        const isCollapsed = section.style.display === 'none' || section.style.display === '';

        section.style.display = isCollapsed ? 'block' : 'none';
        if (icon) icon.textContent = isCollapsed ? '▲' : '▼';

        if (header.tagName === 'H3') {
            const chapters = section.querySelectorAll('.chapter');
            chapters.forEach(chapter => {
                chapter.style.display = isCollapsed ? 'block' : 'none';
                const lessons = chapter.querySelector('.lessons-container');
                if (lessons) lessons.style.display = 'none'; // Keep lessons collapsed
            });
        } else if (header.tagName === 'H4') {
            const lessons = section.querySelectorAll('.lesson');
            lessons.forEach(lesson => {
                lesson.style.display = isCollapsed ? 'block' : 'none';
                const details = lesson.querySelector('.lesson-details');
                if (details) details.style.display = 'none'; // Keep details collapsed
            });
        }
    }

    function saveProgress() {
        const checkboxes = document.querySelectorAll('.lesson-details input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            localStorage.setItem(checkbox.id, checkbox.checked);
        });
    }

    function parseCSV(csv) {
        const rows = csv.trim().split('\n');
        const headers = rows[0].split(',');
    
        return rows.slice(1).map(row => {
            const values = [];
            let current = '';
            let inQuotes = false;
    
            // Properly split fields, handling quoted commas
            for (let char of row) {
                if (char === '"' && !inQuotes) {
                    inQuotes = true;
                } else if (char === '"' && inQuotes) {
                    inQuotes = false;
                } else if (char === ',' && !inQuotes) {
                    values.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            values.push(current.trim());
    
            const lesson = {};
            headers.forEach((header, index) => {
                lesson[header.trim()] = values[index]?.trim() || '';
            });
            return lesson;
        });
    }
    loadLessons('lessons-list-CSD', 'CSD/CSD_Lessons.csv');

    
});


