document.addEventListener('DOMContentLoaded', function() {
    const input = document.getElementById('telephone_number');
    
    const maxLength = 12;

    function formatPhoneNumber(value) {
        value = value.replace(/\D/g, '');
        if (value.length > 1) {
            value = '8' + value.slice(1);
            value = value.replace(/(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 ($2) $3-$4-$5');
        } else if (value.length === 1) {
            value = '8';
        }
        return value;
    }

    input.value = formatPhoneNumber(input.value);

    input.addEventListener('input', function() {
        if (this.value.replace(/\D/g, '').length >= maxLength) {
            this.value = formatPhoneNumber(this.value.slice(0, -1));
        } else {
            this.value = formatPhoneNumber(this.value);
        }
    });
});