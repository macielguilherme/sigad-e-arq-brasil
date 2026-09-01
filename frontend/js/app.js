const API_URL = 'https://sigad-backend.onrender.com/api';
let currentModule = 'dashboard';
let classesCache = [];
let componentesCaptura = [];
let lotePreview = [];
let emailAnexos = [];

// ============================================
// ROTEAMENTO ENTRE MODULOS
// ============================================

document.addEventListener('DOMContentLoaded', function () {
    const toggleBtn = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    overlay.id = 'sidebar-overlay';
    document.body.appendChild(overlay);

    toggleBtn.addEventListener('click', function () {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
    });

    overlay.addEventListener('click', function () {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
    });

    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const module = this.dataset.module;
            if (module) {
                carregarModulo(module);
                sidebar.classList.remove('open');
                overlay.classList.remove('active');
                document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });

    // Carrega o Dashboard como módulo inicial
    carregarModulo('dashboard');
});

function carregarModulo(module) {
    currentModule = module;
    const container = document.getElementById('module-container');

    // Remove active de todos os links
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));

    // Adiciona active no link correspondente
    document.querySelectorAll('.sidebar-link').forEach(l => {
        if (l.dataset.module === module) {
            l.classList.add('active');
        }
    });

    switch (module) {
        case 'dashboard': renderDashboard(container); break;
        case 'classificacao': renderClassificacao(container); break;
        case 'temporalidade': renderTemporalidade(container); break;
        case 'documentos': renderDocumentos(container); break;
        case 'captura': renderCaptura(container); break;
        case 'captura-lote': renderCapturaLote(container); break;
        case 'captura-email': renderCapturaEmail(container); break;
        case 'pesquisa': renderPesquisa(container); break;
        case 'usuarios': renderUsuarios(container); break;
        case 'auditoria': renderAuditoria(container); break;
        case 'relatorios': renderRelatorios(container); break;
        default: container.innerHTML = '<p>Modulo nao encontrado</p>';
    }

    // Atualiza badges depois de carregar o módulo
    setTimeout(atualizarTodosBadges, 500);
}

// ============================================
// ATUALIZAR TODOS OS BADGES
// ============================================

async function atualizarTodosBadges() {
    try {
        const respClasses = await fetch(`${API_URL}/classes`);
        const classes = await respClasses.json();
        const countClasses = document.getElementById('sidebar-count');
        if (countClasses) {
            countClasses.textContent = classes.filter(c => c.id !== 1).length;
        }

        const respTemp = await fetch(`${API_URL}/temporalidades`);
        const temps = await respTemp.json();
        const countTemp = document.getElementById('sidebar-temp-count');
        if (countTemp) {
            countTemp.textContent = temps.filter(t => t.temporalidade_id).length;
        }

        const respDocs = await fetch(`${API_URL}/documentos`);
        const docs = await respDocs.json();
        const countDoc = document.getElementById('sidebar-doc-count');
        if (countDoc) {
            countDoc.textContent = Array.isArray(docs) ? docs.length : 0;
        }

        const respCaptura = await fetch(`${API_URL}/captura`);
        const captura = await respCaptura.json();
        const countCaptura = document.getElementById('sidebar-captura-count');
        if (countCaptura) {
            countCaptura.textContent = Array.isArray(captura) ? captura.length : 0;
        }

        await atualizarBadgeLote();
        await atualizarBadgeEmail();

    } catch (e) {
        console.log('Erro ao atualizar badges:', e);
    }
}

async function atualizarBadgeLote() {
    try {
        const resp = await fetch(`${API_URL}/captura`);
        const docs = await resp.json();
        const loteDocs = docs.filter(d => d.identificador && d.identificador.startsWith('LOTE-'));
        const badge = document.getElementById('sidebar-lote-count');
        if (badge) {
            badge.textContent = loteDocs.length;
        }
    } catch (e) {
        console.log('Erro ao atualizar badge lote:', e);
    }
}

async function atualizarBadgeEmail() {
    try {
        const resp = await fetch(`${API_URL}/captura/emails`);
        const emails = await resp.json();
        const badge = document.getElementById('sidebar-email-count');
        if (badge) {
            badge.textContent = Array.isArray(emails) ? emails.length : 0;
        }
    } catch (e) {
        console.log('Erro ao atualizar badge email:', e);
    }
}

// ============================================
// DASHBOARD
// ============================================

function renderDashboard(container) {
    container.innerHTML = `
        <div class="module-header">
            <h1>Dashboard</h1>
            <span style="font-size:14px;color:var(--color-text-secondary);">Visao geral do sistema</span>
        </div>
        <div class="dashboard-grid">
            <div class="dashboard-card">
                <div class="card-label">Classes</div>
                <div class="card-value" id="dash-total">0</div>
                <div class="card-change">Total cadastradas</div>
            </div>
            <div class="dashboard-card">
                <div class="card-label">Ativas</div>
                <div class="card-value" id="dash-ativas">0</div>
                <div class="card-change" style="color:var(--color-success);">Disponiveis</div>
            </div>
            <div class="dashboard-card">
                <div class="card-label">Inativas</div>
                <div class="card-value" id="dash-inativas">0</div>
                <div class="card-change negative">Arquivadas</div>
            </div>
            <div class="dashboard-card">
                <div class="card-label">Documentos</div>
                <div class="card-value" id="dash-documentos">0</div>
                <div class="card-change">Total de documentos</div>
            </div>
            <div class="dashboard-card">
                <div class="card-label">Capturados</div>
                <div class="card-value" id="dash-capturados">0</div>
                <div class="card-change">Documentos capturados</div>
            </div>
            <div class="dashboard-card">
                <div class="card-label">Temporalidades</div>
                <div class="card-value" id="dash-temporalidades">0</div>
                <div class="card-change">Configuradas</div>
            </div>
        </div>
        <div style="background:var(--color-primary-bg);border-radius:12px;padding:24px;border:1px solid var(--color-bg);">
            <h3 style="font-size:14px;font-weight:500;color:var(--color-text-secondary);margin-bottom:8px;">Bem-vindo ao AgitaDocs</h3>
            <p style="color:var(--color-text-secondary);font-size:14px;">
                Sistema Informatizado de Gestao Arquivistica de Documentos<br>
                <span style="font-size:13px;">e-ARQ Brasil v2 - Modelo de Requisitos</span><br>
                <span style="font-size:12px;color:var(--color-text-muted);">Capítulos 1.1, 1.2, 1.3 e 2.1 implementados</span>
            </p>
        </div>
    `;

    Promise.all([
        fetch(`${API_URL}/classes`).then(r => r.json()),
        fetch(`${API_URL}/temporalidades`).then(r => r.json()),
        fetch(`${API_URL}/classes/relatorio`).then(r => r.json()),
        fetch(`${API_URL}/captura`).then(r => r.json()).catch(() => [])
    ]).then(([classes, temporalidades, relatorio, captura]) => {
        const visiveis = classes.filter(c => c.id !== 1);
        document.getElementById('dash-total').textContent = visiveis.length;
        document.getElementById('dash-ativas').textContent = visiveis.filter(c => c.ativa === 1).length;
        document.getElementById('dash-inativas').textContent = visiveis.filter(c => c.ativa === 0).length;
        document.getElementById('dash-documentos').textContent = relatorio.reduce((sum, r) => sum + (r.documentos || 0), 0);
        document.getElementById('dash-capturados').textContent = Array.isArray(captura) ? captura.length : 0;
        document.getElementById('dash-temporalidades').textContent = temporalidades.filter(t => t.temporalidade_id).length;
    }).catch(() => { });
}

// ============================================
// MODULO DE CLASSIFICACAO (1.1)
// ============================================

function renderClassificacao(container) {
    container.innerHTML = `
        <div class="module-header">
            <h1>Plano de Classificacao</h1>
            <div class="module-actions">
                <button class="btn-secondary" onclick="exportarPlano()" style="font-size:12px;padding:6px 14px;">Exportar</button>
                <button class="btn-secondary" onclick="abrirImportar()" style="font-size:12px;padding:6px 14px;">Importar</button>
                <button class="btn-secondary" onclick="gerenciarMetadadosClasseSelecionada()" style="font-size:12px;padding:6px 14px;">Metadados</button>
                <span style="font-size:13px;color:var(--color-text-secondary);margin-left:8px;">1.1.16</span>
            </div>
        </div>
        <div id="form-classe">
            <h2>Nova Classe</h2>
            <div class="form-row">
                <div class="form-group">
                    <label for="input-nome">Nome</label>
                    <input type="text" id="input-nome" placeholder="Ex: Administracao Geral" />
                </div>
                <div class="form-group">
                    <label for="input-codigo">Codigo</label>
                    <input type="text" id="input-codigo" placeholder="Ex: 021.1" />
                </div>
                <div class="form-group">
                    <label for="input-pai">Classe Pai</label>
                    <select id="input-pai">
                        <option value="">Nenhum (raiz)</option>
                    </select>
                </div>
                <div class="checkbox-group">
                    <input type="checkbox" id="input-pode-classificar" checked />
                    <label for="input-pode-classificar">Pode classificar</label>
                </div>
                <button class="btn-primary" id="btn-criar">Criar Classe</button>
            </div>
            <div style="margin-top:16px; border-top:1px solid var(--color-bg); padding-top:16px;">
                <input type="text" id="busca-input" placeholder="Buscar classe por nome ou codigo..." />
            </div>
        </div>
        <hr />
        <div id="lista-classes">
            <h2>Classes Cadastradas</h2>
            <div id="relatorio-container"></div>
            <div id="tree-container"></div>
        </div>
    `;
    initClassificacao();
}

// ============================================
// 1.1.10 - GERENCIAR METADADOS DA CLASSE
// ============================================

async function gerenciarMetadadosClasseSelecionada() {
    const classeId = prompt('Digite o ID da classe para gerenciar metadados:');
    if (!classeId || isNaN(classeId)) {
        alert('Por favor, digite um ID válido.');
        return;
    }
    await gerenciarMetadadosClasse(parseInt(classeId));
}

async function gerenciarMetadadosClasse(classeId) {
    try {
        const respClasse = await fetch(`${API_URL}/classes/${classeId}`);
        if (!respClasse.ok) {
            alert('Classe não encontrada!');
            return;
        }
        const classe = await respClasse.json();

        const respMeta = await fetch(`${API_URL}/classes/${classeId}/metadados`);
        const metadadosAtuais = await respMeta.json();

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 700px;">
                <h2>Gerenciar Metadados da Classe (1.1.10)</h2>
                <p class="modal-subtitle">${classe.codigo} - ${classe.nome}</p>
                <hr>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div class="form-group" style="grid-column:1 / -1;">
                        <label>Observações</label>
                        <textarea id="meta-observacoes" rows="2" placeholder="Informações adicionais sobre a classe">${metadadosAtuais.metadados?.observacoes || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Palavras-chave</label>
                        <input type="text" id="meta-palavras-chave" placeholder="termo1, termo2, termo3" value="${metadadosAtuais.metadados?.palavras_chave || ''}" />
                    </div>
                    <div class="form-group">
                        <label>Responsável pela classe</label>
                        <input type="text" id="meta-responsavel" placeholder="Nome do responsável" value="${metadadosAtuais.metadados?.responsavel || ''}" />
                    </div>
                    <div class="form-group">
                        <label>Unidade administrativa</label>
                        <input type="text" id="meta-unidade" placeholder="Setor/Departamento" value="${metadadosAtuais.metadados?.unidade || ''}" />
                    </div>
                    <div class="form-group" style="grid-column:1 / -1;">
                        <label>Justificativa da classe</label>
                        <textarea id="meta-justificativa" rows="2" placeholder="Justificativa para criação/manutenção desta classe">${metadadosAtuais.metadados?.justificativa || ''}</textarea>
                    </div>
                    <div class="form-group" style="grid-column:1 / -1;">
                        <label>Normas associadas</label>
                        <textarea id="meta-normas" rows="2" placeholder="Leis, decretos, portarias relacionados">${metadadosAtuais.metadados?.normas || ''}</textarea>
                    </div>
                </div>
                <div style="background:var(--color-primary-bg);padding:12px;border-radius:8px;margin-bottom:16px;font-size:13px;color:var(--color-text-secondary);border:1px solid var(--color-bg);">
                    <strong>Informações da Classe:</strong>
                    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;">
                        <span style="background:var(--color-bg);padding:2px 10px;border-radius:4px;font-size:11px;">ID: ${classe.id}</span>
                        <span style="background:var(--color-bg);padding:2px 10px;border-radius:4px;font-size:11px;">Código: ${classe.codigo}</span>
                        <span style="background:var(--color-bg);padding:2px 10px;border-radius:4px;font-size:11px;">${classe.ativa === 1 ? 'Ativa' : 'Inativa'}</span>
                        <span style="background:var(--color-bg);padding:2px 10px;border-radius:4px;font-size:11px;">${classe.pode_classificar === 1 ? 'Documentável' : 'Agrupador'}</span>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn-primary" id="btn-salvar-metadados">Salvar Metadados</button>
                    <button class="btn-secondary" id="btn-fechar-metadados">Cancelar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('btn-fechar-metadados').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

        document.getElementById('btn-salvar-metadados').addEventListener('click', async () => {
            const metadados = {
                observacoes: document.getElementById('meta-observacoes').value.trim(),
                palavras_chave: document.getElementById('meta-palavras-chave').value.trim(),
                responsavel: document.getElementById('meta-responsavel').value.trim(),
                unidade: document.getElementById('meta-unidade').value.trim(),
                justificativa: document.getElementById('meta-justificativa').value.trim(),
                normas: document.getElementById('meta-normas').value.trim()
            };

            try {
                const resp = await fetch(`${API_URL}/classes/${classeId}/metadados`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ metadados })
                });
                const dados = await resp.json();
                if (!resp.ok) { alert('Erro: ' + dados.erro); return; }
                alert(dados.mensagem);
                modal.remove();
                carregarClasses();
            } catch (erro) {
                alert('Erro: ' + erro.message);
            }
        });

    } catch (erro) {
        alert('Erro: ' + erro.message);
    }
}

// ============================================
// EXPORTAR/IMPORTAR (1.1.16)
// ============================================

async function exportarPlano() {
    try {
        const resp = await fetch(`${API_URL}/exportar-classes`);
        if (!resp.ok) throw new Error('Erro ao exportar');
        const data = await resp.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `plano_classificacao_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert(`Exportado com sucesso!\nTotal: ${data.total_classes} classes`);
    } catch (erro) {
        alert('Erro ao exportar: ' + erro.message);
    }
}

function abrirImportar() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Importar Plano de Classificacao</h2>
            <p class="modal-subtitle">Envie um arquivo JSON com as classes</p>
            <hr>
            <div class="form-group">
                <label>Arquivo JSON</label>
                <input type="file" id="import-file" accept=".json" style="padding:8px;" />
                <span class="helper-text">Selecione um arquivo .json exportado do SIGAD</span>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="import-substituir" />
                    Substituir classes existentes com mesmo codigo
                </label>
                <span class="helper-text">Se desmarcado, classes duplicadas serao ignoradas</span>
            </div>
            <div id="import-preview" style="display:none;background:var(--color-primary-bg);padding:12px;border-radius:8px;margin-bottom:16px;max-height:200px;overflow-y:auto;font-size:13px;"></div>
            <div class="modal-actions">
                <button class="btn-primary" id="btn-importar">Importar</button>
                <button class="btn-secondary" id="btn-fechar-import">Cancelar</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    const fileInput = document.getElementById('import-file');
    const preview = document.getElementById('import-preview');

    fileInput.addEventListener('change', function () {
        const file = this.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function (event) {
            try {
                const data = JSON.parse(event.target.result);
                if (data.plano_classificacao) {
                    preview.style.display = 'block';
                    preview.innerHTML = `
                        <strong>Preview:</strong><br>
                        Versao: ${data.versao || 'N/A'}<br>
                        Data: ${data.data_exportacao || 'N/A'}<br>
                        Total: ${data.total_classes || data.plano_classificacao.length} classes
                        <br><br>
                        <div style="font-size:12px;color:var(--color-text-secondary);">
                            ${data.plano_classificacao.slice(0, 10).map(c =>
                        `${c.codigo} - ${c.nome}${c.ativa ? '' : ' (inativa)'}`
                    ).join('<br>')}
                            ${data.plano_classificacao.length > 10 ? `<br>... e mais ${data.plano_classificacao.length - 10} classes` : ''}
                        </div>
                    `;
                } else {
                    alert('Arquivo invalido. Formato esperado: { plano_classificacao: [...] }');
                }
            } catch (e) {
                alert('Erro ao ler arquivo: ' + e.message);
            }
        };
        reader.readAsText(file);
    });

    document.getElementById('btn-fechar-import').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

    document.getElementById('btn-importar').addEventListener('click', async function () {
        const file = fileInput.files[0];
        if (!file) { alert('Selecione um arquivo'); return; }
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            if (!data.plano_classificacao || !Array.isArray(data.plano_classificacao)) {
                alert('Arquivo invalido: nao encontrou "plano_classificacao"');
                return;
            }
            const substituir = document.getElementById('import-substituir').checked;
            this.textContent = 'Importando...';
            this.disabled = true;
            const resp = await fetch(`${API_URL}/importar-classes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plano_classificacao: data.plano_classificacao, substituir_existentes: substituir })
            });
            const resultado = await resp.json();
            if (!resp.ok) { alert('Erro: ' + (resultado.erro || 'Falha na importacao')); return; }
            let msg = `Importacao concluida!\n`;
            msg += `Importados: ${resultado.importados}\n`;
            msg += `Substituidos: ${resultado.substituidos || 0}\n`;
            if (resultado.erros && resultado.erros.length > 0) {
                msg += `\nErros (${resultado.erros.length}):\n${resultado.erros.slice(0, 5).join('\n')}`;
                if (resultado.erros.length > 5) msg += `\n... e mais ${resultado.erros.length - 5} erros`;
            }
            alert(msg);
            modal.remove();
            carregarClasses();
        } catch (erro) {
            alert('Erro: ' + erro.message);
        } finally {
            this.textContent = 'Importar';
            this.disabled = false;
        }
    });
}

// ============================================
// INICIALIZAR CLASSIFICACAO
// ============================================

function initClassificacao() {
    carregarClasses();
    document.getElementById('btn-criar').addEventListener('click', async function () {
        const nome = document.getElementById('input-nome').value.trim();
        const codigo = document.getElementById('input-codigo').value.trim();
        const classe_pai_id = document.getElementById('input-pai').value || null;
        const pode_classificar = document.getElementById('input-pode-classificar').checked ? 1 : 0;
        if (!nome || !codigo) {
            alert('Nome e codigo sao obrigatorios');
            return;
        }
        try {
            const resp = await fetch(`${API_URL}/classes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, codigo, classe_pai_id, pode_classificar, ativa: 1 })
            });
            const dados = await resp.json();
            if (!resp.ok) { alert('Erro: ' + dados.erro); return; }
            alert(dados.mensagem);
            document.getElementById('input-nome').value = '';
            document.getElementById('input-codigo').value = '';
            carregarClasses();
        } catch (erro) {
            alert('Erro: ' + erro.message);
        }
    });
    const buscaInput = document.getElementById('busca-input');
    if (buscaInput) {
        buscaInput.addEventListener('input', function () {
            buscarClasses(this.value);
        });
    }
}

async function carregarClasses() {
    try {
        const resp = await fetch(`${API_URL}/classes`);
        classesCache = await resp.json();
        montarArvore(classesCache);
        popularSelectPai(classesCache);
        atualizarRelatorio(classesCache);
        atualizarSidebarCount(classesCache);
    } catch (erro) {
        document.getElementById('tree-container').innerHTML =
            '<p style="color:var(--color-danger-text);font-size:13px;">Erro ao conectar com o backend</p>';
    }
}

function montarArvore(classes) {
    const container = document.getElementById('tree-container');
    if (!container) return;
    const classesVisiveis = classes.filter(c => c.id !== 1);
    const raizes = classesVisiveis.filter(c => c.classe_pai_id === null);
    if (raizes.length === 0) {
        container.innerHTML = '<p style="color:var(--color-text-muted);font-size:13px;padding:20px;text-align:center;">Nenhuma classe cadastrada.</p>';
        return;
    }
    let html = '<div class="tree-root">';
    raizes.forEach(raiz => {
        html += renderizarClasse(raiz, classesVisiveis, 0);
    });
    html += '</div>';
    container.innerHTML = html;
}

function renderizarClasse(classe, todasClasses, nivel) {
    const filhos = todasClasses.filter(c => c.classe_pai_id === classe.id);
    const ativa = classe.ativa === 1;
    const isRaiz = nivel === 0;

    let statusBadge = ativa
        ? '<span class="badge ativa">Ativa</span>'
        : '<span class="badge inativa">Inativa</span>';
    let tipoBadge = classe.pode_classificar === 1
        ? '<span class="badge tipo">Documento</span>'
        : '<span class="badge tipo">Agrupador</span>';

    let acoesBotoes = '';
    if (ativa) {
        acoesBotoes = `
            <button onclick="editarClasse(${classe.id})" class="btn-tree btn-edit">Editar</button>
            <button onclick="gerenciarMetadadosClasse(${classe.id})" class="btn-tree btn-meta">Metadados</button>
            <button class="btn-tree btn-temp" onclick="abrirTemporalidadeModal(${classe.id})">Temporalidade</button>
            <button onclick="moverClasse(${classe.id})" class="btn-tree btn-move">Mover</button>
            <button onclick="verHistorico(${classe.id})" class="btn-tree btn-history">Histórico</button>
            <button class="btn-tree btn-danger" onclick="inativarClasse(${classe.id})">Inativar</button>
        `;
    } else {
        acoesBotoes = `
            <button onclick="editarClasse(${classe.id})" class="btn-tree btn-edit">Editar</button>
            <button onclick="gerenciarMetadadosClasse(${classe.id})" class="btn-tree btn-meta">Metadados</button>
            <button class="btn-tree btn-temp" onclick="abrirTemporalidadeModal(${classe.id})">Temporalidade</button>
            <button onclick="verHistorico(${classe.id})" class="btn-tree btn-history">Histórico</button>
            <button class="btn-tree btn-reativar" onclick="reativarClasse(${classe.id})">Reativar</button>
            <button class="btn-tree btn-excluir" onclick="excluirClasse(${classe.id})">Excluir</button>
        `;
    }

    // Icone da classe baseado no tipo
    const icone = classe.pode_classificar === 1
        ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>'
        : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="8" y1="14" x2="16" y2="14"/></svg>';

    // Seta para indicar expansão
    const seta = filhos.length > 0
        ? `<span class="tree-toggle">▶</span>`
        : `<span class="tree-toggle tree-leaf">●</span>`;

    // Contador de subclasses
    const subCount = filhos.length > 0
        ? `<span class="tree-count">${filhos.length} subclasses</span>`
        : '';

    let html = `
        <div class="tree-item" style="--nivel: ${nivel};">
            <div class="tree-node${isRaiz ? ' tree-node-raiz' : ''}${!ativa ? ' tree-node-inativa' : ''}">
                <div class="tree-content">
                    <div class="tree-info">
                        ${seta}
                        <span class="tree-icon">${icone}</span>
                        <span class="tree-codigo">${classe.codigo}</span>
                        <span class="tree-nome">${classe.nome}</span>
                        ${statusBadge}
                        ${tipoBadge}
                        ${subCount}
                    </div>
                    <div class="tree-actions">
                        ${acoesBotoes}
                    </div>
                </div>
            </div>
    `;

    if (filhos.length > 0) {
        html += `<div class="tree-children">`;
        filhos.forEach((filho, index) => {
            const isLast = index === filhos.length - 1;
            html += `<div class="tree-child ${isLast ? 'last' : ''}">`;
            html += renderizarClasse(filho, todasClasses, nivel + 1);
            html += `</div>`;
        });
        html += `</div>`;
    }

    html += `</div>`;
    return html;
}

function renderizarClasse(classe, todasClasses, nivel) {
    const filhos = todasClasses.filter(c => c.classe_pai_id === classe.id);
    const ativa = classe.ativa === 1;
    const temFilhos = filhos.length > 0;

    // Icone da classe baseado no tipo
    const icone = classe.pode_classificar === 1
        ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>'
        : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="8" y1="14" x2="16" y2="14"/></svg>';

    // Seta para indicar expansão
    const seta = temFilhos
        ? `<span class="tree-toggle expanded" onclick="toggleTreeItem(this)" title="Expandir/Recolher">▶</span>`
        : `<span class="tree-toggle tree-leaf">●</span>`;

    // Status badges
    let statusBadge = ativa
        ? '<span class="tree-badge ativa">Ativa</span>'
        : '<span class="tree-badge inativa">Inativa</span>';

    let tipoBadge = classe.pode_classificar === 1
        ? '<span class="tree-badge tipo">Documento</span>'
        : '<span class="tree-badge tipo">Agrupador</span>';

    // Contador de subclasses
    const subCount = temFilhos
        ? `<span class="tree-count">${filhos.length} sub${filhos.length > 1 ? 's' : ''}</span>`
        : '';

    // Ações
    let acoesBotoes = '';
    if (ativa) {
        acoesBotoes = `
            <button class="btn-edit" onclick="editarClasse(${classe.id})">✎ Editar</button>
            <button class="btn-meta" onclick="gerenciarMetadadosClasse(${classe.id})">Metadados</button>
            <button class="btn-temp" onclick="abrirTemporalidadeModal(${classe.id})">Temporalidade</button>
            <button class="btn-move" onclick="moverClasse(${classe.id})">⇄ Mover</button>
            <button class="btn-history" onclick="verHistorico(${classe.id})">Histórico</button>
            <button class="btn-danger" onclick="inativarClasse(${classe.id})">Inativar</button>
        `;
    } else {
        acoesBotoes = `
            <button class="btn-edit" onclick="editarClasse(${classe.id})">Editar</button>
            <button class="btn-meta" onclick="gerenciarMetadadosClasse(${classe.id})">Metadados</button>
            <button class="btn-temp" onclick="abrirTemporalidadeModal(${classe.id})">Temporalidade</button>
            <button class="btn-history" onclick="verHistorico(${classe.id})">Histórico</button>
            <button class="btn-reativar" onclick="reativarClasse(${classe.id})">Reativar</button>
            <button class="btn-excluir" onclick="excluirClasse(${classe.id})">Excluir</button>
        `;
    }

    // Nível máximo para evitar CSS infinito
    const nivelDisplay = Math.min(nivel, 10);

    let html = `
        <div class="tree-item" data-level="${nivelDisplay}" data-id="${classe.id}">
            <div class="tree-node">
                <div class="tree-content">
                    <div class="tree-info">
                        ${seta}
                        <span class="tree-icon">${icone}</span>
                        <span class="tree-codigo">${classe.codigo}</span>
                        <span class="tree-nome">${classe.nome}</span>
                        ${statusBadge}
                        ${tipoBadge}
                        ${subCount}
                    </div>
                    <div class="tree-actions">
                        ${acoesBotoes}
                    </div>
                </div>
            </div>
    `;

    if (temFilhos) {
        html += `<div class="tree-children">`;
        filhos.forEach((filho, index) => {
            const isLast = index === filhos.length - 1;
            html += `<div class="tree-child ${isLast ? 'last' : ''}">`;
            html += renderizarClasse(filho, todasClasses, nivel + 1);
            html += `</div>`;
        });
        html += `</div>`;
    }

    html += `</div>`;
    return html;
}

function popularSelectPai(classes) {
    const select = document.getElementById('input-pai');
    if (!select) return;
    select.innerHTML = '<option value="">Nenhum (classe raiz)</option>';
    classes.forEach(c => {
        if (c.id === 1) return;
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = `${c.codigo} - ${c.nome}`;
        select.appendChild(opt);
    });
}

function atualizarRelatorio(classes) {
    const container = document.getElementById('relatorio-container');
    if (!container) return;
    const total = classes.filter(c => c.id !== 1).length;
    const ativas = classes.filter(c => c.id !== 1 && c.ativa === 1).length;
    const inativas = total - ativas;
    const documentaveis = classes.filter(c => c.id !== 1 && c.pode_classificar === 1).length;
    container.innerHTML = `
        <span class="relatorio-item">Total: <span class="numero">${total}</span></span>
        <span class="relatorio-item ativa">Ativas: <span class="numero">${ativas}</span></span>
        <span class="relatorio-item inativa">Inativas: <span class="numero">${inativas}</span></span>
        <span class="relatorio-item documentavel">Documentaveis: <span class="numero">${documentaveis}</span></span>
    `;
}

function atualizarSidebarCount(classes) {
    const count = document.getElementById('sidebar-count');
    if (count) {
        const total = classes.filter(c => c.id !== 1).length;
        count.textContent = total;
    }
}

async function buscarClasses(termo) {
    if (!termo || termo.length < 2) {
        carregarClasses();
        return;
    }
    try {
        const resp = await fetch(`${API_URL}/classes/busca?termo=${encodeURIComponent(termo)}`);
        const classes = await resp.json();
        montarArvore(classes);
    } catch (erro) { }
}

// ============================================
// FUNCOES DAS CLASSES
// ============================================

async function editarClasse(id) {
    try {
        const resp = await fetch(`${API_URL}/classes/${id}`);
        const classe = await resp.json();
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Editar Classe</h2>
                <hr>
                <div class="form-group">
                    <label>Nome</label>
                    <input type="text" id="edit-nome" value="${classe.nome}" />
                </div>
                <div class="form-group">
                    <label>Codigo</label>
                    <input type="text" id="edit-codigo" value="${classe.codigo}" />
                </div>
                <div class="form-group">
                    <label>Pode classificar?</label>
                    <select id="edit-pode-classificar">
                        <option value="1" ${classe.pode_classificar === 1 ? 'selected' : ''}>Sim</option>
                        <option value="0" ${classe.pode_classificar === 0 ? 'selected' : ''}>Nao (agrupador)</option>
                    </select>
                </div>
                <div class="modal-actions">
                    <button class="btn-primary" id="btn-salvar-edit">Salvar</button>
                    <button class="btn-secondary" id="btn-fechar-edit">Cancelar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('btn-fechar-edit').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
        document.getElementById('btn-salvar-edit').addEventListener('click', async () => {
            const nome = document.getElementById('edit-nome').value.trim();
            const codigo = document.getElementById('edit-codigo').value.trim();
            const pode_classificar = parseInt(document.getElementById('edit-pode-classificar').value);
            if (!nome || !codigo) { alert('Nome e codigo sao obrigatorios'); return; }
            try {
                const resp = await fetch(`${API_URL}/classes/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nome, codigo, classe_pai_id: classe.classe_pai_id, pode_classificar, ativa: classe.ativa })
                });
                const dados = await resp.json();
                if (!resp.ok) { alert('Erro: ' + dados.erro); return; }
                alert(dados.mensagem);
                modal.remove();
                carregarClasses();
            } catch (erro) { alert('Erro: ' + erro.message); }
        });
    } catch (erro) { alert('Erro: ' + erro.message); }
}

async function moverClasse(id) {
    try {
        const resp = await fetch(`${API_URL}/classes`);
        const classes = await resp.json();
        const classe = classes.find(c => c.id === id);
        let options = classes
            .filter(c => c.id !== 1 && c.id !== id)
            .map(c => `<option value="${c.id}">${c.codigo} - ${c.nome}</option>`)
            .join('');
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Mover Classe</h2>
                <p style="color:var(--color-text-secondary);font-size:14px;">Movendo: <strong>${classe.codigo} - ${classe.nome}</strong></p>
                <hr>
                <div class="form-group">
                    <label>Nova classe pai</label>
                    <select id="mover-destino">
                        <option value="">Nenhum (raiz)</option>
                        ${options}
                    </select>
                </div>
                <div class="modal-actions">
                    <button class="btn-primary" id="btn-mover">Mover</button>
                    <button class="btn-secondary" id="btn-fechar-mover">Cancelar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('btn-fechar-mover').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
        document.getElementById('btn-mover').addEventListener('click', async () => {
            const nova_classe_pai_id = document.getElementById('mover-destino').value || null;
            try {
                const resp = await fetch(`${API_URL}/classes/${id}/mover`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nova_classe_pai_id })
                });
                const dados = await resp.json();
                if (!resp.ok) { alert('Erro: ' + dados.erro); return; }
                alert(dados.mensagem);
                modal.remove();
                carregarClasses();
            } catch (erro) { alert('Erro: ' + erro.message); }
        });
    } catch (erro) { alert('Erro: ' + erro.message); }
}

async function inativarClasse(id) {
    if (!confirm('Inativar esta classe?')) return;
    try {
        const resp = await fetch(`${API_URL}/classes/${id}`, { method: 'DELETE' });
        const dados = await resp.json();
        if (!resp.ok) { alert('Erro: ' + dados.erro); return; }
        alert(dados.mensagem);
        carregarClasses();
    } catch (erro) { alert('Erro: ' + erro.message); }
}

async function reativarClasse(id) {
    if (!confirm('Reativar esta classe?')) return;
    try {
        const resp = await fetch(`${API_URL}/classes/${id}/reativar`, { method: 'PUT' });
        const dados = await resp.json();
        if (!resp.ok) { alert('Erro: ' + dados.erro); return; }
        alert(dados.mensagem);
        carregarClasses();
    } catch (erro) { alert('Erro: ' + erro.message); }
}

async function excluirClasse(id) {
    try {
        const respDocs = await fetch(`${API_URL}/classes/${id}/documentos`);
        const docs = await respDocs.json();
        let msg = 'Excluir permanentemente esta classe inativa?';
        if (docs.total > 0) msg = `Esta classe possui ${docs.total} documentos. Tem certeza?`;
        if (!confirm(msg)) return;
        const resp = await fetch(`${API_URL}/classes/${id}/permanent`, { method: 'DELETE' });
        const dados = await resp.json();
        if (!resp.ok) { alert('Erro: ' + dados.erro); return; }
        alert(dados.mensagem);
        carregarClasses();
    } catch (erro) { alert('Erro: ' + erro.message); }
}

async function verHistorico(id) {
    try {
        const resp = await fetch(`${API_URL}/classes/${id}/historico`);
        const historico = await resp.json();
        let linhas = '';
        if (historico.length === 0) {
            linhas = '<tr><td colspan="5" style="text-align:center;color:var(--color-text-muted);">Nenhuma alteracao registrada</td></tr>';
        } else {
            historico.forEach(h => {
                linhas += `
                    <tr>
                        <td><strong>${h.campo}</strong></td>
                        <td class="valor-antigo">${h.valor_anterior || '-'}</td>
                        <td class="valor-novo">${h.valor_novo}</td>
                        <td>${h.alterado_por}</td>
                        <td class="data">${new Date(h.alterado_em).toLocaleString()}</td>
                    </tr>
                `;
            });
        }
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Historico de Alteracoes</h2>
                <hr>
                <table class="historico-table">
                    <thead><tr><th>Campo</th><th>Valor Anterior</th><th>Valor Novo</th><th>Responsavel</th><th>Data</th></tr></thead>
                    <tbody>${linhas}</tbody>
                </table>
                <div class="modal-actions">
                    <button class="btn-secondary" id="btn-fechar-historico">Fechar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('btn-fechar-historico').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    } catch (erro) { alert('Erro: ' + erro.message); }
}

// ============================================
// TEMPORALIDADE (MODAL)
// ============================================

async function abrirTemporalidadeModal(classeId) {
    try {
        const respClasse = await fetch(`${API_URL}/classes/${classeId}`);
        const classe = await respClasse.json();
        const respTemp = await fetch(`${API_URL}/temporalidade/${classeId}`);
        const temp = await respTemp.json();
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Configurar Temporalidade</h2>
                <p class="modal-subtitle">${classe.codigo} - ${classe.nome}</p>
                <hr>
                <div class="form-group">
                    <label>Prazo na Corrente (meses)</label>
                    <input type="number" id="temp-prazo-corrente" value="${temp?.prazo_corrente || 0}" />
                    <span class="helper-text">0 = enquanto vigora</span>
                </div>
                <div class="form-group">
                    <label>Evento de contagem (Corrente)</label>
                    <input type="text" id="temp-evento-corrente" value="${temp?.evento_corrente || 'arquivamento'}" />
                    <span class="helper-text">Ex: arquivamento, aprovacao, fim da vigencia</span>
                </div>
                <div class="form-group">
                    <label>Prazo na Intermediaria (meses)</label>
                    <input type="number" id="temp-prazo-intermediaria" value="${temp?.prazo_intermediaria || 0}" />
                </div>
                <div class="form-group">
                    <label>Evento de contagem (Intermediaria)</label>
                    <input type="text" id="temp-evento-intermediaria" value="${temp?.evento_intermediaria || 'transferencia'}" />
                    <span class="helper-text">Ex: transferencia, conclusao do caso</span>
                </div>
                <div class="form-group">
                    <label>Destinacao Final</label>
                    <select id="temp-destinacao">
                        <option value="eliminacao" ${temp?.destinacao_final === 'eliminacao' ? 'selected' : ''}>Eliminacao</option>
                        <option value="preservacao" ${temp?.destinacao_final === 'preservacao' ? 'selected' : ''}>Preservacao (Guarda Permanente)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Sigilo Associado</label>
                    <input type="text" id="temp-sigilo" value="${temp?.sigilo_associado || ''}" placeholder="Ex: Informacao pessoal, Sigilo fiscal..." />
                </div>
                <div class="form-group">
                    <label>Observacoes</label>
                    <textarea id="temp-observacoes" rows="2">${temp?.observacoes || ''}</textarea>
                </div>
                <div class="modal-actions">
                    <button class="btn-primary" id="btn-salvar-temp">Salvar</button>
                    <button class="btn-secondary" id="btn-fechar-temp">Cancelar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('btn-fechar-temp').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
        document.getElementById('btn-salvar-temp').addEventListener('click', async () => {
            const dados = {
                classe_id: classeId,
                prazo_corrente: parseInt(document.getElementById('temp-prazo-corrente').value) || 0,
                evento_corrente: document.getElementById('temp-evento-corrente').value.trim() || 'arquivamento',
                prazo_intermediaria: parseInt(document.getElementById('temp-prazo-intermediaria').value) || 0,
                evento_intermediaria: document.getElementById('temp-evento-intermediaria').value.trim() || 'transferencia',
                destinacao_final: document.getElementById('temp-destinacao').value,
                sigilo_associado: document.getElementById('temp-sigilo').value.trim() || null,
                observacoes: document.getElementById('temp-observacoes').value.trim() || null
            };
            try {
                const resp = await fetch(`${API_URL}/temporalidade`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dados)
                });
                const resultado = await resp.json();
                if (!resp.ok) { alert('Erro: ' + resultado.erro); return; }
                alert(resultado.mensagem);
                modal.remove();
                carregarTemporalidades();
                carregarClasses();
            } catch (erro) { alert('Erro: ' + erro.message); }
        });
    } catch (erro) { alert('Erro: ' + erro.message); }
}

// ============================================
// MODULO DE TEMPORALIDADE (1.2)
// ============================================

function renderTemporalidade(container) {
    container.innerHTML = `
        <div class="module-header">
            <h1>Tabela de Temporalidade</h1>
            <div class="module-actions">
                <button class="btn-secondary" onclick="exportarTemporalidades()" style="font-size:12px;padding:6px 14px;">Exportar</button>
                <button class="btn-secondary" onclick="abrirImportarTemporalidades()" style="font-size:12px;padding:6px 14px;">Importar</button>
                <button class="btn-secondary" onclick="verificarPrazosVencidos()" style="font-size:12px;padding:6px 14px;">Verificar Prazos</button>
                <button class="btn-secondary" onclick="verHistoricoCompletoTemporalidades()" style="font-size:12px;padding:6px 14px;">Historico</button>
                <span style="font-size:13px;color:var(--color-text-secondary);margin-left:8px;">1.2</span>
            </div>
        </div>
        <div id="temp-resumo"><span class="relatorio-item">Carregando...</span></div>
        
        <!-- TABS -->
        <div class="tabs-container" style="margin-top: 20px;">
            <div class="tabs-header" style="display:flex;border-bottom:2px solid var(--color-border-light);margin-bottom:20px;">
                <button class="tab-btn active" data-tab="configurados" onclick="switchTab('configurados')">
                    ✓ Configuradas
                    <span class="tab-count" id="tab-configurados-count">0</span>
                </button>
                <button class="tab-btn" data-tab="nao-configurados" onclick="switchTab('nao-configurados')">
                    ○ Não Configuradas
                    <span class="tab-count" id="tab-nao-configurados-count">0</span>
                </button>
            </div>
            <div class="tabs-content">
                <div class="tab-panel active" id="panel-configurados">
                    <div id="temp-configurados-container"></div>
                </div>
                <div class="tab-panel" id="panel-nao-configurados">
                    <div id="temp-nao-configurados-container"></div>
                </div>
            </div>
        </div>
    `;
    carregarTemporalidades();
}

function switchTab(tabName) {
    // Remove active de todos os botões e painéis
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));

    // Ativa o botão e painel correspondente
    const btn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
    const panel = document.getElementById(`panel-${tabName}`);

    if (btn) btn.classList.add('active');
    if (panel) panel.classList.add('active');
}

async function carregarTemporalidades() {
    try {
        const respResumo = await fetch(`${API_URL}/temporalidades/resumo`);
        const resumo = await respResumo.json();
        atualizarResumoTemporalidade(resumo);

        const respLista = await fetch(`${API_URL}/temporalidades/completo`);
        const lista = await respLista.json();

        console.log('Temporalidades carregadas:', lista.length);
        console.log('Configurados:', lista.filter(t => t.status_temporalidade === 'Configurado').length);
        console.log('Não configurados:', lista.filter(t => t.status_temporalidade === 'Não configurado').length);

        renderizarListaTemporalidades(lista);

        const count = lista.filter(t => t.status_temporalidade === 'Configurado').length;
        const badge = document.getElementById('sidebar-temp-count');
        if (badge) badge.textContent = count;
    } catch (erro) {
        console.error('Erro ao carregar temporalidades:', erro);
        document.getElementById('temp-table-container').innerHTML =
            '<p style="color:var(--color-danger-text);font-size:13px;">Erro ao carregar dados</p>';
    }
}

function atualizarResumoTemporalidade(resumo) {
    const container = document.getElementById('temp-resumo');
    container.innerHTML = `
        <span class="relatorio-item">Total configuradas: <span class="numero">${resumo.total || 0}</span></span>
        <span class="relatorio-item ativa">Para Eliminacao: <span class="numero">${resumo.para_eliminacao || 0}</span></span>
        <span class="relatorio-item documentavel">Para Preservacao: <span class="numero">${resumo.para_preservacao || 0}</span></span>
        <span class="relatorio-item inativa">Sem prazo corrente: <span class="numero">${resumo.sem_prazo_corrente || 0}</span></span>
        <span class="relatorio-item">Media prazo corrente: <span class="numero">${Math.round(resumo.media_prazo_corrente || 0)} meses</span></span>
        <span class="relatorio-item">Media prazo intermediario: <span class="numero">${Math.round(resumo.media_prazo_intermediaria || 0)} meses</span></span>
    `;
}

function renderizarListaTemporalidades(lista) {
    if (!lista || lista.length === 0) {
        document.getElementById('temp-configurados-container').innerHTML =
            '<p style="color:var(--color-text-muted);font-size:13px;padding:20px;text-align:center;">Nenhuma classe cadastrada.</p>';
        document.getElementById('temp-nao-configurados-container').innerHTML =
            '<p style="color:var(--color-text-muted);font-size:13px;padding:20px;text-align:center;">Nenhuma classe cadastrada.</p>';
        return;
    }

    // Separa as listas
    const configurados = lista.filter(item => item.status_temporalidade === 'Configurado');
    const naoConfigurados = lista.filter(item => item.status_temporalidade === 'Não configurado');

    // Atualiza os contadores das abas
    const countConfig = document.getElementById('tab-configurados-count');
    const countNaoConfig = document.getElementById('tab-nao-configurados-count');
    if (countConfig) countConfig.textContent = configurados.length;
    if (countNaoConfig) countNaoConfig.textContent = naoConfigurados.length;

    // ========================================
    // 1. TEMPORALIDADES CONFIGURADAS
    // ========================================
    let htmlConfig = '';
    if (configurados.length > 0) {
        htmlConfig = `
            <div style="background: var(--color-bg-card); border: 1px solid var(--color-border-light); border-radius: var(--radius-md); overflow: hidden;">
                <table>
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Classe</th>
                            <th style="text-align:center;">Status</th>
                            <th style="text-align:center;">Prazo Corrente</th>
                            <th style="text-align:center;">Evento</th>
                            <th style="text-align:center;">Prazo Interm.</th>
                            <th style="text-align:center;">Destinação</th>
                            <th style="text-align:center;">Editar</th>
                            <th style="text-align:center;">Excluir</th>
                            <th style="text-align:center;">Atualizar</th>
                            <th style="text-align:center;">Histórico</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        configurados.forEach(item => {
            const destinacaoBadge = item.destinacao_final === 'eliminacao'
                ? '<span style="color:var(--color-danger-text);font-weight:500;">Eliminação</span>'
                : '<span style="color:var(--color-success);font-weight:500;">Preservação</span>';

            htmlConfig += `
                <tr>
                    <td style="font-family:monospace;color:var(--color-primary);font-weight:500;">${item.codigo}</td>
                    <td style="font-weight:500;">${item.classe_nome}</td>
                    <td style="text-align:center;"><span class="badge ativa">Configurado</span></td>
                    <td style="text-align:center;">${item.prazo_corrente + ' meses'}</td>
                    <td style="text-align:center;font-size:12px;color:var(--color-text-secondary);">${item.evento_corrente}</td>
                    <td style="text-align:center;">${item.prazo_intermediaria + ' meses'}</td>
                    <td style="text-align:center;">${destinacaoBadge}</td>
                    <td style="text-align:center;">
                        <button class="btn-editar" onclick="editarTemporalidade(${item.classe_id})">Editar</button>
                    </td>
                    <td style="text-align:center;">
                        <button class="btn-excluir" onclick="excluirTemporalidade(${item.temporalidade_id})">Excluir</button>
                    </td>
                    <td style="text-align:center;">
                        <button class="btn-atualizar" onclick="atualizarPrazoDocumentos(${item.temporalidade_id})">Atualizar</button>
                    </td>
                    <td style="text-align:center;">
                        <button class="btn-historico" onclick="verHistoricoTemporalidade(${item.temporalidade_id})">Histórico</button>
                    </td>
                </tr>
            `;
        });

        htmlConfig += `
                    </tbody>
                </table>
            </div>
        `;
    } else {
        htmlConfig = `
            <div style="background: var(--color-bg-card); border: 1px solid var(--color-border-light); border-radius: var(--radius-md); padding: 40px; text-align: center;">
                <p style="color:var(--color-text-muted);font-size:14px;">Nenhuma temporalidade configurada.</p>
                <p style="color:var(--color-text-muted);font-size:12px;margin-top:4px;">Clique em "Configurar" na aba "Não Configuradas" para criar uma.</p>
            </div>
        `;
    }
    document.getElementById('temp-configurados-container').innerHTML = htmlConfig;

    // ========================================
    // 2. TEMPORALIDADES NÃO CONFIGURADAS
    // ========================================
    let htmlNaoConfig = '';
    if (naoConfigurados.length > 0) {
        htmlNaoConfig = `
            <div style="background: var(--color-bg-card); border: 1px solid var(--color-border-light); border-radius: var(--radius-md); overflow: hidden;">
                <table>
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Classe</th>
                            <th style="text-align:center;">Status</th>
                            <th style="text-align:center;">Prazo Corrente</th>
                            <th style="text-align:center;">Evento</th>
                            <th style="text-align:center;">Prazo Interm.</th>
                            <th style="text-align:center;">Destinação</th>
                            <th style="text-align:center;">Configurar</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        naoConfigurados.forEach(item => {
            htmlNaoConfig += `
                <tr>
                    <td style="font-family:monospace;color:var(--color-text-muted);font-weight:500;">${item.codigo}</td>
                    <td style="color:var(--color-text-secondary);">${item.classe_nome}</td>
                    <td style="text-align:center;"><span class="badge inativa">Não configurado</span></td>
                    <td style="text-align:center;color:var(--color-text-muted);">-</td>
                    <td style="text-align:center;color:var(--color-text-muted);">-</td>
                    <td style="text-align:center;color:var(--color-text-muted);">-</td>
                    <td style="text-align:center;color:var(--color-text-muted);">-</td>
                    <td style="text-align:center;">
                        <button class="btn-configurar" onclick="editarTemporalidade(${item.classe_id})">Configurar</button>
                    </td>
                </tr>
            `;
        });

        htmlNaoConfig += `
                    </tbody>
                </table>
            </div>
        `;
    } else {
        htmlNaoConfig = `
            <div style="background: var(--color-bg-card); border: 1px solid var(--color-border-light); border-radius: var(--radius-md); padding: 40px; text-align: center;">
                <p style="color:var(--color-success);font-size:14px;font-weight:500;">✓ Todas as classes já estão configuradas!</p>
                <p style="color:var(--color-text-muted);font-size:12px;margin-top:4px;">Nenhuma classe sem temporalidade.</p>
            </div>
        `;
    }
    document.getElementById('temp-nao-configurados-container').innerHTML = htmlNaoConfig;
}

async function editarTemporalidade(classeId) {
    try {
        const respClasse = await fetch(`${API_URL}/classes/${classeId}`);
        const classe = await respClasse.json();
        const respTemp = await fetch(`${API_URL}/temporalidade/${classeId}`);
        const temp = await respTemp.json();
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Configurar Temporalidade</h2>
                <p class="modal-subtitle">${classe.codigo} - ${classe.nome}</p>
                <hr>
                <div class="form-group">
                    <label>Prazo na Corrente (meses)</label>
                    <input type="number" id="edit-temp-prazo-corrente" value="${temp?.prazo_corrente || 0}" />
                    <span class="helper-text">0 = enquanto vigora</span>
                </div>
                <div class="form-group">
                    <label>Evento de contagem (Corrente)</label>
                    <input type="text" id="edit-temp-evento-corrente" value="${temp?.evento_corrente || 'arquivamento'}" />
                    <span class="helper-text">Ex: arquivamento, aprovacao, fim da vigencia</span>
                </div>
                <div class="form-group">
                    <label>Prazo na Intermediaria (meses)</label>
                    <input type="number" id="edit-temp-prazo-intermediaria" value="${temp?.prazo_intermediaria || 0}" />
                </div>
                <div class="form-group">
                    <label>Evento de contagem (Intermediaria)</label>
                    <input type="text" id="edit-temp-evento-intermediaria" value="${temp?.evento_intermediaria || 'transferencia'}" />
                    <span class="helper-text">Ex: transferencia, conclusao do caso</span>
                </div>
                <div class="form-group">
                    <label>Destinacao Final</label>
                    <select id="edit-temp-destinacao">
                        <option value="eliminacao" ${temp?.destinacao_final === 'eliminacao' ? 'selected' : ''}>Eliminacao</option>
                        <option value="preservacao" ${temp?.destinacao_final === 'preservacao' ? 'selected' : ''}>Preservacao (Guarda Permanente)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Sigilo Associado</label>
                    <input type="text" id="edit-temp-sigilo" value="${temp?.sigilo_associado || ''}" placeholder="Ex: Informacao pessoal, Sigilo fiscal..." />
                </div>
                <div class="form-group">
                    <label>Observacoes</label>
                    <textarea id="edit-temp-observacoes" rows="2">${temp?.observacoes || ''}</textarea>
                </div>
                <div class="modal-actions">
                    <button class="btn-primary" id="btn-salvar-edit-temp">Salvar</button>
                    <button class="btn-secondary" id="btn-fechar-edit-temp">Cancelar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('btn-fechar-edit-temp').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
        document.getElementById('btn-salvar-edit-temp').addEventListener('click', async () => {
            const dados = {
                classe_id: classeId,
                prazo_corrente: parseInt(document.getElementById('edit-temp-prazo-corrente').value) || 0,
                evento_corrente: document.getElementById('edit-temp-evento-corrente').value.trim() || 'arquivamento',
                prazo_intermediaria: parseInt(document.getElementById('edit-temp-prazo-intermediaria').value) || 0,
                evento_intermediaria: document.getElementById('edit-temp-evento-intermediaria').value.trim() || 'transferencia',
                destinacao_final: document.getElementById('edit-temp-destinacao').value,
                sigilo_associado: document.getElementById('edit-temp-sigilo').value.trim() || null,
                observacoes: document.getElementById('edit-temp-observacoes').value.trim() || null
            };
            try {
                const resp = await fetch(`${API_URL}/temporalidade`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dados)
                });
                const resultado = await resp.json();
                if (!resp.ok) { alert('Erro: ' + resultado.erro); return; }
                alert(resultado.mensagem);
                modal.remove();
                carregarTemporalidades();
            } catch (erro) { alert('Erro: ' + erro.message); }
        });
    } catch (erro) { alert('Erro: ' + erro.message); }
}

async function excluirTemporalidade(id) {
    if (!confirm('Excluir esta configuracao de temporalidade?')) return;
    try {
        const resp = await fetch(`${API_URL}/temporalidade/${id}`, { method: 'DELETE' });
        const dados = await resp.json();
        if (!resp.ok) { alert('Erro: ' + dados.erro); return; }
        alert(dados.mensagem);
        carregarTemporalidades();
    } catch (erro) { alert('Erro: ' + erro.message); }
}

async function verificarPrazosVencidos() {
    try {
        const resp = await fetch(`${API_URL}/prazos/vencidos`);
        const dados = await resp.json();
        const vencidos = dados.filter(d => d.prazo_corrente_vencido || d.prazo_intermediario_vencido);
        if (vencidos.length > 0) {
            let msg = `Prazos vencidos (${vencidos.length}):\n\n`;
            vencidos.forEach(d => {
                msg += `- ${d.codigo} - ${d.classe_nome}: `;
                if (d.prazo_corrente_vencido) msg += `[Corrente vencido] `;
                if (d.prazo_intermediario_vencido) msg += `[Intermediario vencido] `;
                msg += `(${d.meses_corridos} meses)\n`;
            });
            alert(msg);
        } else {
            alert('Todos os prazos estao em dia!');
        }
        return dados;
    } catch (erro) {
        alert('Erro ao verificar prazos: ' + erro.message);
        return [];
    }
}

async function atualizarPrazoDocumentos(tempId) {
    try {
        const resp = await fetch(`${API_URL}/temporalidade/${tempId}`);
        const temp = await resp.json();
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Atualizar Prazo com Efeito em Documentos</h2>
                <p class="modal-subtitle">Alterar prazo afetara TODOS os documentos desta classe (1.2.7)</p>
                <hr>
                <div class="form-group">
                    <label>Novo Prazo Corrente (meses)</label>
                    <input type="number" id="novo-prazo-corrente" value="${temp.prazo_corrente}" />
                    <span class="helper-text">0 = enquanto vigora</span>
                </div>
                <div class="form-group">
                    <label>Novo Prazo Intermediario (meses)</label>
                    <input type="number" id="novo-prazo-intermediario" value="${temp.prazo_intermediaria}" />
                </div>
                <div style="background:var(--color-warning-bg);padding:12px;border-radius:8px;margin-bottom:16px;font-size:13px;color:var(--color-warning);">
                    Esta acao atualizara TODOS os documentos em andamento desta classe
                </div>
                <div class="modal-actions">
                    <button class="btn-primary" id="btn-atualizar-prazos">Atualizar Todos</button>
                    <button class="btn-secondary" id="btn-fechar-prazos">Cancelar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('btn-fechar-prazos').addEventListener('click', () => modal.remove());
        document.getElementById('btn-atualizar-prazos').addEventListener('click', async () => {
            const prazo_corrente = parseInt(document.getElementById('novo-prazo-corrente').value) || 0;
            const prazo_intermediaria = parseInt(document.getElementById('novo-prazo-intermediario').value) || 0;
            if (!confirm(`Atualizar TODOS os documentos desta classe para:\nCorrente: ${prazo_corrente} meses\nIntermediario: ${prazo_intermediaria} meses?`)) return;
            try {
                const resp = await fetch(`${API_URL}/temporalidade/${tempId}/atualizar-documentos`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prazo_corrente, prazo_intermediaria })
                });
                const resultado = await resp.json();
                if (!resp.ok) { alert('Erro: ' + resultado.erro); return; }
                alert(resultado.mensagem + `\nDocumentos atualizados: ${resultado.documentos_atualizados || 0}`);
                modal.remove();
                carregarTemporalidades();
            } catch (erro) { alert('Erro: ' + erro.message); }
        });
    } catch (erro) { alert('Erro: ' + erro.message); }
}

async function verHistoricoTemporalidade(id) {
    try {
        const resp = await fetch(`${API_URL}/temporalidade/${id}/historico`);
        const historico = await resp.json();
        let linhas = '';
        if (historico.length === 0) {
            linhas = '<tr><td colspan="5" style="text-align:center;color:var(--color-text-muted);">Nenhuma alteracao registrada</td></tr>';
        } else {
            historico.forEach(h => {
                linhas += `
                    <tr>
                        <td><strong>${h.campo}</strong></td>
                        <td class="valor-antigo">${h.valor_anterior || '-'}</td>
                        <td class="valor-novo">${h.valor_novo}</td>
                        <td>${h.alterado_por}</td>
                        <td class="data">${new Date(h.alterado_em).toLocaleString()}</td>
                    </tr>
                `;
            });
        }
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Historico da Temporalidade (1.2.8)</h2>
                <hr>
                <table class="historico-table">
                    <thead><tr><th>Campo</th><th>Valor Anterior</th><th>Valor Novo</th><th>Responsavel</th><th>Data</th></tr></thead>
                    <tbody>${linhas}</tbody>
                </table>
                <div class="modal-actions">
                    <button class="btn-secondary" id="btn-fechar-historico-temp">Fechar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('btn-fechar-historico-temp').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    } catch (erro) { alert('Erro: ' + erro.message); }
}

async function verHistoricoCompletoTemporalidades() {
    try {
        const resp = await fetch(`${API_URL}/temporalidades/historico`);
        const historico = await resp.json();
        let linhas = '';
        if (historico.length === 0) {
            linhas = '<tr><td colspan="6" style="text-align:center;color:var(--color-text-muted);">Nenhuma alteracao registrada</td></tr>';
        } else {
            historico.forEach(h => {
                linhas += `
                    <tr>
                        <td style="font-family:monospace;color:var(--color-primary);">${h.codigo}</td>
                        <td>${h.classe_nome}</td>
                        <td><strong>${h.campo}</strong></td>
                        <td class="valor-antigo">${h.valor_anterior || '-'}</td>
                        <td class="valor-novo">${h.valor_novo}</td>
                        <td class="data">${new Date(h.alterado_em).toLocaleString()}</td>
                    </tr>
                `;
            });
        }
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Historico Completo das Temporalidades (1.2.8)</h2>
                <hr>
                <table class="historico-table">
                    <thead><tr><th>Classe</th><th>Nome</th><th>Campo</th><th>Valor Anterior</th><th>Valor Novo</th><th>Data</th></tr></thead>
                    <tbody>${linhas}</tbody>
                </table>
                <div class="modal-actions">
                    <button class="btn-secondary" id="btn-fechar-historico-completo">Fechar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('btn-fechar-historico-completo').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    } catch (erro) { alert('Erro: ' + erro.message); }
}

async function exportarTemporalidades() {
    try {
        const resp = await fetch(`${API_URL}/exportar-temporalidades`);
        if (!resp.ok) throw new Error('Erro ao exportar');
        const data = await resp.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `temporalidades_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert(`Exportado com sucesso!\nTotal: ${data.total_temporalidades} temporalidades (1.2.9)`);
    } catch (erro) {
        alert('Erro ao exportar: ' + erro.message);
    }
}

function abrirImportarTemporalidades() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Importar Temporalidades (1.2.9)</h2>
            <p class="modal-subtitle">Envie um arquivo JSON com as temporalidades</p>
            <hr>
            <div class="form-group">
                <label>Arquivo JSON</label>
                <input type="file" id="import-temp-file" accept=".json" style="padding:8px;" />
                <span class="helper-text">Selecione um arquivo .json exportado do SIGAD</span>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="import-temp-substituir" />
                    Substituir temporalidades existentes
                </label>
                <span class="helper-text">Se desmarcado, temporalidades duplicadas serao ignoradas</span>
            </div>
            <div id="import-temp-preview" style="display:none;background:var(--color-primary-bg);padding:12px;border-radius:8px;margin-bottom:16px;max-height:200px;overflow-y:auto;font-size:13px;"></div>
            <div class="modal-actions">
                <button class="btn-primary" id="btn-importar-temp">Importar</button>
                <button class="btn-secondary" id="btn-fechar-import-temp">Cancelar</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    const fileInput = document.getElementById('import-temp-file');
    const preview = document.getElementById('import-temp-preview');

    fileInput.addEventListener('change', function () {
        const file = this.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function (event) {
            try {
                const data = JSON.parse(event.target.result);
                if (data.temporalidades) {
                    preview.style.display = 'block';
                    preview.innerHTML = `
                        <strong>Preview:</strong><br>
                        Versao: ${data.versao || 'N/A'}<br>
                        Data: ${data.data_exportacao || 'N/A'}<br>
                        Total: ${data.total_temporalidades || data.temporalidades.length} temporalidades
                        <br><br>
                        <div style="font-size:12px;color:var(--color-text-secondary);">
                            ${data.temporalidades.slice(0, 10).map(t =>
                        `${t.codigo} - ${t.classe_nome} (${t.destinacao_final})`
                    ).join('<br>')}
                            ${data.temporalidades.length > 10 ? `<br>... e mais ${data.temporalidades.length - 10}` : ''}
                        </div>
                    `;
                } else {
                    alert('Arquivo invalido. Formato esperado: { temporalidades: [...] }');
                }
            } catch (e) {
                alert('Erro ao ler arquivo: ' + e.message);
            }
        };
        reader.readAsText(file);
    });

    document.getElementById('btn-fechar-import-temp').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

    document.getElementById('btn-importar-temp').addEventListener('click', async function () {
        const file = fileInput.files[0];
        if (!file) { alert('Selecione um arquivo'); return; }
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            if (!data.temporalidades || !Array.isArray(data.temporalidades)) {
                alert('Arquivo invalido: nao encontrou "temporalidades"');
                return;
            }
            const substituir = document.getElementById('import-temp-substituir').checked;
            this.textContent = 'Importando...';
            this.disabled = true;
            const resp = await fetch(`${API_URL}/importar-temporalidades`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ temporalidades: data.temporalidades, substituir_existentes: substituir })
            });
            const resultado = await resp.json();
            if (!resp.ok) { alert('Erro: ' + (resultado.erro || 'Falha na importacao')); return; }
            let msg = `Importacao concluida! (1.2.9)\n`;
            msg += `Importados: ${resultado.importados}\n`;
            msg += `Substituidos: ${resultado.substituidos || 0}\n`;
            if (resultado.erros && resultado.erros.length > 0) {
                msg += `\nErros (${resultado.erros.length}):\n${resultado.erros.slice(0, 5).join('\n')}`;
                if (resultado.erros.length > 5) msg += `\n... e mais ${resultado.erros.length - 5} erros`;
            }
            alert(msg);
            modal.remove();
            carregarTemporalidades();
        } catch (erro) {
            alert('Erro: ' + erro.message);
        } finally {
            this.textContent = 'Importar';
            this.disabled = false;
        }
    });
}

// ============================================
// MODULO DE DOCUMENTOS (1.3)
// ============================================

function renderDocumentos(container) {
    container.innerHTML = `
        <div class="module-header">
            <h1>Documentos</h1>
            <div class="module-actions">
                <span style="font-size:13px;color:var(--color-text-secondary);">1.3 - Classificacao e Metadados</span>
            </div>
        </div>

        <div id="doc-form">
            <h2>Novo Documento</h2>
            <div class="form-row">
                <div class="form-group">
                    <label for="doc-classe">Classe</label>
                    <select id="doc-classe">
                        <option value="">Selecione uma classe</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="doc-titulo">Titulo</label>
                    <input type="text" id="doc-titulo" placeholder="Titulo do documento" />
                </div>
                <div class="form-group">
                    <label for="doc-autor">Autor</label>
                    <input type="text" id="doc-autor" placeholder="Autor" />
                </div>
                <div class="form-group">
                    <label for="doc-numero">Numero</label>
                    <input type="text" id="doc-numero" placeholder="Numero do documento" />
                </div>
                <div class="form-group">
                    <label for="doc-data">Data Producao</label>
                    <input type="date" id="doc-data" />
                </div>
                <div class="form-group">
                    <label for="doc-localizacao">Localizacao</label>
                    <input type="text" id="doc-localizacao" placeholder="Local fisico ou digital" />
                </div>
            </div>
            <div class="form-row">
                <div class="form-group" style="flex:2;">
                    <label for="doc-descricao">Descricao</label>
                    <textarea id="doc-descricao" rows="2" placeholder="Descricao do documento"></textarea>
                </div>
            </div>
            <div style="margin-top:12px; display:flex; gap:8px; flex-wrap:wrap;">
                <button class="btn-primary" id="btn-criar-doc">Criar Documento</button>
                <button class="btn-secondary" onclick="carregarDocumentos()" style="font-size:12px;padding:6px 14px;">Atualizar Lista</button>
                <button class="btn-secondary" onclick="carregarDocumentosParaReclassificacao()" style="font-size:12px;padding:6px 14px;">Reclassificar</button>
            </div>
        </div>

        <hr />

        <div id="doc-list">
            <h2>Documentos Cadastrados</h2>
            <div id="doc-table-container"></div>
        </div>
    `;
    initDocumentos();
}

async function initDocumentos() {
    console.log('Inicializando módulo Documentos...');

    try {
        const resp = await fetch(`${API_URL}/classes`);
        const classes = await resp.json();
        const select = document.getElementById('doc-classe');
        if (select) {
            select.innerHTML = '<option value="">Selecione uma classe</option>';
            classes.filter(c => c.id !== 1 && c.pode_classificar === 1 && c.ativa === 1).forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.id;
                opt.textContent = `${c.codigo} - ${c.nome}`;
                select.appendChild(opt);
            });
        }
    } catch (e) {
        console.error('Erro ao carregar classes para o select:', e);
    }

    const btnCriar = document.getElementById('btn-criar-doc');
    if (btnCriar) {
        btnCriar.addEventListener('click', async function () {
            const classe_id = document.getElementById('doc-classe').value;
            const titulo = document.getElementById('doc-titulo').value.trim();
            const descricao = document.getElementById('doc-descricao').value.trim();
            const autor = document.getElementById('doc-autor').value.trim();
            const numero_documento = document.getElementById('doc-numero').value.trim();
            const data_producao = document.getElementById('doc-data').value;
            const localizacao = document.getElementById('doc-localizacao').value.trim();

            if (!classe_id || !titulo) {
                alert('Classe e título são obrigatórios (1.3.1)');
                return;
            }

            try {
                const resp = await fetch(`${API_URL}/documentos`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ classe_id, titulo, descricao, autor, numero_documento, data_producao, localizacao })
                });
                const dados = await resp.json();
                if (!resp.ok) {
                    alert('Erro: ' + (dados.erro || 'Erro ao criar documento'));
                    return;
                }
                alert(dados.mensagem || 'Documento criado com sucesso');
                document.getElementById('doc-titulo').value = '';
                document.getElementById('doc-descricao').value = '';
                document.getElementById('doc-autor').value = '';
                document.getElementById('doc-numero').value = '';
                document.getElementById('doc-data').value = '';
                document.getElementById('doc-localizacao').value = '';
                carregarDocumentos();
            } catch (erro) {
                alert('Erro: ' + erro.message);
            }
        });
    }

    carregarDocumentos();
}

async function carregarDocumentos() {
    try {
        const container = document.getElementById('doc-table-container');
        if (!container) return;

        container.innerHTML = '<p style="color:var(--color-text-muted);font-size:13px;">Carregando documentos...</p>';

        const resp = await fetch(`${API_URL}/documentos`);

        if (!resp.ok) {
            throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
        }

        const docs = await resp.json();

        if (Array.isArray(docs) && docs.length > 0) {
            renderizarListaDocumentos(docs);
        } else {
            container.innerHTML = '<p style="color:var(--color-text-muted);font-size:13px;">Nenhum documento cadastrado.</p>';
        }

        const badge = document.getElementById('sidebar-doc-count');
        if (badge) {
            badge.textContent = Array.isArray(docs) ? docs.length : 0;
        }

    } catch (erro) {
        console.error('Erro ao carregar documentos:', erro);
        const container = document.getElementById('doc-table-container');
        if (container) {
            container.innerHTML = '<p style="color:var(--color-danger-text);font-size:13px;">Erro ao carregar documentos: ' + erro.message + '</p>';
        }
    }
}

function renderizarListaDocumentos(docs) {
    const container = document.getElementById('doc-table-container');
    if (!container) return;

    if (!docs || !Array.isArray(docs) || docs.length === 0) {
        container.innerHTML = '<p style="color:var(--color-text-muted);font-size:13px;">Nenhum documento cadastrado.</p>';
        return;
    }

    let html = `<div style="overflow-x:auto;"><table><thead><tr>
        <th>Codigo</th>
        <th>Classe</th>
        <th>Titulo</th>
        <th>Autor</th>
        <th>Numero</th>
        <th>Data</th>
        <th style="text-align:center;">Acoes</th>
    </tr></thead><tbody>`;

    docs.forEach(d => {
        const dataFormatada = d.data_producao ? new Date(d.data_producao).toLocaleDateString('pt-BR') : '-';
        html += `
            <tr>
                <td style="font-family:monospace;color:var(--color-primary);font-weight:500;">${d.classe_codigo || '-'}</td>
                <td>${d.classe_nome || '-'}</td>
                <td><strong>${d.titulo || 'Sem titulo'}</strong></td>
                <td>${d.autor || '-'}</td>
                <td>${d.numero_documento || '-'}</td>
                <td style="font-size:12px;color:var(--color-text-secondary);">${dataFormatada}</td>
                <td style="text-align:center;white-space:nowrap;">
                    <button onclick="verDocumento(${d.id})" style="background:none;border:1px solid var(--color-border);padding:2px 10px;border-radius:4px;font-size:11px;cursor:pointer;">Ver</button>
                    <button onclick="reclassificarDocumento(${d.id})" style="background:none;border:1px solid var(--color-primary);padding:2px 10px;border-radius:4px;font-size:11px;cursor:pointer;color:var(--color-primary);">Reclassificar</button>
                    <button onclick="verReclassificacoes(${d.id})" style="background:none;border:1px solid var(--color-border);padding:2px 10px;border-radius:4px;font-size:11px;cursor:pointer;">Historico</button>
                    <button onclick="adicionarReferencia(${d.id})" style="background:none;border:1px solid var(--color-success);padding:2px 10px;border-radius:4px;font-size:11px;cursor:pointer;color:var(--color-success);">Referencia</button>
                </td>
            </tr>
        `;
    });

    html += `</tbody></table></div>`;
    container.innerHTML = html;
}

async function atualizarSidebarDocCount() {
    try {
        const resp = await fetch(`${API_URL}/classes`);
        const classes = await resp.json();
        if (!Array.isArray(classes)) return;
        let total = 0;
        for (const c of classes) {
            if (c.id === 1) continue;
            try {
                const respDocs = await fetch(`${API_URL}/classes/${c.id}/documentos`);
                const docs = await respDocs.json();
                if (Array.isArray(docs)) {
                    total += docs.length;
                }
            } catch (e) { }
        }
        const badge = document.getElementById('sidebar-doc-count');
        if (badge) badge.textContent = total;
    } catch (e) { }
}

async function verDocumento(id) {
    try {
        const resp = await fetch(`${API_URL}/documentos/${id}`);
        const doc = await resp.json();
        const respClasse = await fetch(`${API_URL}/classes/${doc.classe_id}`);
        const classe = await respClasse.json();
        const respRefs = await fetch(`${API_URL}/referencias-cruzadas/${id}`);
        const refs = await respRefs.json();

        let refsHtml = '';
        if (refs && refs.length > 0) {
            refsHtml = refs.map(r =>
                `<tr><td>${r.origem_titulo || r.destino_titulo}</td><td>${r.tipo_relacao}</td></tr>`
            ).join('');
        } else {
            refsHtml = '<tr><td colspan="2" style="text-align:center;color:var(--color-text-muted);">Nenhuma referencia</td></tr>';
        }

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Documento - ${doc.titulo}</h2>
                <p class="modal-subtitle">Classe: ${classe.codigo} - ${classe.nome}</p>
                <hr>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:14px;">
                    <div><strong>ID:</strong> ${doc.id}</div>
                    <div><strong>Numero:</strong> ${doc.numero_documento || '-'}</div>
                    <div><strong>Autor:</strong> ${doc.autor || '-'}</div>
                    <div><strong>Data Producao:</strong> ${doc.data_producao ? new Date(doc.data_producao).toLocaleDateString() : '-'}</div>
                    <div><strong>Localizacao:</strong> ${doc.localizacao || '-'}</div>
                    <div><strong>Status:</strong> ${doc.status || 'ativo'}</div>
                </div>
                <div style="margin-top:12px;">
                    <strong>Descricao:</strong>
                    <p style="color:var(--color-text-secondary);font-size:14px;margin-top:4px;">${doc.descricao || 'Nenhuma descricao'}</p>
                </div>
                <hr>
                <h3 style="font-size:14px;font-weight:500;margin-bottom:8px;">Referencias Cruzadas (1.3.12)</h3>
                <table class="historico-table">
                    <thead><tr><th>Documento</th><th>Tipo</th></tr></thead>
                    <tbody>${refsHtml}</tbody>
                </table>
                <div class="modal-actions">
                    <button class="btn-secondary" id="btn-fechar-doc">Fechar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('btn-fechar-doc').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    } catch (erro) {
        alert('Erro: ' + erro.message);
    }
}

async function reclassificarDocumento(id) {
    try {
        const resp = await fetch(`${API_URL}/classes`);
        const classes = await resp.json();
        const respDoc = await fetch(`${API_URL}/documentos/${id}`);
        const doc = await respDoc.json();

        let options = classes
            .filter(c => c.id !== 1 && c.id !== doc.classe_id && c.pode_classificar === 1 && c.ativa === 1)
            .map(c => `<option value="${c.id}">${c.codigo} - ${c.nome}</option>`)
            .join('');

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Reclassificar Documento (1.3.9)</h2>
                <p class="modal-subtitle">${doc.titulo} - Classe atual: ${doc.classe_id}</p>
                <hr>
                <div class="form-group">
                    <label>Nova Classe</label>
                    <select id="reclass-nova-classe">
                        <option value="">Selecione uma classe</option>
                        ${options}
                    </select>
                </div>
                <div class="form-group">
                    <label>Motivo da Reclassificacao (1.3.11)</label>
                    <input type="text" id="reclass-motivo" placeholder="Ex: Correcao de classificacao" />
                    <span class="helper-text">O historico da reclassificacao sera registrado (1.3.10)</span>
                </div>
                <div class="modal-actions">
                    <button class="btn-primary" id="btn-reclass">Reclassificar</button>
                    <button class="btn-secondary" id="btn-fechar-reclass">Cancelar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('btn-fechar-reclass').addEventListener('click', () => modal.remove());
        document.getElementById('btn-reclass').addEventListener('click', async () => {
            const nova_classe_id = document.getElementById('reclass-nova-classe').value;
            const motivo = document.getElementById('reclass-motivo').value.trim() || 'Reclassificacao manual';
            if (!nova_classe_id) { alert('Selecione uma nova classe'); return; }
            try {
                const resp = await fetch(`${API_URL}/documentos/${id}/reclassificar`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nova_classe_id, motivo })
                });
                const dados = await resp.json();
                if (!resp.ok) { alert('Erro: ' + dados.erro); return; }
                alert(dados.mensagem);
                modal.remove();
                carregarDocumentos();
            } catch (erro) { alert('Erro: ' + erro.message); }
        });
    } catch (erro) { alert('Erro: ' + erro.message); }
}

async function verReclassificacoes(id) {
    try {
        const resp = await fetch(`${API_URL}/documentos/${id}/reclassificacoes`);
        const historico = await resp.json();
        let linhas = '';
        if (historico.length === 0) {
            linhas = '<tr><td colspan="5" style="text-align:center;color:var(--color-text-muted);">Nenhuma reclassificacao registrada</td></tr>';
        } else {
            historico.forEach(h => {
                linhas += `
                    <tr>
                        <td>${h.codigo_anterior || '-'}</td>
                        <td>${h.nome_anterior || '-'}</td>
                        <td>${h.codigo_novo || '-'}</td>
                        <td>${h.nome_novo || '-'}</td>
                        <td style="font-size:12px;color:var(--color-text-secondary);">${new Date(h.reclassificado_em).toLocaleString()}</td>
                    </tr>
                `;
            });
        }
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Historico de Reclassificacao (1.3.10)</h2>
                <hr>
                <table class="historico-table">
                    <thead><tr><th>Codigo Ant.</th><th>Classe Ant.</th><th>Codigo Novo</th><th>Classe Nova</th><th>Data</th></tr></thead>
                    <tbody>${linhas}</tbody>
                </table>
                <div class="modal-actions">
                    <button class="btn-secondary" id="btn-fechar-reclass-historico">Fechar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('btn-fechar-reclass-historico').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    } catch (erro) { alert('Erro: ' + erro.message); }
}

async function adicionarReferencia(id) {
    try {
        const resp = await fetch(`${API_URL}/documentos`);
        const docs = await resp.json();
        let options = docs
            .filter(d => d.id !== id)
            .map(d => `<option value="${d.id}">${d.titulo} (${d.id})</option>`)
            .join('');

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Adicionar Referencia Cruzada (1.3.12)</h2>
                <hr>
                <div class="form-group">
                    <label>Documento Destino</label>
                    <select id="ref-destino">
                        <option value="">Selecione um documento</option>
                        ${options}
                    </select>
                </div>
                <div class="form-group">
                    <label>Tipo de Relacao</label>
                    <input type="text" id="ref-tipo" value="relacionado" placeholder="relacionado, referencia, anexo..." />
                </div>
                <div class="modal-actions">
                    <button class="btn-primary" id="btn-add-ref">Adicionar</button>
                    <button class="btn-secondary" id="btn-fechar-ref">Cancelar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('btn-fechar-ref').addEventListener('click', () => modal.remove());
        document.getElementById('btn-add-ref').addEventListener('click', async () => {
            const documento_destino_id = document.getElementById('ref-destino').value;
            const tipo_relacao = document.getElementById('ref-tipo').value.trim() || 'relacionado';
            if (!documento_destino_id) { alert('Selecione um documento destino'); return; }
            try {
                const resp = await fetch(`${API_URL}/referencias-cruzadas`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ documento_origem_id: id, documento_destino_id, tipo_relacao })
                });
                const dados = await resp.json();
                if (!resp.ok) { alert('Erro: ' + dados.erro); return; }
                alert(dados.mensagem);
                modal.remove();
                carregarDocumentos();
            } catch (erro) { alert('Erro: ' + erro.message); }
        });
    } catch (erro) { alert('Erro: ' + erro.message); }
}

async function carregarDocumentosParaReclassificacao() {
    try {
        const resp = await fetch(`${API_URL}/classes`);
        const classes = await resp.json();
        let todosDocs = [];
        for (const c of classes) {
            if (c.id === 1) continue;
            const respDocs = await fetch(`${API_URL}/classes/${c.id}/documentos`);
            const docs = await respDocs.json();
            todosDocs = todosDocs.concat(docs.map(d => ({ ...d, classe_codigo: c.codigo, classe_nome: c.nome })));
        }

        let options = todosDocs.map(d =>
            `<option value="${d.id}">${d.classe_codigo} - ${d.titulo}</option>`
        ).join('');

        let classesOptions = classes
            .filter(c => c.id !== 1 && c.pode_classificar === 1 && c.ativa === 1)
            .map(c => `<option value="${c.id}">${c.codigo} - ${c.nome}</option>`)
            .join('');

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Reclassificacao em Lote (1.3.8)</h2>
                <p class="modal-subtitle">Selecione multiplos documentos para reclassificar</p>
                <hr>
                <div class="form-group">
                    <label>Documentos</label>
                    <select id="lote-documentos" multiple style="height:150px;">
                        ${options}
                    </select>
                    <span class="helper-text">Segure Ctrl para selecionar multiplos</span>
                </div>
                <div class="form-group">
                    <label>Nova Classe</label>
                    <select id="lote-nova-classe">
                        <option value="">Selecione uma classe</option>
                        ${classesOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label>Motivo</label>
                    <input type="text" id="lote-motivo" placeholder="Motivo da reclassificacao em lote" />
                </div>
                <div class="modal-actions">
                    <button class="btn-primary" id="btn-lote-reclass">Reclassificar Todos</button>
                    <button class="btn-secondary" id="btn-fechar-lote">Cancelar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('btn-fechar-lote').addEventListener('click', () => modal.remove());
        document.getElementById('btn-lote-reclass').addEventListener('click', async () => {
            const select = document.getElementById('lote-documentos');
            const documento_ids = Array.from(select.selectedOptions).map(opt => parseInt(opt.value));
            const nova_classe_id = document.getElementById('lote-nova-classe').value;
            const motivo = document.getElementById('lote-motivo').value.trim() || 'Reclassificacao em lote';
            if (documento_ids.length === 0) { alert('Selecione pelo menos um documento'); return; }
            if (!nova_classe_id) { alert('Selecione uma nova classe'); return; }
            try {
                const resp = await fetch(`${API_URL}/documentos/reclassificar-lote`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ documento_ids, nova_classe_id, motivo })
                });
                const dados = await resp.json();
                if (!resp.ok) { alert('Erro: ' + dados.erro); return; }
                alert(dados.mensagem);
                modal.remove();
                carregarDocumentos();
            } catch (erro) { alert('Erro: ' + erro.message); }
        });
    } catch (erro) { alert('Erro: ' + erro.message); }
}

// ============================================
// MODULO DE CAPTURA (CAPITULO 2.1)
// ============================================

function renderCaptura(container) {
    container.innerHTML = `
        <div class="module-header">
            <h1>Captura de Documentos</h1>
            <div class="module-actions">
                <span style="font-size:13px;color:var(--color-text-secondary);">2.1 - Procedimentos Gerais</span>
                <button class="btn-secondary" onclick="carregarDocumentosCapturados()" style="font-size:12px;padding:6px 14px;">Atualizar Lista</button>
            </div>
        </div>

        <div id="form-captura" style="background:var(--color-primary-bg);padding:24px;border-radius:12px;border:1px solid var(--color-bg);margin-bottom:24px;">
            <h2>Novo Documento</h2>
            
            <div class="form-row">
                <div class="form-group" style="flex:2;">
                    <label for="captura-classe">Classe (2.1.1)</label>
                    <select id="captura-classe">
                        <option value="">Selecione uma classe</option>
                    </select>
                </div>
                <div class="form-group" style="flex:2;">
                    <label for="captura-titulo">Titulo *</label>
                    <input type="text" id="captura-titulo" placeholder="Titulo do documento" />
                </div>
            </div>

            <div id="sugestoes-classes" style="display:none;background:var(--color-bg-card);border:1px solid var(--color-border);border-radius:4px;padding:8px;margin-bottom:12px;box-shadow:var(--shadow-md);">
                <span style="font-size:11px;font-weight:600;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:0.4px;">💡 Classes sugeridas:</span>
                <div id="lista-sugestoes" style="margin-top:6px;"></div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="captura-autor">Autor (2.1.4)</label>
                    <input type="text" id="captura-autor" placeholder="Autor" />
                </div>
                <div class="form-group">
                    <label for="captura-redator">Redator (2.1.4)</label>
                    <input type="text" id="captura-redator" placeholder="Redator" />
                </div>
                <div class="form-group">
                    <label for="captura-originador">Originador (2.1.4)</label>
                    <input type="text" id="captura-originador" placeholder="Originador" />
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="captura-destinatario">Destinatario (2.1.4)</label>
                    <input type="text" id="captura-destinatario" placeholder="Destinatario" />
                </div>
                <div class="form-group">
                    <label for="captura-interessado">Interessado (2.1.5)</label>
                    <input type="text" id="captura-interessado" placeholder="Interessado" />
                </div>
                <div class="form-group">
                    <label for="captura-numero">Numero (2.1.9)</label>
                    <input type="text" id="captura-numero" placeholder="Numero do documento" />
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="captura-data">Data Producao</label>
                    <input type="date" id="captura-data" />
                </div>
                <div class="form-group">
                    <label for="captura-tipo">Tipo de Meio (2.1.1)</label>
                    <select id="captura-tipo">
                        <option value="digital">Digital</option>
                        <option value="nao_digital">Nao Digital</option>
                        <option value="hibrido">Hibrido</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="captura-status">Status (2.1.16)</label>
                    <select id="captura-status">
                        <option value="original">Original</option>
                        <option value="minuta">Minuta</option>
                        <option value="copia">Copia</option>
                    </select>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="captura-localizacao">Localizacao (2.1.1)</label>
                    <input type="text" id="captura-localizacao" placeholder="Local fisico ou digital" />
                </div>
                <div class="form-group">
                    <label for="captura-restricao">Restricao de Acesso (2.1.4)</label>
                    <input type="text" id="captura-restricao" placeholder="Ex: Sigiloso, Confidencial..." />
                </div>
            </div>

            <div class="form-row">
                <div class="form-group" style="flex:1;">
                    <label for="captura-assunto">Assunto (2.1.10)</label>
                    <input type="text" id="captura-assunto" placeholder="Assunto principal" />
                </div>
                <div class="form-group" style="flex:1; position:relative;">
                    <label for="captura-palavras">Palavras-chave (2.1.10)</label>
                    <input type="text" id="captura-palavras" placeholder="Digite para ver sugestões do tesauro" autocomplete="off" style="width:100%;padding:8px 12px;border:1px solid var(--color-border);border-radius:4px;font-size:13px;" />
                    <div id="tesauro-sugestoes" style="display:none;position:absolute;top:100%;left:0;right:0;background:white;border:1px solid var(--color-border);border-radius:4px;max-height:180px;overflow-y:auto;z-index:99999;margin-top:2px;box-shadow:0 4px 12px rgba(0,0,0,0.15);"></div>
                    <span class="helper-text">Sugestões automáticas do tesauro (2.1.10)</span>
                    <div style="margin-top:4px;">
                        <button class="btn-secondary" onclick="abrirGerenciarTesauro()" style="font-size:11px;padding:4px 12px;height:28px;">Gerenciar Tesauro</button>
                    </div>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group" style="flex:2;">
                    <label for="captura-descricao">Descricao (2.1.4)</label>
                    <textarea id="captura-descricao" rows="3" placeholder="Descricao detalhada do documento"></textarea>
                </div>
            </div>

            <div style="margin-top:16px; border-top:1px solid var(--color-bg); padding-top:16px;">
                <h3 style="font-size:14px;font-weight:500;margin-bottom:8px;">Componentes Digitais (2.1.3, 2.1.19)</h3>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                    <button class="btn-secondary" onclick="adicionarComponente()" style="font-size:12px;padding:6px 14px;">+ Adicionar Componente</button>
                    <span style="font-size:12px;color:var(--color-text-muted);">O documento pode ter multiplos componentes</span>
                </div>
                <div id="componentes-list" style="margin-top:8px;"></div>
            </div>

            <div style="margin-top:16px; display:flex; gap:8px; flex-wrap:wrap;">
                <button class="btn-primary" id="btn-capturar">Capturar Documento (2.1.1)</button>
                <button class="btn-secondary" onclick="document.getElementById('form-captura').reset(); componentesCaptura=[]; document.getElementById('componentes-list').innerHTML='';" style="font-size:12px;padding:6px 14px;">Limpar Formulario</button>
            </div>
        </div>

        <hr />

        <div id="captura-list">
            <h2>Documentos Capturados</h2>
            <div id="captura-table-container"></div>
        </div>
    `;
    initCaptura();
}

async function initCaptura() {
    try {
        const resp = await fetch(`${API_URL}/classes`);
        const classes = await resp.json();
        const select = document.getElementById('captura-classe');
        if (select) {
            select.innerHTML = '<option value="">Selecione uma classe</option>';
            classes.filter(c => c.id !== 1 && c.pode_classificar === 1 && c.ativa === 1).forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.id;
                opt.textContent = `${c.codigo} - ${c.nome}`;
                select.appendChild(opt);
            });
        }
    } catch (e) {
        console.error('Erro ao carregar classes:', e);
    }

    document.getElementById('btn-capturar').addEventListener('click', async function () {
        const classe_id = document.getElementById('captura-classe').value;
        const titulo = document.getElementById('captura-titulo').value.trim();
        const descricao = document.getElementById('captura-descricao').value.trim();
        const autor = document.getElementById('captura-autor').value.trim();
        const redator = document.getElementById('captura-redator').value.trim();
        const originador = document.getElementById('captura-originador').value.trim();
        const destinatario = document.getElementById('captura-destinatario').value.trim();
        const interessado = document.getElementById('captura-interessado').value.trim();
        const numero_documento = document.getElementById('captura-numero').value.trim();
        const data_producao = document.getElementById('captura-data').value;
        const localizacao = document.getElementById('captura-localizacao').value.trim();
        const tipo_meio = document.getElementById('captura-tipo').value;
        const status_documento = document.getElementById('captura-status').value;
        const restricao_acesso = document.getElementById('captura-restricao').value.trim();
        const assunto = document.getElementById('captura-assunto').value.trim();
        const palavras_chave = document.getElementById('captura-palavras').value.trim();
        const componentes = componentesCaptura;

        if (!classe_id || !titulo) {
            alert('Classe e titulo sao obrigatorios (2.1.1)');
            return;
        }

        try {
            const dados = {
                classe_id: parseInt(classe_id),
                titulo,
                descricao: descricao || null,
                autor: autor || null,
                redator: redator || null,
                originador: originador || null,
                destinatario: destinatario || null,
                interessado: interessado || null,
                numero_documento: numero_documento || null,
                data_producao: data_producao || null,
                localizacao: localizacao || null,
                tipo_meio: tipo_meio || 'digital',
                status_documento: status_documento || 'original',
                versao: '1.0',
                restricao_acesso: restricao_acesso || null,
                assunto: assunto || null,
                palavras_chave: palavras_chave || null,
                componentes: componentes
            };

            const resp = await fetch(`${API_URL}/captura`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });
            const resultado = await resp.json();
            if (!resp.ok) {
                alert('Erro na captura: ' + (resultado.erro || 'Falha desconhecida'));
                return;
            }

            alert(resultado.mensagem + '\nIdentificador: ' + resultado.identificador);

            document.getElementById('captura-titulo').value = '';
            document.getElementById('captura-descricao').value = '';
            document.getElementById('captura-autor').value = '';
            document.getElementById('captura-redator').value = '';
            document.getElementById('captura-originador').value = '';
            document.getElementById('captura-destinatario').value = '';
            document.getElementById('captura-interessado').value = '';
            document.getElementById('captura-numero').value = '';
            document.getElementById('captura-data').value = '';
            document.getElementById('captura-localizacao').value = '';
            document.getElementById('captura-restricao').value = '';
            document.getElementById('captura-assunto').value = '';
            document.getElementById('captura-palavras').value = '';
            componentesCaptura = [];
            document.getElementById('componentes-list').innerHTML = '';
            carregarDocumentosCapturados();
        } catch (erro) {
            alert('Erro: ' + erro.message);
        }
    });

    carregarDocumentosCapturados();
}

async function carregarDocumentosCapturados() {
    try {
        const container = document.getElementById('captura-table-container');
        if (!container) return;

        container.innerHTML = '<p style="color:var(--color-text-muted);font-size:13px;">Carregando documentos capturados...</p>';

        const resp = await fetch(`${API_URL}/captura`);
        if (!resp.ok) {
            throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
        }

        const docs = await resp.json();

        if (Array.isArray(docs) && docs.length > 0) {
            renderizarListaCaptura(docs);
        } else {
            container.innerHTML = '<p style="color:var(--color-text-muted);font-size:13px;">Nenhum documento capturado.</p>';
        }

        const badge = document.getElementById('sidebar-captura-count');
        if (badge) {
            badge.textContent = Array.isArray(docs) ? docs.length : 0;
        }

    } catch (erro) {
        console.error('Erro ao carregar documentos capturados:', erro);
        const container = document.getElementById('captura-table-container');
        if (container) {
            container.innerHTML = '<p style="color:var(--color-danger-text);font-size:13px;">Erro ao carregar: ' + erro.message + '</p>';
        }
    }
}

function renderizarListaCaptura(docs) {
    const container = document.getElementById('captura-table-container');
    if (!container) return;

    if (!docs || !Array.isArray(docs) || docs.length === 0) {
        container.innerHTML = '<p style="color:var(--color-text-muted);font-size:13px;">Nenhum documento capturado.</p>';
        return;
    }

    let html = `<div style="overflow-x:auto;"><table><thead><tr>
        <th>Identificador</th>
        <th>Titulo</th>
        <th>Classe</th>
        <th>Autor</th>
        <th>Numero</th>
        <th>Versao</th>
        <th>Status</th>
        <th style="text-align:center;">Acoes</th>
    </tr></thead><tbody>`;

    docs.forEach(d => {
        const dataFormatada = d.data_producao ? new Date(d.data_producao).toLocaleDateString('pt-BR') : '-';
        html += `
            <tr>
                <td style="font-family:monospace;font-size:11px;color:var(--color-primary);">${d.identificador || d.id}</td>
                <td><strong>${d.titulo || 'Sem titulo'}</strong></td>
                <td>${d.classe_codigo || '-'} - ${d.classe_nome || '-'}</td>
                <td>${d.autor || '-'}</td>
                <td>${d.numero_documento || '-'}</td>
                <td style="text-align:center;">${d.versao || '1.0'}</td>
                <td><span class="badge ${d.status_documento === 'original' ? 'ativa' : d.status_documento === 'minuta' ? 'tipo' : 'inativa'}">${d.status_documento || 'original'}</span></td>
                <td style="text-align:center;white-space:nowrap;">
                    <button onclick="verCaptura(${d.id})" style="background:none;border:1px solid var(--color-border);padding:2px 10px;border-radius:4px;font-size:11px;cursor:pointer;">Ver</button>
                    <button onclick="editarCaptura(${d.id})" style="background:none;border:1px solid var(--color-primary);padding:2px 10px;border-radius:4px;font-size:11px;cursor:pointer;color:var(--color-primary);">Editar</button>
                    <button onclick="criarVersaoCaptura(${d.id})" style="background:none;border:1px solid var(--color-success);padding:2px 10px;border-radius:4px;font-size:11px;cursor:pointer;color:var(--color-success);">+ Versao</button>
                </td>
            </tr>
        `;
    });

    html += `</tbody></table></div>`;
    container.innerHTML = html;
}

async function verCaptura(id) {
    try {
        const resp = await fetch(`${API_URL}/documentos/${id}`);
        const doc = await resp.json();

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Documento Capturado</h2>
                <p class="modal-subtitle">Identificador: ${doc.identificador || doc.id}</p>
                <hr>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:14px;">
                    <div><strong>Titulo:</strong> ${doc.titulo}</div>
                    <div><strong>Classe:</strong> ${doc.classe_id}</div>
                    <div><strong>Autor:</strong> ${doc.autor || '-'}</div>
                    <div><strong>Redator:</strong> ${doc.redator || '-'}</div>
                    <div><strong>Originador:</strong> ${doc.originador || '-'}</div>
                    <div><strong>Destinatario:</strong> ${doc.destinatario || '-'}</div>
                    <div><strong>Interessado:</strong> ${doc.interessado || '-'}</div>
                    <div><strong>Numero:</strong> ${doc.numero_documento || '-'}</div>
                    <div><strong>Data Producao:</strong> ${doc.data_producao ? new Date(doc.data_producao).toLocaleDateString('pt-BR') : '-'}</div>
                    <div><strong>Tipo Meio:</strong> ${doc.tipo_meio || 'digital'}</div>
                    <div><strong>Versao:</strong> ${doc.versao || '1.0'}</div>
                    <div><strong>Status:</strong> ${doc.status_documento || 'original'}</div>
                    <div><strong>Localizacao:</strong> ${doc.localizacao || '-'}</div>
                    <div><strong>Restricao:</strong> ${doc.restricao_acesso || '-'}</div>
                    <div><strong>Assunto:</strong> ${doc.assunto || '-'}</div>
                    <div><strong>Componentes:</strong> ${doc.num_componentes || 0}</div>
                </div>
                ${doc.descricao ? `<div style="margin-top:12px;"><strong>Descricao:</strong><p style="color:var(--color-text-secondary);font-size:14px;margin-top:4px;">${doc.descricao}</p></div>` : ''}
                <div class="modal-actions">
                    <button class="btn-secondary" id="btn-fechar-captura">Fechar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('btn-fechar-captura').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    } catch (erro) {
        alert('Erro: ' + erro.message);
    }
}

async function editarCaptura(id) {
    try {
        const resp = await fetch(`${API_URL}/documentos/${id}`);
        const doc = await resp.json();

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Editar Metadados (2.1.12, 2.1.15)</h2>
                <p class="modal-subtitle">ID: ${doc.id}</p>
                <hr>
                <div class="form-group">
                    <label>Titulo</label>
                    <input type="text" id="edit-captura-titulo" value="${doc.titulo}" />
                </div>
                <div class="form-group">
                    <label>Descricao</label>
                    <textarea id="edit-captura-descricao" rows="2">${doc.descricao || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Autor</label>
                    <input type="text" id="edit-captura-autor" value="${doc.autor || ''}" />
                </div>
                <div class="form-group">
                    <label>Numero do Documento</label>
                    <input type="text" id="edit-captura-numero" value="${doc.numero_documento || ''}" />
                </div>
                <div class="form-group">
                    <label>Localizacao</label>
                    <input type="text" id="edit-captura-localizacao" value="${doc.localizacao || ''}" />
                </div>
                <div class="form-group">
                    <label>Restricao de Acesso</label>
                    <input type="text" id="edit-captura-restricao" value="${doc.restricao_acesso || ''}" />
                </div>
                <div class="modal-actions">
                    <button class="btn-primary" id="btn-salvar-captura-edit">Salvar</button>
                    <button class="btn-secondary" id="btn-fechar-captura-edit">Cancelar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('btn-fechar-captura-edit').addEventListener('click', () => modal.remove());
        document.getElementById('btn-salvar-captura-edit').addEventListener('click', async () => {
            const titulo = document.getElementById('edit-captura-titulo').value.trim();
            const descricao = document.getElementById('edit-captura-descricao').value.trim();
            const autor = document.getElementById('edit-captura-autor').value.trim();
            const numero_documento = document.getElementById('edit-captura-numero').value.trim();
            const localizacao = document.getElementById('edit-captura-localizacao').value.trim();
            const restricao_acesso = document.getElementById('edit-captura-restricao').value.trim();

            try {
                const resp = await fetch(`${API_URL}/captura/${id}/metadados`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ titulo, descricao, autor, numero_documento, localizacao, restricao_acesso })
                });
                const dados = await resp.json();
                if (!resp.ok) { alert('Erro: ' + dados.erro); return; }
                alert(dados.mensagem);
                modal.remove();
                carregarDocumentosCapturados();
            } catch (erro) { alert('Erro: ' + erro.message); }
        });
    } catch (erro) { alert('Erro: ' + erro.message); }
}

async function criarVersaoCaptura(id) {
    try {
        const resp = await fetch(`${API_URL}/documentos/${id}`);
        const doc = await resp.json();

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Criar Nova Versao (2.1.16)</h2>
                <p class="modal-subtitle">Versao atual: ${doc.versao || '1.0'}</p>
                <hr>
                <div class="form-group">
                    <label>Titulo</label>
                    <input type="text" id="versao-titulo" value="${doc.titulo}" />
                </div>
                <div class="form-group">
                    <label>Descricao</label>
                    <textarea id="versao-descricao" rows="2">${doc.descricao || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Autor</label>
                    <input type="text" id="versao-autor" value="${doc.autor || ''}" />
                </div>
                <div class="form-group">
                    <label>Localizacao</label>
                    <input type="text" id="versao-localizacao" value="${doc.localizacao || ''}" />
                </div>
                <div style="background:var(--color-warning-bg);padding:12px;border-radius:8px;margin-bottom:16px;font-size:13px;color:var(--color-warning);">
                    A nova versao sera criada como "minuta"
                </div>
                <div class="modal-actions">
                    <button class="btn-primary" id="btn-criar-versao">Criar Versao</button>
                    <button class="btn-secondary" id="btn-fechar-versao">Cancelar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('btn-fechar-versao').addEventListener('click', () => modal.remove());
        document.getElementById('btn-criar-versao').addEventListener('click', async () => {
            const titulo = document.getElementById('versao-titulo').value.trim();
            const descricao = document.getElementById('versao-descricao').value.trim();
            const autor = document.getElementById('versao-autor').value.trim();
            const localizacao = document.getElementById('versao-localizacao').value.trim();

            try {
                const resp = await fetch(`${API_URL}/captura/${id}/versao`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ titulo, descricao, autor, localizacao })
                });
                const dados = await resp.json();
                if (!resp.ok) { alert('Erro: ' + dados.erro); return; }
                alert(dados.mensagem);
                modal.remove();
                carregarDocumentosCapturados();
            } catch (erro) { alert('Erro: ' + erro.message); }
        });
    } catch (erro) { alert('Erro: ' + erro.message); }
}

// ============================================
// 2.1.3 - ADICIONAR COMPONENTE
// ============================================

function adicionarComponente() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Adicionar Componente Digital (2.1.3)</h2>
            <hr>
            <div class="form-group">
                <label>Nome do Componente *</label>
                <input type="text" id="comp-nome" placeholder="Ex: documento.pdf" />
            </div>
            <div class="form-group">
                <label>Formato (2.1.4)</label>
                <input type="text" id="comp-formato" placeholder="Ex: pdf, docx, jpg" />
            </div>
            <div class="form-group">
                <label>Tamanho (bytes)</label>
                <input type="number" id="comp-tamanho" placeholder="0" />
            </div>
            <div class="form-group">
                <label>Nivel de Composicao</label>
                <input type="number" id="comp-nivel" value="0" />
                <span class="helper-text">0 = sem compressao/criptografia</span>
            </div>
            <div class="form-group">
                <label>Inibidor (ex: senha, criptografia)</label>
                <input type="text" id="comp-inibidor" placeholder="Ex: Password protected" />
            </div>
            <div class="form-group">
                <label>Dependencia de Software</label>
                <input type="text" id="comp-software" placeholder="Ex: Adobe Reader, Microsoft Word" />
            </div>
            <div class="form-group">
                <label>Dependencia de Hardware</label>
                <input type="text" id="comp-hardware" placeholder="Ex: Leitor de CD" />
            </div>
            <div class="modal-actions">
                <button class="btn-primary" id="btn-add-componente">Adicionar</button>
                <button class="btn-secondary" id="btn-fechar-componente">Cancelar</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('btn-fechar-componente').addEventListener('click', () => modal.remove());
    document.getElementById('btn-add-componente').addEventListener('click', () => {
        const nome = document.getElementById('comp-nome').value.trim();
        const formato = document.getElementById('comp-formato').value.trim();
        const tamanho = parseInt(document.getElementById('comp-tamanho').value) || 0;
        const nivel_composicao = parseInt(document.getElementById('comp-nivel').value) || 0;
        const inibidor = document.getElementById('comp-inibidor').value.trim() || null;
        const dependencia_software = document.getElementById('comp-software').value.trim() || null;
        const dependencia_hardware = document.getElementById('comp-hardware').value.trim() || null;

        if (!nome) {
            alert('Nome do componente é obrigatorio');
            return;
        }

        componentesCaptura.push({
            nome,
            formato: formato || 'unknown',
            tamanho,
            nivel_composicao,
            inibidor,
            dependencia_software,
            dependencia_hardware
        });

        renderizarComponentes();
        modal.remove();
        alert(`Componente "${nome}" adicionado com sucesso! (2.1.3)`);
    });
}

function renderizarComponentes() {
    const container = document.getElementById('componentes-list');
    if (!container) return;
    if (componentesCaptura.length === 0) {
        container.innerHTML = '<p style="color:var(--color-text-muted);font-size:13px;">Nenhum componente adicionado.</p>';
        return;
    }
    let html = '<div style="display:flex;flex-wrap:wrap;gap:8px;">';
    componentesCaptura.forEach((comp, index) => {
        html += `
            <div style="background:var(--color-bg);padding:6px 12px;border-radius:6px;font-size:12px;display:flex;align-items:center;gap:8px;">
                <span> ${comp.nome} (${comp.formato}) - ${comp.tamanho} bytes</span>
                <button onclick="removerComponente(${index})" style="background:none;border:none;color:var(--color-danger-text);cursor:pointer;">✕</button>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

function removerComponente(index) {
    componentesCaptura.splice(index, 1);
    renderizarComponentes();
}

// ============================================
// MODULOS PLACEHOLDERS
// ============================================

function renderPesquisa(container) {
    container.innerHTML = `
        <div class="module-header">
            <h1>Pesquisa Avancada</h1>
            <span style="font-size:14px;color:var(--color-text-secondary);">Busca por documentos e metadados</span>
        </div>
        <div style="background:var(--color-primary-bg);border-radius:12px;padding:32px;border:1px solid var(--color-bg);text-align:center;">
            <p style="color:var(--color-text-secondary);font-size:16px;">Modulo em desenvolvimento</p>
            <p style="color:var(--color-text-muted);font-size:13px;margin-top:8px;">Em breve: pesquisa avancada</p>
        </div>
    `;
}

function renderUsuarios(container) {
    container.innerHTML = `
        <div class="module-header">
            <h1>Usuarios</h1>
            <span style="font-size:14px;color:var(--color-text-secondary);">Controle de acesso</span>
        </div>
        <div style="background:var(--color-primary-bg);border-radius:12px;padding:32px;border:1px solid var(--color-bg);text-align:center;">
            <p style="color:var(--color-text-secondary);font-size:16px;">Modulo em desenvolvimento</p>
            <p style="color:var(--color-text-muted);font-size:13px;margin-top:8px;">Em breve: gerenciamento de usuarios</p>
        </div>
    `;
}

function renderAuditoria(container) {
    container.innerHTML = `
        <div class="module-header">
            <h1>Auditoria</h1>
            <span style="font-size:14px;color:var(--color-text-secondary);">Trilhas de auditoria</span>
        </div>
        <div style="background:var(--color-primary-bg);border-radius:12px;padding:32px;border:1px solid var(--color-bg);text-align:center;">
            <p style="color:var(--color-text-secondary);font-size:16px;">Modulo em desenvolvimento</p>
            <p style="color:var(--color-text-muted);font-size:13px;margin-top:8px;">Em breve: trilhas de auditoria</p>
        </div>
    `;
}

function renderRelatorios(container) {
    container.innerHTML = `
        <div class="module-header">
            <h1>Relatorios</h1>
            <span style="font-size:14px;color:var(--color-text-secondary);">Relatorios gerenciais</span>
        </div>
        <div style="background:var(--color-primary-bg);border-radius:12px;padding:32px;border:1px solid var(--color-bg);text-align:center;">
            <p style="color:var(--color-text-secondary);font-size:16px;">Modulo em desenvolvimento</p>
            <p style="color:var(--color-text-muted);font-size:13px;margin-top:8px;">Em breve: relatorios gerenciais</p>
        </div>
    `;
}

// ============================================
// MODULO DE CAPTURA EM LOTE (2.2)
// ============================================


function renderCapturaLote(container) {
    container.innerHTML = `
        <div class="module-header">
            <h1>Captura em Lote</h1>
            <div class="module-actions">
                <span style="font-size:13px;color:var(--color-text-secondary);">2.2 - Captura em Lote</span>
                <button class="btn-secondary" onclick="baixarModeloLote()" style="font-size:12px;padding:6px 14px;">Baixar Modelo</button>
            </div>
        </div>

        <div style="background:var(--color-primary-bg);padding:24px;border-radius:12px;border:1px solid var(--color-bg);margin-bottom:24px;">
            <h2 style="font-size:16px;font-weight:600;color:var(--color-text);margin:0 0 16px 0;">Importar Lote de Documentos (2.2.1)</h2>
            
            <div class="form-row">
                <div class="form-group" style="flex:2;">
                    <label>Arquivo JSON</label>
                    <input type="file" id="lote-file" accept=".json" style="padding:8px;" />
                    <span class="helper-text">Selecione um arquivo .json com o array de documentos</span>
                </div>
            </div>

            <div style="margin-top:12px; display:flex; gap:8px; flex-wrap:wrap;">
                <button class="btn-primary" id="btn-validar-lote">Validar Lote (2.2.1)</button>
                <button class="btn-success" id="btn-importar-lote" style="background:var(--color-success);color:white;border:none;padding:10px 28px;border-radius:8px;font-size:14px;font-weight:500;cursor:pointer;">Importar Lote</button>
                <button class="btn-secondary" onclick="document.getElementById('lote-file').value=''; document.getElementById('lote-preview-container').innerHTML='';" style="font-size:12px;padding:6px 14px;">Limpar</button>
            </div>

            <div id="lote-preview-container" style="margin-top:16px;"></div>
        </div>

        <hr />

        <div id="lote-resultado-container">
            <h2>Resultado da Importacao</h2>
            <div id="lote-resultado"></div>
        </div>
    `;
    initCapturaLote();
}

function initCapturaLote() {
    const fileInput = document.getElementById('lote-file');
    const previewContainer = document.getElementById('lote-preview-container');

    function lerArquivoLote() {
        const file = fileInput.files[0];
        if (!file) {
            previewContainer.innerHTML = '<p style="color:var(--color-text-muted);font-size:13px;">Selecione um arquivo JSON.</p>';
            return null;
        }

        const reader = new FileReader();
        reader.onload = function (event) {
            try {
                const data = JSON.parse(event.target.result);
                let documentos = [];

                if (Array.isArray(data)) {
                    documentos = data;
                } else if (data.documentos && Array.isArray(data.documentos)) {
                    documentos = data.documentos;
                } else {
                    previewContainer.innerHTML = '<p style="color:var(--color-danger-text);font-size:13px;">Formato invalido. Esperado: array de documentos ou objeto com campo "documentos".</p>';
                    return;
                }

                if (documentos.length === 0) {
                    previewContainer.innerHTML = '<p style="color:var(--color-text-muted);font-size:13px;">Nenhum documento encontrado no arquivo.</p>';
                    return;
                }

                if (documentos.length > 1000) {
                    previewContainer.innerHTML = '<p style="color:var(--color-danger-text);font-size:13px;">Limite maximo de 1000 documentos por lote.</p>';
                    return;
                }

                lotePreview = documentos;
                mostrarPreviewLote(documentos);
            } catch (e) {
                previewContainer.innerHTML = '<p style="color:var(--color-danger-text);font-size:13px;">Erro ao ler arquivo: ' + e.message + '</p>';
            }
        };
        reader.readAsText(file);
    }

    fileInput.addEventListener('change', lerArquivoLote);

    document.getElementById('btn-validar-lote').addEventListener('click', async function () {
        if (lotePreview.length === 0) {
            alert('Carregue um arquivo primeiro');
            return;
        }

        this.textContent = 'Validando...';
        this.disabled = true;

        try {
            const resp = await fetch(`${API_URL}/captura/lote/validar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ documentos: lotePreview })
            });
            const resultado = await resp.json();

            if (!resp.ok) {
                alert('Erro na validacao: ' + (resultado.erro || 'Falha desconhecida'));
                return;
            }

            let msg = `Validacao concluida!\n`;
            msg += `Total: ${resultado.total}\n`;
            msg += `Validos: ${resultado.validos}\n`;
            msg += `Invalidos: ${resultado.invalidos}\n`;

            if (resultado.classes_nao_encontradas && resultado.classes_nao_encontradas.length > 0) {
                msg += `\nClasses nao encontradas: ${resultado.classes_nao_encontradas.join(', ')}`;
            }

            if (resultado.erros && resultado.erros.length > 0) {
                msg += `\n\nErros (${resultado.erros.length}):\n`;
                resultado.erros.slice(0, 10).forEach(e => {
                    msg += `- [${e.indice}] ${e.titulo}: ${e.erros.join(', ')}\n`;
                });
                if (resultado.erros.length > 10) {
                    msg += `... e mais ${resultado.erros.length - 10} erros`;
                }
            }

            alert(msg);
            mostrarPreviewLote(lotePreview, resultado);

        } catch (erro) {
            alert('Erro: ' + erro.message);
        } finally {
            this.textContent = 'Validar Lote (2.2.1)';
            this.disabled = false;
        }
    });

    document.getElementById('btn-importar-lote').addEventListener('click', async function () {
        if (lotePreview.length === 0) {
            alert('Carregue um arquivo primeiro');
            return;
        }

        if (!confirm(`Importar ${lotePreview.length} documentos em lote?`)) return;

        this.textContent = 'Importando...';
        this.disabled = true;

        try {
            const resp = await fetch(`${API_URL}/captura/lote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ documentos: lotePreview })
            });
            const resultado = await resp.json();

            if (!resp.ok) {
                alert('Erro na importacao: ' + (resultado.erro || 'Falha desconhecida'));
                this.textContent = 'Importar Lote';
                this.disabled = false;
                return;
            }

            let msg = `Importacao em lote concluida!\n`;
            msg += `Total enviado: ${resultado.total_enviado}\n`;
            msg += `Importados: ${resultado.importados}\n`;
            msg += `Ignorados: ${resultado.ignorados}\n`;

            if (resultado.erros && resultado.erros.length > 0) {
                msg += `\nErros (${resultado.erros.length}):\n`;
                resultado.erros.slice(0, 10).forEach(e => {
                    msg += `- ${e}\n`;
                });
                if (resultado.erros.length > 10) {
                    msg += `... e mais ${resultado.erros.length - 10} erros`;
                }
            }

            alert(msg);

            document.getElementById('lote-resultado').innerHTML = `
                <div style="background:var(--color-primary-bg);padding:16px;border-radius:8px;border:1px solid var(--color-bg);margin-top:12px;">
                    <strong>Resultado da Importacao:</strong>
                    <div style="display:flex;gap:20px;flex-wrap:wrap;margin-top:8px;">
                        <span style="color:var(--color-success);">Importados: ${resultado.importados}</span>
                        <span style="color:var(--color-danger-text);">Ignorados: ${resultado.ignorados}</span>
                        <span style="color:var(--color-text-secondary);">Total: ${resultado.total_enviado}</span>
                    </div>
                    ${resultado.resultados && resultado.resultados.length > 0 ? `
                        <div style="margin-top:8px;font-size:13px;color:var(--color-text-secondary);">
                            <strong>IDs gerados:</strong> ${resultado.resultados.map(r => r.id).join(', ')}
                        </div>
                    ` : ''}
                </div>
            `;

            lotePreview = [];
            document.getElementById('lote-file').value = '';
            document.getElementById('lote-preview-container').innerHTML = '';

            await carregarDocumentosCapturados();
            await atualizarTodosBadges();

        } catch (erro) {
            alert('Erro: ' + erro.message);
        } finally {
            this.textContent = 'Importar Lote';
            this.disabled = false;
        }
    });
}

function mostrarPreviewLote(documentos, validacao) {
    const container = document.getElementById('lote-preview-container');
    if (!container) return;

    let html = `
        <div style="background:var(--color-bg-card);border-radius:8px;border:1px solid var(--color-bg);padding:16px;">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                <strong>Preview do Lote (${documentos.length} documentos)</strong>
                <span style="font-size:12px;color:var(--color-text-muted);">Role para visualizar</span>
            </div>
            <div style="max-height:300px;overflow-y:auto;margin-top:8px;font-size:13px;">
                <table style="width:100%;border-collapse:collapse;">
                    <thead>
                        <tr style="background:var(--color-primary-bg);border-bottom:2px solid var(--color-border);">
                            <th style="padding:6px 8px;text-align:left;font-weight:600;color:var(--color-text-secondary);font-size:11px;">#</th>
                            <th style="padding:6px 8px;text-align:left;font-weight:600;color:var(--color-text-secondary);font-size:11px;">Titulo</th>
                            <th style="padding:6px 8px;text-align:left;font-weight:600;color:var(--color-text-secondary);font-size:11px;">Classe</th>
                            <th style="padding:6px 8px;text-align:left;font-weight:600;color:var(--color-text-secondary);font-size:11px;">Autor</th>
                            <th style="padding:6px 8px;text-align:left;font-weight:600;color:var(--color-text-secondary);font-size:11px;">Status</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    documentos.slice(0, 50).forEach((doc, index) => {
        const status = validacao && validacao.erros ?
            (validacao.erros.some(e => e.indice === index) ? 'Invalido' : 'Valido') :
            'Pendente';
        const statusColor = status.includes('Valido') ? 'var(--color-success)' : status.includes('Invalido') ? 'var(--color-danger-text)' : 'var(--color-warning)';

        html += `
            <tr style="border-bottom:1px solid var(--color-bg);">
                <td style="padding:6px 8px;color:var(--color-text-muted);">${index + 1}</td>
                <td style="padding:6px 8px;font-weight:500;">${doc.titulo || 'Sem titulo'}</td>
                <td style="padding:6px 8px;font-family:monospace;color:var(--color-primary);">${doc.classe_codigo || doc.classe_id || '-'}</td>
                <td style="padding:6px 8px;">${doc.autor || '-'}</td>
                <td style="padding:6px 8px;color:${statusColor};">${status}</td>
            </tr>
        `;
    });

    if (documentos.length > 50) {
        html += `
            <tr>
                <td colspan="5" style="padding:8px;text-align:center;color:var(--color-text-muted);font-style:italic;">
                    ... e mais ${documentos.length - 50} documentos
                </td>
            </tr>
        `;
    }

    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

function baixarModeloLote() {
    fetch(`${API_URL}/captura/lote/modelo`)
        .then(r => r.json())
        .then(data => {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `modelo_lote_captura.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        })
        .catch(err => alert('Erro ao baixar modelo: ' + err.message));
}

// ============================================
// MODULO DE CAPTURA DE E-MAIL (2.3)
// ============================================


function renderCapturaEmail(container) {
    container.innerHTML = `
        <div class="module-header">
            <h1>Captura de Mensagens de Correio Eletronico</h1>
            <div class="module-actions">
                <span style="font-size:13px;color:var(--color-text-secondary);">2.3 - Captura de E-mail</span>
                <button class="btn-secondary" onclick="baixarModeloEmail()" style="font-size:12px;padding:6px 14px;">Baixar Modelo</button>
                <button class="btn-secondary" onclick="carregarEmailsCapturados()" style="font-size:12px;padding:6px 14px;">Atualizar Lista</button>
            </div>
        </div>

        <div id="form-email" style="background:var(--color-primary-bg);padding:24px;border-radius:12px;border:1px solid var(--color-bg);margin-bottom:24px;">
            <h2 style="font-size:16px;font-weight:600;color:var(--color-text);margin:0 0 16px 0;">Novo E-mail (2.3.1)</h2>
            
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div style="grid-column:1 / -1;">
                    <div class="form-group">
                        <label>Assunto *</label>
                        <input type="text" id="email-assunto" placeholder="Assunto do e-mail" style="width:100%;padding:8px 12px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;" />
                    </div>
                </div>
                <div style="grid-column:1 / -1;">
                    <div class="form-group">
                        <label>Corpo da Mensagem</label>
                        <textarea id="email-corpo" rows="4" placeholder="Corpo da mensagem" style="width:100%;padding:8px 12px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;font-family:inherit;resize:vertical;"></textarea>
                    </div>
                </div>
                <div>
                    <div class="form-group">
                        <label>Remetente (2.3.3)</label>
                        <input type="text" id="email-remetente" placeholder="email@dominio.com" style="width:100%;padding:8px 12px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;" />
                    </div>
                </div>
                <div>
                    <div class="form-group">
                        <label>Nome do Remetente (2.3.3)</label>
                        <input type="text" id="email-remetente-nome" placeholder="Nome do remetente" style="width:100%;padding:8px 12px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;" />
                    </div>
                </div>
                <div>
                    <div class="form-group">
                        <label>Destinatarios</label>
                        <input type="text" id="email-destinatarios" placeholder="destinatario@dominio.com" style="width:100%;padding:8px 12px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;" />
                    </div>
                </div>
                <div>
                    <div class="form-group">
                        <label>Nomes dos Destinatarios</label>
                        <input type="text" id="email-destinatarios-nomes" placeholder="Nome do destinatario" style="width:100%;padding:8px 12px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;" />
                    </div>
                </div>
                <div>
                    <div class="form-group">
                        <label>Data de Envio</label>
                        <input type="datetime-local" id="email-data-envio" style="width:100%;padding:8px 12px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;" />
                    </div>
                </div>
                <div>
                    <div class="form-group">
                        <label>Data de Recebimento</label>
                        <input type="datetime-local" id="email-data-recebimento" style="width:100%;padding:8px 12px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;" />
                    </div>
                </div>
                <div>
                    <div class="form-group">
                        <label>ID da Mensagem</label>
                        <input type="text" id="email-id-mensagem" placeholder="<abc123@servidor.com>" style="width:100%;padding:8px 12px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;" />
                    </div>
                </div>
                <div>
                    <div class="form-group">
                        <label>Prioridade</label>
                        <select id="email-prioridade" style="width:100%;padding:8px 12px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;">
                            <option value="normal">Normal</option>
                            <option value="alta">Alta</option>
                            <option value="baixa">Baixa</option>
                        </select>
                    </div>
                </div>
                <div>
                    <div class="form-group">
                        <label>Classe (2.1.1)</label>
                        <select id="email-classe" style="width:100%;padding:8px 12px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;">
                            <option value="">Selecione uma classe</option>
                        </select>
                    </div>
                </div>
                <div>
                    <div class="form-group">
                        <label>Titulo (opcional)</label>
                        <input type="text" id="email-titulo" placeholder="Titulo alternativo" style="width:100%;padding:8px 12px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;" />
                    </div>
                </div>
                <div>
                    <div class="form-group">
                        <label>Autor</label>
                        <input type="text" id="email-autor" placeholder="Autor" style="width:100%;padding:8px 12px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;" />
                    </div>
                </div>
                <div>
                    <div class="form-group">
                        <label>Restricao de Acesso</label>
                        <input type="text" id="email-restricao" placeholder="Publico, Restrito..." style="width:100%;padding:8px 12px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;" />
                    </div>
                </div>
                <div>
                    <div class="form-group">
                        <label>Palavras-chave</label>
                        <input type="text" id="email-palavras" placeholder="palavra1, palavra2" style="width:100%;padding:8px 12px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;" />
                    </div>
                </div>
                <div>
                    <div class="form-group">
                        <label>Localizacao</label>
                        <input type="text" id="email-localizacao" placeholder="Local fisico ou digital" style="width:100%;padding:8px 12px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;" />
                    </div>
                </div>
            </div>

            <div style="margin-top:16px; border-top:1px solid var(--color-bg); padding-top:16px;">
                <h3 style="font-size:14px;font-weight:500;margin-bottom:8px;">Anexos (2.3.2)</h3>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                    <button class="btn-secondary" onclick="adicionarAnexoEmail()" style="font-size:12px;padding:6px 14px;">+ Adicionar Anexo</button>
                    <span style="font-size:12px;color:var(--color-text-muted);">Arquivos anexados ao e-mail</span>
                </div>
                <div id="email-anexos-list" style="margin-top:8px;"></div>
            </div>

            <div style="margin-top:16px; display:flex; gap:8px; flex-wrap:wrap;">
                <button class="btn-primary" id="btn-capturar-email">Capturar E-mail (2.3.1)</button>
                <button class="btn-secondary" onclick="limparFormularioEmail()" style="font-size:12px;padding:6px 14px;">Limpar</button>
            </div>
        </div>

        <hr />

        <div id="email-list">
            <h2>E-mails Capturados</h2>
            <div id="email-table-container"></div>
        </div>
    `;

    initCapturaEmail();
}

function limparFormularioEmail() {
    document.getElementById('email-assunto').value = '';
    document.getElementById('email-corpo').value = '';
    document.getElementById('email-remetente').value = '';
    document.getElementById('email-remetente-nome').value = '';
    document.getElementById('email-destinatarios').value = '';
    document.getElementById('email-destinatarios-nomes').value = '';
    document.getElementById('email-data-envio').value = '';
    document.getElementById('email-data-recebimento').value = '';
    document.getElementById('email-id-mensagem').value = '';
    document.getElementById('email-titulo').value = '';
    document.getElementById('email-autor').value = '';
    document.getElementById('email-restricao').value = '';
    document.getElementById('email-palavras').value = '';
    document.getElementById('email-localizacao').value = '';
    document.getElementById('email-prioridade').value = 'normal';
    document.getElementById('email-classe').value = '';
    emailAnexos = [];
    document.getElementById('email-anexos-list').innerHTML = '<p style="color:var(--color-text-muted);font-size:13px;">Nenhum anexo adicionado.</p>';
}

async function initCapturaEmail() {
    console.log('Inicializando modulo de Captura de E-mail...');

    try {
        const resp = await fetch(`${API_URL}/classes`);
        const classes = await resp.json();
        const select = document.getElementById('email-classe');
        if (select) {
            select.innerHTML = '<option value="">Selecione uma classe</option>';
            classes.filter(c => c.id !== 1 && c.pode_classificar === 1 && c.ativa === 1).forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.id;
                opt.textContent = `${c.codigo} - ${c.nome}`;
                select.appendChild(opt);
            });
        }
    } catch (e) {
        console.error('Erro ao carregar classes:', e);
    }

    renderizarAnexosEmail();

    const btnCapturar = document.getElementById('btn-capturar-email');
    if (btnCapturar) {
        btnCapturar.addEventListener('click', capturarEmail);
    } else {
        console.error('Botao btn-capturar-email nao encontrado!');
    }

    await carregarEmailsCapturados();
}

async function capturarEmail() {
    console.log('Capturando e-mail...');

    const assunto = document.getElementById('email-assunto').value.trim();
    const corpo = document.getElementById('email-corpo').value.trim();
    const remetente = document.getElementById('email-remetente').value.trim();
    const remetente_nome = document.getElementById('email-remetente-nome').value.trim();
    const destinatarios = document.getElementById('email-destinatarios').value.trim();
    const destinatarios_nomes = document.getElementById('email-destinatarios-nomes').value.trim();
    const data_envio = document.getElementById('email-data-envio').value;
    const data_recebimento = document.getElementById('email-data-recebimento').value;
    const identificador_mensagem = document.getElementById('email-id-mensagem').value.trim();
    const prioridade = document.getElementById('email-prioridade').value;
    const classe_id = document.getElementById('email-classe').value;
    const titulo = document.getElementById('email-titulo').value.trim();
    const autor = document.getElementById('email-autor').value.trim();
    const restricao_acesso = document.getElementById('email-restricao').value.trim();
    const palavras_chave = document.getElementById('email-palavras').value.trim();
    const localizacao = document.getElementById('email-localizacao').value.trim();
    const anexos = emailAnexos;

    if (!classe_id) {
        alert('Selecione uma classe para o e-mail (2.1.1)');
        return;
    }
    if (!assunto) {
        alert('O assunto do e-mail é obrigatorio (2.3.1)');
        return;
    }

    try {
        const metadados_email = {
            assunto: assunto,
            corpo: corpo || null,
            remetente: remetente || null,
            remetente_nome: remetente_nome || null,
            destinatarios: destinatarios || null,
            destinatarios_nomes: destinatarios_nomes || null,
            data_envio: data_envio || null,
            data_recebimento: data_recebimento || null,
            identificador_mensagem: identificador_mensagem || null,
            prioridade: prioridade || 'normal',
            anexos: anexos.length > 0 ? anexos : null,
            qtd_anexos: anexos.length
        };

        const dados = {
            classe_id: parseInt(classe_id),
            titulo: titulo || assunto,
            descricao: corpo || null,
            autor: autor || remetente_nome || remetente || 'Desconhecido',
            data_producao: data_envio || null,
            tipo_meio: 'digital',
            status_documento: 'original',
            versao: '1.0',
            restricao_acesso: restricao_acesso || null,
            palavras_chave: palavras_chave || null,
            localizacao: localizacao || null,
            metadados_email: metadados_email,
            componentes: anexos.map(a => ({
                nome: a.nome,
                formato: a.formato || 'unknown',
                tamanho: a.tamanho || 0,
                nivel_composicao: 0
            }))
        };

        const resp = await fetch(`${API_URL}/captura/email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        const resultado = await resp.json();

        if (!resp.ok) {
            alert('Erro: ' + (resultado.erro || 'Falha desconhecida'));
            return;
        }

        let msg = `E-mail capturado com sucesso! (2.3.1)\n\n`;
        msg += `Identificador: ${resultado.identificador || resultado.id}\n`;
        msg += `Assunto: ${assunto}\n`;
        msg += `Remetente: ${remetente_nome || remetente || 'N/A'}\n`;
        msg += `Data: ${data_envio ? new Date(data_envio).toLocaleString('pt-BR') : 'N/A'}\n`;
        msg += `Anexos: ${anexos.length}`;
        alert(msg);

        limparFormularioEmail();
        await carregarEmailsCapturados();
        await atualizarTodosBadges();

    } catch (erro) {
        console.error('Erro ao capturar e-mail:', erro);
        alert('Erro ao capturar e-mail: ' + erro.message);
    }
}

function adicionarAnexoEmail() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Adicionar Anexo (2.3.2)</h2>
            <p class="modal-subtitle">Adicione um anexo ao e-mail</p>
            <hr>
            <div class="form-group">
                <label>Nome do Arquivo *</label>
                <input type="text" id="anexo-nome" placeholder="Ex: documento.pdf" />
                <span class="helper-text">Nome do arquivo anexado</span>
            </div>
            <div class="form-group">
                <label>Formato</label>
                <input type="text" id="anexo-formato" placeholder="Ex: pdf, docx, jpg" />
                <span class="helper-text">Extensao ou tipo do arquivo</span>
            </div>
            <div class="form-group">
                <label>Tamanho (bytes)</label>
                <input type="number" id="anexo-tamanho" placeholder="0" />
                <span class="helper-text">Tamanho do arquivo em bytes</span>
            </div>
            <div class="modal-actions">
                <button class="btn-primary" id="btn-add-anexo">Adicionar</button>
                <button class="btn-secondary" id="btn-fechar-anexo">Cancelar</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('btn-fechar-anexo').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

    document.getElementById('btn-add-anexo').addEventListener('click', () => {
        const nome = document.getElementById('anexo-nome').value.trim();
        const formato = document.getElementById('anexo-formato').value.trim();
        const tamanho = parseInt(document.getElementById('anexo-tamanho').value) || 0;

        if (!nome) {
            alert('Nome do anexo é obrigatorio');
            return;
        }

        emailAnexos.push({
            nome: nome,
            formato: formato || 'unknown',
            tamanho: tamanho
        });

        renderizarAnexosEmail();
        modal.remove();
        alert(`Anexo "${nome}" adicionado com sucesso! (2.3.2)`);
    });
}

function renderizarAnexosEmail() {
    const container = document.getElementById('email-anexos-list');
    if (!container) return;

    if (emailAnexos.length === 0) {
        container.innerHTML = '<p style="color:var(--color-text-muted);font-size:13px;">Nenhum anexo adicionado.</p>';
        return;
    }

    let html = '<div style="display:flex;flex-wrap:wrap;gap:8px;">';
    emailAnexos.forEach((anexo, index) => {
        const tamanhoFormatado = anexo.tamanho > 0 ? `${(anexo.tamanho / 1024).toFixed(1)} KB` : '0 KB';
        html += `
            <div style="background:var(--color-bg);padding:4px 12px;border-radius:6px;font-size:12px;display:flex;align-items:center;gap:8px;">
                <span>${anexo.nome} (${anexo.formato}) - ${tamanhoFormatado}</span>
                <button onclick="removerAnexoEmail(${index})" style="background:none;border:none;color:var(--color-danger-text);cursor:pointer;font-size:14px;" title="Remover anexo">✕</button>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

function removerAnexoEmail(index) {
    if (!confirm(`Remover anexo "${emailAnexos[index].nome}"?`)) return;
    emailAnexos.splice(index, 1);
    renderizarAnexosEmail();
}

async function carregarEmailsCapturados() {
    try {
        const container = document.getElementById('email-table-container');
        if (!container) return;

        container.innerHTML = '<p style="color:var(--color-text-muted);font-size:13px;">Carregando e-mails...</p>';

        const resp = await fetch(`${API_URL}/captura/emails`);
        if (!resp.ok) {
            throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
        }

        const emails = await resp.json();

        if (Array.isArray(emails) && emails.length > 0) {
            renderizarListaEmails(emails);
        } else {
            container.innerHTML = '<p style="color:var(--color-text-muted);font-size:13px;">Nenhum e-mail capturado.</p>';
        }

        await atualizarTodosBadges();

    } catch (erro) {
        console.error('Erro ao carregar e-mails:', erro);
        const container = document.getElementById('email-table-container');
        if (container) {
            container.innerHTML = '<p style="color:var(--color-danger-text);font-size:13px;">Erro ao carregar e-mails: ' + erro.message + '</p>';
        }
    }
}

function renderizarListaEmails(emails) {
    const container = document.getElementById('email-table-container');
    if (!container) return;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
        container.innerHTML = '<p style="color:var(--color-text-muted);font-size:13px;">Nenhum e-mail capturado.</p>';
        return;
    }

    let html = `<div style="overflow-x:auto;"><table><thead><tr>
        <th>Assunto</th>
        <th>Remetente</th>
        <th>Destinatarios</th>
        <th>Data</th>
        <th>Classe</th>
        <th style="text-align:center;">Anexos</th>
        <th style="text-align:center;">Acoes</th>
    </tr></thead><tbody>`;

    emails.forEach(e => {
        const metadados = e.metadados_email || {};
        const remetente = metadados.remetente_nome || metadados.remetente || e.autor || '-';
        const destinatarios = metadados.destinatarios_nomes || metadados.destinatarios || '-';
        const data = metadados.data_envio || e.data_producao || '-';
        const dataFormatada = data !== '-' ? new Date(data).toLocaleString('pt-BR') : '-';
        const qtdAnexos = e.num_anexos || (metadados.anexos ? metadados.anexos.length : 0);
        const prioridade = metadados.prioridade || 'normal';

        html += `
            <tr>
                <td><strong>${e.titulo || e.assunto || metadados.assunto || '-'}</strong></td>
                <td>${remetente}</td>
                <td style="font-size:12px;max-width:150px;word-break:break-all;">${destinatarios}</td>
                <td style="font-size:12px;">${dataFormatada}</td>
                <td>${e.classe_codigo || '-'}</td>
                <td style="text-align:center;">${qtdAnexos > 0 ? qtdAnexos : '-'}</td>
                <td style="text-align:center;white-space:nowrap;">
                    <button onclick="verEmailCapturado(${e.id})" style="background:none;border:1px solid var(--color-border);padding:2px 10px;border-radius:4px;font-size:11px;cursor:pointer;" title="Ver detalhes">Ver</button>
                    <button onclick="relacionarEmailDocumento(${e.id})" style="background:none;border:1px solid var(--color-success);padding:2px 10px;border-radius:4px;font-size:11px;cursor:pointer;color:var(--color-success);" title="Relacionar a documento">Relacionar</button>
                    <button onclick="exportarEmail(${e.id})" style="background:none;border:1px solid var(--color-primary);padding:2px 10px;border-radius:4px;font-size:11px;cursor:pointer;color:var(--color-primary);" title="Exportar">Exportar</button>
                </td>
            </tr>
        `;
    });

    html += `</tbody></table></div>`;
    container.innerHTML = html;
}

async function verEmailCapturado(id) {
    try {
        const resp = await fetch(`${API_URL}/captura/email/${id}`);
        if (!resp.ok) throw new Error('E-mail não encontrado');

        const email = await resp.json();
        const metadados = email.metadados_email || {};

        let classeNome = email.classe_nome || '';
        let classeCodigo = email.classe_codigo || '';
        try {
            const respClasse = await fetch(`${API_URL}/classes/${email.classe_id}`);
            const classe = await respClasse.json();
            classeNome = classe.nome;
            classeCodigo = classe.codigo;
        } catch (e) { }

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Detalhes do E-mail</h2>
                <p class="modal-subtitle">ID: ${email.identificador || email.id}</p>
                <hr>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:14px;">
                    <div><strong>Assunto:</strong> ${email.titulo || metadados.assunto || '-'}</div>
                    <div><strong>Classe:</strong> ${classeCodigo} - ${classeNome}</div>
                    <div><strong>Remetente:</strong> ${metadados.remetente_nome || metadados.remetente || email.autor || '-'}</div>
                    <div><strong>Destinatarios:</strong> ${metadados.destinatarios_nomes || metadados.destinatarios || '-'}</div>
                    <div><strong>Data Envio:</strong> ${metadados.data_envio ? new Date(metadados.data_envio).toLocaleString('pt-BR') : '-'}</div>
                    <div><strong>Data Recebimento:</strong> ${metadados.data_recebimento ? new Date(metadados.data_recebimento).toLocaleString('pt-BR') : '-'}</div>
                    <div><strong>Prioridade:</strong> ${metadados.prioridade || 'normal'}</div>
                    <div><strong>ID Mensagem:</strong> ${metadados.identificador_mensagem || '-'}</div>
                    <div><strong>Autor:</strong> ${email.autor || '-'}</div>
                    <div><strong>Restricao:</strong> ${email.restricao_acesso || '-'}</div>
                    <div><strong>Localizacao:</strong> ${email.localizacao || '-'}</div>
                    <div><strong>Anexos:</strong> ${email.num_anexos || metadados.qtd_anexos || 0}</div>
                </div>
                ${email.descricao || metadados.corpo ? `
                    <div style="margin-top:12px;">
                        <strong>Mensagem:</strong>
                        <div style="background:var(--color-primary-bg);padding:12px;border-radius:8px;margin-top:4px;font-size:13px;max-height:150px;overflow-y:auto;white-space:pre-wrap;border:1px solid var(--color-bg);">${email.descricao || metadados.corpo || 'Sem conteudo'}</div>
                    </div>
                ` : ''}
                ${metadados.anexos && metadados.anexos.length > 0 ? `
                    <div style="margin-top:12px;">
                        <strong>Anexos (${metadados.anexos.length}):</strong>
                        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;">
                            ${metadados.anexos.map(a => `
                                <span style="background:var(--color-bg);padding:2px 12px;border-radius:4px;font-size:12px;">${a.nome} (${a.formato})</span>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                <div class="modal-actions">
                    <button class="btn-secondary" id="btn-fechar-email">Fechar</button>
                    ${email.id ? `<button class="btn-primary" onclick="exportarEmail(${email.id})" style="font-size:12px;padding:6px 14px;">Exportar</button>` : ''}
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('btn-fechar-email').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

    } catch (erro) {
        alert('Erro ao carregar e-mail: ' + erro.message);
    }
}

async function relacionarEmailDocumento(emailId) {
    try {
        const respDocs = await fetch(`${API_URL}/documentos`);
        if (!respDocs.ok) throw new Error('Erro ao carregar documentos');
        const docs = await respDocs.json();

        if (!docs || docs.length === 0) {
            alert('Nenhum documento disponivel para relacionar. Crie um documento primeiro.');
            return;
        }

        let options = docs
            .filter(d => d.id !== emailId)
            .slice(0, 50)
            .map(d => `<option value="${d.id}">${d.titulo || 'Sem titulo'} (ID: ${d.id})</option>`)
            .join('');

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Relacionar E-mail a Documento (2.3.2)</h2>
                <p class="modal-subtitle">Relacione este e-mail a um documento existente</p>
                <hr>
                <div class="form-group">
                    <label>Documento Destino</label>
                    <select id="rel-documento" style="width:100%;padding:8px 12px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;">
                        <option value="">Selecione um documento</option>
                        ${options}
                    </select>
                    <span class="helper-text">Selecione o documento ao qual este e-mail esta relacionado</span>
                </div>
                <div class="form-group">
                    <label>Tipo de Relacao</label>
                    <input type="text" id="rel-tipo" value="email_relacionado" placeholder="email_relacionado, referencia..." style="width:100%;padding:8px 12px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;" />
                    <span class="helper-text">Ex: email_relacionado, anexo, referencia</span>
                </div>
                <div style="background:var(--color-primary-bg);padding:12px;border-radius:8px;margin-bottom:16px;font-size:13px;color:var(--color-text-secondary);border:1px solid var(--color-bg);">
                    <strong>E-mail:</strong> ${await getEmailTitulo(emailId)}
                </div>
                <div class="modal-actions">
                    <button class="btn-primary" id="btn-relacionar">Relacionar</button>
                    <button class="btn-secondary" id="btn-fechar-rel">Cancelar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('btn-fechar-rel').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

        document.getElementById('btn-relacionar').addEventListener('click', async () => {
            const documento_id = document.getElementById('rel-documento').value;
            const tipo_relacao = document.getElementById('rel-tipo').value.trim() || 'email_relacionado';

            if (!documento_id) {
                alert('Selecione um documento destino');
                return;
            }

            try {
                const resp = await fetch(`${API_URL}/captura/email/relacionar`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email_id: emailId, documento_id, tipo_relacao })
                });
                const dados = await resp.json();
                if (!resp.ok) {
                    alert('Erro: ' + dados.erro);
                    return;
                }
                alert(dados.mensagem);
                modal.remove();
                carregarEmailsCapturados();
                carregarDocumentos();
                await atualizarTodosBadges();
            } catch (erro) {
                alert('Erro: ' + erro.message);
            }
        });
    } catch (erro) {
        alert('Erro: ' + erro.message);
    }
}

async function getEmailTitulo(id) {
    try {
        const resp = await fetch(`${API_URL}/captura/email/${id}`);
        if (!resp.ok) return 'E-mail ' + id;
        const email = await resp.json();
        return email.titulo || email.assunto || 'E-mail ' + id;
    } catch (e) {
        return 'E-mail ' + id;
    }
}

async function exportarEmail(id) {
    try {
        const resp = await fetch(`${API_URL}/captura/email/${id}`);
        if (!resp.ok) throw new Error('E-mail não encontrado');

        const email = await resp.json();
        const blob = new Blob([JSON.stringify(email, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `email_${email.id || id}_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        alert('E-mail exportado com sucesso!');
    } catch (erro) {
        alert('Erro ao exportar: ' + erro.message);
    }
}

function baixarModeloEmail() {
    fetch(`${API_URL}/captura/email/modelo`)
        .then(r => r.json())
        .then(data => {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `modelo_email_${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            alert('Modelo baixado com sucesso!');
        })
        .catch(err => alert('Erro ao baixar modelo: ' + err.message));
}

// ============================================
// EXPORTA FUNÇÕES PARA USO GLOBAL
// ============================================

window.adicionarAnexoEmail = adicionarAnexoEmail;
window.removerAnexoEmail = removerAnexoEmail;
window.verEmailCapturado = verEmailCapturado;
window.relacionarEmailDocumento = relacionarEmailDocumento;
window.exportarEmail = exportarEmail;
window.baixarModeloEmail = baixarModeloEmail;
window.limparFormularioEmail = limparFormularioEmail;
window.carregarEmailsCapturados = carregarEmailsCapturados;
window.gerenciarMetadadosClasse = gerenciarMetadadosClasse;
window.gerenciarMetadadosClasseSelecionada = gerenciarMetadadosClasseSelecionada;

// ============================================
// 2.1.10 - TESAURO (VERSÃO CORRIGIDA - SEM LOOP)
// ============================================

let tesauroAtivado = false;

function ativarTesauro() {
    // Evita ativação múltipla
    if (tesauroAtivado) {
        console.log('⏭️ Tesauro já ativado, ignorando...');
        return;
    }

    console.log('🔥 ATIVANDO TESAURO...');

    const input = document.getElementById('captura-palavras');
    const sugestoes = document.getElementById('tesauro-sugestoes');

    if (!input || !sugestoes) {
        console.log('⏳ Aguardando campo carregar...');
        return;
    }

    console.log('✅ Campo e dropdown encontrados');

    // Remove eventos antigos (evita duplicação)
    const novoInput = input.cloneNode(true);
    input.parentNode.replaceChild(novoInput, input);

    const novoInputRef = document.getElementById('captura-palavras');
    const sugestoesRef = document.getElementById('tesauro-sugestoes');

    novoInputRef.addEventListener('input', function () {
        const termo = this.value.trim();

        if (termo.length < 2) {
            sugestoesRef.style.display = 'none';
            return;
        }

        const partes = termo.split(',').map(p => p.trim());
        const ultima = partes[partes.length - 1];

        if (ultima.length < 2) {
            sugestoesRef.style.display = 'none';
            return;
        }

        fetch(`${API_URL}/tesauro/busca?termo=${encodeURIComponent(ultima)}&limite=5`)
            .then(r => r.json())
            .then(termos => {
                if (!termos || termos.length === 0) {
                    sugestoesRef.style.display = 'none';
                    return;
                }

                const rect = this.getBoundingClientRect();
                sugestoesRef.style.position = 'fixed';
                sugestoesRef.style.top = (rect.bottom + 2) + 'px';
                sugestoesRef.style.left = rect.left + 'px';
                sugestoesRef.style.width = rect.width + 'px';
                sugestoesRef.style.display = 'block';
                sugestoesRef.style.background = 'white';
                sugestoesRef.style.border = '1px solid #ccd2db';
                sugestoesRef.style.borderRadius = '4px';
                sugestoesRef.style.maxHeight = '180px';
                sugestoesRef.style.overflowY = 'auto';
                sugestoesRef.style.zIndex = '99999';
                sugestoesRef.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';

                sugestoesRef.innerHTML = termos.map(t => `
                    <div style="padding:8px 14px;cursor:pointer;border-bottom:1px solid #e2e6ec;font-size:13px;"
                          onmouseover="this.style.backgroundColor='#f1f3f6'" 
                          onmouseout="this.style.backgroundColor='transparent'"
                          onclick="selecionarTermoFinal('${t.termo.replace(/'/g, "\\'")}')">
                        <strong>${t.termo}</strong>
                        ${t.definicao ? `<span style="color:#5c6b7a;font-size:11px;margin-left:8px;">${t.definicao}</span>` : ''}
                    </div>
                `).join('');
            })
            .catch(() => sugestoesRef.style.display = 'none');
    });

    document.addEventListener('click', function (e) {
        if (sugestoesRef && novoInputRef && !sugestoesRef.contains(e.target) && e.target !== novoInputRef) {
            sugestoesRef.style.display = 'none';
        }
    });

    tesauroAtivado = true;
    console.log('✅ TESAURO ATIVADO!');
}

// Função global para selecionar termo
window.selecionarTermoFinal = function (termo) {
    const input = document.getElementById('captura-palavras');
    if (!input) return;

    const partes = input.value.split(',').map(p => p.trim());
    partes[partes.length - 1] = termo;
    input.value = partes.join(', ') + ', ';
    input.focus();

    const sugestoes = document.getElementById('tesauro-sugestoes');
    if (sugestoes) sugestoes.style.display = 'none';
};

// Ativa o tesauro quando o DOM muda - MAS APENAS UMA VEZ
let observerAtivo = false;

function iniciarObserverTesauro() {
    if (observerAtivo) return;
    observerAtivo = true;

    const observer = new MutationObserver(function () {
        if (!tesauroAtivado && document.getElementById('captura-palavras')) {
            console.log('🔍 Detectou campo de palavras-chave, ativando tesauro...');
            ativarTesauro();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Tenta ativar uma única vez após um tempo
    setTimeout(function () {
        if (!tesauroAtivado) {
            ativarTesauro();
        }
    }, 1000);
}

// Inicia o observer APENAS UMA VEZ
iniciarObserverTesauro();

// EXPORTA FUNÇÕES PARA USO GLOBAL
window.abrirGerenciarTesauro = function () {
    fetch(`${API_URL}/tesauro`)
        .then(r => r.json())
        .then(termos => {
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.innerHTML = `
                <div class="modal-content" style="max-width:700px;">
                    <h2>Gerenciar Tesauro (2.1.10)</h2>
                    <p class="modal-subtitle">Vocabulário controlado para indexação de documentos</p>
                    <hr>
                    <div style="margin-bottom:16px;display:flex;gap:8px;flex-wrap:wrap;">
                        <input type="text" id="novo-termo" placeholder="Novo termo" style="flex:2;min-width:150px;padding:8px 12px;border:1px solid var(--color-border);border-radius:4px;font-size:13px;" />
                        <input type="text" id="nova-definicao" placeholder="Definição (opcional)" style="flex:3;min-width:150px;padding:8px 12px;border:1px solid var(--color-border);border-radius:4px;font-size:13px;" />
                        <button class="btn-primary" onclick="adicionarTermoTesauro()" style="padding:8px 16px;height:auto;">Adicionar</button>
                    </div>
                    <div style="max-height:350px;overflow-y:auto;border:1px solid var(--color-border-light);border-radius:4px;">
                        ${termos.map(t => `
                            <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 12px;border-bottom:1px solid var(--color-border-light);">
                                <div>
                                    <strong>${t.termo}</strong>
                                    ${t.definicao ? `<span style="color:var(--color-text-muted);font-size:12px;margin-left:8px;">${t.definicao}</span>` : ''}
                                </div>
                                <div>
                                    <button onclick="editarTermoTesauro(${t.id})" style="background:none;border:1px solid var(--color-border);padding:2px 10px;border-radius:4px;font-size:11px;cursor:pointer;">Editar</button>
                                    <button onclick="removerTermoTesauro(${t.id})" style="background:none;border:1px solid var(--color-danger);padding:2px 10px;border-radius:4px;font-size:11px;cursor:pointer;color:var(--color-danger);">Remover</button>
                                </div>
                            </div>
                        `).join('')}
                        ${termos.length === 0 ? '<div style="padding:20px;text-align:center;color:var(--color-text-muted);">Nenhum termo cadastrado</div>' : ''}
                    </div>
                    <div class="modal-actions">
                        <button class="btn-secondary" id="btn-fechar-tesauro">Fechar</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            document.getElementById('btn-fechar-tesauro').addEventListener('click', () => modal.remove());
            modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
        })
        .catch(err => alert('Erro ao carregar tesauro: ' + err.message));
};

window.adicionarTermoTesauro = function () {
    const termo = document.getElementById('novo-termo').value.trim();
    const definicao = document.getElementById('nova-definicao').value.trim();
    if (!termo) { alert('Digite um termo'); return; }

    fetch(`${API_URL}/tesauro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ termo, definicao })
    })
        .then(r => r.json())
        .then(data => {
            if (!data.id) { alert('Erro: ' + (data.erro || 'Falha')); return; }
            alert(data.mensagem);
            document.getElementById('novo-termo').value = '';
            document.getElementById('nova-definicao').value = '';
            abrirGerenciarTesauro();
        })
        .catch(err => alert('Erro: ' + err.message));
};

window.removerTermoTesauro = function (id) {
    if (!confirm('Remover este termo?')) return;
    fetch(`${API_URL}/tesauro/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo: 0 })
    })
        .then(() => { alert('Termo removido'); abrirGerenciarTesauro(); })
        .catch(err => alert('Erro: ' + err.message));
};

window.editarTermoTesauro = function (id) {
    const novoTermo = prompt('Novo nome do termo:');
    if (!novoTermo) return;
    const definicao = prompt('Definição (opcional):');

    fetch(`${API_URL}/tesauro/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ termo: novoTermo, definicao: definicao || null, ativo: 1 })
    })
        .then(() => { alert('Termo atualizado'); abrirGerenciarTesauro(); })
        .catch(err => alert('Erro: ' + err.message));
};

// ============================================
// 2.1.17 - SUGESTÃO AUTOMÁTICA DE CLASSES
// ============================================

// Monitora o título para sugerir classes
document.addEventListener('DOMContentLoaded', function () {
    const inputTitulo = document.getElementById('captura-titulo');
    const inputPalavras = document.getElementById('captura-palavras');

    if (inputTitulo) {
        let timeoutId = null;
        inputTitulo.addEventListener('input', function () {
            clearTimeout(timeoutId);
            const titulo = this.value.trim();

            if (titulo.length < 3) {
                document.getElementById('sugestoes-classes').style.display = 'none';
                return;
            }

            timeoutId = setTimeout(() => {
                buscarSugestoesClasses(titulo);
            }, 300);
        });

        // Também sugestões quando palavras-chave mudam
        if (inputPalavras) {
            inputPalavras.addEventListener('input', function () {
                const titulo = document.getElementById('captura-titulo').value.trim();
                if (titulo.length >= 3) {
                    clearTimeout(timeoutId);
                    timeoutId = setTimeout(() => {
                        buscarSugestoesClasses(titulo);
                    }, 500);
                }
            });
        }
    }
});

function buscarSugestoesClasses(titulo) {
    const palavrasChave = document.getElementById('captura-palavras').value.trim();

    let url = `${API_URL}/classes/sugerir?titulo=${encodeURIComponent(titulo)}`;
    if (palavrasChave) {
        url += `&palavras_chave=${encodeURIComponent(palavrasChave)}`;
    }

    fetch(url)
        .then(r => r.json())
        .then(sugestoes => {
            const container = document.getElementById('sugestoes-classes');
            const lista = document.getElementById('lista-sugestoes');

            if (!sugestoes || sugestoes.length === 0) {
                container.style.display = 'none';
                return;
            }

            // Verifica se a classe atual já está na lista
            const classeAtual = document.getElementById('captura-classe').value;
            const sugestoesFiltradas = sugestoes.filter(s => s.id != classeAtual);

            if (sugestoesFiltradas.length === 0) {
                container.style.display = 'none';
                return;
            }

            container.style.display = 'block';
            lista.innerHTML = sugestoesFiltradas.map(s => `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 8px;border-bottom:1px solid var(--color-border-light);cursor:pointer;"
                     onmouseover="this.style.backgroundColor='var(--color-hover)'"
                     onmouseout="this.style.backgroundColor='transparent'"
                     onclick="selecionarClasseSugerida(${s.id})">
                    <div>
                        <span style="font-family:monospace;color:var(--color-primary);font-weight:500;font-size:11px;">${s.codigo}</span>
                        <span style="font-weight:500;font-size:13px;margin-left:8px;">${s.nome}</span>
                        <span style="color:var(--color-text-muted);font-size:11px;margin-left:8px;">${s.caminho_completo || s.nome}</span>
                    </div>
                    <div>
                        <span style="font-size:11px;color:var(--color-text-muted);">${s.documentos || 0} docs</span>
                        ${s.tem_metadados ? '<span style="font-size:10px;color:var(--color-success);margin-left:4px;">✓ metadados</span>' : ''}
                    </div>
                </div>
            `).join('');
        })
        .catch(() => {
            document.getElementById('sugestoes-classes').style.display = 'none';
        });
}

window.selecionarClasseSugerida = function (classeId) {
    // Seleciona a classe no dropdown
    const select = document.getElementById('captura-classe');
    if (select) {
        select.value = classeId;
        // Dispara evento change para atualizar qualquer coisa
        select.dispatchEvent(new Event('change'));
    }
    document.getElementById('sugestoes-classes').style.display = 'none';
};

// ============================================
// 2.1.18 - FUNÇÕES DE FLUXO DE CAPTURA DISTRIBUÍDA
// ============================================

// Salvar rascunho da captura atual
window.salvarRascunhoCaptura = function () {
    const dados = coletarDadosCaptura();

    if (!dados.titulo) {
        alert('Digite pelo menos o título antes de salvar o rascunho');
        return;
    }

    fetch(`${API_URL}/captura/rascunho`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dados })
    })
        .then(r => r.json())
        .then(data => {
            if (!data.id) {
                alert('Erro: ' + (data.erro || 'Falha ao salvar rascunho'));
                return;
            }
            alert(`Rascunho salvo! ID: ${data.id}\nUse "Meus Rascunhos" para continuar.`);
        })
        .catch(err => alert('Erro: ' + err.message));
};

// Coletar todos os dados do formulário de captura
function coletarDadosCaptura() {
    return {
        classe_id: document.getElementById('captura-classe').value,
        titulo: document.getElementById('captura-titulo').value.trim(),
        descricao: document.getElementById('captura-descricao').value.trim(),
        autor: document.getElementById('captura-autor').value.trim(),
        redator: document.getElementById('captura-redator').value.trim(),
        originador: document.getElementById('captura-originador').value.trim(),
        destinatario: document.getElementById('captura-destinatario').value.trim(),
        interessado: document.getElementById('captura-interessado').value.trim(),
        numero_documento: document.getElementById('captura-numero').value.trim(),
        data_producao: document.getElementById('captura-data').value,
        localizacao: document.getElementById('captura-localizacao').value.trim(),
        tipo_meio: document.getElementById('captura-tipo').value,
        status_documento: document.getElementById('captura-status').value,
        restricao_acesso: document.getElementById('captura-restricao').value.trim(),
        assunto: document.getElementById('captura-assunto').value.trim(),
        palavras_chave: document.getElementById('captura-palavras').value.trim(),
        componentes: componentesCaptura
    };
}

// Carregar rascunho no formulário
function carregarRascunho(dados) {
    if (!dados) return;

    document.getElementById('captura-classe').value = dados.classe_id || '';
    document.getElementById('captura-titulo').value = dados.titulo || '';
    document.getElementById('captura-descricao').value = dados.descricao || '';
    document.getElementById('captura-autor').value = dados.autor || '';
    document.getElementById('captura-redator').value = dados.redator || '';
    document.getElementById('captura-originador').value = dados.originador || '';
    document.getElementById('captura-destinatario').value = dados.destinatario || '';
    document.getElementById('captura-interessado').value = dados.interessado || '';
    document.getElementById('captura-numero').value = dados.numero_documento || '';
    document.getElementById('captura-data').value = dados.data_producao || '';
    document.getElementById('captura-localizacao').value = dados.localizacao || '';
    document.getElementById('captura-tipo').value = dados.tipo_meio || 'digital';
    document.getElementById('captura-status').value = dados.status_documento || 'original';
    document.getElementById('captura-restricao').value = dados.restricao_acesso || '';
    document.getElementById('captura-assunto').value = dados.assunto || '';
    document.getElementById('captura-palavras').value = dados.palavras_chave || '';

    if (dados.componentes && Array.isArray(dados.componentes)) {
        componentesCaptura = dados.componentes;
        renderizarComponentes();
    }
}

// Atribuir rascunho a outro usuário
window.atribuirRascunho = function () {
    const dados = coletarDadosCaptura();

    if (!dados.titulo) {
        alert('Digite pelo menos o título antes de atribuir o rascunho');
        return;
    }

    // Salva primeiro o rascunho
    fetch(`${API_URL}/captura/rascunho`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dados })
    })
        .then(r => r.json())
        .then(data => {
            if (!data.id) {
                alert('Erro: ' + (data.erro || 'Falha ao salvar rascunho'));
                return;
            }

            // Pergunta para quem atribuir
            const usuario = prompt('Digite o nome do usuário para atribuir este rascunho:');
            if (!usuario) return;

            const observacao = prompt('Observação para o usuário (opcional):');

            // Atribui
            fetch(`${API_URL}/captura/rascunho/${data.id}/atribuir`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    atribuido_para: usuario,
                    observacao: observacao || null
                })
            })
                .then(r => r.json())
                .then(result => {
                    alert(result.mensagem || `Rascunho atribuído a ${usuario}`);
                })
                .catch(err => alert('Erro ao atribuir: ' + err.message));
        })
        .catch(err => alert('Erro: ' + err.message));
};

// Ver meus rascunhos
window.verMeusRascunhos = function () {
    // Simula usuário atual - em produção, pegar do sistema de autenticação
    const usuario = prompt('Digite seu nome de usuário para ver seus rascunhos:');
    if (!usuario) return;

    fetch(`${API_URL}/captura/rascunhos/${encodeURIComponent(usuario)}`)
        .then(r => r.json())
        .then(rascunhos => {
            if (!rascunhos || rascunhos.length === 0) {
                alert('Nenhum rascunho encontrado para este usuário');
                return;
            }

            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.innerHTML = `
                <div class="modal-content" style="max-width:700px;">
                    <h2>Meus Rascunhos (2.1.18)</h2>
                    <p class="modal-subtitle">${rascunhos.length} rascunho(s) encontrado(s)</p>
                    <hr>
                    <div style="max-height:400px;overflow-y:auto;">
                        ${rascunhos.map(r => `
                            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-bottom:1px solid var(--color-border-light);">
                                <div>
                                    <strong>${r.dados?.titulo || r.titulo || 'Sem título'}</strong>
                                    <div style="font-size:12px;color:var(--color-text-muted);">
                                        ${r.status === 'rascunho' ? '📝 Rascunho' :
                    r.status === 'atribuido' ? '📨 Atribuído' :
                        '⏳ Em andamento'}
                                        ${r.atribuido_por ? ` | Criado por: ${r.atribuido_por}` : ''}
                                        ${r.data_atribuicao ? ` | Data: ${new Date(r.data_atribuicao).toLocaleString()}` : ''}
                                    </div>
                                </div>
                                <div>
                                    ${r.status === 'atribuido' ?
                    `<button onclick="assumirRascunho(${r.id})" style="background:var(--color-primary);color:white;border:none;padding:4px 12px;border-radius:4px;font-size:11px;cursor:pointer;">Assumir</button>` :
                    `<button onclick="continuarRascunho(${r.id})" style="background:var(--color-success);color:white;border:none;padding:4px 12px;border-radius:4px;font-size:11px;cursor:pointer;">Continuar</button>`
                }
                                    <button onclick="removerRascunho(${r.id})" style="background:var(--color-danger);color:white;border:none;padding:4px 12px;border-radius:4px;font-size:11px;cursor:pointer;">Excluir</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="modal-actions">
                        <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Fechar</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        })
        .catch(err => alert('Erro ao carregar rascunhos: ' + err.message));
};

// Continuar editando um rascunho
window.continuarRascunho = function (id) {
    fetch(`${API_URL}/captura/rascunho/${id}`)
        .then(r => r.json())
        .then(row => {
            if (!row.dados) {
                alert('Erro ao carregar rascunho');
                return;
            }

            carregarRascunho(row.dados);

            // Atualiza status para 'em_andamento'
            fetch(`${API_URL}/captura/rascunho/${id}/atribuir`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    atribuido_para: 'admin',
                    observacao: 'Em andamento'
                })
            });

            // Remove modal
            const modal = document.querySelector('.modal-overlay');
            if (modal) modal.remove();

            alert('Rascunho carregado! Complete os dados e clique em "Capturar Documento"');
        })
        .catch(err => alert('Erro: ' + err.message));
};

window.assumirRascunho = function (id) {
    continuarRascunho(id);
};

window.removerRascunho = function (id) {
    if (!confirm('Remover este rascunho?')) return;

    fetch(`${API_URL}/captura/rascunho/${id}/atribuir`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            atribuido_para: 'admin',
            observacao: 'Rascunho removido'
        })
    })
        .then(() => {
            alert('Rascunho removido');
            verMeusRascunhos();
        })
        .catch(err => alert('Erro: ' + err.message));
};

// ============================================
// INICIAR
// ============================================

// Carrega o Dashboard como módulo inicial
carregarModulo('dashboard');