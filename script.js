// Defina a data do próximo feriado nacional como uma variável global inicialmente
let proximoFeriado;

let paginaRecarregada = false;

document.getElementById("tsparticles").style.display = "none";

document.getElementById("loading").style.display = "flex";
setTimeout(function () {
  document.getElementById("loading").style.opacity = "1";
}, 500);
// Adicione um ouvinte de eventos ao seletor
document.getElementById("combobox-uf").addEventListener("change", function () {
  // Quando o valor do seletor for alterado, chame a função getHoliday() novamente
  getHoliday();
});

// Chame a função para obter o próximo feriado
getHoliday();

// Chame a função para atualizar a contagem regressiva a cada segundo
setInterval(atualizarContagemRegressiva, 1000);

// Função para atualizar a contagem regressiva
function atualizarContagemRegressiva() {
  // Verifique se a variável proximoFeriado está definida
  if (!proximoFeriado) {
    return;
  }

  const agora = new Date().getTime();
  const diferenca = proximoFeriado.getTime() - agora;

  const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
  const horas = Math.floor(
    (diferenca % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60));
  const segundos = Math.floor((diferenca % (1000 * 60)) / 1000);

  // document.getElementById(
  //   "countdown"
  // ).innerHTML = `${dias}d ${horas}h ${minutos}m ${segundos}s`;
  document.getElementById("days").textContent = dias;
  document.getElementById("hours").textContent = horas;
  document.getElementById("minutes").textContent = minutos;
  document.getElementById("seconds").textContent = segundos;

  document.getElementById("label-days").textContent =
    dias === 0 || dias === 1 ? "Dia" : "Dias";
  document.getElementById("label-hours").textContent =
    horas === 0 || horas === 1 ? "Hora" : "Horas";
  document.getElementById("label-minutes").textContent =
    minutos === 0 || minutos === 1 ? "Minuto" : "Minutos";
  document.getElementById("label-seconds").textContent =
    segundos === 0 || segundos === 1 ? "Segundo" : "Segundos";

  // Verifique se o contador chegou a zero e se a página ainda não foi recarregada
  if (
    dias === 0 &&
    horas === 0 &&
    minutos === 0 &&
    segundos === 0 &&
    !paginaRecarregada
  ) {
    // Atualize a variável indicando que a página foi recarregada
    paginaRecarregada = true;
    // Recarregue a página
    setTimeout(function () {
      location.reload();
    }, 500);
  }
}

// Função para obter o próximo feriado da API
function getHoliday() {
  const uf = document.getElementById("combobox-uf").value;
  const ufSelect = document.getElementById("combobox-uf");
  const state = ufSelect.options[ufSelect.selectedIndex].textContent.trim();
  const anoAtual = new Date().getFullYear();
  let loadingText;
  // Define o texto do carregamento com base no estado selecionado
  if (uf === "br") {
    loadingText = "Aguarde, estamos procurando os feriados para todo o Brasil";
  } else {
    loadingText = `Aguarde, estamos procurando os feriados para o estado selecionado (${state})`;
  }

  // Altera o texto do elemento h1 dentro do loading
  document.querySelector("#loading h1").textContent = loadingText;

  document.getElementById("loading").style.display = "flex";
  setTimeout(function () {
    document.getElementById("loading").style.opacity = "1";
  }, 500);

  //------------------------------------------------------------------------------
  if (uf === "br") {
    const nationalHolidayURL = `https://script.google.com/macros/s/AKfycbxIceWYKXQ33Suxg6Ya-4c9q95ZIn8mwpzi6Kld9x-_Yf9LBaY5QC4Y1R02oNK25J-NHw/exec?type=nacional&year=${anoAtual}`;
    const comemorativeDatesURL = `https://script.google.com/macros/s/AKfycbxIceWYKXQ33Suxg6Ya-4c9q95ZIn8mwpzi6Kld9x-_Yf9LBaY5QC4Y1R02oNK25J-NHw/exec?type=comemorativo&year=${anoAtual}`;
    const now = new Date();
    const dataAtual = new Date();

    document.getElementById("municipios").style.display = "none";

    // Limpar todos os elementos <p> dentro do elemento com o ID "comemorativos"
    const comemorativosContainer = document.getElementById("comemorativos");
    const paragrafosComemorativos =
      comemorativosContainer.querySelectorAll("p");
    paragrafosComemorativos.forEach((paragrafo) => {
      comemorativosContainer.removeChild(paragrafo);
    });

    // Limpar todos os elementos <p> dentro do elemento com o ID "comemorativos"
    const feriadosContainer = document.getElementById("feriados");
    const paragrafosFeriados = feriadosContainer.querySelectorAll("p");
    paragrafosFeriados.forEach((paragrafo) => {
      feriadosContainer.removeChild(paragrafo);
    });

    // Array para armazenar as promessas das requisições fetch
    const requests = [];

    // Adiciona as promessas ao array
    requests.push(
      fetch(nationalHolidayURL).then((response) => response.json())
    );
    requests.push(
      fetch(comemorativeDatesURL).then((response) => response.json())
    );
    // Executa todas as promessas e espera que todas sejam resolvidas
    Promise.all(requests)
      .then((responses) => {
        // Aqui você pode acessar os dados de cada resposta
        const [nationalData, comemorativeData] = responses;

        // Aqui você pode fazer qualquer manipulação com os dados retornados
        // Filtrar feriados futuros
        const feriadosFuturos = nationalData.filter(
          (feriado) => new Date(feriado.date + " 00:00:00") > now
        );

        // Ordenar feriados futuros por data
        feriadosFuturos.sort(
          (a, b) => new Date(a.date + " 00:00:00") - new Date(b.date)
        );
        // O próximo feriado será o primeiro da lista de feriados futuros
        proximoFeriado = new Date(feriadosFuturos[0].date + " 00:00:00");

        document.getElementById("holiday").innerHTML =
          "Próximo feriado: " +
          feriadosFuturos[0].name +
          " (" +
          formatarData(feriadosFuturos[0].date) +
          ")";

        // Obter o dia da semana do próximo feriado usando a função converterData
        const diaDaSemana = converterData(feriadosFuturos[0].date).diaDaSemana;

        document.getElementById("dia").innerHTML =
          "O feriado vai cair " + diaDaSemana;

        // Atualizar a contagem regressiva quando a data do próximo feriado for definida
        atualizarContagemRegressiva();

        // Seleciona o elemento onde você deseja adicionar as datas comemorativas
        const comemorativosContainer = document.getElementById("comemorativos");

        // Filtra as datas comemorativas do mês atual
        const datasComemorativasMesAtual = comemorativeData.filter(
          (feriado) => {
            const data = new Date(feriado.date + " 00:00:00");
            return data.getMonth() === dataAtual.getMonth();
          }
        );

        // Itera sobre as datas comemorativas do mês atual e adiciona cada uma ao HTML
        datasComemorativasMesAtual.forEach((feriado) => {
          // Cria um elemento <p> para exibir a data comemorativa
          const paragrafo = document.createElement("p");
          // Define o texto do parágrafo como a data comemorativa
          const dataFormatada = formatarData(feriado.date);
          paragrafo.textContent = `${dataFormatada}: ${feriado.name}`;

          // Adiciona uma classe CSS ao parágrafo de acordo com a data da comemoração
          const dataFeriado = new Date(feriado.date + " 00:00:00");
          if (dataFeriado.getDate() < dataAtual.getDate()) {
            // Se a data do feriado for anterior à data atual, adicione a classe 'passado'
            paragrafo.classList.add("passado");
          } else if (
            dataFeriado.getDate() === dataAtual.getDate() &&
            dataFeriado.getMonth() === dataAtual.getMonth()
          ) {
            // Se a data do feriado for igual à data atual, adicione a classe 'hoje'
            paragrafo.classList.add("hoje");
            paragrafo.textContent = `${dataFormatada}: ${feriado.name} (HOJE)`;
          } else {
            // Caso contrário, adicione a classe 'futuro'
            paragrafo.classList.add("futuro");
          }

          // Adiciona o parágrafo ao container de datas comemorativas
          comemorativosContainer.appendChild(paragrafo);
        });

        const hoje = new Date(
          dataAtual.getFullYear(),
          dataAtual.getMonth(),
          dataAtual.getDate()
        );
        // Itera sobre as datas comemorativas do mês atual e adiciona cada uma ao HTML
        feriadosFuturos.forEach((feriado) => {
          // Cria um elemento <p> para exibir a data comemorativa
          const paragrafo = document.createElement("p");
          // Define o texto do parágrafo como a data comemorativa
          const dataFormatada = formatarData(feriado.date);
          paragrafo.textContent = `${dataFormatada}: ${feriado.name}`;
          // Adiciona uma classe CSS ao parágrafo de acordo com a data da comemoração
          const dataFeriado = new Date(feriado.date + " 00:00:00");
          if (dataFeriado > hoje) {
            paragrafo.classList.add("futuro");
          }

          // Adiciona o parágrafo ao container de datas comemorativas
          feriadosContainer.appendChild(paragrafo);
        });
      })
      .finally(() => {
        // Oculta o loading após ambas as requisições fetch serem concluídas
        document.getElementById("loading").style.opacity = "0";
        setTimeout(function () {
          document.getElementById("loading").style.display = "none";
        }, 500);
      });
  } else {
    const nationalHolidayURL = `https://script.google.com/macros/s/AKfycbxIceWYKXQ33Suxg6Ya-4c9q95ZIn8mwpzi6Kld9x-_Yf9LBaY5QC4Y1R02oNK25J-NHw/exec?type=nacional&year=${anoAtual}`;
    const estadualHolidayURL = `https://script.google.com/macros/s/AKfycbxIceWYKXQ33Suxg6Ya-4c9q95ZIn8mwpzi6Kld9x-_Yf9LBaY5QC4Y1R02oNK25J-NHw/exec?type=estadual&uf=${uf}&year=${anoAtual}`;
    const municipalHolidayURL = `https://script.google.com/macros/s/AKfycbxIceWYKXQ33Suxg6Ya-4c9q95ZIn8mwpzi6Kld9x-_Yf9LBaY5QC4Y1R02oNK25J-NHw/exec?type=municipal&uf=${uf}&year=${anoAtual}`;
    const comemorativeDatesURL = `https://script.google.com/macros/s/AKfycbxIceWYKXQ33Suxg6Ya-4c9q95ZIn8mwpzi6Kld9x-_Yf9LBaY5QC4Y1R02oNK25J-NHw/exec?type=comemorativo&year=${anoAtual}`;
    const now = new Date();
    const dataAtual = new Date();

    document.getElementById("municipios").style.display = "flex";

    // Limpar todos os elementos <p> dentro do elemento com o ID "municipios"
    const municipiosContainer = document.getElementById("municipios");
    const paragrafosMunicipios = municipiosContainer.querySelectorAll("p");
    paragrafosMunicipios.forEach((paragrafo) => {
      municipiosContainer.removeChild(paragrafo);
    });

    // Limpar todos os elementos <p> dentro do elemento com o ID "comemorativos"
    const comemorativosContainer = document.getElementById("comemorativos");
    const paragrafosComemorativos =
      comemorativosContainer.querySelectorAll("p");
    paragrafosComemorativos.forEach((paragrafo) => {
      comemorativosContainer.removeChild(paragrafo);
    });

    // Limpar todos os elementos <p> dentro do elemento com o ID "comemorativos"
    const feriadosContainer = document.getElementById("feriados");
    const paragrafosFeriados = feriadosContainer.querySelectorAll("p");
    paragrafosFeriados.forEach((paragrafo) => {
      feriadosContainer.removeChild(paragrafo);
    });

    // Array para armazenar as promessas das requisições fetch
    const requests = [];

    // Adiciona as promessas ao array
    requests.push(
      fetch(nationalHolidayURL).then((response) => response.json())
    );
    requests.push(
      fetch(estadualHolidayURL).then((response) => response.json())
    );
    requests.push(
      fetch(municipalHolidayURL).then((response) => response.json())
    );
    requests.push(
      fetch(comemorativeDatesURL).then((response) => response.json())
    );
    // Executa todas as promessas e espera que todas sejam resolvidas
    Promise.all(requests)
      .then((responses) => {
        // Aqui você pode acessar os dados de cada resposta
        const [nationalData, estadualData, municipalData, comemorativeData] =
          responses;
        estadualData.forEach((feriado) => {
          feriado.name = `${feriado.name} (Estadual)`;
        });
        const combinedData = nationalData.concat(estadualData);

        // Filtrar feriados futuros
        const feriadosFuturos = combinedData.filter(
          (feriado) => new Date(feriado.date + " 00:00:00") >= now
        );

        // //----------------------------
        // // Verifica se o feriado é de hoje
        // const feriadosHoje = combinedData.filter(
        //   (feriado) =>
        //     new Date(feriado.date + " 00:00:00").toDateString() ===
        //     now.toDateString()
        // );

        // // Verifica se há feriados hoje e adiciona à lista de futuros se houver
        // if (feriadosHoje.length > 0) {
        //   feriadosFuturos.push(...feriadosHoje);
        //   document.getElementById("tsparticles").style.display = "block";
        //   document.getElementById("countdown").style.display = "none";
        // }
        // //----------------------------

        // Ordenar feriados futuros por data
        feriadosFuturos.sort(
          (a, b) => new Date(a.date + " 00:00:00") - new Date(b.date)
        );
        // O próximo feriado será o primeiro da lista de feriados futuros
        proximoFeriado = new Date(feriadosFuturos[0].date + " 00:00:00");

        document.getElementById("holiday").innerHTML =
          "Próximo feriado: " +
          feriadosFuturos[0].name +
          " (" +
          formatarData(feriadosFuturos[0].date) +
          ")";

        // Obter o dia da semana do próximo feriado usando a função converterData
        const diaDaSemana = converterData(feriadosFuturos[0].date).diaDaSemana;

        document.getElementById("dia").innerHTML =
          "O feriado vai cair " + diaDaSemana;

        // AQUI TEM QUE JUNTAR OS DOIS RETORNOS (NACIOANAL E ESTADUAL)

        // Atualizar a contagem regressiva quando a data do próximo feriado for definida
        atualizarContagemRegressiva();

        // Seleciona o elemento onde você deseja adicionar as datas comemorativas
        const comemorativosContainer = document.getElementById("comemorativos");

        // Filtra as datas comemorativas do mês atual
        const datasComemorativasMesAtual = comemorativeData.filter(
          (feriado) => {
            const data = new Date(feriado.date + " 00:00:00");
            return data.getMonth() === dataAtual.getMonth();
          }
        );

        // Itera sobre as datas comemorativas do mês atual e adiciona cada uma ao HTML
        datasComemorativasMesAtual.forEach((feriado) => {
          // Cria um elemento <p> para exibir a data comemorativa
          const paragrafo = document.createElement("p");
          // Define o texto do parágrafo como a data comemorativa
          const dataFormatada = formatarData(feriado.date);
          paragrafo.textContent = `${dataFormatada}: ${feriado.name}`;

          // Adiciona uma classe CSS ao parágrafo de acordo com a data da comemoração
          const dataFeriado = new Date(feriado.date + " 00:00:00");
          if (dataFeriado.getDate() < dataAtual.getDate()) {
            // Se a data do feriado for anterior à data atual, adicione a classe 'passado'
            paragrafo.classList.add("passado");
          } else if (
            dataFeriado.getDate() === dataAtual.getDate() &&
            dataFeriado.getMonth() === dataAtual.getMonth()
          ) {
            // Se a data do feriado for igual à data atual, adicione a classe 'hoje'
            paragrafo.classList.add("hoje");
            paragrafo.textContent = `${dataFormatada}: ${feriado.name} (HOJE)`;
          } else {
            // Caso contrário, adicione a classe 'futuro'
            paragrafo.classList.add("futuro");
          }

          // Adiciona o parágrafo ao container de datas comemorativas
          comemorativosContainer.appendChild(paragrafo);
        });

        const hoje = new Date(
          dataAtual.getFullYear(),
          dataAtual.getMonth(),
          dataAtual.getDate()
        );
        // Itera sobre as datas comemorativas do mês atual e adiciona cada uma ao HTML
        feriadosFuturos.forEach((feriado) => {
          // Cria um elemento <p> para exibir a data comemorativa
          const paragrafo = document.createElement("p");
          // Define o texto do parágrafo como a data comemorativa
          const dataFormatada = formatarData(feriado.date);
          paragrafo.textContent = `${dataFormatada}: ${feriado.name}`;
          // Adiciona uma classe CSS ao parágrafo de acordo com a data da comemoração
          const dataFeriado = new Date(feriado.date + " 00:00:00");
          if (dataFeriado > hoje) {
            paragrafo.classList.add("futuro");
          }

          // Adiciona o parágrafo ao container de datas comemorativas
          feriadosContainer.appendChild(paragrafo);
        });

        // Seleciona o elemento onde você deseja adicionar as datas comemorativas
        const municipaisContainer = document.getElementById("municipios");

        // Filtra as datas comemorativas do mês atual
        const feriadosMunicipaisMesAtual = municipalData.filter((feriado) => {
          const data = new Date(feriado.date + " 00:00:00");
          return data.getMonth() === dataAtual.getMonth();
        });

        // Itera sobre as datas comemorativas do mês atual e adiciona cada uma ao HTML
        feriadosMunicipaisMesAtual.forEach((feriado) => {
          // Cria um elemento <p> para exibir a data comemorativa
          const paragrafo = document.createElement("p");
          // Define o texto do parágrafo como a data comemorativa
          const dataFormatada = formatarData(feriado.date);
          paragrafo.textContent = `${dataFormatada}: ${feriado.name}`;

          // Adiciona uma classe CSS ao parágrafo de acordo com a data da comemoração
          const dataFeriado = new Date(feriado.date + " 00:00:00");
          if (dataFeriado.getDate() < dataAtual.getDate()) {
            // Se a data do feriado for anterior à data atual, adicione a classe 'passado'
            paragrafo.classList.add("passado");
          } else if (
            dataFeriado.getDate() === dataAtual.getDate() &&
            dataFeriado.getMonth() === dataAtual.getMonth()
          ) {
            // Se a data do feriado for igual à data atual, adicione a classe 'hoje'
            paragrafo.classList.add("hoje");
            paragrafo.textContent = `${dataFormatada}: ${feriado.name} (HOJE)`;
          } else {
            // Caso contrário, adicione a classe 'futuro'
            paragrafo.classList.add("futuro");
          }

          // Adiciona o parágrafo ao container de datas comemorativas
          municipaisContainer.appendChild(paragrafo);
        });
      })
      .finally(() => {
        // Oculta o loading após ambas as requisições fetch serem concluídas
        document.getElementById("loading").style.opacity = "0";
        setTimeout(function () {
          document.getElementById("loading").style.display = "none";
        }, 500);
      });
  }
}

// Função para converter a data e pegar o dia da semana do feriado
function converterData(data) {
  // Dividir a string da data em ano, mês e dia
  var partesData = data.split("-");
  var ano = parseInt(partesData[0]);
  var mes = parseInt(partesData[1]);
  var dia = parseInt(partesData[2]);

  // Criar um novo objeto de data
  var novaData = new Date(ano, mes - 1, dia);

  // Array com os nomes dos dias da semana
  var diasDaSemana = [
    "no: Domingo 😭",
    "na: Segunda-feira 😁",
    "na: Terça-feira 😐",
    "na: Quarta-feira 😐",
    "na: Quinta-feira 😁",
    "na: Sexta-feira 😁",
    "no: Sábado 😭",
  ];

  // Obter o dia da semana
  var diaDaSemana = novaData.getDay();

  // Formatar a nova data para mes-dia-ano
  var dataFormatada = `${mes}-${dia}-${ano}`;

  // Retornar a data formatada e o dia da semana
  return { dataFormatada, diaDaSemana: diasDaSemana[diaDaSemana] };
}

function formatarData(data) {
  const partesData = data.split("-"); // Divide a data em partes [ano, mês, dia]
  const dataFormatada = `${partesData[2]}/${partesData[1]}/${partesData[0]}`; // Formatação: dd/mm/aaaa
  return dataFormatada;
}
