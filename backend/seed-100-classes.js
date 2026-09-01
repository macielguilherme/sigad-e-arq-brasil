const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'sigad.db');
const db = new sqlite3.Database(dbPath);

console.log('🌱 Inserindo 100 classes...');

// Função para executar queries
function runQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

async function seed100Classes() {
    try {
        // Limpa as classes antigas (opcional, mantém a RAIZ DO SISTEMA)
        await runQuery('DELETE FROM classes WHERE id != 1');

        // Lista de áreas/departamentos para variedade
        const areas = [
            'Administração', 'Finanças', 'Recursos Humanos', 'Tecnologia', 'Marketing',
            'Vendas', 'Logística', 'Produção', 'Jurídico', 'Auditoria',
            'Planejamento', 'Comunicação', 'Qualidade', 'Pesquisa', 'Inovação',
            'Educação', 'Saúde', 'Engenharia', 'Arquitetura', 'Consultoria'
        ];

        const atividades = [
            'Planejamento', 'Execução', 'Controle', 'Avaliação', 'Monitoramento',
            'Desenvolvimento', 'Implementação', 'Manutenção', 'Aquisição', 'Distribuição',
            'Comercialização', 'Gestão', 'Coordenação', 'Supervisão', 'Análise',
            'Prospecção', 'Negociação', 'Contratação', 'Fiscalização', 'Orientação'
        ];

        const complementos = [
            'Geral', 'Operacional', 'Estratégico', 'Tático', 'Corrente',
            'Intermediário', 'Permanente', 'Básico', 'Avançado', 'Especial'
        ];

        let classeId = 1;
        const classeMap = {};

        // 1. Criar 10 classes raiz (primeiro nível)
        console.log('📂 Criando 10 classes raiz...');
        for (let i = 0; i < 10; i++) {
            const codigo = String(i + 1).padStart(3, '0');
            const nome = areas[i % areas.length];
            
            const result = await runQuery(
                `INSERT INTO classes (nome, codigo, classe_pai_id, pode_classificar, ativa)
                 VALUES (?, ?, ?, ?, 1)`,
                [nome, codigo, null, 1]
            );
            const id = result.lastID;
            classeMap[codigo] = id;
            console.log(`   ✅ ${codigo} - ${nome}`);
        }

        // 2. Criar 30 subclasses (segundo nível)
        console.log('📂 Criando 30 subclasses...');
        for (let i = 0; i < 30; i++) {
            const raizIndex = i % 10;
            const raizCodigo = String(raizIndex + 1).padStart(3, '0');
            const raizId = classeMap[raizCodigo];
            
            const subNumero = Math.floor(i / 10) + 1;
            const codigo = `${raizCodigo}.${subNumero}`;
            const nome = `${areas[raizIndex]} - ${atividades[i % atividades.length]}`;
            
            const result = await runQuery(
                `INSERT INTO classes (nome, codigo, classe_pai_id, pode_classificar, ativa)
                 VALUES (?, ?, ?, ?, 1)`,
                [nome, codigo, raizId, 0]
            );
            const id = result.lastID;
            classeMap[codigo] = id;
            console.log(`   ✅ ${codigo} - ${nome}`);
        }

        // 3. Criar 60 sub-subclasses (terceiro nível)
        console.log('📂 Criando 60 sub-subclasses...');
        let subSubCount = 0;
        for (let i = 0; i < 60; i++) {
            const paiIndex = i % 30;
            let paiCodigo = '';
            let paiId = null;
            
            // Encontra um pai válido (subclasse)
            const subCodigos = Object.keys(classeMap).filter(k => k.includes('.'));
            if (subCodigos.length > 0) {
                paiCodigo = subCodigos[paiIndex % subCodigos.length];
                paiId = classeMap[paiCodigo];
            } else {
                // Fallback: usa uma classe raiz
                const raizCodigo = String((i % 10) + 1).padStart(3, '0');
                paiCodigo = raizCodigo;
                paiId = classeMap[raizCodigo];
            }
            
            const subSubNumero = String(i + 1).padStart(2, '0');
            const codigo = `${paiCodigo}.${subSubNumero}`;
            const nome = `${areas[i % areas.length]} ${complementos[i % complementos.length]}`;
            
            await runQuery(
                `INSERT INTO classes (nome, codigo, classe_pai_id, pode_classificar, ativa)
                 VALUES (?, ?, ?, ?, 1)`,
                [nome, codigo, paiId, 1]
            );
            subSubCount++;
            if (subSubCount % 10 === 0) {
                console.log(`   ✅ ${subSubCount} sub-subclasses inseridas...`);
            }
        }

        // 4. Verificar total
        const result = await runQuery('SELECT COUNT(*) as total FROM classes WHERE id != 1');
        console.log(`\n✅ ${result.total} classes inseridas com sucesso!`);
        console.log(`   - 10 classes raiz`);
        console.log(`   - 30 subclasses`);
        console.log(`   - 60 sub-subclasses`);
        console.log(`   - Total: ${result.total}`);

    } catch (err) {
        console.error('❌ Erro:', err.message);
    } finally {
        db.close();
    }
}

seed100Classes();