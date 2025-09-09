//define uma classe responsavel por analisar recintos do zoológico.
class RecintosZoo {
    //o construtor é chamado quando criamos um new RecintosZoo()
    constructor(parameters) {
        //this.recintos: lista com os recintos existentes no zoo.
        //cada recinto tem: numero, bioma, tamanho total e os animais que já foram lá.
        this.recintos = [
            //Recinto 1: bioma savana, tamanho 10, já possui 3 macacos
            {numero: 1, bioma: "savana", tamanho: 10, animais: [{especie: "MACACO", quantidade: 3}]},
            //Recinto 2: bioma: floresta, tamanho 5, está vazio
            {numero: 2, bioma: "floresta", tamanho: 5, animais: [] },
            //Recinto 3: bioma: combinado "savana e rio", 5 está vazio
            {numero: 3, bioma: "savana e rio", tamanho: 7, animais:[{especie: "GAZELA", quantidade: 1}]},
            //Recinto 4: bioma: rio, tamanho 8, está vazio
            {numero: 4, bioma: "rio", tamanho: 8, animais: [] },
            //Recinto 5: savana, tamanho 9, já possui 1 leão
            {numero: 5, bioma: "savana", tamanho: 9, animais: [{especie: "LEAO", quantidade: 1}]}
        ];

        //this.animais: "tabela" com as espécies permitidas, seu tamanho (por individuo),
        //biomas compativeis e se é carnivoro ou nao.
        this.animais = {
            LEAO:       {tamanho: 3, bioma: ["savana"],             carnivoro: true},
            LEOPARDO:   {tamanho: 2, bioma: ["savana"],             carnivoro: true},
            CROCODILO:  {tamanho: 3, bioma: ["rio"],                carnivoro: true},
            MACACO:     {tamanho: 1, bioma: ["savana", "floresta"], carnivoro: false},
            GAZELA:     {tamanho: 2, bioma: ["savana"],             carnivoro: false},
            HIPOPOTAMO: {tamanho: 4, bioma: ["savana", "rio"],      carnivoro: false} 
        };
    }

    //Método público exigido pelo desafio: recebe (animal, quantidade) e retorna
    //{recintosViaveis: [...]} ou {erro: "...."} 

    analisaRecinto(animal, quantidade) {
        //Normaliza o nome do animal para maiúsculas, igual às chaves da nossa tabela.
        animal = String(animal || "").toUpperCase();

        //1) validação do animal: precisa existir na tabela this.animais
        if (!this.animais[animal]){
            return {erro: "Animal inválido"}; //Mensagem exigida pelo anunciado
        }

        //2) validacao da quantidade: inteiro positivo
        if (!Number.isInteger(quantidade) || quantidade <= 0){
            return {erro: "quantidade invalida"};// mensagem exigida pelo anuncio
        }

        //pega os dados da especie (tamanho por individuo, biomas, se é carnivoro)
        const recintosViaveis = [];

        //Percorrendo todos os recintos e "peneiramos" os que nao servem
        for(const recinto of this.recintos){
            //(a) compatibilidade de bioma

            //quebramos o bioma do recinto em 'tokens'. ex. 'savana e rio' ->[savana, rio]
            const biomasDoRecinto = recinto.bioma.split(" e ").map (b => b.trim());

            //verificamos se pelo menos um bioma do recinto é aceito pela espécie.
            //ex.: LEAO aceita 'savana'; então 'savana' passa, 'rio' nao passa, 'savana e rio' passa (tem 'savana')
            const biomaCompativel = biomasDoRecinto.some(b => especie.biomas.includes(b));

            //se nao houver intersecao entre biomas aceitos pela especie e biomas do recinto, descarta.
            if (!biomaCompativel) continue;


            //(B) estado atual do recinto (ocupacao e especies presentes)

            // calcula o espaço ja ocupado pelos moradores atuais (soma tamanho*quantidade)
            let espacoOcupado = 0;

            //guardamos as especie presentes para saber se haverá mistura depois.
            const especiesExistentes = new Set();

            //tambem verificamos se ja existe algum carnivoro la dentro.
            let existeCarnivoroNoRecinto = false;

            for (const a of recinto.animais){
                const dadosExistente = this.animais[a.especie]; //pega regras da espécie existente
                espacoOcupado += dadosExistente.tamanho * a.quantidade; // soma ocupacao
                especiesExistentes.add(a.especie); //registra a espécie
                if (dadosExistente.carnivoro) existeCarnivoroNoRecinto = true; //marca carnivoro se houver
            }

            // c regra de carnivoros (em ambas as direcoes)
            if(especie.carnivoro){
                //se o novo animal é carnivoro:
                //so pode entrar se o recinto estiver vazio ou se ja houver somente a mesma especie la dentro.
                const haOutraEspecieDiferente = especiesExistentes.size > 0 && (!especiesExistentes.has(animal)|| especiesExistentes.size > 1);
                if(haOutraEspecieDiferente) continue;//mistura com carnivoro e proibido
            }else{
                //se o novo animal não e carnivoro mas ja existe carnivoro no recinto: proibido misturar.
                if(existeCarnivoroNoRecinto) continue;
            }


            // D regra do macaco sozinho

            // um macaco sozinho em recinto vazio nao se sente confortavel.
            if(animal === "MACACO" && recinto.animais.length === 0 && quantidade === 1){
                continue;
            }

            //regra do hipopotamo em convivencia

            //montamos o conjunto de especie que ficara 'depois' da inclusao

            const especiesDepois = new Set(especiesExistentes);
            especiesDepois.add(animal);

            //Havera mistura se, depois existir pelo menos 2 especies diferentes
            const haMistura = especiesDepois.size >= 2;

            //checamos se haverá hipopotamo no recinto (seja o novo animal ou um já existente)
            const haHipopotamoDepois = animal === "HIPOPOTAMO" || especiesExistentes.has("HIPOPOTAMO");

            if(haMistura && haHipopotamoDepois){
                ///para hipopotamo conviver com outra especie, o recinto precisa ter "savana" e "rio".
                const temSavana = biomasDoRecinto.includes("savana");
                const temRio = biomasDoRecinto.includes("rio");
                if(!(temSavana && temRio)) continue; //se nao tiver os dois, descarta
            }

            // f checagem de espaço

            // espaço que o novo lote precisa (tamanho individual * quantidade)
            const espacoNovo = especie.tamanho * quantidade;

            //se houver mistura de especies (depois que entra), soma-se 1 espaco extra.
            const extraConvivencia = haMistura ? 1 : 0;

            //espaco total que sera ocupado com a inclusao
            const totalNecessario = espacoOcupado + espacoNovo + extraConvivencia;

            //se couber, calculamos o especo que vai sobrar
            const espacoLivre = recinto.tamanho - totalNecessario;

            // e guardamos a descricao no formato pedido pelo desafio
            recintosViaveis.push(
                `Recinto ${recinto.numero} (espaço livre: ${espacoLivre} total: ${recinto.tamanho})`
            );
        }

        // g retorno final

        // se nenhum recinto passou em todas as regras:
        if(recintosViaveis.length === 0){
            return {erro: "Não há recinto viável"};
        }

        //o anunciado pede a lista ordenada por número do recinto.
        // nossa lista ja segue a ordem do array this.recinto (1..5)
        //mas se voce quiser blindar poderia ordenar aqui por número extraido da string.
        return {recintosViaveis};
    }
}