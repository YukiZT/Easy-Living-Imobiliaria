/* js/main.js */
document.addEventListener('DOMContentLoaded', function() {
    
    // Seleciona o botão e a lista de links
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    // Verifica se os elementos existem
    if (menuToggle && navLinks) {
        
        // Adiciona um "ouvinte" de clique no botão
        menuToggle.addEventListener('click', function() {
            // Adiciona/Remove a classe 'active' na lista de links
            navLinks.classList.toggle('active');
            
            // Adiciona/Remove a classe 'active' no próprio botão (para animar o "X")
            menuToggle.classList.toggle('active');
        });
    }

});

/* ===================================================
   CARREGAMENTO DINÂMICO DE IMÓVEIS (HOME PAGE)
=================================================== */

// Adiciona um novo "ouvinte" para quando o HTML carregar
document.addEventListener('DOMContentLoaded', function() {
    
    // ... (código do menu responsivo que já existe) ...


    // --- Código para carregar imóveis recentes ---
    
    // 1. Achar a seção "Recém-Adicionados"
    const newListingSection = document.querySelector('.new-listings');
    
    // 2. Se estivermos numa página que TEM essa seção (a home.html)...
    if (newListingSection) {
        // ...vamos buscar os imóveis na nossa API
        fetchImoveisRecentes();
    }
});


/**
 * Função que busca os dados na API e preenche o HTML
 */
function fetchImoveisRecentes() {
    const grid = document.querySelector('.new-listings .property-grid');
    if (!grid) return;

    // 1. Chamar a API que criamos no backend
    fetch('http://localhost:3001/api/imoveis/recentes')
        .then(response => response.json()) // 2. Converter a resposta para JSON
        .then(imoveis => { // 3. "imoveis" é o array de dados do banco
            
            // Limpa o grid de quaisquer exemplos estáticos
            grid.innerHTML = ''; 

            if (imoveis.length === 0) {
                grid.innerHTML = '<p>Nenhum imóvel recém-adicionado no momento.</p>';
                return;
            }

            // 4. Cria um card HTML para cada imóvel
            imoveis.forEach(imovel => {
                const cardHTML = `
                <article class="property-card">
                    <a href="detalhe-imovel.html?id=${imovel.Imo_Codigo}">
                        <div class="new-badge">NOVO</div>
                        <img src="${imovel.Imo_Foto || 'https://via.placeholder.com/400x250.png?text=Sem+Foto'}" alt="Foto do Imóvel">
                        <div class="property-info">
                            <h3>${imovel.Imo_Endereco}</h3>
                            <p class="property-location">${imovel.Imo_Endereco}</p>
                            <div class="property-details">
                                <span>Área: ${imovel.Imo_Area_Construida || '?'} m²</span>
                            </div>
                            <p class="property-price">R$ ${parseFloat(imovel.Imo_Preco_Pretendido).toLocaleString('pt-BR')}</p>
                        </div>
                    </a>
                </article>
                `;
                
                // 5. Insere o card novo dentro do grid
                grid.insertAdjacentHTML('beforeend', cardHTML);
            });
        })
        .catch(error => {
            console.error('Erro ao buscar imóveis:', error);
            grid.innerHTML = '<p>Não foi possível carregar os imóveis. Tente novamente mais tarde.</p>';
        });
}