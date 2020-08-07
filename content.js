const translations = [
	[" my", "our"],
	//[" me ", "us"],
	[" mine ", "ours"],
	[" mine", "our"],
	//[" i'm ", "we're"],
	//[" i'", "we'"],
	//[" i ", "we"],
	[" your", "our"],

	[" mein", "unser"],
	[" dein", "unser"],
];

/**
 * Keywords that roughly validate if a text node needs fixing
 */
const phaseOne = [
	"my",
	"mine",
	"your",

	"mein",
	"dein"
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
		}
	}

	push(s => s);
	push(s => s[0].toUpperCase() + s.substr(1));
	if (k.length > 1) {
		push(s => s.toUpperCase());
	}
});

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

			let capitalize = i <= 1;
			if (next.c[0][0].toLowerCase() === "i" && !capitalize) {
				if (pre.length > 0) {
					capitalizers.forEach(b => {
						if (pre === b) capitalize = true;
					});
				}
				if (!capitalize) {
					endOfSentence.forEach(b => {
						if (s[i - 1] === b) capitalize = true;
					});
				}
				if (!capitalize) replacement = replacement.toLowerCase();
			}

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

			let end = s.length;
			endOfSentence.forEach(ending => {
				let e = s.indexOf(ending, i);
				if (e >= i && e < end) end = e;
			});
			let part = s.slice(i, end);
			part = (" " + part).replace(">", "").replace(" am", " are").replace(" was", " were");
			part = part.substr(1);

			s = s.substr(0, i) + part + s.substr(end);
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

// Whenever a child is added, try to fix its text content
const observer = new MutationObserver(function(mutationsList, observer) {
	if (killSwitch) return;

	mutationCounter++;
	if (mutationCounter >= 50) {
		kill();
	}

	for (let mutation of mutationsList) {
		for (let node of mutation.addedNodes) {
			// In case 'node' is a text node, fix it, otherwise, fix its descendants
			if (node.nodeType === Node.TEXT_NODE) {
				fixIfNeeded(node);
			} else if (mayFix(node)) {
				$(node).find("*").textNodes().each(function() {
					fixIfNeeded(this);
				});
			}
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
	log("Disabled communism due to recursion");
	killSwitch = true;
	setTimeout(() => {
		killSwitch = false;
		log("Restarted communism");
	}, 1000);
}

// Fix the entire document as soon as possible
$(document).ready(function() {
	fixDocument();
	observer.observe(document.body, { childList: true, subtree: true });

	setInterval(() => {
		mutationCounter = 0;
	}, 200);
});