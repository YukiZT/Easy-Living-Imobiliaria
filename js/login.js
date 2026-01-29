/* js/login.js */

// --- Funções de Ajuda (Copiadas do registrar.js) ---
function showError(element, message) {
    clearErrors();
    const errorElement = document.createElement('p');
    errorElement.className = 'form-error';
    errorElement.textContent = message;
    errorElement.style.color = 'red';
    errorElement.style.textAlign = 'center';
    errorElement.style.marginTop = '1rem';
    
    // Na página de login, vamos inserir antes do botão de "Entrar"
    const loginButton = element.querySelector('.btn-login');
    loginButton.insertAdjacentElement('beforebegin', errorElement);
}

function clearErrors() {
    const oldError = document.querySelector('.form-error');
    if (oldError) {
        oldError.remove();
    }
}
// --- Fim das Funções de Ajuda ---


document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Encontrar o formulário de login
    const form = document.querySelector('.login-box form');
    if (!form) return; // Sai se não for a página de login

    // 2. Adicionar "ouvinte" para o envio do formulário
    form.addEventListener('submit', async function(event) {
        // 3. Impedir o recarregamento da página
        event.preventDefault();
        
        // 4. Limpar erros antigos
        clearErrors();

        // 5. Pegar os dados dos campos
        const email = document.querySelector('#email').value;
        const senha = document.querySelector('#password').value;

        // 6. Montar o "pacote" de dados (JSON)
        const data = {
            email: email,
            senha: senha
        };

        // 7. Tentar enviar para a API de login
        try {
            const response = await fetch('http://localhost:3001/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) { // Sucesso (código 200)
                // Deu certo!
                alert('Login realizado com sucesso! Bem-vindo(a), ' + result.usuario.nome);
                
                // No futuro, aqui nós salvaríamos o "Token"
                // localStorage.setItem('userToken', result.token); 
                
                // Redireciona para a home
                window.location.href = 'home.html';
            } else {
                // Deu erro (código 400, 401, 500)
                showError(form, result.error); // Mostra o erro (ex: "Credenciais inválidas.")
            }

        } catch (error) {
            console.error('Erro de rede:', error);
            showError(form, 'Não foi possível conectar ao servidor.');
        }
    });

});