// Espera o HTML carregar
document.addEventListener('DOMContentLoaded', function() {

    // Seleciona os elementos principais
    const formFiltros = document.querySelector('#filter-form');
    const gridResultados = document.querySelector('.results-main-content .property-grid');
    const selectTipo = document.querySelector('#f-tipo-imovel');
    const selectBairro = document.querySelector('#f-localidade'); // Vamos mudar isso de input para select
    const contagemResultados = document.querySelector('.results-header p strong');

    // 1. Carregar os filtros de Tipo e Bairro assim que a página abre
    carregarFiltros();

    // 2. "Ouvir" o envio do formulário de filtros
    formFiltros.addEventListener('submit', function(event) {
        // Impede o recarregamento da página
        event.preventDefault(); 
        // Executa a busca
        buscarImoveis();
    });

    // 3. Executa a busca uma vez quando a página carrega (para mostrar todos)
    buscarImoveis();


    // --- FUNÇÕES ---

    /**
     * Carrega os <select> de Tipo e Bairro do banco de dados
     */
    async function carregarFiltros() {
        // Carrega Tipos
        try {
            const responseTipos = await fetch('http://localhost:3001/api/filtros/tipos');
            const tipos = await responseTipos.json();
            
            // Limpa o select (deixando o "Todos")
            selectTipo.innerHTML = '<option value="">Todos os Tipos</option>'; 
            tipos.forEach(tipo => {
                selectTipo.innerHTML += `<option value="${tipo.Tip_Codigo}">${tipo.Tip_Nome}</option>`;
            });
        } catch (error) {
            console.error('Erro ao carregar tipos:', error);
        }

        // Carrega Bairros 
        try {
            const responseBairros = await fetch('http://localhost:3001/api/filtros/bairros');
            const bairros = await responseBairros.json();
            
            selectBairro.innerHTML = '<option value="">Todas as Localidades</option>';
            bairros.forEach(bairro => {
                selectBairro.innerHTML += `<option value="${bairro.Bar_Codigo}">${bairro.Bar_Nome}</option>`;
            });
        } catch (error) {
            console.error('Erro ao carregar bairros:', error);
        }
    }

    /**
     * Função principal de busca
     */
    async function buscarImoveis() {
        // 1. Monta a string de query para a API
        const formData = new FormData(formFiltros);
        const params = new URLSearchParams();

        // Mapeia os nomes do formulário para os nomes da API
        params.append('tipo', formData.get('tipo'));
        params.append('bairro', formData.get('localidade'));
        params.append('preco_min', formData.get('preco_min'));
        params.append('preco_max', formData.get('preco_max'));
        // Pega todos os quartos checados
        const quartos = Array.from(formData.getAll('quartos'));
        if (quartos.length > 0) {
            params.append('quartos', quartos[0]); 
        }

        const queryString = params.toString();

        // 2. Chama a API
        try {
            const response = await fetch(`http://localhost:3001/api/imoveis?${queryString}`);
            const imoveis = await response.json();

            // 3. Renderiza os resultados
            renderizarResultados(imoveis);

        } catch (error) {
            console.error('Erro ao buscar imóveis:', error);
            gridResultados.innerHTML = '<p>Erro ao carregar imóveis.</p>';
        }
    }

    /**
     * Renderiza os cards dos imóveis no HTML
     * @param {Array} imoveis - O array de imóveis vindo da API
     */
    function renderizarResultados(imoveis) {
        // Limpa o grid
        gridResultados.innerHTML = '';

        // Atualiza a contagem
        contagemResultados.textContent = `${imoveis.length} imóveis`;

        if (imoveis.length === 0) {
            gridResultados.innerHTML = '<p>Nenhum imóvel encontrado com estes filtros.</p>';
            return;
        }

        // Cria e insere o card para cada imóvel
        imoveis.forEach(imovel => {
            const preco = parseFloat(imovel.Imo_Preco_Pretendido).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });

            const cardHTML = `
            <article class="property-card">
                <a href="detalhe-imovel.html?id=${imovel.Imo_Codigo}">
                    <img src="${imovel.Imo_Foto || 'https://via.placeholder.com/400x250.png?text=Sem+Foto'}" alt="Foto do Imóvel">
                    <div class="property-info">
                        <h3>${imovel.Imo_Endereco}</h3>
                        <p class="property-location">${imovel.Bar_Nome}</p>
                        <div class="property-details">
                            <span>Área: ${imovel.Imo_Area_Construida || '?'} m²</span>
                            <span>Quartos: ${imovel.Imo_Quartos || '?'}</span>
                            <span>Vagas: ${imovel.Imo_Vagas || '?'}</span>
                        </div>
                        <p class="property-price">${preco}</p>
                    </div>
                </a>
            </article>
            `;
            gridResultados.insertAdjacentHTML('beforeend', cardHTML);
        });
    }

});