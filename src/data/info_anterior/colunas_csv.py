# import pandas as pd
# import os
# from datetime import datetime



# # Carregar CSVs
# base = pd.read_csv(r'C:\Users\alexandre215975\OneDrive - Sistema Fiep\Área de Trabalho\chat-backend\src\data\novos_cursos.csv')
# novos = pd.read_csv(r'src\data\cursos_denovo.csv')  # ajuste conforme o nome correto


# # Definir as colunas que serão usadas como chave
# chaves = ['cidade', 'nome_curso', 'modalidade', 'turno', 'momento_presencial', 'horario_aulas']

# # Verificar quais registros já existem
# base_chaves = base[chaves]
# novos['existe'] = novos.apply(lambda row: ((base_chaves == row[chaves]).all(axis=1)).any(), axis=1)

# # Separar novos e atualizações
# novos_registros = novos[novos['existe'] == False].copy()
# atualizacoes = novos[novos['existe'] == True].copy()

# # 🔸 Adicionar novos registros ao base
# for _, row in novos_registros.iterrows():
#     novo = {
#         'id': base['id'].max() + 1,
#         'regiao': 'Definir',
#         'cidade': row['cidade'],
#         'nome_curso': row['nome_curso'],
#         'modalidade': row['modalidade'],
#         'vagas': None,
#         'turno': row['turno'],
#         'momento_presencial': row['momento_presencial'],
#         'horario_aulas': row['horario_aulas'],
#         'duracao_mes': row['duracao_mes'],
#         'data_inicio': row['data_inicio'],
#         'data_inicio_matricula': None,
#         'valor_curso': None,
#         'created_at': datetime.now(),
#         'updated_at': datetime.now(),
#         'endereco': None
#     }
#     base = pd.concat([base, pd.DataFrame([novo])], ignore_index=True)

# # 🔸 Atualizar registros existentes
# for _, row in atualizacoes.iterrows():
#     cond = (base[chaves] == row[chaves]).all(axis=1)
#     base.loc[cond, 'data_inicio'] = row['data_inicio']
#     base.loc[cond, 'duracao_mes'] = row['duracao_mes']
#     base.loc[cond, 'updated_at'] = datetime.now()

# # 🔸 Salvar resultado
# base.to_csv('nova_base_atualizada.csv', index=False)

## >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
## >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 18/06 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
## >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<


# import pandas as pd
# import os
# from datetime import datetime
# import sys

# def analisar_estrutura_csv(df, nome_arquivo):
#     """Analisa e exibe a estrutura do CSV"""
#     print(f"\n{'='*60}")
#     print(f"ANÁLISE: {nome_arquivo}")
#     print(f"{'='*60}")
#     print(f"📊 Total de linhas: {len(df)}")
#     print(f"📋 Total de colunas: {len(df.columns)}")
    
#     print(f"\n🔍 COLUNAS DISPONÍVEIS:")
#     for i, col in enumerate(df.columns, 1):
#         print(f"   {i:2d}. '{col}'")
    
#     print(f"\n📝 PRIMEIRAS 3 LINHAS:")
#     try:
#         print(df.head(3).to_string())
#     except Exception as e:
#         print(f"Erro ao exibir dados: {e}")
    
#     return df.columns.tolist()

# def mapear_colunas(colunas_origem, colunas_destino):
#     """Cria mapeamento entre colunas dos CSVs"""
#     mapeamento = {}
    
#     # Mapeamento automático baseado em similaridade
#     mapeamentos_conhecidos = {
#         'regiao': ['regiao', 'região'],
#         'cidade': ['cidade'],
#         'nome_curso': ['nome_curso', 'curso', 'nome do curso'],
#         'modalidade': ['modalidade'],
#         'vagas': ['vagas'],
#         'turno': ['turno'],
#         'momento_presencial': ['momento_presencial'],
#         'horario_aulas': ['horario_aulas', 'horário_aulas', 'horario das aulas'],
#         'duracao_mes': ['duracao_mes', 'duração_mes', 'duracao', 'duração'],
#         'data_inicio': ['data_inicio', 'data de inicio', 'data_de_inicio'],
#         'endereco': ['endereco', 'endereço']
#     }
    
#     print(f"\n🔄 MAPEAMENTO DE COLUNAS:")
#     for col_destino, possibilidades in mapeamentos_conhecidos.items():
#         for possibilidade in possibilidades:
#             if possibilidade in [col.lower() for col in colunas_origem]:
#                 # Encontrar a coluna exata (case-sensitive)
#                 col_encontrada = next(col for col in colunas_origem if col.lower() == possibilidade.lower())
#                 mapeamento[col_destino] = col_encontrada
#                 print(f"   ✅ {col_destino} ← {col_encontrada}")
#                 break
#         else:
#             print(f"   ❌ {col_destino} não encontrada")
    
#     return mapeamento

# def processar_uniao_csvs():
#     """Função principal para unir os CSVs"""
#     try:
#         # Caminhos dos arquivos
#         caminho_base = r'C:\Users\alexandre215975\OneDrive - Sistema Fiep\Área de Trabalho\chat-backend\src\data\novos_cursos.csv'
#         caminho_novos = r'src\data\cursos_denovo.csv'
        
#         print("🚀 INICIANDO PROCESSAMENTO DE UNIÃO DE CSVs")
#         print(f"📁 Arquivo base: {caminho_base}")
#         print(f"📁 Arquivo novos: {caminho_novos}")
        
#         # Verificar se os arquivos existem
#         if not os.path.exists(caminho_base):
#             print(f"❌ Arquivo base não encontrado: {caminho_base}")
#             return False
            
#         if not os.path.exists(caminho_novos):
#             print(f"❌ Arquivo novos não encontrado: {caminho_novos}")
#             return False
        
#         # Carregar CSVs
#         print("\n📖 Carregando arquivos...")
        
#         # Tentar diferentes delimitadores para o arquivo base
#         try:
#             base = pd.read_csv(caminho_base, delimiter=';', encoding='utf-8')
#             print("✅ Arquivo base carregado com delimitador ';'")
#         except:
#             try:
#                 base = pd.read_csv(caminho_base, delimiter=',', encoding='utf-8')
#                 print("✅ Arquivo base carregado com delimitador ','")
#             except Exception as e:
#                 print(f"❌ Erro ao carregar arquivo base: {e}")
#                 return False
        
#         # Carregar arquivo novos
#         try:
#             novos = pd.read_csv(caminho_novos, delimiter=';', encoding='utf-8')
#             print("✅ Arquivo novos carregado com delimitador ';'")
#         except:
#             try:
#                 novos = pd.read_csv(caminho_novos, delimiter=',', encoding='utf-8')
#                 print("✅ Arquivo novos carregado com delimitador ','")
#             except Exception as e:
#                 print(f"❌ Erro ao carregar arquivo novos: {e}")
#                 return False
        
#         # Analisar estruturas
#         colunas_base = analisar_estrutura_csv(base, "ARQUIVO BASE")
#         colunas_novos = analisar_estrutura_csv(novos, "ARQUIVO NOVOS")
        
#         # Criar mapeamento de colunas
#         mapeamento = mapear_colunas(colunas_novos, colunas_base)
        
#         if not mapeamento:
#             print("❌ Nenhum mapeamento de colunas encontrado!")
#             return False
        
#         # Normalizar arquivo novos para estrutura do base
#         print(f"\n🔄 NORMALIZANDO ESTRUTURA...")
#         novos_normalizado = pd.DataFrame()
        
#         # Copiar colunas mapeadas
#         for col_destino, col_origem in mapeamento.items():
#             if col_origem in novos.columns:
#                 novos_normalizado[col_destino] = novos[col_origem]
#                 print(f"   ✅ Copiado: {col_origem} → {col_destino}")
        
#         # Adicionar colunas faltantes com valores padrão
#         colunas_obrigatorias = ['cidade', 'nome_curso', 'modalidade']
#         for col in colunas_obrigatorias:
#             if col not in novos_normalizado.columns:
#                 print(f"   ❌ Coluna obrigatória faltando: {col}")
#                 return False
        
#         # Definir chaves para comparação (usar apenas colunas que existem em ambos)
#         chaves_disponiveis = []
#         chaves_candidatas = ['cidade', 'nome_curso', 'modalidade', 'turno', 'momento_presencial', 'horario_aulas']
        
#         for chave in chaves_candidatas:
#             if chave in base.columns and chave in novos_normalizado.columns:
#                 chaves_disponiveis.append(chave)
        
#         if not chaves_disponiveis:
#             print("❌ Nenhuma chave de comparação disponível!")
#             return False
        
#         print(f"\n🔑 CHAVES PARA COMPARAÇÃO: {chaves_disponiveis}")
        
#         # Verificar registros existentes
#         print(f"\n🔍 VERIFICANDO REGISTROS EXISTENTES...")
        
#         # Função para verificar se um registro existe
#         def registro_existe(row):
#             if len(base) == 0:
#                 return False
            
#             condicoes = True
#             for chave in chaves_disponiveis:
#                 valor_novo = row[chave] if pd.notna(row[chave]) else ""
#                 condicoes = condicoes & (base[chave].fillna("") == str(valor_novo))
            
#             return condicoes.any()
        
#         # Aplicar verificação
#         novos_normalizado['existe'] = novos_normalizado.apply(registro_existe, axis=1)
        
#         # Separar novos registros e atualizações
#         novos_registros = novos_normalizado[novos_normalizado['existe'] == False].copy()
#         atualizacoes = novos_normalizado[novos_normalizado['existe'] == True].copy()
        
#         print(f"   📊 Total de registros no arquivo novos: {len(novos_normalizado)}")
#         print(f"   🆕 Novos registros: {len(novos_registros)}")
#         print(f"   🔄 Atualizações: {len(atualizacoes)}")
        
#         # Adicionar novos registros
#         if len(novos_registros) > 0:
#             print(f"\n➕ ADICIONANDO {len(novos_registros)} NOVOS REGISTROS...")
            
#             for idx, row in novos_registros.iterrows():
#                 # Criar novo registro com estrutura completa
#                 novo_registro = {}
                
#                 # Adicionar todas as colunas do base
#                 for col in base.columns:
#                     if col in novos_normalizado.columns:
#                         novo_registro[col] = row[col]
#                     elif col == 'id':
#                         # Gerar novo ID
#                         novo_registro[col] = base['id'].max() + 1 if 'id' in base.columns and len(base) > 0 else 1
#                     elif col == 'created_at':
#                         novo_registro[col] = datetime.now()
#                     elif col == 'updated_at':
#                         novo_registro[col] = datetime.now()
#                     elif col == 'regiao':
#                         novo_registro[col] = 'Definir'
#                     else:
#                         novo_registro[col] = None
                
#                 # Adicionar ao DataFrame base
#                 base = pd.concat([base, pd.DataFrame([novo_registro])], ignore_index=True)
#                 print(f"   ✅ Adicionado: {row.get('nome_curso', 'N/A')} em {row.get('cidade', 'N/A')}")
        
#         # Processar atualizações
#         if len(atualizacoes) > 0:
#             print(f"\n🔄 PROCESSANDO {len(atualizacoes)} ATUALIZAÇÕES...")
            
#             for idx, row in atualizacoes.iterrows():
#                 # Encontrar registro correspondente
#                 condicoes = True
#                 for chave in chaves_disponiveis:
#                     valor_novo = row[chave] if pd.notna(row[chave]) else ""
#                     condicoes = condicoes & (base[chave].fillna("") == str(valor_novo))
                
#                 if condicoes.any():
#                     # Atualizar campos específicos
#                     indices = base[condicoes].index
                    
#                     for indice in indices:
#                         if 'data_inicio' in novos_normalizado.columns and pd.notna(row['data_inicio']):
#                             base.loc[indice, 'data_inicio'] = row['data_inicio']
                        
#                         if 'duracao_mes' in novos_normalizado.columns and pd.notna(row['duracao_mes']):
#                             base.loc[indice, 'duracao_mes'] = row['duracao_mes']
                        
#                         base.loc[indice, 'updated_at'] = datetime.now()
                    
#                     print(f"   ✅ Atualizado: {row.get('nome_curso', 'N/A')} em {row.get('cidade', 'N/A')}")
        
#         # Salvar resultado
#         arquivo_saida = 'nova_base_atualizada.csv'
#         print(f"\n💾 SALVANDO RESULTADO...")
        
#         try:
#             base.to_csv(arquivo_saida, index=False, encoding='utf-8', sep=';')
#             print(f"✅ Arquivo salvo: {arquivo_saida}")
#             print(f"📊 Total de registros no arquivo final: {len(base)}")
            
#             # Estatísticas finais
#             print(f"\n📈 ESTATÍSTICAS FINAIS:")
#             if 'cidade' in base.columns:
#                 cidades_unicas = base['cidade'].nunique()
#                 print(f"   🏙️ Cidades únicas: {cidades_unicas}")
            
#             if 'nome_curso' in base.columns:
#                 cursos_unicos = base['nome_curso'].nunique()
#                 print(f"   📚 Cursos únicos: {cursos_unicos}")
                
#             if 'modalidade' in base.columns:
#                 modalidades_unicas = base['modalidade'].nunique()
#                 print(f"   🎓 Modalidades únicas: {modalidades_unicas}")
            
#             return True
            
#         except Exception as e:
#             print(f"❌ Erro ao salvar arquivo: {e}")
#             return False
    
#     except Exception as e:
#         print(f"❌ Erro geral no processamento: {e}")
#         import traceback
#         traceback.print_exc()
#         return False

# def main():
#     """Função principal"""
#     print("🔄 SCRIPT DE UNIÃO DE CSVs - SENAI PARANÁ")
#     print("=" * 60)
    
#     sucesso = processar_uniao_csvs()
    
#     if sucesso:
#         print(f"\n🎉 PROCESSAMENTO CONCLUÍDO COM SUCESSO!")
#     else:
#         print(f"\n❌ PROCESSAMENTO FALHOU!")
#         sys.exit(1)

# if __name__ == "__main__":
#     main()

## >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
## >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 23/06/2025 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
## >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

import pandas as pd
import os
from datetime import datetime
import sys

def analisar_estrutura_csv(df, nome_arquivo):
    """Analisa e exibe a estrutura do CSV"""
    print(f"\n{'='*60}")
    print(f"ANÁLISE: {nome_arquivo}")
    print(f"{'='*60}")
    print(f"📊 Total de linhas: {len(df)}")
    print(f"📋 Total de colunas: {len(df.columns)}")
    
    print(f"\n🔍 COLUNAS DISPONÍVEIS:")
    for i, col in enumerate(df.columns, 1):
        print(f"   {i:2d}. '{col}'")
    
    print(f"\n📝 PRIMEIRAS 3 LINHAS:")
    try:
        print(df.head(3).to_string())
    except Exception as e:
        print(f"Erro ao exibir dados: {e}")
    
    return df.columns.tolist()

def mapear_colunas(colunas_origem, colunas_destino):
    """Cria mapeamento entre colunas dos CSVs"""
    mapeamento = {}
    
    # Mapeamento automático baseado em similaridade
    mapeamentos_conhecidos = {
        'regiao': ['regiao', 'região'],
        'cidade': ['cidade'],
        'nome_curso': ['nome_curso', 'curso', 'nome do curso'],
        'modalidade': ['modalidade'],
        'vagas': ['vagas'],
        'turno': ['turno'],
        'momento_presencial': ['momento_presencial'],
        'horario_aulas': ['horario_aulas', 'horário_aulas', 'horario das aulas'],
        'duracao_mes': ['duracao_mes', 'duração_mes', 'duracao', 'duração'],
        'data_inicio': ['data_inicio', 'data de inicio', 'data_de_inicio'],
        'endereco': ['endereco', 'endereço']
    }
    
    print(f"\n🔄 MAPEAMENTO DE COLUNAS:")
    for col_destino, possibilidades in mapeamentos_conhecidos.items():
        for possibilidade in possibilidades:
            if possibilidade in [col.lower() for col in colunas_origem]:
                # Encontrar a coluna exata (case-sensitive)
                col_encontrada = next(col for col in colunas_origem if col.lower() == possibilidade.lower())
                mapeamento[col_destino] = col_encontrada
                print(f"   ✅ {col_destino} ← {col_encontrada}")
                break
        else:
            print(f"   ❌ {col_destino} não encontrada")
    
    return mapeamento

def processar_uniao_csvs():
    """Função principal para unir os CSVs"""
    try:
        # Caminhos dos arquivos
        caminho_base = r'C:\Users\alexandre215975\OneDrive - Sistema Fiep\Área de Trabalho\chat-backend\src\data\novos_cursos.csv'
        caminho_novos = r'src\data\cursos_denovo.csv'
        
        print("🚀 INICIANDO PROCESSAMENTO DE UNIÃO DE CSVs")
        print(f"📁 Arquivo base: {caminho_base}")
        print(f"📁 Arquivo novos: {caminho_novos}")
        
        # Verificar se os arquivos existem
        if not os.path.exists(caminho_base):
            print(f"❌ Arquivo base não encontrado: {caminho_base}")
            return False
            
        if not os.path.exists(caminho_novos):
            print(f"❌ Arquivo novos não encontrado: {caminho_novos}")
            return False
        
        # Carregar CSVs
        print("\n📖 Carregando arquivos...")
        
        # Tentar diferentes delimitadores e codificações para o arquivo base
        base = None
        delimitadores = [',', ';', '\t']
        codificacoes = ['utf-8', 'latin1', 'cp1252', 'iso-8859-1']
        
        for delim in delimitadores:
            for encoding in codificacoes:
                try:
                    base_temp = pd.read_csv(caminho_base, delimiter=delim, encoding=encoding)
                    # Verificar se carregou corretamente (deve ter múltiplas colunas)
                    if len(base_temp.columns) > 5:
                        base = base_temp
                        print(f"✅ Arquivo base carregado com delimitador '{delim}' e encoding '{encoding}'")
                        print(f"   📋 Colunas detectadas: {len(base.columns)}")
                        break
                    else:
                        print(f"⚠️ Tentativa com delimitador '{delim}' e encoding '{encoding}': apenas {len(base_temp.columns)} coluna(s)")
                except Exception as e:
                    print(f"❌ Falha com delimitador '{delim}' e encoding '{encoding}': {str(e)[:100]}")
                    continue
            
            if base is not None:
                break
        
        if base is None:
            print("❌ Não foi possível carregar o arquivo base com nenhuma combinação de delimitador/encoding")
            print("🔍 Verificando estrutura do arquivo manualmente...")
            
            # Tentar ler as primeiras linhas como texto para diagnóstico
            try:
                with open(caminho_base, 'r', encoding='utf-8') as f:
                    primeiras_linhas = [f.readline().strip() for _ in range(3)]
                    print("📝 Primeiras linhas do arquivo:")
                    for i, linha in enumerate(primeiras_linhas, 1):
                        print(f"   {i}. {linha[:200]}...")
                        
                    # Detectar delimitador mais provável
                    primeira_linha = primeiras_linhas[0]
                    count_comma = primeira_linha.count(',')
                    count_semicolon = primeira_linha.count(';')
                    count_tab = primeira_linha.count('\t')
                    
                    print(f"🔍 Análise de delimitadores na primeira linha:")
                    print(f"   Vírgulas: {count_comma}")
                    print(f"   Ponto e vírgula: {count_semicolon}")
                    print(f"   Tabs: {count_tab}")
                    
                    # Tentar com o delimitador mais provável
                    if count_comma > count_semicolon and count_comma > count_tab:
                        delim_provavel = ','
                    elif count_semicolon > count_tab:
                        delim_provavel = ';'
                    else:
                        delim_provavel = '\t'
                    
                    print(f"🎯 Tentando forçar delimitador: '{delim_provavel}'")
                    
                    try:
                        base = pd.read_csv(caminho_base, delimiter=delim_provavel, encoding='utf-8')
                        print(f"✅ Sucesso! Arquivo carregado com {len(base.columns)} colunas")
                    except:
                        try:
                            base = pd.read_csv(caminho_base, delimiter=delim_provavel, encoding='latin1')
                            print(f"✅ Sucesso com latin1! Arquivo carregado com {len(base.columns)} colunas")
                        except Exception as e:
                            print(f"❌ Falha final: {e}")
                            return False
                            
            except Exception as e:
                print(f"❌ Erro ao analisar arquivo manualmente: {e}")
                return False
        
        # Carregar arquivo novos com a mesma abordagem robusta
        novos = None
        for delim in delimitadores:
            for encoding in codificacoes:
                try:
                    novos_temp = pd.read_csv(caminho_novos, delimiter=delim, encoding=encoding)
                    if len(novos_temp.columns) > 5:
                        novos = novos_temp
                        print(f"✅ Arquivo novos carregado com delimitador '{delim}' e encoding '{encoding}'")
                        print(f"   📋 Colunas detectadas: {len(novos.columns)}")
                        break
                except Exception as e:
                    continue
            
            if novos is not None:
                break
        
        if novos is None:
            print("❌ Não foi possível carregar o arquivo novos")
            return False
        
        # Validar se os arquivos foram carregados corretamente
        if len(base.columns) <= 1:
            print("❌ Arquivo base parece estar malformado (apenas 1 coluna detectada)")
            print("🔧 Tentando estratégias de recuperação...")
            
            # Estratégia: verificar se é um problema de aspas ou escape
            try:
                base = pd.read_csv(caminho_base, delimiter=',', quotechar='"', escapechar='\\')
                if len(base.columns) > 1:
                    print("✅ Recuperação bem-sucedida com quotechar")
                else:
                    # Última tentativa: forçar separação manual
                    print("🔧 Tentando separação manual...")
                    with open(caminho_base, 'r', encoding='utf-8') as f:
                        primeira_linha = f.readline().strip()
                        
                    # Se a primeira linha contém vírgulas, forçar separação
                    if ',' in primeira_linha:
                        colunas = primeira_linha.split(',')
                        print(f"📋 Colunas detectadas manualmente: {len(colunas)}")
                        
                        # Recarregar com nomes de colunas explícitos
                        base = pd.read_csv(caminho_base, 
                                         delimiter=',', 
                                         header=0,
                                         names=range(len(colunas)) if len(colunas) > 10 else None)
                        
                        # Se ainda não funcionou, criar DataFrame manualmente
                        if len(base.columns) <= 1:
                            print("🔧 Criando estrutura manual...")
                            # Definir colunas esperadas baseadas no cabeçalho visto
                            colunas_esperadas = ['id', 'regiao', 'cidade', 'nome_curso', 'modalidade', 
                                               'vagas', 'turno', 'momento_presencial', 'horario_aulas', 
                                               'duracao_mes', 'data_inicio', 'data_inicio_matricula', 
                                               'valor_curso', 'created_at', 'updated_at', 'endereco']
                            
                            # Ler como texto e processar linha por linha
                            dados_processados = []
                            with open(caminho_base, 'r', encoding='utf-8') as f:
                                for i, linha in enumerate(f):
                                    if i == 0:  # Pular cabeçalho
                                        continue
                                    valores = linha.strip().split(',')
                                    if len(valores) >= len(colunas_esperadas):
                                        dados_processados.append(valores[:len(colunas_esperadas)])
                            
                            if dados_processados:
                                base = pd.DataFrame(dados_processados, columns=colunas_esperadas)
                                print(f"✅ Arquivo base reconstruído: {len(base)} linhas, {len(base.columns)} colunas")
                            else:
                                print("❌ Falha na reconstrução manual")
                                return False
                        
            except Exception as e:
                print(f"❌ Todas as estratégias de recuperação falharam: {e}")
                return False
        
        if len(novos.columns) <= 1:
            print("❌ Arquivo novos também parece estar malformado")
            return False
        colunas_base = analisar_estrutura_csv(base, "ARQUIVO BASE")
        colunas_novos = analisar_estrutura_csv(novos, "ARQUIVO NOVOS")
        
        # Criar mapeamento de colunas
        mapeamento = mapear_colunas(colunas_novos, colunas_base)
        
        if not mapeamento:
            print("❌ Nenhum mapeamento de colunas encontrado!")
            return False
        
        # Normalizar arquivo novos para estrutura do base
        print(f"\n🔄 NORMALIZANDO ESTRUTURA...")
        novos_normalizado = pd.DataFrame()
        
        # Copiar colunas mapeadas
        for col_destino, col_origem in mapeamento.items():
            if col_origem in novos.columns:
                novos_normalizado[col_destino] = novos[col_origem]
                print(f"   ✅ Copiado: {col_origem} → {col_destino}")
        
        # Adicionar colunas faltantes com valores padrão
        colunas_obrigatorias = ['cidade', 'nome_curso', 'modalidade']
        for col in colunas_obrigatorias:
            if col not in novos_normalizado.columns:
                print(f"   ❌ Coluna obrigatória faltando: {col}")
                return False
        
        # Definir chaves para comparação (usar apenas colunas que existem em ambos)
        chaves_disponiveis = []
        chaves_candidatas = ['cidade', 'nome_curso', 'modalidade', 'turno', 'momento_presencial', 'horario_aulas']
        
        for chave in chaves_candidatas:
            if chave in base.columns and chave in novos_normalizado.columns:
                chaves_disponiveis.append(chave)
        
        if not chaves_disponiveis:
            print("❌ Nenhuma chave de comparação disponível!")
            return False
        
        print(f"\n🔑 CHAVES PARA COMPARAÇÃO: {chaves_disponiveis}")
        
        # Verificar registros existentes
        print(f"\n🔍 VERIFICANDO REGISTROS EXISTENTES...")
        
        # Função para verificar se um registro existe
        def registro_existe(row):
            if len(base) == 0:
                return False
            
            condicoes = True
            for chave in chaves_disponiveis:
                valor_novo = row[chave] if pd.notna(row[chave]) else ""
                condicoes = condicoes & (base[chave].fillna("") == str(valor_novo))
            
            return condicoes.any()
        
        # Aplicar verificação
        novos_normalizado['existe'] = novos_normalizado.apply(registro_existe, axis=1)
        
        # Separar novos registros e atualizações
        novos_registros = novos_normalizado[novos_normalizado['existe'] == False].copy()
        atualizacoes = novos_normalizado[novos_normalizado['existe'] == True].copy()
        
        print(f"   📊 Total de registros no arquivo novos: {len(novos_normalizado)}")
        print(f"   🆕 Novos registros: {len(novos_registros)}")
        print(f"   🔄 Atualizações: {len(atualizacoes)}")
        
        # Adicionar novos registros
        if len(novos_registros) > 0:
            print(f"\n➕ ADICIONANDO {len(novos_registros)} NOVOS REGISTROS...")
            
            for idx, row in novos_registros.iterrows():
                # Criar novo registro com estrutura completa
                novo_registro = {}
                
                # Adicionar todas as colunas do base
                for col in base.columns:
                    if col in novos_normalizado.columns:
                        novo_registro[col] = row[col]
                    elif col == 'id':
                        # Gerar novo ID
                        novo_registro[col] = base['id'].max() + 1 if 'id' in base.columns and len(base) > 0 else 1
                    elif col == 'created_at':
                        novo_registro[col] = datetime.now()
                    elif col == 'updated_at':
                        novo_registro[col] = datetime.now()
                    elif col == 'regiao':
                        novo_registro[col] = 'Definir'
                    else:
                        novo_registro[col] = None
                
                # Adicionar ao DataFrame base
                base = pd.concat([base, pd.DataFrame([novo_registro])], ignore_index=True)
                print(f"   ✅ Adicionado: {row.get('nome_curso', 'N/A')} em {row.get('cidade', 'N/A')}")
        
        # Processar atualizações
        if len(atualizacoes) > 0:
            print(f"\n🔄 PROCESSANDO {len(atualizacoes)} ATUALIZAÇÕES...")
            
            for idx, row in atualizacoes.iterrows():
                # Encontrar registro correspondente
                condicoes = True
                for chave in chaves_disponiveis:
                    valor_novo = row[chave] if pd.notna(row[chave]) else ""
                    condicoes = condicoes & (base[chave].fillna("") == str(valor_novo))
                
                if condicoes.any():
                    # Atualizar campos específicos
                    indices = base[condicoes].index
                    
                    for indice in indices:
                        if 'data_inicio' in novos_normalizado.columns and pd.notna(row['data_inicio']):
                            base.loc[indice, 'data_inicio'] = row['data_inicio']
                        
                        if 'duracao_mes' in novos_normalizado.columns and pd.notna(row['duracao_mes']):
                            base.loc[indice, 'duracao_mes'] = row['duracao_mes']
                        
                        base.loc[indice, 'updated_at'] = datetime.now()
                    
                    print(f"   ✅ Atualizado: {row.get('nome_curso', 'N/A')} em {row.get('cidade', 'N/A')}")
        
        # Salvar resultado
        arquivo_saida = 'nova_base_atualizada.csv'
        print(f"\n💾 SALVANDO RESULTADO...")
        
        try:
            base.to_csv(arquivo_saida, index=False, encoding='utf-8', sep=';')
            print(f"✅ Arquivo salvo: {arquivo_saida}")
            print(f"📊 Total de registros no arquivo final: {len(base)}")
            
            # Estatísticas finais
            print(f"\n📈 ESTATÍSTICAS FINAIS:")
            if 'cidade' in base.columns:
                cidades_unicas = base['cidade'].nunique()
                print(f"   🏙️ Cidades únicas: {cidades_unicas}")
            
            if 'nome_curso' in base.columns:
                cursos_unicos = base['nome_curso'].nunique()
                print(f"   📚 Cursos únicos: {cursos_unicos}")
                
            if 'modalidade' in base.columns:
                modalidades_unicas = base['modalidade'].nunique()
                print(f"   🎓 Modalidades únicas: {modalidades_unicas}")
            
            return True
            
        except Exception as e:
            print(f"❌ Erro ao salvar arquivo: {e}")
            return False
    
    except Exception as e:
        print(f"❌ Erro geral no processamento: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Função principal"""
    print("🔄 SCRIPT DE UNIÃO DE CSVs - SENAI PARANÁ")
    print("=" * 60)
    
    sucesso = processar_uniao_csvs()
    
    if sucesso:
        print(f"\n🎉 PROCESSAMENTO CONCLUÍDO COM SUCESSO!")
    else:
        print(f"\n❌ PROCESSAMENTO FALHOU!")
        sys.exit(1)

if __name__ == "__main__":
    main()