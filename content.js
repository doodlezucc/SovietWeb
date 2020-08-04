const translations = [
	[" my", "our"],
	//[" me ", "us"],
	[" mine ", "ours"],
	[" mine", "our"],
	//[" i'm ", "we're"],
	//[" i'", "we'"],
	//[" i ", "we"],
	[" your", "our"],

	[" meinen ", "unseren"],
	[" meine ", "unsere"],
	[" mein ", "unser"],
	[" deinen ", "unseren"],
	[" deine ", "unsere"],
	[" dein ", "unser"],
];

const phaseOne = [
	"my",
	"me",
	"mine",

	"mein",
	"dein"
];

const timers = {
	minimizeArray: 0,
	walkText: 0
};

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
//console.log(all);

function communize() {
	const start = new Date();

	$(document).find("*").each(function() {
		if (!(this instanceof HTMLScriptElement)) {
			const isTitle = this instanceof HTMLTitleElement;
			const texts = $(this).textNodes();
			texts.each(function() {
				const trim = this.data.trim();
				if (needsFix(trim)) {
					$(this).replaceWith(fix(trim, !isTitle));
				}
			});
		}
	});

	console.log("Communized in " + (new Date() - start) + "ms");
	//console.log(timers);
}

function needsFix(s) {
	s = " " + s.toLowerCase() + " ";
	for (let word of phaseOne) {
		if (s.includes(" " + word)) {
			return true;
		}
	};
	return false;
}

/**
 * 
 * @param {String} s 
 */
function fix(s, strikethrough) {
	let start = new Date();

	const used = [];
	for (let c of all) {
		if (s.includes(c[0])) {
			used.push(c);
		}
	}

	timers.minimizeArray += new Date() - start;
	start = new Date();

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

			if (strikethrough) {
				// replacement = pre + "<del>" + next.c[0] + "</del> <strong>" +
				// 	replacement.trim() + "</strong>" + suf;
				replacement = pre + '<strong title="' + next.c[0] + '"><i>' +
					replacement.trim() + "</i></strong>" + suf;
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
			timers.walkText += new Date() - start;
			return s;
		}
	}
}

//Add a jQuery extension so it can be used on any jQuery object
jQuery.fn.textNodes = function() {
	return this.contents().filter(function() {
		return (this.nodeType === Node.TEXT_NODE && this.nodeValue.trim() !== "");
	});
}

$(document).ready(function() {
	communize();
});

// Select the node that will be observed for mutations
const targetNode = document.body;

// Options for the observer (which mutations to observe)
const config = { attributes: true, childList: true, subtree: true };

// Callback function to execute when mutations are observed
const callback = function(mutationsList, observer) {
	// Use traditional 'for loops' for IE 11
	console.log("hmmm");
	for (let mutation of mutationsList) {
		if (mutation.type === 'childList') {
			console.log('A child node has been added or removed.');
		}
		else if (mutation.type === 'attributes') {
			console.log('The ' + mutation.attributeName + ' attribute was modified.');
		}
	}
};

// Create an observer instance linked to the callback function
const observer = new MutationObserver(callback);

// Start observing the target node for configured mutations
observer.observe(targetNode, config);

// Later, you can stop observing
observer.disconnect();