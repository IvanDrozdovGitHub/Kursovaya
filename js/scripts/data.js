document.addEventListener("DOMContentLoaded", function() {
    const now = new Date();
    const formattedDate = now.toISOString().slice(0, 16);
    document.getElementById('date_time_start').setAttribute('min', formattedDate);
    document.getElementById('date_time_end').setAttribute('min', formattedDate);

    function calculateDays() {
        const startDate = document.getElementById('date_time_start').value;
        const endDate = document.getElementById('date_time_end').value;

        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const timeDifference = end - start;
            const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));

            document.getElementById('days_count').innerText = `Количество дней: ${daysDifference} дн.`;
        } else {
            document.getElementById('days_count').innerText = 'Количество дней: 0 дн.';
        }
    }

    document.getElementById('date_time_start').addEventListener('change', calculateDays);
    document.getElementById('date_time_end').addEventListener('change', calculateDays);
});

