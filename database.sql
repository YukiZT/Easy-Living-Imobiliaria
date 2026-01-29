-- 1. Cria o Banco de Dados do Zero
DROP DATABASE IF EXISTS ImobiliariaDB;
CREATE DATABASE ImobiliariaDB;
USE ImobiliariaDB;

-- 2. Cria as Tabelas Auxiliares (Bairro e Tipo)
CREATE TABLE Bairro (
    Bar_Codigo INT AUTO_INCREMENT PRIMARY KEY,
    Bar_Nome VARCHAR(50) NOT NULL
);

CREATE TABLE Tipo_Imovel (
    Tip_Codigo INT AUTO_INCREMENT PRIMARY KEY,
    Tip_Nome VARCHAR(50) NOT NULL
);

-- 3. Cria a Tabela Principal (Imóvel)
CREATE TABLE Imovel (
    Imo_Codigo INT AUTO_INCREMENT PRIMARY KEY,
    Imo_Codigo_Tipo_Imovel INT,
    Imo_Codigo_Bairro INT,
    Imo_Preco_Pretendido DECIMAL(10, 2),
    Imo_Endereco VARCHAR(100),
    Imo_Numero VARCHAR(10),
    Imo_Area_Construida DECIMAL(10, 2),
    Imo_Area_Total DECIMAL(10, 2),
    Imo_Status_Venda VARCHAR(20),
    Imo_Foto VARCHAR(255), -- Foto de Capa
    Imo_Codigo_Propietario INT DEFAULT 1, -- Valor padrão para simplificar
    Imo_Quartos INT,
    Imo_Banheiros INT,
    Imo_Vagas INT,
    Imo_Descricao TEXT,
    FOREIGN KEY (Imo_Codigo_Tipo_Imovel) REFERENCES Tipo_Imovel(Tip_Codigo),
    FOREIGN KEY (Imo_Codigo_Bairro) REFERENCES Bairro(Bar_Codigo)
);

-- 4. Cria a Tabela da Galeria de Fotos
CREATE TABLE Imovel_Fotos (
    Fot_Codigo INT AUTO_INCREMENT PRIMARY KEY,
    Fot_Imovel_Codigo INT NOT NULL,
    Fot_Caminho VARCHAR(255) NOT NULL,
    FOREIGN KEY (Fot_Imovel_Codigo) REFERENCES Imovel(Imo_Codigo)
);


-- Inserindo Bairros
INSERT INTO Bairro (Bar_Nome) VALUES ('Centro'), ('Bairro Nobre'), ('Jardim das Flores');

-- Inserindo Tipos
INSERT INTO Tipo_Imovel (Tip_Nome) VALUES ('Apartamento'), ('Casa'), ('Terreno');

-- Inserindo IMÓVEL 1 (Apartamento no Centro)
INSERT INTO Imovel 
(Imo_Codigo_Tipo_Imovel, Imo_Codigo_Bairro, Imo_Preco_Pretendido, Imo_Endereco, Imo_Numero, Imo_Area_Construida, Imo_Area_Total, Imo_Status_Venda, Imo_Foto, Imo_Quartos, Imo_Banheiros, Imo_Vagas, Imo_Descricao)
VALUES 
(1, 1, 450000.00, 'Apartamento Moderno', '101', 80, 100, 'Disponível', 'imagens/apto.jpg', 2, 2, 1, 'Apartamento incrível no centro, perto de tudo.');

-- Inserindo IMÓVEL 2 (A Casa Grande com Galeria)
INSERT INTO Imovel 
(Imo_Codigo_Tipo_Imovel, Imo_Codigo_Bairro, Imo_Preco_Pretendido, Imo_Endereco, Imo_Numero, Imo_Area_Construida, Imo_Area_Total, Imo_Status_Venda, Imo_Foto, Imo_Quartos, Imo_Banheiros, Imo_Vagas, Imo_Descricao)
VALUES 
(2, 2, 1200000.00, 'Casa em Condomínio', '500', 390, 3300, 'Disponível', 'imagens/imovel_753_65527.jpg', 4, 3, 3, 'Casa espetacular em condomínio fechado, área verde preservada, segurança 24h e acabamento de luxo.');

-- Inserindo as FOTOS DA GALERIA para o Imóvel 2
INSERT INTO Imovel_Fotos (Fot_Imovel_Codigo, Fot_Caminho) VALUES 
(2, 'imagens/imovel_753_65527.jpg'),
(2, 'imagens/imovel_753_65528.jpg'),
(2, 'imagens/imovel_753_65529.jpg'),
(2, 'imagens/imovel_753_65530.jpg'),
(2, 'imagens/imovel_753_65531.jpg'),
(2, 'imagens/imovel_753_65532.jpg'),
(2, 'imagens/imovel_753_65533.jpg'),
(2, 'imagens/imovel_753_65535.jpg'),
(2, 'imagens/imovel_753_65536.jpg'),
(2, 'imagens/imovel_753_65537.jpg'),
(2, 'imagens/imovel_753_65538.jpg'),
(2, 'imagens/imovel_753_65539.jpg'),
(2, 'imagens/imovel_753_65540.jpg'),
(2, 'imagens/imovel_753_65541.jpg'),
(2, 'imagens/imovel_753_65543.jpg'),
(2, 'imagens/imovel_753_65544.jpg'),
(2, 'imagens/imovel_753_65545.jpg'),
(2, 'imagens/imovel_753_65547.jpg'),
(2, 'imagens/imovel_753_65550.jpg'),
(2, 'imagens/imovel_753_65554.jpg'),
(2, 'imagens/imovel_753_65521.jpg'),
(2, 'imagens/imovel_753_65522.jpg'),
(2, 'imagens/imovel_753_65523.jpg'),
(2, 'imagens/imovel_753_65524.jpg'),
(2, 'imagens/imovel_753_65525.jpg'),
(2, 'imagens/imovel_753_65526.jpg');

USE ImobiliariaDB;
-- Adicionando as fotos para o Imóvel 1 (O Apartamento)
INSERT INTO Imovel_Fotos (Fot_Imovel_Codigo, Fot_Caminho) VALUES 
(1, 'imagens/202509042143449684.jpeg'),
(1, 'imagens/202509042143441536.jpeg'),
(1, 'imagens/202509042143432237.jpeg'),
(1, 'imagens/20250904214342163.jpeg'),
(1, 'imagens/202509042143412265.jpeg'),
(1, 'imagens/202509042143401188.jpeg'),
(1, 'imagens/20250904214346810.jpeg'),
(1, 'imagens/20250904214345670.jpeg'),
(1, 'imagens/202509042143455438.jpeg'),
(1, 'imagens/202509042143454405.jpeg');

UPDATE Imovel 
SET Imo_Foto = 'imagens/202509042143449684.jpeg' 
WHERE Imo_Codigo = 1;