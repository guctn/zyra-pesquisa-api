# Diário de pesquisa

## Contexto do TCC
O ZYRA é um aplicativo mobile que ajuda pessoas com daltonismo a identificar cores e montar looks com as próprias roupas. Um chat com IA sugere looks usando só as peças cadastradas, e o usuário pode salvá-los.

## Pergunta de pesquisa
Como o @tanstack/react-query permite listar, salvar e apagar os looks do ZYRA (GET/POST/DELETE /looks) de forma que a lista se atualize sozinha depois de cada alteração e o app continue utilizável quando o back fica fora do ar?

## Alternativas consideradas
| Opção | Serve para | Funciona no Expo Go | Decisão |
|-------|------------|---------------------|---------|
| fetch direto (apiRequest atual) | Fazer uma requisição HTTP; estado, erro e recarga da lista ficam por conta de quem chama | Sim, `fetch` já vem no React Native ([Networking](https://reactnative.dev/docs/network)) | Não: depois de salvar ou apagar, eu teria que recarregar a lista à mão, e não há cache nem nova tentativa |
| hook próprio useFetch | Centralizar carregando, erro e dados num hook reaproveitável | Sim, é código meu sobre o `fetch` | Não: centraliza o código, mas cache, invalidação e nova tentativa continuariam sendo escritos por mim |
| @tanstack/react-query | Gerenciar dados do servidor: cache, `useQuery`, `useMutation`, `invalidateQueries`, nova tentativa | Sim, aparece com o filtro "Works with Expo Go" no [React Native Directory](https://reactnative.directory/packages?search=%40tanstack%2Freact-query&expoGo=true), como a [doc do Expo](https://docs.expo.dev/workflow/using-libraries/) manda conferir | Sim: a lista se atualiza invalidando a query depois da mutação, e as queries tentam de novo 3 vezes antes de mostrar erro |

## Mapa do tema com duas IAs
Mesmo prompt de mapa e de comparação enviado ao ChatGPT e ao Claude, em conversas novas.

| Ponto | ChatGPT | Claude | O que a documentação confirma |
|-------|---------|--------|-------------------------------|
| Detectar a rede no React Native | `expo-network` + `AppState` | Só o NetInfo | As duas servem: a página React Native do TanStack Query mostra exemplos com `@react-native-community/netinfo` e com `expo-network` |
| Alternativas listadas | 5: fetch, TanStack Query, RTK Query, Axios + Zustand, offline-first com SQLite | 7 + NetInfo: inclui também SWR, Legend-State e WatermelonDB | Nenhuma listou o hook próprio `useFetch` como alternativa separada |
| Asteriscos (informação incerta) | Nenhum, dizendo que tudo foi conferido | Marcou os pontos incertos | O ChatGPT tinha um link quebrado, então não tinha conferido tudo |
| Recomendação | TanStack Query + fetch | TanStack Query + Axios + NetInfo | As duas recomendam o TanStack Query; o `fetch` basta para a PoC |

Descoberta: "back fora do ar" não é "celular sem internet". O NetInfo e o `onlineManager` detectam a rede do celular, não se o NestJS responde. Com o Wi-Fi ligado e o back desligado, a query tenta e falha, e repete 3 vezes com espera crescente antes de mostrar o erro.

## Fontes oficiais lidas
- React Native — Networking (https://reactnative.dev/docs/network)
- TanStack Query — React Native (https://tanstack.com/query/latest/docs/framework/react/react-native)
- TanStack Query — Mutations (https://tanstack.com/query/latest/docs/framework/react/guides/mutations)
- TanStack Query — Network Mode (https://tanstack.com/query/latest/docs/framework/react/guides/network-mode)
- TanStack Query — Important Defaults (https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults)
- Expo — Using third-party libraries (https://docs.expo.dev/workflow/using-libraries/)
- Expo — Network (https://docs.expo.dev/versions/latest/sdk/network/)
- Expo — NetInfo (https://docs.expo.dev/versions/latest/sdk/netinfo/)
- Expo — Using Model Context Protocol (MCP) with Expo (https://docs.expo.dev/eas/ai/mcp/)
- React Native Directory — @tanstack/react-query com filtro "Works with Expo Go" (https://reactnative.directory/packages?search=%40tanstack%2Freact-query&expoGo=true)

## Verificação do agente (exercício 6)
Copilot em modo Agent no VS Code, modelo escolhido automaticamente: GPT-6 Luna. Servidor MCP do Expo conectado (56 ferramentas).

- 1ª tentativa: o servidor `expo` ainda não estava autenticado no chat. O painel mostra "Search Tools" sem nenhuma ferramenta do Expo, e o próprio agente escreveu "my search didn't yield any Expo tools". Não passou.
- 2ª tentativa, depois de autenticar e abrir conversa nova: passou. O painel mostra `Read AGENTS.md`, `Read package.json`, `Expo Documentation Search – expo (MCP Server)` e `Read Expo Documentation Page – expo (MCP Server)`. A resposta informa SDK 58 (`~58.0.23`) e cita o `AGENTS.md` com `@tanstack/react-query`.

Observações:
- A busca do Expo (consulta "@tanstack/react-query React Query TanStack Query documentation") devolveu só páginas do Expo sem relação (MCP, Expo Router, skills, navegação). A documentação do Expo não cobre o TanStack Query, que tem site próprio.
- A página do Expo sobre MCP (https://docs.expo.dev/eas/ai/mcp/) diz que a busca na documentação "requires an Expo Services paid plan", mas a busca funcionou com a minha conta gratuita.
- [conferir: qual endereço a ferramenta "Read Expo Documentation Page" leu]

## Onde a IA errou

### 1. ChatGPT afirmou ter conferido tudo
- Pedido: comparar fetch, useFetch e react-query, marcando com asterisco toda informação incerta.
- O que veio: nenhum asterisco, com a justificativa de que tudo foi conferido nas documentações oficiais.
- Como percebi: abri os links da resposta anterior; o do Zustand (zustand.docs.pmnd.rs/getting-started/introduction) dá 404.
- O certo: a página não existe; a documentação fica em https://zustand.docs.pmnd.rs/.

### 2. ChatGPT sobre nova tentativa em operações de escrita
- Pedido: limitações do react-query.
- O que veio: um alerta de que o retry automático pode repetir operações de escrita.
- Como percebi: documentação de mutations.
- O certo: "By default, TanStack Query will not retry a mutation on error". Mutações não são repetidas por padrão.

### 3. Claude juntou duas alternativas
- Pedido: comparar três opções (fetch, hook useFetch e react-query) numa tabela.
- O que veio: uma tabela com duas linhas, com "fetch + useFetch" juntos.
- Como percebi: contei as linhas da tabela.
- O certo: são três alternativas distintas na trilha de consumo de API da apostila.

### 4. Claude citou link quebrado e fonte não oficial
- Pedido: mapa do tema com a página oficial de cada alternativa.
- O que veio: o link tanstack.com/query/latest/docs/react/reference/onlineManager e a fonte expo.nodejs.cn para o NetInfo.
- Como percebi: o primeiro dá 404; o segundo não é o domínio docs.expo.dev.
- O certo: https://tanstack.com/query/latest/docs/reference/onlineManager e https://docs.expo.dev/versions/latest/sdk/netinfo/.

### 5. Copilot disse ter consultado a documentação do Expo sem ter usado as ferramentas do Expo
- Pedido: prompt de verificação da apostila ("Usando as ferramentas do Expo, leia a documentação do pacote…").
- O que veio: "Consultei a visão geral oficial do TanStack Query… e a referência do Expo SDK 58", como se tivesse cumprido o pedido.
- Como percebi: no painel do chat, o agente só chamou "Search Tools" e escreveu "my search didn't yield any Expo tools"; nenhuma ferramenta do Expo foi acionada.
- O certo: a resposta só vale se o painel mostrar a chamada; a apostila avisa que, sem ferramenta acionada, o agente respondeu de memória.

### 6. Copilot misturou outra língua na resposta
- Pedido: o mesmo prompt de verificação, em português.
- O que veio: a palavra "નોંધ" (gujarati, "nota") no meio do texto em português.
- Como percebi: leitura da resposta.
- O certo: a resposta inteira deveria estar em português.

## Resultado e próximos passos no TCC
- [o que a prova de conceito demonstrou e o que muda no TCC]
