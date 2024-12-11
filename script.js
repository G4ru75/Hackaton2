document.addEventListener("DOMContentLoaded", () => {
    const calendar = document.getElementById("calendar");
    const cropList = document.getElementById("crop-list");
    const cropSelect = document.getElementById("crop-select");

    const crops = [];
    const events = [];

    // Inicialización de calendario
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
            dayCell.textContent = day;

            const event = events.find(e => e.date === `${currentYear}-${currentMonth + 1}-${day}`);
            if (event) {
                dayCell.classList.add("event");
                dayCell.title = event.crop + ": " + event.area + " ha";
            }

            calendar.appendChild(dayCell);
        }
    }

    function updateCropList() {
        cropList.innerHTML = crops.map(crop => `<li>${crop}</li>`).join("");
        cropSelect.innerHTML = crops.map(crop => `<option value="${crop}">${crop}</option>`).join("");
    }

    // Listeners
    document.getElementById("add-crop-form").addEventListener("submit", e => {
        e.preventDefault();
        const cropName = document.getElementById("crop-name").value;
        if (!crops.includes(cropName)) {
            crops.push(cropName);
            updateCropList();
        }
    });

    document.getElementById("planting-form").addEventListener("submit", e => {
        e.preventDefault();
        const crop = document.getElementById("crop-select").value;
        const area = document.getElementById("area").value;
        const date = new Date(document.getElementById("planting-date").value);
        events.push({ crop, area, date: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}` });
        renderCalendar();
    });

    renderCalendar();
    updateCropList();
});
