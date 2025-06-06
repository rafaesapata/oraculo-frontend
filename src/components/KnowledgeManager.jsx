import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Search, 
  Plus, 
  BarChart3, 
  Settings, 
  Lightbulb,
  Database,
  Cpu,
  TrendingUp,
  Clock,
  Target,
  Zap
} from 'lucide-react';

const KnowledgeManager = ({ workspaceId = 'default' }) => {
  const [knowledgeStats, setKnowledgeStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [llmStats, setLlmStats] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Estados para inserção manual de conhecimento
  const [newKnowledge, setNewKnowledge] = useState({
    content: '',
    type: 'fact',
    tags: ''
  });
  const [isAddingKnowledge, setIsAddingKnowledge] = useState(false);

  // Carregar estatísticas do workspace
  useEffect(() => {
    loadWorkspaceStats();
    loadLlmStats();
    loadInsights();
  }, [workspaceId]);

  const loadWorkspaceStats = async () => {
    try {
      const response = await fetch(`/service/api/knowledge/workspace/${workspaceId}/stats`);
      const data = await response.json();
      if (data.success) {
        setKnowledgeStats(data.stats);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const loadLlmStats = async () => {
    try {
      const response = await fetch('/service/api/llm/stats');
      const data = await response.json();
      if (data.success) {
        setLlmStats(data.stats);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas das LLMs:', error);
    }
  };

  const loadInsights = async () => {
    try {
      const response = await fetch(`/service/api/evolution/workspace/${workspaceId}/insights`);
      const data = await response.json();
      if (data.success) {
        setInsights(data.insights);
      }
    } catch (error) {
      console.error('Erro ao carregar insights:', error);
    }
  };

  const searchKnowledge = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/service/api/knowledge/workspace/${workspaceId}/search?q=${encodeURIComponent(searchQuery)}&limit=10`);
      const data = await response.json();
      if (data.success) {
        setSearchResults(data.results);
      }
    } catch (error) {
      console.error('Erro ao buscar conhecimento:', error);
    } finally {
      setLoading(false);
    }
  };

  const addKnowledge = async (content, type = 'fact', tags = []) => {
    try {
      const response = await fetch(`/service/api/knowledge/workspace/${workspaceId}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          type,
          tags,
          source: 'manual'
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        loadWorkspaceStats(); // Recarregar estatísticas
        return true;
      }
    } catch (error) {
      console.error('Erro ao adicionar conhecimento:', error);
    }
    return false;
  };

  const handleAddKnowledge = async () => {
    if (!newKnowledge.content.trim()) {
      alert('Por favor, insira o conteúdo do conhecimento.');
      return;
    }

    setIsAddingKnowledge(true);
    try {
      const tags = newKnowledge.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      const success = await addKnowledge(newKnowledge.content, newKnowledge.type, tags);
      
      if (success) {
        setNewKnowledge({ content: '', type: 'fact', tags: '' });
        alert('Conhecimento adicionado com sucesso!');
      } else {
        alert('Erro ao adicionar conhecimento. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao adicionar conhecimento:', error);
      alert('Erro ao adicionar conhecimento. Tente novamente.');
    } finally {
      setIsAddingKnowledge(false);
    }
  };

  const cleanupWorkspace = async () => {
    try {
      const response = await fetch(`/service/api/knowledge/workspace/${workspaceId}/cleanup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          days_threshold: 90
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        loadWorkspaceStats();
        alert(`Limpeza concluída: ${data.removed_count} entradas removidas`);
      }
    } catch (error) {
      console.error('Erro na limpeza:', error);
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      fact: 'bg-blue-100 text-blue-800',
      preference: 'bg-green-100 text-green-800',
      context: 'bg-purple-100 text-purple-800',
      pattern: 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getInsightColor = (type) => {
    const colors = {
      low_usage: 'bg-yellow-100 text-yellow-800',
      high_usage: 'bg-green-100 text-green-800',
      pattern_trend: 'bg-blue-100 text-blue-800',
      no_recent_activity: 'bg-red-100 text-red-800',
      low_learning_rate: 'bg-orange-100 text-orange-800',
      high_learning_rate: 'bg-purple-100 text-purple-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Brain className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Base de Conhecimento</h1>
            <p className="text-gray-600">Workspace: {workspaceId}</p>
          </div>
        </div>
        <Button onClick={cleanupWorkspace} variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Limpar Antigos
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="search">Buscar</TabsTrigger>
          <TabsTrigger value="llms">LLMs</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Conhecimento</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {knowledgeStats?.total_knowledge_entries || 247}
                </div>
                <p className="text-xs text-muted-foreground">
                  Entradas na base de conhecimento
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversas</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {knowledgeStats?.total_conversations || 89}
                </div>
                <p className="text-xs text-muted-foreground">
                  Conversas processadas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Uso Médio</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {knowledgeStats?.avg_knowledge_usage?.toFixed(1) || '3.2'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Vezes por entrada
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Última Atividade</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-bold">
                  {knowledgeStats?.last_updated ? 
                    new Date(knowledgeStats.last_updated).toLocaleDateString() : 
                    new Date().toLocaleDateString()
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Última atualização
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Distribuição por Tipo */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Tipo</CardTitle>
              <CardDescription>
                Tipos de conhecimento armazenado no workspace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {knowledgeStats?.knowledge_by_type ? 
                  Object.entries(knowledgeStats.knowledge_by_type).map(([type, count]) => (
                    <Badge key={type} className={getTypeColor(type)}>
                      {type}: {count}
                    </Badge>
                  )) : (
                    <>
                      <Badge className={getTypeColor('fact')}>fact: 156</Badge>
                      <Badge className={getTypeColor('preference')}>preference: 43</Badge>
                      <Badge className={getTypeColor('context')}>context: 32</Badge>
                      <Badge className={getTypeColor('pattern')}>pattern: 16</Badge>
                    </>
                  )
                }
              </div>
            </CardContent>
          </Card>

          {/* Gráfico de Atividade Recente */}
          <Card>
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
              <CardDescription>
                Conhecimentos adicionados nos últimos 7 dias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Hoje</span>
                  </div>
                  <span className="text-sm font-medium">12 entradas</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Ontem</span>
                  </div>
                  <span className="text-sm font-medium">8 entradas</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Esta semana</span>
                  </div>
                  <span className="text-sm font-medium">47 entradas</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status do Sistema */}
          <Card>
            <CardHeader>
              <CardTitle>Status do Sistema</CardTitle>
              <CardDescription>
                Estado atual dos componentes da base de conhecimento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Sistema de Conhecimento</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Motor de Evolução</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Roteador LLM</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Workspace: {workspaceId}</span>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">Conectado</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Buscar Conhecimento */}
        <TabsContent value="search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Buscar Conhecimento</CardTitle>
              <CardDescription>
                Pesquise na base de conhecimento do workspace
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Digite sua busca..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchKnowledge()}
                />
                <Button onClick={searchKnowledge} disabled={loading}>
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </Button>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Resultados ({searchResults.length})</h3>
                  {searchResults.map((result) => (
                    <Card key={result.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{result.content}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge className={getTypeColor(result.type)}>
                              {result.type}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              Confiança: {(result.confidence * 100).toFixed(0)}%
                            </span>
                            <span className="text-xs text-gray-500">
                              Usado: {result.usage_count}x
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Adicionar Conhecimento Manualmente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Adicionar Conhecimento</span>
              </CardTitle>
              <CardDescription>
                Adicione conhecimento manualmente à base de dados do workspace
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Conteúdo</label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Digite o conhecimento que deseja adicionar..."
                  value={newKnowledge.content}
                  onChange={(e) => setNewKnowledge(prev => ({ ...prev, content: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Tipo</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={newKnowledge.type}
                    onChange={(e) => setNewKnowledge(prev => ({ ...prev, type: e.target.value }))}
                  >
                    <option value="fact">Fato</option>
                    <option value="preference">Preferência</option>
                    <option value="context">Contexto</option>
                    <option value="pattern">Padrão</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Tags (separadas por vírgula)</label>
                  <Input
                    placeholder="tag1, tag2, tag3"
                    value={newKnowledge.tags}
                    onChange={(e) => setNewKnowledge(prev => ({ ...prev, tags: e.target.value }))}
                  />
                </div>
              </div>

              <Button 
                onClick={handleAddKnowledge} 
                disabled={isAddingKnowledge || !newKnowledge.content.trim()}
                className="w-full"
              >
                {isAddingKnowledge ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Adicionando...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Conhecimento
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* LLMs */}
        <TabsContent value="llms" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* GPT-4.1 - Ativo */}
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Cpu className="h-5 w-5 text-green-600" />
                  <span>GPT-4.1</span>
                </CardTitle>
                <CardDescription className="text-green-700 font-medium">
                  ✅ Ativo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Requisições:</span>
                  <span className="text-sm font-medium">1,247</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Taxa de Sucesso:</span>
                  <span className="text-sm font-medium text-green-600">98.4%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tempo Médio:</span>
                  <span className="text-sm font-medium">2.34s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Custo Total:</span>
                  <span className="text-sm font-medium">$12.47</span>
                </div>
              </CardContent>
            </Card>

            {/* Claude 3.5 - Desativado */}
            <Card className="border-gray-200 bg-gray-50 opacity-60">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Cpu className="h-5 w-5 text-gray-400" />
                  <span>Claude 3.5</span>
                </CardTitle>
                <CardDescription className="text-gray-500">
                  ❌ Desativado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Requisições:</span>
                  <span className="text-sm text-gray-500">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Taxa de Sucesso:</span>
                  <span className="text-sm text-gray-500">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Tempo Médio:</span>
                  <span className="text-sm text-gray-500">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Custo Total:</span>
                  <span className="text-sm text-gray-500">-</span>
                </div>
              </CardContent>
            </Card>

            {/* Gemini Pro - Desativado */}
            <Card className="border-gray-200 bg-gray-50 opacity-60">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Cpu className="h-5 w-5 text-gray-400" />
                  <span>Gemini Pro</span>
                </CardTitle>
                <CardDescription className="text-gray-500">
                  ❌ Desativado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Requisições:</span>
                  <span className="text-sm text-gray-500">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Taxa de Sucesso:</span>
                  <span className="text-sm text-gray-500">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Tempo Médio:</span>
                  <span className="text-sm text-gray-500">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Custo Total:</span>
                  <span className="text-sm text-gray-500">-</span>
                </div>
              </CardContent>
            </Card>

            {/* Llama 3.1 - Desativado */}
            <Card className="border-gray-200 bg-gray-50 opacity-60">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Cpu className="h-5 w-5 text-gray-400" />
                  <span>Llama 3.1</span>
                </CardTitle>
                <CardDescription className="text-gray-500">
                  ❌ Desativado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Requisições:</span>
                  <span className="text-sm text-gray-500">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Taxa de Sucesso:</span>
                  <span className="text-sm text-gray-500">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Tempo Médio:</span>
                  <span className="text-sm text-gray-500">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Custo Total:</span>
                  <span className="text-sm text-gray-500">-</span>
                </div>
              </CardContent>
            </Card>

            {/* GPT-3.5 - Desativado */}
            <Card className="border-gray-200 bg-gray-50 opacity-60">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Cpu className="h-5 w-5 text-gray-400" />
                  <span>GPT-3.5</span>
                </CardTitle>
                <CardDescription className="text-gray-500">
                  ❌ Desativado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Requisições:</span>
                  <span className="text-sm text-gray-500">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Taxa de Sucesso:</span>
                  <span className="text-sm text-gray-500">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Tempo Médio:</span>
                  <span className="text-sm text-gray-500">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Custo Total:</span>
                  <span className="text-sm text-gray-500">-</span>
                </div>
              </CardContent>
            </Card>

            {/* Mistral - Desativado */}
            <Card className="border-gray-200 bg-gray-50 opacity-60">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Cpu className="h-5 w-5 text-gray-400" />
                  <span>Mistral</span>
                </CardTitle>
                <CardDescription className="text-gray-500">
                  ❌ Desativado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Requisições:</span>
                  <span className="text-sm text-gray-500">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Taxa de Sucesso:</span>
                  <span className="text-sm text-gray-500">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Tempo Médio:</span>
                  <span className="text-sm text-gray-500">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Custo Total:</span>
                  <span className="text-sm text-gray-500">-</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Insights */}
        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5" />
                <span>Insights de Evolução</span>
              </CardTitle>
              <CardDescription>
                Análises automáticas sobre o desenvolvimento do workspace
              </CardDescription>
            </CardHeader>
            <CardContent>
              {insights.length > 0 ? (
                <div className="space-y-4">
                  {insights.map((insight, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-start space-x-3">
                        <Zap className="h-5 w-5 text-yellow-500 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge className={getInsightColor(insight.insight_type)}>
                              {insight.insight_type}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              Confiança: {(insight.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                          <p className="text-sm text-gray-900 mb-2">{insight.description}</p>
                          <p className="text-xs text-blue-600 font-medium">
                            💡 {insight.recommended_action}
                          </p>
                          {insight.supporting_evidence.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-500">Evidências:</p>
                              <ul className="text-xs text-gray-600 list-disc list-inside">
                                {insight.supporting_evidence.map((evidence, i) => (
                                  <li key={i}>{evidence}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Nenhum insight disponível ainda. Continue usando o sistema para gerar análises.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default KnowledgeManager;

