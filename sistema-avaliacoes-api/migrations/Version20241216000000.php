<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20241216000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Initial database schema for Sistema de Avaliações';
    }

    public function up(Schema $schema): void
    {
        // Create usuarios table
        $this->addSql('CREATE TABLE usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 
            data_cadastro DATETIME NOT NULL, 
            cpf VARCHAR(14) NOT NULL, 
            nome VARCHAR(255) NOT NULL, 
            email VARCHAR(180) NOT NULL, 
            roles TEXT NOT NULL, 
            password VARCHAR(255) NOT NULL, 
            status BOOLEAN NOT NULL
        )');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_EF687F2A343A92FE ON usuarios (cpf)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_EF687F2AE7927C74 ON usuarios (email)');

        // Create tipo_avaliacao table
        $this->addSql('CREATE TABLE tipo_avaliacao (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 
            data_cadastro DATETIME NOT NULL, 
            descricao VARCHAR(255) NOT NULL, 
            status BOOLEAN NOT NULL
        )');

        // Create status_avaliacao table
        $this->addSql('CREATE TABLE status_avaliacao (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 
            data_cadastro DATETIME NOT NULL, 
            descricao VARCHAR(255) NOT NULL, 
            status BOOLEAN NOT NULL
        )');

        // Create disciplinas table
        $this->addSql('CREATE TABLE disciplinas (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 
            descricao VARCHAR(255) NOT NULL, 
            id_disciplina_externo VARCHAR(255) NOT NULL, 
            status BOOLEAN NOT NULL
        )');

        // Create avaliacoes table
        $this->addSql('CREATE TABLE avaliacoes (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 
            tipo_avaliacao_id INTEGER DEFAULT NULL, 
            responsavel_id INTEGER DEFAULT NULL, 
            status_avaliacao_id INTEGER DEFAULT NULL, 
            disciplina_id INTEGER DEFAULT NULL, 
            data_cadastro DATETIME NOT NULL, 
            instrucao TEXT DEFAULT NULL, 
            CONSTRAINT FK_1E46F617E8AADB07 FOREIGN KEY (tipo_avaliacao_id) REFERENCES tipo_avaliacao (id) NOT DEFERRABLE INITIALLY IMMEDIATE, 
            CONSTRAINT FK_1E46F617D35CC355 FOREIGN KEY (responsavel_id) REFERENCES usuarios (id) NOT DEFERRABLE INITIALLY IMMEDIATE, 
            CONSTRAINT FK_1E46F617A6924D7E FOREIGN KEY (status_avaliacao_id) REFERENCES status_avaliacao (id) NOT DEFERRABLE INITIALLY IMMEDIATE, 
            CONSTRAINT FK_1E46F617653C15AC FOREIGN KEY (disciplina_id) REFERENCES disciplinas (id) NOT DEFERRABLE INITIALLY IMMEDIATE
        )');
        $this->addSql('CREATE INDEX IDX_1E46F617E8AADB07 ON avaliacoes (tipo_avaliacao_id)');
        $this->addSql('CREATE INDEX IDX_1E46F617D35CC355 ON avaliacoes (responsavel_id)');
        $this->addSql('CREATE INDEX IDX_1E46F617A6924D7E ON avaliacoes (status_avaliacao_id)');
        $this->addSql('CREATE INDEX IDX_1E46F617653C15AC ON avaliacoes (disciplina_id)');

        // Create tipo_alternativa table
        $this->addSql('CREATE TABLE tipo_alternativa (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 
            data_cadastro DATETIME NOT NULL, 
            descricao VARCHAR(255) NOT NULL, 
            status BOOLEAN NOT NULL
        )');

        // Create nivel_dificuldade table
        $this->addSql('CREATE TABLE nivel_dificuldade (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 
            data_cadastro DATETIME NOT NULL, 
            descricao VARCHAR(255) NOT NULL, 
            status BOOLEAN NOT NULL
        )');

        // Create status_questao table
        $this->addSql('CREATE TABLE status_questao (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 
            data_cadastro DATETIME NOT NULL, 
            descricao VARCHAR(255) NOT NULL, 
            status BOOLEAN NOT NULL
        )');

        // Create questao_contexto table
        $this->addSql('CREATE TABLE questao_contexto (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 
            data_cadastro DATETIME NOT NULL, 
            contexto TEXT NOT NULL, 
            gerador_ia BOOLEAN NOT NULL, 
            arquivo_imagem VARCHAR(255) DEFAULT NULL
        )');

        // Create questoes table
        $this->addSql('CREATE TABLE questoes (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 
            questao_contexto_id INTEGER DEFAULT NULL, 
            disciplina_id INTEGER DEFAULT NULL, 
            tipo_alternativa_id INTEGER NOT NULL, 
            nivel_dificuldade_id INTEGER DEFAULT NULL, 
            status_questao_id INTEGER NOT NULL, 
            data_cadastro DATETIME NOT NULL, 
            pergunta TEXT NOT NULL, 
            gerador_ia BOOLEAN NOT NULL, 
            pontuacao NUMERIC(10, 2) DEFAULT NULL, 
            arquivo_imagem VARCHAR(255) DEFAULT NULL, 
            resposta_correta TEXT DEFAULT NULL, 
            ciclo VARCHAR(255) DEFAULT NULL, 
            fase VARCHAR(255) DEFAULT NULL, 
            tema VARCHAR(255) DEFAULT NULL, 
            habilidades TEXT DEFAULT NULL, 
            CONSTRAINT FK_BD6C5A6C1A6B6C47 FOREIGN KEY (questao_contexto_id) REFERENCES questao_contexto (id) NOT DEFERRABLE INITIALLY IMMEDIATE, 
            CONSTRAINT FK_BD6C5A6C653C15AC FOREIGN KEY (disciplina_id) REFERENCES disciplinas (id) NOT DEFERRABLE INITIALLY IMMEDIATE, 
            CONSTRAINT FK_BD6C5A6C7E14D5DC FOREIGN KEY (tipo_alternativa_id) REFERENCES tipo_alternativa (id) NOT DEFERRABLE INITIALLY IMMEDIATE, 
            CONSTRAINT FK_BD6C5A6C9C4851A7 FOREIGN KEY (nivel_dificuldade_id) REFERENCES nivel_dificuldade (id) NOT DEFERRABLE INITIALLY IMMEDIATE, 
            CONSTRAINT FK_BD6C5A6CD8752B34 FOREIGN KEY (status_questao_id) REFERENCES status_questao (id) NOT DEFERRABLE INITIALLY IMMEDIATE
        )');
        $this->addSql('CREATE INDEX IDX_BD6C5A6C1A6B6C47 ON questoes (questao_contexto_id)');
        $this->addSql('CREATE INDEX IDX_BD6C5A6C653C15AC ON questoes (disciplina_id)');
        $this->addSql('CREATE INDEX IDX_BD6C5A6C7E14D5DC ON questoes (tipo_alternativa_id)');
        $this->addSql('CREATE INDEX IDX_BD6C5A6C9C4851A7 ON questoes (nivel_dificuldade_id)');
        $this->addSql('CREATE INDEX IDX_BD6C5A6CD8752B34 ON questoes (status_questao_id)');

        // Create avaliacao_questoes table
        $this->addSql('CREATE TABLE avaliacao_questoes (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 
            avaliacao_id INTEGER NOT NULL, 
            questao_id INTEGER NOT NULL, 
            data_cadastro DATETIME NOT NULL, 
            ordem INTEGER DEFAULT NULL, 
            CONSTRAINT FK_A21F8E8C63C92382 FOREIGN KEY (avaliacao_id) REFERENCES avaliacoes (id) NOT DEFERRABLE INITIALLY IMMEDIATE, 
            CONSTRAINT FK_A21F8E8CD2B21BD1 FOREIGN KEY (questao_id) REFERENCES questoes (id) NOT DEFERRABLE INITIALLY IMMEDIATE
        )');
        $this->addSql('CREATE INDEX IDX_A21F8E8C63C92382 ON avaliacao_questoes (avaliacao_id)');
        $this->addSql('CREATE INDEX IDX_A21F8E8CD2B21BD1 ON avaliacao_questoes (questao_id)');

        // Create questao_alternativas table
        $this->addSql('CREATE TABLE questao_alternativas (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 
            questao_id INTEGER NOT NULL, 
            data_cadastro DATETIME NOT NULL, 
            alternativa VARCHAR(1) NOT NULL, 
            conteudo TEXT NOT NULL, 
            arquivo_imagem VARCHAR(255) DEFAULT NULL, 
            correta BOOLEAN NOT NULL, 
            CONSTRAINT FK_F1C5A5BCD2B21BD1 FOREIGN KEY (questao_id) REFERENCES questoes (id) NOT DEFERRABLE INITIALLY IMMEDIATE
        )');
        $this->addSql('CREATE INDEX IDX_F1C5A5BCD2B21BD1 ON questao_alternativas (questao_id)');

        // Create status_aplicacao table
        $this->addSql('CREATE TABLE status_aplicacao (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 
            data_cadastro DATETIME NOT NULL, 
            descricao VARCHAR(255) NOT NULL, 
            status BOOLEAN NOT NULL
        )');

        // Create avaliacao_parametros table
        $this->addSql('CREATE TABLE avaliacao_parametros (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 
            avaliacao_id INTEGER NOT NULL, 
            usuario_id INTEGER DEFAULT NULL, 
            status_aplicacao_id INTEGER DEFAULT NULL, 
            data_aplicacao DATETIME DEFAULT NULL, 
            status BOOLEAN NOT NULL, 
            CONSTRAINT FK_B7E4F5C563C92382 FOREIGN KEY (avaliacao_id) REFERENCES avaliacoes (id) NOT DEFERRABLE INITIALLY IMMEDIATE, 
            CONSTRAINT FK_B7E4F5C5DB38439E FOREIGN KEY (usuario_id) REFERENCES usuarios (id) NOT DEFERRABLE INITIALLY IMMEDIATE, 
            CONSTRAINT FK_B7E4F5C511F7F9C5 FOREIGN KEY (status_aplicacao_id) REFERENCES status_aplicacao (id) NOT DEFERRABLE INITIALLY IMMEDIATE
        )');
        $this->addSql('CREATE INDEX IDX_B7E4F5C563C92382 ON avaliacao_parametros (avaliacao_id)');
        $this->addSql('CREATE INDEX IDX_B7E4F5C5DB38439E ON avaliacao_parametros (usuario_id)');
        $this->addSql('CREATE INDEX IDX_B7E4F5C511F7F9C5 ON avaliacao_parametros (status_aplicacao_id)');

        // Create participante_avaliacoes table
        $this->addSql('CREATE TABLE participante_avaliacoes (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 
            avaliacao_id INTEGER NOT NULL, 
            usuario_id INTEGER NOT NULL, 
            data_cadastro DATETIME NOT NULL, 
            data_inicio DATETIME DEFAULT NULL, 
            data_fim DATETIME DEFAULT NULL, 
            pontuacao_total NUMERIC(10, 2) DEFAULT NULL, 
            status VARCHAR(255) NOT NULL, 
            CONSTRAINT FK_F8F3842463C92382 FOREIGN KEY (avaliacao_id) REFERENCES avaliacoes (id) NOT DEFERRABLE INITIALLY IMMEDIATE, 
            CONSTRAINT FK_F8F38424DB38439E FOREIGN KEY (usuario_id) REFERENCES usuarios (id) NOT DEFERRABLE INITIALLY IMMEDIATE
        )');
        $this->addSql('CREATE INDEX IDX_F8F3842463C92382 ON participante_avaliacoes (avaliacao_id)');
        $this->addSql('CREATE INDEX IDX_F8F38424DB38439E ON participante_avaliacoes (usuario_id)');

        // Create avaliacao_respostas table
        $this->addSql('CREATE TABLE avaliacao_respostas (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 
            participante_avaliacao_id INTEGER NOT NULL, 
            questao_id INTEGER NOT NULL, 
            data_cadastro DATETIME NOT NULL, 
            resposta TEXT DEFAULT NULL, 
            pontuacao NUMERIC(10, 2) DEFAULT NULL, 
            correta BOOLEAN DEFAULT NULL, 
            CONSTRAINT FK_CF9A99E4C8344D33 FOREIGN KEY (participante_avaliacao_id) REFERENCES participante_avaliacoes (id) NOT DEFERRABLE INITIALLY IMMEDIATE, 
            CONSTRAINT FK_CF9A99E4D2B21BD1 FOREIGN KEY (questao_id) REFERENCES questoes (id) NOT DEFERRABLE INITIALLY IMMEDIATE
        )');
        $this->addSql('CREATE INDEX IDX_CF9A99E4C8344D33 ON avaliacao_respostas (participante_avaliacao_id)');
        $this->addSql('CREATE INDEX IDX_CF9A99E4D2B21BD1 ON avaliacao_respostas (questao_id)');
    }

    public function down(Schema $schema): void
    {
        // Drop all tables in reverse order
        $this->addSql('DROP TABLE avaliacao_respostas');
        $this->addSql('DROP TABLE participante_avaliacoes');
        $this->addSql('DROP TABLE avaliacao_parametros');
        $this->addSql('DROP TABLE status_aplicacao');
        $this->addSql('DROP TABLE questao_alternativas');
        $this->addSql('DROP TABLE avaliacao_questoes');
        $this->addSql('DROP TABLE questoes');
        $this->addSql('DROP TABLE status_questao');
        $this->addSql('DROP TABLE nivel_dificuldade');
        $this->addSql('DROP TABLE tipo_alternativa');
        $this->addSql('DROP TABLE questao_contexto');
        $this->addSql('DROP TABLE avaliacoes');
        $this->addSql('DROP TABLE disciplinas');
        $this->addSql('DROP TABLE status_avaliacao');
        $this->addSql('DROP TABLE tipo_avaliacao');
        $this->addSql('DROP TABLE usuarios');
    }
}
