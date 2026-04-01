function updateFiatValue(element) {
    const rate = parseFloat(document.getElementById("Rate").value);
    const divisibility = parseInt(document.getElementById("FiatDivisibility").value);
    if (!isNaN(rate) && !isNaN(divisibility)) {
        const inputGroup = element.closest(".input-group");
        if (!inputGroup) return;
        const fiatValue = inputGroup.querySelector(".fiat-value");
        if (!fiatValue) return;
        const fiatValueInput = fiatValue.querySelector(".fiat-value-edit-input");
        const amountValue = parseFloat(element.value);
        fiatValue.style.display = "";
        if (!isNaN(amountValue)) {
            fiatValueInput.value = (rate * amountValue).toFixed(divisibility);
        }
    }
}

function updateCryptoValue(element) {
    const divisibility = parseInt(document.getElementById("CryptoDivisibility").value);
    const rate = parseFloat(document.getElementById("Rate").value);
    if (!isNaN(rate)) {
        const inputGroup = element.closest(".input-group");
        if (!inputGroup) return;
        const cryptoValueInput = inputGroup.querySelector(".output-amount");
        const amountValue = parseFloat(element.value);
        if (!isNaN(amountValue)) {
            cryptoValueInput.value = (amountValue / rate).toFixed(divisibility);
        } else {
            cryptoValueInput.value = "";
        }
    }
}

function selectCorrectFeeOption() {
    const val = document.getElementById("FeeSatoshiPerByte").value;
    document.querySelectorAll(".feerate-options .crypto-fee-link").forEach(function (el) {
        el.classList.remove("active");
    });
    const match = document.querySelector('.feerate-options .crypto-fee-link[value="' + val + '"]');
    if (match) match.classList.add("active");
}

document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".output-amount").forEach(function (el) {
        el.addEventListener("input", function () { updateFiatValue(this); });
        updateFiatValue(el);
    });

    delegate("input", ".fiat-value-edit-input", function (event) {
        updateCryptoValue(event.target);
    });

    delegate("click", ".crypto-fee-link", function (event) {
        const el = event.target;
        el.closest(".feerate-options").querySelectorAll(".crypto-fee-link").forEach(function (sibling) {
            sibling.classList.remove("active");
        });
        el.classList.add("active");
        document.getElementById("FeeSatoshiPerByte").value = el.value;
        return false;
    });

    const feeInput = document.getElementById("FeeSatoshiPerByte");
    if (feeInput) {
        feeInput.addEventListener("change", selectCorrectFeeOption);
        feeInput.addEventListener("input", selectCorrectFeeOption);
    }

    selectCorrectFeeOption();

    delegate("click", ".crypto-balance-link", function (event) {
        const val = event.target.textContent;
        const parentContainer = event.target.closest(".form-group");
        const outputAmountElement = parentContainer.querySelector(".output-amount");
        outputAmountElement.value = val;
        let subtractFeesEl = parentContainer.querySelector(".subtract-fees");
        if (!subtractFeesEl) subtractFeesEl = document.querySelector(".subtract-fees");
        subtractFeesEl.checked = true;
        updateFiatValue(outputAmountElement);
        return false;
    });

    delegate("click", "#bip21parse", function () {
        // eslint-disable-next-line no-alert
        const bip21 = prompt("Paste BIP21 here");
        if (bip21) {
            document.getElementById("BIP21").value = bip21;
            document.querySelector("form").submit();
        }
    });
});
