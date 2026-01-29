/* js/detalhe.js (COMPLETO E ATUALIZADO) */

document.addEventListener('DOMContentLoaded', function () {

    // --- 1. LÓGICA DE CARREGAMENTO DO IMÓVEL ---

    // Pega o ID do imóvel da URL (ex: ...?id=123)
    const urlParams = new URLSearchParams(window.location.search);
    const idImovel = urlParams.get('id');

    if (idImovel) {
        // Se temos um ID, busca os dados na API
        fetchImovel(idImovel);
    } else {
        // Se não tem ID, mostra um erro
        document.querySelector('main').innerHTML = '<h1>Erro: Imóvel não especificado.</h1>';
    }

    /**
     * Busca os dados do imóvel na nossa API
     * @param {string} id - O ID do imóvel a buscar
     */
    async function fetchImovel(id) {
        try {
            const response = await fetch(`http://localhost:3001/api/imovel/${id}`);

            if (!response.ok) { // Ex: 404
                const errorResult = await response.json();
                throw new Error(errorResult.error || 'Imóvel não encontrado');
            }

            const imovel = await response.json();
            preencherPagina(imovel);

        } catch (error) {
            console.error('Erro ao buscar imóvel:', error);
            document.querySelector('main').innerHTML = `<h1>${error.message}</h1>`;
        }
    }

    /**
     * Preenche o HTML da página com os dados do imóvel
     * @param {object} imovel - O objeto JSON que veio da API
     */
    function preencherPagina(imovel) {
        // Formata o preço
        const precoFormatado = parseFloat(imovel.Imo_Preco_Pretendido).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });

        // 1. Título e Cabeçalho
        document.title = imovel.Imo_Endereco; // Muda o título da aba do navegador
        document.querySelector('h1').textContent = imovel.Imo_Endereco; // Título principal
        document.querySelector('.property-location').textContent = `${imovel.Tip_Nome} em ${imovel.Bar_Nome}`;

        // 2. Preço
        document.querySelector('.price-value').textContent = precoFormatado;
        // (No futuro, podemos adicionar colunas de Condomínio/IPTU no banco)
        document.querySelector('.sub-price').textContent = '';

        // 3. Ícones (usando os novos campos do SQL)
        const keyFeatures = document.querySelector('.property-key-features');
        keyFeatures.innerHTML = `
            <span>
                <strong>Área:</strong> ${imovel.Imo_Area_Construida || '?'} m²
            </span>
            <span>
                <strong>Quartos:</strong> ${imovel.Imo_Quartos || '?'}
            </span>
            <span>
                <strong>Banheiros:</strong> ${imovel.Imo_Banheiros || '?'}
            </span>
            <span>
                <strong>Vagas:</strong> ${imovel.Imo_Vagas || '?'}
            </span>
        `;

        // 4. Descrição (usando a nova coluna Imo_Descricao)
        const descElement = document.querySelector('#description p');
        if (imovel.Imo_Descricao) {
            descElement.textContent = imovel.Imo_Descricao;
        } else {
            descElement.textContent = "Este imóvel ainda não possui uma descrição detalhada.";
        }

// 5. Galeria de Fotos Dinâmica (VERSÃO CARROSSEL CORRIGIDA)
        
        // A. Define a imagem principal (Capa)
        const fotoCapa = imovel.Imo_Foto || 'https://via.placeholder.com/1200x600.png?text=Sem+Foto';
        const mainImageElement = document.querySelector('#main-property-image');
        if (mainImageElement) {
            mainImageElement.src = fotoCapa;
            mainImageElement.alt = `Foto principal de ${imovel.Imo_Endereco}`;
        }

        // B. Encontra o container do carrossel (IMPORTANTE: USA O NOVO ID)
        const thumbnailsContainer = document.getElementById('gallery-thumbnails-container');
        
        // Só executa se o container existir no HTML
        if (thumbnailsContainer) {
            thumbnailsContainer.innerHTML = ''; // Limpa antes de preencher
        
            // C. Cria a lista de todas as fotos (Capa + Galeria)
            let todasFotos = [fotoCapa];
            // Se vieram fotos extras do backend, junta tudo
            if (imovel.fotos && Array.isArray(imovel.fotos) && imovel.fotos.length > 0) {
                todasFotos = [fotoCapa, ...imovel.fotos];
            }

            console.log(`Carregando ${todasFotos.length} fotos no carrossel.`); // Debug para você ver no console

            // D. Gera o HTML das miniaturas
            todasFotos.forEach((caminhoFoto, index) => {
                const img = document.createElement('img');
                img.src = caminhoFoto;
                // Se a imagem falhar, usa um placeholder
                img.onerror = function() { 
                    this.src = 'https://placehold.co/150x100?text=Erro+Foto'; 
                    this.alt = 'Imagem não encontrada';
                };
                img.dataset.largeSrc = caminhoFoto;
                img.alt = `Miniatura ${index + 1}`;
                
                // A primeira foto ganha a classe 'active'
                if (index === 0) img.classList.add('active');

                // E. Clique na miniatura: Troca a foto principal
                img.addEventListener('click', function() {
                    if (mainImageElement) {
                        // Efeito de "fade" simples
                        mainImageElement.style.opacity = 0; 
                        setTimeout(() => {
                            mainImageElement.src = this.dataset.largeSrc;
                            mainImageElement.style.opacity = 1;
                        }, 200);
                    }
                    // Atualiza a classe 'active' nas miniaturas
                    document.querySelectorAll('#gallery-thumbnails-container img').forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                });

                thumbnailsContainer.appendChild(img);
            });

            // F. Lógica dos Botões do Carrossel
            const prevBtn = document.getElementById('thumb-prev');
            const nextBtn = document.getElementById('thumb-next');
            const scrollAmount = 260; // Distância da rolagem (2 fotos + espaço)

            if (prevBtn && nextBtn) {
                // Clona os botões para garantir que não há eventos antigos duplicados
                const newPrevBtn = prevBtn.cloneNode(true);
                const newNextBtn = nextBtn.cloneNode(true);
                prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);
                nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);

                newPrevBtn.addEventListener('click', () => {
                    thumbnailsContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
                });

                newNextBtn.addEventListener('click', () => {
                    thumbnailsContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                });
            }
        } else {
            console.error("ERRO CRÍTICO: Container '#gallery-thumbnails-container' não encontrado no HTML.");
        }
        
        // 6. Simulador de Financiamento
        const valorImovelInput = document.querySelector('#sim-valor-imovel');
        if (valorImovelInput) {
            valorImovelInput.value = precoFormatado;
            // Preenche o valor de entrada (ex: 20%)
            const entrada = parseFloat(imovel.Imo_Preco_Pretendido) * 0.2;
            document.querySelector('#sim-valor-entrada').value = entrada.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });
        }
    }


    // --- 2. CÓDIGO DA GALERIA (JÁ EXISTENTE, SEM MUDANÇAS) ---
    const mainImage = document.querySelector('#main-property-image');
    const thumbnails = document.querySelectorAll('.gallery-thumbnails img');

    if (mainImage && thumbnails.length > 0) {
        thumbnails.forEach(function (thumb) {
            thumb.addEventListener('click', function () {
                const largeImageSrc = thumb.dataset.largeSrc;
                mainImage.src = largeImageSrc;
                thumbnails.forEach(function (innerThumb) {
                    innerThumb.classList.remove('active');
                });
                thumb.classList.add('active');
            });
        });
    }


    // --- 3. CÓDIGO DO SIMULADOR (JÁ EXISTENTE, SEM MUDANÇAS) ---
    const simulatorForm = document.querySelector('.simulator-form');

    if (simulatorForm) {
        const btnSimulate = simulatorForm.querySelector('.btn-simulate');
        const valorEntradaInput = simulatorForm.querySelector('#sim-valor-entrada');
        const prazoInput = simulatorForm.querySelector('#sim-prazo');
        const jurosInput = simulatorForm.querySelector('#sim-juros');
        const resultadoElement = document.querySelector('#result-value');

        btnSimulate.addEventListener('click', function () {
            calcularFinanciamento();
        });

        function parseCurrency(valorString) {
            if (!valorString) return 0;
            let numeroLimpo = valorString.replace('R$', '').trim().replace(/\./g, '');
            numeroLimpo = numeroLimpo.replace(',', '.');
            return parseFloat(numeroLimpo) || 0;
        }

        function calcularFinanciamento() {
            // Pega o valor do imóvel do campo (que foi preenchido dinamicamente)
            const valorImovelInput = document.querySelector('#sim-valor-imovel');
            const valorImovel = parseCurrency(valorImovelInput.value);

            const valorEntrada = parseCurrency(valorEntradaInput.value);
            const prazoMeses = parseInt(prazoInput.value, 10);
            const taxaJurosAnual = parseFloat(jurosInput.value.replace('%', '')) / 100;

            const valorFinanciado = valorImovel - valorEntrada;

            if (valorFinanciado <= 0) {
                resultadoElement.textContent = "Verifique os valores";
                return;
            }

            const taxaJurosMensal = Math.pow(1 + taxaJurosAnual, 1 / 12) - 1;
            const parcela = valorFinanciado * (taxaJurosMensal * Math.pow(1 + taxaJurosMensal, prazoMeses)) / (Math.pow(1 + taxaJurosMensal, prazoMeses) - 1);

            const parcelaFormatada = parcela.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });

            resultadoElement.textContent = parcelaFormatada;
        }
    }

}); // Fim do 'DOMContentLoaded'