export function normalizarCidade(cidade) {
    const mapeamento = {
    "Cwb": "Curitiba",
    "cascavel": "Cascavel",
    "ponta grossa": "Ponta Grossa",
    "pg": "Ponta Grossa",
    "londrina": "Londrina",
    "maringá": "Maringá",
    "maringa": "Maringá",
    "foz do iguaçu": "Foz do Iguaçu",
    "foz": "Foz do Iguaçu",
    "pato branco": "Pato Branco",
    "pato": "Pato Branco",
    "guarapuava": "Guarapuava",
    "toledo": "Toledo",
    "são josé dos pinhais": "São José dos Pinhais",
    "soo jose dos pinhais": "São José dos Pinhais",
    "sjp": "São José dos Pinhais",
    "cianorte": "Cianorte",
    "paranaguá": "Paranaguá",
    "apucarana": "Apucarana",
    "irati": "Irati",
    "telêmaco borba": "Telêmaco Borba",
    "telemaco borba": "Telêmaco Borba",
    "arapongas": "Arapongas",
    "rio negro": "Rio Negro",
    "pinhais": "Pinhais",
    "jaguariaíva": "Jaguariaíva",
    "são mateus do sul": "São Mateus do Sul",
    "são mateus": "São Mateus do Sul",
    "soo mateus": "São Mateus do Sul",
    "boqueirão": "Boqueirão",
    "boquerao": "Boqueirão",
    "boqueirao": "Boqueirão",
    "campus da industria": "Campus da Indústria",
    "cic": "CIC",
    "dr. ceslo chauri": "Dr. Ceslo Chauri",
    "campo mourão": "Campo Mourão",
    "campo morao": "Campo Mourão",
    "santo antônio da platina": "Santo Antônio da Platina",
    "afonso pena": "Alfonso Pena",
    "colombo": "Colombo",
    "paranavai": "Paranavaí",
    "paranavaí": "Paranavaí",
    "apucarana": "Apucarana II",
    "medianeira": "Medianeira",
    "fransisco beltrão": "Francisco Beltrão",
    "francisco beltrao": "Francisco Beltrão",
    "palmas": "Palmas"
  };
  return mapeamento[cidade.toLowerCase()] || cidade;
}

export function normalizarModalidade(modalidade) {
  const mapeamentoModalidade = {
    "presencial": "Presencial",
    "online": "Online",
    "ead": "EAD",
    "remoto": "EAD",
    "distancia": "EAD"
  };
  return mapeamentoModalidade[modalidade.toLowerCase()] || modalidade;
}