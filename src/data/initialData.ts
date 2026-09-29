import { Project, Emenda, TransparencyRecord } from '../types';

export const initialProjects: Project[] = [
  {
    id: 'sonhos-da-juventude',
    title: 'Sonhos da Juventude',
    type: 'projeto',
    category: 'Formação / Juventude',
    year: 2022,
    status: 'concluido',
    tags: ['Fotografia', 'Audiovisual', 'Mídias Sociais'],
    location: 'Niterói, São Gonçalo e Rio de Janeiro',
    description: 'Projeto de formação voltado a jovens das periferias do Estado do Rio de Janeiro, realizado por meio de cursos livres, oficinas e debates nas áreas de fotografia, audiovisual, mídias sociais, cultura e participação social.',
    fullDescription: 'O Sonhos da Juventude é uma iniciativa fundamental para ampliar o acesso de jovens de comunidades periféricas do Estado do Rio de Janeiro à cultura e à economia criativa. Realizado por meio de oficinas práticas, cursos livres e rodas de conversa formativas, o projeto capacitou participantes em fotografia digital, operação de câmeras, técnicas de captação e edição audiovisual, storytelling e gestão estratégica de mídias sociais, articulando qualificação técnica, autoexpressão e inserção socioprodutiva.',
    impact: '+1.290 participantes em 3 municípios',
    indicators: [
      { value: '+1.290', label: 'Participantes' },
      { value: '+40', label: 'Oficinas e debates' },
      { value: '+240h', label: 'Atividades' },
      { value: '3', label: 'Municípios' },
      { value: '8', label: 'Localidades atendidas' }
    ],
    territories: [
      'Niterói (Morro do Estado e Fonseca)',
      'São Gonçalo (Complexo do Salgueiro e Neves)',
      'Rio de Janeiro (Providência, Madureira e Maré)'
    ],
    mainImage: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80'
    ],
    budget: 150000,
    emendaId: 'emenda-2022-01',
    fundingSourceType: 'Emenda Parlamentar',
    fundingInstrument: 'EMENDA-2022-382',
    fundingOrgan: 'Governo do Estado do Rio de Janeiro',
    fundingAuthor: 'Deputado Estadual André Silva',
    receivedAmount: 150000,
    provenExpenses: 150000,
    balance: 0
  },
  {
    id: 'funktrap-festival',
    title: 'FunkTrap Festival',
    type: 'evento',
    category: 'Cultura / Juventude',
    year: 2023,
    status: 'concluido',
    tags: ['Cultura', 'Juventude', 'Territórios'],
    location: 'Rio de Janeiro e Teresópolis',
    description: 'Projeto de integração e valorização de artistas e fazedores de cultura ligados ao Funk e ao Trap no Estado do Rio de Janeiro, com ações de circulação, intercâmbio, encontros e festival.',
    fullDescription: 'O FunkTrap Festival celebrou a potência cultural da juventude periférica, promovendo a integração e o protagonismo de artistas, DJs, MCs e produtores culturais independentes do Rio de Janeiro e da Região Serrana. A programação contemplou encontros formativos de produção musical e direitos autorais, rodadas de intercâmbio criativo entre coletivos territoriais e apresentações abertas ao público, culminando em uma grande celebração comunitária da arte urbana fluminense.',
    impact: '+3 mil pessoas presenciais e +100 artistas',
    indicators: [
      { value: '+100', label: 'Artistas alcançados diretamente' },
      { value: '+3 mil', label: 'Pessoas presenciais' },
      { value: '+10 mil', label: 'Alcance online' },
      { value: '1.385', label: 'Pessoas na atividade final' }
    ],
    territories: [
      'Rio de Janeiro (Zona Norte e Centro)',
      'Teresópolis (Polos culturais e praças públicas)'
    ],
    mainImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80'
    ],
    fundingSourceType: 'Fomento Cultural e Parcerias Coletivas',
    fundingInstrument: 'Edital de Fomento à Cultura Urbana Fluminense',
    financialStatusNote: 'Informações financeiras ainda não disponibilizadas.'
  },
  {
    id: 'pre-vestibular-darcy-ribeiro',
    title: 'Pré-Vestibular Social Darcy Ribeiro',
    type: 'curso',
    category: 'Educação',
    year: 2024,
    status: 'em_andamento',
    tags: ['Educação Popular', 'ENEM e Vestibulares', 'Gratuito'],
    location: 'Paraíba do Sul',
    description: 'Iniciativa gratuita de preparação para o ENEM e vestibulares, inspirada no legado de Darcy Ribeiro e voltada à ampliação do acesso ao ensino superior por meio da educação popular. O projeto funciona como espaço de formação, acolhimento e incentivo para estudantes de Paraíba do Sul.',
    fullDescription: 'Inspirado no legado educacional de Darcy Ribeiro, o Pré-Vestibular Social Darcy Ribeiro atua como espaço de acolhimento, cidadania e preparação intensiva para o Exame Nacional do Ensino Médio (ENEM) e os principais vestibulares públicos do país. O projeto conta com apoio institucional do Ministério da Educação (MEC), integração direta com a Rede Nacional de Cursinhos Populares (CPOP), corpo docente voluntário e aulas presenciais dedicadas aos jovens de Paraíba do Sul.',
    impact: 'Preparação gratuita para ENEM e vestibulares com apoio MEC e CPOP',
    indicators: [
      { value: '100%', label: 'Gratuito e popular' },
      { value: 'CPOP', label: 'Rede Cursinhos Populares' },
      { value: 'MEC', label: 'Apoio Institucional MEC' },
      { value: 'Presencial', label: 'Paraíba do Sul' }
    ],
    territories: [
      'Paraíba do Sul (Polo Central Comunitário e espaços integrados à rede municipal)'
    ],
    mainImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=1200&q=80'
    ],
    fundingSourceType: 'Cooperação Pedagógica e Institucional',
    fundingInstrument: 'Rede Nacional de Cursinhos Populares (CPOP) / MEC',
    fundingOrgan: 'Ministério da Educação – MEC',
    financialStatusNote: 'Informações financeiras ainda não disponibilizadas.'
  },
  {
    id: 'esporte-para-o-futuro',
    title: 'Esporte para o Futuro',
    type: 'projeto',
    category: 'Esporte',
    status: 'em_andamento',
    tags: ['Futebol', 'Juventude', 'Inclusão Social', 'Esporte'],
    location: 'Petrópolis – RJ',
    description: 'Projeto socioesportivo que utiliza o futebol como ferramenta de inclusão e desenvolvimento de crianças e jovens, promovendo atividade física, convivência, disciplina, trabalho em equipe e fortalecimento dos vínculos comunitários.',
    fullDescription: 'O projeto Esporte para o Futuro utiliza o futebol como instrumento de inclusão social, convivência e desenvolvimento de crianças e jovens.\n\nA iniciativa promove atividades esportivas e busca estimular a prática de atividade física, disciplina, respeito, trabalho em equipe e fortalecimento dos vínculos comunitários.\n\nPor meio do acesso ao futebol, o projeto busca ampliar oportunidades de participação social e oferecer um ambiente de integração, aprendizado e desenvolvimento pessoal para crianças e jovens dos territórios atendidos pelo IFPP.',
    territories: [
      'Petrópolis – RJ'
    ],
    mainImage: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1200&q=80',
    gallery: [],
    financialStatusNote: 'Informações financeiras e documentos de prestação de contas ainda não disponibilizados.'
  },
  {
    id: 'projeto-esportivo-2026',
    title: 'Projeto Esportivo 2026',
    type: 'projeto',
    category: 'Esporte',
    year: 2026,
    status: 'aprovado',
    proposalNumber: '010962/2026',
    proponentName: 'Instituto de Formação e Promoção de Políticas Públicas – IFPP',
    proponentCnpj: '08.270.433/0001-79',
    description: 'Nova iniciativa esportiva do IFPP aprovada em 2026, voltada à promoção do esporte como instrumento de inclusão, desenvolvimento e participação social. O detalhamento das atividades, público beneficiário, metas e territórios será publicado conforme a formalização do projeto.',
    fullDescription: 'Nova iniciativa esportiva do IFPP aprovada em 2026, voltada à promoção do esporte como instrumento de inclusão, desenvolvimento e participação social. O detalhamento das atividades, público beneficiário, metas e territórios será publicado conforme a formalização do projeto.',
    mainImage: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
    gallery: [],
    financialStatusNote: 'Projeto aprovado. As informações de execução e prestação de contas serão publicadas nesta página conforme forem disponibilizadas.'
  },
  {
    id: 'projeto-cultural-2026',
    title: 'Projeto Cultural 2026',
    type: 'projeto',
    category: 'Cultura',
    year: 2026,
    status: 'aprovado',
    proposalNumber: '029397/2026',
    proponentName: 'Instituto de Formação e Promoção de Políticas Públicas – IFPP',
    proponentCnpj: '08.270.433/0001-79',
    description: 'Nova iniciativa cultural do IFPP aprovada em 2026, voltada ao fortalecimento, promoção e fomento da cultura, ampliando oportunidades de acesso, participação e desenvolvimento de ações culturais.',
    fullDescription: 'Iniciativa cultural aprovada em 2026 para ampliar e fortalecer ações de promoção cultural desenvolvidas pelo IFPP.',
    mainImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
    gallery: [],
    financialStatusNote: 'Projeto aprovado. As informações de execução e prestação de contas serão publicadas nesta página conforme forem disponibilizadas.'
  }
];

export const initialEmendas: Emenda[] = [
  {
    id: 'emenda-2022-01',
    code: 'EMENDA-2022-382',
    author: 'Deputado Estadual André Silva',
    amount: 150000,
    year: 2022,
    organ: 'Governo do Estado do Rio de Janeiro',
    description: 'Apoio à inclusão produtiva e difusão cultural de jovens em municípios fluminenses. Repasse destinado integralmente à execução do Programa "Sonhos da Juventude".',
    allocatedProjectId: 'sonhos-da-juventude'
  },
  {
    id: 'emenda-2026-cultura-20zf',
    code: 'EMENDA-50040001',
    author: 'Comissão de Cultura (Indicação nº 22891)',
    amount: 530000,
    year: 2026,
    organ: 'Ministério da Cultura / Governo Federal',
    description: 'Ação 20ZF – Promoção e Fomento à Cultura Brasileira. Favorecido: Instituto de Formação e Promoção de Políticas Públicas (CNPJ: 08.270.433/0001-79). UF: RJ / Município: Rio de Janeiro. Modalidade: 50 – transferência para instituição privada sem fins lucrativos. GND: 3 – Outras Despesas Correntes. Registro orçamentário oficial de 2026 preparado para vinculação posterior após confirmação formal da proposta.',
    allocatedProjectId: undefined // Não vinculada automaticamente à proposta conforme diretriz estrita do usuário
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
    description: 'Demonstrativo completo de receitas e despesas referentes à destinação da EMENDA-2022-382. Custos com contratação de oficineiros especializados em audiovisual, fotógrafos profissionais, material didático e lanche nas comunidades.',
    date: '20/12/2022',
    amount: 150000,
    category: 'despesa',
    docCategory: 'prestacao_contas',
    projectLinked: 'sonhos-da-juventude',
    fundingSource: 'emenda-2022-01',
    fileUrl: '#'
  },
  {
    id: 'relatorio-sonhos-2022',
    type: 'conta',
    title: 'Relatório Circunstanciado de Execução Física e Pedagógica',
    year: 2022,
    description: 'Documento comprobatório de cumprimento das metas do Sonhos da Juventude: registro de presença dos 1.290 jovens, lista de oficinas e debates realizados nas 8 localidades de Niterói, São Gonçalo e Rio de Janeiro.',
    date: '22/12/2022',
    docCategory: 'relatorios',
    projectLinked: 'sonhos-da-juventude',
    fundingSource: 'emenda-2022-01',
    fileUrl: '#'
  },
  {
    id: 'nf-sonhos-2022',
    type: 'conta',
    title: 'Demonstrativo de Notas Fiscais e Comprovantes de Aplicação',
    year: 2022,
    description: 'Compilado das notas fiscais de serviços e materiais aplicados integralmente no fomento às oficinas culturais do Sonhos da Juventude com atesto de recebimento.',
    date: '20/12/2022',
    amount: 150000,
    category: 'despesa',
    docCategory: 'notas_fiscais',
    projectLinked: 'sonhos-da-juventude',
    fundingSource: 'emenda-2022-01',
    fileUrl: '#'
  },
  {
    id: 'termo-emenda-sonhos',
    type: 'ata',
    title: 'Termo de Parceria e Plano de Trabalho - EMENDA-2022-382',
    year: 2022,
    description: 'Instrumento oficial de formalização do repasse orçamentário estadual para realização das atividades culturais e de formação da juventude fluminense.',
    date: '10/05/2022',
    docCategory: 'termos_parceria',
    projectLinked: 'sonhos-da-juventude',
    fundingSource: 'emenda-2022-01',
    fileUrl: '#'
  },
  {
    id: 'relatorio-funktrap-2023',
    type: 'conta',
    title: 'Relatório de Circulação e Atividades Culturais - FunkTrap Festival',
    year: 2023,
    description: 'Documento detalhando as ações de intercâmbio, oficinas de rimas e produção e a grande apresentação final realizada no Rio de Janeiro e em Teresópolis, alcançando mais de 3 mil pessoas presenciais.',
    date: '18/11/2023',
    docCategory: 'relatorios',
    projectLinked: 'funktrap-festival',
    fileUrl: '#'
  },
  {
    id: 'clipping-funktrap-2023',
    type: 'conta',
    title: 'Clipping e Comprovação de Impacto e Alcance Artístico',
    year: 2023,
    description: 'Relatório de registro de mídia, cobertura digital e depoimentos dos mais de 100 artistas participantes do festival.',
    date: '25/11/2023',
    docCategory: 'outros',
    projectLinked: 'funktrap-festival',
    fileUrl: '#'
  },
  {
    id: 'termo-cpop-darcy-2024',
    type: 'ata',
    title: 'Acordo de Integração à Rede Nacional de Cursinhos Populares (CPOP/MEC)',
    year: 2024,
    description: 'Documento formal de articulação pedagógica e comunitária do Pré-Vestibular Social Darcy Ribeiro com a política nacional de acesso ao ensino superior.',
    date: '12/03/2024',
    docCategory: 'termos_parceria',
    projectLinked: 'pre-vestibular-darcy-ribeiro',
    fileUrl: '#'
  },
  {
    id: 'plano-pedagogico-darcy-2024',
    type: 'conta',
    title: 'Plano de Trabalho Pedagógico e Calendário de Aulas ENEM',
    year: 2024,
    description: 'Organização curricular das disciplinas, simulados e atividades práticas desenvolvidas com os estudantes de Paraíba do Sul.',
    date: '20/03/2024',
    docCategory: 'relatorios',
    projectLinked: 'pre-vestibular-darcy-ribeiro',
    fileUrl: '#'
  }
];
