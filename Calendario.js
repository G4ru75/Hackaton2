document.addEventListener("DOMContentLoaded", () => {
    const calendar = document.getElementById("calendar");
    const cropList = document.getElementById("crop-list");
    const cropSelect = document.getElementById("crop-select");
    const contextMenu = document.getElementById("context-menu");

    let events = JSON.parse(localStorage.getItem('events')) || [];
    let crops = JSON.parse(localStorage.getItem('crops')) || [];
    let selectedEvent = null;

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
                dayCell.title = `Planificacion de siembra de ${event.crop} en un area de (${event.area} hectareas (ha))`;
                dayCell.addEventListener("contextmenu", (e) => {
                    e.preventDefault();
                    selectedEvent = event;
                    showContextMenu(e.pageX, e.pageY);
                });
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
            li.textContent = `${crop.name} - ${crop.type} - ${crop.cycle}`;
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

    function showContextMenu(x, y) {
        contextMenu.style.top = `${y}px`;
        contextMenu.style.left = `${x}px`;
        contextMenu.classList.add("active");
    }

    function hideContextMenu() {
        contextMenu.classList.remove("active");
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

        events.push({
            crop,
            area,
            date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
        });
        saveData();
        renderCalendar();
    });

    document.addEventListener("click", (e) => {
        if (!contextMenu.contains(e.target)) {
            hideContextMenu();
        }
    });

    document.getElementById("delete-event").addEventListener("click", deleteEvent);
    document.getElementById("edit-event").addEventListener("click", editEvent);

    // Cargar datos desde localStorage y renderizar
    renderCrops();
    renderCalendar();
});