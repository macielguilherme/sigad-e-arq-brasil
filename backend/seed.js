const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'sigad.db');
const db = new sqlite3.Database(dbPath);

console.log('🌱 Populando banco de dados com dados de exemplo...');

// Função para executar queries em sequência
function runQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

function getQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

function allQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

async function seed() {
    try {
        // ==========================================
        // 1. LIMPAR DADOS EXISTENTES
        // ==========================================
        console.log('🗑️ Limpando dados existentes...');

        await runQuery('DELETE FROM documentos');
        await runQuery('DELETE FROM componentes_digitais');
        await runQuery('DELETE FROM temporalidade');
        await runQuery('DELETE FROM classes_metadados');
        await runQuery('DELETE FROM classes_historico');
        await runQuery('DELETE FROM reclassificacao_historico');
        await runQuery('DELETE FROM referencias_cruzadas');
        await runQuery('DELETE FROM tesauro');
        await runQuery('DELETE FROM captura_workflow');
        await runQuery('DELETE FROM contagem_prazos');
        await runQuery('DELETE FROM temporalidade_historico');
        await runQuery('DELETE FROM classes WHERE id != 1');

        // ==========================================
        // 2. CLASSES
        // ==========================================
        console.log('📂 Inserindo classes...');

        const classes = [
            { nome: 'Administração Geral', codigo: '010', pai: null, pode_classificar: 1 },
            { nome: 'Planejamento', codigo: '011', pai: '010', pode_classificar: 0 },
            { nome: 'Plano de Desenvolvimento', codigo: '011.1', pai: '011', pode_classificar: 1 },
            { nome: 'Relatórios de Gestão', codigo: '011.2', pai: '011', pode_classificar: 1 },

            { nome: 'Recursos Humanos', codigo: '020', pai: null, pode_classificar: 1 },
            { nome: 'Recrutamento e Seleção', codigo: '021', pai: '020', pode_classificar: 0 },
            { nome: 'Candidatos a Cargo Público', codigo: '021.1', pai: '021', pode_classificar: 1 },
            { nome: 'Exames de Seleção', codigo: '021.2', pai: '021', pode_classificar: 1 },
            { nome: 'Cadastro de Funcionários', codigo: '022', pai: '020', pode_classificar: 1 },
            { nome: 'Frequência e Ponto', codigo: '023', pai: '020', pode_classificar: 1 },
            { nome: 'Treinamento e Capacitação', codigo: '024', pai: '020', pode_classificar: 1 },

            { nome: 'Material e Patrimônio', codigo: '030', pai: null, pode_classificar: 1 },
            { nome: 'Aquisição de Material', codigo: '031', pai: '030', pode_classificar: 0 },
            { nome: 'Material de Consumo', codigo: '031.1', pai: '031', pode_classificar: 1 },
            { nome: 'Material Permanente', codigo: '031.2', pai: '031', pode_classificar: 1 },
            { nome: 'Patrimônio', codigo: '032', pai: '030', pode_classificar: 1 },

            { nome: 'Financeiro', codigo: '040', pai: null, pode_classificar: 1 },
            { nome: 'Orçamento', codigo: '041', pai: '040', pode_classificar: 1 },
            { nome: 'Contabilidade', codigo: '042', pai: '040', pode_classificar: 1 },
            { nome: 'Prestação de Contas', codigo: '043', pai: '040', pode_classificar: 1 },

            { nome: 'Serviços', codigo: '100', pai: null, pode_classificar: 1 },
            { nome: 'Atendimento ao Público', codigo: '101', pai: '100', pode_classificar: 1 },
            { nome: 'Serviços Online', codigo: '102', pai: '100', pode_classificar: 1 },
            { nome: 'Projetos', codigo: '110', pai: null, pode_classificar: 1 },
            { nome: 'Projetos em Andamento', codigo: '111', pai: '110', pode_classificar: 1 },
            { nome: 'Projetos Concluídos', codigo: '112', pai: '110', pode_classificar: 1 },
            { nome: 'Pesquisa e Desenvolvimento', codigo: '113', pai: '110', pode_classificar: 1 },
        ];

        const classeMap = {};

        // Inserir classes uma por uma em sequência
        for (const c of classes) {
            let paiId = null;
            if (c.pai && classeMap[c.pai]) {
                paiId = classeMap[c.pai];
            }

            const result = await runQuery(
                `INSERT INTO classes (nome, codigo, classe_pai_id, pode_classificar, ativa)
                 VALUES (?, ?, ?, ?, 1)`,
                [c.nome, c.codigo, paiId, c.pode_classificar]
            );
            classeMap[c.codigo] = result.lastID;
            console.log(`   ✅ Classe inserida: ${c.codigo} - ${c.nome}`);
        }

        // ==========================================
        // 3. TEMPORALIDADES
        // ==========================================
        console.log('⏰ Inserindo temporalidades...');

        const temporalidades = [
            { codigo: '010', prazo_corrente: 24, evento_corrente: 'arquivamento', prazo_intermediaria: 60, evento_intermediaria: 'transferencia', destinacao: 'preservacao' },
            { codigo: '011.1', prazo_corrente: 12, evento_corrente: 'aprovacao', prazo_intermediaria: 36, evento_intermediaria: 'conclusao', destinacao: 'preservacao' },
            { codigo: '011.2', prazo_corrente: 18, evento_corrente: 'publicacao', prazo_intermediaria: 48, evento_intermediaria: 'transferencia', destinacao: 'eliminacao' },
            { codigo: '021.1', prazo_corrente: 6, evento_corrente: 'arquivamento', prazo_intermediaria: 12, evento_intermediaria: 'transferencia', destinacao: 'eliminacao' },
            { codigo: '021.2', prazo_corrente: 12, evento_corrente: 'conclusao', prazo_intermediaria: 24, evento_intermediaria: 'transferencia', destinacao: 'eliminacao' },
            { codigo: '022', prazo_corrente: 0, evento_corrente: 'fim_vigencia', prazo_intermediaria: 120, evento_intermediaria: 'transferencia', destinacao: 'preservacao' },
            { codigo: '023', prazo_corrente: 6, evento_corrente: 'arquivamento', prazo_intermediaria: 12, evento_intermediaria: 'transferencia', destinacao: 'eliminacao' },
            { codigo: '024', prazo_corrente: 12, evento_corrente: 'conclusao', prazo_intermediaria: 24, evento_intermediaria: 'transferencia', destinacao: 'eliminacao' },
            { codigo: '031.1', prazo_corrente: 12, evento_corrente: 'arquivamento', prazo_intermediaria: 24, evento_intermediaria: 'transferencia', destinacao: 'eliminacao' },
            { codigo: '031.2', prazo_corrente: 24, evento_corrente: 'arquivamento', prazo_intermediaria: 60, evento_intermediaria: 'transferencia', destinacao: 'eliminacao' },
            { codigo: '032', prazo_corrente: 12, evento_corrente: 'arquivamento', prazo_intermediaria: 36, evento_intermediaria: 'transferencia', destinacao: 'eliminacao' },
            { codigo: '041', prazo_corrente: 24, evento_corrente: 'aprovacao', prazo_intermediaria: 60, evento_intermediaria: 'transferencia', destinacao: 'preservacao' },
            { codigo: '042', prazo_corrente: 36, evento_corrente: 'encerramento', prazo_intermediaria: 96, evento_intermediaria: 'transferencia', destinacao: 'preservacao' },
            { codigo: '043', prazo_corrente: 12, evento_corrente: 'aprovacao', prazo_intermediaria: 36, evento_intermediaria: 'transferencia', destinacao: 'eliminacao' },
            { codigo: '101', prazo_corrente: 6, evento_corrente: 'arquivamento', prazo_intermediaria: 12, evento_intermediaria: 'transferencia', destinacao: 'eliminacao' },
            { codigo: '102', prazo_corrente: 6, evento_corrente: 'arquivamento', prazo_intermediaria: 12, evento_intermediaria: 'transferencia', destinacao: 'eliminacao' },
            { codigo: '111', prazo_corrente: 24, evento_corrente: 'arquivamento', prazo_intermediaria: 48, evento_intermediaria: 'transferencia', destinacao: 'preservacao' },
            { codigo: '112', prazo_corrente: 12, evento_corrente: 'conclusao', prazo_intermediaria: 24, evento_intermediaria: 'transferencia', destinacao: 'eliminacao' },
            { codigo: '113', prazo_corrente: 12, evento_corrente: 'arquivamento', prazo_intermediaria: 36, evento_intermediaria: 'transferencia', destinacao: 'preservacao' },
        ];

        let tempCount = 0;
        for (const t of temporalidades) {
            const classeId = classeMap[t.codigo];
            if (classeId) {
                await runQuery(
                    `INSERT INTO temporalidade (classe_id, prazo_corrente, evento_corrente, prazo_intermediaria, evento_intermediaria, destinacao_final)
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [classeId, t.prazo_corrente, t.evento_corrente, t.prazo_intermediaria, t.evento_intermediaria, t.destinacao]
                );
                tempCount++;
                console.log(`   ✅ Temporalidade inserida: ${t.codigo}`);
            }
        }

        // ==========================================
        // 4. TESAURO
        // ==========================================
        console.log('📚 Inserindo tesauro...');

        const tesauro = [
            { termo: 'Administração', definicao: 'Atividades de gestão e direção' },
            { termo: 'Recursos Humanos', definicao: 'Gestão de pessoas e equipes' },
            { termo: 'Recrutamento', definicao: 'Processo de seleção de candidatos' },
            { termo: 'Seleção', definicao: 'Escolha de candidatos para vagas' },
            { termo: 'Treinamento', definicao: 'Capacitação e desenvolvimento de pessoal' },
            { termo: 'Capacitação', definicao: 'Processo de qualificação profissional' },
            { termo: 'Financeiro', definicao: 'Atividades financeiras e contábeis' },
            { termo: 'Orçamento', definicao: 'Planejamento financeiro e alocação de recursos' },
            { termo: 'Contabilidade', definicao: 'Registro e controle financeiro' },
            { termo: 'Compras', definicao: 'Aquisição de bens e serviços' },
            { termo: 'Licitação', definicao: 'Processo formal de contratação pública' },
            { termo: 'Contratos', definicao: 'Acordos e convênios formais' },
            { termo: 'Patrimônio', definicao: 'Bens e equipamentos da instituição' },
            { termo: 'Tecnologia', definicao: 'Sistemas e infraestrutura tecnológica' },
            { termo: 'Documentos', definicao: 'Gestão documental e arquivística' },
            { termo: 'Arquivo', definicao: 'Guarda e preservação de documentos' },
            { termo: 'Processo', definicao: 'Conjunto de documentos de uma ação administrativa' },
            { termo: 'Projeto', definicao: 'Iniciativa com objetivos definidos' },
            { termo: 'Pesquisa', definicao: 'Atividades de investigação e desenvolvimento' },
            { termo: 'Relatório', definicao: 'Documento que apresenta resultados e análises' },
        ];

        for (const t of tesauro) {
            await runQuery(
                `INSERT INTO tesauro (termo, definicao, ativo)
                 VALUES (?, ?, 1)`,
                [t.termo, t.definicao]
            );
        }
        console.log(`   ✅ ${tesauro.length} termos inseridos`);

        // ==========================================
        // 5. DOCUMENTOS E COMPONENTES
        // ==========================================
        console.log('📄 Inserindo documentos e componentes...');

        const documentos = [
            {
                classe_codigo: '011.1',
                titulo: 'Plano de Desenvolvimento Institucional 2024-2028',
                descricao: 'Plano estratégico para o desenvolvimento da instituição',
                autor: 'Comitê de Planejamento',
                data: '2024-01-15',
                numero: 'PDI-001/2024',
                localizacao: 'Gaveta 01, Pasta 01',
                palavras_chave: 'planejamento, desenvolvimento, estratégia',
                componentes: ['plano_institucional.pdf', 'anexos_plano.zip']
            },
            {
                classe_codigo: '011.2',
                titulo: 'Relatório de Gestão 2024',
                descricao: 'Relatório anual de atividades e resultados',
                autor: 'Diretoria Executiva',
                data: '2024-12-31',
                numero: 'RG-2024',
                localizacao: 'Gaveta 02, Pasta 01',
                palavras_chave: 'gestão, relatório, resultados',
                componentes: ['relatorio_2024.pdf', 'dados_consolidados.xlsx']
            },
            {
                classe_codigo: '021.1',
                titulo: 'Concurso Público 2024 - Edital 001',
                descricao: 'Edital para provimento de cargos públicos',
                autor: 'Comissão de Concurso',
                data: '2024-03-10',
                numero: 'CP-001/2024',
                localizacao: 'Gaveta 03, Pasta 01',
                palavras_chave: 'concurso, edital, seleção',
                componentes: ['edital_2024.pdf', 'anexos_edital.pdf']
            },
            {
                classe_codigo: '021.2',
                titulo: 'Resultado Final - Concurso 2024',
                descricao: 'Lista de aprovados no concurso público',
                autor: 'Comissão de Concurso',
                data: '2024-06-20',
                numero: 'CP-2024-FINAL',
                localizacao: 'Gaveta 03, Pasta 02',
                palavras_chave: 'resultado, concurso, aprovados',
                componentes: ['resultado_final.pdf', 'lista_aprovados.xlsx']
            },
            {
                classe_codigo: '022',
                titulo: 'Ficha Funcional - João Silva',
                descricao: 'Registro de dados funcionais do servidor',
                autor: 'Departamento de RH',
                data: '2020-01-01',
                numero: 'FF-00001',
                localizacao: 'Gaveta 04, Pasta 01',
                palavras_chave: 'funcional, servidor, cadastro',
                componentes: ['ficha_funcional.pdf']
            },
            {
                classe_codigo: '023',
                titulo: 'Registro de Frequência - Janeiro 2025',
                descricao: 'Controle de frequência dos servidores',
                autor: 'Departamento de RH',
                data: '2025-01-31',
                numero: 'RF-2025-01',
                localizacao: 'Gaveta 04, Pasta 02',
                palavras_chave: 'frequência, ponto, servidores',
                componentes: ['frequencia_2025_01.xlsx']
            },
            {
                classe_codigo: '024',
                titulo: 'Plano de Treinamento 2025',
                descricao: 'Programa de capacitação para servidores',
                autor: 'Departamento de RH',
                data: '2025-01-10',
                numero: 'PT-2025-001',
                localizacao: 'Gaveta 04, Pasta 03',
                palavras_chave: 'treinamento, capacitação, desenvolvimento',
                componentes: ['plano_treinamento_2025.pdf', 'programacao.xlsx']
            },
            {
                classe_codigo: '031.1',
                titulo: 'Processo de Compra - Material de Escritório',
                descricao: 'Aquisição de material de expediente',
                autor: 'Setor de Compras',
                data: '2024-11-15',
                numero: 'PC-2024-045',
                localizacao: 'Gaveta 05, Pasta 01',
                palavras_chave: 'compra, material, escritório',
                componentes: ['pedido_045.pdf', 'nota_fiscal.pdf']
            },
            {
                classe_codigo: '031.2',
                titulo: 'Processo de Aquisição de Equipamentos',
                descricao: 'Compra de equipamentos de informática',
                autor: 'Setor de Compras',
                data: '2024-09-20',
                numero: 'PC-2024-032',
                localizacao: 'Gaveta 05, Pasta 02',
                palavras_chave: 'aquisição, equipamentos, informática',
                componentes: ['edital_032.pdf', 'propostas_comerciais.pdf']
            },
            {
                classe_codigo: '032',
                titulo: 'Inventário Patrimonial 2024',
                descricao: 'Levantamento de bens e equipamentos',
                autor: 'Departamento de Patrimônio',
                data: '2024-12-20',
                numero: 'IP-2024',
                localizacao: 'Gaveta 06, Pasta 01',
                palavras_chave: 'inventário, patrimônio, bens',
                componentes: ['inventario_2024.pdf', 'planilha_controle.xlsx']
            },
            {
                classe_codigo: '041',
                titulo: 'Lei Orçamentária 2025',
                descricao: 'Lei de diretrizes orçamentárias',
                autor: 'Secretaria de Finanças',
                data: '2024-12-31',
                numero: 'LO-2025',
                localizacao: 'Gaveta 07, Pasta 01',
                palavras_chave: 'orçamento, finanças, lei',
                componentes: ['lei_orcamentaria_2025.pdf']
            },
            {
                classe_codigo: '042',
                titulo: 'Balanço Patrimonial 2024',
                descricao: 'Balanço financeiro e contábil',
                autor: 'Departamento Contábil',
                data: '2025-02-15',
                numero: 'BP-2024',
                localizacao: 'Gaveta 07, Pasta 02',
                palavras_chave: 'balanço, contabilidade, patrimonial',
                componentes: ['balanco_2024.pdf', 'notas_explicativas.pdf']
            },
            {
                classe_codigo: '043',
                titulo: 'Prestação de Contas 2024',
                descricao: 'Relatório de prestação de contas anual',
                autor: 'Controle Interno',
                data: '2025-03-01',
                numero: 'PC-2024',
                localizacao: 'Gaveta 07, Pasta 03',
                palavras_chave: 'prestação, contas, controle',
                componentes: ['prestacao_contas_2024.pdf']
            },
            {
                classe_codigo: '101',
                titulo: 'Protocolo de Atendimento ao Público',
                descricao: 'Manual de procedimentos para atendimento',
                autor: 'Ouvidoria',
                data: '2024-01-01',
                numero: 'PAP-001',
                localizacao: 'Gaveta 08, Pasta 01',
                palavras_chave: 'atendimento, protocolo, público',
                componentes: ['manual_atendimento.pdf']
            },
            {
                classe_codigo: '102',
                titulo: 'Relatório de Serviços Online 2024',
                descricao: 'Análise de serviços prestados digitalmente',
                autor: 'TI',
                data: '2024-12-15',
                numero: 'RSO-2024',
                localizacao: 'Gaveta 08, Pasta 02',
                palavras_chave: 'serviços, online, digital',
                componentes: ['relatorio_servicos_online.pdf']
            },
            {
                classe_codigo: '111',
                titulo: 'Projeto de Modernização Administrativa',
                descricao: 'Projeto para modernização de processos',
                autor: 'Gerência de Projetos',
                data: '2024-02-01',
                numero: 'PMA-001',
                localizacao: 'Gaveta 09, Pasta 01',
                palavras_chave: 'modernização, projetos, administrativo',
                componentes: ['projeto_modernizacao.pdf', 'cronograma.xlsx']
            },
            {
                classe_codigo: '112',
                titulo: 'Projeto de Implantação de SIGAD',
                descricao: 'Relatório final do projeto de implantação',
                autor: 'Gerência de Projetos',
                data: '2024-06-30',
                numero: 'PSIGAD-001',
                localizacao: 'Gaveta 09, Pasta 02',
                palavras_chave: 'implantação, SIGAD, final',
                componentes: ['relatorio_implantacao.pdf', 'apresentacao_final.pptx']
            },
            {
                classe_codigo: '113',
                titulo: 'Pesquisa sobre Gestão Documental',
                descricao: 'Estudo sobre práticas de gestão documental',
                autor: 'Núcleo de Pesquisa',
                data: '2024-08-15',
                numero: 'PGD-2024',
                localizacao: 'Gaveta 10, Pasta 01',
                palavras_chave: 'pesquisa, gestão, documental',
                componentes: ['pesquisa_gestao_documental.pdf', 'dados_pesquisa.xlsx']
            },
        ];

        let docCount = 0;
        for (const doc of documentos) {
            const classeId = classeMap[doc.classe_codigo];
            if (!classeId) {
                console.log(`   ⚠️ Classe não encontrada: ${doc.classe_codigo}`);
                continue;
            }

            const id = 'DOC-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);

            const result = await runQuery(
                `INSERT INTO documentos (
                    classe_id, identificador, titulo, descricao, autor, 
                    data_producao, numero_documento, localizacao, palavras_chave,
                    status_documento, tipo_meio, versao
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'original', 'digital', '1.0')`,
                [classeId, id, doc.titulo, doc.descricao, doc.autor,
                    doc.data, doc.numero, doc.localizacao, doc.palavras_chave]
            );
            const docId = result.lastID;
            docCount++;

            // Componentes
            if (doc.componentes) {
                for (const nome of doc.componentes) {
                    const formato = nome.split('.').pop() || 'pdf';
                    await runQuery(
                        `INSERT INTO componentes_digitais (documento_id, nome, formato, tamanho, nivel_composicao)
                         VALUES (?, ?, ?, ?, ?)`,
                        [docId, nome, formato, Math.floor(Math.random() * 1000000) + 10000, 0]
                    );
                }
            }

            // Contagem de prazos
            const temp = temporalidades.find(t => t.codigo === doc.classe_codigo);
            if (temp) {
                await runQuery(
                    `INSERT INTO contagem_prazos (classe_id, documento_id, prazo_corrente, prazo_intermediaria, data_inicio)
                     VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
                    [classeId, docId, temp.prazo_corrente, temp.prazo_intermediaria]
                );
            }
            console.log(`   ✅ Documento inserido: ${doc.titulo}`);
        }

        // ==========================================
        // 6. METADADOS DAS CLASSES
        // ==========================================
        console.log('📋 Inserindo metadados das classes...');

        const metadados = [
            { codigo: '010', meta: { observacoes: 'Classe principal de administração', responsavel: 'Diretoria Geral', unidade: 'Administração Central' } },
            { codigo: '020', meta: { observacoes: 'Gestão de pessoas e recursos humanos', responsavel: 'Departamento de RH', unidade: 'Recursos Humanos' } },
            { codigo: '030', meta: { observacoes: 'Controle de material e patrimônio', responsavel: 'Departamento de Logística', unidade: 'Material e Patrimônio' } },
            { codigo: '040', meta: { observacoes: 'Gestão financeira e orçamentária', responsavel: 'Secretaria de Finanças', unidade: 'Financeiro' } },
            { codigo: '100', meta: { observacoes: 'Serviços prestados à comunidade', responsavel: 'Diretoria de Serviços', unidade: 'Serviços' } },
        ];

        for (const m of metadados) {
            const classeId = classeMap[m.codigo];
            if (classeId) {
                await runQuery(
                    `INSERT INTO classes_metadados (classe_id, metadados_json)
                     VALUES (?, ?)`,
                    [classeId, JSON.stringify(m.meta)]
                );
                console.log(`   ✅ Metadados inseridos: ${m.codigo}`);
            }
        }

        // ==========================================
        // FINAL
        // ==========================================
        console.log('✅ Banco de dados populado com sucesso!');
        console.log(`📊 Resumo:`);
        console.log(`   - ${Object.keys(classeMap).length} classes`);
        console.log(`   - ${tempCount} temporalidades`);
        console.log(`   - ${docCount} documentos`);
        console.log(`   - ${tesauro.length} termos no tesauro`);
        console.log(`   - ${metadados.length} metadados de classes`);
        console.log('🚀 Sistema pronto para uso!');

    } catch (err) {
        console.error('❌ Erro:', err.message);
    } finally {
        db.close((err) => {
            if (err) console.error('Erro ao fechar banco:', err);
            else console.log('🔒 Banco fechado com sucesso');
        });
    }
}

// Executa o seed
seed();