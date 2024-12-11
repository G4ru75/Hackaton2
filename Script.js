document.addEventListener("DOMContentLoaded", () => {
    const calendar = document.getElementById("calendar");
    const cropList = document.getElementById("crop-list");
    const cropSelect = document.getElementById("crop-select");
    const contextMenu = document.getElementById("context-menu");
    const contextMenuCrop = document.getElementById("context-menuc");

    let events = JSON.parse(localStorage.getItem('events')) || [];
    let crops = JSON.parse(localStorage.getItem('crops')) || [];
    let selectedEvent = null;
    let selectedCrop = null;

    const currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();

    function renderCalendar() {
        calendar.innerHTML = "";
        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        for (let i = 0; i < firstDay; i++) {
            calendar.appendChild(document.createElement("div"));
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement("div");
            dayCell.classList.add("calendar-day");
            dayCell.textContent = day;

            const event = events.find(e => e.date === `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
            if (event) {
                dayCell.classList.add("event-day");
                dayCell.title = `Planificación de siembra de ${event.crop} en un área de (${event.area} hectáreas (ha))`;
                dayCell.addEventListener("contextmenu", (e) => {
                    e.preventDefault();
                    selectedEvent = event;
                    showContextMenu(e.pageX, e.pageY);
                });

                // Calcular la fecha de recolección
                const plantingDateObj = new Date(event.date);
                plantingDateObj.setDate(plantingDateObj.getDate() + parseInt(event.cycle));
                const harvestDateString = plantingDateObj.toISOString().split('T')[0];
                const harvestDateParts = harvestDateString.split('-');
                const harvestYear = parseInt(harvestDateParts[0]);
                const harvestMonth = parseInt(harvestDateParts[1]) - 1;
                const harvestDay = parseInt(harvestDateParts[2]);

                if (harvestYear === currentYear && harvestMonth === currentMonth && harvestDay === day) {
                    dayCell.classList.add("harvest-day");
                    dayCell.title += `\nRecolección de ${event.crop}`;
                }
            }

            calendar.appendChild(dayCell);
        }

        document.getElementById("current-month").textContent = `${new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' })} ${currentYear}`;
    }

    function renderCrops() {
        cropList.innerHTML = '';
        cropSelect.innerHTML = '';

        crops.forEach(crop => {
            const li = document.createElement('li');
            li.classList.add('list-group-item');
            li.textContent = `${crop.name} - ${crop.type} - ${crop.cycle} días`;

            // Agregar evento de clic derecho
            li.addEventListener("contextmenu", (e) => {
                e.preventDefault();
                selectedCrop = crop;
                showCropContextMenu(e.pageX, e.pageY);
            });

            cropList.appendChild(li);

            const option = document.createElement('option');
            option.value = crop.name;
            option.textContent = crop.name;
            cropSelect.appendChild(option);
        });
    }

    function saveData() {
        localStorage.setItem('events', JSON.stringify(events));
        localStorage.setItem('crops', JSON.stringify(crops));
    }

    function deleteEvent() {
        events = events.filter(event => event !== selectedEvent);
        saveData();
        renderCalendar();
        hideContextMenu();
    }

    function editEvent() {
        document.getElementById("crop-select").value = selectedEvent.crop;
        document.getElementById("area").value = selectedEvent.area;
        document.getElementById("planting-date").value = selectedEvent.date;
        deleteEvent();
        hideContextMenu();
    }

    function deleteCrop() {
        crops = crops.filter(crop => crop !== selectedCrop);
        saveData();
        renderCrops();
        hideCropContextMenu();
    }

    function editCrop() {
        document.getElementById("crop-name").value = selectedCrop.name;
        document.getElementById("crop-type").value = selectedCrop.type;
        document.getElementById("crop-cycle").value = selectedCrop.cycle;
        deleteCrop();
        hideCropContextMenu();
    }

    function showContextMenu(x, y) {
        contextMenu.style.top = `${y}px`;
        contextMenu.style.left = `${x}px`;
        contextMenu.classList.add("active");
    }

    function hideContextMenu() {
        contextMenu.classList.remove("active");
    }

    function showCropContextMenu(x, y) {
        contextMenuCrop.style.top = `${y}px`;
        contextMenuCrop.style.left = `${x}px`;
        contextMenuCrop.classList.add("active");
    }

    function hideCropContextMenu() {
        contextMenuCrop.classList.remove("active");
    }

    document.getElementById("prev-month").addEventListener("click", () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });

    document.getElementById("next-month").addEventListener("click", () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });

    document.getElementById("add-crop-form").addEventListener("submit", e => {
        e.preventDefault();
        const cropName = document.getElementById("crop-name").value;
        const cropType = document.getElementById("crop-type").value;
        const cropCycle = document.getElementById("crop-cycle").value;
        if (cropName && cropType && cropCycle && !crops.some(crop => crop.name === cropName)) {
            crops.push({ name: cropName, type: cropType, cycle: cropCycle });
            saveData();
            renderCrops();
        }
    });

    document.getElementById("planting-form").addEventListener("submit", e => {
        e.preventDefault();
        const crop = cropSelect.value;
        const area = parseFloat(document.getElementById("area").value);
        const dateInput = document.getElementById("planting-date").value;
        const date = new Date(dateInput + 'T00:00:00');

        // Validar que las hectáreas sean mayores a 0
        if (area <= 0) {
            alert("El área debe ser mayor a 0 hectáreas.");
            return;
        }

        // Validar que la fecha digitada coincida con la del calendario
        if (date.getMonth() !== currentMonth || date.getFullYear() !== currentYear) {
            alert("La fecha seleccionada no coincide con el mes y año del calendario actual.");
            return;
        }

        // Validar que la fecha no sea anterior a la fecha actual
        const today = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
        if (date < today) {
            alert("No se puede planificar para fechas anteriores a la fecha actual.");
            return;
        }

        const selectedCrop = crops.find(c => c.name === crop);
        events.push({
            crop,
            area,
            date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
            cycle: selectedCrop.cycle
        });
        saveData();
        renderCalendar();
    });

    document.addEventListener("click", (e) => {
        if (!contextMenu.contains(e.target)) {
            hideContextMenu();
        }
        if (!contextMenuCrop.contains(e.target)) {
            hideCropContextMenu();
        }
    });

    document.getElementById("delete-event").addEventListener("click", deleteEvent);
    document.getElementById("edit-event").addEventListener("click", editEvent);
    document.getElementById("delete-cul").addEventListener("click", deleteCrop);
    document.getElementById("edit-cul").addEventListener("click", editCrop);

    // Cargar datos desde localStorage y renderizar
    renderCrops();
    renderCalendar();
});