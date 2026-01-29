/* =======================================
   IMPORTAÇÃO DAS BIBLIOTECAS
======================================= */
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');

/* =======================================
   CONFIGURAÇÃO DO SERVIDOR
======================================= */
// Cria o "aplicativo" do servidor
const app = express();
// Define a porta onde o servidor vai "ouvir"
const port = 3001; // Usamos 3001 para não dar conflito com o frontend

// Habilita o CORS (Permite que seu site chame esta API)
app.use(cors());
// Habilita o Express para entender JSON (para futuras rotas de login, etc)
app.use(express.json());

/* =======================================
   CONEXÃO COM O BANCO DE DADOS
======================================= */
// Crie a conexão com seu banco MySQL
const db = mysql.createConnection({
    host: '127.0.0.1',       // Geralmente é 'localhost'
    user: 'root',            // Geralmente é 'root' no XAMPP/WAMP
    password: '',
    database: 'imobiliariadb'  // O nome do banco que você criou
});

// Tenta se conectar...
db.connect(err => {
    if (err) {
        console.error('Erro ao conectar ao MySQL:', err.stack);
        return;
    }
    console.log('Conectado ao banco de dados MySQL com o ID', db.threadId);
});

/* =======================================
   ROTAS DA API (OS "ENDPOINTS")
======================================= */

// Rota de teste (para ver se o servidor está no ar)
app.get('/', (req, res) => {
    res.send('API da Imobiliária Easy Living no ar!');
});

/**
 * ROTA: [GET] /api/imoveis/recentes
 * Objetivo: Buscar os 6 imóveis mais recentes marcados como 'Disponível'.
 * Usado em: home.html
 */
app.get('/api/imoveis/recentes', (req, res) => {
    
    // Usamos os nomes exatos das suas colunas
    const sqlQuery = `
        SELECT 
            Imo_Codigo, 
            Imo_Endereco, 
            Imo_Preco_Pretendido, 
            Imo_Area_Construida, 
            Imo_Foto 
        FROM 
            imovel 
        WHERE 
            Imo_Status_Venda = 'Disponível' 
        ORDER BY 
            Imo_Codigo DESC 
        LIMIT 6;
    `;

    // Executa a query no banco
    db.query(sqlQuery, (err, results) => {
        if (err) {
            // Se der erro no banco, envia o erro
            console.error('Erro na query:', err);
            res.status(500).json({ error: 'Erro interno do servidor' });
            return;
        }
        
        // Se der certo, envia os resultados como JSON
        res.json(results);
    });
});

/* =======================================
   NOVAS ROTAS DA API
======================================= */

/**
 * ROTA: [POST] /api/registrar
 * Objetivo: Registrar um novo cliente (da página registrar.html)
 */
app.post('/api/registrar', async (req, res) => {
    // 1. Pegar os dados do corpo da requisição (que virão do formulário)
    const { 
        nome,      // Vem do input 'full-name'
        email,     // Vem do input 'email'
        telefone,  // Vem do input 'phone'
        cpf_cnpj,  // Vem do input 'fiscal_number'
        senha      // Vem do input 'password'
    } = req.body;

    // 2. Verificar se todos os campos essenciais vieram
    if (!nome || !email || !senha || !cpf_cnpj) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    try {
        // 3. Criptografar a senha (NUNCA salve senha em texto puro)
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);

        // 4. Montar o SQL para inserir na tabela Cliente
        const sqlQuery = `
            INSERT INTO Cliente 
                (Cli_Nome, Cli_Email, Cli_Senha, Cli_CPF_CNPJ, Cli_Telefone1) 
            VALUES 
                (?, ?, ?, ?, ?);
        `;
        
        const valores = [nome, email, senhaHash, cpf_cnpj, telefone];

        // 5. Executar o SQL
        db.query(sqlQuery, valores, (err, result) => {
            if (err) {
                // Erro comum: E-mail ou CPF/CNPJ já existe (UNIQUE)
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ error: 'E-mail ou CPF/CNPJ já cadastrado.' });
                }
                // Outro erro de banco
                console.error('Erro ao inserir cliente:', err);
                return res.status(500).json({ error: 'Erro interno ao criar conta.' });
            }

            // 6. Sucesso!
            console.log('Novo cliente registrado com ID:', result.insertId);
            res.status(201).json({ message: 'Conta criada com sucesso!' });
        });

    } catch (error) {
        console.error('Erro no servidor (bcrypt ou geral):', error);
        res.status(500).json({ error: 'Erro interno no servidor.' });
    }
});

/**
 * ROTA: [POST] /api/login
 * Objetivo: Autenticar um cliente (da página login.html)
 */
app.post('/api/login', (req, res) => {
    // 1. Pegar os dados do formulário de login
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    // 2. Procurar o cliente no banco de dados pelo E-MAIL
    const sqlQuery = 'SELECT * FROM Cliente WHERE Cli_Email = ?';

    db.query(sqlQuery, [email], async (err, results) => {
        if (err) {
            console.error('Erro na query de login:', err);
            return res.status(500).json({ error: 'Erro interno do servidor.' });
        }

        // 3. Verificar se o cliente foi encontrado (se o e-mail existe)
        if (results.length === 0) {
            // E-mail não encontrado.
            return res.status(401).json({ error: 'Credenciais inválidas.' });
            // Nota: Usamos "Credenciais inválidas" genérico por segurança
        }

        // 4. Se encontrou, pegar os dados do cliente
        const cliente = results[0];

        try {
            // 5. Comparar a senha do formulário com a senha HASH do banco
            const isMatch = await bcrypt.compare(senha, cliente.Cli_Senha);

            if (isMatch) {
                // 6. SUCESSO! Senha correta.
                // No futuro, aqui nós geraríamos um Token (JWT)
                console.log(`Cliente ${cliente.Cli_Nome} (ID: ${cliente.Cli_Codigo}) logou com sucesso.`);
                res.status(200).json({ 
                    message: 'Login bem-sucedido!',
                    // Poderíamos enviar dados do usuário de volta, se quiséssemos
                    usuario: {
                        nome: cliente.Cli_Nome,
                        email: cliente.Cli_Email
                    }
                });
            } else {
                // 7. ERRO! Senha incorreta.
                res.status(401).json({ error: 'Credenciais inválidas.' });
            }

        } catch (error) {
            console.error('Erro ao comparar senhas (bcrypt):', error);
            res.status(500).json({ error: 'Erro interno do servidor.' });
        }
    });
});

/**
 * ROTA: [GET] /api/imovel/:id
 * Objetivo: Buscar imóvel E suas fotos da galeria
 */
app.get('/api/imovel/:id', (req, res) => {
    const idImovel = req.params.id;

    // 1. Busca os dados principais do imóvel
    const sqlImovel = `
        SELECT Imovel.*, Bairro.Bar_Nome, Tipo_Imovel.Tip_Nome 
        FROM Imovel
        INNER JOIN Bairro ON Imovel.Imo_Codigo_Bairro = Bairro.Bar_Codigo
        INNER JOIN Tipo_Imovel ON Imovel.Imo_Codigo_Tipo_Imovel = Tipo_Imovel.Tip_Codigo
        WHERE Imovel.Imo_Codigo = ?
    `;

    db.query(sqlImovel, [idImovel], (err, results) => {
        if (err) return res.status(500).json({ error: 'Erro no servidor' });
        if (results.length === 0) return res.status(404).json({ error: 'Imóvel não encontrado' });

        const imovel = results[0];

        // 2. AGORA: Busca as fotos extras da galeria desse imóvel
        const sqlFotos = 'SELECT Fot_Caminho FROM Imovel_Fotos WHERE Fot_Imovel_Codigo = ?';
        
        db.query(sqlFotos, [idImovel], (errFotos, resultsFotos) => {
            if (errFotos) {
                // Se der erro nas fotos, enviamos o imóvel sem galeria mesmo
                imovel.fotos = []; 
            } else {
                // Adiciona as fotos ao objeto do imóvel
                // O map cria um array simples: ['img1.jpg', 'img2.jpg']
                imovel.fotos = resultsFotos.map(f => f.Fot_Caminho);
            }

            // 3. Envia tudo junto para o site
            res.json(imovel);
        });
    });
});
/**
 * ROTA: [GET] /api/filtros/tipos
 * Objetivo: Buscar todos os tipos de imóvel para preencher os filtros
 */
app.get('/api/filtros/tipos', (req, res) => {
    const sqlQuery = 'SELECT Tip_Codigo, Tip_Nome FROM Tipo_Imovel ORDER BY Tip_Nome';
    db.query(sqlQuery, (err, results) => {
        if (err) {
            console.error('Erro ao buscar tipos:', err);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
        res.json(results);
    });
});

/**
 * ROTA: [GET] /api/filtros/bairros
 * Objetivo: Buscar todos os bairros para preencher os filtros
 */
app.get('/api/filtros/bairros', (req, res) => {
    const sqlQuery = 'SELECT Bar_Codigo, Bar_Nome FROM Bairro ORDER BY Bar_Nome';
    db.query(sqlQuery, (err, results) => {
        if (err) {
            console.error('Erro ao buscar bairros:', err);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
        res.json(results);
    });
});

/**
 * ROTA: [GET] /api/imoveis
 * Objetivo: Rota principal de busca, com filtros dinâmicos
 */
app.get('/api/imoveis', (req, res) => {
    // 1. Inicia a query SQL base
    // Usamos JOINs para poder filtrar pelos nomes de bairro/tipo
    let sqlQuery = `
        SELECT Imovel.*, Bairro.Bar_Nome, Tipo_Imovel.Tip_Nome 
        FROM Imovel
        INNER JOIN Bairro ON Imovel.Imo_Codigo_Bairro = Bairro.Bar_Codigo
        INNER JOIN Tipo_Imovel ON Imovel.Imo_Codigo_Tipo_Imovel = Tip_Codigo
    `;

    // 2. Prepara os filtros (cláusulas WHERE)
    const filtros = [];
    const valores = [];

    // Adiciona filtro de status padrão (só mostrar disponíveis)
    filtros.push("Imo_Status_Venda = 'Disponível'");

    // 3. Pega os filtros que vieram da URL (ex: ?tipo=1&quartos=2)
    const { tipo, bairro, preco_min, preco_max, quartos } = req.query;

    if (tipo) {
        filtros.push("Imo_Codigo_Tipo_Imovel = ?");
        valores.push(tipo);
    }
    if (bairro) {
        filtros.push("Imo_Codigo_Bairro = ?");
        valores.push(bairro);
    }
    if (preco_min) {
        filtros.push("Imo_Preco_Pretendido >= ?");
        valores.push(preco_min);
    }
    if (preco_max) {
        filtros.push("Imo_Preco_Pretendido <= ?");
        valores.push(preco_max);
    }
    if (quartos) {
        // Se o valor for "4+", tratamos de forma especial
        if (quartos === '4+') {
            filtros.push("Imo_Quartos >= 4");
        } else {
            filtros.push("Imo_Quartos = ?");
            valores.push(quartos);
        }
    }
    // (Pode adicionar mais filtros aqui: banheiros, vagas, etc.)

    // 4. Monta a string da query SQL final
    if (filtros.length > 0) {
        sqlQuery += ' WHERE ' + filtros.join(' AND ');
    }

    // Adiciona ordenação
    sqlQuery += ' ORDER BY Imo_Codigo DESC';

    // 5. Executa a query final
    db.query(sqlQuery, valores, (err, results) => {
        if (err) {
            console.error('Erro na query de busca:', err);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
        // Envia os resultados da busca
        res.json(results);
    });
});

/* =======================================
   INICIAR O SERVIDOR
======================================= */
// "Liga" o servidor na porta definida
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});