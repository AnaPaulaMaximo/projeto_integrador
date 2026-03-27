document.addEventListener('DOMContentLoaded', () => {
    const googleButton = document.querySelector('.botao-google');

    if (googleButton) {
        googleButton.addEventListener('click', () => {
            // Lógica para iniciar o fluxo de login com o Google
            alert('Lógica de login com Google não implementada.');
            console.log('Botão de login do Google clicado.');
        });
    }
});