async function register(makeCredentialOptions) {
    // Turn the challenge back into the accepted format of padded base64
    makeCredentialOptions.challenge = coerceToArrayBuffer(makeCredentialOptions.challenge);
    // Turn ID into a UInt8Array Buffer for some reason
    makeCredentialOptions.user.id = coerceToArrayBuffer(makeCredentialOptions.user.id);

    makeCredentialOptions.excludeCredentials = makeCredentialOptions.excludeCredentials.map((c) => {
        c.id = coerceToArrayBuffer(c.id);
        return c;
    });

    if (makeCredentialOptions.authenticatorSelection.authenticatorAttachment == null) makeCredentialOptions.authenticatorSelection.authenticatorAttachment = undefined;

    let newCredential;
    try {
        newCredential = await navigator.credentials.create({
            publicKey: makeCredentialOptions
        });
    } catch (e) {
        const msg = "Could not create credentials in browser. Probably because the username is already registered with your authenticator. Please change username or authenticator."
        showErrorAlert(msg, e);
        return;
    }

    try {
        registerNewCredential(newCredential);

    } catch (e) {
        showErrorAlert(e.message ? e.message : e);
    }
}

// This should be used to verify the auth data with the server
async function registerNewCredential(newCredential) {
    // Move data into Arrays incase it is super long
    const attestationObject = new Uint8Array(newCredential.response.attestationObject);
    const clientDataJSON = new Uint8Array(newCredential.response.clientDataJSON);
    const rawId = new Uint8Array(newCredential.rawId);

    const data = {
        id: newCredential.id,
        rawId: coerceToBase64Url(rawId),
        type: newCredential.type,
        extensions: newCredential.getClientExtensionResults(),
        response: {
            attestationObject: coerceToBase64Url(attestationObject),
            clientDataJSON: coerceToBase64Url(clientDataJSON)
        }
    };
    
    document.getElementById("data").value = JSON.stringify(data);
    document.getElementById("registerForm").submit();
}

document.addEventListener('DOMContentLoaded', () => {
    if (detectFIDOSupport() && makeCredentialOptions) {
        const infoMessage = document.getElementById("info-message");
        const startButton = document.getElementById("btn-start");
        if (isSafari()) {
            startButton.addEventListener("click", ev => {
                register(makeCredentialOptions);
                infoMessage.classList.remove("d-none");
                startButton.classList.add("d-none");
            });
            startButton.classList.remove("d-none");
        } else {
            infoMessage.classList.remove("d-none");
            register(makeCredentialOptions);
        }
    }
})
