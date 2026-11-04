"use strict";

const estado = document.getElementById("estado");
const botones = document.querySelectorAll("button");

let audioContext = null;

// SONIDO DE BOTONES

function reproducirSonido() {
	const AudioContexto =
		window.AudioContext || window.webkitAudioContext;

	if (!AudioContexto) return;

	if (!audioContext) {
		audioContext = new AudioContexto();
	}

	if (audioContext.state === "suspended") {
		audioContext.resume();
	}

	const sonido = audioContext.createOscillator();
	const volumen = audioContext.createGain();

	sonido.type = "sine";
	sonido.frequency.value = 450;

	volumen.gain.setValueAtTime(
		0.06,
		audioContext.currentTime
	);

	volumen.gain.exponentialRampToValueAtTime(
		0.001,
		audioContext.currentTime + 0.08
	);

	sonido.connect(volumen);
	volumen.connect(audioContext.destination);

	sonido.start();
	sonido.stop(audioContext.currentTime + 0.08);
}

// BOTONES TÁCTILES

botones.forEach((boton) => {
	boton.addEventListener("pointerdown", (evento) => {
		evento.preventDefault();

		boton.classList.add("pulsado");

		estado.textContent =
			"Botón presionado: " + boton.dataset.control;

		reproducirSonido();

		if (navigator.vibrate) {
			navigator.vibrate(25);
		}
	});

	const soltar = () => {
		boton.classList.remove("pulsado");
	};

	boton.addEventListener("pointerup", soltar);
	boton.addEventListener("pointercancel", soltar);
	boton.addEventListener("pointerleave", soltar);
});

// JOYSTICKS ANALÓGICOS

function configurarJoystick(id, nombre) {
	const base = document.getElementById(id);
	const palanca = base.querySelector(".palanca");

	let punteroActivo = null;

	function mover(evento) {
		const rect = base.getBoundingClientRect();

		const centroX = rect.left + rect.width / 2;
		const centroY = rect.top + rect.height / 2;

		const limite = rect.width * 0.19;

		let x = evento.clientX - centroX;
		let y = evento.clientY - centroY;

		const distancia = Math.hypot(x, y);

		if (distancia > limite) {
			x = (x / distancia) * limite;
			y = (y / distancia) * limite;
		}

		palanca.style.transform =
			`translate(${x}px, ${y}px)`;

		const horizontal = Math.round((x / limite) * 100);
		const vertical = Math.round((y / limite) * 100);

		estado.textContent =
			`${nombre}: X ${horizontal}% / Y ${vertical}%`;
	}

	base.addEventListener("pointerdown", (evento) => {
		if (punteroActivo !== null) return;

		evento.preventDefault();
		punteroActivo = evento.pointerId;

		base.setPointerCapture(evento.pointerId);
		mover(evento);
	});

	base.addEventListener("pointermove", (evento) => {
		if (evento.pointerId !== punteroActivo) return;

		evento.preventDefault();
		mover(evento);
	});

	function soltar(evento) {
		if (evento.pointerId !== punteroActivo) return;

		punteroActivo = null;
		palanca.style.transform = "translate(0, 0)";
		estado.textContent = `${nombre}: centrado`;
	}

	base.addEventListener("pointerup", soltar);
	base.addEventListener("pointercancel", soltar);
}

configurarJoystick(
	"joystick-izquierdo",
	"Joystick izquierdo"
);

configurarJoystick(
	"joystick-derecho",
	"Joystick derecho"
);
