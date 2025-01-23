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
    // ================= Feedback Form Logic ================= //
    

    
    

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
        console.log(`Fetching CSV file from: ${csvFile}`); // Log fetch start
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

                /////////////////////////////////// Add a Checkbox
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = `${lesson.Unit}-${lesson.Chapter}-${lesson.Lesson}`;
                checkbox.checked = localStorage.getItem(checkbox.id) === 'true';
                checkbox.addEventListener('change', saveProgress);

                if (lesson.Description || lesson.Objectives) {
                    // Create a flex container to hold Description and Objectives side by side
                    const descriptionObjectivesContainer = document.createElement('div');
                    descriptionObjectivesContainer.className = 'description-objectives-container';

                    // Description Section
                    if (lesson.Description) {
                        const descriptionDiv = document.createElement('div');
                        descriptionDiv.className = 'lesson-description';
                        const descriptionHeader = document.createElement('h6');
                        descriptionHeader.textContent = 'Description:';
                        const descriptionContent = document.createElement('p');
                        descriptionContent.textContent = lesson.Description;
                        descriptionDiv.appendChild(descriptionHeader);
                        descriptionDiv.appendChild(descriptionContent);

                        descriptionObjectivesContainer.appendChild(descriptionDiv);
                    }

                    // Objectives Section
                    if (lesson.Objectives) {
                        const objectivesDiv = document.createElement('div');
                        objectivesDiv.className = 'lesson-objectives';
                        const objectivesHeader = document.createElement('h6');
                        objectivesHeader.textContent = 'Objectives:';

                        const objectivesIntro = document.createElement('p');
                        objectivesIntro.textContent = 'Students will be able to:';

                        const objectivesList = document.createElement('ul'); // Create a bullet list
                        const objectives = lesson.Objectives.split(';'); // Split into bullet points
                        objectives.forEach(obj => {
                            const listItem = document.createElement('li');
                            listItem.textContent = obj.trim();
                            objectivesList.appendChild(listItem);
                        });

                        objectivesDiv.appendChild(objectivesHeader);
                        objectivesDiv.appendChild(objectivesIntro);
                        objectivesDiv.appendChild(objectivesList);

                        descriptionObjectivesContainer.appendChild(objectivesDiv);
                    }

                    // Append the container to lessonDetails
                    lessonDetails.appendChild(descriptionObjectivesContainer);
                }


                // Question of the day Section
                if (lesson.Question_Of_The_Day) {
                    // Create a container for Question of the Day
                    const QODContainer = document.createElement('div');
                    QODContainer.className = 'QOD';

                    // Create the inner content
                    const QODHeader = document.createElement('h6');
                    QODHeader.textContent = 'Question of the Day:';

                    const QODContent = document.createElement('p');
                    QODContent.textContent = lesson.Question_Of_The_Day;

                    // Append header and content into the container
                    QODContainer.appendChild(QODHeader);
                    QODContainer.appendChild(QODContent);

                    // Append the container to lessonDetails
                    lessonDetails.appendChild(QODContainer);
                }

                if (lesson.Assignments) {
                    const assignmentsHeader = document.createElement('h6');
                    assignmentsHeader.textContent = 'Assignments:';
                    lessonDetails.appendChild(assignmentsHeader);

                    const assignments = lesson.Assignments.split(';');
                    assignments.forEach((assignment, index) => {
                        const assignmentContainer = document.createElement('div');
                        assignmentContainer.style.display = 'flex'; // Arrange items horizontally
                        assignmentContainer.style.alignItems = 'center';
                        assignmentContainer.style.marginBottom = '5px';

                        // Create the checkbox
                        const checkbox = document.createElement('input');
                        checkbox.type = 'checkbox';
                        checkbox.id = `${lesson.Unit}-${lesson.Chapter}-Assignment-${index + 1}`;
                        checkbox.checked = localStorage.getItem(checkbox.id) === 'true';
                        checkbox.addEventListener('change', () => {
                            localStorage.setItem(checkbox.id, checkbox.checked);
                        });

                        // Create the assignment link
                        const assignmentLink = document.createElement('a');
                        assignmentLink.href = assignment.trim();
                        assignmentLink.textContent = `Download Assignment ${index + 1}`;
                        assignmentLink.target = '_blank';
                        assignmentLink.style.marginLeft = '10px'; // Space between checkbox and link

                        // Add checkbox and link to the container
                        assignmentContainer.appendChild(checkbox);
                        assignmentContainer.appendChild(assignmentLink);

                        lessonDetails.appendChild(assignmentContainer);
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
        console.log('Toggling section:', header.textContent);
    
        const section = header.nextElementSibling; // Get the sibling to toggle
        if (!section) {
            console.error('No next sibling section found for header:', header.textContent);
            return;
        }
    
        // Toggle the 'show' class instead of setting 'display' inline
        section.classList.toggle('show');
    
        // Debug: Log current classes
        console.log('Section classes after toggle:', section.classList);
    
        // Update toggle icon
        const toggleIcon = header.querySelector('.toggle-icon');
        if (toggleIcon) {
            toggleIcon.textContent = section.classList.contains('show') ? '▲' : '▼';
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
    loadLessons('lessons-list-CSD', './uploads/CSD/CSD_Lessons.csv');

    

});

