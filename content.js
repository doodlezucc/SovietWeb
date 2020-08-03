const translations = [
	[" my", "our"],
	[" me ", "us"],
	[" mine ", "ours"],
	[" mine", "our"],
	[" i'm ", "we're"],
	[" i'", "we'"],
	[" i ", "we"],
];

const phaseOne = [
	"my",
	"i",
	"me",
	"mine"
]

const beginnings = [
	" ",
	"'",
	'"'
]

const endings = [
	" ",
	",",
	".",
	"!",
	"?",
	"'",
	'"'
];

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
						all.push([prefix + operator(k) + suffix, prefix + operator(v) + suffix, prefix, suffix]);
					}
				}
			} else {
				for (let prefix of beginnings) {
					all.push([prefix + operator(k), prefix + operator(v), prefix, ""]);
				}
			}
		} else if (hasSuf) {
			for (let suffix of endings) {
				all.push([operator(k) + suffix, operator(v) + suffix, "", suffix]);
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
				if (needsFix(this.data)) {
					$(this).replaceWith(fix(this.data, !isTitle));
				}
			});
		}
	});

	console.log("Communized in " + (new Date() - start) + "ms");
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
	s = " " + s + " ";

	let i = 0;

	while (true) {
		let next = {
			index: Infinity,
			c: null
		};

		for (let c of all) {
			const cIndex = s.indexOf(c[0], i);
			if (cIndex >= 0 && cIndex < next.index) {
				next = { index: cIndex, c: c };
			}
		}
		if (next.c) {
			i = next.index;
			let replacement = next.c[1];
			if (i > 1) {
				replacement = replacement.toLowerCase();
			}
			if (strikethrough) {
				const pre = next.c[2];
				const suf = next.c[3];

				replacement = pre + "<del>" + next.c[0].trim() + "</del>" + suf +
					" " + pre + "<strong>" + replacement.trim() + "</strong>" + suf;
			}
			s = s.substr(0, i) + replacement + s.substr(i + next.c[0].length);
			i += replacement.length;
		} else {
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
	setTimeout(() => {
		communize();
	}, 1000);
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