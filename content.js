const blacklist = [
	"www.youtube.com",
	"music.youtube.com",
	"tabs.ultimate-guitar.com",
	"docs.google.com",
];

const translations = [
	//English
	[" my", "our"],
	[" mine ", "ours"],
	[" mine", "our"],
	[" your", "our"],

	[" dude", "comrade"],
	["friend", "comrade"],
	[" buddy", "comrade"],
	[" homie", "comrade"],
	[" significant other", "comrade"],
	[" brother", "comrade"],
	[" bro ", "comrade"],
	[" sister", "comrade"],
	[" sis", "comrade"],
	[" stranger", "comrade"],
	[" pal ", "comrade"],
	["pal ", "comrade"],

	//Spanish
	[" mi" , "nuestro"],
	[" mio", "nuestro"],
	[" mia", "nuestra"],
	[" mios", "nuestros"],
	[" mias", "nuestras"],
	[" mí" , "nuestro"],
	[" mío", "nuestro"],
	[" mía", "nuestra"],
	[" míos", "nuestros"],
	[" mías", "nuestras"],

	[" tu ", "nuestro"],
	[" tú ", "nuestro"],
	[" tuyo", "nuestro"],
	[" tuya", "nuestra"],
	[" tuyos", "nuestros"],
	[" tuyas", "nuestras"],

	[" su ", "nuestro"],
	[" sú ", "nuestro"],
	[" suyo", "nuestro"],
	[" suya", "nuestra"],
	[" suyos", "nuestros"],
	[" suyas", "nuestras"],

	[" tío", "camarada"],
	[" amigo", "camarada"],
	[" colega", "camarada"],
	[" compañero", "camarada"],
	[" pareja", "camarada"],
	[" hermano", "camarada"],
	[" hermana", "camarada"],
	[" desconocido", "camarada"],
	[" compadre", "camarada"],
	[" pana", "camarada"],
	[" asociado", "camarada"],
	[" camarada", "camarada"],


	/*
	//German
	[" meine", "unsere"],
	[" mein ", "unser"],
	[" deine", "unsere"],
	[" dein ", "unser"],

	 	["freunden", "genossen"],
		["freunde", "genossen"],
		["freundin", "genossin"],
		["freund ", "genosse"],
		["freund", "genossen"],
		[" kameradin", "genossin"],
		["kamerad ", "genosse"],
		[" kamerad", "genossen"], 
	*/
];

/**
 * Keywords that roughly validate if a text node needs fixing
 * (just using the translation keys without spaces)
 */
const phaseOne = [
	...new Set(translations.map(tr => tr[0].trim()))
];

const disabledTags = [
	"STYLE",
	"SCRIPT",
	"NOSCRIPT",
	"META",
	"STALIN"
];

const capitalizers = [
	"'",
	'"'
];
const beginnings = [
	" ",
	"(",
	"[",
	"-"
].concat(capitalizers);

const endOfSentence = [
	".",
	"?",
	"!",
	":"
];
const endings = [
	" ",
	",",
	")",
	"]",
	"-"
].concat(capitalizers, endOfSentence);

/**
 * Every possible combination of prefixes/suffixes for every "translation"
 */
let all = [];
translations.forEach((c) => {
	let k = c[0];

	const hasPre = k[0] === " ";
	const hasSuf = k[k.length - 1] === " ";

	k = k.trim();
	let v = c[1];

	function push(operator) {
		if (hasPre) {
			if (hasSuf) {
				for (let prefix of beginnings) {
					for (let suffix of endings) {
						all.push([operator(k), operator(v), prefix, suffix]);
					}
				}
			} else {
				for (let prefix of beginnings) {
					all.push([operator(k), operator(v), prefix, ""]);
				}
			}
		} else if (hasSuf) {
			for (let suffix of endings) {
				all.push([operator(k), operator(v), "", suffix]);
			}
		} else {
			all.push([operator(k), operator(v), "", ""]);
		}
	}

	push(s => s);
	push(s => s[0].toUpperCase() + s.substr(1));
	if (k.length > 1) {
		push(s => s.toUpperCase());
	}
});
//console.log(all);

function fixIfNeeded(element, isTitle) {
	if (killSwitch) return;

	const trim = element.data.trim();
	if (needsFix(trim)) {
		$(element).replaceWith(fix(trim, !isTitle));
	}
}

function needsFix(s) {
	if (s.length) {
		s = s.toLowerCase();
		for (let word of phaseOne) {
			if (s.includes(word)) {
				return true;
			}
		};
	}
	return false;
}

/**
 * Removes all sense of property from a string.
 * @param {String} s String to fix.
 * @param {boolean} boldText Enable extra formatting (bold and italics).
 */
function fix(s, boldText) {
	const used = [];
	for (let c of all) {
		if (s.includes(c[0])) {
			used.push(c);
		}
	}

	s = " " + s + " ";
	let i = 0;

	while (true) {
		let next = {
			index: Infinity,
			c: null
		};

		for (let c of used) {
			const cIndex = s.indexOf(c[2] + c[0] + c[3], i);
			if (cIndex >= 0 && cIndex < next.index) {
				next = { index: cIndex, c: c };
			}
		}
		if (next.c) {
			i = next.index;
			const pre = next.c[2];
			const suf = next.c[3];
			let replacement = next.c[1];

			if (boldText) {
				// replacement = pre + "<del>" + next.c[0] + "</del> <strong>" +
				// 	replacement.trim() + "</strong>" + suf;
				replacement = pre + '<stalin style="font-weight: bold;font-style: italic" title="' + next.c[0] + '">' +
					replacement.trim() + "</stalin>" + suf;
			} else {
				replacement = pre + replacement + suf;
			}
			s = s.substr(0, i) + replacement + s.substr(i + pre.length + next.c[0].length + suf.length);
			i += replacement.length;
		} else {
			return s;
		}
	}
}

/**
 * Checks if element is of a type that mustn't be fixed.
 * @param {HTMLElement} element 
 */
function mayFix(element) {
	return !disabledTags.some(tag => element.tagName === tag);
}

function fixDocument() {
	const start = new Date();

	$(document).find("*").each(function() {
		if (mayFix(this)) {
			const isTitle = this instanceof HTMLTitleElement;
			const texts = $(this).textNodes();
			texts.each(function() {
				fixIfNeeded(this, isTitle);
			});
		}
	});

	log("Communized in " + (new Date() - start) + "ms");
}

/**
 * In case 'node' is a text node, fix it, otherwise, fix its descendants
 * @param {Node} node 
 */
function fixNode(node) {
	if (node.nodeType === Node.TEXT_NODE) {
		fixIfNeeded(node);
	} else if (mayFix(node)) {
		$(node).find("*").textNodes().each(function() {
			fixIfNeeded(this);
		});
	}
}

let forgottenNodes = [];

// Whenever a child is added, try to fix its text content
const observer = new MutationObserver(function(mutationsList) {
	if (!killSwitch) {
		mutationCounter++;
		if (mutationCounter >= 50) {
			kill();
		}
	}

	for (let mutation of mutationsList) {
		if (!killSwitch) {
			for (let node of mutation.addedNodes) {
				fixNode(node);
			}
		} else {
			forgottenNodes.push(mutation.addedNodes);
		}
	}
});

// Add a jQuery extension so it can be used on any jQuery object
jQuery.fn.textNodes = function() {
	return this.contents().filter(function() {
		return (this.nodeType === Node.TEXT_NODE);
	});
}

function log(s) {
	console.log("☭ - " + s);
}

let mutationCounter = 0;
let killSwitch = false;
/**
 * Forces the app to stop modifying nodes for a short time.
 */
function kill() {
	log("Disabled communism due to overflow");
	killSwitch = true;
	setTimeout(() => {
		killSwitch = false;
		log("Restarted communism");
		forgottenNodes.forEach((node) => fixNode(node));
		forgottenNodes = [];
	}, 1000);
}

let initialJobs = 2;

function maybeInit() {
	if (--initialJobs == 0) {
		chrome.runtime.sendMessage({ action: "enable" });
		fixDocument();
		observer.observe(document.body, { childList: true, subtree: true });

		setInterval(() => {
			mutationCounter = 0;
		}, 200);
	}
}

chrome.storage.local.get(["profile"], function(result) {
	let profile = {
		disabledPages: blacklist,
	};
	if (!$.isEmptyObject(result)) {
		profile = result["profile"];
	}
	const domain = getDomain(document.location.href);
	if (!profile.disabledPages.some(s => s === domain)) {
		maybeInit();
	}
});

// Fix the entire document as soon as possible
$(document).ready(function() {
	maybeInit();
});

chrome.runtime.onMessage.addListener(function(request, sender) {
	if (!sender.tab) {
		if (request.action === "apply_changes") {
			maybeInit();
		}
	}
});

/**
 * @param {String} url 
 */
function getDomain(url) {
	url = url.substr(url.indexOf("//") + 2);
	url = url.substr(0, url.indexOf("/"));
	return url;
}