// Defina a data do próximo feriado nacional como uma variável global inicialmente
let proximoFeriado;

let paginaRecarregada = false;
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
  const anoAtual = new Date().getFullYear();

  //v1 const holidayURL = `https://brasilapi.com.br/api/feriados/v1/${anoAtual}`;
  // v1.1 const holidayURL = `https://script.google.com/macros/s/AKfycbwRFtJM6SeDtM1YSScLixpg1MCEg26wiyXg9FtS9gbdoYXK7SEenUgjZSo_JsSzf3QWpQ/exec?year=${anoAtual}`;
  const holidayURL = `https://script.google.com/macros/s/AKfycbyGpVV1056-BEZS-6Wz4gCqVXlok0nQpShG9dTbjzozXfMCGbOGRiXlKm1bqfjWJpCO_A/exec?type=nacional&${anoAtual}`;

  fetch(holidayURL)
    .then((response) => response.json())
    .then((data) => {
      const now = new Date();

      // Filtrar feriados futuros
      const feriadosFuturos = data.filter(
        (feriado) => new Date(feriado.date + " 00:00:00") > now
      );

      // Ordenar feriados futuros por data
      feriadosFuturos.sort(
        (a, b) => new Date(a.date + " 00:00:00") - new Date(b.date)
      );
      // O próximo feriado será o primeiro da lista de feriados futuros
      proximoFeriado = new Date(feriadosFuturos[0].date + " 00:00:00");

      document.getElementById("holiday").innerHTML =
        "Próximo feriado: " + feriadosFuturos[0].name;

      // Obter o dia da semana do próximo feriado usando a função converterData
      const diaDaSemana = converterData(feriadosFuturos[0].date).diaDaSemana;

      document.getElementById("dia").innerHTML =
        "O feriado vai cair " + diaDaSemana;

      // Atualizar a contagem regressiva quando a data do próximo feriado for definida
      atualizarContagemRegressiva();
    })
    .catch((error) => console.error("Erro ao obter feriados:", error));
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
