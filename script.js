//Possibilidades
const start_btn = document.querySelector(".start_btn button");
const info_box = document.querySelector(".info_box");
const quit_btn = document.querySelector(".buttons-info .quit");
const continue_btn = document.querySelector(".buttons-info .restart");
const quiz_box = document.querySelector(".quiz_box");
const questionProgressElement = document.getElementById("currentQuestionIndex"); // Para mostrar "Pergunta X"
const questionElement = document.getElementById("question"); // puxando a question que está no html
const answerButtons = document.getElementById("answer-buttons"); // puxando a answer que está no html
const nextButton = document.getElementById("next-btn"); // puxando o next que está no html
const aproved = document.getElementById("aproved");
const loading = document.querySelector(".loading");
let questions = {}; //
let currentQuestionIndex = 0;
let score = 0;

let Level = "Básico";
let Discipline = "Matemática";

const prompt = `Gere 10 perguntas e 4 alternativas, sendo uma delas verdadeira e as demais falsas de nível ${Level} da disciplina de ${Discipline}.
Mantendo o seguinte formato JSON, sem adicionar nenhum outro texto, explicação ou comentário na resposta.
{
"questions": [
{
"question": "Pergunta",
"answers": [
{ "Text": "alternativa 1", "correct": "boolean" },
{ "Text": "alternativa 1", "correct": "boolean" },
{ "Text": "alternativa 1", "correct": "boolean" },
{ "Text": "alternativa 1", "correct": "boolean" }
]
} ]
}
`;

//Possibilidade START QUIZ
start_btn.onclick = () => {
  start_btn.style.display = "none";
  info_box.classList.add("activeInfo"); //exibe a tela INFO
};

//Possibilidade QUIT QUIZ
quit_btn.onclick = () => {
  info_box.classList.remove("activeInfo"); //oculta a tela INFO
  start_btn.style.display = "block";
};

//Possibilidade CONTINUE QUIZ
continue_btn.onclick = async () => {
  start_btn.style.display = "none";
  info_box.style.display = "none";
  loading.style.display = "flex";
  await getQuestions(prompt); //pedindo pra função (linha 60)
  info_box.classList.remove("activeInfo"); //oculta a tela INFO
  quiz_box.classList.add("activeQuiz"); //exibe o QUIZ
  startQuiz();
};

async function getQuestions(prompt) {
  const URL = "http://localhost:3000/TalkingWithGemini"; //url da API
  var QuestionsData = {
    prompt: prompt,
  };

  await fetch(URL, {
    //requisição da url(API)
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(QuestionsData), //converte a variável questionsdata para JSON (stringify)
  })
    .then((response) => response.json()) //reforçando que será convertida
    .then((dados) => {
      questions = dados.questions;
    }) //permite fazer requisições para o back-end
    .finally(() => {
      loading.style.display = "none";
    });
}

function startQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  nextButton.innerHTML = "Next";
  showQuestion();
}

function showQuestion() {
  resetState();
  let currentQuestion = questions[currentQuestionIndex];
  questionElement.innerHTML = currentQuestion.question;
  //currentQuestion.answers = currentQuestion.answers.sort(() => Math.random() - 0.5)
  //0.5 ajuda a manter uma ordem aleatória. Se caso a aleatoridade estiver ruim. Usar essa forma de aleatorizar
  //criando uma nova variavel em let na 82
  currentQuestion.answers.forEach((answer) => {
    //para cada alternativa
    const button = document.createElement("button"); //botao de cada alternativa para as respostas
    button.innerHTML = answer.Text;
    button.classList.add("btn");
    answerButtons.appendChild(button);
    button.addEventListener("click", selectAnswer);
  });
  questionProgressElement.innerHTML = `<p>${
    currentQuestionIndex + 1
  }</p> de <p>${questions.length}</p> Questões`; //contador de questões
}

function resetState() {
  nextButton.style.display = "none";
  while (answerButtons.firstChild) {
    answerButtons.removeChild(answerButtons.firstChild);
  }
}

function selectAnswer(e) {
  //o E é o parametro da função e não precisa ser necessáriamente esse
  const selectedBtn = e.target;
  const alternativa_correta = questions[currentQuestionIndex].answers.filter(
    (answer) => answer.correct
  ); //filtrando apenas a alternativa correta da pergunta atual
  if (e.target.innerHTML === alternativa_correta[0].Text) {
    //por filtrar somente a alternativa correta ela pega com a posição 0
    selectedBtn.classList.add("correct");
    score++;
  } else {
    selectedBtn.classList.add("incorrect");
  }
  Array.from(answerButtons.children).forEach((button) => {
    if (button.dataset.correct === "true") {
      button.classList.add("correct");
    }
    button.disabled = true;
  });
  nextButton.style.display = "block";
}

function showScore() {
  resetState();
  questionElement.innerHTML = `Sua pontuação foi ${score} de ${questions.length}!`;
  questionElement.style.textAlign = "center";
  if (score >= 8) {
    aproved.innerHTML += `Parabéns! Você passou para o próximo nível.`;
    document.getElementById("aproved").style.color = "#4ab850";
    nextButton.innerHTML = "Próximo Nível";
  } else {
    aproved.innerHTML += `Você não atingiu o resultado desejado.`;
    document.getElementById("aproved").style.color = "#f75858";
    nextButton.innerHTML = "Tente Novamente";
  }
  nextButton.style.display = "block";
  questionProgressElement.innerText = "";
}

function handleNextButton() {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    showScore();
  }
}

nextButton.addEventListener("click", () => {
  if (currentQuestionIndex < questions.length) {
    handleNextButton();
  } else {
    // startQuiz();
    aproved.innerHTML = ``;
    quiz_box.classList.remove("activeQuiz");
    info_box.classList.add("activeInfo");
    info_box.style.display = "block";
    
  }
});

startQuiz();
