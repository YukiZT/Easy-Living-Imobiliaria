/* js/registrar.js (CORRIGIDO) */

// --- Funções de Ajuda (MOVEMOS PARA FORA) ---
// Colocamos as funções de ajuda aqui fora, no escopo global do arquivo.
// Isso garante que elas estejam sempre definidas.

/**
 * Mostra uma mensagem de erro no formulário
 * @param {HTMLElement} element - O elemento próximo de onde o erro deve aparecer
 * @param {string} message - A mensagem de erro
 */
function showError(element, message) {
    // Remove erro antigo se houver
    clearErrors();
    
    const errorElement = document.createElement('p');
    errorElement.className = 'form-error';
    errorElement.textContent = message;
    errorElement.style.color = 'red'; // Estilo de erro
    errorElement.style.textAlign = 'center';
    errorElement.style.marginTop = '1rem';
    
    // Insere a mensagem de erro logo após o elemento
    element.insertAdjacentElement('afterend', errorElement);
}

/**
 * Remove todas as mensagens de erro do formulário
 */
function clearErrors() {
    const oldError = document.querySelector('.form-error');
    if (oldError) {
        oldError.remove();
    }
}
// --- Fim das Funções de Ajuda ---


// Espera o HTML carregar
document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Encontrar o formulário de registro
    const form = document.querySelector('.register-box form');
    
    if (!form) {
        // Se não for a página de registro, não faz nada
        return; 
    }

    // 2. Adicionar um "ouvinte" para o envio do formulário
    form.addEventListener('submit', async function(event) {
        // 3. Impedir o envio padrão do HTML
        event.preventDefault();

        // 4. Limpar mensagens de erro antigas
        clearErrors(); 
        
        // 5. Pegar os dados dos campos do formulário
        const nome = document.querySelector('#full-name').value;
        const email = document.querySelector('#email').value;
        const telefone = document.querySelector('#phone').value;
        const cpf_cnpj = document.querySelector('#fiscal_number').value;
        const senha = document.querySelector('#password').value;
        const senhaConfirm = document.querySelector('#password-confirm').value;

        // 6. Validação básica no frontend
        if (senha !== senhaConfirm) {
            showError(document.querySelector('#password-confirm'), 'As senhas não conferem.');
            return;
        }

        // 7. Montar o "pacote" de dados (JSON) para enviar
        const data = {
            nome: nome,
            email: email,
            telefone: telefone,
            cpf_cnpj: cpf_cnpj,
            senha: senha
        };

        // 8. Tentar enviar para a API (o backend)
        try {
            const response = await fetch('http://localhost:3001/api/registrar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) { // Sucesso (código 201)
                // Deu certo!
                alert('Conta criada com sucesso! Você será redirecionado para o login.');
                window.location.href = 'login.html'; // Redireciona
            } else {
                // Deu erro (código 400, 409, 500)
                // Mostra o erro que o backend enviou (ex: "E-mail já cadastrado")
                showError(form, result.error || 'Erro desconhecido.');
            }

        } catch (error) {
            // Erro de rede (ex: backend desligado)
            console.error('Erro de rede:', error);
            showError(form, 'Não foi possível conectar ao servidor. Tente novamente.');
        }
    });

});