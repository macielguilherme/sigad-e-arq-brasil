const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'sigad.db');
const db = new sqlite3.Database(dbPath);

console.log('🌱 Populando banco com DADOS DE DEMONSTRAÇÃO...');

// Funções auxiliares
function gerarCPF() {
    return Math.floor(Math.random() * 99999999999).toString().padStart(11, '0');
}

function gerarDataAleatoria(anoInicio, anoFim) {
    const inicio = new Date(anoInicio, 0, 1);
    const fim = new Date(anoFim, 11, 31);
    return new Date(inicio.getTime() + Math.random() * (fim.getTime() - inicio.getTime()));
}

function gerarTexto(tipos) {
    return tipos[Math.floor(Math.random() * tipos.length)];
}

async function runQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

async function getQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

async function allQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

async function seedDemo() {
    try {
        // ==========================================
        // 1. OBTER CLASSES EXISTENTES
        // ==========================================
        const classes = await allQuery('SELECT id, codigo FROM classes WHERE id != 1 AND pode_classificar = 1 AND ativa = 1');
        console.log(`📂 ${classes.length} classes encontradas`);

        if (classes.length === 0) {
            console.log('❌ Nenhuma classe encontrada. Execute o seed.js primeiro!');
            return;
        }

        // ==========================================
        // 2. NOMES E DADOS FICTÍCIOS
        // ==========================================
        const nomes = [
            'João Silva', 'Maria Santos', 'Pedro Oliveira', 'Ana Costa', 'Carlos Ferreira',
            'Juliana Lima', 'Roberto Alves', 'Fernanda Souza', 'Ricardo Pereira', 'Patrícia Gomes',
            'Lucas Martins', 'Amanda Rodrigues', 'Bruno Carvalho', 'Camila Nunes', 'Daniel Rocha',
            'Elaine Barros', 'Fábio Correia', 'Gabriela Melo', 'Hugo Fernandes', 'Isabela Pinto',
            'Jéssica Monteiro', 'Kleber Araújo', 'Larissa Teixeira', 'Marcelo Freitas', 'Natália Figueiredo',
            'Otávio Cardoso', 'Priscila Moreira', 'Rafael Cavalcanti', 'Sabrina Campelo', 'Thiago Lopes'
        ];

        const departamentos = [
            'Recursos Humanos', 'Financeiro', 'Compras', 'Logística', 'Tecnologia',
            'Marketing', 'Vendas', 'Produção', 'Qualidade', 'Pesquisa e Desenvolvimento',
            'Administração', 'Jurídico', 'Auditoria', 'Planejamento', 'Comunicação'
        ];

        const tiposDocumentos = [
            'Relatório', 'Ofício', 'Memorando', 'Parecer', 'Projeto', 'Declaração',
            'Contrato', 'Processo', 'Portaria', 'Resolução', 'Ata', 'Carta',
            'Edital', 'Nota Técnica', 'Despacho', 'Instrução Normativa', 'Guia'
        ];

        const assuntos = [
            'Gestão de Pessoas', 'Orçamento', 'Contratação', 'Capacitação', 'Infraestrutura',
            'Desenvolvimento', 'Inovação', 'Qualidade', 'Eficiência', 'Transparência',
            'Governança', 'Compliance', 'Riscos', 'Estratégia', 'Resultados'
        ];

        const palavras = [
            'gestão', 'administração', 'controle', 'qualidade', 'processo',
            'documentação', 'arquivamento', 'classificação', 'temporalidade', 'avaliação',
            'planejamento', 'execução', 'monitoramento', 'resultados', 'metas'
        ];

        const empresas = [
            'Empresa Alpha', 'Corporação Beta', 'Grupo Gama', 'Consultoria Delta',
            'Indústria Epsilon', 'Comércio Zeta', 'Serviços Eta', 'Tecnologia Theta',
            'Logística Iota', 'Financeira Kappa'
        ];

        // ==========================================
        // 3. CRIAR 200 DOCUMENTOS FICTÍCIOS
        // ==========================================
        console.log('📄 Inserindo 200 documentos de demonstração...');

        const stmtDoc = db.prepare(`
            INSERT INTO documentos (
                classe_id, identificador, titulo, descricao, autor, 
                data_producao, numero_documento, localizacao, palavras_chave,
                status_documento, tipo_meio, versao, interessado, destinatario,
                originador, redator, unidade_responsavel
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        let docCount = 0;
        const docIds = [];

        for (let i = 1; i <= 200; i++) {
            const classe = classes[Math.floor(Math.random() * classes.length)];
            const nome = nomes[Math.floor(Math.random() * nomes.length)];
            const ano = Math.floor(Math.random() * 5) + 2020;
            const data = gerarDataAleatoria(ano, ano + 1);
            const tipo = gerarTexto(tiposDocumentos);
            const assunto = gerarTexto(assuntos);
            const depto = gerarTexto(departamentos);

            // Gera título interessante
            const titulo = `${tipo} ${i} - ${assunto} (${depto}) ${data.getFullYear()}`;

            const descricao = `Documento fictício de demonstração. ${assunto} da área de ${depto}.`;

            const palavrasChave = `${assunto.toLowerCase()}, ${depto.toLowerCase()}, ${palavras.slice(0, 3).join(', ')}`;

            const identificador = `DEMO-${data.getFullYear()}-${String(i).padStart(4, '0')}`;

            const dataStr = data.toISOString().split('T')[0];

            // Determina status
            const statusOptions = ['original', 'original', 'original', 'minuta', 'copia'];
            const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];

            // Determina tipo de meio
            const meio = Math.random() > 0.7 ? 'hibrido' : 'digital';

            // Número do documento
            const numDoc = `${String(i).padStart(4, '0')}/${data.getFullYear()}`;

            stmtDoc.run(
                classe.id,
                identificador,
                titulo,
                descricao,
                nome,
                dataStr,
                numDoc,
                `Gaveta ${Math.floor(Math.random() * 20) + 1}, Pasta ${Math.floor(Math.random() * 100) + 1}`,
                palavrasChave,
                status,
                meio,
                '1.0',
                empresas[Math.floor(Math.random() * empresas.length)],
                nome,
                'Sistema SIGAD',
                nome,
                depto
            );

            docCount++;
            const docId = this.lastID;
            docIds.push(docId);

            if (docCount % 10 === 0) {
                console.log(`   ✅ ${docCount} documentos inseridos...`);
            }
        }

        stmtDoc.finalize();
        console.log(`✅ ${docCount} documentos inseridos com sucesso!`);

        // ==========================================
        // 4. CRIAR COMPONENTES PARA OS DOCUMENTOS
        // ==========================================
        console.log('📎 Inserindo componentes digitais...');

        const stmtComp = db.prepare(`
            INSERT INTO componentes_digitais (documento_id, nome, formato, tamanho, nivel_composicao)
            VALUES (?, ?, ?, ?, ?)
        `);

        const formatos = ['pdf', 'docx', 'xlsx', 'pptx', 'jpg', 'png', 'txt', 'html', 'zip'];

        let compCount = 0;
        for (const docId of docIds) {
            // Cada documento tem 1-3 componentes
            const numComponentes = Math.floor(Math.random() * 3) + 1;
            for (let j = 0; j < numComponentes; j++) {
                const formato = formatos[Math.floor(Math.random() * formatos.length)];
                const nome = `documento_${docId}_${j + 1}.${formato}`;
                const tamanho = Math.floor(Math.random() * 5000000) + 10000;
                const nivel = Math.random() > 0.8 ? 1 : 0;

                stmtComp.run(docId, nome, formato, tamanho, nivel);
                compCount++;
            }
        }

        stmtComp.finalize();
        console.log(`✅ ${compCount} componentes inseridos!`);

        // ==========================================
        // 5. CRIAR REFERÊNCIAS CRUZADAS
        // ==========================================
        console.log('🔗 Inserindo referências cruzadas...');

        const stmtRef = db.prepare(`
            INSERT INTO referencias_cruzadas (documento_origem_id, documento_destino_id, tipo_relacao)
            VALUES (?, ?, ?)
        `);

        const tiposRef = ['relacionado', 'referencia', 'anexo', 'complementar'];

        let refCount = 0;
        for (let i = 0; i < Math.min(docIds.length, 100); i++) {
            const origem = docIds[i];
            // Pega 1-3 destinos aleatórios
            const numRefs = Math.floor(Math.random() * 3) + 1;
            for (let j = 0; j < numRefs; j++) {
                let destino = docIds[Math.floor(Math.random() * docIds.length)];
                if (destino === origem) continue;
                const tipo = tiposRef[Math.floor(Math.random() * tiposRef.length)];

                try {
                    stmtRef.run(origem, destino, tipo);
                    refCount++;
                } catch (e) { }
            }
        }

        stmtRef.finalize();
        console.log(`✅ ${refCount} referências cruzadas inseridas!`);

        // ==========================================
        // 6. ATUALIZAR CONTAGEM DE PRAZOS
        // ==========================================
        console.log('⏰ Atualizando contagem de prazos...');

        // Buscar temporalidades
        const temporalidades = await allQuery('SELECT classe_id, prazo_corrente, prazo_intermediaria FROM temporalidade');

        const stmtContagem = db.prepare(`
            INSERT OR REPLACE INTO contagem_prazos (classe_id, documento_id, prazo_corrente, prazo_intermediaria, data_inicio, status)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        let contagemCount = 0;
        for (const docId of docIds) {
            const doc = await getQuery('SELECT classe_id FROM documentos WHERE id = ?', [docId]);
            if (doc) {
                const temp = temporalidades.find(t => t.classe_id === doc.classe_id);
                if (temp) {
                    const dataInicio = gerarDataAleatoria(2022, 2025);
                    const status = Math.random() > 0.3 ? 'em_andamento' : 'concluido';
                    stmtContagem.run(
                        doc.classe_id,
                        docId,
                        temp.prazo_corrente || 12,
                        temp.prazo_intermediaria || 24,
                        dataInicio.toISOString().split('T')[0],
                        status
                    );
                    contagemCount++;
                }
            }
        }

        stmtContagem.finalize();
        console.log(`✅ ${contagemCount} contagens de prazos atualizadas!`);

        // ==========================================
        // 7. RESUMO FINAL
        // ==========================================
        console.log('');
        console.log('📊 RESUMO DA DEMONSTRAÇÃO:');
        console.log(`   - ${docCount} documentos inseridos`);
        console.log(`   - ${compCount} componentes digitais`);
        console.log(`   - ${refCount} referências cruzadas`);
        console.log(`   - ${contagemCount} contagens de prazos`);
        console.log('');
        console.log('🎉 BANCO DE DADOS POPULADO COM DADOS DE DEMONSTRAÇÃO!');

    } catch (err) {
        console.error('❌ Erro:', err.message);
    } finally {
        db.close();
    }
}

seedDemo();