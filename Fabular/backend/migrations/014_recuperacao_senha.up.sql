-- Tokens de recuperação de senha: uso único, com expiração.

SET NOCOUNT ON;
USE Fabular;
GO

IF OBJECT_ID(N'dbo.Recuperacao_Senha', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Recuperacao_Senha (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Id_Responsavel INT NOT NULL,
        TokenHash CHAR(64) NOT NULL,
        ExpiraEm DATETIME2 NOT NULL,
        UsadoEm DATETIME2 NULL,
        CriadoEm DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_RecuperacaoSenha_Responsavel
            FOREIGN KEY (Id_Responsavel) REFERENCES dbo.Responsavel (Id) ON DELETE CASCADE
    );

    CREATE UNIQUE INDEX UX_Recuperacao_Senha_TokenHash
        ON dbo.Recuperacao_Senha (TokenHash);
END
GO
