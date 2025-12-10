document.addEventListener('DOMContentLoaded', async () => {

    // MASTER VOLUME OUTPUT
    const rangeInput = document.getElementById('master-volume');
    const rangeOutput = document.getElementById('rangeValue');

    rangeOutput.textContent = rangeInput.value;

    rangeInput.addEventListener('input', function () {
        rangeOutput.textContent = this.value;
    });

});