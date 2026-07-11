import { Project, Emenda, TransparencyRecord } from '../types';

export const initialProjects: Project[] = [
  {
    id: 'sonhos-da-juventude',
    title: 'Projeto Sonhos da Juventude',
    type: 'projeto',
    year: 2022,
    description: 'Iniciativa fundamental para ampliar o acesso de jovens de comunidades vulneráveis à cultura e à economia criativa. O programa ofereceu mais de 40 oficinas práticas e rodas de conversa cobrindo fotografia digital, produção audiovisual e gestão de mídias sociais, permitindo aos alunos desenvolverem competências reais de empregabilidade e autoexpressão.',
    status: 'concluido',
    impact: 'Mais de 1.200 jovens impactados em 3 municípios do RJ',
    location: 'Petrópolis, Paraíba do Sul e Rio de Janeiro',
    budget: 150000,
    emendaId: 'emenda-2022-01'
  },
  {
    id: 'hip-hop-funk-2023',
    title: 'Oficina de Hip-Hop e Funk para Crianças e Adolescentes',
    type: 'curso',
    year: 2023,
    description: 'Oficinas culturais e recreativas direcionadas a crianças e adolescentes de comunidades periféricas do Rio de Janeiro. A iniciativa utilizou ritmos populares como o hip-hop e o funk como ferramentas de inclusão social, autovalorização, superação de barreiras, expressão cultural genuína e desenvolvimento corporal e pessoal.',
    status: 'concluido',
    impact: 'Mais de 250 crianças e adolescentes atendidos',
    location: 'Rio de Janeiro (Jacarezinho e Maré)',
    budget: 60000,
    emendaId: 'emenda-2023-02'
  },
  {
    id: 'capacitacao-politicas-2024',
    title: 'Curso de Liderança e Formulação de Políticas Públicas',
    type: 'curso',
    year: 2024,
    description: 'Curso intensivo de qualificação profissional de lideranças comunitárias e jovens agentes sociais para identificar demandas prioritárias em seus territórios, elaborar projetos de intervenção e compreender os fluxos de fomento e orçamento público estatal.',
    status: 'concluido',
    impact: '80 líderes comunitários certificados',
    location: 'Paraíba do Sul (Centro e comunidades)',
    budget: 80000,
    emendaId: 'emenda-2024-03'
  },
  {
    id: 'esporte-futuro-2025',
    title: 'Esporte para o Futuro e Integração Recreativa',
    type: 'evento',
    year: 2025,
    description: 'Programa continuado de inclusão socioesportiva com polos semanais de karatê, capoeira e futebol de rua. O programa é focado em promover a saúde integral de jovens de comunidades periféricas e construir valores de respeito coletivo.',
    status: 'em_andamento',
    impact: '400 participantes ativos por mês',
    location: 'Petrópolis (Bairros periféricos)',
    budget: 95000,
    emendaId: 'emenda-2025-04'
  }
];

export const initialEmendas: Emenda[] = [
  {
    id: 'emenda-2022-01',
    code: 'EMENDA-2022-382',
    author: 'Deputado Estadual André Silva',
    amount: 150000,
    year: 2022,
    description: 'Apoio à inclusão produtiva e difusão cultural de jovens em municípios fluminenses. Repasse destinado integralmente à execução do Programa "Sonhos da Juventude".',
    allocatedProjectId: 'sonhos-da-juventude'
  },
  {
    id: 'emenda-2023-02',
    code: 'EMENDA-2023-104',
    author: 'Vereadora Mariana Costa',
    amount: 60000,
    year: 2023,
    description: 'Fomento a oficinas de arte, cultura urbana e dança de rua nas favelas e bairros populares da capital. Destinado ao projeto "Oficina de Hip-Hop e Funk".',
    allocatedProjectId: 'hip-hop-funk-2023'
  },
  {
    id: 'emenda-2024-03',
    code: 'EMENDA-2024-055',
    author: 'Deputado Estadual Roberto Alves',
    amount: 80000,
    year: 2024,
    description: 'Qualificação técnica em planejamento comunitário e gestão de recursos sociais. Emenda parlamentar de apoio direto ao Curso de Lideranças de Políticas Públicas.',
    allocatedProjectId: 'capacitacao-politicas-2024'
  },
  {
    id: 'emenda-2025-04',
    code: 'EMENDA-2025-091',
    author: 'Deputada Estadual Luciana Santos',
    amount: 95000,
    year: 2025,
    description: 'Incentivo ao esporte comunitário e lazer ativo no contraturno escolar em bairros com baixo IDH. Destinado ao projeto "Esporte para o Futuro e Integração Recreativa".',
    allocatedProjectId: 'esporte-futuro-2025'
  }
];

export const initialRecords: TransparencyRecord[] = [
  {
    id: 'estatuto-ifpp',
    type: 'estatuto',
    title: 'Estatuto Social Fundacional do IFPP',
    year: 2021,
    description: 'Documento oficial de constituição civil que rege o Instituto de Formação e Promoção de Políticas Públicas (IFPP). Define nossos objetivos sociais, a composição dos conselhos e a governança administrativa e fiscal de nossa organização.',
    date: '15/04/2021',
    fileUrl: '#'
  },
  {
    id: 'ata-fundacao-2021',
    type: 'ata',
    title: 'Ata de Fundação e Eleição do Conselho do IFPP (2021)',
    year: 2021,
    description: 'Registro histórico da Assembleia de Fundação do IFPP, atestando a aprovação do estatuto civil original e a investidura da diretoria executiva e do conselho fiscal para o primeiro quadriênio operacional.',
    date: '15/04/2021',
    fileUrl: '#'
  },
  {
    id: 'ata-prestacao-2023',
    type: 'ata',
    title: 'Ata da Assembleia Geral Ordinária de Contas de 2023',
    year: 2023,
    description: 'Ata que homologa o parecer favorável do Conselho Fiscal sobre as demonstrações de receitas e despesas referentes ao exercício financeiro de 2023, incluindo a aprovação técnica dos balanços dos projetos apoiados por emendas parlamentares.',
    date: '12/12/2023',
    fileUrl: '#'
  },
  {
    id: 'ata-eleicao-2025',
    type: 'ata',
    title: 'Ata de Eleição e Posse da Nova Diretoria (2025-2029)',
    year: 2025,
    description: 'Documento da assembleia que homologou as candidaturas, realizou a votação e diplomou a diretoria atual do instituto para o quadriênio vigente de 2025 a 2029.',
    date: '22/04/2025',
    fileUrl: '#'
  },
  {
    id: 'conta-2021-geral',
    type: 'conta',
    title: 'Balanço e Prestação de Contas Simplificada - Exercício 2021',
    year: 2021,
    description: 'Relatório das movimentações financeiras constitutivas da fundação. Consolida as doações iniciais de pessoas físicas e despesas jurídicas de cartório, taxas de criação de CNPJ e aluguel operacional básico.',
    date: '31/12/2021',
    amount: 12500,
    category: 'receita',
    fileUrl: '#'
  },
  {
    id: 'conta-2022-sonhos',
    type: 'conta',
    title: 'Prestação de Contas Final - Projeto Sonhos da Juventude',
    year: 2022,
    description: 'Demonstrativo completo de receitas e despesas referentes à destinação da EMENDA-2022-382. Custos com contratação de oficineiros especializados em audiovisual, fotógrafos profissionais, material técnico didático, transporte dos alunos e lanche nas comunidades.',
    date: '20/12/2022',
    amount: 150000,
    category: 'despesa',
    projectLinked: 'sonhos-da-juventude',
    fundingSource: 'emenda-2022-01',
    fileUrl: '#'
  },
  {
    id: 'conta-2023-hiphop',
    type: 'conta',
    title: 'Prestação de Contas Final - Oficina de Hip-Hop e Funk',
    year: 2023,
    description: 'Relatório de despesas sob a EMENDA-2023-104. Detalhamento dos custos logísticos de infraestrutura de som, alimentação dos beneficiários mirins, professores de breakdance e rimadores convidados.',
    date: '15/11/2023',
    amount: 60000,
    category: 'despesa',
    projectLinked: 'hip-hop-funk-2023',
    fundingSource: 'emenda-2023-02',
    fileUrl: '#'
  },
  {
    id: 'conta-2024-liderancas',
    type: 'conta',
    title: 'Prestação de Contas Parcial - Curso de Formulação de Políticas Públicas',
    year: 2024,
    description: 'Balanço financeiro de aplicação dos recursos da EMENDA-2024-055. Investimento concentrado na impressão de apostilas, aluguel de auditório no Centro do Rio de Janeiro, e ajuda de custo para o transporte das lideranças comunitárias.',
    date: '30/10/2024',
    amount: 80000,
    category: 'despesa',
    projectLinked: 'capacitacao-politicas-2024',
    fundingSource: 'emenda-2024-03',
    fileUrl: '#'
  },
  {
    id: 'conta-2025-geral',
    type: 'conta',
    title: 'Balanço Financeiro e Patrimonial Consolidado - Exercício 2025',
    year: 2025,
    description: 'Relatório financeiro unificado auditado pelo Conselho Fiscal, expressando a integridade das receitas operacionais, captação por emendas vigentes e o fluxo de caixa anual do IFPP.',
    date: '31/12/2025',
    amount: 220000,
    category: 'receita',
    fileUrl: '#'
  }
];
